# Design System Guide

## Atomic structure

```
tokens      color, radius, font primitives + semantic light/dark roles
atoms       Button, Input, Label, Badge, Avatar, Checkbox, Switch, Tooltip, Spinner, Skeleton, Separator
molecules   SearchInput, DropdownMenu, SegmentedControl, Pagination, NavItem
organisms   Sidebar, AppRail, Topbar, PageHeader, DataTable, TablePagination
templates   AdminLayout
pages       apps/playground/src/pages/* (consumer-owned, not published)
```

A component only depends on levels below it: molecules compose atoms, organisms compose
atoms + molecules, templates compose organisms. Nothing reaches sideways or up.

## Figma → code token workflow

1. Design tokens are authored in Figma using the same names as
   `packages/tokens/src/*.json` (DTCG format: `$type` / `$value`).
2. Export to the three JSON files: `primitives.json`, `semantic.light.json`,
   `semantic.dark.json`. Semantic tokens reference primitives with `{color.gold.600}`
   syntax — never hardcode a hex value in a semantic token.
3. `pnpm --filter @qashio/tokens build` regenerates `dist/tokens.css` (raw `--qds-*`
   variables) and `dist/theme.css` (the Tailwind v4 `@theme` mapping consumed by `ui` and
   `finance-ui`).
4. The current gold palette is a placeholder sampled from Qashio 360 screenshots — swap the
   values in `primitives.json` once real brand tokens land from Figma; nothing else changes.

## Naming parity

Figma component variants and code props use the same vocabulary, so a design handoff maps
directly onto a prop change:

```
Figma:  Button / variant=primary / size=sm
Code:   <Button variant="primary" size="sm">
```

This applies to every component with CVA variants (`Button`, `Badge`). Keep new variant
names identical on both sides — don't rename in code "for clarity."

## RTL rules

- Use logical CSS properties and Tailwind's logical utilities: `ms-`/`me-` (margin),
  `ps-`/`pe-` (padding), `start-`/`end-` (inset), never `ml-`/`mr-`/`left-`/`right-`.
  `text-start`/`text-end` instead of `text-left`/`text-right`.
- Directional icons (arrows, chevrons) get `rtl:-scale-x-100` so they flip with direction.
- `<QdsProvider dir="rtl">` drives every Radix primitive's internal direction (menus,
  tooltips, toggle groups); it must wrap the app root.
- Numeric/currency values (`Amount`, `CardMask`) are always rendered `dir="ltr"` and
  isolated, even inside an RTL page, so digit order never reverses.
- Table cells use `dir="auto"` so mixed Arabic/Latin content self-directs, while column
  alignment (`meta.align`) follows the page's own direction via logical `text-start`/`text-end`.

## Adding a new UI component

1. Decide its atomic level (atom/molecule/organism/template) from what it composes.
2. Build on Radix primitives where interaction/accessibility is non-trivial (menus,
   dialogs, toggles); plain atoms (Badge, Skeleton) don't need a primitive.
3. Use `cn()` (clsx + tailwind-merge) for class composition, never string concatenation.
4. Reference only semantic tokens (`bg-brand`, `text-muted-foreground`, `border-border`) —
   never a primitive color or a raw hex value.
5. Accept and forward `className` and spread remaining props onto the root element.
6. Export it from the package's `src/index.ts` barrel.
7. Add it to `apps/playground/src/pages/ComponentsPage.tsx` under the right section.
8. Add unit tests for any non-trivial logic (a `pageRange`-style helper, a formatting
   function, selection/visibility state).

### New-component checklist

- [ ] Correct atomic folder (`atoms` / `molecules` / `organisms` / `templates`)
- [ ] Semantic tokens only, no hardcoded colors
- [ ] Logical CSS (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`), `rtl:-scale-x-100` on directional icons
- [ ] `className` + prop spreading supported
- [ ] Exported from `src/index.ts`
- [ ] Added to the playground's Components gallery
- [ ] Tests for any logic beyond markup
