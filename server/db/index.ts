import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "atsak.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };

// Creates tables directly (no migration files) — fine for this self-hosted
// single-tenant app. Idempotent: safe to call on every boot.
export function ensureSchema() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      github_repo TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      tech_stack TEXT NOT NULL DEFAULT '[]',
      default_branch TEXT NOT NULL DEFAULT 'main',
      local_working_dir TEXT NOT NULL DEFAULT '',
      current_milestone TEXT NOT NULL DEFAULT '',
      deployment_status TEXT NOT NULL DEFAULT 'unknown',
      deployment_url TEXT NOT NULL DEFAULT '',
      last_activity_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'backlog',
      priority TEXT NOT NULL DEFAULT 'medium',
      type TEXT NOT NULL DEFAULT 'feature',
      labels TEXT NOT NULL DEFAULT '[]',
      assignee TEXT NOT NULL DEFAULT '',
      github_issue_url TEXT NOT NULL DEFAULT '',
      github_branch TEXT NOT NULL DEFAULT '',
      github_pr_url TEXT NOT NULL DEFAULT '',
      acceptance_criteria TEXT NOT NULL DEFAULT '[]',
      agent_execution_status TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS task_dependencies (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      depends_on_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS specifications (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'product',
      status TEXT NOT NULL DEFAULT 'proposal',
      git_branch TEXT NOT NULL DEFAULT 'main',
      last_updated INTEGER NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS task_specifications (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      specification_id TEXT NOT NULL REFERENCES specifications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      data_base64 TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS agent_sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      agent TEXT NOT NULL,
      working_branch TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'queued',
      started_at INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      last_output TEXT NOT NULL DEFAULT '',
      pr_url TEXT NOT NULL DEFAULT '',
      token_usage INTEGER NOT NULL DEFAULT 0,
      cost_usd REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS scheduled_jobs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      cron_expression TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      command TEXT NOT NULL DEFAULT '',
      is_enabled INTEGER NOT NULL DEFAULT 1,
      last_run_at INTEGER,
      next_run_at INTEGER,
      last_duration_seconds INTEGER NOT NULL DEFAULT 0,
      last_exit_status TEXT NOT NULL DEFAULT '',
      failure_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'never_run'
    );

    CREATE TABLE IF NOT EXISTS job_runs (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
      started_at INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      exit_status TEXT NOT NULL DEFAULT 'success',
      logs TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      environment TEXT NOT NULL DEFAULT 'production',
      status TEXT NOT NULL DEFAULT 'success',
      url TEXT NOT NULL DEFAULT '',
      deployed_at INTEGER NOT NULL,
      commit_sha TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      related_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);

  // Defensive migration: `specifications.status` was added after the initial
  // release. CREATE TABLE IF NOT EXISTS above won't add it to an existing
  // on-disk DB, so backfill it here if missing.
  const specColumns = sqlite.prepare(`PRAGMA table_info(specifications)`).all() as { name: string }[];
  if (!specColumns.some((c) => c.name === "status")) {
    sqlite.exec(`ALTER TABLE specifications ADD COLUMN status TEXT NOT NULL DEFAULT 'proposal';`);
  }
}

export function isDatabaseEmpty(): boolean {
  const row = sqlite.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
  return row.count === 0;
}
