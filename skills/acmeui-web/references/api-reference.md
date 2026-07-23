# AcmeUI Web API Reference

## Packages

- `@acmeui/core`: helpers and shared types (`cx`, `clampPercent`, `initials`, variants/tones).
- `@acmeui/tokens`: semantic token CSS/JSON.
- `@acmeui/styles`: framework-neutral CSS class contract.
- `@acmeui/react`: React components.
- `@acmeui/vue`: Vue components.
- `@acmeui/tailwind`: Tailwind CSS v4 theme/preset CSS.
- `@acmeui/static`: plain HTML/CSS assets.
- `@acmeui/cli`: site generator.

## React exports

`Button`, `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Badge`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Alert`, `Progress`, `Avatar`, `Tabs`, `Modal`, `DataTable`, `Breadcrumb`, `Pagination`, `Navbar`, `Sidebar`, `Hero`, `FeatureGrid`, `PricingTable`, `Footer`.

Notable conventions:

- `Button`: `variant`, `loading`, native button props.
- `Switch`: controlled `checked` or uncontrolled `defaultChecked`, `onCheckedChange`.
- `Tabs`: item array with `value`, `label`, and `content`.
- `Modal`: controlled `open`, `title`, `onClose`.
- `DataTable<T>`: typed columns plus row array.

## Vue exports

`Button`, `Card`, `Badge`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Alert`, `Progress`, `Avatar`, `Tabs`, `Modal`, `DataTable`, `Breadcrumb`, `Pagination`, `Navbar`, `Sidebar`, `Hero`, `FeatureGrid`, `PricingTable`, `Footer`.

Read each `.vue` file before assuming exact prop/event names. Preserve Vue idioms such as `v-model` and emitted updates when extending APIs.

## Stable CSS concepts

- Components use `acme-*` classes.
- Layout helpers include container, stack, cluster, and grid patterns.
- Theme state is represented through semantic variables and `data-theme`.
- Framework wrappers should remain thin and delegate appearance to shared CSS.

## CLI

```text
acmeui list
acmeui create <name> --framework react|vue|static --template <slug> [--out <dir>]
```

Safety behavior:

- Names permit letters, digits, dot, underscore, and hyphen.
- Unsupported framework/template values fail.
- Non-empty target directories fail rather than overwrite.
