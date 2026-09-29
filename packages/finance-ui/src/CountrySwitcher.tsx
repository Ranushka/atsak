import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import {
  cn,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@qashio/ui";
import { ChevronDown } from "lucide-react";
import { countries, countryPillVariants, countryFlagSizeBySize } from "./CountryPill";

export interface CountrySwitcherProps extends VariantProps<typeof countryPillVariants> {
  value: keyof typeof countries;
  onChange: (code: keyof typeof countries) => void;
  className?: string;
}

const chevronSizeBySize = { sm: "size-2.5", md: "size-3", lg: "size-3.5" };

/** CountryPill's trigger-able sibling: same look, opens a flag-illustrated picker. */
export function CountrySwitcher({ value, onChange, size, className }: CountrySwitcherProps) {
  const current = countries[value];
  const CurrentFlag = current.Flag;
  const resolvedSize = size ?? "md";

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            countryPillVariants({ size }),
            "transition-colors hover:bg-accent",
            className
          )}
        >
          <CurrentFlag className={cn(countryFlagSizeBySize[resolvedSize], "rounded-[2px]")} />
          {current.label}
          <ChevronDown className={cn(chevronSizeBySize[resolvedSize], "text-muted-foreground")} />
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
