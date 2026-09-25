import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border border-transparent font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-secondary text-secondary-foreground",
        brand: "bg-brand text-brand-foreground",
        "brand-subtle": "bg-brand-subtle text-brand",
        success: "bg-success-subtle text-success",
        warning: "bg-warning-subtle text-warning",
        danger: "bg-danger-subtle text-danger",
        info: "bg-info-subtle text-info",
        outline: "border-border text-foreground bg-transparent",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        md: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

/* __DOC
<div className="flex flex-col gap-3">
  <div className="flex flex-wrap items-center gap-2">
    {(["neutral", "brand", "brand-subtle", "success", "warning", "danger", "info", "outline"] as const).map((t) => (
      <QDS.Badge key={t} tone={t}>
        {t}
      </QDS.Badge>
    ))}
  </div>
  <div className="flex flex-wrap items-center gap-2">
    {(["sm", "md", "lg"] as const).map((s) => (
      <QDS.Badge key={s} tone="brand" size={s}>
        {s}
      </QDS.Badge>
    ))}
  </div>
</div>
DOC__ */
