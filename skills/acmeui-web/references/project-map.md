# Project Map

```text
AcmeUI-Web/
├── apps/gallery                 React component/template gallery
├── packages/core               Shared TS types and deterministic helpers
├── packages/tokens             Semantic tokens in CSS and JSON
├── packages/styles             Framework-neutral component styles
├── packages/react              React wrappers/components
├── packages/vue                Vue 3 wrappers/components
├── packages/tailwind           Tailwind CSS v4 adapter
├── packages/static             Static HTML/CSS distribution
├── packages/cli                Scaffold generator
├── templates/registry.json     Template metadata source
├── previews/<slug>             Deployable preview files
├── examples                    React, Vue, and static examples
├── docs                        Architecture/design/deployment/catalog
├── scripts/validate.mjs        Structural validation
├── scripts/test-cli.mjs        CLI generation matrix
├── AGENTS.md                   Repository-level agent rules
├── spec.md / plan.md / todos.md
└── test.md / final.md
```

The project requires Node.js 20.19 or newer and uses pnpm workspaces.
