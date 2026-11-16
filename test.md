# Test Strategy

## Current required gates (R022)

After `pnpm install --frozen-lockfile`, run the same five commands as
`.github/workflows/ci.yml`:

```bash
pnpm test
pnpm test:cli:installed
pnpm typecheck
pnpm build
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" pnpm exec playwright install chromium --only-shell
pnpm test:browser
```

The browser installation is a prerequisite, not an additional test result.
Run these commands in order: the browser gate uses development servers, and
concurrent fixture/build writes can reload pages during measurements.
Use repo-local `COREPACK_HOME="$PWD/.cache/corepack"` and
`TMPDIR="$PWD/.cache/tmp"` when needed. CLI fixtures remain under `tmp/`.

| Command | Automated scope |
|---|---|
| `pnpm test` | Generated token drift, shared/static CSS, 23-family export contract, registry/metadata/catalog/Gallery data, selected HTML parser/local-link rules, Skill, 144 scaffolds, 96 workspace-toolchain typechecks/bundles, Vitest including real preview-server HTTP requests |
| `pnpm test:cli:installed` | Three isolated pnpm manifest installations; all 144 unmodified generated build scripts, including 96 React/Vue typechecks and dist outputs; identical manifests reuse each isolated install |
| `pnpm typecheck` | Core/React/Vue/Gallery plus unit-test and browser TypeScript fixtures |
| `pnpm build` | Gallery (including static example) and React/Vue examples, with build-warning gate |
| `pnpm test:browser` | 99 headless Chromium cases; all 48 previews at four widths/two themes, representative four-adapter style/geometry comparison, focus ring, Gallery Tabs/Modal, child keyboard/static Tabs click cancellation and native static dialog; see docs/BROWSER_SMOKE.md |

Vitest imports the actual Gallery App, visits every tab and opens its Modal in
both themes. All 23 families must render using their real class/semantic
selectors. The selector contract is compared to runtime public exports, with
only the three documented Card helpers excluded. Hidden/inert/aria-hidden/CSS-hidden examples do not count. This checks reachable examples,
not all props/states or full visual parity. Axe scans all four tabs and open Modal
states, with the explicit jsdom exclusions in docs/ACCESSIBILITY.md.

### Build warning policy

Gallery and both example Vite configs install `scripts/build-warnings.mjs` for
production builds; generated workspace-toolchain bundles reuse its logger.
Every Vite `warn` / `warnOnce` diagnostic throws, including messages without a
literal warning keyword. Classification is diagnostic only: `css`, `asset`
(including missing resources/source maps), `configuration` (including deprecated
options), `dependency`, `bundle` (including chunk size), and `unknown`. There is
no allowlist, severity exemption or warning-limit increase. Vite's normal error
handling and development-server logging stay in place.

Vitest injects a real bundler warning into each of the three workspace configs
and verifies rejection. Categories, ANSI cleanup and both logger methods have
negative cases; informational text remains informational. These expected fixture
build failures appear in test output and are not warnings from `pnpm build`.

Isolated scaffold build scripts do not import repo tooling. Their separate
captured-output gate conservatively rejects `warn`/`warning`, `(!)`, chunk-size
and unresolved-resource markers, then applies the same diagnostic categories.
This text fallback is not a structured logger guarantee for arbitrary output.
Dependency installation notices and development-server/browser-runner diagnostics
are outside this production-build gate. Pre-config Vite/Node diagnostics are not
intercepted by the custom logger; generated builds' captured output still rejects
matching lines regardless of their source.

`validation-commands.test.ts` prevents these five required commands drifting
between CI, README, this strategy and VALIDATION. Hosted check and merge evidence
remain in each PR; local results alone do not authorize merging.
It also checks that the JSON reporter and failure-output paths resolve under the
uploaded `output/browser/` directory; R010 fixes the former misplaced report.

NOT_RUN: human browser/visual review at 360/768/1280/1536, screen readers,
physical touch/DPI, Firefox/WebKit/other OS,
complete rendered contrast/label checks, full WCAG AA audit, full family/state
screenshots, human-approved visual baselines, npm/yarn install matrices.
No npm publication, release, deployment or settings change is part of this work.

