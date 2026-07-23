# Validation Report

Date: 2026-07-23

## Passed
- Required workspace and documentation files.
- 48 unique template registry entries.
- 48 standalone preview directories with HTML, CSS and JavaScript.
- JSON parsing for all project JSON files.
- HTML parser checks for every preview.
- React exports: 26 functions/components (23 primary component families plus card composition helpers).
- Vue exports: 23 component families.
- CLI exhaustive matrix: 48 templates × 3 frameworks = 144 generated projects.
- Generated project metadata and required framework entry files.
- Node syntax checks for CLI and validation scripts.
- AcmeUI Web Skill frontmatter via the standard Skill Creator validator.
- Skill manifest, Codex `agents/openai.yaml`, relative validation snapshot, and
  live repository health through `scripts/validate-skill.mjs`.

## Environment limitation
A Chromium/Playwright visual screenshot pass was attempted, but local `file://`
and loopback navigation were blocked by the execution environment administrator
policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). Static structure, responsive CSS,
HTML parsing and generation tests passed. Run the Gallery locally after
`pnpm install` for final visual review.

## Commands
```bash
node scripts/validate.mjs
node scripts/validate-skill.mjs
node skills/acmeui-web/scripts/check-project.mjs .
node scripts/test-cli.mjs
pnpm install
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```
