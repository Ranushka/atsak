import * as React from "react";
import type { DataTableSize } from "@qashio/ui";

export type Density = "default" | "comfortable" | "compact";

export const densityToTableSize: Record<Density, DataTableSize> = {
  comfortable: "lg",
  default: "md",
  compact: "sm",
};

interface DensityContextValue {
  density: Density;
  setDensity: (density: Density) => void;
}

const DensityContext = React.createContext<DensityContextValue | null>(null);

function readStored(): Density {
  if (typeof window === "undefined") return "default";
  const v = window.localStorage.getItem("qds-density");
  return v === "default" || v === "comfortable" || v === "compact" ? v : "default";
}

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensity] = React.useState<Density>(readStored);

  React.useEffect(() => {
    window.localStorage.setItem("qds-density", density);
  }, [density]);

  const value = React.useMemo(() => ({ density, setDensity }), [density]);
  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

export function useDensity() {
  const ctx = React.useContext(DensityContext);
  if (!ctx) throw new Error("useDensity must be used within a DensityProvider");
  return ctx;
}
