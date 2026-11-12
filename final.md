# AcmeUI Web development report
Multi-framework component and template platform with React, Vue 3, Tailwind CSS v4, plain HTML/CSS, CLI scaffolding, Gallery, 48 templates, documentation and deployment presets.

This is an ongoing development record, not a published release or a statement of
production readiness. Current evidence is in VALIDATION.md and test.md. Entries
below are historical snapshots; later slices supersede earlier open-work notes.

## Current development / R021

From master bb72b87 after R020 / PR #23 merged. Static Modal now respects cancelled
opener clicks, close-button clicks and native cancel events while preserving
explicit cleanup and opener restoration. Gallery demonstrates a one-attempt
confirmation consumer without changing the native dialog focus sequence.
Five Vitest regressions and the first Chromium case failed before the fix.
Full local gates and hosted merge evidence are recorded in the R021 PR. Shared
CSS/tokens and React/Vue's R019 contract remain aligned; human checks are NOT_RUN.
R022 remains in ROADMAP-005.

## R020

From master ed5bf0c after roadmap PR #22 merged. React/Vue/static Tabs now ignore
cancelled/composing keydown events. Permanent Vitest and Chromium regressions
failed before the fix; Gallery demonstrates an ancestor capture consumer with a
pause checkbox. API/static docs describe handler ordering and synthetic IME
limits. Shared/static CSS and semantic tokens are unchanged. Full local gates,
hosted CI and merge evidence are in the R020 PR; R021/R022 remain in ROADMAP-005.
Human review, OS IME, screen readers, touch/DPI and visual baselines are NOT_RUN.

## ROADMAP-005 audit

Review/fix from master 6588f79 after R019 / PR #21 merged. The fifth audit
reproduced eight failures in an isolated temporary Vitest fixture: six cancelled /
composing Tabs cases across React/Vue/static, one cancelled native Modal cancel,
and one closed-details focus-candidate case. ROADMAP-005 contains the complete
fixture, reproduction steps and R020–R022 acceptance criteria. Implementation is
pending; baseline full-gate and hosted evidence belong to the roadmap PR.
Human review, OS IME, screen readers, physical touch/DPI and approved visual
baselines remain NOT_RUN. No publication, release, deployment or settings change.

## R019

Review/fix from master 23392f9 after R018 / PR #20 merged. React/Vue share a Modal
keydown guard for defaultPrevented and isComposing; ordinary Escape/Tab behavior
remains covered. Gallery notes consume one Escape and retain edited text before
allowing dismissal. Thirteen new Vitest cases and eight four-width/theme browser
cases cover both adapters and Gallery. Static/Tailwind native dialog delegation,
shared CSS and semantic tokens are unchanged.

All five local gates PASS: 304 Vitest / 23 files, existing 144-scaffold / 96-bundle
and three-install / 144-build matrices, typecheck/build and final 59 Chromium
cases (zero unexpected/flaky/skipped or global errors in that run). An initial
browser run had two native-focus timeouts with simultaneous ~349-second trace
gaps; affected cases and the full suite passed again without code/timeout/retry
changes. Details are in VALIDATION.md. ROADMAP-004's implementation items are
checked; hosted CI/merge evidence remains in the PR. Next work starts with a new
audit/ROADMAP. Human browser/visual review, OS IME, screen readers, physical
touch/DPI, full WCAG AA and approved visual baselines remain NOT_RUN. No npm
publication, release, deployment or settings change.

## R018

Review/fix from master 06ef00a, preserving the existing R018 branch work. A shared
Tabs value guard rejects duplicates during React/Vue initialization and updates
before ambiguous selection/key rendering. Eight new tests cover empty/special
values, independent instances and Vue error-handler recovery. Gallery and API
docs state the requirement. Shared/static CSS and tokens are unchanged.

All five local gates PASS: 291 Vitest / 22 files, 144 scaffolds / 96 bundles,
three isolated installs / 144 build scripts, typecheck/build and 51 headless
Chromium cases at all four widths/two themes, with zero unexpected/flaky/skipped
or global browser errors. R019 remains in ROADMAP-004. Hosted CI and merge
evidence belong to the PR. Human browser, screen-reader, touch/DPI, full WCAG AA
and approved visual baselines remain NOT_RUN; no publication/release/settings
changes are included.

## R017

Review/fix from master 1e84826. Shared React/Vue Modal focus now respects native
radio selection/group ownership and empty/plaintext-only contenteditable hosts,
with nested tabindex opt-in and browser-owned ordinary/Arrow/Space navigation.
Ten new Vitest cases and eight dual-adapter Chromium scenarios cover regressions.
Gallery and public docs are updated; shared/static CSS and tokens are unchanged.

