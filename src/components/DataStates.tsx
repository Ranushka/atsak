import { Alert, Center, Skeleton, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconInbox } from "@tabler/icons-react";

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack gap="sm">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={44} radius="sm" />
      ))}
    </Stack>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <Alert color="red" icon={<IconAlertCircle size={18} />} title="Something went wrong">
      {message ?? "Failed to load data. Please try again."}
    </Alert>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <Center py="xl">
      <Stack align="center" gap="xs">
        <IconInbox size={32} stroke={1.4} opacity={0.5} />
        <Text c="dimmed" size="sm">
          {text}
        </Text>
      </Stack>
    </Center>
  );
}
