# Validation Report

Date: 2026-11-10

## Current automated evidence

Baseline `79aa7d1`: `pnpm test` passed (8 Vitest cases, 144 CLI scaffolds),
`pnpm typecheck` passed, `pnpm build` passed without warnings.

R001 / Modal focus eligibility:

- Before the fix, new regression cases reproduced 11 failures.
- `pnpm test`: PASS, 20 Vitest cases, 144 CLI scaffolds, token drift,
  registry/export checks and Skill validation.
- `pnpm typecheck`: PASS (core, React, Vue, Gallery).
- `pnpm build`: PASS (Gallery, React example, Vue example), no warnings observed.
- Shared focus helpers now exclude hidden/inert/aria-hidden ancestors,
  CSS-hidden controls, negative tabindex and disabled fieldset descendants.
  React and Vue both exercise the boundary behavior. Gallery demonstrates it.
- Styling is unchanged across React, Vue, Tailwind and static HTML.

R002 / CLI generated-project validation:

- Before the fix, React and Vue HTML-shell regression cases both failed.
- `pnpm test`: PASS, 30 Vitest cases; 144 CLI scaffolds checked for semantic
  document shell / metadata, all 48 static scripts syntax checked.
- All 96 React / Vue generated source trees typechecked (one program per
  framework, identical compiler settings verified) and individually bundled
  with Vite using installed example toolchains. Build warnings fail this gate.
- `pnpm typecheck` and `pnpm build`: PASS; no warnings observed.
- React outputs now declare React type dependencies. Both framework outputs
  include language, viewport, description and title. Shared CSS is unchanged.
- Invalid framework/template/name/missing values and nonempty target protection
  have Vitest coverage. Fixture creation and cleanup stay inside repo `tmp/`.

R003 / Repository contracts:

- The initial negative-fixture suite reproduced 17 failed expectations in the
  old validator (18 cases); the expanded suite now has 20 passing cases.
- The gate fixes the 23-family contract for both frameworks, permits exactly
  three React composition helpers, catches unexpected/duplicate named exports
  and re-export aliases, and verifies Vue source paths. This validates component
  export names, not complete TypeScript API or behavioral equivalence.
- Shared/static component CSS and each token import path are checked for drift.
- All 48 registry entries have schema, metadata JSON, preview-file, catalog and
  Gallery-data checks. Invalid slugs stop before preview path resolution; missing
  HTML and malformed JSON produce actionable failures.
- `pnpm test`: PASS, 50 Vitest cases plus 144 scaffolds and 96 generated bundles.
- `pnpm typecheck` and `pnpm build`: PASS; no warnings observed.
- Current preview checks remain structural string checks, **not** full HTML
  parser validation or browser validation. Those remain R009.

See [ROADMAP-001](docs/roadmap/ROADMAP-001.md) for remaining R004–R010 work.

## NOT_RUN

- Human review in a real browser, including 360 / 768 / 1280 / 1536 widths.
- Screen readers, physical touch, device DPI, full WCAG AA audit.
- Cross-framework screenshot comparisons, human-approved visual regression baselines.
- Independent generated-project dependency installation / package-script build
  matrix (workspace-toolchain typechecking and bundling did run).
- npm publication, releases and deployment (outside this session's scope).

The 2026-07-23 report recorded a browser attempt blocked by administrator policy.
That is historical context only; no browser attempt or manual pass is claimed
for this session. Automated DOM focus tests do not establish browser Tab behavior,
visual parity or accessibility conformance.

## Commands

```bash
pnpm test
pnpm typecheck
pnpm build
```

In this environment, Corepack's default global cache was not writable.
Commands used `COREPACK_HOME="$PWD/.cache/corepack"` and
`TMPDIR="$PWD/.cache/tmp"` to keep caches and generated fixtures in this repo.
Hosted CI status and merge evidence are recorded in the PR / session report;
local results alone do not authorize merging.

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
