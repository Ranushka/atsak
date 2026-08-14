import { useEffect, useState } from "react";
import { Title, Stack, Paper, TextInput, Select, Button, Group, Text, PasswordInput, useMantineColorScheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { trpc } from "../lib/trpc";
import { LoadingSkeleton, ErrorState } from "../components/DataStates";

const TIMEZONES = ["UTC", "Australia/Sydney", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Tokyo"];

export default function SettingsPage() {
  const { data: settings, isLoading, isError, error } = trpc.settings.list.useQuery();
  const utils = trpc.useUtils();
  const setMutation = trpc.settings.set.useMutation({ onSuccess: () => utils.settings.list.invalidate() });
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const [timezone, setTimezone] = useState("UTC");
  const [githubToken, setGithubToken] = useState("");
  const [appName, setAppName] = useState("Atsak");

  useEffect(() => {
    if (!settings) return;
    const map = new Map(settings.map((s) => [s.key, s.value]));
    setTimezone(map.get("default_timezone") || "UTC");
    setGithubToken(map.get("github_token") || "");
    setAppName(map.get("app_name") || "Atsak");
  }, [settings]);

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError) return <ErrorState message={error.message} />;

  function save() {
    setMutation.mutate({ key: "default_timezone", value: timezone });
    setMutation.mutate({ key: "github_token", value: githubToken });
    setMutation.mutate({ key: "app_name", value: appName });
    notifications.show({ message: "Settings saved", color: "green" });
  }

  return (
    <Stack gap="lg" maw={520}>
      <Title order={2}>Settings</Title>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <TextInput label="App name" value={appName} onChange={(e) => setAppName(e.currentTarget.value)} />
          <Select label="Default timezone" data={TIMEZONES} value={timezone} onChange={(v) => v && setTimezone(v)} />
          <PasswordInput
            label="GitHub token"
            description="Never used to call the real GitHub API in this build — the github router is backed entirely by a mock adapter."
            placeholder="ghp_..."
            value={githubToken}
            onChange={(e) => setGithubToken(e.currentTarget.value)}
          />
          <Select
            label="Theme"
            data={["light", "dark", "auto"]}
            value={colorScheme}
            onChange={(v) => v && setColorScheme(v as "light" | "dark" | "auto")}
          />
          <Group justify="flex-end">
            <Button onClick={save} loading={setMutation.isLoading}>
              Save settings
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Text size="xs" c="dimmed">
        Atsak stores metadata only — no source code from your projects is embedded or synced into this database.
      </Text>
    </Stack>
  );
}
