import * as React from "react";
import { cn } from "../lib/cn";

export interface TopbarProps {
  start?: React.ReactNode;
  end?: React.ReactNode;
  className?: string;
}

export function Topbar({ start, end, className }: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">{start}</div>
      <div className="flex shrink-0 items-center gap-3">{end}</div>
    </header>
  );
}

/* __DOC_BLOCK
<QDS.Topbar
  start={<QDS.SearchInput placeholder="Ask Qashio…" className="max-w-xs" />}
  end={<QDS.Avatar name="Admin User" />}
/>
DOC__ */
