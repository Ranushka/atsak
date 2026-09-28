import * as React from "react";
import { cn } from "../lib/cn";

export interface AdminLayoutProps {
  rail?: React.ReactNode;
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** [rail][sidebar][topbar + scrollable main], full viewport height. */
export function AdminLayout({ rail, sidebar, topbar, children, className }: AdminLayoutProps) {
  return (
    <div className={cn("flex h-screen w-screen overflow-hidden bg-background text-foreground", className)}>
      {rail}
      {sidebar}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {topbar}
        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
