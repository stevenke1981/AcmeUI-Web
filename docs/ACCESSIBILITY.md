# Accessibility automation scope

This is a DOM/token regression baseline, not a WCAG conformance statement or a
human-approved visual baseline. R009 automated Chromium layout smoke has run;
its exact scope is in [BROWSER_SMOKE.md](BROWSER_SMOKE.md). Human review remains
NOT_RUN.

R013 additionally exercises the real native static dialog in automated Chromium
at all four widths/both themes: Enter/Space, Tab/Shift+Tab, native modality and
background focus blocking, Escape/close and opener restoration. The exact
document-focus boundary allowance and injected non-modal counterexample are in
[BROWSER_SMOKE.md](BROWSER_SMOKE.md). This does not convert human keyboard review,
screen-reader, touch or full WCAG checks into passing results.

R015 adds shared React/Vue background inert and a document focusin guard. Nineteen
new Vitest cases cover isolation and lifecycle; eight Chromium scenarios operate
both adapters at four widths/both themes, including real pointer/focus attempts,
inserted backgrounds and close/unmount/reopen. Native inert support is required;
no polyfill or nested/overlapping Modal support is provided. See the exact runtime
contract in [framework matrix](FRAMEWORK_MATRIX.md) and automated comparison scope
in [browser smoke](BROWSER_SMOKE.md). Human/assistive-technology checks remain
NOT_RUN; this does not establish full WCAG AA conformance.

R019 adds child keyboard ownership in React/Vue Modal: pre-cancelled and
isComposing keydown events are left to consumers. Thirteen Vitest cases cover
cancelled Escape/Tab, synthetic composing flags, ordinary controls and Gallery
notes. Eight additional Chromium cases exercise actual Escape cancellation and
later dismissal in both adapters and Gallery at four widths/two themes. These
checks do not exercise a real OS IME, screen reader or human keyboard review.

## Color contract (R006)

`packages/tokens/src/tokens.json` remains the source of truth. Run
`pnpm tokens:build` after changes; the default test gate checks both generated
CSS copies and shared/static component CSS drift.

- `overlay` supplies React/Vue Modal and native static dialog backdrop styling.
- `switch-track` / `switch-thumb` supply unchecked track and thumb colors; checked
  tracks use `primary`. Dark theme changes the thumb to retain contrast.
- `code-background` / `code-foreground` supply the Gallery CLI example.
- Focus uses an opaque `ring` with a 3px outline and 2px gap. The former 45%
  transparent ring failed the automated 3:1 contrast calculation on white.
- Light `muted-foreground` and light/dark `input` borders were adjusted to satisfy
  the tested pairs. Shared button/pagination text explicitly uses `foreground`.

Vitest calculates sRGB relative luminance and contrast without rounding pass/fail
thresholds. Text checks require 4.5:1 for foreground, muted text and primary text
against background/surface/surface-muted/muted/secondary, primary-foreground on primary
and hover fills, secondary text on secondary, and the code pair. Indicator checks
require 3:1 for ring/input against those surfaces, switch thumb against both
tracks, track against background/surface, and progress fill against muted.
Known black/white and failing translucent-ring cases verify the calculator.
These checks cover declared pairs, not arbitrary theme overrides, image/gradient
text, anti-aliasing, focus clipping/obscuring, or actual rendered layouts.

## DOM baseline

`pnpm test` includes `scripts/test/accessibility.test.tsx` with axe-core. It scans
all four Gallery tabs (including Sidebar/Footer) and open Modal states under light/dark theme
state, plus the static example before/after Tabs enhancement. An unnamed-button
negative case proves the gate reports a violation. Search naming/filtering,
result announcements and framework navigation/tablist names have regression
coverage. The Gallery Hero is inside main and follows heading order; progress
values are illustrative examples, not project-readiness metrics.

The App is imported without bootstrapping createRoot, so tests exercise the same
rendered component used by the Gallery. Tests use jsdom and do not load/render
product CSS. Two rules are explicitly disabled:

- `color-contrast`: unsupported by jsdom; declared token pairs are calculated
  separately above. Rendered contrast remains unverified.
- `label-content-name-mismatch`: its icon-ligature detection needs canvas font
  measurement unavailable in this environment. No passing canvas stub is used.

`landmark-one-main` / `page-has-heading-one` can report incomplete in jsdom because
rendered visibility cannot be established. Only these IDs are allowed as known
incomplete results; new IDs fail the gate. Separate structural assertions require
one main and one h1, but do not turn those incomplete results into browser passes.
All reported violations from enabled rules fail the test. There are no screenshot
baselines or human-approved axe/browser results.

## NOT_RUN

Human review in a real browser at 360/768/1280/1536, keyboard navigation including
native dialog Tab/inert/Escape, screen readers, physical touch/DPI, rendered
contrast/label-content-name checks, image/gradient contrast, cross-framework
screenshots, a full WCAG AA audit and approved visual baselines remain NOT_RUN.
The 48 template previews are covered by existing structural checks, not this axe
baseline; R009 separately checks their parser/layout scope. R008 runs three
isolated pnpm installs and all 144 generated build scripts; npm/yarn and other
OS installation matrices remain NOT_RUN.

References: [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
[axe jsdom limitations](https://github.com/dequelabs/axe-core#supported-browsers).
