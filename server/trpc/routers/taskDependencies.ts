import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { taskDependencies } from "../../db/schema.js";

export const taskDependenciesRouter = router({
  list: publicProcedure.input(z.object({ taskId: z.string() })).query(async ({ input }) => {
    return db.select().from(taskDependencies).where(eq(taskDependencies.taskId, input.taskId)).all();
  }),

  create: publicProcedure
    .input(z.object({ taskId: z.string(), dependsOnTaskId: z.string() }))
    .mutation(async ({ input }) => {
      const id = randomUUID();
      await db.insert(taskDependencies).values({ id, ...input }).run();
      return { id };
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(taskDependencies).where(eq(taskDependencies.id, input.id)).run();
    return { id: input.id };
  }),
});
