import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Title,
  Stack,
  Group,
  Button,
  Table,
  Anchor,
  Badge,
  Text,
  Menu,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  TagsInput,
  Select,
  Card,
  SimpleGrid,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconBrandGithub,
} from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/DataStates";
import { DEPLOYMENT_STATUS_COLORS, JOB_STATUS_COLORS, formatRelativeTime } from "../lib/badges";

type ProjectFormValues = {
  name: string;
  githubRepo: string;
  description: string;
  techStack: string[];
  defaultBranch: string;
  localWorkingDir: string;
  currentMilestone: string;
  deploymentStatus: string;
  deploymentUrl: string;
};

const emptyForm: ProjectFormValues = {
  name: "",
  githubRepo: "",
  description: "",
  techStack: [],
  defaultBranch: "main",
  localWorkingDir: "",
  currentMilestone: "",
  deploymentStatus: "unknown",
  deploymentUrl: "",
};

export default function Projects() {
  const isMobile = useMediaQuery("(max-width: 62em)");
  const utils = trpc.useUtils();
  const { data, isLoading, isError, error } = trpc.projects.list.useQuery();

  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const form = useForm<ProjectFormValues>({ initialValues: emptyForm });

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      setModalOpened(false);
    },
  });
  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      setModalOpened(false);
    },
  });
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      setDeleteTarget(null);
    },
  });

  function openCreate() {
    setEditingId(null);
    form.setValues(emptyForm);
    setModalOpened(true);
  }

  function openEdit(p: NonNullable<typeof data>[number]) {
    setEditingId(p.id);
    form.setValues({
      name: p.name,
      githubRepo: p.githubRepo,
      description: p.description,
      techStack: p.techStack,
      defaultBranch: p.defaultBranch,
      localWorkingDir: p.localWorkingDir,
      currentMilestone: p.currentMilestone,
      deploymentStatus: p.deploymentStatus,
      deploymentUrl: p.deploymentUrl,
    });
    setModalOpened(true);
  }

  function submit(values: ProjectFormValues) {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (isError) return <ErrorState message={error.message} />;

  const projects = data ?? [];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Projects</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          New Project
        </Button>
      </Group>

      {projects.length === 0 ? (
        <EmptyState text="No projects yet. Create your first project to get started." />
      ) : isMobile ? (
        <SimpleGrid cols={1} spacing="sm">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} onEdit={() => openEdit(p)} onDelete={() => setDeleteTarget({ id: p.id, name: p.name })} />
          ))}
        </SimpleGrid>
      ) : (
        <Table.ScrollContainer minWidth={900}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Tasks</Table.Th>
                <Table.Th>Active Agent</Table.Th>
                <Table.Th>Jobs</Table.Th>
                <Table.Th>Deployment</Table.Th>
                <Table.Th>Last Activity</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {projects.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>
                    <Anchor component={Link} to={`/projects/${p.id}`} fw={600}>
                      {p.name}
                    </Anchor>
                    <Group gap={4}>
                      <IconBrandGithub size={13} />
                      <Text size="xs" c="dimmed">
                        {p.githubRepo}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{p.openTaskCount} open</Table.Td>
                  <Table.Td>
                    {p.activeAgent ? <Badge color="blue">{p.activeAgent}</Badge> : <Text c="dimmed">—</Text>}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={p.jobHealth === "failing" ? "red" : p.jobHealth === "none" ? "gray" : "green"} variant="light">
                      {p.jobHealth}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={DEPLOYMENT_STATUS_COLORS[p.deploymentStatus] ?? "gray"}>{p.deploymentStatus}</Badge>
                  </Table.Td>
                  <Table.Td>{formatRelativeTime(p.lastActivityAt)}</Table.Td>
                  <Table.Td>
                    <RowMenu onEdit={() => openEdit(p)} onDelete={() => setDeleteTarget({ id: p.id, name: p.name })} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title={editingId ? "Edit Project" : "New Project"} size="lg">
        <form onSubmit={form.onSubmit(submit)}>
          <Stack gap="sm">
            <TextInput label="Name" required {...form.getInputProps("name")} />
            <TextInput label="GitHub repo" placeholder="owner/repo" required {...form.getInputProps("githubRepo")} />
            <Textarea label="Description" autosize minRows={2} {...form.getInputProps("description")} />
            <TagsInput label="Tech stack" {...form.getInputProps("techStack")} />
            <Group grow>
              <TextInput label="Default branch" {...form.getInputProps("defaultBranch")} />
              <TextInput label="Local working dir" {...form.getInputProps("localWorkingDir")} />
            </Group>
            <TextInput label="Current milestone" {...form.getInputProps("currentMilestone")} />
            <Group grow>
              <Select
                label="Deployment status"
                data={["healthy", "degraded", "down", "unknown"]}
                {...form.getInputProps("deploymentStatus")}
              />
              <TextInput label="Deployment URL" {...form.getInputProps("deploymentUrl")} />
            </Group>
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isLoading || updateMutation.isLoading}>
                {editingId ? "Save changes" : "Create project"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete project" size="sm">
        <Text mb="md">
          Are you sure you want to delete <b>{deleteTarget?.name}</b>? This will remove all associated tasks, specs, sessions, jobs, and
          activity.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color="red" loading={deleteMutation.isLoading} onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle">
          <IconDots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
          Edit
        </Menu.Item>
        <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={onDelete}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function ProjectCard({
  p,
  onEdit,
  onDelete,
}: {
  p: {
    id: string;
    name: string;
    githubRepo: string;
    description: string;
    techStack: string[];
    openTaskCount: number;
    activeAgent: string | null;
    jobHealth: string;
    deploymentStatus: string;
    lastActivityAt: Date;
  };
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" mb={4}>
        <Anchor component={Link} to={`/projects/${p.id}`} fw={700} size="lg">
          {p.name}
        </Anchor>
        <RowMenu onEdit={onEdit} onDelete={onDelete} />
      </Group>
      <Group gap={4} mb={6}>
        <IconBrandGithub size={13} />
        <Text size="xs" c="dimmed">
          {p.githubRepo}
        </Text>
      </Group>
      <Text size="sm" c="dimmed" lineClamp={2} mb={8}>
        {p.description}
      </Text>
      <Group gap={4} mb={8} wrap="wrap">
        {p.techStack.map((t) => (
          <Badge key={t} variant="light" size="sm">
            {t}
          </Badge>
        ))}
      </Group>
      <Group justify="space-between">
        <Text size="sm">{p.openTaskCount} open tasks</Text>
        <Badge color={DEPLOYMENT_STATUS_COLORS[p.deploymentStatus] ?? "gray"}>{p.deploymentStatus}</Badge>
      </Group>
      <Group justify="space-between" mt={6}>
        <Badge color={p.jobHealth === "failing" ? "red" : p.jobHealth === "none" ? "gray" : "green"} variant="light" size="sm">
          jobs: {p.jobHealth}
        </Badge>
        <Text size="xs" c="dimmed">
          {formatRelativeTime(p.lastActivityAt)}
        </Text>
      </Group>
    </Card>
  );
}
