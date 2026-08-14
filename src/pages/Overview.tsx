import { Link } from "react-router-dom";
import { SimpleGrid, Paper, Text, Group, Title, Stack, Badge, Card, Anchor, Timeline } from "@mantine/core";
import {
  IconFolders,
  IconPlayerPlay,
  IconEye,
  IconRobot,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import { formatRelativeTime } from "../lib/badges";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
            {label}
          </Text>
          <Text fw={700} size="28px">
            {value}
          </Text>
        </div>
        <Icon size={28} stroke={1.5} color={`var(--mantine-color-${color}-6)`} />
      </Group>
    </Paper>
  );
}

export default function Overview() {
  const { data, isLoading, isError, error } = trpc.dashboard.overview.useQuery();

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (isError) return <ErrorState message={error.message} />;
  if (!data) return <EmptyState text="No dashboard data available." />;

  return (
    <Stack gap="lg">
      <Title order={2}>Overview</Title>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 6 }} spacing="md">
        <StatCard label="Active Projects" value={data.totalActiveProjects} icon={IconFolders} color="brand" />
        <StatCard label="In Progress" value={data.tasksInProgress} icon={IconPlayerPlay} color="blue" />
        <StatCard label="Waiting Review" value={data.tasksInReview} icon={IconEye} color="grape" />
        <StatCard label="Running Agents" value={data.runningAgents} icon={IconRobot} color="cyan" />
        <StatCard label="Healthy Jobs" value={data.healthyJobs} icon={IconCircleCheck} color="green" />
        <StatCard label="Failed Jobs" value={data.failedJobs} icon={IconAlertTriangle} color="red" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="sm">
            Projects requiring attention
          </Title>
          {data.projectsRequiringAttention.length === 0 ? (
            <EmptyState text="Nothing needs attention right now." />
          ) : (
            <Stack gap="xs">
              {data.projectsRequiringAttention.map(({ project, reasons }) => (
                <Card key={project.id} withBorder padding="sm" radius="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <div>
                      <Anchor component={Link} to={`/projects/${project.id}`} fw={600}>
                        {project.name}
                      </Anchor>
                      <Group gap={6} mt={4}>
                        {reasons.map((r) => (
                          <Badge key={r} color="red" variant="light" size="sm">
                            {r}
                          </Badge>
                        ))}
                      </Group>
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="sm">
            Recent activity
          </Title>
          {data.recentActivities.length === 0 ? (
            <EmptyState text="No activity yet." />
          ) : (
            <Timeline active={data.recentActivities.length} bulletSize={10} lineWidth={2}>
              {data.recentActivities.map((a) => (
                <Timeline.Item key={a.id} title={a.message}>
                  <Text size="xs" c="dimmed">
                    {formatRelativeTime(a.createdAt)}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
