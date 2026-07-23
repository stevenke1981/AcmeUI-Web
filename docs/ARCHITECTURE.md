# Architecture
```text
Application / Template
        ↓
React | Vue | Static HTML
        ↓
Framework-neutral class contract
        ↓
Semantic CSS tokens + component CSS
        ↓
Browser / CDN / static host
```
## Layers
- `packages/tokens`: color, spacing, radius and elevation source of truth.
- `packages/styles`: framework-neutral class contract.
- `packages/core`: shared types and deterministic helpers.
- `packages/react` / `packages/vue`: framework wrappers.
- `packages/tailwind`: Tailwind CSS v4 adapter.
- `templates` / `previews`: registry and deployable sites.
- `packages/cli`: scaffold generator.
- `apps/gallery`: discoverability and interactive documentation.
