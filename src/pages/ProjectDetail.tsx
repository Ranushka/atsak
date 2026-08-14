import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Title,
  Text,
  Stack,
  Group,
  Tabs,
  Paper,
  SimpleGrid,
  Badge,
  Progress,
  RingProgress,
  Anchor,
  Table,
  Center,
  Timeline,
  Card,
  Code,
} from "@mantine/core";
import {
  IconBrandGithub,
  IconFolderCog,
  IconChecklist,
  IconFileText,
  IconRobot,
  IconClockHour4,
  IconRocket,
  IconActivity,
  IconGitBranch,
  IconGitCommit,
} from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  AGENT_SESSION_STATUS_COLORS,
  JOB_STATUS_COLORS,
  DEPLOYMENT_STATUS_COLORS,
  formatRelativeTime,
  formatDuration,
} from "../lib/badges";

const VALID_TABS = ["overview", "tasks", "specs", "sessions", "jobs", "deployments", "activity"] as const;
type ProjectTab = (typeof VALID_TABS)[number];

export default function ProjectDetail() {
  const { id = "", tab } = useParams();
  const navigate = useNavigate();
  const activeTab: ProjectTab = VALID_TABS.includes(tab as ProjectTab) ? (tab as ProjectTab) : "overview";
  const { data: project, isLoading, isError, error } = trpc.projects.get.useQuery({ id });
  const { data: tasks = [] } = trpc.tasks.list.useQuery({ projectId: id });
  const { data: specs = [] } = trpc.specifications.list.useQuery({ projectId: id });
  const { data: sessions = [] } = trpc.agentSessions.list.useQuery({ projectId: id });
  const { data: jobs = [] } = trpc.scheduledJobs.list.useQuery({ projectId: id });
  const { data: deployments = [] } = trpc.deployments.list.useQuery({ projectId: id });
  const { data: activities = [] } = trpc.activities.list.useQuery({ projectId: id });
  const { data: commits = [] } = trpc.github.recentCommits.useQuery({ repo: project?.githubRepo ?? "" }, { enabled: !!project });

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (isError) return <ErrorState message={error.message} />;
  if (!project) return <EmptyState text="Project not found." />;

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progressPct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const latestDeployment = deployments[0];
  const failedJobs = jobs.filter((j) => j.status === "failed").length;

  return (
    <Stack gap="lg">
      <div>
        <Group gap="xs">
          <Title order={2}>{project.name}</Title>
          <Badge color={DEPLOYMENT_STATUS_COLORS[project.deploymentStatus] ?? "gray"}>{project.deploymentStatus}</Badge>
        </Group>
        <Group gap={6} mt={4}>
          <IconBrandGithub size={14} />
          <Anchor href={`https://github.com/${project.githubRepo}`} target="_blank" size="sm">
            {project.githubRepo}
          </Anchor>
          <Text size="sm" c="dimmed">
            · {project.defaultBranch}
          </Text>
        </Group>
      </div>

      <Tabs
        value={activeTab}
        onChange={(value) => {
          if (!value) return;
          navigate(value === "overview" ? `/projects/${id}` : `/projects/${id}/${value}`);
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconFolderCog size={14} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="tasks" leftSection={<IconChecklist size={14} />}>
            Tasks ({tasks.length})
          </Tabs.Tab>
          <Tabs.Tab value="specs" leftSection={<IconFileText size={14} />}>
            Specifications ({specs.length})
          </Tabs.Tab>
          <Tabs.Tab value="sessions" leftSection={<IconRobot size={14} />}>
            AI Sessions ({sessions.length})
          </Tabs.Tab>
          <Tabs.Tab value="jobs" leftSection={<IconClockHour4 size={14} />}>
            Scheduled Jobs ({jobs.length})
          </Tabs.Tab>
          <Tabs.Tab value="deployments" leftSection={<IconRocket size={14} />}>
            Deployments ({deployments.length})
          </Tabs.Tab>
          <Tabs.Tab value="activity" leftSection={<IconActivity size={14} />}>
            Activity
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="xs">
                Details
              </Title>
              <Text size="sm" mb="xs">
                {project.description}
              </Text>
              <Group gap={4} mb="xs" wrap="wrap">
                {project.techStack.map((t) => (
                  <Badge key={t} variant="light" size="sm">
                    {t}
                  </Badge>
                ))}
              </Group>
              <Text size="sm">
                <b>Local dir:</b> <Code>{project.localWorkingDir || "—"}</Code>
              </Text>
              <Text size="sm">
                <b>Milestone:</b> {project.currentMilestone || "—"}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="xs">
                Task progress
              </Title>
              <Group>
                <RingProgress
                  size={100}
                  thickness={10}
                  sections={[{ value: progressPct, color: "green" }]}
                  label={
                    <Text ta="center" fw={700}>
                      {progressPct}%
                    </Text>
                  }
                />
                <Stack gap={4}>
                  <Text size="sm">
                    {doneCount} / {tasks.length} tasks done
                  </Text>
                  <Progress.Root size="lg" w={180}>
                    {(["backlog", "ready", "in_progress", "review", "blocked", "done"] as const).map((s) => {
                      const count = tasks.filter((t) => t.status === s).length;
                      if (!count) return null;
                      return (
                        <Progress.Section key={s} value={(count / (tasks.length || 1)) * 100} color={TASK_STATUS_COLORS[s]}>
                          <Progress.Label>{count}</Progress.Label>
                        </Progress.Section>
                      );
                    })}
                  </Progress.Root>
                </Stack>
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="xs">
                Latest deployment
              </Title>
              {latestDeployment ? (
                <Stack gap={4}>
                  <Badge color={DEPLOYMENT_STATUS_COLORS[latestDeployment.status] ?? "gray"}>{latestDeployment.status}</Badge>
                  <Text size="sm">{latestDeployment.environment}</Text>
                  <Text size="sm" c="dimmed">
                    {formatRelativeTime(latestDeployment.deployedAt)} · <Code>{latestDeployment.commitSha}</Code>
                  </Text>
                  {latestDeployment.url && (
                    <Anchor href={latestDeployment.url} target="_blank" size="sm">
                      {latestDeployment.url}
                    </Anchor>
                  )}
                </Stack>
              ) : (
                <Text c="dimmed" size="sm">
                  No deployments yet.
                </Text>
              )}
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Title order={5} mb="xs">
                Scheduled job health
              </Title>
              <Group>
                <Text size="sm">{jobs.length} jobs</Text>
                <Badge color={failedJobs > 0 ? "red" : "green"} variant="light">
                  {failedJobs > 0 ? `${failedJobs} failing` : "all healthy"}
                </Badge>
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md" style={{ gridColumn: "1 / -1" }}>
              <Title order={5} mb="xs">
                Recent commits (mock GitHub adapter)
              </Title>
              {commits.length === 0 ? (
                <Text c="dimmed" size="sm">
                  No commit data.
                </Text>
              ) : (
                <Stack gap={6}>
                  {commits.map((c) => (
                    <Group key={c.sha} gap={8} wrap="nowrap">
                      <IconGitCommit size={14} />
                      <Code>{c.sha}</Code>
                      <Text size="sm" style={{ flex: 1 }}>
                        {c.message}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {c.author} · {formatRelativeTime(c.committedAt)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="tasks" pt="md">
          {tasks.length === 0 ? (
            <EmptyState text="No tasks for this project yet." />
          ) : (
            <Table.ScrollContainer minWidth={600}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Assignee</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {tasks.map((t) => (
                    <Table.Tr key={t.id}>
                      <Table.Td>
                        <Anchor component={Link} to="/tasks" size="sm">
                          {t.title}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={TASK_STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
                      </Table.Td>
                      <Table.Td>{t.priority}</Table.Td>
                      <Table.Td>{t.assignee || "—"}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="specs" pt="md">
          {specs.length === 0 ? (
            <EmptyState text="No specifications for this project yet." />
          ) : (
            <Stack gap="xs">
              {specs.map((s) => (
                <Card key={s.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <div>
                      <Anchor component={Link} to="/specifications" fw={600} size="sm">
                        {s.filename}
                      </Anchor>
                      <Text size="xs" c="dimmed">
                        {s.path}
                      </Text>
                    </div>
                    <Badge variant="light">{s.category}</Badge>
                  </Group>
                  <Text size="sm" mt={4}>
                    {s.summary}
                  </Text>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="sessions" pt="md">
          {sessions.length === 0 ? (
            <EmptyState text="No agent sessions yet." />
          ) : (
            <Stack gap="xs">
              {sessions.map((s) => (
                <Card key={s.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <Group gap={8}>
                      <IconRobot size={16} />
                      <Text fw={600} size="sm">
                        {s.agent}
                      </Text>
                      <Badge color={AGENT_SESSION_STATUS_COLORS[s.status]} size="sm">
                        {s.status}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {formatRelativeTime(s.startedAt)} · {formatDuration(s.durationSeconds)}
                    </Text>
                  </Group>
                  <Text size="sm" mt={4} lineClamp={2}>
                    {s.lastOutput}
                  </Text>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="jobs" pt="md">
          {jobs.length === 0 ? (
            <EmptyState text="No scheduled jobs yet." />
          ) : (
            <Stack gap="xs">
              {jobs.map((j) => (
                <Card key={j.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">
                      {j.name}
                    </Text>
                    <Badge color={JOB_STATUS_COLORS[j.status]}>{j.status}</Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    <Code>{j.cronExpression}</Code> · {j.timezone}
                  </Text>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="deployments" pt="md">
          {deployments.length === 0 ? (
            <EmptyState text="No deployments yet." />
          ) : (
            <Stack gap="xs">
              {deployments.map((d) => (
                <Card key={d.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <Group gap={8}>
                      <Text fw={600} size="sm">
                        {d.environment}
                      </Text>
                      <Badge color={DEPLOYMENT_STATUS_COLORS[d.status] ?? "gray"} size="sm">
                        {d.status}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {formatRelativeTime(d.deployedAt)}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    <Code>{d.commitSha}</Code>
                  </Text>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="activity" pt="md">
          {activities.length === 0 ? (
            <EmptyState text="No activity yet." />
          ) : (
            <Timeline active={activities.length} bulletSize={10} lineWidth={2}>
              {activities.map((a) => (
                <Timeline.Item key={a.id} title={a.message}>
                  <Text size="xs" c="dimmed">
                    {formatRelativeTime(a.createdAt)}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
