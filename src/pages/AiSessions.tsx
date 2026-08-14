import { useMemo, useState } from "react";
import {
  Title,
  Stack,
  Group,
  Table,
  Badge,
  Text,
  Tooltip,
  ActionIcon,
  Modal,
  Code,
  Menu,
  Button,
  ScrollArea,
  Anchor,
  Select,
} from "@mantine/core";
import { IconDots, IconPlayerStop, IconRefresh, IconEye, IconRobot, IconPlus } from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import { AGENT_SESSION_STATUS_COLORS, formatDuration, formatRelativeTime } from "../lib/badges";
import { countUnapprovedSpecs, SpecApprovalGateModal } from "../components/SpecApprovalGate";

const AGENT_OPTIONS = ["claude", "codex"];

export default function AiSessions() {
  const [logSessionId, setLogSessionId] = useState<string | null>(null);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [newProjectId, setNewProjectId] = useState<string | null>(null);
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const [newAgent, setNewAgent] = useState<string | null>("claude");

  const utils = trpc.useUtils();
  const { data: sessions, isLoading, isError, error } = trpc.agentSessions.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: tasks } = trpc.tasks.list.useQuery();
  const { data: newTaskDetail } = trpc.tasks.get.useQuery({ id: newTaskId ?? "" }, { enabled: !!newTaskId });

  const stopMutation = trpc.agentSessions.stop.useMutation({ onSuccess: () => utils.agentSessions.list.invalidate() });
  const reopenMutation = trpc.agentSessions.reopen.useMutation({ onSuccess: () => utils.agentSessions.list.invalidate() });
  const startMutation = trpc.agentSessions.start.useMutation({
    onSuccess: () => {
      utils.agentSessions.list.invalidate();
      setGateOpen(false);
      setNewSessionOpen(false);
      setNewProjectId(null);
      setNewTaskId(null);
      setNewAgent("claude");
    },
  });

  const projectMap = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p.name])), [projects]);
  const taskMap = useMemo(() => new Map((tasks ?? []).map((t) => [t.id, t.title])), [tasks]);

  const unapprovedCount = countUnapprovedSpecs(newTaskDetail?.linkedSpecs);

  function doStartNewSession() {
    if (!newProjectId || !newAgent) return;
    startMutation.mutate({ projectId: newProjectId, taskId: newTaskId ?? undefined, agent: newAgent });
  }

  function handleStartClick() {
    if (!newProjectId || !newAgent) return;
    if (newTaskId && unapprovedCount > 0) {
      setGateOpen(true);
      return;
    }
    doStartNewSession();
  }

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (isError) return <ErrorState message={error.message} />;

  const rows = sessions ?? [];
  const logSession = rows.find((s) => s.id === logSessionId);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>AI Sessions</Title>
        <Button leftSection={<IconPlus size={14} />} onClick={() => setNewSessionOpen(true)}>
          New session
        </Button>
      </Group>

      {rows.length === 0 ? (
        <EmptyState text="No agent sessions yet." />
      ) : (
        <Table.ScrollContainer minWidth={1100}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Project</Table.Th>
                <Table.Th>Task</Table.Th>
                <Table.Th>Agent</Table.Th>
                <Table.Th>Branch</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Started</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Last output</Table.Th>
                <Table.Th>PR</Table.Th>
                <Table.Th>Cost</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((s) => (
                <Table.Tr key={s.id}>
                  <Table.Td>{projectMap.get(s.projectId) ?? ""}</Table.Td>
                  <Table.Td>{s.taskId ? taskMap.get(s.taskId) ?? "—" : "—"}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <IconRobot size={14} />
                      <Text size="sm">{s.agent}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Code>{s.workingBranch || "—"}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={AGENT_SESSION_STATUS_COLORS[s.status]}>{s.status}</Badge>
                  </Table.Td>
                  <Table.Td>{formatRelativeTime(s.startedAt)}</Table.Td>
                  <Table.Td>{formatDuration(s.durationSeconds)}</Table.Td>
                  <Table.Td>
                    <Tooltip label={s.lastOutput} multiline w={300}>
                      <Text size="sm" truncate maw={200}>
                        {s.lastOutput}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    {s.prUrl ? (
                      <Anchor href={s.prUrl} target="_blank" size="sm">
                        PR
                      </Anchor>
                    ) : (
                      "—"
                    )}
                  </Table.Td>
                  <Table.Td>
                    ${s.costUsd.toFixed(2)}
                    <Text size="xs" c="dimmed">
                      {s.tokenUsage.toLocaleString()} tok
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />} onClick={() => setLogSessionId(s.id)}>
                          View logs
                        </Menu.Item>
                        {(s.status === "running" || s.status === "waiting") && (
                          <Menu.Item leftSection={<IconPlayerStop size={14} />} color="red" onClick={() => stopMutation.mutate({ id: s.id })}>
                            Stop
                          </Menu.Item>
                        )}
                        {(s.status === "failed" || s.status === "completed") && (
                          <Menu.Item leftSection={<IconRefresh size={14} />} onClick={() => reopenMutation.mutate({ id: s.id })}>
                            Reopen
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Modal opened={!!logSessionId} onClose={() => setLogSessionId(null)} title="Session logs" size="lg">
        <ScrollArea h={400}>
          <Code block style={{ whiteSpace: "pre-wrap" }}>
            {logSession?.lastOutput ?? ""}
          </Code>
        </ScrollArea>
      </Modal>

      <Modal
        opened={newSessionOpen}
        onClose={() => setNewSessionOpen(false)}
        title="Start a new AI session"
      >
        <Stack gap="sm">
          <Select
            label="Project"
            placeholder="Choose a project"
            required
            data={(projects ?? []).map((p) => ({ value: p.id, label: p.name }))}
            value={newProjectId}
            onChange={(v) => {
              setNewProjectId(v);
              setNewTaskId(null);
            }}
          />
          <Select
            label="Task (optional)"
            placeholder="Choose a task to link"
            searchable
            clearable
            disabled={!newProjectId}
            data={(tasks ?? [])
              .filter((t) => t.projectId === newProjectId)
              .map((t) => ({ value: t.id, label: t.title }))}
            value={newTaskId}
            onChange={setNewTaskId}
          />
          <Select label="Agent" required data={AGENT_OPTIONS} value={newAgent} onChange={setNewAgent} />
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={() => setNewSessionOpen(false)}>
              Cancel
            </Button>
            <Button loading={startMutation.isLoading} disabled={!newProjectId} onClick={handleStartClick}>
              Start session
            </Button>
          </Group>
        </Stack>
      </Modal>

      <SpecApprovalGateModal
        opened={gateOpen}
        unapprovedCount={unapprovedCount}
        onCancel={() => setGateOpen(false)}
        onConfirm={doStartNewSession}
        confirmLoading={startMutation.isLoading}
      />
    </Stack>
  );
}
