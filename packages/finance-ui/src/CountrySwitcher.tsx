import * as React from "react";
import {
  cn,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@qashio/ui";
import { ChevronDown } from "lucide-react";
import { countries } from "./CountryPill";

export interface CountrySwitcherProps {
  value: keyof typeof countries;
  onChange: (code: keyof typeof countries) => void;
  className?: string;
}

/** CountryPill's trigger-able sibling: same look, opens a flag-illustrated picker. */
export function CountrySwitcher({ value, onChange, className }: CountrySwitcherProps) {
  const current = countries[value];
  const CurrentFlag = current.Flag;

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent",
            className
          )}
        >
          <CurrentFlag className="h-3 w-4 rounded-[2px]" />
          {current.label}
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as keyof typeof countries)}>
          {(Object.keys(countries) as Array<keyof typeof countries>).map((code) => {
            const { label, Flag } = countries[code];
            return (
              <DropdownMenuRadioItem key={code} value={code}>
                <Flag className="h-3 w-4 rounded-[2px]" />
                {label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

/* __DOC
{(function Demo() {
  const [value, setValue] = React.useState<"AE" | "SA">("AE");
  return <Finance.CountrySwitcher value={value} onChange={setValue} />;
})()}
DOC__ */
