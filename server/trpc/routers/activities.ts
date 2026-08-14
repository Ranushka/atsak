import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { activities } from "../../db/schema.js";

export const activitiesRouter = router({
  list: publicProcedure
    .input(z.object({ projectId: z.string().optional(), type: z.string().optional(), limit: z.number().default(200) }).optional())
    .query(async ({ input }) => {
      let rows = await db.select().from(activities).all();
      if (input?.projectId) rows = rows.filter((a) => a.projectId === input.projectId);
      if (input?.type) rows = rows.filter((a) => a.type === input.type);
      rows = rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return rows.slice(0, input?.limit ?? 200);
    }),
});
