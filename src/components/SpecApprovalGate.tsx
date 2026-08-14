import { Modal, Text, Group, Button, Alert, Stack } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

// Tessl-inspired soft approval gate: agent sessions can still be started
// against specs that are still in `proposal` status, but the user gets a
// clear warning + confirm first. `archived`/`applied` specs never trigger
// this — only `proposal` is "not yet the accepted source of truth".
export function countUnapprovedSpecs(specs: { status: string }[] | undefined): number {
  return (specs ?? []).filter((s) => s.status === "proposal").length;
}

export function SpecApprovalGateModal({
  opened,
  unapprovedCount,
  onCancel,
  onConfirm,
  confirmLoading,
}: {
  opened: boolean;
  unapprovedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
}) {
  return (
    <Modal opened={opened} onClose={onCancel} title="Unapproved specifications" centered>
      <Stack gap="md">
        <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
          <Text size="sm">
            {unapprovedCount} linked specification{unapprovedCount === 1 ? " is" : "s are"} still in{" "}
            <b>Proposal</b> status and not yet the accepted source of truth. Starting an agent session against
            unapproved specs may build on requirements that change.
          </Text>
        </Alert>
        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button color="yellow" loading={confirmLoading} onClick={onConfirm}>
            Start anyway
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
