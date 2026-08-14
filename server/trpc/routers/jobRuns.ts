import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { jobRuns } from "../../db/schema.js";

export const jobRunsRouter = router({
  list: publicProcedure.input(z.object({ jobId: z.string() })).query(async ({ input }) => {
    const rows = await db.select().from(jobRuns).where(eq(jobRuns.jobId, input.jobId)).all();
    return rows.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }),
});
