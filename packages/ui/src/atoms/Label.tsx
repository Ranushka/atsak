import * as React from "react";
import { cn } from "../lib/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

/* __DOC
<div className="flex flex-col gap-1.5">
  <QDS.Label htmlFor="demo-label-input">Email</QDS.Label>
  <QDS.Input id="demo-label-input" placeholder="you@qashio.com" />
</div>
DOC__ */
