import { useEffect, useState } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { label: "Overview", to: "/", icon: IconLayoutDashboard },
  { label: "Projects", to: "/projects", icon: IconFolders },
  { label: "All Tasks", to: "/tasks", icon: IconChecklist },
  { label: "Specifications", to: "/specifications", icon: IconFileText },
  { label: "Scheduled Jobs", to: "/jobs", icon: IconClockHour4 },
  { label: "AI Sessions", to: "/sessions", icon: IconRobot },
  { label: "Activity", to: "/activity", icon: IconActivity },
  { label: "Settings", to: "/settings", icon: IconSettings },
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

export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const online = useOnlineStatus();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
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
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              component={RouterNavLink}
              to={item.to}
              label={item.label}
              leftSection={<item.icon size={18} stroke={1.6} />}
              active={item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)}
              variant="filled"
              mb={2}
            />
          ))}
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
    </AppShell>
  );
}
