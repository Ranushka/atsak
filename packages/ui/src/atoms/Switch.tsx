import * as React from "react";
import { Switch as RadixSwitch } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const switchRootVariants = cva(
  "peer inline-flex shrink-0 items-center rounded-full border border-transparent bg-secondary transition-colors data-[state=checked]:bg-brand disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        md: "h-5 w-9",
        lg: "h-6 w-11",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow transition-transform translate-x-0.5 rtl:-translate-x-0.5",
  {
    variants: {
      size: {
        sm: "size-3 data-[state=checked]:translate-x-3 data-[state=checked]:rtl:-translate-x-3",
        md: "size-4 data-[state=checked]:translate-x-4 data-[state=checked]:rtl:-translate-x-4",
        lg: "size-5 data-[state=checked]:translate-x-5 data-[state=checked]:rtl:-translate-x-5",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>,
    VariantProps<typeof switchRootVariants> {}

export const Switch = React.forwardRef<React.ElementRef<typeof RadixSwitch.Root>, SwitchProps>(
  ({ className, size, ...props }, ref) => (
    <RadixSwitch.Root ref={ref} className={cn(switchRootVariants({ size }), className)} {...props}>
      <RadixSwitch.Thumb className={switchThumbVariants({ size })} />
    </RadixSwitch.Root>
  )
);
Switch.displayName = "Switch";

/* __DOC
{(function Demo() {
  const [on, setOn] = React.useState(true);
  return (
    <div className="flex flex-col gap-3">
      <QDS.Switch checked={on} onCheckedChange={setOn} />
      <div className="flex items-center gap-4">
        {(["sm", "md", "lg"] as const).map((s) => (
          <QDS.Switch key={s} size={s} checked={on} onCheckedChange={setOn} />
        ))}
      </div>
    </div>
  );
})()}
DOC__ */
