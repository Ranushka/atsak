import * as React from "react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import { Check, Minus } from "lucide-react";
import { cn } from "../lib/cn";

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>, "checked"> {
  checked?: boolean | "indeterminate";
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof RadixCheckbox.Root>, CheckboxProps>(
  ({ className, checked, ...props }, ref) => (
    <RadixCheckbox.Root
      ref={ref}
      checked={checked}
      className={cn(
        "peer size-4 shrink-0 rounded-sm border border-input data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=indeterminate]:bg-brand data-[state=indeterminate]:border-brand disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadixCheckbox.Indicator className="flex items-center justify-center text-brand-foreground">
        {checked === "indeterminate" ? <Minus className="size-3" /> : <Check className="size-3" />}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
);
Checkbox.displayName = "Checkbox";
