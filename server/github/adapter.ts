// Typed GitHub adapter interface. Only `MockGitHubAdapter` is implemented in
// this pass — no real network calls are made. A future Octokit-based
// `RealGitHubAdapter` can implement the same interface and be swapped in via
// `server/trpc/routers/github.ts` without touching any callers.

export interface GitHubIssue {
  id: string;
  number: number;
  title: string;
  state: "open" | "closed";
  url: string;
  author: string;
  createdAt: string;
  labels: string[];
}

export interface GitHubBranch {
  name: string;
  isDefault: boolean;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitAt: string;
  author: string;
}

export interface GitHubPullRequest {
  id: string;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  url: string;
  branch: string;
  author: string;
  createdAt: string;
  checksStatus: "pending" | "passing" | "failing";
}

export interface GitHubWorkflowRun {
  id: string;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | null;
  branch: string;
  startedAt: string;
  durationSeconds: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  committedAt: string;
}

export interface GitHubAdapter {
  listIssues(repo: string): Promise<GitHubIssue[]>;
  listBranches(repo: string): Promise<GitHubBranch[]>;
  listPullRequests(repo: string): Promise<GitHubPullRequest[]>;
  listWorkflowRuns(repo: string): Promise<GitHubWorkflowRun[]>;
  listRecentCommits(repo: string): Promise<GitHubCommit[]>;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function seededPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

const AUTHORS = ["ranushka", "claude-agent", "codex-agent", "octo-bot"];
const COMMIT_VERBS = ["Fix", "Add", "Update", "Refactor", "Remove", "Improve", "Wire up", "Clean up"];
const COMMIT_NOUNS = ["auth flow", "cache layer", "task list UI", "webhook handler", "test coverage", "error handling", "CI config", "docs"];

export class MockGitHubAdapter implements GitHubAdapter {
  async listIssues(repo: string): Promise<GitHubIssue[]> {
    const seed = hashStr(repo);
    const count = 3 + (seed % 4);
    return Array.from({ length: count }, (_, i) => {
      const n = 100 + ((seed + i * 7) % 400);
      return {
        id: `${repo}-issue-${n}`,
        number: n,
        title: `${seededPick(COMMIT_VERBS, seed + i)} ${seededPick(COMMIT_NOUNS, seed + i * 3)}`,
        state: i % 3 === 0 ? "closed" : "open",
        url: `https://github.com/${repo}/issues/${n}`,
        author: seededPick(AUTHORS, seed + i),
        createdAt: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000).toISOString(),
        labels: i % 2 === 0 ? ["bug"] : ["enhancement"],
      };
    });
  }

  async listBranches(repo: string): Promise<GitHubBranch[]> {
    const seed = hashStr(repo);
    const names = ["main", "feat/in-progress-work", "fix/edge-case", "chore/deps-bump"];
    return names.map((name, i) => ({
      name,
      isDefault: name === "main",
      lastCommitSha: (seed + i).toString(16).padStart(7, "0").slice(0, 7),
      lastCommitMessage: `${seededPick(COMMIT_VERBS, seed + i)} ${seededPick(COMMIT_NOUNS, seed + i * 5)}`,
      lastCommitAt: new Date(Date.now() - (i + 1) * 8 * 60 * 60 * 1000).toISOString(),
      author: seededPick(AUTHORS, seed + i),
    }));
  }

  async listPullRequests(repo: string): Promise<GitHubPullRequest[]> {
    const seed = hashStr(repo);
    const count = 2 + (seed % 3);
    return Array.from({ length: count }, (_, i) => {
      const n = 400 + ((seed + i * 11) % 100);
      const states: GitHubPullRequest["state"][] = ["open", "merged", "closed"];
      return {
        id: `${repo}-pr-${n}`,
        number: n,
        title: `${seededPick(COMMIT_VERBS, seed + i * 2)} ${seededPick(COMMIT_NOUNS, seed + i * 4)}`,
        state: seededPick(states, seed + i),
        url: `https://github.com/${repo}/pull/${n}`,
        branch: `feat/branch-${i + 1}`,
        author: seededPick(AUTHORS, seed + i),
        createdAt: new Date(Date.now() - (i + 1) * 2 * 24 * 60 * 60 * 1000).toISOString(),
        checksStatus: seededPick(["pending", "passing", "failing"] as const, seed + i * 3),
      };
    });
  }

  async listWorkflowRuns(repo: string): Promise<GitHubWorkflowRun[]> {
    const seed = hashStr(repo);
    const count = 4 + (seed % 3);
    return Array.from({ length: count }, (_, i) => {
      const completed = i > 0;
      return {
        id: `${repo}-run-${i}`,
        name: i % 2 === 0 ? "CI" : "Deploy",
        status: completed ? "completed" : "in_progress",
        conclusion: completed ? seededPick(["success", "success", "success", "failure"] as const, seed + i) : null,
        branch: i === 0 ? "main" : `feat/branch-${i}`,
        startedAt: new Date(Date.now() - (i + 1) * 4 * 60 * 60 * 1000).toISOString(),
        durationSeconds: 60 + ((seed + i * 13) % 500),
      };
    });
  }

  async listRecentCommits(repo: string): Promise<GitHubCommit[]> {
    const seed = hashStr(repo);
    const count = 5;
    return Array.from({ length: count }, (_, i) => ({
      sha: (seed + i * 17).toString(16).padStart(7, "0").slice(0, 7),
      message: `${seededPick(COMMIT_VERBS, seed + i)} ${seededPick(COMMIT_NOUNS, seed + i * 6)}`,
      author: seededPick(AUTHORS, seed + i),
      committedAt: new Date(Date.now() - (i + 1) * 5 * 60 * 60 * 1000).toISOString(),
    }));
  }
}

export const githubAdapter: GitHubAdapter = new MockGitHubAdapter();
