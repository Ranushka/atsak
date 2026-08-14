import { useMemo, useState } from "react";
import { Title, Stack, Group, Select, Timeline, Text, Paper } from "@mantine/core";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import { formatRelativeTime } from "../lib/badges";

const ACTIVITY_TYPES = [
  "task_created",
  "task_updated",
  "agent_started",
  "agent_completed",
  "deployment",
  "job_run",
  "spec_updated",
];

export default function Activity() {
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: activities, isLoading, isError, error } = trpc.activities.list.useQuery({
    projectId: projectFilter ?? undefined,
    type: typeFilter ?? undefined,
  });
  const { data: projects } = trpc.projects.list.useQuery();

  const projectMap = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p.name])), [projects]);

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (isError) return <ErrorState message={error.message} />;

  return (
    <Stack gap="lg">
      <Title order={2}>Activity</Title>

      <Group>
        <Select
          placeholder="Project"
          clearable
          data={(projects ?? []).map((p) => ({ value: p.id, label: p.name }))}
          value={projectFilter}
          onChange={setProjectFilter}
          w={200}
        />
        <Select placeholder="Type" clearable data={ACTIVITY_TYPES} value={typeFilter} onChange={setTypeFilter} w={200} />
      </Group>

      <Paper withBorder p="md" radius="md">
        {!activities || activities.length === 0 ? (
          <EmptyState text="No activity matches your filters." />
        ) : (
          <Timeline active={activities.length} bulletSize={10} lineWidth={2}>
            {activities.map((a) => (
              <Timeline.Item key={a.id} title={a.message}>
                <Text size="xs" c="dimmed">
                  {projectMap.get(a.projectId) ?? ""} · {a.type} · {formatRelativeTime(a.createdAt)}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Paper>
    </Stack>
  );
}
