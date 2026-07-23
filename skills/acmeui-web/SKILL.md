---
name: acmeui-web
description: Build, extend, scaffold, review, and validate AcmeUI Web projects. Use when an agent works in the AcmeUI-Web monorepo, uses @acmeui React/Vue/static packages, creates sites from AcmeUI templates, adds cross-framework components, edits semantic tokens, updates the Gallery, or prepares static deployment.
---

# AcmeUI Web Agent Skill

Use this skill for work involving **AcmeUI Web**, a semantic-first, multi-framework component library and deployable template platform.

## Trigger conditions

Activate this skill when any of these are true:

- The repository contains `packages/react`, `packages/vue`, `packages/styles`, and `templates/registry.json`.
- The user mentions AcmeUI Web, `@acmeui/*`, an AcmeUI template slug, the AcmeUI CLI, or the Gallery.
- The task adds or changes a component that must remain aligned across React, Vue, Tailwind, and static HTML.
- The task creates a website from one of the template previews.
- The task modifies semantic tokens, responsive behavior, accessibility, packaging, or deployment.

Do not activate for the Rust-native `AcmeUI-Native` repository unless the task explicitly bridges Native and Web.

## Operating modes

Classify the task before editing:

1. **Scaffold site** — create React, Vue, or static output from a template.
2. **Use components** — build a page/application with existing AcmeUI components.
3. **Add component** — create or extend a component family across frameworks.
4. **Add template** — add a registry entry and deployable preview.
5. **Theme/token work** — modify semantic design tokens or framework-neutral styles.
6. **Review/fix** — diagnose build, API alignment, accessibility, responsive, or template issues.
7. **Release/deploy** — validate packages and prepare static hosting or container deployment.

## Required repository orientation

Before implementation, read the smallest relevant set:

- Always: `README.md`, `AGENTS.md`, `package.json`.
- Architecture work: `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`.
- Component work: `packages/core/src/index.ts`, `packages/styles/src/base.css`, framework entrypoints.
- Template work: `templates/registry.json`, `docs/TEMPLATE_CATALOG.md`, one related preview.
- CLI work: `packages/cli/bin/acmeui.mjs`, `scripts/test-cli.mjs`.
- Project status: `spec.md`, `plan.md`, `todos.md`, `test.md`, `final.md`.

Run `node skills/acmeui-web/scripts/check-project.mjs <repo>` from the
AcmeUI-Web repository root when repository shape is uncertain. From an
installed copy, run `<skill-root>/scripts/check-project.mjs <repo>` instead.

## Core architecture contract

Preserve this dependency direction:

```text
Application / Template
        ↓
React | Vue | Static HTML
        ↓
Framework-neutral acme-* class contract
        ↓
Semantic CSS tokens + component CSS
        ↓
Browser / CDN / static host
```

Responsibilities:

- `packages/tokens`: source of truth for semantic values.
- `packages/styles`: framework-neutral `acme-*` class contract.
- `packages/core`: shared deterministic helpers and types.
- `packages/react`: React wrappers and interactive state.
- `packages/vue`: Vue wrappers and interactive state.
- `packages/tailwind`: Tailwind CSS v4 adapter.
- `packages/static`: plain HTML/CSS integration.
- `templates` and `previews`: registry plus independently deployable pages.
- `packages/cli`: scaffolding only; it must not become a second design system.
- `apps/gallery`: discoverability, examples, and public API demonstration.

Never move framework-specific assumptions into tokens or common CSS.

## Semantic styling rules

- Use semantic CSS variables and `acme-*` classes. Do not hardcode product colors inside framework components.
- Every surface/background token must have an appropriate foreground/text token.
- Keep light and dark themes aligned.
- Preserve visible keyboard focus and WCAG AA baseline contrast.
- Respect `prefers-reduced-motion`.
- Use shared component CSS before adding framework-local styling.
- Add new raw values first to tokens, then expose them through semantic styles.
- Tailwind integration must consume semantic variables rather than duplicate the palette.

## Component workflow

When adding or materially changing a public component:

