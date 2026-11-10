# Test Strategy
- `node scripts/validate.mjs`: required files, 23-family export contract, shared/static
  CSS drift, registry schema + metadata, preview files, catalog and Gallery data.
- `node scripts/validate-skill.mjs`: Skill structure, metadata, manifest and live project health.
- `node scripts/test-cli.mjs`: React, Vue and static scaffolding smoke tests.
- `node scripts/test-cli.mjs --compile`: full 144 scaffolds plus 96 generated
  React/Vue source typechecks and individual Vite bundles, using example toolchains.
- After install: `pnpm typecheck && pnpm build`.

## 2026-11-10 / R001

- `pnpm test`: token drift, registry, Skill, 144 CLI scaffolds and 20 Vitest cases.
- Vitest: React/Vue Tabs + Modal integration; shared focus filtering, boundary
  wrapping, hidden/inert/disabled ancestors, container and empty-list fallback.
- `pnpm typecheck` and `pnpm build`: passed; no build warnings observed.
- jsdom only; manual browser, four responsive widths, screen reader, touch/DPI
  and approved visual baselines remain NOT_RUN. See `VALIDATION.md`.

## 2026-11-10 / R002

`pnpm test` now includes the compiler/bundler matrix and 30 Vitest cases,
including CLI error paths, semantic HTML and nonempty-target preservation.
`pnpm typecheck` / `pnpm build` pass. Independent installation and generated
package-script builds remain NOT_RUN; shared workspace dependencies are used.

## 2026-11-10 / R003

`pnpm test` passes 50 Vitest cases, including 20 repository fixture cases that
exercise validator exit codes and diagnostics. It also validates 144 scaffolds
and 96 generated React/Vue typechecks/bundles. `pnpm typecheck` / `pnpm build`
pass without observed warnings. Export checks cover names, not full type/API
parity; preview HTML checks remain structural rather than parser/browser based.

## 2026-11-10 / R004

Optional static Tabs enhancement now provides horizontal arrows, wrap, Home/End,
roving tabindex and linked panels. Cleanup restores the original readable
link/section markup. Native dialog enhancement delegates modality to showModal,
handles cancel/close and restores opener focus; cleanup detaches listeners.
The Gallery builds and links a standalone static example. Shared/static styles
use one semantic overlay token; React/Vue/Tailwind consume the same CSS.

`pnpm test`: PASS (57 Vitest cases, 144 scaffolds, 96 generated bundles).
`pnpm typecheck` / `pnpm build`: PASS; no warnings observed.
jsdom dialog methods are test doubles: native Tab trapping, inert, Escape key
delivery and visual parity remain NOT_RUN in a real browser. Human responsive
review at 360/768/1280/1536, screen readers, physical touch/DPI and approved
visual baselines remain NOT_RUN. No publication or release was performed.

## 2026-11-10 / R005

A shared React/Vue DOM behavior suite initially reproduced 11 failed cases.
Both frameworks now default Button to type=button (explicit submit supported),
replace loading content and expose aria-busy, support disabled/native Switch
attributes and controlled/uncontrolled state, and use one bounded pagination
window. Vue Progress shares nonfinite handling; Checkbox native attrs now reach
the input. Form labels, native attributes and model updates have parity coverage.
Gallery adds interactive form, progress-boundary and page-10 examples; appearance
still uses unchanged shared/static CSS and semantic tokens across all adapters.

`pnpm test`: PASS (98 Vitest cases, 144 scaffolds, 96 generated bundles).
`pnpm typecheck` / `pnpm build`: PASS; no warnings observed.
DOM activation tests do not prove real-browser Space/Enter or native Tab behavior.
Human browser review at 360/768/1280/1536, screenshots, screen readers, physical
touch/DPI and approved visual baselines remain NOT_RUN. No npm/release/deployment.

## 2026-11-10 / R006

Semantic switch and Gallery code tokens, stronger input/muted colors and an
opaque focus ring now have unrounded light/dark contrast calculations (4.5:1
text, 3:1 tested indicators). Overlay already moved to a semantic token in R004.
Shared/static CSS and generated token files remain aligned across adapters.
Gallery search, status announcements, navigation/tablist names, heading order
and main landmark are covered. Initial R006 tests reproduced 8 failed cases.

`pnpm test`: PASS (110 Vitest cases, 144 scaffolds, 96 generated bundles).
`pnpm typecheck` / `pnpm build`: PASS; no build warnings observed.
Axe scans light/dark Gallery Buttons/form/Pricing/open-Modal states plus the
static example before/after Tabs enhancement, with an unnamed-control negative
fixture. Color-contrast and canvas-dependent label-content-name-mismatch are
explicitly disabled; landmark-one-main / page-has-heading-one incomplete results
are explicitly allowed pending browser visibility checks. New incomplete IDs
and all enabled-rule violations fail. See docs/ACCESSIBILITY.md for exact scope.

NOT_RUN: human real-browser review at 360/768/1280/1536, native dialog Tab/inert/
Escape, rendered contrast/label-content-name checks, image/gradient contrast,
screen readers, physical touch/DPI, cross-framework screenshots, full WCAG AA
audit and human-approved visual baselines. R007–R010 and independent scaffold
installation remain open. No npm publication, release, deployment or settings
change was performed.
