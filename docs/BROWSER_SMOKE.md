# Automated HTML and browser smoke (R009–R026)

The parser gate runs in `pnpm lint` / `pnpm test`. It uses HTML-validate 9's HTML5
content models for close order, implicit closes, allowed parents/children,
required ancestors/occurrences, duplicate IDs and duplicate attributes. parse5
reads the actual DOM structure for local anchor fragments and linked files/assets.
All 48 registry previews are checked. External URLs are not fetched. This is a
selected structural ruleset, not full HTML conformance or accessibility certification.
Vitest has malformed nesting/close order, duplicate ID/attribute, missing local
file/fragment/asset and encoded-link fixtures; a subprocess test proves the repo
gate rejects an invalid preview.

From repo root after dependency installation:

```bash
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" pnpm exec playwright install chromium --only-shell
pnpm test:browser
```

The runner always uses repo `.cache/ms-playwright`; outputs go to ignored
`output/browser/`. Two localhost Vite servers run only for the test lifetime.
CI installs the same lockfile/browser and uploads the JSON report, computed
layout attachments and failure traces. No screenshot snapshots are generated.
R010 corrects the JSON reporter path relative to the Playwright config directory:
`output/browser/report.json` now sits beside `output/browser/results/` under the
CI upload path. A Vitest guard checks both resolved paths against that directory.
See the official [Playwright browser installation](https://playwright.dev/docs/browsers)
and [HTML-validate rules](https://html-validate.org/rules/index.html).

The current 107 Chromium headless cases cover:

- 48 previews × 360/768/1280/1536 × light/dark: no document horizontal overflow
  beyond 1px rounding, visible h1/nonempty main, working theme toggle where
  present, no page exceptions or HTTP error responses. This is 384 preview visits.
- Eight responsive/theme scenarios compare four independently authored fixtures:
  React/Vue components, static HTML, and actual compiled Tailwind integration.
  Thirteen representative families (Navbar, Hero, Button, Card, Badge, Avatar,
  Field/Input, Alert, Progress, DataTable, FeatureGrid, PricingTable) exercise 16
  selectors. Positions/sizes permit at most 1px difference; selected colors,
  borders, radius, type, display and padding must match. These are current-run
  comparisons; React is the reference, not an approved visual baseline.
- Keyboard Tab reaches Sign in/Start with real :focus-visible; the primary button
  outline must be solid 3px and exactly match the resolved semantic ring token.
- Gallery's four component tabs and open Modal fit each viewport/theme; Escape
  closes the React dialog and restores the opener. R013 separately covers the
  native static dialog below.
- An injected style/overflow negative fixture proves these guards fail. Vitest
  separately rejects missing elements, nonfinite/missing geometry and style drift.
- R013 adds eight native static dialog scenarios (four widths / both themes):
  real Enter/Space opening, `:modal`, initial input focus, Tab/Shift+Tab traversal,
  rejection of background programmatic focus, viewport fit, Escape/close-button
  dismissal and opener focus restoration. `native-tab-boundaries` JSON attachments
  record active-element/document-focus state. Chromium can leave document focus
  at the boundary (body active, `document.hasFocus()` false) before the next Tab
  returns to the dialog. The test permits exactly that single observed transition;
  a focused body or any background control still fails. This checks document
  focus isolation, not a claim that browser UI can never receive focus.
- Two more R013 cases verify readable anchor/fallback content with JavaScript
  disabled at 360px, and an injected non-modal `show()` implementation: it must
  fail the `:modal` predicate and permit background focus, proving that the
  native-modality checks distinguish a merely visible dialog.

R015 adds eight scenarios (four widths / both themes), each operating both React
and Vue Modal fixtures. They verify initial focus, native inert on ancestor sibling
branches, Tab/Shift+Tab wrapping, programmatic focus blocking, newly inserted
background nodes, Escape/close/unmount/opener restoration and repeated openings.
A deliberate removal of inert from an inserted button exercises the independent
focusin guard. A real pointer click with the overlay temporarily pointer-transparent
must not activate the inert background button; after close the same button works.
Existing inert/aria-hidden attributes survive cleanup. Panel geometry (1px) and
computed foreground/background agree across both adapters; JSON measurements are
attached. These are current-run comparisons, not approved screenshot baselines.
Native inert support is required; no polyfill, nested/overlapping modals, shadow
roots or dialog content portaled outside the panel are covered/supported. Vitest
also covers exact prior inert values, nodes moved inside, disconnected openers,
StrictMode replay, Vue quick close/unmount, sequential instances and owner-document
boundaries. The first focused DOM run reproduced seven failures before the fix.

R016 extends the existing eight Gallery viewport/theme cases without adding test
cases: every rendered tab must reference a mounted panel with the matching label;
a real input draft survives switching nested tabs and leaving/re-entering its
outer tab. Inactive input content must disappear from accessible role queries.
React now retains inactive panels like Vue/static; shared CSS/tokens are unchanged.
Vitest separately checks panel identity through reorder and rejects hidden,
aria-hidden, inert and CSS-hidden examples from Gallery family coverage.

The first focused R013 run failed eight expectations because it assumed native
boundary traversal always wraps in one keypress. Instrumentation observed the
unfocused-document transition above. Correcting that fixture assumption required
no runtime/CSS changes. Vitest adds close-event, disconnected-opener and
cleanup/reinitialization contracts using the existing explicit jsdom doubles.

Initial R009 browser execution reproduced 12 failures: auth overflow at 360px, Gallery
pagination overflow at 360px, and Tailwind preflight geometry drift at every
size/theme. Fixes let login/signup inputs shrink, wrap shared/static pagination,
and omit preflight from the adapter while using the opaque semantic focus ring.
No palette/token changes or screenshot baselines were introduced.

NOT_RUN: human browser review at all four widths, screen readers, physical touch
and device DPI, Firefox/WebKit/other OS, complete rendered contrast/label audit,
complete family/state screenshot comparisons,
full WCAG AA audit and human-approved visual regression baselines. Generated
React/Vue scaffold pages are compiled in R002/R008, not visited by this browser
gate. These automated results do not establish production readiness.

R017 adds eight four-width/theme cases, each using both actual Modal adapters.
They exercise checked and fresh unchecked radio boundaries, ArrowRight selection,
form-independent native Tab movement (including interleaved controls), empty and
plaintext-only editing hosts, nested editor tabindex opt-in, actual text entry,
Escape and opener restoration. Only fixture slot content is replaced; the real
panel and Modal lifecycle stay mounted. The pre-fix 360/light case failed on
reverse entry to the checked radio; the final full gate passes all 51 cases.
Unchecked radio focus history/platform differences remain browser-owned. This is
Chromium evidence, not cross-engine or human keyboard/visual approval.

R019 adds eight four-width/theme cases with real Escape key presses in React/Vue
fixtures and Gallery. A child consumes the first Escape: the Modal stays open,
focus stays on the child and background inert remains in the adapter fixtures.
The next uncancelled Escape closes and restores opener focus. Gallery notes end
editing without losing text before allowing dismissal. One initial 360/light
case failed before the shared handler fix. Cancelled Tab/Shift+Tab and synthetic
isComposing events are covered by Vitest; these browser cases do not exercise a
real OS IME or certify human keyboard/visual behavior.

R020 adds eight four-width/theme scenarios across React/Vue/static Tabs and the
Gallery capture-consumer example. A real ArrowRight cancelled during capture
preserves selection/focus; ordinary End/Home/wrapping still works. A synthetic
composing End must remain uncancelled and preserve selection/focus. The initial
360/light case failed before the guard. Synthetic browser events are not OS IME
or human keyboard review. No style/token or screenshot baseline changes.

R021 adds eight four-width/theme native static dialog scenarios: a real cancelled
opener click leaves it closed; Gallery's capture consumer cancels one real Escape
and one close-button click while preserving edited input, modality and focus.
The next uncancelled attempt closes and restores opener focus. The initial
360/light case failed on cancelled opening. Five Vitest double-based cases also
cover cancellation, idempotence, cleanup and reinitialization. These do not
establish human browser/visual or screen-reader results.

R022 adds eight four-width/theme cases comparing React/Vue/static Modal traversal
with explicit first summaries, nested closed/open details, Enter/Space toggling,
Tab/Shift+Tab boundaries, retained drafts and opener restoration. Gallery's real
advanced-options example is also operated. Eleven Vitest cases cover candidate
rules and both adapters; ten failed before the fix. The first 360/light browser
case failed before the helper correction. An intermediate post-fix case passed
React/Vue then exposed the existing R013 unfocused-document native-dialog
transition on a reverse boundary. Its trace is retained; every static boundary
now uses the same single-transition predicate (never a focused body/background
control), with details-tab-boundaries JSON attachments. No timeout/retry or
runtime native-dialog workaround was added. The original static-dialog scenarios
now include the additional collapsed Gallery summary in their actual tab order.
Explicit summary is required; browser-generated fallback summary, other engines,
human visual/keyboard review and approved visual baselines remain NOT_RUN.

R024 adds eight four-width/theme React/Vue Modal cases: a `visibility:visible`
control inside a `visibility:hidden|collapse` wrapper is reached by real Shift+Tab
and Tab boundaries, while an inherited-hidden sibling and a `display:none` subtree
are skipped. They failed before the core fix.

R025 adds eight four-width/theme static Gallery Tabs cases: a capture consumer
cancels the first real click on 「使用方式」, so 「總覽」 remains selected and its
panel remains visible; the next click selects 「使用方式」 and hides the original
panel. All eight failed before the click guard and passed after. These cases are
automated Chromium only. Human visual/keyboard review, Firefox/WebKit and
screen-reader validation remain NOT_RUN.

R026 adds eight four-width/theme React/Vue Tabs fixture cases: a capture consumer
cancels the first real click on the second tab (Beta), so Alpha remains selected
and its panel text remains visible; the next click selects Beta. All eight failed
before the click guard and passed after. These cases are automated Chromium only.
Human visual/keyboard review, Firefox/WebKit and screen-reader validation remain
NOT_RUN.