## R011 / dynamic Tabs

New React/Vue cases reproduced eight failures before the fix. Both adapters now
normalize invalid/removed selections, clear selection on an empty list and select
the first item on refill. Existing selection survives reorder; Vue button refs
track current render indices. Empty-string values are valid. Gallery's behavior
tab demonstrates removal, clearing/refill and reorder using shared styles.

Local five-command gate: PASS (219 Vitest, 144 scaffolds, 96 workspace bundles,
three isolated installs / 144 package-script builds, typecheck/build, 25 Chromium
cases at 360/768/1280/1536 in light/dark). No CSS/token changes. Static/Tailwind
markup remains fixed during enhancement; cleanup/reinitialize is documented.
Human checks and approved visual baselines remain NOT_RUN. Follow-up work is in
[ROADMAP-002](docs/roadmap/ROADMAP-002.md); hosted status remains in the PR.

## R012 / preview server HTTP boundary

Fifteen Vitest HTTP cases start the real CLI server in isolated repo `tmp/`
fixtures. Before the fix, seven cases failed: a same-prefix sibling and two
escaping symlinks leaked fixture content, and four malformed request targets
terminated the server. Directory-boundary and realpath checks now deny escapes;
invalid URL/encoding/NUL input returns 400 without terminating the process.
Normal HTML/CSS/JS, nested/encoded paths, internal symlinks and 404 recovery pass.
Fixtures and out-of-root targets stay inside repo tmp; no other repo is read.
This is a local preview-server regression scope, not a general security audit
or a guarantee against concurrent filesystem replacement.

All five local gates PASS: 234 Vitest / 18 files, existing scaffold/install/build
matrices, typecheck/build and 25 Chromium cases. Components, Gallery, CSS and
semantic tokens are unchanged. Human checks remain NOT_RUN.

## R013 / native static dialog browser evidence

Ten new Chromium cases add eight viewport/theme scenarios, one 360px no-JS
fallback scenario and one injected non-modal counterexample. They exercise the
existing static Gallery page, native modality, Enter/Space, Tab/Shift+Tab,
background programmatic focus blocking, viewport fit, Escape/close and opener
restoration. Boundary JSON records the observed unfocused-document transition;
see docs/BROWSER_SMOKE.md for the exact single-transition allowance and the
initial fixture's eight failed assumptions. No runtime or style change was needed.

Three additional Vitest cases check native close events, a disconnected opener
and cleanup/reinitialization with a new opener using explicit jsdom doubles.
All five local gates PASS: 237 Vitest / 18 files, existing scaffold/install/build
matrices, typecheck/build and 35 Chromium cases (zero unexpected/flaky/skipped).
These remain automated Chromium results; human keyboard/visual review and full
WCAG AA remain NOT_RUN. R014/R015 remain in ROADMAP-002.

## R014 / static Tabs initialization

Thirteen new Vitest cases cover document-wide duplicate tab/panel IDs, whitespace
IDREF ambiguity, shared/self/overlapping panel targets, unchanged markup and
unhandled native events after rejection, repair/retry and cleanup/rebuild with
CSS-punctuation IDs. The initial focused run reproduced nine failures. Validation
runs before all mutations/listeners. Gallery/static docs reflect the contract;
shared CSS and tokens are unchanged. Gate evidence is in VALIDATION.md; human
checks and approved visual baselines remain NOT_RUN.

## R015 / React and Vue Modal isolation

Nineteen new Vitest cases cover shared ancestor-sibling inert, background focusin
redirection, inserted/moved nodes, exact attribute restoration, disconnected
openers, close/unmount/reopen, React StrictMode, Vue quick transitions, owner-document
scope and rejected concurrent activation. The first focused run reproduced seven
failures. Eight new browser scenarios operate both frameworks at all four widths
and themes (43 total Chromium cases), including real keyboard/pointer attempts,
lifecycle cleanup and panel style/geometry comparison. Gallery and API/static docs
explain the single-open-Modal, native-inert, light-DOM contract. Shared/static CSS
and tokens remain unchanged. Results are in VALIDATION.md; human checks remain
NOT_RUN.

