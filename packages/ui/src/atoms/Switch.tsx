import * as React from "react";
import { Switch as RadixSwitch } from "radix-ui";
import { cn } from "../lib/cn";

export type SwitchProps = React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>;

export const Switch = React.forwardRef<React.ElementRef<typeof RadixSwitch.Root>, SwitchProps>(
  ({ className, ...props }, ref) => (
    <RadixSwitch.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-secondary transition-colors data-[state=checked]:bg-brand disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow transition-transform",
          "translate-x-0.5 rtl:-translate-x-0.5 data-[state=checked]:translate-x-4 data-[state=checked]:rtl:-translate-x-4"
        )}
      />
    </RadixSwitch.Root>
  )
);
Switch.displayName = "Switch";
