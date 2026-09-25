import * as React from "react";
import { cn } from "../lib/cn";
import { Tooltip } from "../atoms/Tooltip";

export interface AppRailItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface AppRailProps {
  logo?: React.ReactNode;
  items: AppRailItem[];
  footer?: React.ReactNode;
  className?: string;
}

/** 64px icon rail with a logo, a stack of icon buttons, and a footer slot. */
export function AppRail({ logo, items, footer, className }: AppRailProps) {
  return (
    <div
      className={cn(
        "flex h-full w-16 shrink-0 flex-col items-center justify-between border-e border-border bg-surface py-3",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {logo ? <div>{logo}</div> : null}
        <div className="flex flex-col items-center gap-1">
          {items.map((item) => (
            <Tooltip key={item.id} content={item.label} side="right">
              <button
                type="button"
                aria-label={item.label}
                onClick={item.onClick}
                className={cn(
                  "flex size-10 items-center justify-center rounded-md transition-colors",
                  item.active ? "bg-brand-subtle text-brand" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.icon}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
      {footer ? <div className="flex flex-col items-center gap-1">{footer}</div> : null}
    </div>
  );
}

/* __DOC
<div className="h-72 overflow-hidden rounded-lg border border-border">
  <QDS.AppRail
    logo={
      <div className="flex size-9 items-center justify-center rounded-lg border-2 border-brand text-brand">
        <Icons.Package className="size-5" />
      </div>
    }
    items={[
      { id: "ai", label: "AI Assistant", icon: <Icons.Sparkles className="size-5" />, active: true },
      { id: "analytics", label: "Analytics", icon: <Icons.LineChart className="size-5" /> },
    ]}
  />
</div>
DOC__ */
