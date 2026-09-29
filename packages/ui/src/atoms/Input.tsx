import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 py-0.5 text-xs",
        md: "h-9 px-3 py-1 text-sm",
        lg: "h-11 px-4 py-2 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, ...props }, ref) => (
    <input ref={ref} className={cn(inputVariants({ size }), className)} {...props} />
  )
);
Input.displayName = "Input";

/* __DOC
<div className="flex flex-col gap-2">
  {(["sm", "md", "lg"] as const).map((s) => (
    <QDS.Input key={s} size={s} placeholder={`size="${s}"`} className="w-64" />
  ))}
</div>
DOC__ */
