import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { tasks, taskDependencies, taskSpecifications, specifications } from "../../db/schema.js";

const acceptanceCriterionSchema = z.object({ text: z.string(), done: z.boolean() });

const taskInput = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().default(""),
  status: z.enum(["backlog", "ready", "in_progress", "review", "blocked", "done"]).default("backlog"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  type: z.enum(["feature", "bug", "chore", "spec"]).default("feature"),
  labels: z.array(z.string()).default([]),
  assignee: z.string().default(""),
  githubIssueUrl: z.string().default(""),
  githubBranch: z.string().default(""),
  githubPrUrl: z.string().default(""),
  acceptanceCriteria: z.array(acceptanceCriterionSchema).default([]),
  agentExecutionStatus: z.string().default(""),
});

export const tasksRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          projectId: z.string().optional(),
          status: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      let rows = await db.select().from(tasks).all();
      if (input?.projectId) rows = rows.filter((t) => t.projectId === input.projectId);
      if (input?.status) rows = rows.filter((t) => t.status === input.status);
      return rows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }),

  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const task = await db.select().from(tasks).where(eq(tasks.id, input.id)).get();
    if (!task) throw new Error("Task not found");

    const deps = await db.select().from(taskDependencies).where(eq(taskDependencies.taskId, input.id)).all();
    const links = await db
      .select()
      .from(taskSpecifications)
      .where(eq(taskSpecifications.taskId, input.id))
      .all();
    const specIds = links.map((l) => l.specificationId);
    const linkedSpecs = specIds.length
      ? (await db.select().from(specifications).all()).filter((s) => specIds.includes(s.id))
      : [];

    return { ...task, dependsOnTaskIds: deps.map((d) => d.dependsOnTaskId), linkedSpecs };
  }),

  create: publicProcedure.input(taskInput).mutation(async ({ input }) => {
    const id = randomUUID();
    const now = new Date();
    await db
      .insert(tasks)
      .values({ id, ...input, createdAt: now, updatedAt: now })
      .run();
    return { id };
  }),

  update: publicProcedure
    .input(taskInput.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      await db
        .update(tasks)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(tasks.id, id))
        .run();
      return { id };
    }),

  updateStatus: publicProcedure
    .input(z.object({ id: z.string(), status: z.enum(["backlog", "ready", "in_progress", "review", "blocked", "done"]) }))
    .mutation(async ({ input }) => {
      await db
        .update(tasks)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(tasks.id, input.id))
        .run();
      return { id: input.id };
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(tasks).where(eq(tasks.id, input.id)).run();
    return { id: input.id };
  }),
});
