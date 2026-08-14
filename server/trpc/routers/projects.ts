import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { projects, tasks, agentSessions, scheduledJobs } from "../../db/schema.js";

const projectInput = z.object({
  name: z.string().min(1),
  githubRepo: z.string().min(1),
  description: z.string().default(""),
  techStack: z.array(z.string()).default([]),
  defaultBranch: z.string().default("main"),
  localWorkingDir: z.string().default(""),
  currentMilestone: z.string().default(""),
  deploymentStatus: z.string().default("unknown"),
  deploymentUrl: z.string().default(""),
});

export const projectsRouter = router({
  list: publicProcedure.query(async () => {
    const allProjects = await db.select().from(projects).all();
    const allTasks = await db.select().from(tasks).all();
    const allSessions = await db.select().from(agentSessions).all();
    const allJobs = await db.select().from(scheduledJobs).all();

    return allProjects.map((p) => {
      const projectTasks = allTasks.filter((t) => t.projectId === p.id);
      const openTaskCount = projectTasks.filter((t) => t.status !== "done").length;
      const activeAgent = allSessions.find((s) => s.projectId === p.id && (s.status === "running" || s.status === "waiting"));
      const jobsForProject = allJobs.filter((j) => j.projectId === p.id);
      const failedJobs = jobsForProject.filter((j) => j.status === "failed").length;
      const jobHealth = jobsForProject.length === 0 ? "none" : failedJobs > 0 ? "failing" : "healthy";
      return {
        ...p,
        openTaskCount,
        activeAgent: activeAgent ? activeAgent.agent : null,
        jobHealth,
        jobFailedCount: failedJobs,
      };
    });
  }),

  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const project = await db.select().from(projects).where(eq(projects.id, input.id)).get();
    if (!project) throw new Error("Project not found");
    return project;
  }),

  create: publicProcedure.input(projectInput).mutation(async ({ input }) => {
    const id = randomUUID();
    const now = new Date();
    await db
      .insert(projects)
      .values({ id, ...input, lastActivityAt: now, createdAt: now })
      .run();
    return { id };
  }),

  update: publicProcedure
    .input(projectInput.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      await db.update(projects).set(rest).where(eq(projects.id, id)).run();
      return { id };
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(projects).where(eq(projects.id, input.id)).run();
    return { id: input.id };
  }),
});
