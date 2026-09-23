# Qashio Design System — Implementation Plan

## Decisions

- **Atomic Design** organisation over a flat component list — makes dependency direction
  explicit and gives Figma a matching vocabulary.
- **MIT-only dependencies.** Tailwind Plus / Catalyst is explicitly excluded: its license
  forbids redistributing it as a UI library, which is exactly what this repo is.
- **No Storybook.** A playground app (`apps/playground`) recreating the real Qashio 360
  admin shell gives a more realistic review surface than isolated stories, for one extra
  app to maintain instead of two build systems.
- **RTL and dark mode from day one**, not retrofitted — logical CSS and semantic tokens are
  cheap to get right up front and expensive to bolt on later.
- **Style Dictionary v5** for token build, DTCG JSON as the source of truth, so Figma's
  token export format maps 1:1 onto the repo.
- **pnpm workspaces + Changesets**, no Turborepo/Nx — the dependency graph (tokens → ui →
  finance-ui) is a straight line; a full build orchestrator would be overhead.

## Status

All three packages (`@qashio/tokens`, `@qashio/ui`, `@qashio/finance-ui`) and the
playground app are scaffolded and building. 17 unit tests cover the components with real
logic (`Button`, `Pagination`/`pageRange`, `DataTable`, `Amount`, `StatusPill`).

## Architecture

```
┌─────────────┐
│   tokens    │  DTCG JSON → Style Dictionary → dist/tokens.css, dist/theme.css
└──────┬──────┘
       │ @theme mapping
┌──────▼──────┐
│     ui      │  atoms/molecules/organisms/templates, Radix + CVA + Tailwind v4
└──────┬──────┘
       │
┌──────▼──────┐
│ finance-ui  │  Amount, StatusPill, CardMask, CountryPill, flags — Qashio-domain only
└──────┬──────┘
       │
┌──────▼──────┐
│ playground  │  Vite + React 19 demo app; hash-routed; not published
└─────────────┘
```

## Phased plan (6 phases / 12 weeks)

1. **Weeks 1–2 — Tokens & tooling.** Finalise primitive/semantic token shape, Style
   Dictionary build, workspace/tsconfig/lint scaffolding. *(done — placeholder gold palette)*
2. **Weeks 3–5 — Atoms & molecules.** Button, Input, Badge, Avatar, form controls, dropdown
   menu family, pagination, search. *(done)*
3. **Weeks 6–8 — Organisms & templates.** Sidebar, AppRail, Topbar, DataTable,
   TablePagination, AdminLayout. *(done)*
4. **Weeks 9–10 — Domain layer & playground.** `finance-ui`, the Qashio 360 shell
   recreation, CompaniesPage with the full toolbar/table, ComponentsPage gallery. *(done)*
5. **Week 11 — Figma brand handoff.** Swap the placeholder gold palette for real Figma
   token values; verify naming parity holds; no component code should need to change.
6. **Week 12 — Hardening & release.** Accessibility pass (focus order, ARIA on
   Sidebar/DataTable/DropdownMenu), visual QA in both themes/directions, first tagged
   release via Changesets, Dokploy deploy.

## Figma workflow

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md#figma--code-token-workflow) for the token
export/import loop and naming-parity convention.

## Deployment

Static build served by nginx in Docker, hosted on the home Dokploy instance as a Compose
app (`docker-compose.yml`, single `web` service, no host ports). Domain `atsak.ranu.win`,
Let's Encrypt HTTPS, auto-deploy on push via Git webhook — same pattern as the `ourmenu`
project on the same host.

## Risks

- **Placeholder brand palette.** The gold scale is sampled from screenshots, not Figma
  source values — every screen currently reflects an approximation.
- **`radix-ui` unified package is young.** Pin the exact version; watch for breaking changes
  across primitives bundled in one package rather than many independent ones.
- **Tailwind v4 automatic source detection** across a pnpm workspace needs verifying in a
  real consumer app outside this monorepo (explicit `@source` directives are the fallback).
- **No visual regression tooling yet** — theme/direction combinations (light/dark ×
  LTR/RTL) are currently reviewed manually in the playground.

## Open questions for Qashio

- Real brand token values (gold scale, any secondary brand color) from Figma.
- Which teams/apps consume this first — determines how conservative the v1→v2 API surface
  needs to be before wider adoption.
- Arabic content/localization ownership: does `finance-ui` need Arabic status/label copy,
  or does that live in the consuming app?
- Any existing internal npm registry preference over GitHub Packages (`.npmrc` currently
  points at `npm.pkg.github.com`, commented out).

## Next steps

- Replace the placeholder gold palette once Figma values are ready.
- Add visual regression coverage (theme × direction matrix) before the first external
  consumer integrates.
- Expand `finance-ui` domain coverage as new Qashio 360 screens are recreated in the
  playground (Cards, Approvals, Kyb Users are stubbed as "Not built yet" routes today).
