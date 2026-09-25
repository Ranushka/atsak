import * as React from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, MoreVertical } from "lucide-react";
import { cn } from "../lib/cn";
import { Checkbox } from "../atoms/Checkbox";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../molecules/DropdownMenu";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    width?: number | string;
    align?: "start" | "end";
  }
}

const dataTableHeaderVariants = cva("whitespace-nowrap font-medium text-muted-foreground", {
  variants: {
    size: {
      sm: "h-8 px-2 text-xs",
      md: "h-10 px-3 text-xs",
      lg: "h-12 px-4 text-sm",
    },
  },
  defaultVariants: { size: "md" },
});

const dataTableCellVariants = cva("align-middle", {
  variants: {
    size: {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-sm",
    },
  },
  defaultVariants: { size: "md" },
});

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  selectable?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: OnChangeFn<Record<string, boolean>>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  onRowClick?: (row: Row<TData>) => void;
  emptyMessage?: React.ReactNode;
  getRowId?: (row: TData, index: number) => string;
  className?: string;
  /**
   * Caps the table body's height and makes it scroll internally (sticky header stays put)
   * instead of letting the table grow with row count and push the pagination footer off
   * screen. Accepts any CSS height value, e.g. "60vh" or "480px".
   */
  maxHeight?: string;
  /** Row/header density. Defaults to "md". */
  size?: DataTableSize;
}

export type DataTableSize = NonNullable<VariantProps<typeof dataTableCellVariants>["size"]>;

export function DataTable<TData>({
  columns,
  data,
  selectable,
  rowSelection,
  onRowSelectionChange,
  sorting,
  onSortingChange,
  manualSorting,
  columnVisibility,
  onColumnVisibilityChange,
  onRowClick,
  emptyMessage = "No results.",
  getRowId,
  className,
  maxHeight,
  size = "md",
}: DataTableProps<TData>) {
  const allColumns = React.useMemo<ColumnDef<TData, any>[]>(() => {
    if (!selectable) return columns;
    const selectColumn: ColumnDef<TData, any> = {
      id: "__select",
      size: 36,
      meta: { width: 36 },
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    };
    return [selectColumn, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting: sorting ?? [],
      rowSelection: rowSelection ?? {},
      columnVisibility: columnVisibility ?? {},
    },
    manualSorting,
    onSortingChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    enableRowSelection: selectable,
  });

  const rows = table.getRowModel().rows;

  return (
    <div
      className={cn("relative w-full overflow-auto rounded-md border border-border", className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full caption-bottom text-sm">
        <thead className="sticky top-0 z-10 bg-surface">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => {
                const align = header.column.columnDef.meta?.align;
                const width = header.column.columnDef.meta?.width;
                const canSort = header.column.getCanSort();
                const sortState = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    style={width ? { width } : undefined}
                    className={cn(dataTableHeaderVariants({ size }), align === "end" ? "text-end" : "text-start")}
                  >
                    {header.isPlaceholder ? null : (
                      <div className={cn("flex items-center gap-1", align === "end" && "justify-end")}>
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {header.column.id !== "__select" && (
                          <DropdownMenuRoot>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="flex size-5 items-center justify-center rounded hover:bg-accent"
                                aria-label={`Column options for ${header.column.id}`}
                              >
                                {sortState === "asc" ? (
                                  <ArrowUp className="size-3.5" />
                                ) : sortState === "desc" ? (
                                  <ArrowDown className="size-3.5" />
                                ) : (
                                  <MoreVertical className="size-3.5" />
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={align === "end" ? "end" : "start"}>
                              {canSort && (
                                <>
                                  <DropdownMenuItem onSelect={() => header.column.toggleSorting(false)}>
                                    <ArrowUp className="size-3.5" /> Sort ascending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => header.column.toggleSorting(true)}>
                                    <ArrowDown className="size-3.5" /> Sort descending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => header.column.clearSorting()}>
                                    <ChevronsUpDown className="size-3.5" /> Clear sort
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onSelect={() => header.column.toggleVisibility(false)}>
                                <EyeOff className="size-3.5" /> Hide column
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenuRoot>
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={cn(
                  "border-b border-border last:border-0",
                  onRowClick && "cursor-pointer hover:bg-accent",
                  "data-[state=selected]:bg-brand-subtle"
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = cell.column.columnDef.meta?.align;
                  return (
                    <td
                      key={cell.id}
                      dir="auto"
                      className={cn(dataTableCellVariants({ size }), align === "end" ? "text-end" : "text-start")}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={allColumns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
