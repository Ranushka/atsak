import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { scheduledJobs, jobRuns } from "../../db/schema.js";

const jobInput = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  description: z.string().default(""),
  cronExpression: z.string().min(1),
  timezone: z.string().default("UTC"),
  command: z.string().default(""),
  isEnabled: z.boolean().default(true),
});

export const scheduledJobsRouter = router({
  list: publicProcedure.input(z.object({ projectId: z.string().optional() }).optional()).query(async ({ input }) => {
    let rows = await db.select().from(scheduledJobs).all();
    if (input?.projectId) rows = rows.filter((j) => j.projectId === input.projectId);
    return rows;
  }),

  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const job = await db.select().from(scheduledJobs).where(eq(scheduledJobs.id, input.id)).get();
    if (!job) throw new Error("Job not found");
    return job;
  }),

  create: publicProcedure.input(jobInput).mutation(async ({ input }) => {
    const id = randomUUID();
    await db
      .insert(scheduledJobs)
      .values({ id, ...input, status: input.isEnabled ? "never_run" : "disabled" })
      .run();
    return { id };
  }),

  update: publicProcedure
    .input(jobInput.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      await db.update(scheduledJobs).set(rest).where(eq(scheduledJobs.id, id)).run();
      return { id };
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(scheduledJobs).where(eq(scheduledJobs.id, input.id)).run();
    return { id: input.id };
  }),

  toggleEnabled: publicProcedure
    .input(z.object({ id: z.string(), isEnabled: z.boolean() }))
    .mutation(async ({ input }) => {
      await db
        .update(scheduledJobs)
        .set({ isEnabled: input.isEnabled, status: input.isEnabled ? "healthy" : "disabled" })
        .where(eq(scheduledJobs.id, input.id))
        .run();
      return { id: input.id };
    }),

  runNow: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const job = await db.select().from(scheduledJobs).where(eq(scheduledJobs.id, input.id)).get();
    if (!job) throw new Error("Job not found");

    const startedAt = new Date();
    const durationSeconds = 2 + Math.floor(Math.random() * 30);
    const success = Math.random() > 0.15;
    const runId = randomUUID();

    await db
      .insert(jobRuns)
      .values({
        id: runId,
        jobId: job.id,
        startedAt,
        durationSeconds,
        exitStatus: success ? "success" : "failure",
        logs: success
          ? `Manual run triggered. Job "${job.name}" completed successfully.`
          : `Manual run triggered. Job "${job.name}" failed: simulated error.`,
      })
      .run();

    await db
      .update(scheduledJobs)
      .set({
        lastRunAt: startedAt,
        lastDurationSeconds: durationSeconds,
        lastExitStatus: success ? "success" : "failure",
        failureCount: success ? job.failureCount : job.failureCount + 1,
        status: success ? "healthy" : "failed",
      })
      .where(eq(scheduledJobs.id, job.id))
      .run();

    return { id: runId, exitStatus: success ? "success" : "failure" };
  }),
});
