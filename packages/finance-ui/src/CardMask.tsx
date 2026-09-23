import * as React from "react";
import { cn } from "@qashio/ui";

export interface CardMaskProps {
  last4: string;
  className?: string;
}

export function CardMask({ last4, className }: CardMaskProps) {
  return (
    <span dir="ltr" className={cn("inline-flex items-center gap-1 tabular-nums", className)}>
      <span aria-hidden="true">•••• {last4}</span>
      <span className="sr-only">Card ending in {last4}</span>
    </span>
  );
}
