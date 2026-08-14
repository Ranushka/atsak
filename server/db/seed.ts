import { randomUUID } from "node:crypto";
import { db, ensureSchema, sqlite } from "./index.js";
import {
  projects,
  tasks,
  taskDependencies,
  specifications,
  taskSpecifications,
  agentSessions,
  scheduledJobs,
  jobRuns,
  deployments,
  activities,
  settings,
} from "./schema.js";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}
function minutesAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 1000);
}
function id() {
  return randomUUID();
}

export function seed() {
  ensureSchema();

  const clearTables = [
    "activities",
    "job_runs",
    "scheduled_jobs",
    "deployments",
    "agent_sessions",
    "task_specifications",
    "specifications",
    "task_dependencies",
    "tasks",
    "projects",
    "settings",
  ];
  for (const t of clearTables) sqlite.exec(`DELETE FROM ${t};`);

  // -------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------
  const pTaskboard = id();
  const pGms = id();
  const pAtsak = id();
  const pWeatherApi = id();
  const pInvoicer = id();

  db.insert(projects)
    .values([
      {
        id: pTaskboard,
        name: "Taskboard",
        githubRepo: "ranushka/taskboard",
        description: "Self-hosted Kanban board with an MCP server exposing 22 tools for agent-driven task management.",
        techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "MCP"],
        defaultBranch: "main",
        localWorkingDir: "~/projects/taskboard",
        currentMilestone: "v2.3 — Recurring tasks & MCP tool expansion",
        deploymentStatus: "healthy",
        deploymentUrl: "https://task.ranu.win",
        lastActivityAt: hoursAgo(1),
        createdAt: daysAgo(210),
      },
      {
        id: pGms,
        name: "GMS",
        githubRepo: "ranushka/gms",
        description: "Gym management SaaS: memberships, billing, class scheduling. web-v2 rewrite in progress.",
        techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Stripe"],
        defaultBranch: "main",
        localWorkingDir: "~/projects/gms",
        currentMilestone: "web-v2 desktop enhancement pass",
        deploymentStatus: "healthy",
        deploymentUrl: "https://gms.ranu.win",
        lastActivityAt: hoursAgo(4),
        createdAt: daysAgo(365),
      },
      {
        id: pAtsak,
        name: "Atsak",
        githubRepo: "ranushka/atsak",
        description: "This dashboard — a control center for managing multiple AI-agent-developed projects.",
        techStack: ["Vite", "React", "Mantine", "tRPC", "SQLite", "Drizzle"],
        defaultBranch: "main",
        localWorkingDir: "~/projects/atsak",
        currentMilestone: "v1 — initial dashboard build",
        deploymentStatus: "degraded",
        deploymentUrl: "",
        lastActivityAt: minutesAgo(20),
        createdAt: daysAgo(3),
      },
      {
        id: pWeatherApi,
        name: "WeatherAPI Proxy",
        githubRepo: "ranushka/weather-proxy",
        description: "Lightweight caching proxy in front of a paid weather API, with rate limiting and Redis cache.",
        techStack: ["Fastify", "TypeScript", "Redis", "Docker"],
        defaultBranch: "main",
        localWorkingDir: "~/projects/weather-proxy",
        currentMilestone: "v1.1 — multi-region cache",
        deploymentStatus: "healthy",
        deploymentUrl: "https://weather-proxy.ranu.win",
        lastActivityAt: daysAgo(2),
        createdAt: daysAgo(140),
      },
      {
        id: pInvoicer,
        name: "Invoicer",
        githubRepo: "ranushka/invoicer",
        description: "Freelance invoicing tool: clients, line-item invoices, PDF export, payment reminders.",
        techStack: ["SvelteKit", "TypeScript", "SQLite", "Drizzle"],
        defaultBranch: "main",
        localWorkingDir: "~/projects/invoicer",
        currentMilestone: "v0.9 — payment reminders",
        deploymentStatus: "down",
        deploymentUrl: "https://invoicer.ranu.win",
        lastActivityAt: daysAgo(9),
        createdAt: daysAgo(95),
      },
    ])
    .run();

  // -------------------------------------------------------------------
  // Tasks
  // -------------------------------------------------------------------
  type TaskSeed = {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    labels: string[];
    assignee: string;
    githubIssueUrl?: string;
    githubBranch?: string;
    githubPrUrl?: string;
    acceptanceCriteria: { text: string; done: boolean }[];
    agentExecutionStatus?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  const taskSeeds: TaskSeed[] = [
    {
      id: id(),
      projectId: pTaskboard,
      title: "Add recurring task support",
      description: "Allow tasks to recur on a daily/weekly/monthly cadence, auto-creating the next instance on completion.",
      status: "in_progress",
      priority: "high",
      type: "feature",
      labels: ["backend", "scheduler"],
      assignee: "claude",
      githubIssueUrl: "https://github.com/ranushka/taskboard/issues/142",
      githubBranch: "feat/recurring-tasks",
      acceptanceCriteria: [
        { text: "Recurrence rule stored per task", done: true },
        { text: "Next instance auto-created on completion", done: true },
        { text: "UI to configure recurrence", done: false },
      ],
      agentExecutionStatus: "Implementing recurrence UI, 2 files remaining",
      createdAt: daysAgo(6),
      updatedAt: hoursAgo(1),
    },
    {
      id: id(),
      projectId: pTaskboard,
      title: "MCP tool: bulk task reassignment",
      description: "New MCP tool allowing an agent to reassign all tasks matching a filter to a different assignee.",
      status: "review",
      priority: "medium",
      type: "feature",
      labels: ["mcp"],
      assignee: "codex",
      githubIssueUrl: "https://github.com/ranushka/taskboard/issues/138",
      githubBranch: "feat/mcp-bulk-reassign",
      githubPrUrl: "https://github.com/ranushka/taskboard/pull/139",
      acceptanceCriteria: [
        { text: "Tool schema defined", done: true },
        { text: "Filter + reassign logic implemented", done: true },
        { text: "Tests added", done: true },
      ],
      agentExecutionStatus: "Awaiting human review",
      createdAt: daysAgo(5),
      updatedAt: hoursAgo(8),
    },
    {
      id: id(),
      projectId: pTaskboard,
      title: "Fix drag-and-drop jitter on Firefox",
      description: "Cards visibly jitter mid-drag on Firefox 130+; works fine on Chrome/Safari.",
      status: "backlog",
      priority: "low",
      type: "bug",
      labels: ["frontend", "firefox"],
      assignee: "human",
      acceptanceCriteria: [{ text: "Repro confirmed", done: false }],
      createdAt: daysAgo(12),
      updatedAt: daysAgo(12),
    },
    {
      id: id(),
      projectId: pTaskboard,
      title: "Write spec for webhook delivery retries",
      description: "Design retry/backoff strategy for outbound webhooks and document failure states.",
      status: "ready",
      priority: "medium",
      type: "spec",
      labels: ["webhooks", "docs"],
      assignee: "human",
      acceptanceCriteria: [
        { text: "Retry policy documented", done: false },
        { text: "Dead-letter behavior defined", done: false },
      ],
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
    },
    {
      id: id(),
      projectId: pTaskboard,
      title: "Board performance: virtualize long columns",
      description: "Columns with 200+ cards cause scroll jank; add virtualization.",
      status: "blocked",
      priority: "medium",
      type: "chore",
      labels: ["performance"],
      assignee: "claude",
      githubBranch: "chore/virtualize-columns",
      acceptanceCriteria: [{ text: "Blocked on react-virtual upgrade decision", done: false }],
      agentExecutionStatus: "Blocked: awaiting dependency decision",
      createdAt: daysAgo(8),
      updatedAt: daysAgo(1),
    },
    {
      id: id(),
      projectId: pTaskboard,
      title: "Dark mode contrast pass",
      description: "Several badge colors fail WCAG AA contrast in dark mode.",
      status: "done",
      priority: "low",
      type: "bug",
      labels: ["a11y", "frontend"],
      assignee: "claude",
      githubPrUrl: "https://github.com/ranushka/taskboard/pull/130",
      acceptanceCriteria: [{ text: "All badges pass AA contrast", done: true }],
      agentExecutionStatus: "Merged",
      createdAt: daysAgo(20),
      updatedAt: daysAgo(15),
    },

    {
      id: id(),
      projectId: pGms,
      title: "web-v2: desktop min-width layout for member list",
      description: "Member list screen still stretches mobile CSS wide on desktop; needs real min-width enhancement per design note.",
      status: "in_progress",
      priority: "high",
      type: "feature",
      labels: ["web-v2", "frontend"],
      assignee: "claude",
      githubBranch: "feat/web-v2-member-list-desktop",
      acceptanceCriteria: [
        { text: "min-width breakpoints defined", done: true },
        { text: "Member list uses table layout on desktop", done: false },
      ],
      agentExecutionStatus: "Building desktop table layout",
      createdAt: daysAgo(3),
      updatedAt: hoursAgo(4),
    },
    {
      id: id(),
      projectId: pGms,
      title: "Stripe webhook signature verification hardening",
      description: "Add timestamp tolerance check and structured logging for rejected webhook events.",
      status: "review",
      priority: "urgent",
      type: "bug",
      labels: ["billing", "security"],
      assignee: "codex",
      githubPrUrl: "https://github.com/ranushka/gms/pull/412",
      githubBranch: "fix/webhook-sig-hardening",
      acceptanceCriteria: [
        { text: "Timestamp tolerance enforced", done: true },
        { text: "Rejected events logged with reason", done: true },
      ],
      agentExecutionStatus: "PR open, CI green, awaiting review",
      createdAt: daysAgo(2),
      updatedAt: hoursAgo(6),
    },
    {
      id: id(),
      projectId: pGms,
      title: "Class scheduling: recurring class templates",
      description: "Let gym staff define a weekly class template that auto-generates sessions a month ahead.",
      status: "backlog",
      priority: "medium",
      type: "feature",
      labels: ["scheduling"],
      assignee: "human",
      acceptanceCriteria: [{ text: "Template model designed", done: false }],
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
    {
      id: id(),
      projectId: pGms,
      title: "Migrate legacy invoices table to new billing schema",
      description: "Backfill and dual-write during migration window.",
      status: "blocked",
      priority: "high",
      type: "chore",
      labels: ["migration", "billing"],
      assignee: "human",
      acceptanceCriteria: [{ text: "Blocked on finance sign-off", done: false }],
      createdAt: daysAgo(18),
      updatedAt: daysAgo(5),
    },
    {
      id: id(),
      projectId: pGms,
      title: "Add class check-in kiosk mode",
      description: "Tablet-friendly kiosk view for front-desk check-in by member barcode scan.",
      status: "ready",
      priority: "medium",
      type: "feature",
      labels: ["frontend", "kiosk"],
      assignee: "",
      acceptanceCriteria: [{ text: "Barcode scan flow prototyped", done: false }],
      createdAt: daysAgo(10),
      updatedAt: daysAgo(10),
    },
    {
      id: id(),
      projectId: pGms,
      title: "Deploy pipeline: cache node_modules layer",
      description: "Dokploy build takes 6+ minutes; cache the install layer to cut build time.",
      status: "done",
      priority: "low",
      type: "chore",
      labels: ["ci", "deploy"],
      assignee: "claude",
      githubPrUrl: "https://github.com/ranushka/gms/pull/398",
      acceptanceCriteria: [{ text: "Build time under 3 minutes", done: true }],
      agentExecutionStatus: "Merged, verified in prod",
      createdAt: daysAgo(14),
      updatedAt: daysAgo(8),
    },

    {
      id: id(),
      projectId: pAtsak,
      title: "Scaffold Vite + Mantine + tRPC app",
      description: "Initial project scaffold with dev/build/start scripts wired end-to-end.",
      status: "done",
      priority: "high",
      type: "chore",
      labels: ["setup"],
      assignee: "claude",
      acceptanceCriteria: [{ text: "npm run dev boots client+server", done: true }],
      agentExecutionStatus: "Complete",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: id(),
      projectId: pAtsak,
      title: "Design Drizzle schema for all core tables",
      description: "Projects, tasks, specs, sessions, jobs, deployments, activities, settings.",
      status: "done",
      priority: "high",
      type: "chore",
      labels: ["backend", "db"],
      assignee: "claude",
      acceptanceCriteria: [{ text: "Schema covers all entities in spec", done: true }],
      agentExecutionStatus: "Complete",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: id(),
      projectId: pAtsak,
      title: "Build Kanban + table view for All Tasks page",
      description: "Toggle between Kanban board and table, with search/filter and a task detail drawer.",
      status: "in_progress",
      priority: "high",
      type: "feature",
      labels: ["frontend"],
      assignee: "claude",
      acceptanceCriteria: [
        { text: "Kanban columns render by status", done: true },
        { text: "Table view with sort/filter", done: true },
        { text: "Task detail drawer", done: false },
      ],
      agentExecutionStatus: "Wiring task detail drawer",
      createdAt: daysAgo(1),
      updatedAt: minutesAgo(30),
    },
    {
      id: id(),
      projectId: pAtsak,
      title: "Scheduled Jobs page: cron-to-english helper",
      description: "Small hand-written helper to describe cron expressions in plain English, no heavy npm dep.",
      status: "ready",
      priority: "medium",
      type: "feature",
      labels: ["frontend"],
      assignee: "",
      acceptanceCriteria: [{ text: "Covers common cron patterns", done: false }],
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: id(),
      projectId: pAtsak,
      title: "Dockerfile + docker-compose for single-port deploy",
      description: "Multi-stage build, single Node process serving client static files + tRPC on port 3800.",
      status: "backlog",
      priority: "medium",
      type: "chore",
      labels: ["deploy", "docker"],
      assignee: "",
      acceptanceCriteria: [{ text: "docker compose up serves app on :3800", done: false }],
      createdAt: minutesAgo(45),
      updatedAt: minutesAgo(45),
    },

    {
      id: id(),
      projectId: pWeatherApi,
      title: "Add multi-region Redis cache",
      description: "Route cache reads to nearest Redis replica by request geo.",
      status: "in_progress",
      priority: "medium",
      type: "feature",
      labels: ["cache", "infra"],
      assignee: "codex",
      githubBranch: "feat/multi-region-cache",
      acceptanceCriteria: [
        { text: "Replica routing implemented", done: true },
        { text: "Failover tested", done: false },
      ],
      agentExecutionStatus: "Writing failover integration tests",
      createdAt: daysAgo(7),
      updatedAt: daysAgo(1),
    },
    {
      id: id(),
      projectId: pWeatherApi,
      title: "Rate limit by API key tier",
      description: "Free/paid/enterprise tiers get different rate limits enforced at the proxy edge.",
      status: "done",
      priority: "high",
      type: "feature",
      labels: ["rate-limiting"],
      assignee: "human",
      githubPrUrl: "https://github.com/ranushka/weather-proxy/pull/56",
      acceptanceCriteria: [{ text: "Tiered limits enforced", done: true }],
      createdAt: daysAgo(40),
      updatedAt: daysAgo(35),
    },
    {
      id: id(),
      projectId: pWeatherApi,
      title: "Investigate intermittent 502s from upstream",
      description: "Upstream weather API occasionally returns 502s under burst load; add circuit breaker.",
      status: "review",
      priority: "urgent",
      type: "bug",
      labels: ["reliability"],
      assignee: "claude",
      githubBranch: "fix/upstream-502-circuit-breaker",
      githubPrUrl: "https://github.com/ranushka/weather-proxy/pull/61",
      acceptanceCriteria: [
        { text: "Circuit breaker added", done: true },
        { text: "Alerting wired for open-circuit state", done: true },
      ],
      agentExecutionStatus: "PR open, awaiting review",
      createdAt: daysAgo(3),
      updatedAt: hoursAgo(10),
    },

    {
      id: id(),
      projectId: pInvoicer,
      title: "Payment reminder emails (3/7/14 day cadence)",
      description: "Automated reminder emails for overdue invoices at configurable intervals.",
      status: "blocked",
      priority: "high",
      type: "feature",
      labels: ["email", "billing"],
      assignee: "human",
      acceptanceCriteria: [{ text: "Blocked: SMTP provider outage since deploy went down", done: false }],
      createdAt: daysAgo(11),
      updatedAt: daysAgo(9),
    },
    {
      id: id(),
      projectId: pInvoicer,
      title: "PDF export: custom letterhead upload",
      description: "Allow freelancers to upload a logo/letterhead used in exported invoice PDFs.",
      status: "backlog",
      priority: "low",
      type: "feature",
      labels: ["pdf"],
      assignee: "",
      acceptanceCriteria: [{ text: "Logo upload + PDF template updated", done: false }],
      createdAt: daysAgo(25),
      updatedAt: daysAgo(25),
    },
    {
      id: id(),
      projectId: pInvoicer,
      title: "Fix production deployment (currently down)",
      description: "Deployment has been down for 9 days; investigate host/DB connectivity.",
      status: "backlog",
      priority: "urgent",
      type: "bug",
      labels: ["ops", "incident"],
      assignee: "",
      acceptanceCriteria: [{ text: "Root cause identified", done: false }, { text: "Service restored", done: false }],
      createdAt: daysAgo(9),
      updatedAt: daysAgo(9),
    },
  ];

  db.insert(tasks).values(taskSeeds).run();

  // A couple of task dependencies
  const recurringTask = taskSeeds.find((t) => t.title.includes("recurring task support"))!;
  const virtualizeTask = taskSeeds.find((t) => t.title.includes("virtualize long columns"))!;
  const kioskTask = taskSeeds.find((t) => t.title.includes("kiosk mode"))!;
  const migrateTask = taskSeeds.find((t) => t.title.includes("Migrate legacy invoices"))!;

  db.insert(taskDependencies)
    .values([
      { id: id(), taskId: virtualizeTask.id, dependsOnTaskId: recurringTask.id },
      { id: id(), taskId: kioskTask.id, dependsOnTaskId: migrateTask.id },
    ])
    .run();

  // -------------------------------------------------------------------
  // Specifications
  // -------------------------------------------------------------------
  const specSeeds = [
    {
      id: id(),
      projectId: pTaskboard,
      filename: "recurring-tasks.md",
      path: "specs/features/recurring-tasks.md",
      category: "feature",
      status: "applied",
      gitBranch: "main",
      lastUpdated: daysAgo(6),
      summary: "Design for recurring task scheduling and next-instance generation.",
      content: `# Recurring Tasks

## Problem
Users currently recreate the same task manually every week/month.

## Design
- A task may carry a \`recurrenceRule\` (RRULE-lite: daily/weekly/monthly + interval).
- On task completion, if a recurrence rule exists, the scheduler creates the next instance with the same fields, offsetting due dates by the interval.
- Recurrence editing lives in the task detail panel.

## Open questions
- Should completed recurring instances retain a link back to the "template" task?
`,
    },
    {
      id: id(),
      projectId: pTaskboard,
      filename: "mcp-tools.md",
      path: "specs/architecture/mcp-tools.md",
      category: "architecture",
      status: "archived",
      gitBranch: "main",
      lastUpdated: daysAgo(15),
      summary: "Inventory and conventions for the 22 MCP tools exposed by Taskboard.",
      content: `# MCP Tool Conventions

All tools live under \`server/mcp/tools/*.ts\` and are registered in \`server/mcp/registry.ts\`.

## Conventions
- Every tool takes a Zod-validated input schema.
- Mutating tools return the affected entity id(s).
- Bulk tools must be filter-scoped, never "all rows" by default.

## Current tool count: 22
See \`server/mcp/registry.ts\` for the full list.
`,
    },
    {
      id: id(),
      projectId: pTaskboard,
      filename: "webhook-retries.md",
      path: "specs/decisions/webhook-retries.md",
      category: "decision",
      status: "proposal",
      gitBranch: "feat/webhook-retry-spec",
      lastUpdated: daysAgo(4),
      summary: "Draft decision record for webhook delivery retry/backoff policy.",
      content: `# Decision: Webhook Delivery Retries

Status: **Draft**

## Options considered
1. Fixed 3 retries, 30s apart
2. Exponential backoff, 5 attempts, dead-letter after
3. No retries, rely on consumer polling

## Leaning towards option 2.
`,
    },
    {
      id: id(),
      projectId: pGms,
      filename: "web-v2-responsive.md",
      path: "specs/architecture/web-v2-responsive.md",
      category: "architecture",
      status: "applied",
      gitBranch: "main",
      lastUpdated: daysAgo(3),
      summary: "web-v2 is mobile-first, not mobile-only — desktop needs real min-width enhancement.",
      content: `# web-v2 Responsive Strategy

## Principle
web-v2 screens are **mobile-first**, not mobile-only. Each screen needs a genuine
desktop enhancement pass using \`min-width\` breakpoints — not just the mobile
layout stretched to fill a wide viewport.

## Status
Only the login page currently has a real desktop treatment. All other screens
(member list, billing, scheduling) still need this pass.
`,
    },
    {
      id: id(),
      projectId: pGms,
      filename: "billing-schema-v2.md",
      path: "specs/api/billing-schema-v2.md",
      category: "api",
      status: "proposal",
      gitBranch: "main",
      lastUpdated: daysAgo(18),
      summary: "New billing schema replacing legacy invoices table; dual-write plan.",
      content: `# Billing Schema v2

## New tables
- \`invoices_v2\`
- \`invoice_line_items\`
- \`payment_methods\`

## Migration plan
Dual-write to old and new tables for 2 weeks, backfill historical rows,
then cut reads over to v2, then drop legacy table after a further 2 weeks.
`,
    },
    {
      id: id(),
      projectId: pGms,
      filename: "class-scheduling-product-spec.md",
      path: "specs/product/class-scheduling.md",
      category: "product",
      status: "proposal",
      gitBranch: "main",
      lastUpdated: daysAgo(30),
      summary: "Product requirements for recurring class templates and kiosk check-in.",
      content: `# Class Scheduling — Product Spec

## Goals
- Staff define a weekly template once; sessions auto-generate a month ahead.
- Members check in via a front-desk kiosk by barcode scan.

## Non-goals
- Payment processing at the kiosk (handled elsewhere).
`,
    },
    {
      id: id(),
      projectId: pAtsak,
      filename: "dashboard-product-spec.md",
      path: "specs/product/dashboard-product-spec.md",
      category: "product",
      status: "applied",
      gitBranch: "main",
      lastUpdated: daysAgo(3),
      summary: "Top-level product spec for the Atsak control center.",
      content: `# Atsak — Product Spec

One control center for multiple GitHub projects developed with AI coding
agents: tasks, specs, agent sessions, and scheduled jobs, all in one place.

## Core entities
Projects, Tasks, Specifications, Agent Sessions, Scheduled Jobs, Deployments,
Activities.
`,
    },
    {
      id: id(),
      projectId: pAtsak,
      filename: "github-adapter.md",
      path: "specs/architecture/github-adapter.md",
      category: "architecture",
      status: "applied",
      gitBranch: "main",
      lastUpdated: daysAgo(2),
      summary: "Typed GitHubAdapter interface with a mock implementation for v1.",
      content: `# GitHub Adapter

\`GitHubAdapter\` is a typed interface (\`listIssues\`, \`listBranches\`,
\`listPullRequests\`, \`listWorkflowRuns\`) implemented for now by
\`MockGitHubAdapter\`. A real Octokit-backed adapter can be swapped in later
without touching any callers, since everything goes through the \`github\`
tRPC router.
`,
    },
    {
      id: id(),
      projectId: pWeatherApi,
      filename: "multi-region-cache.md",
      path: "specs/architecture/multi-region-cache.md",
      category: "architecture",
      status: "proposal",
      gitBranch: "feat/multi-region-cache",
      lastUpdated: daysAgo(7),
      summary: "Routing cache reads to the nearest Redis replica by request geo.",
      content: `# Multi-Region Cache

Requests are routed to the nearest Redis replica using edge geo headers,
falling back to the primary region on replica failure.
`,
    },
    {
      id: id(),
      projectId: pWeatherApi,
      filename: "rate-limiting.md",
      path: "specs/api/rate-limiting.md",
      category: "api",
      status: "applied",
      gitBranch: "main",
      lastUpdated: daysAgo(40),
      summary: "Tiered rate limit definitions per API key plan.",
      content: `# Rate Limiting

| Tier       | Requests/min |
|------------|--------------|
| Free       | 30           |
| Paid       | 300          |
| Enterprise | 3000         |
`,
    },
    {
      id: id(),
      projectId: pInvoicer,
      filename: "payment-reminders.md",
      path: "specs/feature/payment-reminders.md",
      category: "feature",
      status: "archived",
      gitBranch: "main",
      lastUpdated: daysAgo(11),
      summary: "Reminder cadence and templates for overdue invoices.",
      content: `# Payment Reminders

Reminders fire at 3, 7, and 14 days overdue, each with an escalating tone
template. Currently blocked on SMTP provider outage.
`,
    },
  ];

  db.insert(specifications).values(specSeeds).run();

  const recurringSpec = specSeeds.find((s) => s.filename === "recurring-tasks.md")!;
  const webhookSpec = specSeeds.find((s) => s.filename === "webhook-retries.md")!;
  const responsiveSpec = specSeeds.find((s) => s.filename === "web-v2-responsive.md")!;
  const billingSpec = specSeeds.find((s) => s.filename === "billing-schema-v2.md")!;

  db.insert(taskSpecifications)
    .values([
      { id: id(), taskId: recurringTask.id, specificationId: recurringSpec.id },
      { id: id(), taskId: taskSeeds.find((t) => t.title.includes("webhook delivery retries"))!.id, specificationId: webhookSpec.id },
      { id: id(), taskId: taskSeeds.find((t) => t.title.includes("desktop min-width"))!.id, specificationId: responsiveSpec.id },
      { id: id(), taskId: migrateTask.id, specificationId: billingSpec.id },
    ])
    .run();

  // -------------------------------------------------------------------
  // Agent sessions
  // -------------------------------------------------------------------
  db.insert(agentSessions)
    .values([
      {
        id: id(),
        projectId: pTaskboard,
        taskId: recurringTask.id,
        agent: "claude",
        workingBranch: "feat/recurring-tasks",
        status: "running",
        startedAt: hoursAgo(1),
        durationSeconds: 3200,
        lastOutput: "Implementing RecurrenceEditor.tsx — wiring form state to task update mutation...",
        prUrl: "",
        tokenUsage: 182_000,
        costUsd: 2.74,
      },
      {
        id: id(),
        projectId: pTaskboard,
        taskId: taskSeeds.find((t) => t.title.includes("bulk task reassignment"))!.id,
        agent: "codex",
        workingBranch: "feat/mcp-bulk-reassign",
        status: "completed",
        startedAt: hoursAgo(10),
        durationSeconds: 5400,
        lastOutput: "Opened PR #139 with tool implementation and tests. All checks passing.",
        prUrl: "https://github.com/ranushka/taskboard/pull/139",
        tokenUsage: 340_000,
        costUsd: 5.1,
      },
      {
        id: id(),
        projectId: pGms,
        taskId: taskSeeds.find((t) => t.title.includes("member list"))!.id,
        agent: "claude",
        workingBranch: "feat/web-v2-member-list-desktop",
        status: "running",
        startedAt: hoursAgo(4),
        durationSeconds: 9100,
        lastOutput: "Converting mobile card list to a Mantine Table with min-width 900px breakpoint...",
        prUrl: "",
        tokenUsage: 410_000,
        costUsd: 6.15,
      },
      {
        id: id(),
        projectId: pGms,
        taskId: taskSeeds.find((t) => t.title.includes("Stripe webhook"))!.id,
        agent: "codex",
        workingBranch: "fix/webhook-sig-hardening",
        status: "waiting",
        startedAt: hoursAgo(7),
        durationSeconds: 4800,
        lastOutput: "PR #412 opened. Waiting on human review before proceeding further.",
        prUrl: "https://github.com/ranushka/gms/pull/412",
        tokenUsage: 155_000,
        costUsd: 2.32,
      },
      {
        id: id(),
        projectId: pGms,
        taskId: taskSeeds.find((t) => t.title.includes("node_modules layer"))!.id,
        agent: "claude",
        workingBranch: "chore/cache-node-modules",
        status: "completed",
        startedAt: daysAgo(8),
        durationSeconds: 1800,
        lastOutput: "Build cache added, verified 6m40s -> 2m10s build time in Dokploy.",
        prUrl: "https://github.com/ranushka/gms/pull/398",
        tokenUsage: 88_000,
        costUsd: 1.3,
      },
      {
        id: id(),
        projectId: pWeatherApi,
        taskId: taskSeeds.find((t) => t.title.includes("multi-region Redis"))!.id,
        agent: "codex",
        workingBranch: "feat/multi-region-cache",
        status: "running",
        startedAt: hoursAgo(2),
        durationSeconds: 2600,
        lastOutput: "Writing integration test for replica failover under simulated network partition...",
        prUrl: "",
        tokenUsage: 96_000,
        costUsd: 1.44,
      },
      {
        id: id(),
        projectId: pWeatherApi,
        taskId: taskSeeds.find((t) => t.title.includes("intermittent 502s"))!.id,
        agent: "claude",
        workingBranch: "fix/upstream-502-circuit-breaker",
        status: "completed",
        startedAt: hoursAgo(11),
        durationSeconds: 4100,
        lastOutput: "Circuit breaker added with 30s half-open probe; alerting wired to existing Slack webhook.",
        prUrl: "https://github.com/ranushka/weather-proxy/pull/61",
        tokenUsage: 201_000,
        costUsd: 3.0,
      },
      {
        id: id(),
        projectId: pInvoicer,
        taskId: taskSeeds.find((t) => t.title.includes("Fix production deployment"))!.id,
        agent: "claude",
        workingBranch: "",
        status: "failed",
        startedAt: daysAgo(9),
        durationSeconds: 600,
        lastOutput: "Error: unable to reach host — deploy target unreachable, aborting diagnosis run.",
        prUrl: "",
        tokenUsage: 12_000,
        costUsd: 0.18,
      },
      {
        id: id(),
        projectId: pAtsak,
        taskId: taskSeeds.find((t) => t.title.includes("Kanban + table view"))!.id,
        agent: "claude",
        workingBranch: "main",
        status: "running",
        startedAt: minutesAgo(30),
        durationSeconds: 1800,
        lastOutput: "Wiring task detail drawer with acceptance criteria checklist...",
        prUrl: "",
        tokenUsage: 64_000,
        costUsd: 0.96,
      },
    ])
    .run();

  // -------------------------------------------------------------------
  // Scheduled jobs + job runs
  // -------------------------------------------------------------------
  type JobSeed = { id: string; projectId: string; name: string; description: string; cronExpression: string; timezone: string; command: string; isEnabled: boolean };

  const jobSeeds: JobSeed[] = [
    {
      id: id(),
      projectId: pTaskboard,
      name: "Nightly DB backup",
      description: "Dumps Postgres to S3-compatible storage.",
      cronExpression: "0 3 * * *",
      timezone: "Australia/Sydney",
      command: "scripts/backup-db.sh",
      isEnabled: true,
    },
    {
      id: id(),
      projectId: pTaskboard,
      name: "Stale task reminder digest",
      description: "Emails a digest of tasks untouched for 7+ days.",
      cronExpression: "0 9 * * 1",
      timezone: "Australia/Sydney",
      command: "scripts/stale-task-digest.ts",
      isEnabled: true,
    },
    {
      id: id(),
      projectId: pGms,
      name: "Stripe reconciliation",
      description: "Reconciles Stripe charges against local billing records.",
      cronExpression: "0 */6 * * *",
      timezone: "UTC",
      command: "scripts/stripe-reconcile.ts",
      isEnabled: true,
    },
    {
      id: id(),
      projectId: pGms,
      name: "Class reminder SMS batch",
      description: "Sends SMS reminders 2h before each scheduled class.",
      cronExpression: "*/15 * * * *",
      timezone: "Australia/Sydney",
      command: "scripts/class-reminders.ts",
      isEnabled: true,
    },
    {
      id: id(),
      projectId: pGms,
      name: "Weekly usage report",
      description: "Generates a PDF usage report for gym owners.",
      cronExpression: "0 6 * * 1",
      timezone: "Australia/Sydney",
      command: "scripts/weekly-report.ts",
      isEnabled: false,
    },
    {
      id: id(),
      projectId: pWeatherApi,
      name: "Cache warm-up",
      description: "Pre-warms cache for top 500 queried locations.",
      cronExpression: "0 * * * *",
      timezone: "UTC",
      command: "scripts/warm-cache.ts",
      isEnabled: true,
    },
    {
      id: id(),
      projectId: pWeatherApi,
      name: "Upstream health check",
      description: "Pings upstream weather API and records latency.",
      cronExpression: "*/5 * * * *",
      timezone: "UTC",
      command: "scripts/health-check.ts",
      isEnabled: true,
    },
    {
      id: id(),
      projectId: pInvoicer,
      name: "Overdue invoice sweep",
      description: "Flags invoices past due and queues reminder emails.",
      cronExpression: "0 8 * * *",
      timezone: "Australia/Sydney",
      command: "scripts/overdue-sweep.ts",
      isEnabled: true,
    },
    {
      id: id(),
      projectId: pInvoicer,
      name: "PDF cleanup",
      description: "Deletes generated PDF exports older than 30 days.",
      cronExpression: "0 4 1 * *",
      timezone: "Australia/Sydney",
      command: "scripts/pdf-cleanup.ts",
      isEnabled: true,
    },
    {
      id: id(),
      projectId: pAtsak,
      name: "GitHub metadata sync (mock)",
      description: "Would sync issues/branches/PRs from the GitHub adapter into the local index.",
      cronExpression: "*/30 * * * *",
      timezone: "UTC",
      command: "scripts/sync-github.ts",
      isEnabled: true,
    },
  ];

  db.insert(scheduledJobs)
    .values(
      jobSeeds.map((j) => ({
        id: j.id,
        projectId: j.projectId,
        name: j.name,
        description: j.description,
        cronExpression: j.cronExpression,
        timezone: j.timezone,
        command: j.command,
        isEnabled: j.isEnabled,
        lastRunAt: null as Date | null,
        nextRunAt: null as Date | null,
        lastDurationSeconds: 0,
        lastExitStatus: "",
        failureCount: 0,
        status: "never_run",
      }))
    )
    .run();

  // Generate run history per job and update job summary fields
  const jobRunRows: {
    id: string;
    jobId: string;
    startedAt: Date;
    durationSeconds: number;
    exitStatus: string;
    logs: string;
  }[] = [];

  const nightlyBackup = jobSeeds[0];
  const staleDigest = jobSeeds[1];
  const stripeRecon = jobSeeds[2];
  const smsBatch = jobSeeds[3];
  const weeklyReport = jobSeeds[4];
  const cacheWarm = jobSeeds[5];
  const healthCheck = jobSeeds[6];
  const overdueSweep = jobSeeds[7];
  const pdfCleanup = jobSeeds[8];
  const githubSync = jobSeeds[9];

  function addRuns(job: JobSeed, runs: { startedAt: Date; durationSeconds: number; exitStatus: string; logs: string }[]) {
    for (const r of runs) {
      jobRunRows.push({ id: id(), jobId: job.id, ...r });
    }
  }

  addRuns(nightlyBackup, [
    { startedAt: hoursAgo(21), durationSeconds: 145, exitStatus: "success", logs: "Backup completed: 84MB dumped to s3://backups/taskboard/2026-08-13.sql.gz" },
    { startedAt: hoursAgo(45), durationSeconds: 139, exitStatus: "success", logs: "Backup completed: 83MB dumped to s3://backups/taskboard/2026-08-12.sql.gz" },
    { startedAt: hoursAgo(69), durationSeconds: 151, exitStatus: "success", logs: "Backup completed: 83MB dumped to s3://backups/taskboard/2026-08-11.sql.gz" },
  ]);
  addRuns(staleDigest, [
    { startedAt: daysAgo(6), durationSeconds: 12, exitStatus: "success", logs: "Digest sent to 1 recipient: 3 stale tasks found." },
    { startedAt: daysAgo(13), durationSeconds: 9, exitStatus: "success", logs: "Digest sent to 1 recipient: 1 stale task found." },
  ]);
  addRuns(stripeRecon, [
    { startedAt: hoursAgo(2), durationSeconds: 38, exitStatus: "success", logs: "Reconciled 214 charges, 0 discrepancies." },
    { startedAt: hoursAgo(8), durationSeconds: 41, exitStatus: "success", logs: "Reconciled 209 charges, 0 discrepancies." },
    { startedAt: hoursAgo(14), durationSeconds: 44, exitStatus: "failure", logs: "Error: Stripe API rate limited (429). Retrying next cycle." },
  ]);
  addRuns(smsBatch, [
    { startedAt: minutesAgo(10), durationSeconds: 4, exitStatus: "success", logs: "Sent 6 SMS reminders." },
    { startedAt: minutesAgo(25), durationSeconds: 3, exitStatus: "success", logs: "Sent 2 SMS reminders." },
    { startedAt: minutesAgo(40), durationSeconds: 5, exitStatus: "success", logs: "Sent 9 SMS reminders." },
  ]);
  addRuns(weeklyReport, [
    { startedAt: daysAgo(14), durationSeconds: 210, exitStatus: "success", logs: "Report generated for 12 gyms." },
  ]);
  addRuns(cacheWarm, [
    { startedAt: hoursAgo(1), durationSeconds: 22, exitStatus: "success", logs: "Warmed 500/500 locations." },
    { startedAt: hoursAgo(2), durationSeconds: 25, exitStatus: "success", logs: "Warmed 500/500 locations." },
  ]);
  addRuns(healthCheck, [
    { startedAt: minutesAgo(5), durationSeconds: 1, exitStatus: "success", logs: "Upstream latency: 118ms" },
    { startedAt: minutesAgo(10), durationSeconds: 1, exitStatus: "success", logs: "Upstream latency: 122ms" },
    { startedAt: minutesAgo(15), durationSeconds: 3, exitStatus: "failure", logs: "Upstream timeout after 3000ms" },
  ]);
  addRuns(overdueSweep, [
    { startedAt: daysAgo(9), durationSeconds: 6, exitStatus: "failure", logs: "Error: SMTP connection refused — deploy target down." },
    { startedAt: daysAgo(10), durationSeconds: 8, exitStatus: "success", logs: "Flagged 3 overdue invoices, queued reminders." },
  ]);
  addRuns(pdfCleanup, [
    { startedAt: daysAgo(20), durationSeconds: 15, exitStatus: "success", logs: "Deleted 42 stale PDF exports." },
  ]);
  addRuns(githubSync, [
    { startedAt: minutesAgo(12), durationSeconds: 2, exitStatus: "success", logs: "Synced 5 issues, 3 branches, 2 PRs (mock adapter)." },
  ]);

  db.insert(jobRuns).values(jobRunRows).run();

  // Update job summary fields based on most recent run per job
  const byJob = new Map<string, typeof jobRunRows>();
  for (const r of jobRunRows) {
    if (!byJob.has(r.jobId)) byJob.set(r.jobId, []);
    byJob.get(r.jobId)!.push(r);
  }
  for (const job of jobSeeds) {
    const runs = (byJob.get(job.id) ?? []).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    const latest = runs[0];
    const failureCount = runs.filter((r) => r.exitStatus === "failure").length;
    let status: string;
    if (!job.isEnabled) status = "disabled";
    else if (!latest) status = "never_run";
    else if (latest.exitStatus === "failure") status = "failed";
    else status = "healthy";

    const nextRun = job.isEnabled ? minutesAgo(-Math.floor(Math.random() * 120) - 5) : null; // future time

    sqlite
      .prepare(
        `UPDATE scheduled_jobs SET last_run_at = ?, next_run_at = ?, last_duration_seconds = ?, last_exit_status = ?, failure_count = ?, status = ? WHERE id = ?`
      )
      .run(
        latest ? Math.floor(latest.startedAt.getTime() / 1000) : null,
        nextRun ? Math.floor(nextRun.getTime() / 1000) : null,
        latest ? latest.durationSeconds : 0,
        latest ? latest.exitStatus : "",
        failureCount,
        status,
        job.id
      );
  }
  // Mark the "running" scheduled job for AI-session parity on Taskboard's stale digest to show a running state
  sqlite.prepare(`UPDATE scheduled_jobs SET status = 'running' WHERE id = ?`).run(cacheWarm.id);

  // -------------------------------------------------------------------
  // Deployments
  // -------------------------------------------------------------------
  db.insert(deployments)
    .values([
      { id: id(), projectId: pTaskboard, environment: "production", status: "success", url: "https://task.ranu.win", deployedAt: hoursAgo(20), commitSha: "a1b2c3d" },
      { id: id(), projectId: pTaskboard, environment: "production", status: "success", url: "https://task.ranu.win", deployedAt: daysAgo(3), commitSha: "9f8e7d6" },
      { id: id(), projectId: pGms, environment: "production", status: "success", url: "https://gms.ranu.win", deployedAt: hoursAgo(6), commitSha: "5c4d3e2" },
      { id: id(), projectId: pGms, environment: "staging", status: "success", url: "https://staging.gms.ranu.win", deployedAt: hoursAgo(2), commitSha: "1a2b3c4" },
      { id: id(), projectId: pAtsak, environment: "preview", status: "in_progress", url: "", deployedAt: minutesAgo(5), commitSha: "0d0e0f1" },
      { id: id(), projectId: pWeatherApi, environment: "production", status: "success", url: "https://weather-proxy.ranu.win", deployedAt: daysAgo(2), commitSha: "7g8h9i0" },
      { id: id(), projectId: pInvoicer, environment: "production", status: "failed", url: "https://invoicer.ranu.win", deployedAt: daysAgo(9), commitSha: "b2c3d4e" },
    ])
    .run();

  // -------------------------------------------------------------------
  // Activities
  // -------------------------------------------------------------------
  db.insert(activities)
    .values([
      { id: id(), projectId: pTaskboard, type: "agent_started", message: "Claude started work on 'Add recurring task support'", createdAt: hoursAgo(1), relatedTaskId: recurringTask.id },
      { id: id(), projectId: pTaskboard, type: "task_updated", message: "PR #139 opened for 'MCP tool: bulk task reassignment'", createdAt: hoursAgo(8), relatedTaskId: null },
      { id: id(), projectId: pTaskboard, type: "deployment", message: "Deployed production a1b2c3d", createdAt: hoursAgo(20), relatedTaskId: null },
      { id: id(), projectId: pTaskboard, type: "job_run", message: "Nightly DB backup completed successfully (145s)", createdAt: hoursAgo(21), relatedTaskId: null },
      { id: id(), projectId: pGms, type: "agent_started", message: "Claude started work on 'web-v2: desktop min-width layout for member list'", createdAt: hoursAgo(4), relatedTaskId: null },
      { id: id(), projectId: pGms, type: "task_updated", message: "PR #412 opened: Stripe webhook signature verification hardening", createdAt: hoursAgo(6), relatedTaskId: null },
      { id: id(), projectId: pGms, type: "job_run", message: "Stripe reconciliation failed: rate limited (429)", createdAt: hoursAgo(14), relatedTaskId: null },
      { id: id(), projectId: pGms, type: "deployment", message: "Deployed staging 1a2b3c4", createdAt: hoursAgo(2), relatedTaskId: null },
      { id: id(), projectId: pAtsak, type: "task_created", message: "Created task 'Dockerfile + docker-compose for single-port deploy'", createdAt: minutesAgo(45), relatedTaskId: null },
      { id: id(), projectId: pAtsak, type: "agent_started", message: "Claude started work on 'Build Kanban + table view for All Tasks page'", createdAt: minutesAgo(30), relatedTaskId: null },
      { id: id(), projectId: pAtsak, type: "deployment", message: "Preview deployment triggered 0d0e0f1", createdAt: minutesAgo(5), relatedTaskId: null },
      { id: id(), projectId: pWeatherApi, type: "agent_completed", message: "Claude completed 'Investigate intermittent 502s from upstream', PR #61 opened", createdAt: hoursAgo(11), relatedTaskId: null },
      { id: id(), projectId: pWeatherApi, type: "job_run", message: "Upstream health check failed: timeout after 3000ms", createdAt: minutesAgo(15), relatedTaskId: null },
      { id: id(), projectId: pInvoicer, type: "job_run", message: "Overdue invoice sweep failed: SMTP connection refused", createdAt: daysAgo(9), relatedTaskId: null },
      { id: id(), projectId: pInvoicer, type: "agent_started", message: "Claude attempted deploy diagnosis, failed: host unreachable", createdAt: daysAgo(9), relatedTaskId: null },
    ])
    .run();

  // -------------------------------------------------------------------
  // Settings
  // -------------------------------------------------------------------
  db.insert(settings)
    .values([
      { key: "default_timezone", value: "Australia/Sydney" },
      { key: "github_token", value: "" },
      { key: "app_name", value: "Atsak" },
    ])
    .run();

  console.log("Seed complete:", {
    projects: 5,
    tasks: taskSeeds.length,
    specifications: specSeeds.length,
    jobRuns: jobRunRows.length,
  });
}

// Allow running directly via `npm run db:seed`
const isMain = process.argv[1] && process.argv[1].endsWith("seed.ts");
if (isMain) {
  seed();
}
