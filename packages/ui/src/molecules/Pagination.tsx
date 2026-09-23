import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "../atoms/Button";

export const ELLIPSIS = "ellipsis" as const;
export type PageRangeItem = number | typeof ELLIPSIS;

/**
 * Computes the compact list of page numbers to render, with ellipses for
 * gaps. `siblingCount` is how many pages to show on each side of the
 * current page; the first and last page are always shown.
 */
export function pageRange(current: number, total: number, siblingCount = 1): PageRangeItem[] {
  if (total <= 0) return [];
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, total);

  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const items: PageRangeItem[] = [1];

  if (showLeftEllipsis) items.push(ELLIPSIS);
  for (let page = Math.max(left, 2); page <= Math.min(right, total - 1); page++) {
    items.push(page);
  }
  if (showRightEllipsis) items.push(ELLIPSIS);

  items.push(total);
  return items;
}

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, className }: PaginationProps) {
  const items = pageRange(page, pageCount, siblingCount);

  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="Pagination">
      <Button
        variant="outline"
        size="icon-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="rtl:-scale-x-100" />
      </Button>

      {items.map((item, index) =>
        item === ELLIPSIS ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-8 items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "brand" : "ghost"}
            size="icon-sm"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon-sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="rtl:-scale-x-100" />
      </Button>
    </nav>
  );
}
