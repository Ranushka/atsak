import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AppRail,
  Avatar,
  Badge,
  Button,
  Checkbox,
  DataTable,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Input,
  Label,
  NavItem,
  PageHeader,
  Pagination,
  SearchInput,
  SegmentedControl,
  Separator,
  Sidebar,
  type SidebarNode,
  Skeleton,
  Spinner,
  Switch,
  TablePagination,
  Tooltip,
  Topbar,
} from "@qashio/ui";
import { Amount, CardMask, CountryPill, StatusPill } from "@qashio/finance-ui";
import {
  Boxes,
  Home,
  LayoutGrid,
  LineChart,
  Package,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";

function Section({
  title,
  children,
  align = "row",
}: {
  title: string;
  children: React.ReactNode;
  align?: "row" | "block";
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div
        className={
          align === "row"
            ? "flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4"
            : "overflow-hidden rounded-lg border border-border bg-surface"
        }
      >
        {children}
      </div>
    </section>
  );
}

const demoSidebarItems: SidebarNode[] = [
  { id: "home", label: "Home", icon: <Home className="size-4" /> },
  {
    id: "companies",
    label: "Companies",
    icon: <Users className="size-4" />,
    children: [
      { id: "active", label: "Active" },
      { id: "pending", label: "Pending KYB" },
    ],
  },
  { id: "reports", label: "Reports", icon: <LineChart className="size-4" /> },
];

interface DemoRow {
  name: string;
  role: string;
  status: "active" | "pending_kyb";
}

const demoRows: DemoRow[] = [
  { name: "Saeed Al Zaabi", role: "Owner", status: "active" },
  { name: "Khalid Al Farsi", role: "Finance", status: "pending_kyb" },
  { name: "Yusuf Al Suwaidi", role: "Admin", status: "active" },
];

const demoColumns: ColumnDef<DemoRow, any>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusPill status={getValue<DemoRow["status"]>()} />,
  },
];

