import * as React from "react";
import { cn } from "@qashio/ui";
import { FlagAE, FlagSA } from "./Flags";

const countries = {
  AE: { label: "UAE", Flag: FlagAE },
  SA: { label: "KSA", Flag: FlagSA },
} satisfies Record<string, { label: string; Flag: typeof FlagAE }>;

export interface CountryPillProps {
  code: keyof typeof countries;
  className?: string;
}

export function CountryPill({ code, className }: CountryPillProps) {
  const country = countries[code];
  const { Flag } = country;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground",
        className
      )}
    >
      <Flag className="h-3 w-4 rounded-[2px]" />
      {country.label}
    </span>
  );
}

/* __DOC
<Finance.CountryPill code="AE" />
<Finance.CountryPill code="SA" />
DOC__ */
