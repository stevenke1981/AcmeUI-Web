# Automated HTML and browser smoke (R009–R016)

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

The current 43 Chromium headless cases cover:

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