All five local gates PASS: 283 Vitest / 21 files, 144 scaffolds / 96 bundles,
three isolated installs / 144 build scripts, typecheck/build without production
warnings, and 51 Chromium cases at all four widths/two themes. Human browser,
screen-reader, touch/DPI, full WCAG AA and approved visual baselines remain
NOT_RUN. ROADMAP-003 R016/R017 are implemented; hosted CI/merge evidence is in
the PR. No npm/release/deployment/settings actions or readiness claim.

## Historical development / R016

R014 / PR #16 and R015 / PR #17 are merged after both hosted validate checks passed.
ROADMAP-003 audits Tabs relations and native focus-candidate coverage. R016 retains
all React Tabs panels to keep every aria-controls valid and preserve content
through selection/reorder, with Vue parity tests, a Gallery draft example and a
visible-only family coverage gate. Removing items unmounts content; inactive
React child effects remain mounted as documented. Shared CSS/tokens are unchanged.

- `pnpm test`: PASS, 273 Vitest / 20 files, 144 scaffolds and 96 generated
  React/Vue typechecks/bundles with workspace toolchains.
- `pnpm test:cli:installed`: PASS, three isolated installs / 144 build scripts.
- `pnpm typecheck` / `pnpm build`: PASS; no production-build warnings observed.
- `pnpm test:browser`: PASS, 43 Chromium cases at 360/768/1280/1536 in both
  themes, zero unexpected/flaky/skipped or global errors. Existing Gallery cases
  now verify complete IDREFs and draft retention across nested/outer tab switches.

ROADMAP-002 R011–R015 and R016 are implemented. R017 (native radio/editable focus
candidates) remains open. Human browser/visual/keyboard review, screen readers,
physical touch/DPI, full WCAG AA and approved visual baselines remain NOT_RUN.
No npm publication, release, deployment or settings changes were performed;
no project-completion or production-readiness claim is made.

## Historical development / R015

R014 / PR #16 is merged after both hosted validate checks passed. R015 shares
React/Vue Modal background native inert, focusin protection and cleanup, with
nineteen new DOM regressions and eight four-size/theme browser scenarios running
both adapters. Existing inert values and connected opener focus are restored;
inserted background branches are observed. Gallery and public docs describe the
single-open-Modal, light-DOM/native-inert contract. CSS and tokens are unchanged.

- `pnpm test`: PASS, 269 Vitest / 20 files, 144 scaffolds and 96 generated
  React/Vue typechecks/bundles using workspace toolchains.
- `pnpm test:cli:installed`: PASS, three isolated installs / 144 build scripts.
- `pnpm typecheck` / `pnpm build`: PASS; no production-build warnings observed.
- `pnpm test:browser`: PASS, 43 Chromium cases at four widths / both themes,
  zero unexpected/flaky/skipped or global errors. Eight new scenarios each run
  both adapters, including pointer/focus isolation, Tab/Escape, inserted nodes,
  cleanup/unmount/reopen and panel style/geometry comparison (1px tolerance).

ROADMAP-002 R011–R015 are implemented; a further audit follows in ROADMAP-003.
Human browser/visual/keyboard review, screen readers, touch/DPI, full WCAG AA
and approved visual baselines remain NOT_RUN. No publication, release,
deployment or settings changes; no production-readiness claim is made.

## Historical development / R014

R013 / PR #15 is merged after both hosted validate checks passed. R014 rejects
ambiguous Static Tabs IDs and panel structures before enhancement, with thirteen
Vitest regressions plus Gallery/static documentation. Rejected markup remains
readable and can be repaired/reinitialized; cleanup restores original attributes.
Shared CSS/tokens and React/Vue/Tailwind visuals are unchanged.

- `pnpm test`: PASS, 250 Vitest / 18 files, 144 scaffolds and 96 workspace bundles.
- `pnpm test:cli:installed`: PASS, three isolated installs / 144 build scripts.
- `pnpm typecheck` / `pnpm build`: PASS; no production-build warnings observed.
- `pnpm test:browser`: final full rerun PASS, 35 Chromium cases at four widths /
  both themes, zero unexpected/flaky/skipped. The first run recorded two timeouts
  during an approximately 22-minute execution interruption (33 passed); it is not
  counted as passing. No assertions or timeouts were relaxed.

R015 remains in ROADMAP-002. Human browser/visual/keyboard review, screen readers,
physical touch/DPI, full WCAG AA and approved visual baselines remain NOT_RUN.
No npm publication, release, deployment or settings changes were performed.

## Historical development / R013

R011 / PR #13 and R012 / PR #14 are merged after both hosted validate checks
passed. R013 adds real Chromium coverage for the existing native static dialog,
no-JS fallback and a non-modal counterexample, plus three Vitest lifecycle tests.
The initial eight browser failures were fixture assumptions about native Tab
boundaries; measured document-focus behavior and the exact allowance are recorded
in docs/BROWSER_SMOKE.md. Runtime, Gallery markup, CSS and tokens are unchanged.

