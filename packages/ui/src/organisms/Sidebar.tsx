import * as React from "react";
import { Collapsible } from "radix-ui";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";

export interface SidebarNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: SidebarNode[];
}

export interface SidebarProps {
  items: SidebarNode[];
  activeId: string;
  onNavigate?: (id: string, node: SidebarNode) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

function findPathToActive(nodes: SidebarNode[], activeId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node.id];
    if (node.id === activeId) return nextPath;
    if (node.children) {
      const found = findPathToActive(node.children, activeId, nextPath);
      if (found) return found;
    }
  }
  return null;
}

export function Sidebar({ items, activeId, onNavigate, header, footer, collapsed, className }: SidebarProps) {
  const openPath = React.useMemo(() => new Set(findPathToActive(items, activeId) ?? []), [items, activeId]);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-e border-border bg-surface transition-[width]",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {header ? <div className="flex h-14 shrink-0 items-center px-4">{header}</div> : null}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <SidebarTree
          nodes={items}
          activeId={activeId}
          openPath={openPath}
          onNavigate={onNavigate}
          collapsed={collapsed}
          depth={0}
        />
      </nav>
      {footer ? <div className="shrink-0 border-t border-border p-2">{footer}</div> : null}
    </aside>
  );
}

function SidebarTree({
  nodes,
  activeId,
  openPath,
  onNavigate,
  collapsed,
  depth,
}: {
  nodes: SidebarNode[];
  activeId: string;
  openPath: Set<string>;
  onNavigate?: (id: string, node: SidebarNode) => void;
  collapsed?: boolean;
  depth: number;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node) => {
        const isActive = node.id === activeId;
        const isGroup = !!node.children?.length;
        const isOnPath = openPath.has(node.id);

        if (!isGroup) {
          return (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => onNavigate?.(node.id, node)}
                style={{ paddingInlineStart: `${0.5 + depth * 0.75}rem` }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md py-1.5 pe-2 text-start text-sm transition-colors",
                  isActive
                    ? "bg-brand-subtle text-brand font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {node.icon ? <span className="flex size-4 shrink-0 items-center">{node.icon}</span> : null}
                {!collapsed && <span className="truncate">{node.label}</span>}
              </button>
            </li>
          );
        }

        return (
          <li key={node.id}>
            <Collapsible.Root defaultOpen={isOnPath}>
              <Collapsible.Trigger asChild>
                <button
                  type="button"
                  style={{ paddingInlineStart: `${0.5 + depth * 0.75}rem` }}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-md py-1.5 pe-2 text-start text-sm transition-colors",
                    isOnPath ? "text-brand font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {node.icon ? <span className="flex size-4 shrink-0 items-center">{node.icon}</span> : null}
                  {!collapsed && <span className="flex-1 truncate">{node.label}</span>}
                  {!collapsed && (
                    <ChevronRight className="size-3.5 shrink-0 transition-transform rtl:-scale-x-100 group-data-[state=open]:rotate-90" />
                  )}
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <SidebarTree
                  nodes={node.children!}
                  activeId={activeId}
                  openPath={openPath}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                  depth={depth + 1}
                />
              </Collapsible.Content>
            </Collapsible.Root>
          </li>
        );
      })}
    </ul>
  );
}

/* __DOC
{(function Demo() {
  const [activeId, setActiveId] = React.useState("home");
  const items = [
    { id: "home", label: "Home", icon: <Icons.Home className="size-4" /> },
    {
      id: "companies",
      label: "Companies",
      icon: <Icons.Users className="size-4" />,
      children: [
        { id: "active", label: "Active" },
        { id: "pending", label: "Pending KYB" },
      ],
    },
    { id: "reports", label: "Reports", icon: <Icons.LineChart className="size-4" /> },
  ];
  return (
    <div className="h-72 overflow-hidden rounded-lg border border-border">
      <QDS.Sidebar
        items={items}
        activeId={activeId}
        onNavigate={(id) => setActiveId(id)}
        header={<span className="text-sm font-semibold">Qashio 360</span>}
      />
    </div>
  );
})()}
DOC__ */