export function ComponentsPage() {
  const [segment, setSegment] = React.useState("a");
  const [page, setPage] = React.useState(4);
  const [checked, setChecked] = React.useState<boolean | "indeterminate">(true);
  const [on, setOn] = React.useState(true);
  const [sidebarActive, setSidebarActive] = React.useState("home");
  const [tablePage, setTablePage] = React.useState(1);
  const [tablePageSize, setTablePageSize] = React.useState(10);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader icon={<LayoutGrid className="size-5" />} title="Components" description="Every component and variant, grouped by atomic level." />

      <div>
        <h1 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Palette className="size-4" /> Atoms
        </h1>
        <div className="flex flex-col gap-6">
          <Section title="Button">
            {(["primary", "brand", "secondary", "outline", "brand-outline", "ghost", "destructive", "link"] as const).map(
              (v) => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              )
            )}
          </Section>
          <Section title="Badge">
            {(["neutral", "brand", "brand-subtle", "success", "warning", "danger", "info", "outline"] as const).map(
              (t) => (
                <Badge key={t} tone={t}>
                  {t}
                </Badge>
              )
            )}
          </Section>
          <Section title="Badge sizes">
            {(["sm", "md", "lg"] as const).map((s) => (
              <Badge key={s} tone="brand" size={s}>
                {s}
              </Badge>
            ))}
          </Section>
          <Section title="Input & Label">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="demo-input">Email</Label>
              <Input id="demo-input" placeholder="you@qashio.com" />
            </div>
          </Section>
          <Section title="Avatar">
            <Avatar name="Admin User" />
            <Avatar name="Sara Al Farsi" />
          </Section>
          <Section title="Checkbox & Switch">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            <Switch checked={on} onCheckedChange={setOn} />
          </Section>
          <Section title="Switch sizes">
            {(["sm", "md", "lg"] as const).map((s) => (
              <Switch key={s} size={s} checked={on} onCheckedChange={setOn} />
            ))}
          </Section>
          <Section title="Tooltip">
            <Tooltip content="A helpful hint">
              <Button variant="outline">Hover me</Button>
            </Tooltip>
          </Section>
          <Section title="Spinner & Skeleton">
            <Spinner />
            <Skeleton className="h-8 w-32" />
          </Section>
          <Section title="Separator">
            <div className="flex h-8 items-center gap-2">
              Left <Separator orientation="vertical" /> Right
            </div>
          </Section>
        </div>
      </div>

      <div>
        <h1 className="mb-3 text-base font-semibold">Molecules</h1>
        <div className="flex flex-col gap-6">
          <Section title="SearchInput">
            <SearchInput placeholder="Search…" className="w-64" />
          </Section>
          <Section title="DropdownMenu">
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem destructive>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuRoot>
          </Section>
          <Section title="SegmentedControl">
            <SegmentedControl
              value={segment}
              onChange={setSegment}
              options={[
                { value: "a", label: "Recent" },
                { value: "b", label: "All" },
              ]}
            />
          </Section>
          <Section title="Pagination">
            <Pagination page={page} pageCount={12} onPageChange={setPage} />
          </Section>
          <Section title="NavItem" align="block">
            <div className="flex flex-col gap-0.5 p-2">
              <NavItem icon={<Home className="size-4" />} active>
                Home
              </NavItem>
              <NavItem icon={<Users className="size-4" />}>Companies</NavItem>
              <NavItem indent={1}>Active</NavItem>
            </div>
          </Section>
        </div>
      </div>

      <div>
        <h1 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Boxes className="size-4" /> Organisms
        </h1>
        <div className="flex flex-col gap-6">
          <Section title="PageHeader" align="block">
            <PageHeader
              className="p-4"
              icon={<Users className="size-5" />}
              title="Companies"
              description="Manage onboarded and prospective companies."
              actions={<Button variant="brand">Create</Button>}
            />
          </Section>
          <Section title="Topbar" align="block">
            <Topbar
              start={<SearchInput placeholder="Ask Qashio…" className="max-w-xs" />}
              end={<Avatar name="Admin User" />}
            />
          </Section>
          <Section title="AppRail">
            <div className="h-72 overflow-hidden rounded-lg border border-border">
              <AppRail
                logo={
                  <div className="flex size-9 items-center justify-center rounded-lg border-2 border-brand text-brand">
                    <Package className="size-5" />
                  </div>
                }
                items={[
                  { id: "ai", label: "AI Assistant", icon: <Sparkles className="size-5" />, active: true },
                  { id: "analytics", label: "Analytics", icon: <LineChart className="size-5" /> },
                ]}
              />
            </div>
          </Section>
          <Section title="Sidebar">
            <div className="h-72 overflow-hidden rounded-lg border border-border">
              <Sidebar
                items={demoSidebarItems}
                activeId={sidebarActive}
                onNavigate={(id) => setSidebarActive(id)}
                header={<span className="text-sm font-semibold">Qashio 360</span>}
              />
            </div>
          </Section>
          <Section title="DataTable & TablePagination" align="block">
            <div className="flex flex-col gap-3 p-4">
              <DataTable columns={demoColumns} data={demoRows} getRowId={(row) => row.name} />
              <TablePagination
                total={demoRows.length}
                page={tablePage}
                pageSize={tablePageSize}
                onPageChange={setTablePage}
                onPageSizeChange={setTablePageSize}
              />
            </div>
          </Section>
        </div>
      </div>

      <div>
        <h1 className="mb-3 text-base font-semibold">Finance UI</h1>
        <div className="flex flex-col gap-6">
          <Section title="Amount">
            <Amount value={125430.5} />
            <Amount value={-4200} signed />
            <Amount value={null} />
          </Section>
          <Section title="StatusPill">
            {(["active", "pending_kyb", "in_review", "rejected", "frozen"] as const).map((s) => (
              <StatusPill key={s} status={s} />
            ))}
          </Section>
          <Section title="CardMask & CountryPill">
            <CardMask last4="4242" />
            <CountryPill code="AE" />
            <CountryPill code="SA" />
          </Section>
        </div>
      </div>

      <div>
        <h1 className="mb-3 text-base font-semibold">Templates</h1>
        <Section title="AdminLayout">
          <p className="text-sm text-muted-foreground">
            [rail][sidebar][topbar + scrollable main], full viewport height — this whole app shell
            (the rail, sidebar, and topbar around this page) <em>is</em> an <code>AdminLayout</code>, so it's
            demonstrated by every page rather than nested here.
          </p>
        </Section>
      </div>
    </div>
  );
}