All five local gates PASS: 237 Vitest, 144 scaffolds, 96 workspace bundles,
three isolated installs / 144 original build scripts, typecheck/build and 35
Chromium cases (zero unexpected/flaky/skipped). Hosted evidence is in the PR.
ROADMAP-002 retains R014/R015. Human browser/visual/keyboard review, screen
readers, physical touch/DPI, full WCAG AA and approved baselines remain NOT_RUN.
No publication, release, deployment or settings changes; no production-readiness
claim or visual baseline approval is made.

## Historical development / R012

R011 is merged in PR #13 (both hosted CI checks passed). From synced master,
R012 fixes the static preview server's path boundary and malformed-request
handling. Fifteen real HTTP regressions verify directory/symlink confinement,
400/403/404 recovery and valid assets in repo-local fixtures. Framework APIs,
Gallery, CSS and tokens are unchanged.

All five local gates PASS: 234 Vitest, scaffold/install/build matrices,
typecheck/build and 25 Chromium cases at four widths/both themes. CI and merge
status are recorded in the PR. R013–R015 remain open. Human browser/visual review,
screen readers, touch/DPI, full WCAG AA and approved baselines remain NOT_RUN.
No publication, release, deployment or settings changes.

## Historical development / R011

ROADMAP-002 records the second audit at d493d70 and the next automatable gaps.
R011 repairs dynamic React/Vue Tabs selection recovery and Vue keyboard refs
after reorder; Gallery and API/static docs demonstrate the contract. Shared
CSS/tokens remain aligned across React/Vue/Tailwind/static.

Local five-command gates PASS: 219 Vitest, 144 scaffolds, 96 workspace bundles,
three isolated installs / 144 package-script builds, typecheck/build and 25
Chromium cases at all four widths/both themes. Hosted CI/merge evidence is in
the PR. R012–R015 remain in ROADMAP-002. Human browser/visual review, screen
readers, physical touch/DPI, full WCAG AA audit and approved baselines remain
NOT_RUN. No publication, release, deployment or settings change.

## Historical development / R010

R010 adds a classified, fatal Vite build-warning gate, rendered coverage for all
23 Gallery families, Sidebar/Footer examples and axe coverage, synchronized
CI/documentation command contracts, and a corrected browser JSON artifact path.
Shared CSS, tokens and public framework APIs are unchanged.

Local results: `pnpm test` PASS (209 Vitest cases, 144 scaffold checks,
96 workspace-toolchain typechecks/bundles), `pnpm typecheck` PASS, `pnpm build`
PASS, `pnpm test:cli:installed` PASS (three isolated installs / 144 original
build scripts), `pnpm test:browser` PASS (25 Chromium cases at all four widths
and both themes). Exact scope, unsuccessful intermediate execution and logger
limitations are recorded in VALIDATION.md / test.md; hosted evidence is in the PR.

R001–R010 automation is implemented. Remaining unchecked todos are human-approved
visual baselines and versioned npm publication, both outside this session's
authorized automation. Human browser review, screen readers, physical touch/DPI,
full WCAG AA audit and approved baselines remain NOT_RUN. No publication, release,
deployment or repository settings change was performed.

## Agent Skill integration

The tracked `skills/acmeui-web` package is part of the repository workflow:
`AGENTS.md` routes matching tasks to it, Codex-facing metadata makes it
discoverable after installation, and project tests verify that the Skill stays
aligned with the live workspace.

## 2026-11-10 development / R001

Audit and prioritized acceptance criteria: `docs/roadmap/ROADMAP-001.md`.
Shared Modal focus handling now skips hidden and nonsequential descendants and
recovers from container focus. React/Vue regression tests and the Gallery were
updated together; CSS and tokens are unchanged. Local test/typecheck/build pass.
This is ongoing development, not a release or production-readiness declaration.
Manual browser, responsive, screen reader and touch/DPI checks remain NOT_RUN.

## 2026-11-10 development / R002

CLI outputs include semantic HTML documents and React type dependencies.
The default test gate validates 144 scaffolds, typechecks/bundles all 96 React/Vue
outputs using workspace example toolchains, and runs 30 Vitest cases.
Independent dependency installation remains unverified. Typecheck/build pass;
no token or component styling changes were introduced.

## 2026-11-10 development / R003

Repository validation now enforces both framework export surfaces, shared/static
CSS consistency and registry/metadata/catalog/Gallery alignment, with negative
fixtures verifying failures. All local gates pass (50 Vitest cases, 144 scaffold
checks, 96 workspace-toolchain typechecks/bundles). R004–R010 remain open.
Human browser/responsive review, screen readers, touch/DPI, visual baselines and
independent scaffold installation remain NOT_RUN; no release was created.

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
