import { router } from "./trpc.js";
import { projectsRouter } from "./routers/projects.js";
import { tasksRouter } from "./routers/tasks.js";
import { taskDependenciesRouter } from "./routers/taskDependencies.js";
import { specificationsRouter } from "./routers/specifications.js";
import { attachmentsRouter } from "./routers/attachments.js";
import { agentSessionsRouter } from "./routers/agentSessions.js";
import { scheduledJobsRouter } from "./routers/scheduledJobs.js";
import { jobRunsRouter } from "./routers/jobRuns.js";
import { deploymentsRouter } from "./routers/deployments.js";
import { activitiesRouter } from "./routers/activities.js";
import { settingsRouter } from "./routers/settings.js";
import { githubRouter } from "./routers/github.js";
import { dashboardRouter } from "./routers/dashboard.js";

export const appRouter = router({
  projects: projectsRouter,
  tasks: tasksRouter,
  taskDependencies: taskDependenciesRouter,
  specifications: specificationsRouter,
  attachments: attachmentsRouter,
  agentSessions: agentSessionsRouter,
  scheduledJobs: scheduledJobsRouter,
  jobRuns: jobRunsRouter,
  deployments: deploymentsRouter,
  activities: activitiesRouter,
  settings: settingsRouter,
  github: githubRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
