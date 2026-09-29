import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@qashio/ui";
import { FlagAE, FlagSA } from "./Flags";

export const countries = {
  AE: { label: "UAE", Flag: FlagAE },
  SA: { label: "KSA", Flag: FlagSA },
} satisfies Record<string, { label: string; Flag: typeof FlagAE }>;

export const countryPillVariants = cva(
  "inline-flex items-center rounded-full border border-border bg-secondary font-medium text-secondary-foreground",
  {
    variants: {
      size: {
        sm: "h-7 gap-1 px-2 text-[11px]",
        md: "h-8 gap-1.5 px-2.5 text-xs",
        lg: "h-9 gap-2 px-3 text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export const countryFlagSizeBySize = {
  sm: "h-2.5 w-3.5",
  md: "h-3 w-4",
  lg: "h-3.5 w-5",
};

export interface CountryPillProps extends VariantProps<typeof countryPillVariants> {
  code: keyof typeof countries;
  className?: string;
}

export function CountryPill({ code, size, className }: CountryPillProps) {
  const country = countries[code];
  const { Flag } = country;
  const resolvedSize = size ?? "md";
  return (
    <span className={cn(countryPillVariants({ size }), className)}>
      <Flag className={cn(countryFlagSizeBySize[resolvedSize], "rounded-[2px]")} />
      {country.label}
    </span>
  );
}

/* __DOC
<div className="flex flex-wrap items-center gap-3">
  {(["sm", "md", "lg"] as const).map((s) => (
    <Finance.CountryPill key={s} code="AE" size={s} />
  ))}
</div>
DOC__ */
