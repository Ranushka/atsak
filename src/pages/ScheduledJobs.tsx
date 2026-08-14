import { useMemo, useState } from "react";
import {
  Title,
  Stack,
  Group,
  Table,
  Badge,
  Text,
  Switch,
  ActionIcon,
  Drawer,
  Card,
  SimpleGrid,
  Alert,
  Code,
  Menu,
  Button,
  ScrollArea,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertTriangle, IconDots, IconPlayerPlay, IconTrash, IconClockHour4 } from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import { JOB_STATUS_COLORS, formatDuration, formatRelativeTime } from "../lib/badges";
import { cronToEnglish } from "../lib/cronToEnglish";

export default function ScheduledJobs() {
  const isMobile = useMediaQuery("(max-width: 62em)");
  const [drawerJobId, setDrawerJobId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: jobs, isLoading, isError, error } = trpc.scheduledJobs.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();

  const toggleMutation = trpc.scheduledJobs.toggleEnabled.useMutation({
    onSuccess: () => utils.scheduledJobs.list.invalidate(),
  });
  const runNowMutation = trpc.scheduledJobs.runNow.useMutation({
    onSuccess: () => {
      utils.scheduledJobs.list.invalidate();
      utils.jobRuns.list.invalidate();
    },
  });
  const deleteMutation = trpc.scheduledJobs.delete.useMutation({
    onSuccess: () => utils.scheduledJobs.list.invalidate(),
  });

  const projectMap = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p.name])), [projects]);

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (isError) return <ErrorState message={error.message} />;

  const rows = jobs ?? [];
  const failedOrOverdue = rows.filter(
    (j) => j.status === "failed" || (j.isEnabled && j.nextRunAt && new Date(j.nextRunAt).getTime() < Date.now())
  );

  return (
    <Stack gap="lg">
      <Title order={2}>Scheduled Jobs</Title>

      {failedOrOverdue.length > 0 && (
        <Alert color="red" icon={<IconAlertTriangle size={18} />} title="Attention needed">
          {failedOrOverdue.length} job(s) are failing or overdue.
        </Alert>
      )}

      {rows.length === 0 ? (
        <EmptyState text="No scheduled jobs yet." />
      ) : isMobile ? (
        <SimpleGrid cols={1} spacing="sm">
          {rows.map((j) => (
            <Card key={j.id} withBorder padding="sm" onClick={() => setDrawerJobId(j.id)} style={{ cursor: "pointer" }}>
              <Group justify="space-between">
                <Text fw={600}>{j.name}</Text>
                <Badge color={JOB_STATUS_COLORS[j.status]}>{j.status}</Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {projectMap.get(j.projectId) ?? ""}
              </Text>
              <Text size="sm" mt={4}>
                {cronToEnglish(j.cronExpression)}
              </Text>
              <Group justify="space-between" mt={6}>
                <Switch
                  checked={j.isEnabled}
                  label="Enabled"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => toggleMutation.mutate({ id: j.id, isEnabled: e.currentTarget.checked })}
                />
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconPlayerPlay size={12} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    runNowMutation.mutate({ id: j.id });
                  }}
                >
                  Run now
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Table.ScrollContainer minWidth={1100}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Project</Table.Th>
                <Table.Th>Schedule</Table.Th>
                <Table.Th>Timezone</Table.Th>
                <Table.Th>Last run</Table.Th>
                <Table.Th>Next run</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Failures</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Enabled</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((j) => (
                <Table.Tr key={j.id} onClick={() => setDrawerJobId(j.id)} style={{ cursor: "pointer" }}>
                  <Table.Td>
                    <Text fw={600} size="sm">
                      {j.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      <Code>{j.command}</Code>
                    </Text>
                  </Table.Td>
                  <Table.Td>{projectMap.get(j.projectId) ?? ""}</Table.Td>
                  <Table.Td>
                    <Text size="sm">{cronToEnglish(j.cronExpression)}</Text>
                    <Text size="xs" c="dimmed">
                      <Code>{j.cronExpression}</Code>
                    </Text>
                  </Table.Td>
                  <Table.Td>{j.timezone}</Table.Td>
                  <Table.Td>{formatRelativeTime(j.lastRunAt)}</Table.Td>
                  <Table.Td>{formatRelativeTime(j.nextRunAt)}</Table.Td>
                  <Table.Td>{formatDuration(j.lastDurationSeconds)}</Table.Td>
                  <Table.Td>{j.failureCount}</Table.Td>
                  <Table.Td>
                    <Badge color={JOB_STATUS_COLORS[j.status]}>{j.status}</Badge>
                  </Table.Td>
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={j.isEnabled}
                      onChange={(e) => toggleMutation.mutate({ id: j.id, isEnabled: e.currentTarget.checked })}
                    />
                  </Table.Td>
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconPlayerPlay size={14} />} onClick={() => runNowMutation.mutate({ id: j.id })}>
                          Run now
                        </Menu.Item>
                        <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => deleteMutation.mutate({ id: j.id })}>
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <JobHistoryDrawer jobId={drawerJobId} onClose={() => setDrawerJobId(null)} jobName={rows.find((r) => r.id === drawerJobId)?.name} />
    </Stack>
  );
}

function JobHistoryDrawer({ jobId, onClose, jobName }: { jobId: string | null; onClose: () => void; jobName?: string }) {
  const { data: runs } = trpc.jobRuns.list.useQuery({ jobId: jobId ?? "" }, { enabled: !!jobId });

  return (
    <Drawer opened={!!jobId} onClose={onClose} title={jobName ?? "Job history"} position="right" size="lg">
      {!runs ? (
        <LoadingSkeleton rows={4} />
      ) : runs.length === 0 ? (
        <EmptyState text="No run history yet." />
      ) : (
        <ScrollArea>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Started</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {runs.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>{formatRelativeTime(r.startedAt)}</Table.Td>
                  <Table.Td>{formatDuration(r.durationSeconds)}</Table.Td>
                  <Table.Td>
                    <Badge color={r.exitStatus === "success" ? "green" : "red"}>{r.exitStatus}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Stack gap="xs" mt="md">
            {runs.map((r) => (
              <Card key={r.id} withBorder padding="xs">
                <Group gap={6}>
                  <IconClockHour4 size={14} />
                  <Text size="xs" c="dimmed">
                    {formatRelativeTime(r.startedAt)}
                  </Text>
                </Group>
                <Code block mt={4} style={{ whiteSpace: "pre-wrap" }}>
                  {r.logs}
                </Code>
              </Card>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Drawer>
  );
}
