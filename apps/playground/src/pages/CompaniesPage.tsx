import * as React from "react";
import type { ColumnDef, SortingState, VisibilityState } from "@tanstack/react-table";
import {
  Badge,
  Button,
  DataTable,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  PageHeader,
  SearchInput,
  SegmentedControl,
  TablePagination,
} from "@qashio/ui";
import { Amount, StatusPill } from "@qashio/finance-ui";
import {
  ChevronDown,
  Columns3,
  Filter,
  Plus,
  RefreshCw,
  Save,
  Users,
  X,
} from "lucide-react";
import { companies, type Company, type CompanyStatus } from "../data/companies";

const columns: ColumnDef<Company, any>[] = [
  { accessorKey: "businessLegalName", header: "Business Legal Name" },
  { accessorKey: "companyTradingName", header: "Company Trading Name" },
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusPill status={getValue<CompanyStatus>()} />,
  },
  {
    accessorKey: "acceptedTermsAt",
    header: "Accepted Terms At",
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? new Date(v).toLocaleDateString() : "—";
    },
  },
  {
    accessorKey: "activationTimestamp",
    header: "Activation Timestamp",
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? new Date(v).toLocaleDateString() : "—";
    },
  },
  {
    accessorKey: "annualTurnover",
    header: "Annual Turnover",
    meta: { align: "end" },
    cell: ({ getValue }) => <Amount value={getValue<number>()} />,
  },
  {
    accessorKey: "totalPurchases",
    header: "Total Purchases",
    meta: { align: "end" },
    cell: ({ getValue }) => <Amount value={getValue<number>()} />,
  },
  {
    accessorKey: "totalPurchases30d",
    header: "Total Purchases (30d)",
    meta: { align: "end" },
    cell: ({ getValue }) => <Amount value={getValue<number>()} />,
  },
  {
    accessorKey: "bankruptcyHistory",
    header: "Bankruptcy History",
    cell: ({ getValue }) => (getValue<boolean>() ? <Badge tone="danger">Yes</Badge> : <Badge tone="neutral">No</Badge>),
  },
  {
    accessorKey: "totalPurchases90d",
    header: "Total Purchases (90d)",
    meta: { align: "end" },
    cell: ({ getValue }) => <Amount value={getValue<number>()} />,
  },
  { accessorKey: "brandName", header: "Brand Name" },
];

const savedViews = ["Default view", "My companies", "High turnover"];

export interface CompaniesPageProps {
  statusFilter?: CompanyStatus;
}

export function CompaniesPage({ statusFilter }: CompaniesPageProps) {
  const [search, setSearch] = React.useState("");
  const [segment, setSegment] = React.useState<"recent" | "all">("all");
  const [savedView, setSavedView] = React.useState(savedViews[0]!);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ status: false });
  const [filterCount] = React.useState(statusFilter ? 1 : 0);

  const filtered = React.useMemo(() => {
    let rows = companies;
    if (statusFilter) rows = rows.filter((c) => c.status === statusFilter);
    if (segment === "recent") rows = rows.slice(0, 100);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (c) =>
          c.businessLegalName.toLowerCase().includes(q) ||
          c.companyTradingName.toLowerCase().includes(q) ||
          c.brandName.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [statusFilter, segment, search]);

  const pageRows = React.useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader
        className="shrink-0"
        icon={<Users className="size-5" />}
        title="Companies"
        description="Manage onboarded and prospective Qashio companies."
        actions={
          <>
            <Button variant="brand">
              <Plus className="size-4" /> Create Draft Company
            </Button>
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export CSV</DropdownMenuItem>
                <DropdownMenuItem>Bulk invite</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive>Archive selected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuRoot>
          </>
        }
      />

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <SearchInput
          placeholder="Search companies…"
          className="w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <Button variant="outline">
          <Filter className="size-4" /> Filters
          {filterCount > 0 && <Badge tone="brand-subtle">{filterCount}</Badge>}
        </Button>

        <SegmentedControl
          value={segment}
          onChange={(v) => setSegment(v as "recent" | "all")}
          options={[
            { value: "recent", label: "Recent" },
            { value: "all", label: "All Records" },
          ]}
        />

        <Button variant="ghost" onClick={() => setSearch("")}>
          <X className="size-4" /> Clear All
        </Button>

        <Button variant="ghost">
          <Save className="size-4" /> Save View
        </Button>

        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {savedView} <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {savedViews.map((view) => (
              <DropdownMenuItem key={view} onSelect={() => setSavedView(view)}>
                {view}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenuRoot>

        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Columns3 className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((col) => {
              const id = (col as { accessorKey: string }).accessorKey;
              return (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={columnVisibility[id] !== false}
                  onCheckedChange={(checked) =>
                    setColumnVisibility((prev) => ({ ...prev, [id]: !!checked }))
                  }
                >
                  {typeof col.header === "string" ? col.header : id}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenuRoot>

        <Button variant="ghost" size="icon" aria-label="Refresh">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pageRows}
        selectable
        getRowId={(row) => row.id}
        sorting={sorting}
        onSortingChange={setSorting}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        emptyMessage="No companies match your filters."
        className="min-h-0 flex-1"
      />

      <TablePagination
        className="shrink-0"
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
