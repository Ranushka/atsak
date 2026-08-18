import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Atsak database schema (Drizzle ORM / SQLite via better-sqlite3)
// ---------------------------------------------------------------------------
// NOTE on `specifications.content`: in a real integration, spec markdown
// bodies would live in the project's GitHub repo and be fetched on demand
// (keeping this DB a lightweight index/metadata store, not a source-code
// mirror). For this self-hosted demo/seed we also persist a `content`
// column so the Specifications page has something real to render without
// wiring actual GitHub API calls. Treat `content` here as a cache, not the
// source of truth — a production build should fetch+cache from GitHub and
// could TTL-expire this column instead of treating it as permanent storage.
// ---------------------------------------------------------------------------

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  githubRepo: text("github_repo").notNull(), // e.g. "owner/repo"
  description: text("description").notNull().default(""),
  techStack: text("tech_stack", { mode: "json" }).notNull().$type<string[]>().default(sql`'[]'`),
  defaultBranch: text("default_branch").notNull().default("main"),
  localWorkingDir: text("local_working_dir").notNull().default(""),
  currentMilestone: text("current_milestone").notNull().default(""),
  deploymentStatus: text("deployment_status").notNull().default("unknown"), // healthy/degraded/down/unknown
  deploymentUrl: text("deployment_url").notNull().default(""),
  lastActivityAt: integer("last_activity_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("backlog"), // backlog/ready/in_progress/review/blocked/done
  priority: text("priority").notNull().default("medium"), // low/medium/high/urgent
  type: text("type").notNull().default("feature"), // feature/bug/chore/spec
  labels: text("labels", { mode: "json" }).notNull().$type<string[]>().default(sql`'[]'`),
  assignee: text("assignee").notNull().default(""), // "human" | "claude" | "codex" | other agent name
  githubIssueUrl: text("github_issue_url").notNull().default(""),
  githubBranch: text("github_branch").notNull().default(""),
  githubPrUrl: text("github_pr_url").notNull().default(""),
  acceptanceCriteria: text("acceptance_criteria", { mode: "json" })
    .notNull()
    .$type<{ text: string; done: boolean }[]>()
    .default(sql`'[]'`),
  agentExecutionStatus: text("agent_execution_status").notNull().default(""), // free text summary
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const taskDependencies = sqliteTable("task_dependencies", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  dependsOnTaskId: text("depends_on_task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
});

export const specifications = sqliteTable("specifications", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  category: text("category").notNull().default("product"), // product/feature/architecture/api/decision
  status: text("status").notNull().default("proposal"), // proposal/applied/archived (OpenSpec-style lifecycle)
  gitBranch: text("git_branch").notNull().default("main"),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull(),
  summary: text("summary").notNull().default(""),
  // See schema-level note above re: caching markdown body for the demo only.
  content: text("content").notNull().default(""),
});

export const taskSpecifications = sqliteTable("task_specifications", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  specificationId: text("specification_id").notNull().references(() => specifications.id, { onDelete: "cascade" }),
});

// Basic image attachments for specs and tasks. Stored inline as base64 in
// SQLite rather than on disk — simplest thing that works for a self-hosted,
// low-volume demo app; revisit (object storage / disk + static serving) if
// attachment volume ever grows large.
export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(), // "specification" | "task"
  entityId: text("entity_id").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  dataBase64: text("data_base64").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const agentSessions = sqliteTable("agent_sessions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
  agent: text("agent").notNull(), // claude/codex/other
  workingBranch: text("working_branch").notNull().default(""),
  status: text("status").notNull().default("queued"), // queued/running/waiting/failed/completed
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  lastOutput: text("last_output").notNull().default(""),
  prUrl: text("pr_url").notNull().default(""),
  tokenUsage: integer("token_usage").notNull().default(0),
  costUsd: real("cost_usd").notNull().default(0),
});

export const scheduledJobs = sqliteTable("scheduled_jobs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  cronExpression: text("cron_expression").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  command: text("command").notNull().default(""),
  isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
  lastRunAt: integer("last_run_at", { mode: "timestamp" }),
  nextRunAt: integer("next_run_at", { mode: "timestamp" }),
  lastDurationSeconds: integer("last_duration_seconds").notNull().default(0),
  lastExitStatus: text("last_exit_status").notNull().default(""), // success/failure/""
  failureCount: integer("failure_count").notNull().default(0),
  status: text("status").notNull().default("never_run"), // healthy/running/failed/disabled/never_run
});

export const jobRuns = sqliteTable("job_runs", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => scheduledJobs.id, { onDelete: "cascade" }),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  exitStatus: text("exit_status").notNull().default("success"), // success/failure
  logs: text("logs").notNull().default(""),
});

export const deployments = sqliteTable("deployments", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  environment: text("environment").notNull().default("production"), // production/staging/preview
  status: text("status").notNull().default("success"), // success/failed/in_progress
  url: text("url").notNull().default(""),
  deployedAt: integer("deployed_at", { mode: "timestamp" }).notNull(),
  commitSha: text("commit_sha").notNull().default(""),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // task_created/task_updated/agent_started/agent_completed/deployment/job_run/spec_updated/...
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  relatedTaskId: text("related_task_id").references(() => tasks.id, { onDelete: "set null" }),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

// ---------------------------------------------------------------------------
// Relations (used for convenient nested queries where helpful)
// ---------------------------------------------------------------------------

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  specifications: many(specifications),
  agentSessions: many(agentSessions),
  scheduledJobs: many(scheduledJobs),
  deployments: many(deployments),
  activities: many(activities),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  agentSessions: many(agentSessions),
  taskSpecifications: many(taskSpecifications),
}));

export const specificationsRelations = relations(specifications, ({ one, many }) => ({
  project: one(projects, { fields: [specifications.projectId], references: [projects.id] }),
  taskSpecifications: many(taskSpecifications),
}));

export const scheduledJobsRelations = relations(scheduledJobs, ({ one, many }) => ({
  project: one(projects, { fields: [scheduledJobs.projectId], references: [projects.id] }),
  runs: many(jobRuns),
}));

export const jobRunsRelations = relations(jobRuns, ({ one }) => ({
  job: one(scheduledJobs, { fields: [jobRuns.jobId], references: [scheduledJobs.id] }),
}));
