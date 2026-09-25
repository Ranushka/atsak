import type { Density } from "./useDensity";

const ROWS: Record<Density, { count: number; barHeight: string; gap: string }> = {
  comfortable: { count: 2, barHeight: "h-1.5", gap: "gap-2" },
  default: { count: 3, barHeight: "h-1", gap: "gap-1.5" },
  compact: { count: 4, barHeight: "h-[3px]", gap: "gap-1" },
};

export function DensityPreview({ density, active }: { density: Density; active?: boolean }) {
  const { count, barHeight, gap } = ROWS[density];
  return (
    <div
      className={`flex w-16 flex-col justify-center rounded-md border p-1.5 ${gap} ${
        active ? "border-brand bg-brand-subtle" : "border-border bg-surface"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${barHeight} rounded-full ${
            active && i === 0 ? "bg-brand" : "bg-muted-foreground/25"
          }`}
        />
      ))}
    </div>
  );
}
