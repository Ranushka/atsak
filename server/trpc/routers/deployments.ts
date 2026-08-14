import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { deployments } from "../../db/schema.js";

export const deploymentsRouter = router({
  list: publicProcedure.input(z.object({ projectId: z.string().optional() }).optional()).query(async ({ input }) => {
    let rows = await db.select().from(deployments).all();
    if (input?.projectId) rows = rows.filter((d) => d.projectId === input.projectId);
    return rows.sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime());
  }),
});
