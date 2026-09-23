import * as React from "react";
import { Badge, type BadgeProps } from "@qashio/ui";

export interface StatusDefinition {
  label: string;
  tone: NonNullable<BadgeProps["tone"]>;
}

export const defaultStatuses: Record<string, StatusDefinition> = {
  active: { label: "Active", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  pending_kyb: { label: "Pending KYB", tone: "warning" },
  in_review: { label: "In Review", tone: "info" },
  signed_up: { label: "Signed Up", tone: "brand-subtle" },
  draft: { label: "Draft", tone: "neutral" },
  rejected: { label: "Rejected", tone: "danger" },
  declined: { label: "Declined", tone: "danger" },
  frozen: { label: "Frozen", tone: "info" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export interface StatusPillProps {
  status: string;
  statuses?: Record<string, StatusDefinition>;
  className?: string;
}

export function StatusPill({ status, statuses = defaultStatuses, className }: StatusPillProps) {
  const def = statuses[status] ?? { label: status.replace(/_/g, " "), tone: "neutral" as const };
  return (
    <Badge tone={def.tone} className={className}>
      {def.label}
    </Badge>
  );
}