## R016 / complete Tabs panel relations and lifecycle

Two initial React regressions failed for missing inactive panels and discarded
uncontrolled values. React now retains all panel nodes, matching Vue/static
visibility intent; selection/reorder preserves content, while item removal or
clearing unmounts it. React child effects remain mounted; consumers own any pause
based on visibility. Four new Vitest cases cover all IDREFs, node/value retention,
Vue reorder parity and hidden-family exclusion. The eight existing Gallery browser
cases now check relations plus nested/outer-tab draft retention in all viewport/
theme scenarios (43 total Chromium cases). Gallery/API/static docs and ROADMAP-003
record the contract, evidence and remaining R017 native focus-candidate work.
Shared/static CSS and tokens are unchanged; human checks remain NOT_RUN.

## R018 / unique Tabs values

Eight new Vitest cases exercise React/Vue initialization and items updates with
duplicate values (including the empty string), valid empty/special strings and
independent instances in one app. Both adapters call the shared uniqueness guard
before rendering ambiguous selections/keys. Vue error-handler recovery is tested;
React invalid renders use its normal error boundary handling. Valid-list content
preservation remains the R016 contract. Gallery and API reference state this
input requirement; shared/static CSS and semantic tokens are unchanged.

These checks do not test independent/hydrated root ID prefixes or human browser,
screen-reader, touch/DPI or visual baseline behavior. R019 remains in ROADMAP-004.

## R019 / Modal keyboard event ownership

The initial 12-case focused run reproduced ten failures across React/Vue:
cancelled Escape/Tab and synthetic composing Escape/Tab were still handled.
One 360/light Chromium case also failed when a real Escape closed the Modal
after a child prevented default. The shared document listener now returns for
defaultPrevented or isComposing before Escape dismissal or Tab trapping.
Thirteen new Vitest cases include normal-key controls, both Tab directions and
the Gallery notes consumer. Eight new Chromium cases operate both adapters and
Gallery in all four widths/themes. Synthetic composition flags do not validate
OS IME. Static/Tailwind native-dialog delegation, CSS and tokens are unchanged.

## Historical evidence

The entries below record the scope at each earlier slice. Current coverage is
the table above; earlier statements that a later slice remained open are history.

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
touch/DPI, Firefox/WebKit/other OS, complete
rendered contrast/label checks, full family/state screenshots, full WCAG AA audit
and human-approved visual baselines. No screenshot baselines were created or
approved. R010 remains open; publication/releases/settings were not changed.

## R017 / native radio and editable focus

Ten new Vitest regressions cover form-owned/unnamed radio groups, noneligible
checked members, changing selections, unchecked/interleaved controls and editing
host inheritance/nesting, with both real adapters. The initial focused run had
nine failures; a 360/light Chromium regression also failed before the fix. Eight
new browser scenarios cover both adapters at four widths/two themes (51 total).
Gallery includes plaintext notes and a native radio group with unique IDs; an
initial axe incomplete result was fixed without relaxing rules. The final full
Vitest gate has 283 passing cases. No CSS/token changes; human checks remain
NOT_RUN. Exact results and scope are in VALIDATION.md / BROWSER_SMOKE.md.

## ROADMAP-005 / audit reproduction

The next audit starts at master 6588f79. ROADMAP-005 includes an exact temporary
fixture and regeneration command for eight baseline failures outside the normal
gate: cancelled/composing Tabs in three adapters, cancelled static Modal cancel,
and closed-details focus candidates. R020–R022 will add permanent regression
coverage separately. This temporary jsdom audit is not native browser or OS IME
verification; human checks and visual baselines remain NOT_RUN.

## R020 / Tabs keyboard ownership

