import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";
import { ensureSchema, isDatabaseEmpty } from "./db/index.js";
import { seed } from "./db/seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

ensureSchema();
if (isDatabaseEmpty()) {
  console.log("Database is empty — running seed script...");
  seed();
}

const app = express();
app.use(express.json());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Serve the built client as static files in production (single process,
// single port — see Dockerfile / docker-compose.yml).
const clientDist = path.resolve(__dirname, "..", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/trpc")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = Number(process.env.PORT ?? 3800);
app.listen(PORT, () => {
  console.log(`Atsak server listening on http://localhost:${PORT}`);
});
