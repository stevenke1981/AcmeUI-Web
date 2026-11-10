# Release 0.1.0
Multi-framework component and template platform with React, Vue 3, Tailwind CSS v4, plain HTML/CSS, CLI scaffolding, Gallery, 48 templates, documentation and deployment presets.

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
