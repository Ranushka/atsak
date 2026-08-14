import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { projects, tasks, agentSessions, scheduledJobs, activities } from "../../db/schema.js";

export const dashboardRouter = router({
  overview: publicProcedure.query(async () => {
    const allProjects = await db.select().from(projects).all();
    const allTasks = await db.select().from(tasks).all();
    const allSessions = await db.select().from(agentSessions).all();
    const allJobs = await db.select().from(scheduledJobs).all();
    const recentActivities = (await db.select().from(activities).all())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 15);

    const tasksInProgress = allTasks.filter((t) => t.status === "in_progress").length;
    const tasksInReview = allTasks.filter((t) => t.status === "review").length;
    const runningAgents = allSessions.filter((s) => s.status === "running").length;
    const healthyJobs = allJobs.filter((j) => j.status === "healthy" || j.status === "running").length;
    const failedJobs = allJobs.filter((j) => j.status === "failed").length;

    const projectsRequiringAttention = allProjects
      .map((p) => {
        const projectJobs = allJobs.filter((j) => j.projectId === p.id);
        const projectFailedJobs = projectJobs.filter((j) => j.status === "failed");
        const blockedTasks = allTasks.filter((t) => t.projectId === p.id && t.status === "blocked");
        const reasons: string[] = [];
        if (p.deploymentStatus === "down") reasons.push("Deployment is down");
        if (p.deploymentStatus === "degraded") reasons.push("Deployment degraded");
        if (projectFailedJobs.length > 0) reasons.push(`${projectFailedJobs.length} scheduled job(s) failing`);
        if (blockedTasks.length > 0) reasons.push(`${blockedTasks.length} blocked task(s)`);
        return { project: p, reasons };
      })
      .filter((r) => r.reasons.length > 0);

    return {
      totalActiveProjects: allProjects.length,
      tasksInProgress,
      tasksInReview,
      runningAgents,
      healthyJobs,
      failedJobs,
      recentActivities,
      projectsRequiringAttention,
    };
  }),
});
