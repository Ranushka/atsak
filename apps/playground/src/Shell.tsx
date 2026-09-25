import * as React from "react";
import {
  AdminLayout,
  AppRail,
  Avatar,
  Badge,
  Button,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  QdsProvider,
  SearchInput,
  Sidebar,
  type SidebarNode,
  Topbar,
} from "@qashio/ui";
import { CountryPill } from "@qashio/finance-ui";
import {
  Bot,
  ChevronsUpDown,
  CreditCard,
  Headset,
  Home,
  LineChart,
  Package,
  Settings,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { useThemeDir } from "./useThemeDir";
import { useDensity, type Density } from "./useDensity";
import { DensityPreview } from "./DensityPreview";

const navItems: SidebarNode[] = [
  { id: "home", label: "Home", icon: <Home className="size-4" /> },
  {
    id: "accounts",
    label: "Accounts",
    icon: <CreditCard className="size-4" />,
    children: [
      { id: "approvals", label: "Approvals" },
      { id: "cards", label: "Cards" },
    ],
  },
  {
    id: "companies",
    label: "Companies",
    icon: <Users className="size-4" />,
    children: [
      { id: "companies-active", label: "Active" },
      { id: "companies-pending-kyb", label: "PendingKYB" },
      { id: "companies-signed-up", label: "SignedUp" },
    ],
  },
  { id: "kyb-users", label: "Kyb Users" },
  { id: "default", label: "Default" },
  { id: "entitlements", label: "Entitlements" },
  { id: "erp", label: "Erp" },
];

export interface ShellProps {
  activeId: string;
  onNavigate: (id: string) => void;
  children: React.ReactNode;
}

export function Shell({ activeId, onNavigate, children }: ShellProps) {
  const { theme, setTheme, dir, setDir } = useThemeDir();
  const { density, setDensity } = useDensity();

  return (
    <QdsProvider dir={dir}>
      <AdminLayout
        rail={
          <AppRail
            logo={
              <div className="flex size-9 items-center justify-center rounded-lg border-2 border-brand text-brand">
                <Package className="size-5" />
              </div>
            }
            items={[
              { id: "ai", label: "AI Assistant", icon: <Sparkles className="size-5" /> },
              { id: "support", label: "Support", icon: <Headset className="size-5" /> },
              { id: "analytics", label: "Analytics", icon: <LineChart className="size-5" /> },
              { id: "automation", label: "Automation", icon: <Workflow className="size-5" /> },
            ]}
            footer={
              <DropdownMenuRoot>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Settings"
                    className="flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Settings className="size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-64">
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => setTheme("light")}>
                    Light {theme === "light" && <Badge tone="brand-subtle">On</Badge>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTheme("dark")}>
                    Dark {theme === "dark" && <Badge tone="brand-subtle">On</Badge>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Direction</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => setDir("ltr")}>
                    LTR {dir === "ltr" && <Badge tone="brand-subtle">On</Badge>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDir("rtl")}>
                    RTL {dir === "rtl" && <Badge tone="brand-subtle">On</Badge>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Density</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={density} onValueChange={(v) => setDensity(v as Density)}>
                    {(["default", "comfortable", "compact"] as const).map((d) => (
                      <DropdownMenuRadioItem key={d} value={d}>
                        <div className="flex flex-1 items-center justify-between gap-3 capitalize">
                          <span>{d}</span>
                          <DensityPreview density={d} active={density === d} />
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => onNavigate("components")}>
                    Component gallery
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuRoot>
            }
          />
        }
        sidebar={
          <Sidebar
            items={navItems}
            activeId={activeId}
            onNavigate={(id) => onNavigate(id)}
            header={
              <span className="text-base font-semibold">
                Qashio <span className="text-brand">360</span>
              </span>
            }
          />
        }
        topbar={
          <Topbar
            start={
              <SearchInput
                placeholder="Ask Qashio…"
                className="max-w-md"
                end={
                  <Button size="xs" variant="brand-outline">
                    <Bot className="size-3.5" /> AI Mode
                  </Button>
                }
              />
            }
            end={
              <>
                <CountryPill code="AE" />
                <DropdownMenuRoot>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                      <Avatar name="Admin User" />
                      <span className="hidden text-start text-sm sm:block">
                        <span className="block font-medium leading-tight">Admin User</span>
                        <span className="block text-xs leading-tight text-muted-foreground">super_admin</span>
                      </span>
                      <ChevronsUpDown className="size-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuRoot>
              </>
            }
          />
        }
      >
        {children}
      </AdminLayout>
    </QdsProvider>
  );
}
