# Test Strategy
- `node scripts/validate.mjs`: files, registry, previews, component parity.
- `node scripts/validate-skill.mjs`: Skill structure, metadata, manifest and live project health.
- `node scripts/test-cli.mjs`: React, Vue and static scaffolding smoke tests.
- After install: `pnpm typecheck && pnpm build`.
