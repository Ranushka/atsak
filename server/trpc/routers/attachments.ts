import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { attachments } from "../../db/schema.js";

const entityType = z.enum(["specification", "task"]);

export const attachmentsRouter = router({
  list: publicProcedure.input(z.object({ entityType, entityId: z.string() })).query(async ({ input }) => {
    const rows = await db
      .select()
      .from(attachments)
      .where(and(eq(attachments.entityType, input.entityType), eq(attachments.entityId, input.entityId)))
      .all();
    return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }),

  create: publicProcedure
    .input(
      z.object({
        entityType,
        entityId: z.string(),
        filename: z.string().min(1),
        mimeType: z.string().min(1),
        dataBase64: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const id = randomUUID();
      await db.insert(attachments).values({ id, ...input, createdAt: new Date() }).run();
      return { id };
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(attachments).where(eq(attachments.id, input.id)).run();
    return { id: input.id };
  }),
});
