# syntax=docker/dockerfile:1

# ---- deps: install once, reused by build stage ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm install

# ---- build: compile the Vite client (server runs via tsx, no compile step needed) ----
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# ---- runtime: slim image with only what's needed to run ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3800

# better-sqlite3 needs a couple of runtime libs on slim images
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server ./server
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3800
CMD ["npm", "run", "start"]
