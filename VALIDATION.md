# Validation Report

Date: 2026-11-11

## Automated evidence history

Current command/scope contract: [test.md](test.md),
[accessibility scope](docs/ACCESSIBILITY.md) and
[browser smoke](docs/BROWSER_SMOKE.md). R012 results follow the historical entries
below. Earlier counts and open-work statements describe their original slices.

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

See [ROADMAP-001](docs/roadmap/ROADMAP-001.md) for current roadmap status.

## NOT_RUN

- Human review in a real browser, including 360 / 768 / 1280 / 1536 widths.
- Screen readers, physical touch, device DPI, full WCAG AA audit.
- Cross-framework screenshot comparisons, human-approved visual regression baselines.
- npm/yarn installation matrices and other OS (isolated pnpm manifests and all
  144 generated package-script builds ran in R008; see scope below).
- npm publication, releases and deployment (outside this session's scope).

The 2026-07-23 report recorded a browser attempt blocked by administrator policy.
That is historical context only. R009 ran automated Chromium below; no human
browser pass is claimed. DOM tests and representative browser comparisons do not
establish full visual parity or accessibility conformance.

## Commands

```bash
pnpm test
pnpm test:cli:installed
pnpm typecheck
pnpm build
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" pnpm exec playwright install chromium --only-shell
pnpm test:browser
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

## 2026-11-10 / R007

Remaining presentation families now have React/Vue semantic, content/slot,
native-attribute and event tests; composition helpers and public prop/row types
are checked. Initial presentation fixtures had 11 failed cases (two were fixed
in the fixture's Vue class handling). Fixes add named Avatar initials, scoped
column headers/current breadcrumbs, Vue cell/icon scoped slots and explicit
Pricing button type. Gallery/static docs demonstrate the public behavior.
Shared CSS/tokens are unchanged across React/Vue/Tailwind/static.

`pnpm test`: PASS (147 Vitest cases, 144 scaffolds, 96 workspace bundles).
`pnpm typecheck`: PASS, now including every unit test via vue-tsc; this also
caught unsupported Testing Library role-query options. `pnpm build`: PASS,
no warnings observed. React/Vue extension idioms are documented; this is not
a claim of identical framework types or complete API equivalence.

NOT_RUN: human browser/responsive review (360/768/1280/1536), screen readers,
physical touch/DPI, full WCAG AA audit, screenshots and approved visual baselines.
Independent scaffold dependency installation remains R008. No publication/release.

## 2026-11-10 / R008

CLI parsing now rejects unknown/duplicate/missing flags and extra positional
arguments before writing, with space/equals syntax and read-only usage tests.
Generated React/Vue theme listeners are app-scoped and cleaned on unmount;
Vitest compiles/mounts actual generated components, clicks retained buttons after
unmount, remounts and verifies unrelated buttons are untouched.

`pnpm test`: PASS (170 Vitest cases, 144 scaffolds, 96 workspace bundles).
`pnpm typecheck` / `pnpm build`: PASS; no build warnings observed.
`pnpm test:cli:installed`: PASS, now a separate required CI command. It validates
identical manifests per framework, performs three isolated pnpm installations
(ignore-workspace / ignore-scripts), then runs all 144 original build scripts.
96 React/Vue outputs each typecheck and write Vite dist; 48 static scripts report
readiness. Identical manifests reuse the isolated dependencies, never workspace
node_modules; this is not 144 independent installs. Temporary artifacts stay in
repo tmp/ and stores in .cache/.

NOT_RUN: npm/yarn install matrices, other OS, human browser/responsive review
(360/768/1280/1536), screen readers, touch/DPI, full WCAG AA, screenshots and
approved visual baselines. Static uses full-page lifetime, not framework unmount.
No package publication, release, deployment or repository settings changes.

## 2026-11-10 / R009

All 48 previews now pass selected HTML5 parser content/parent/close-order and
ID/attribute rules plus local file/fragment/asset checks (external URLs unfetched).
Malformed fixtures and an invalid-preview subprocess prove rejection. Parser and
layout guard Vitest coverage brings `pnpm test` to 185 passing cases, plus the
existing 144 scaffold checks and 96 workspace-toolchain bundles.

`pnpm typecheck` / `pnpm build`: PASS, including browser TypeScript fixtures;
no build warnings observed. `pnpm test:browser`: PASS, 25 Chromium headless cases.
It visits 48 previews at 360/768/1280/1536 in both themes (384 visits), compares
16 selectors across 13 representative React/Vue/static/compiled-Tailwind
families (1px geometry tolerance; selected computed styles exact), checks actual
keyboard focus-visible/ring color and Gallery Tabs/Modal viewport/Escape/opener.
An injected negative fixture verifies overflow/style detection. Results and
failure traces live in ignored output/browser/ and hosted CI artifacts.

The first browser run reproduced 12 failures. Fixes shrink login/signup inputs,
wrap pagination in identical shared/static CSS, omit Tailwind preflight in favor
of the common reset and align its focus utility with the opaque semantic ring.
Gallery pagination text and integration docs now describe this behavior. Tokens
are unchanged. See docs/BROWSER_SMOKE.md for the exact automated scope.

NOT_RUN: human browser/visual review at the four widths, screen readers, physical
touch/DPI, Firefox/WebKit/other OS, native static dialog Tab/inert/Escape, complete
rendered contrast/label checks, full family/state screenshots, full WCAG AA audit
and human-approved visual baselines. No screenshot baselines were created or
approved. R010 remains open; publication/releases/settings were not changed.

## 2026-11-10–11 / R010

Mode: review/fix. The first focused negative run reproduced five failures:
all three workspace configs accepted a real bundler warning, and light/dark
Gallery lacked rendered Sidebar/Footer examples. A separate negative case
reproduced the JSON reporter writing outside CI's uploaded artifact directory.

- `pnpm test`: PASS, 209 Vitest cases across 17 files, 144 scaffold checks and
  96 generated React/Vue typechecks/bundles with workspace example toolchains.
- `pnpm test:cli:installed`: PASS, three isolated pnpm manifest installations
  and all 144 original generated build scripts. Identical manifests reuse each
  isolated install; this is not 144 independent installations.
- `pnpm typecheck`: PASS, including unit-test and browser TypeScript fixtures.
- `pnpm build`: PASS, Gallery/static example plus React/Vue examples; no
  production-build warnings observed in the passing run.
- `pnpm test:browser`: PASS, 25 Chromium cases, all four widths in both themes,
  384 preview visits and the existing representative adapter/focus/Gallery
  comparisons. `output/browser/report.json` records 25 expected, zero unexpected,
  zero flaky, zero skipped and zero global errors. JSON, layout attachments and
  failure output now share CI's `output/browser/` upload directory.

The shared Vite logger classifies CSS, asset/source-map, configuration,
dependency, bundle and unknown diagnostics. Every `warn`/`warnOnce` fails,
including unknown/keyword-free warnings; there are no exemptions. Vitest
injects a real warning into each workspace config. Independent generated scripts
retain a conservative captured-output gate; its matching/classification limits,
development logging and pre-config limitations are explicit in test.md.

Gallery now demonstrates all 23 runtime public families in reachable tabs/Modal
states in light/dark themes, with Sidebar/Footer added to the presentation tab.
Axe now scans that tab as well. The same shared CSS and semantic tokens still
serve React/Vue/Tailwind/static; no product CSS or token values changed.
CI's five required commands are checked against README/test/validation docs.
Historical scope statements are explicitly identified as historical.

An overlapping local run failed with page reload/context errors and a roughly
31-minute execution interruption; the CLI gate also rejected PLUGIN_TIMINGS.
That run was not counted as passing. The final ordered rerun above passed without
relaxing checks. Browser workers emitted Node NO_COLOR/FORCE_COLOR notices,
outside the production-build gate. Run the documented commands in order.

NOT_RUN: human browser/visual review at 360/768/1280/1536, screen readers,
physical touch/DPI, Firefox/WebKit/other OS, native static dialog Tab/inert/Escape,
complete rendered contrast/label checks, full family/state screenshots, full
WCAG AA audit, human-approved visual baselines and npm/yarn installation matrices.
No npm publication, release, deployment or repository settings change occurred.
Hosted CI/merge evidence is in the PR; local results alone do not authorize merge.

## 2026-11-11 / R011

Second audit starts at d493d70; findings/acceptance are in ROADMAP-002. Focused
regression run reproduced 8 failed cases before the fix. React/Vue Tabs now
recover from invalid defaults, empty/refilled lists and removed selections;
Vue keyboard refs follow reordered items. Gallery adds a dynamic example and
API/static docs explain initial-only defaults and cleanup/reinitialize.
Shared/static CSS and semantic tokens are unchanged across all four adapters.

- `pnpm test`: PASS, 219 Vitest cases / 17 files, 144 scaffolds, 96 generated
  React/Vue typechecks and bundles with workspace toolchains.
- `pnpm test:cli:installed`: PASS, three isolated pnpm installs and all 144
  unmodified build scripts (identical manifests reuse dependencies).
- `pnpm typecheck` / `pnpm build`: PASS; no production-build warnings observed.
- `pnpm test:browser`: PASS, 25 Chromium cases, four widths / both themes,
  384 preview visits and representative adapter/focus/Gallery comparisons.

NOT_RUN: human browser/visual review (360/768/1280/1536), screen readers,
physical touch/DPI, Firefox/WebKit/other OS, native static dialog Tab/inert/Escape,
complete rendered contrast/label checks, full family/state screenshots, full
WCAG AA audit, approved visual baselines, npm/yarn install matrices. No npm
publication, release, deployment or repository settings changes. CI and merge
evidence are in the PR; local passing results alone do not authorize merge.

## 2026-11-11 / R012 (current)

R011 merged as PR #13 after both hosted validate checks succeeded; this slice
starts from synced master ee344b3. Real preview-server HTTP tests reproduced
seven failures before the fix. Requests now use directory-boundary and realpath
checks to deny same-prefix and symlink escapes; malformed URL/encoding/NUL input
returns 400 and the server remains available. All fixtures remain in repo tmp/.
No component, Gallery, CSS or token changes.

- `pnpm test`: PASS, 234 Vitest cases / 18 files (15 real HTTP cases), 144
  scaffolds and 96 generated React/Vue typechecks/bundles.
- `pnpm test:cli:installed`: PASS, three isolated installs / 144 build scripts.
- `pnpm typecheck` / `pnpm build`: PASS; no production-build warnings observed.
- `pnpm test:browser`: PASS, 25 Chromium cases / four widths / both themes.

NOT_RUN: human browser/visual review (360/768/1280/1536), screen readers, physical
touch/DPI, Firefox/WebKit/other OS, native static dialog Tab/inert/Escape, full
rendered contrast/label checks, full WCAG AA audit, full screenshots, approved
visual baselines, npm/yarn install matrices, adversarial concurrent filesystem
replacement. No npm publication/release/deployment/settings changes. Hosted
CI/merge evidence remains in the PR; local results alone do not authorize merge.
