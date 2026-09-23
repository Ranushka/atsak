# Qashio Design System

A reusable React + Tailwind CSS v4 design system for Qashio (a UAE/KSA corporate-card and
spend-management fintech), organised by Atomic Design: tokens → atoms → molecules →
organisms → templates → pages.

Built entirely on MIT-licensed open source (Radix UI, TanStack Table, Lucide, Tailwind v4,
Style Dictionary, CVA, clsx, tailwind-merge) — Qashio owns the code outright. There is no
Storybook; the `apps/playground` app doubles as the living component gallery and demo.
RTL (Arabic) and dark mode are supported from day one.

## Packages

| Package | What it is |
| --- | --- |
| `@qashio/tokens` | DTCG design tokens (primitives + light/dark semantic), built to CSS custom properties and a Tailwind v4 `@theme` mapping with Style Dictionary. |
| `@qashio/ui` | Generic, brand-agnostic components: atoms, molecules, organisms, and one admin template. |
| `@qashio/finance-ui` | Qashio-specific domain components: `Amount`, `StatusPill`, `CardMask`, country flags/pills. |
| `apps/playground` | Vite + React demo app recreating the Qashio 360 admin shell, used instead of Storybook. |

## Getting started

```bash
corepack enable
pnpm install
pnpm build          # builds packages/* (tokens → ui → finance-ui)
pnpm test            # 17 unit tests across ui + finance-ui
pnpm typecheck
```

## Run locally

```bash
pnpm dev             # builds packages, then starts the playground on :5173
```

Open http://localhost:5173 — it defaults to `#/companies-pending-kyb`. Toggle theme and
direction from the gear icon at the bottom of the app rail.

## Deployment

Ships as a static site behind nginx. `pnpm build:playground` builds every package and then
the playground's `dist/`. The `Dockerfile` is a two-stage build (Node for the build, nginx
for serving); `docker-compose.yml` defines a single `web` service with no host ports.

Hosted on the home Dokploy instance as a Compose app. `atsak.ranu.win` points to the `web`
service on port 80 with Let's Encrypt HTTPS; auto-deploy runs on push via a Git webhook.

## Using it in another project

```bash
pnpm add @qashio/tokens @qashio/ui @qashio/finance-ui
```

```tsx
import "@qashio/ui/styles.css";
import { QdsProvider, Button } from "@qashio/ui";

function App() {
  return (
    <QdsProvider dir="ltr">
      <Button variant="brand">Approve</Button>
    </QdsProvider>
  );
}
```

Your app's Tailwind v4 build must be able to see classes used inside `@qashio/ui` /
`@qashio/finance-ui` — either via Tailwind's automatic source detection through your bundler,
or by adding explicit `@source` directives pointing at those packages.

## Publishing with Changesets

```bash
pnpm changeset          # describe the change
pnpm version-packages    # bump versions + changelogs
pnpm release             # build then `changeset publish`
```

`tokens`, `ui`, and `finance-ui` are version-linked (see `.changeset/config.json`) so they
always ship together; `apps/playground` is excluded from releases.

See also [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for the atomic structure and Figma→code
workflow, and [`PLAN.md`](./PLAN.md) for status and roadmap.
