import * as React from "react";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Input,
  Label,
  PageHeader,
  Pagination,
  SearchInput,
  SegmentedControl,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tooltip,
} from "@qashio/ui";
import { Amount, CardMask, CountryPill, StatusPill } from "@qashio/finance-ui";
import { LayoutGrid, Palette } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4">
        {children}
      </div>
    </section>
  );
}

export function ComponentsPage() {
  const [segment, setSegment] = React.useState("a");
  const [page, setPage] = React.useState(4);
  const [checked, setChecked] = React.useState<boolean | "indeterminate">(true);
  const [on, setOn] = React.useState(true);

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
    </div>
  );
}
