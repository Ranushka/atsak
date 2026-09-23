import * as React from "react";
import { ToggleGroup } from "radix-ui";
import { cn } from "../lib/cn";

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Single-select segmented control; re-clicking the active segment is a no-op. */
export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      className={cn("inline-flex items-center rounded-md border border-border bg-secondary p-0.5", className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            "rounded-[calc(var(--radius-md)-2px)] px-3 py-1 text-sm text-muted-foreground transition-colors",
            "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
          )}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
