import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { specifications, taskSpecifications, tasks } from "../../db/schema.js";

const specInput = z.object({
  projectId: z.string(),
  filename: z.string().min(1),
  path: z.string().min(1),
  category: z.enum(["product", "feature", "architecture", "api", "decision"]).default("product"),
  gitBranch: z.string().default("main"),
  summary: z.string().default(""),
  content: z.string().default(""),
});

// OpenSpec-style lifecycle: proposal (draft) -> applied (accepted source of
// truth) -> archived (superseded). No skipping backwards.
export const SPEC_STATUSES = ["proposal", "applied", "archived"] as const;
export type SpecStatus = (typeof SPEC_STATUSES)[number];

const LEGAL_STATUS_TRANSITIONS: Record<SpecStatus, SpecStatus[]> = {
  proposal: ["applied", "archived"],
  applied: ["archived"],
  archived: [],
};

export const specificationsRouter = router({
  list: publicProcedure.input(z.object({ projectId: z.string().optional() }).optional()).query(async ({ input }) => {
    let rows = await db.select().from(specifications).all();
    if (input?.projectId) rows = rows.filter((s) => s.projectId === input.projectId);
    return rows.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }),

  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const spec = await db.select().from(specifications).where(eq(specifications.id, input.id)).get();
    if (!spec) throw new Error("Specification not found");
    const links = await db.select().from(taskSpecifications).where(eq(taskSpecifications.specificationId, input.id)).all();
    const taskIds = links.map((l) => l.taskId);
    const linkedTasks = taskIds.length ? (await db.select().from(tasks).all()).filter((t) => taskIds.includes(t.id)) : [];
    return { ...spec, linkedTasks };
  }),

  create: publicProcedure.input(specInput).mutation(async ({ input }) => {
    const id = randomUUID();
    await db.insert(specifications).values({ id, ...input, lastUpdated: new Date() }).run();
    return { id };
  }),

  update: publicProcedure
    .input(specInput.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      await db
        .update(specifications)
        .set({ ...rest, lastUpdated: new Date() })
        .where(eq(specifications.id, id))
        .run();
      return { id };
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(specifications).where(eq(specifications.id, input.id)).run();
    return { id: input.id };
  }),

  updateStatus: publicProcedure
    .input(z.object({ id: z.string(), status: z.enum(SPEC_STATUSES) }))
    .mutation(async ({ input }) => {
      const spec = await db.select().from(specifications).where(eq(specifications.id, input.id)).get();
      if (!spec) throw new Error("Specification not found");

      const current = spec.status as SpecStatus;
      if (current === input.status) {
        return { id: input.id };
      }
      const allowed = LEGAL_STATUS_TRANSITIONS[current] ?? [];
      if (!allowed.includes(input.status)) {
        throw new Error(`Cannot transition specification from "${current}" to "${input.status}"`);
      }

      await db
        .update(specifications)
        .set({ status: input.status, lastUpdated: new Date() })
        .where(eq(specifications.id, input.id))
        .run();
      return { id: input.id };
    }),

  linkTask: publicProcedure
    .input(z.object({ specificationId: z.string(), taskId: z.string() }))
    .mutation(async ({ input }) => {
      const id = randomUUID();
      await db.insert(taskSpecifications).values({ id, ...input }).run();
      return { id };
    }),

  unlinkTask: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(taskSpecifications).where(eq(taskSpecifications.id, input.id)).run();
    return { id: input.id };
  }),
});
