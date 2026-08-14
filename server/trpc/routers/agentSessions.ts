import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { agentSessions } from "../../db/schema.js";

export const agentSessionsRouter = router({
  list: publicProcedure.input(z.object({ projectId: z.string().optional() }).optional()).query(async ({ input }) => {
    let rows = await db.select().from(agentSessions).all();
    if (input?.projectId) rows = rows.filter((s) => s.projectId === input.projectId);
    return rows.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }),

  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const session = await db.select().from(agentSessions).where(eq(agentSessions.id, input.id)).get();
    if (!session) throw new Error("Agent session not found");
    return session;
  }),

  start: publicProcedure
    .input(z.object({ projectId: z.string(), taskId: z.string().optional(), agent: z.string(), workingBranch: z.string().default("") }))
    .mutation(async ({ input }) => {
      const id = randomUUID();
      await db
        .insert(agentSessions)
        .values({
          id,
          projectId: input.projectId,
          taskId: input.taskId ?? null,
          agent: input.agent,
          workingBranch: input.workingBranch,
          status: "running",
          startedAt: new Date(),
          durationSeconds: 0,
          lastOutput: "Session started...",
          prUrl: "",
          tokenUsage: 0,
          costUsd: 0,
        })
        .run();
      return { id };
    }),

  stop: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.update(agentSessions).set({ status: "failed", lastOutput: "Session stopped by user." }).where(eq(agentSessions.id, input.id)).run();
    return { id: input.id };
  }),

  reopen: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db
      .update(agentSessions)
      .set({ status: "running", lastOutput: "Session reopened...", startedAt: new Date() })
      .where(eq(agentSessions.id, input.id))
      .run();
    return { id: input.id };
  }),
});
