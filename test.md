# Test Strategy
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
