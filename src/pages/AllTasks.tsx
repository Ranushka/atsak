import { useMemo, useState } from "react";
import {
  Title,
  Stack,
  Group,
  SegmentedControl,
  TextInput,
  Select,
  MultiSelect,
  Table,
  Badge,
  Text,
  Card,
  SimpleGrid,
  Drawer,
  Checkbox,
  Divider,
  Anchor,
  Paper,
  ScrollArea,
  Button,
} from "@mantine/core";
import { IconSearch, IconLayoutKanban, IconTable, IconRobot } from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_COLORS,
  SPEC_STATUS_COLORS,
  SPEC_STATUS_LABELS,
  formatRelativeTime,
} from "../lib/badges";
import { countUnapprovedSpecs, SpecApprovalGateModal } from "../components/SpecApprovalGate";
import AttachmentsPanel from "../components/AttachmentsPanel";

const STATUS_COLUMNS = ["backlog", "ready", "in_progress", "review", "blocked", "done"] as const;

type TaskRow = ReturnType<typeof trpc.tasks.list.useQuery>["data"] extends (infer U)[] | undefined ? U : never;

export default function AllTasks() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: tasks, isLoading, isError, error } = trpc.tasks.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();

  const updateStatus = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  });

  const projectMap = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p.name])), [projects]);

  const filtered = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (projectFilter && t.projectId !== projectFilter) return false;
      if (priorityFilter.length && !priorityFilter.includes(t.priority)) return false;
      if (typeFilter.length && !typeFilter.includes(t.type)) return false;
      return true;
    });
  }, [tasks, search, projectFilter, priorityFilter, typeFilter]);

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (isError) return <ErrorState message={error.message} />;

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>All Tasks</Title>
        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as "kanban" | "table")}
          data={[
            {
              label: (
                <Group gap={4}>
                  <IconLayoutKanban size={14} />
                  <span>Kanban</span>
                </Group>
              ),
              value: "kanban",
            },
            {
              label: (
                <Group gap={4}>
                  <IconTable size={14} />
                  <span>Table</span>
                </Group>
              ),
              value: "table",
            },
          ]}
        />
      </Group>

      <Paper withBorder p="sm" radius="md">
        <Group wrap="wrap">
          <TextInput
            placeholder="Search tasks..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={220}
          />
          <Select
            placeholder="Project"
            clearable
            data={(projects ?? []).map((p) => ({ value: p.id, label: p.name }))}
            value={projectFilter}
            onChange={setProjectFilter}
            w={180}
          />
          <MultiSelect
            placeholder="Priority"
            data={["low", "medium", "high", "urgent"]}
            value={priorityFilter}
            onChange={setPriorityFilter}
            w={200}
          />
          <MultiSelect
            placeholder="Type"
            data={["feature", "bug", "chore", "spec"]}
            value={typeFilter}
            onChange={setTypeFilter}
            w={200}
          />
        </Group>
      </Paper>

      {filtered.length === 0 ? (
        <EmptyState text="No tasks match your filters." />
      ) : view === "kanban" ? (
        <ScrollArea>
          <Group align="flex-start" wrap="nowrap" gap="md">
            {STATUS_COLUMNS.map((status) => (
              <Stack key={status} w={260} gap="xs" style={{ flexShrink: 0 }}>
                <Group gap={6}>
                  <Badge color={TASK_STATUS_COLORS[status]}>{TASK_STATUS_LABELS[status]}</Badge>
                  <Text size="xs" c="dimmed">
                    {filtered.filter((t) => t.status === status).length}
                  </Text>
                </Group>
                {filtered
                  .filter((t) => t.status === status)
                  .map((t) => (
                    <Card key={t.id} withBorder padding="sm" onClick={() => setSelectedTaskId(t.id)} style={{ cursor: "pointer" }}>
                      <Text size="sm" fw={600} lineClamp={2}>
                        {t.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {projectMap.get(t.projectId) ?? ""}
                      </Text>
                      <Group justify="space-between" mt={6}>
                        <Badge size="xs" color={TASK_PRIORITY_COLORS[t.priority]} variant="light">
                          {t.priority}
                        </Badge>
                        <Select
                          size="xs"
                          w={110}
                          data={STATUS_COLUMNS.map((s) => ({ value: s, label: TASK_STATUS_LABELS[s] }))}
                          value={t.status}
                          onChange={(v) => v && updateStatus.mutate({ id: t.id, status: v as (typeof STATUS_COLUMNS)[number] })}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Group>
                    </Card>
                  ))}
              </Stack>
            ))}
          </Group>
        </ScrollArea>
      ) : (
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Project</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Assignee</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((t) => (
                <Table.Tr key={t.id} onClick={() => setSelectedTaskId(t.id)} style={{ cursor: "pointer" }}>
                  <Table.Td>{t.title}</Table.Td>
                  <Table.Td>{projectMap.get(t.projectId) ?? ""}</Table.Td>
                  <Table.Td>
                    <Badge color={TASK_STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={TASK_PRIORITY_COLORS[t.priority]} variant="light">
                      {t.priority}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{t.type}</Table.Td>
                  <Table.Td>{t.assignee || "—"}</Table.Td>
                  <Table.Td>{formatRelativeTime(t.updatedAt)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <TaskDetailDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </Stack>
  );
}

function TaskDetailDrawer({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const { data: task } = trpc.tasks.get.useQuery({ id: taskId ?? "" }, { enabled: !!taskId });
  const [gateOpen, setGateOpen] = useState(false);

  const utils = trpc.useUtils();
  const startSession = trpc.agentSessions.start.useMutation({
    onSuccess: () => {
      setGateOpen(false);
      utils.agentSessions.list.invalidate();
    },
  });

  const unapprovedCount = countUnapprovedSpecs(task?.linkedSpecs);

  function handleStartClick() {
    if (unapprovedCount > 0) {
      setGateOpen(true);
      return;
    }
    doStart();
  }

  function doStart() {
    if (!task) return;
    startSession.mutate({ projectId: task.projectId, taskId: task.id, agent: "claude" });
  }

  return (
    <Drawer opened={!!taskId} onClose={onClose} title={task?.title ?? "Task"} position="right" size="md">
      {!task ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <Stack gap="md">
          <Group gap={6} justify="space-between">
            <Group gap={6}>
              <Badge color={TASK_STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
              <Badge color={TASK_PRIORITY_COLORS[task.priority]} variant="light">
                {task.priority}
              </Badge>
              <Badge variant="outline">{task.type}</Badge>
            </Group>
            <Button
              size="xs"
              leftSection={<IconRobot size={14} />}
              loading={startSession.isLoading}
              onClick={handleStartClick}
            >
              Start AI session
            </Button>
          </Group>
          {startSession.isSuccess && (
            <Text size="xs" c="green">
              Session started.
            </Text>
          )}

          <Text size="sm">{task.description || "No description."}</Text>

          <Divider label="Acceptance criteria" />
          {task.acceptanceCriteria.length === 0 ? (
            <Text size="sm" c="dimmed">
              None defined.
            </Text>
          ) : (
            <Stack gap={4}>
              {task.acceptanceCriteria.map((c, i) => (
                <Checkbox key={i} label={c.text} checked={c.done} readOnly />
              ))}
            </Stack>
          )}

          <Divider label="Agent execution" />
          <Text size="sm">{task.agentExecutionStatus || "Not agent-assigned."}</Text>
          <Text size="sm">
            <b>Assignee:</b> {task.assignee || "Unassigned"}
          </Text>

          <Divider label="GitHub" />
          <Stack gap={2}>
            {task.githubIssueUrl && (
              <Anchor href={task.githubIssueUrl} target="_blank" size="sm">
                Issue: {task.githubIssueUrl}
              </Anchor>
            )}
            {task.githubBranch && <Text size="sm">Branch: {task.githubBranch}</Text>}
            {task.githubPrUrl && (
              <Anchor href={task.githubPrUrl} target="_blank" size="sm">
                PR: {task.githubPrUrl}
              </Anchor>
            )}
            {!task.githubIssueUrl && !task.githubBranch && !task.githubPrUrl && (
              <Text size="sm" c="dimmed">
                No linked GitHub artifacts.
              </Text>
            )}
          </Stack>

          <Divider label="Linked specifications" />
          {task.linkedSpecs.length === 0 ? (
            <Text size="sm" c="dimmed">
              No linked specifications.
            </Text>
          ) : (
            <Stack gap={4}>
              {task.linkedSpecs.map((s) => (
                <Group key={s.id} gap={6} justify="space-between">
                  <Text size="sm">{s.filename}</Text>
                  <Badge size="xs" color={SPEC_STATUS_COLORS[s.status]}>
                    {SPEC_STATUS_LABELS[s.status] ?? s.status}
                  </Badge>
                </Group>
              ))}
            </Stack>
          )}

          <Divider label="Dependencies" />
          {task.dependsOnTaskIds.length === 0 ? (
            <Text size="sm" c="dimmed">
              No dependencies.
            </Text>
          ) : (
            <Text size="sm">{task.dependsOnTaskIds.length} task(s) must complete first.</Text>
          )}

          <Divider />
          <AttachmentsPanel entityType="task" entityId={task.id} />
        </Stack>
      )}
      <SpecApprovalGateModal
        opened={gateOpen}
        unapprovedCount={unapprovedCount}
        onCancel={() => setGateOpen(false)}
        onConfirm={doStart}
        confirmLoading={startSession.isLoading}
      />
    </Drawer>
  );
}
