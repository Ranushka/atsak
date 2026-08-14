# Atsak

A self-hosted dashboard for managing multiple software projects developed with
AI coding agents (Claude Code, Codex, etc). One control center for several
GitHub projects: tasks, specs, agent sessions, and scheduled cron jobs.

## Stack

- **Vite + React + TypeScript** — client app
- **Mantine UI v7** for all styling (near-zero custom CSS, no Tailwind)
- **tRPC** (server + client) + **TanStack Query** for all data access
- **SQLite + Drizzle ORM** (via `better-sqlite3`) for storage
- **Tabler Icons** (`@tabler/icons-react`)
- Responsive: desktop tables, mobile cards; light/dark mode via Mantine color scheme

## Architecture

Single repo, two halves, one process in production:

- `server/` — Express + tRPC HTTP server (`/trpc`), Drizzle ORM against a local
  SQLite file at `data/atsak.db` (gitignored). Runs via `tsx` in both dev and
  prod — no separate server build/compile step.
- `src/` — Vite React app, Mantine `AppShell` with a collapsible sidebar,
  talking to the server via `@trpc/client` + `@trpc/react-query`.

In production the Node server also serves the built client as static files
from `dist/`, so the whole app runs as a single process on a single port
(`3800` by default) — this is what makes the Docker image a single container.

## Getting started

```bash
npm install
npm run dev       # runs server (tsx watch, :3800) + Vite client (:3801) concurrently
```

The client dev server proxies `/trpc` requests to `:3800`, so open
`http://localhost:3801`. On first boot, if the SQLite database is empty, the
server automatically seeds it with realistic demo data (5 projects, ~23 tasks,
specs, agent sessions, scheduled jobs + run history, deployments, activity).
You can also reseed manually at any time:

```bash
npm run db:seed
```

Note: reseeding **replaces** all existing data (it's a demo-data reset, not a
migration).

### Two-terminal alternative

If you'd rather not use `concurrently`:

```bash
# terminal 1
npm run dev:server
# terminal 2
npm run dev:client
```

## Build & run in production (single process)

```bash
npm run build   # builds the Vite client into dist/
npm run start   # NODE_ENV=production, serves dist/ + /trpc on :3800 (via tsx)
```

Then open `http://localhost:3800`.

## Docker

Multi-stage build: installs deps once, builds the client, then ships a slim
runtime image that runs the same single Node process (server + static client)
on port `3800`, with a named volume for the SQLite data directory.

```bash
docker build -t atsak .
docker run -p 3800:3800 -v atsak-data:/app/data atsak

# or, simpler:
docker compose up -d
```

`docker-compose.yml` exposes only port `3800` and persists `data/` in a named
volume (`atsak-data`) so the SQLite file survives container recreation.

## Typecheck

```bash
npm run typecheck   # client + server, no emit
```

## Database schema at a glance

All tables live in `server/db/schema.ts` (Drizzle) and are created directly
via `ensureSchema()` on boot (no migration files — fine for a self-hosted,
single-tenant app).

| Table | Purpose |
|---|---|
| `projects` | Tracked GitHub repos: name, repo, tech stack, milestone, deployment status/url |
| `tasks` | Work items: status/priority/type, labels, assignee (human or agent name), GitHub issue/branch/PR links, acceptance criteria (JSON checklist), agent execution status |
| `task_dependencies` | Task → task "depends on" edges |
| `specifications` | Spec file metadata (filename/path/category/branch) **+ a cached `content` column** for the demo (see tradeoff note below) |
| `task_specifications` | Task ↔ specification join table |
| `agent_sessions` | AI agent runs: agent, branch, status, duration, last output, PR url, token usage, cost |
| `scheduled_jobs` | Cron jobs: expression, timezone, command, enabled flag, last/next run, failure count, status |
| `job_runs` | Execution history per scheduled job (duration, exit status, logs) |
| `deployments` | Deploy history per project/environment |
| `activities` | Global activity feed, optionally linked to a task |
| `settings` | Simple key/value app settings (default timezone, GitHub token placeholder, app name) |

**Tradeoff note on `specifications.content`:** in a real integration, spec
markdown bodies would live in the project's own GitHub repo and be fetched
(and maybe cached with a TTL) on demand — this DB is meant to stay a
lightweight metadata index, not a source-code mirror. For this self-hosted
demo we also persist the markdown in a `content` column purely so the
Specifications page has something real to render without wiring actual
GitHub API calls. Treat it as a cache, not the source of truth.

## GitHub integration (mocked)

`server/github/adapter.ts` defines a typed `GitHubAdapter` interface
(`listIssues`, `listBranches`, `listPullRequests`, `listWorkflowRuns`,
`listRecentCommits`) with a `MockGitHubAdapter` implementation that generates
plausible, deterministic fake data per repo (seeded by a hash of the repo
name, so results are stable across reloads). It's wired behind the `github`
tRPC router, so a real Octokit-backed adapter can be swapped in later without
touching any callers. **No real network calls to GitHub are made in this
pass.**

## tRPC routers

One router per table (`server/trpc/routers/*.ts`), plus a `dashboard` router
for the Overview page's aggregate stats and a `github` router for the mock
adapter. Full CRUD on `projects`, `tasks`, and `scheduledJobs`; read (+ a
couple of targeted mutations like status updates, run-now, enable/disable,
task-spec linking) on the rest, matching what the UI actually needs.

## Pages

Overview · Projects · Project detail (tabs: Overview/Tasks/Specifications/AI
Sessions/Scheduled Jobs/Deployments/Activity) · All Tasks (Kanban + table
toggle, filters, task detail drawer) · Specifications (file tree + markdown
editor/preview) · Scheduled Jobs (table/cards, run-now, enable/disable, run
history drawer) · AI Sessions (start/stop/reopen, log viewer) · Activity
(global feed, filterable) · Settings.

## Notable deviations / implementation notes

- **Server runs via `tsx` in both dev and prod**, rather than compiling with
  `tsc` to a separate `dist-server/`. `tsx` is fast (esbuild-based) and this
  sidesteps ESM/CommonJS interop friction between `"type": "module"` and a
  `tsc`-compiled output. The Docker image ships `tsx` as a normal dependency
  and runs `npm run start` (`tsx server/index.ts`) as its `CMD`.
- **`superjson`** is used as the tRPC transformer so `Date` objects round-trip
  correctly between server and client instead of arriving as raw ISO strings.
- **Cron-to-English** is a small hand-written helper (`src/lib/cronToEnglish.ts`)
  covering the common patterns used by the seeded jobs (every N minutes/hours,
  daily/weekly/monthly at HH:MM), rather than pulling in a heavy npm package,
  per the spec's preference.
- Kanban drag-and-drop was intentionally skipped in favor of a per-card status
  `Select` dropdown, as explicitly allowed by the spec ("drag not required").
- Drizzle tables are created directly via a `CREATE TABLE IF NOT EXISTS`
  bootstrap (`ensureSchema()`) rather than a migrations pipeline — appropriate
  for a single-tenant, self-hosted app with no need for a live upgrade path
  across schema versions yet.
