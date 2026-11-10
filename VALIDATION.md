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

CLI scaffolding currently checks entry files and metadata; it does **not**
yet install or build generated projects. Current preview checks are structural
string checks, **not** full HTML parser validation. Export checks are currently
one-way. See [ROADMAP-001](docs/roadmap/ROADMAP-001.md) for follow-up gates.

## NOT_RUN

- Human review in a real browser, including 360 / 768 / 1280 / 1536 widths.
- Screen readers, physical touch, device DPI, full WCAG AA audit.
- Cross-framework screenshot comparisons, human-approved visual regression baselines.
- Generated-project dependency installation and standalone build matrix.
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
