import * as React from "react";
import { cn } from "../lib/cn";
import { Pagination } from "../molecules/Pagination";

export interface TablePaginationProps {
  total: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export function TablePagination({
  total,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const [goTo, setGoTo] = React.useState("");

  function submitGoTo(e: React.FormEvent) {
    e.preventDefault();
    const next = Number(goTo);
    if (Number.isFinite(next) && next >= 1 && next <= pageCount) {
      onPageChange(next);
    }
    setGoTo("");
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-muted-foreground", className)}>
      <span>Total Entries: {total}</span>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          Items per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-background px-2 text-foreground"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />

        <form onSubmit={submitGoTo} className="flex items-center gap-2">
          Go to
          <input
            value={goTo}
            onChange={(e) => setGoTo(e.target.value)}
            inputMode="numeric"
            className="h-8 w-14 rounded-md border border-input bg-background px-2 text-foreground"
            aria-label="Go to page"
          />
        </form>
      </div>
    </div>
  );
}
