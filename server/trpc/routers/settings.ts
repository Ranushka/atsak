import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";

export const settingsRouter = router({
  list: publicProcedure.query(async () => {
    return db.select().from(settings).all();
  }),

  set: publicProcedure.input(z.object({ key: z.string(), value: z.string() })).mutation(async ({ input }) => {
    const existing = await db.select().from(settings).where(eq(settings.key, input.key)).get();
    if (existing) {
      await db.update(settings).set({ value: input.value }).where(eq(settings.key, input.key)).run();
    } else {
      await db.insert(settings).values(input).run();
    }
    return input;
  }),
});
