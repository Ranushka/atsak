import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Stack,
  Group,
  TextInput,
  Paper,
  Text,
  Badge,
  ScrollArea,
  NavLink,
  Textarea,
  Select,
  Button,
  Modal,
  SegmentedControl,
  Box,
} from "@mantine/core";
import { IconSearch, IconFileText, IconPlus } from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "./DataStates";
import { SPEC_STATUS_COLORS, SPEC_STATUS_LABELS } from "../lib/badges";
import { getSpecTemplate } from "../lib/specTemplates";

const CATEGORY_OPTIONS = [
  { value: "product", label: "Product" },
  { value: "feature", label: "Feature" },
  { value: "architecture", label: "Architecture" },
  { value: "api", label: "API" },
  { value: "decision", label: "Decision" },
];

// Basic functionality only: a project has spec .md files, you get a list,
// and selecting one shows it in Preview or Edit depending on the switch.
export default function ProjectSpecifications({ projectId }: { projectId: string }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [createOpen, setCreateOpen] = useState(false);
  const [newSpec, setNewSpec] = useState({ filename: "", path: "", category: "product" });

  const utils = trpc.useUtils();
  const { data: specs, isLoading, isError, error } = trpc.specifications.list.useQuery({ projectId });

  const updateMutation = trpc.specifications.update.useMutation({
    onSuccess: () => utils.specifications.list.invalidate({ projectId }),
  });
  const createMutation = trpc.specifications.create.useMutation({
    onSuccess: ({ id }) => {
      utils.specifications.list.invalidate({ projectId });
      setSelectedId(id);
      setEditedContent(getSpecTemplate(newSpec.category as any));
      setViewMode("edit");
      setCreateOpen(false);
      setNewSpec({ filename: "", path: "", category: "product" });
    },
  });

  const { data: selectedSpec } = trpc.specifications.get.useQuery({ id: selectedId ?? "" }, { enabled: !!selectedId });

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (isError) return <ErrorState message={error.message} />;

  const filtered = (specs ?? []).filter(
    (s) => !search || s.filename.toLowerCase().includes(search.toLowerCase()) || s.path.toLowerCase().includes(search.toLowerCase())
  );
  const content = editedContent ?? selectedSpec?.content ?? "";

  const createModal = (
    <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="New Specification" centered>
      <Stack gap="sm">
        <TextInput
          label="Filename"
          placeholder="e.g. rate-limiting.md"
          required
          value={newSpec.filename}
          onChange={(e) => setNewSpec((s) => ({ ...s, filename: e.currentTarget.value }))}
        />
        <TextInput
          label="Path"
          placeholder="e.g. specs/api/rate-limiting.md"
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
        <Button
          loading={createMutation.isLoading}
          disabled={!newSpec.filename || !newSpec.path}
          onClick={() =>
            createMutation.mutate({
              projectId,
              filename: newSpec.filename,
              path: newSpec.path,
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

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
          New Specification
        </Button>
      </Group>
      {createModal}

      {!specs || specs.length === 0 ? (
        <EmptyState text="No specifications for this project yet." />
      ) : (
        <Group align="flex-start" gap="md" wrap="nowrap">
          <Paper withBorder p="sm" radius="md" w={280} style={{ flexShrink: 0 }}>
            <TextInput
              placeholder="Search specs..."
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              mb="sm"
            />
            <ScrollArea h={520}>
              {filtered.map((s) => (
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
            </ScrollArea>
          </Paper>

          <Paper withBorder p="md" radius="md" style={{ flex: 1, minWidth: 0 }}>
            {!selectedSpec ? (
              <EmptyState text="Select a specification to view or edit it." />
            ) : (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={600}>{selectedSpec.filename}</Text>
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
                  <Box mih={520} style={{ overflow: "auto" }}>
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </Box>
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
                    </Group>
                  </>
                )}
              </Stack>
            )}
          </Paper>
        </Group>
      )}
    </Stack>
  );
}
