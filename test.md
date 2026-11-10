# Test Strategy
- `node scripts/validate.mjs`: files, registry, previews, component parity.
- `node scripts/validate-skill.mjs`: Skill structure, metadata, manifest and live project health.
- `node scripts/test-cli.mjs`: React, Vue and static scaffolding smoke tests.
- After install: `pnpm typecheck && pnpm build`.

## 2026-11-10 / R001

- `pnpm test`: token drift, registry, Skill, 144 CLI scaffolds and 20 Vitest cases.
- Vitest: React/Vue Tabs + Modal integration; shared focus filtering, boundary
  wrapping, hidden/inert/disabled ancestors, container and empty-list fallback.
- `pnpm typecheck` and `pnpm build`: passed; no build warnings observed.
- jsdom only; manual browser, four responsive widths, screen reader, touch/DPI
  and approved visual baselines remain NOT_RUN. See `VALIDATION.md`.
