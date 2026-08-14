export const TASK_STATUS_COLORS: Record<string, string> = {
  backlog: "gray",
  ready: "cyan",
  in_progress: "blue",
  review: "grape",
  blocked: "red",
  done: "green",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  ready: "Ready",
  in_progress: "In Progress",
  review: "Review",
  blocked: "Blocked",
  done: "Done",
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  low: "gray",
  medium: "blue",
  high: "orange",
  urgent: "red",
};

export const AGENT_SESSION_STATUS_COLORS: Record<string, string> = {
  queued: "gray",
  running: "blue",
  waiting: "yellow",
  failed: "red",
  completed: "green",
};

export const JOB_STATUS_COLORS: Record<string, string> = {
  healthy: "green",
  running: "blue",
  failed: "red",
  disabled: "gray",
  never_run: "gray",
};

export const DEPLOYMENT_STATUS_COLORS: Record<string, string> = {
  healthy: "green",
  success: "green",
  degraded: "yellow",
  down: "red",
  failed: "red",
  in_progress: "blue",
  unknown: "gray",
};

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const future = diffSec < 0;
  const abs = Math.abs(diffSec);

  let value: string;
  if (abs < 60) value = `${abs}s`;
  else if (abs < 3600) value = `${Math.floor(abs / 60)}m`;
  else if (abs < 86400) value = `${Math.floor(abs / 3600)}h`;
  else value = `${Math.floor(abs / 86400)}d`;

  return future ? `in ${value}` : `${value} ago`;
}
