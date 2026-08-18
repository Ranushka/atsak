import { useRef, useState } from "react";
import { Stack, Group, Text, Button, SimpleGrid, Image, ActionIcon, Modal } from "@mantine/core";
import { IconPaperclip, IconX } from "@tabler/icons-react";
import { trpc } from "../lib/trpc";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB — basic client-side sanity limit

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:<mime>;base64,<data>" — strip the prefix.
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Basic image attachments, reused for both specs and tasks: a thumbnail
// grid, an upload button, click-to-enlarge, and a delete "x".
export default function AttachmentsPanel({ entityType, entityId }: { entityType: "specification" | "task"; entityId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: attachments } = trpc.attachments.list.useQuery({ entityType, entityId });
  const createMutation = trpc.attachments.create.useMutation({
    onSuccess: () => utils.attachments.list.invalidate({ entityType, entityId }),
  });
  const deleteMutation = trpc.attachments.delete.useMutation({
    onSuccess: () => utils.attachments.list.invalidate({ entityType, entityId }),
  });

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are supported.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("Image too large (max 5MB).");
        continue;
      }
      const dataBase64 = await fileToBase64(file);
      createMutation.mutate({ entityType, entityId, filename: file.name, mimeType: file.type, dataBase64 });
    }
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          Attachments
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPaperclip size={14} />}
          loading={createMutation.isLoading}
          onClick={() => fileInputRef.current?.click()}
        >
          Attach image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </Group>

      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}

      {!attachments || attachments.length === 0 ? (
        <Text size="sm" c="dimmed">
          No attachments yet.
        </Text>
      ) : (
        <SimpleGrid cols={4} spacing="xs">
          {attachments.map((a) => (
            <div key={a.id} style={{ position: "relative" }}>
              <Image
                src={`data:${a.mimeType};base64,${a.dataBase64}`}
                alt={a.filename}
                h={80}
                radius="sm"
                fit="cover"
                style={{ cursor: "pointer" }}
                onClick={() => setPreviewUrl(`data:${a.mimeType};base64,${a.dataBase64}`)}
              />
              <ActionIcon
                size="xs"
                color="red"
                variant="filled"
                radius="xl"
                style={{ position: "absolute", top: -6, right: -6 }}
                onClick={() => deleteMutation.mutate({ id: a.id })}
              >
                <IconX size={10} />
              </ActionIcon>
            </div>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={!!previewUrl} onClose={() => setPreviewUrl(null)} size="auto" centered>
        {previewUrl && <Image src={previewUrl} mah="80vh" fit="contain" />}
      </Modal>
    </Stack>
  );
}
