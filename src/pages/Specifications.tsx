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
  Menu,
  Modal,
  SegmentedControl,
} from "@mantine/core";
import { IconSearch, IconFileText, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import { formatRelativeTime, SPEC_STATUS_COLORS, SPEC_STATUS_LABELS } from "../lib/badges";
import { getSpecTemplate } from "../lib/specTemplates";

const CATEGORY_OPTIONS = [
  { value: "product", label: "Product" },
  { value: "feature", label: "Feature" },
  { value: "architecture", label: "Architecture" },
  { value: "api", label: "API" },
  { value: "decision", label: "Decision" },
];

// Mirrors the legal-transition rule enforced server-side in
// specifications.updateStatus: no skipping backwards.
const SPEC_STATUS_TRANSITIONS: Record<string, string[]> = {
  proposal: ["applied", "archived"],
  applied: ["archived"],
  archived: [],
};
const SPEC_STATUS_ORDER = ["proposal", "applied", "archived"] as const;

export default function Specifications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [createOpen, setCreateOpen] = useState(false);
  const [newSpec, setNewSpec] = useState({
    projectId: "",
    filename: "",
    path: "",
    category: "product",
    gitBranch: "main",
    summary: "",
  });

  const utils = trpc.useUtils();
  const { data: specs, isLoading, isError, error } = trpc.specifications.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: tasks } = trpc.tasks.list.useQuery();

  const updateMutation = trpc.specifications.update.useMutation({
    onSuccess: () => utils.specifications.list.invalidate(),
  });
  const createMutation = trpc.specifications.create.useMutation({
    onSuccess: ({ id }) => {
      utils.specifications.list.invalidate();
      setSelectedId(id);
      setEditedContent(getSpecTemplate(newSpec.category as any));
      setViewMode("edit");
      setCreateOpen(false);
      setNewSpec({ projectId: "", filename: "", path: "", category: "product", gitBranch: "main", summary: "" });
    },
  });
  const linkMutation = trpc.specifications.linkTask.useMutation({
    onSuccess: () => utils.specifications.get.invalidate({ id: selectedId ?? "" }),
  });
  const updateStatusMutation = trpc.specifications.updateStatus.useMutation({
    onSuccess: () => {
      utils.specifications.list.invalidate();
      utils.specifications.get.invalidate({ id: selectedId ?? "" });
    },
  });

  const projectMap = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p.name])), [projects]);

  const grouped = useMemo(() => {
    if (!specs) return [];
    const filtered = specs.filter(
      (s) =>
        (!search ||
          s.filename.toLowerCase().includes(search.toLowerCase()) ||
          s.path.toLowerCase().includes(search.toLowerCase())) &&
        (!statusFilter || s.status === statusFilter)
    );
    const byProject = new Map<string, typeof filtered>();
    for (const s of filtered) {
      if (!byProject.has(s.projectId)) byProject.set(s.projectId, []);
      byProject.get(s.projectId)!.push(s);
    }
    return Array.from(byProject.entries());
  }, [specs, search, statusFilter]);

  const { data: selectedSpec } = trpc.specifications.get.useQuery({ id: selectedId ?? "" }, { enabled: !!selectedId });

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (isError) return <ErrorState message={error.message} />;

  const content = editedContent ?? selectedSpec?.content ?? "";

  const createModal = (
    <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="New Specification" centered>
      <Stack gap="sm">
        <Select
          label="Project"
          placeholder="Choose a project"
          required
          data={(projects ?? []).map((p) => ({ value: p.id, label: p.name }))}
          value={newSpec.projectId || null}
          onChange={(v) => setNewSpec((s) => ({ ...s, projectId: v ?? "" }))}
        />
        <TextInput
          label="Filename"
          placeholder="e.g. rate-limiting.md"
          required
          value={newSpec.filename}
          onChange={(e) => setNewSpec((s) => ({ ...s, filename: e.currentTarget.value }))}
        />
        <TextInput
          label="Path"
          placeholder="e.g. docs/specs/rate-limiting.md"
          required
          value={newSpec.path}
          onChange={(e) => setNewSpec((s) => ({ ...s, path: e.currentTarget.value }))}
        />
        <Select
          label="Category"
          data={CATEGORY_OPTIONS}
          value={newSpec.category}
          onChange={(v) => setNewSpec((s) => ({ ...s, category: v ?? "product" }))}
        />
        <TextInput
          label="Git branch"
          value={newSpec.gitBranch}
          onChange={(e) => setNewSpec((s) => ({ ...s, gitBranch: e.currentTarget.value }))}
        />
        <Textarea
          label="Summary"
          placeholder="One-line summary of what this spec covers"
          value={newSpec.summary}
          onChange={(e) => setNewSpec((s) => ({ ...s, summary: e.currentTarget.value }))}
        />
        <Button
          loading={createMutation.isLoading}
          disabled={!newSpec.projectId || !newSpec.filename || !newSpec.path}
          onClick={() =>
            createMutation.mutate({
              ...newSpec,
              category: newSpec.category as any,
              content: getSpecTemplate(newSpec.category as any),
            })
          }
        >
          Create specification
        </Button>
      </Stack>
    </Modal>
  );

  if (!specs || specs.length === 0)
    return (
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Specifications</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
            New Specification
          </Button>
        </Group>
        <EmptyState text="No specifications yet. Create one to get started." />
        {createModal}
      </Stack>
    );

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Specifications</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
          New Specification
        </Button>
      </Group>
      {createModal}

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper withBorder p="sm" radius="md" style={{ gridColumn: "span 1" }}>
          <TextInput
            placeholder="Search specs..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            mb="sm"
          />
          <Select
            placeholder="Status"
            clearable
            data={SPEC_STATUS_ORDER.map((s) => ({ value: s, label: SPEC_STATUS_LABELS[s] }))}
            value={statusFilter}
            onChange={setStatusFilter}
            mb="sm"
          />
          <ScrollArea h={520}>
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
                    rightSection={
                      <Badge size="xs" color={SPEC_STATUS_COLORS[s.status]} variant="light">
                        {SPEC_STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                    }
                    active={selectedId === s.id}
                    onClick={() => {
                      setSelectedId(s.id);
                      setEditedContent(null);
                      setViewMode("preview");
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
                <Group gap="xs">
                  <Text fw={600}>{selectedSpec.filename}</Text>
                  <Badge variant="light">{selectedSpec.category}</Badge>
                </Group>
                <SegmentedControl
                  size="xs"
                  value={viewMode}
                  onChange={(v) => setViewMode(v as "preview" | "edit")}
                  data={[
                    { label: "Preview", value: "preview" },
                    { label: "Edit", value: "edit" },
                  ]}
                />
              </Group>

              {viewMode === "preview" ? (
                <Paper withBorder p="sm" mih={480} style={{ overflow: "auto" }}>
                  <ReactMarkdown>{content}</ReactMarkdown>
                </Paper>
              ) : (
                <>
                  <Textarea
                    value={content}
                    onChange={(e) => setEditedContent(e.currentTarget.value)}
                    autosize
                    minRows={20}
                    styles={{ input: { fontFamily: "monospace", fontSize: 13 } }}
                  />
                  <Group gap="xs">
                    <Button
                      size="xs"
                      w={140}
                      loading={updateMutation.isLoading}
                      onClick={() => selectedSpec && updateMutation.mutate({ id: selectedSpec.id, content })}
                    >
                      Save changes
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => setEditedContent(getSpecTemplate(selectedSpec.category))}
                    >
                      Insert template for {selectedSpec.category}
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md" style={{ gridColumn: "span 1" }}>
          {!selectedSpec ? (
            <EmptyState text="Metadata and preview will appear here." />
          ) : (
            <Stack gap="sm">
              <Divider label="Metadata" />
              <Group justify="space-between">
                <Badge color={SPEC_STATUS_COLORS[selectedSpec.status]}>
                  {SPEC_STATUS_LABELS[selectedSpec.status] ?? selectedSpec.status}
                </Badge>
                {(SPEC_STATUS_TRANSITIONS[selectedSpec.status] ?? []).length > 0 && (
                  <Menu withinPortal position="bottom-end">
                    <Menu.Target>
                      <Button size="xs" variant="light" rightSection={<IconChevronDown size={14} />}>
                        Advance status
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {(SPEC_STATUS_TRANSITIONS[selectedSpec.status] ?? []).map((next) => (
                        <Menu.Item
                          key={next}
                          onClick={() => updateStatusMutation.mutate({ id: selectedSpec.id, status: next as "proposal" | "applied" | "archived" })}
                        >
                          Mark as {SPEC_STATUS_LABELS[next] ?? next}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>
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
