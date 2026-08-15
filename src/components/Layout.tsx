import { useEffect, useMemo, useState } from "react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
  Alert,
  Box,
  TextInput,
  Select,
  Divider,
  UnstyledButton,
  Stack,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconLayoutDashboard,
  IconFolders,
  IconChecklist,
  IconFileText,
  IconClockHour4,
  IconRobot,
  IconActivity,
  IconSettings,
  IconSun,
  IconMoon,
  IconWifiOff,
  IconSearch,
  IconServer2,
  IconApps,
  IconFolderCog,
  IconRocket,
  IconMenu2,
} from "@tabler/icons-react";
import { trpc } from "../lib/trpc";
import { useActiveProject } from "../lib/activeProject";

const ALL_PROJECTS_VALUE = "__all__";

// Items that are always global, regardless of the active project.
const GLOBAL_NAV_ITEMS = [
  { label: "Overview", to: "/overview", icon: IconLayoutDashboard },
  { label: "Projects", to: "/projects", icon: IconFolders },
];

const SETTINGS_NAV_ITEM = { label: "Settings", to: "/settings", icon: IconSettings };

// Items that reshape around the active project when one is selected.
// `projectOnly` items have no global equivalent page, so they only appear
// in the sidebar once a project is active.
const SCOPED_NAV_ITEMS = [
  { label: "Overview", icon: IconFolderCog, globalTo: "/overview", scopedTab: "overview", projectOnly: true },
  { label: "Tasks", icon: IconChecklist, globalTo: "/tasks", scopedTab: "tasks" },
  { label: "Specifications", icon: IconFileText, globalTo: "/specifications", scopedTab: "specs" },
  { label: "AI Sessions", icon: IconRobot, globalTo: "/sessions", scopedTab: "sessions" },
  { label: "Scheduled Jobs", icon: IconClockHour4, globalTo: "/jobs", scopedTab: "jobs" },
  { label: "Deployments", icon: IconRocket, globalTo: "/projects", scopedTab: "deployments", projectOnly: true },
  { label: "Activity", icon: IconActivity, globalTo: "/activity", scopedTab: "activity" },
];

function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  return online;
}

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light");
  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
      onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
    >
      {computed === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}

function ProjectSwitcher() {
  const navigate = useNavigate();
  const { activeProjectId, setActiveProjectId } = useActiveProject();
  const { data: projects } = trpc.projects.list.useQuery();

  const data = useMemo(
    () => [
      { value: ALL_PROJECTS_VALUE, label: "All Projects" },
      ...(projects ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [projects]
  );

  return (
    <Select
      leftSection={<IconApps size={16} />}
      placeholder="Select a project…"
      data={data}
      value={activeProjectId ?? null}
      onChange={(value) => {
        if (!value || value === ALL_PROJECTS_VALUE) {
          setActiveProjectId(null);
          navigate("/overview");
        } else {
          setActiveProjectId(value);
          navigate(`/projects/${value}`);
        }
      }}
      clearable={false}
      w={{ base: 160, xs: 260 }}
    />
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const online = useOnlineStatus();
  const location = useLocation();
  const { activeProjectId } = useActiveProject();
  // Mantine's default "sm" breakpoint (48em) — matches the navbar's own
  // breakpoint so the bottom nav shows exactly when the sidebar collapses.
  const isMobile = useMediaQuery("(max-width: 48em)");

  const scopedItems = useMemo(
    () =>
      SCOPED_NAV_ITEMS.filter((item) => activeProjectId || !item.projectOnly).map((item) => {
        const isOverview = item.scopedTab === "overview";
        // The project's default landing route has no /:tab suffix, so Overview
        // links there directly instead of the explicit /overview path.
        const to = activeProjectId
          ? isOverview
            ? `/projects/${activeProjectId}`
            : `/projects/${activeProjectId}/${item.scopedTab}`
          : item.globalTo;
        return { label: item.label, icon: item.icon, to, isOverview };
      }),
    [activeProjectId]
  );

  const activityItem = scopedItems.find((item) => item.label === "Activity");

  const bottomNavItems = [
    { label: "Overview", to: "/overview", icon: IconLayoutDashboard, end: false },
    ...(activityItem ? [{ label: "Activity", to: activityItem.to, icon: activityItem.icon, end: true }] : []),
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
      footer={{ height: 64, collapsed: !isMobile }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconServer2 size={22} />
            <Text fw={700} size="lg">
              Atsak
            </Text>
            <ProjectSwitcher />
          </Group>
          <Group>
            <TextInput
              placeholder="Search projects, tasks, specs..."
              leftSection={<IconSearch size={16} />}
              visibleFrom="sm"
              w={320}
              disabled
            />
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ScrollArea>
          {GLOBAL_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              component={RouterNavLink}
              to={item.to}
              end
              label={item.label}
              leftSection={<item.icon size={18} stroke={1.6} />}
              active={
                item.to === "/overview"
                  ? location.pathname === "/overview" || location.pathname === "/"
                  : location.pathname === item.to
              }
              variant="filled"
              mb={2}
            />
          ))}

          <Divider my="xs" label={activeProjectId ? "This project" : "All projects"} labelPosition="left" />

          {scopedItems.map((item) => (
            <NavLink
              key={item.label}
              component={RouterNavLink}
              to={item.to}
              end
              label={item.label}
              leftSection={<item.icon size={18} stroke={1.6} />}
              active={
                item.isOverview
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to)
              }
              variant="filled"
              mb={2}
            />
          ))}

          <Divider my="xs" />

          <NavLink
            key={SETTINGS_NAV_ITEM.to}
            component={RouterNavLink}
            to={SETTINGS_NAV_ITEM.to}
            end
            label={SETTINGS_NAV_ITEM.label}
            leftSection={<SETTINGS_NAV_ITEM.icon size={18} stroke={1.6} />}
            active={location.pathname.startsWith(SETTINGS_NAV_ITEM.to)}
            variant="filled"
            mb={2}
          />
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        {!online && (
          <Alert
            color="red"
            icon={<IconWifiOff size={18} />}
            mb="md"
            title="You're offline"
            variant="light"
          >
            Changes won't be saved until your connection is restored.
          </Alert>
        )}
        <Box>{children}</Box>
      </AppShell.Main>

      <AppShell.Footer hiddenFrom="sm">
        <Group h="100%" grow gap={0} px={4}>
          {bottomNavItems.map((item) => {
            const active =
              item.to === "/overview"
                ? location.pathname === "/overview" || location.pathname === "/"
                : item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
            return (
              <UnstyledButton
                key={item.label}
                component={RouterNavLink}
                to={item.to}
                end={item.end}
              >
                <Stack align="center" gap={2} py={6}>
                  <item.icon
                    size={20}
                    stroke={1.6}
                    color={active ? "var(--mantine-color-brand-6)" : "var(--mantine-color-dimmed)"}
                  />
                  <Text size="xs" c={active ? "brand" : "dimmed"} fw={active ? 600 : 400}>
                    {item.label}
                  </Text>
                </Stack>
              </UnstyledButton>
            );
          })}
          <UnstyledButton onClick={toggle}>
            <Stack align="center" gap={2} py={6}>
              <IconMenu2 size={20} stroke={1.6} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                More
              </Text>
            </Stack>
          </UnstyledButton>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
