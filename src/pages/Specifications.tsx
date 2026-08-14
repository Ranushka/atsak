import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Title,
  Stack,
  Group,
  TextInput,
  Paper,
  Text,
  Badge,
  ScrollArea,
  NavLink,
  SimpleGrid,
  Textarea,
  Select,
  Button,
  Divider,
} from "@mantine/core";
import { IconSearch, IconFileText } from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import { formatRelativeTime } from "../lib/badges";

export default function Specifications() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: specs, isLoading, isError, error } = trpc.specifications.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: tasks } = trpc.tasks.list.useQuery();

  const updateMutation = trpc.specifications.update.useMutation({
    onSuccess: () => utils.specifications.list.invalidate(),
  });
  const linkMutation = trpc.specifications.linkTask.useMutation({
    onSuccess: () => utils.specifications.get.invalidate({ id: selectedId ?? "" }),
  });

  const projectMap = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p.name])), [projects]);

  const grouped = useMemo(() => {
    if (!specs) return [];
    const filtered = specs.filter(
      (s) =>
        !search ||
        s.filename.toLowerCase().includes(search.toLowerCase()) ||
        s.path.toLowerCase().includes(search.toLowerCase())
    );
    const byProject = new Map<string, typeof filtered>();
    for (const s of filtered) {
      if (!byProject.has(s.projectId)) byProject.set(s.projectId, []);
      byProject.get(s.projectId)!.push(s);
    }
    return Array.from(byProject.entries());
  }, [specs, search]);

  const { data: selectedSpec } = trpc.specifications.get.useQuery({ id: selectedId ?? "" }, { enabled: !!selectedId });

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (isError) return <ErrorState message={error.message} />;
  if (!specs || specs.length === 0) return <EmptyState text="No specifications yet." />;

  const content = editedContent ?? selectedSpec?.content ?? "";

  return (
    <Stack gap="lg">
      <Title order={2}>Specifications</Title>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper withBorder p="sm" radius="md" style={{ gridColumn: "span 1" }}>
          <TextInput
            placeholder="Search specs..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            mb="sm"
          />
          <ScrollArea h={560}>
            {grouped.map(([projectId, projectSpecs]) => (
              <div key={projectId}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="sm" mb={2}>
                  {projectMap.get(projectId) ?? "Unknown project"}
                </Text>
                {projectSpecs.map((s) => (
                  <NavLink
                    key={s.id}
                    label={s.filename}
                    description={s.path}
                    leftSection={<IconFileText size={14} />}
                    active={selectedId === s.id}
                    onClick={() => {
                      setSelectedId(s.id);
                      setEditedContent(null);
                    }}
                  />
                ))}
              </div>
            ))}
          </ScrollArea>
        </Paper>

        <Paper withBorder p="md" radius="md" style={{ gridColumn: "span 1" }}>
          {!selectedSpec ? (
            <EmptyState text="Select a specification to view and edit its content." />
          ) : (
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600}>{selectedSpec.filename}</Text>
                <Badge variant="light">{selectedSpec.category}</Badge>
              </Group>
              <Textarea
                value={content}
                onChange={(e) => setEditedContent(e.currentTarget.value)}
                autosize
                minRows={20}
                styles={{ input: { fontFamily: "monospace", fontSize: 13 } }}
              />
              <Button
                size="xs"
                w={140}
                loading={updateMutation.isLoading}
                onClick={() => selectedSpec && updateMutation.mutate({ id: selectedSpec.id, content })}
              >
                Save changes
              </Button>
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md" style={{ gridColumn: "span 1" }}>
          {!selectedSpec ? (
            <EmptyState text="Metadata and preview will appear here." />
          ) : (
            <Stack gap="sm">
              <div>
                <Text size="xs" c="dimmed">
                  Preview
                </Text>
                <Paper withBorder p="sm" mt={4} mah={280} style={{ overflow: "auto" }}>
                  <ReactMarkdown>{content}</ReactMarkdown>
                </Paper>
              </div>

              <Divider label="Metadata" />
              <Text size="sm">
                <b>Path:</b> {selectedSpec.path}
              </Text>
              <Text size="sm">
                <b>Project:</b> {projectMap.get(selectedSpec.projectId) ?? "—"}
              </Text>
              <Text size="sm">
                <b>Branch:</b> {selectedSpec.gitBranch}
              </Text>
              <Text size="sm">
                <b>Last updated:</b> {formatRelativeTime(selectedSpec.lastUpdated)}
              </Text>
              <Text size="sm">{selectedSpec.summary}</Text>

              <Divider label="Link to task" />
              <Select
                placeholder="Choose a task to link"
                searchable
                data={(tasks ?? [])
                  .filter((t) => t.projectId === selectedSpec.projectId)
                  .map((t) => ({ value: t.id, label: t.title }))}
                onChange={(v) => v && selectedSpec && linkMutation.mutate({ specificationId: selectedSpec.id, taskId: v })}
              />
              {selectedSpec.linkedTasks.length > 0 && (
                <Stack gap={2}>
                  {selectedSpec.linkedTasks.map((t) => (
                    <Text key={t.id} size="sm">
                      • {t.title}
                    </Text>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