1. Define the framework-neutral anatomy, states, variants, keyboard behavior, and class names.
2. Add/update shared CSS in `packages/styles`.
3. Add deterministic shared helpers/types to `packages/core` only when genuinely reusable.
4. Implement React API in `packages/react`.
5. Implement equivalent Vue API in `packages/vue`.
6. Add static HTML usage documentation or example when the component is representable without a framework.
7. Export the component from each package entrypoint.
8. Update Gallery examples.
9. Add validation for export/API drift.
10. Run all quality gates.

Cross-framework equivalence means equivalent intent and behavior, not mechanically identical syntax.

### Current component families

Button, Card, Badge, Field, Input, Textarea, Select, Checkbox, Switch, Alert, Progress, Avatar, Tabs, Modal, DataTable, Breadcrumb, Pagination, Navbar, Sidebar, Hero, FeatureGrid, PricingTable, Footer.

React additionally exposes `CardHeader`, `CardContent`, and `CardFooter` composition helpers.

## Template workflow

When adding a template:

1. Choose a unique lowercase kebab-case slug.
2. Add one entry to `templates/registry.json` with `slug`, `name`, `category`, `description`, `frameworks`, `palette`, `layout`, and `preview`.
3. Create `previews/<slug>/index.html`, `style.css`, and `script.js`.
4. Ensure the preview works by opening `index.html` directly and under a static server.
5. Use stable selectors expected by the CLI. Keep the body extractable and theme toggle progressive-enhancement friendly.
6. Add the template to `docs/TEMPLATE_CATALOG.md` and Gallery.
7. Test CLI generation for React, Vue, and static output.

Do not create a registry entry without a complete deployable preview.

## Scaffold workflow

List templates:

```bash
node packages/cli/bin/acmeui.mjs list
```

Create a React site:

```bash
node packages/cli/bin/acmeui.mjs create my-site \
  --framework react \
  --template saas-launch
```

Create Vue or static sites by changing `--framework` to `vue` or `static`.

After scaffolding:

1. Inspect `acmeui.template.json`.
2. Replace generated content incrementally; preserve token/theme setup.
3. Convert injected preview markup into native framework components when long-term maintenance matters.
4. Run install/build in the generated output.
5. Verify 360, 768, 1280, and 1536 px widths.

The current generator uses preview markup as a fast starting point. Do not claim generated React/Vue pages are fully componentized unless you performed that conversion.

## Review and repair workflow

Check in this order:

1. Repository/workspace structure.
2. JSON and package metadata.
3. Shared class/token contract.
4. React/Vue export parity.
5. Template registry-to-preview integrity.
6. CLI generation.
7. Typecheck/build.
8. Keyboard/accessibility.
9. Responsive visual behavior.
10. Documentation and project status files.

For bugs, reproduce first and add the smallest regression check that would have caught the issue.

## Quality gates

Run from repository root:

```bash
corepack enable
pnpm install
pnpm test
pnpm typecheck
pnpm build
```

Fast, dependency-light checks:

```bash
node scripts/validate.mjs
node scripts/test-cli.mjs
```

Required visual widths: `360`, `768`, `1280`, `1536`.

Completion requires:

- No missing registry previews.
- No React/Vue public export drift unless documented intentionally.
- No hardcoded component product colors.
- Keyboard-visible focus remains functional.
- Dark mode and reduced-motion remain functional.
- Gallery/docs are updated for public changes.
- `todos.md`, `test.md`, and `final.md` reflect completed work when the repository workflow uses them.

## Safety and Git discipline

- Never delete broad paths, rewrite history, or force-push without explicit approval.
- Keep generated test output outside tracked source directories.
- Do not overwrite a non-empty scaffold target.
- Do not silently modify all templates for a local issue.
- Prefer a feature branch and focused commits for multi-file changes.
- Report commands run, failures, and unverified areas honestly.

## Output contract for agents

At completion, report:

1. Task mode selected.
2. Files changed and why.
3. Cross-framework synchronization performed.
4. Commands/tests run and results.
5. Responsive/accessibility checks performed.
6. Remaining limitations or intentional differences.

Load bundled resources only when needed:

- `references/project-map.md` for repository orientation.
- `references/workflows.md` for detailed implementation and release checklists.
- `references/api-reference.md` before changing or consuming public APIs.
- `examples/prompts.md` for invocation examples.
