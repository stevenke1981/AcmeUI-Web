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
