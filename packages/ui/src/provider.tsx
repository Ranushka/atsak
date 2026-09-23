import * as React from "react";
import { Direction, Tooltip } from "radix-ui";

export interface QdsProviderProps {
  dir?: "ltr" | "rtl";
  children: React.ReactNode;
}

/**
 * Root provider for the design system: sets text direction for every
 * direction-aware Radix primitive and configures the shared tooltip delay.
 */
export function QdsProvider({ dir = "ltr", children }: QdsProviderProps) {
  return (
    <Direction.Provider dir={dir}>
      <Tooltip.Provider delayDuration={300}>{children}</Tooltip.Provider>
    </Direction.Provider>
  );
}