Six new three-adapter cases first failed before the guard. Each checks cancelled
capture and synthetic composing events across ArrowLeft/Right/Home/End (plus
static Enter/Space), selection/focus/roving tabindex and ordinary-key controls.
Eight browser scenarios add actual capture cancellation, normal movement and the
Gallery pause checkbox at four widths/two themes; composing coverage is synthetic.
Human browser/visual/OS IME checks and approved baselines remain NOT_RUN.

## R021 / static Modal event ownership

Five new Vitest cases first failed for cancelled opening, native cancel, nested
close-button click and lifecycle scenarios. The enhancement now checks
cancellation before open/close. Cleanup remains unconditional and idempotent;
normal close restores the opener. Eight four-width/theme Chromium cases use real
clicks and Escape against the static Gallery confirmation example. Native dialog
methods remain real in Chromium and explicit doubles in jsdom.

## R022 / explicit summary and closed-details focus

Nine core and two adapter tests cover first summaries, closed subtrees, nested
open/close, opt-in secondary summaries, existing visibility/disabled rules,
explicit details tabindex, initial focus and live boundaries. Ten of eleven
failed before the fix. Eight Chromium cases compare actual React/Vue/static
keyboard behavior and Gallery at four widths/themes. Static native boundaries
retain only R013's single unfocused-document transition and attach measured
states; they never permit a background control or focused body. Human review,
screen readers, touch/DPI and approved visual baselines remain NOT_RUN.

## R023 / Switch click ownership

scripts/test/switch-events.test.tsx adds 12 React/Vue cases: cancelled capture
clicks preserve aria-checked/data-checked and emit nothing; ordinary clicks request
one toggle. Both initial values, controlled props/consumer updates and disabled
controls are covered. React onClick runs before the cancellation guard.
Before the Vue fix: 4 failed / 8 passed, recorded in ignored .cache/r023-before.log.
After: 12 passed. Full suite is now 338 Vitest in 28 files; test:browser has 83
Chromium cases (no browser case added for R023). See ROADMAP-006.

## R024 / visibility override focus

packages/core/test/visibility-focus.test.ts and scripts/test/visibility-focus.test.tsx add
14 Vitest cases (6 failed before the fix): visible override under hidden/collapse ancestors,
own hidden/collapse, inherited hidden, and display:none/hidden/inert/aria-hidden ancestors.
scripts/browser/visibility-focus.spec.ts adds 8 Chromium cases with real Tab/Shift+Tab.

## R025 / static Tabs cancelled click

scripts/test/static-tabs-events.test.ts adds six Vitest cases: capture cancellation
before/after enhancement, including a child target, leaves selection, aria-selected,
roving tabindex and hidden panels unchanged; the next uncancelled click selects once.
Modifier/non-primary clicks and cleanup/reinitialization are covered. Before the fix:
5 failed / 1 passed (ignored .cache/r025-before.log); after: 6 passed. Existing
static Tabs suites add 29 passes (35 targeted total); typecheck passes.
scripts/browser/static-tabs-events.spec.ts adds eight 4-width × 2-theme Chromium
Gallery cases; all eight failed before the fix and passed after. Full suite is now
358 Vitest in 31 files; test:browser has 99 Chromium cases. Human visual/keyboard,
Firefox/WebKit and screen-reader checks remain NOT_RUN.

## R026 / React and Vue Tabs cancelled click

scripts/test/tabs-click-events.test.tsx adds four React/Vue cases: a capture
consumer that preventDefault()s a click on a non-selected tab leaves
aria-selected, roving tabindex and panel visibility unchanged; the next
uncancelled click selects once, and a repeat click on the already-selected tab
is harmless. Vue assertions use v-show / computed display, not the hidden
attribute. Before the fix: 4 failed / 0 passed (ignored .cache/r026-before.log).
After: 4 passed. Existing Tabs suites add 44 passes (48 targeted total).
scripts/browser/tabs-click-events.spec.ts adds eight 4-width × 2-theme Chromium
fixture cases; all eight failed before the fix and passed after. See ROADMAP-007.
Human visual/keyboard, Firefox/WebKit and screen-reader checks remain NOT_RUN.
