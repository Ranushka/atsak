import * as React from "react";
import { cn } from "../lib/cn";

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ReactNode;
  active?: boolean;
  indent?: number;
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ className, icon, active, indent = 0, children, style, ...props }, ref) => (
    <a
      ref={ref}
      style={{ paddingInlineStart: `${0.5 + indent * 1}rem`, ...style }}
      className={cn(
        "flex items-center gap-2 rounded-md py-1.5 pe-2 text-sm transition-colors",
        active
          ? "bg-brand-subtle text-brand font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {icon ? <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </a>
  )
);
NavItem.displayName = "NavItem";

/* __DOC
<div className="flex flex-col gap-0.5 p-2">
  <QDS.NavItem icon={<Icons.Home className="size-4" />} active>
    Home
  </QDS.NavItem>
  <QDS.NavItem icon={<Icons.Users className="size-4" />}>Companies</QDS.NavItem>
  <QDS.NavItem indent={1}>Active</QDS.NavItem>
</div>
DOC__ */
