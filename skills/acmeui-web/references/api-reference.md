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

- `Button`: `variant`, `loading`, native button props. Defaults to `type="button"`;
  opt into `type="submit"` for form submission. Loading replaces children/slot text
  with 載入中…, disables activation and sets `aria-busy`.
- `Switch`: controlled `checked` or uncontrolled `defaultChecked`, `onCheckedChange`,
  `disabled` and native button attributes. It always uses `type="button"`.
- `Tabs`: item array with `value`, `label`, and `content`; optional `label` names
  the tablist (default 分頁內容) in both frameworks.
  Values must be unique strings (an empty string is valid). `defaultValue` is
  initial only. Unknown defaults or removed selections fall back to the first
  available item; an empty list clears selection, and a later refill selects
  its first item. Reordering preserves an existing selection and keyboard order.
  All panels remain mounted so every tab's aria-controls resolves. Inactive panels
  use hidden (React) / display:none via v-show (Vue), preserving content across
  selection/reorder; React child state, effects and uncontrolled values remain
  mounted. Removing an item or clearing the list unmounts its content. Consumers
  should pause effects that depend on active visibility themselves.
- `Navbar`: optional `label` names its navigation (default 主要導覽), in both frameworks.
- `Modal`: controlled `open`, `title`, `onClose`.
- Modal focus in React / Vue skips hidden, inert, aria-hidden, disabled and
  negative-tabindex descendants. Tab from the panel falls back to the first
  sequential control; Shift+Tab falls back to the last. Use tabindex 0 / -1
  within dialogs; positive tabindex ordering is unsupported.
- React/Vue Modal applies native `inert` to background sibling branches up to body,
  including newly inserted siblings. A document `focusin` guard redirects outside
  focus to the first eligible control (or panel fallback). Close/unmount removes
  listeners/observer, restores prior inert values, then focuses a connected opener.
  Existing aria-hidden values are untouched. Requires browser native inert support;
  no inert polyfill is bundled. Only one open Modal per document is supported:
  nested/overlapping activations throw before changing the existing isolation.
  Multiple closed instances and sequential openings are supported. Use connected
  light DOM; shadow-root/portaled dialog content and app changes to inert while
  open are outside the contract. Static/Tailwind dialog uses native showModal.
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

## Form and numeric behavior (R005)

Vue Switch uses `v-model` / `update:modelValue`, or local state initialized by
`defaultChecked` when `modelValue` is absent. Both framework Switches expose
a boolean `aria-checked` and `data-checked`. Vue Checkbox forwards native
attributes (`id`, `name`, `required`, `disabled`, etc.) to the actual input.
Vue form controls retain idiomatic `v-model`; React uses native value/events.

Both Progress implementations use `clampPercent`: finite values clamp to 0–100;
NaN and infinities map to 0. Both Pagination implementations use `paginationState`:
totals floor to nonnegative safe integers; nonfinite/empty totals display no page
and disable both directions. Pages floor/clamp to range (nonfinite defaults to 1);
the visible window contains the current page and at most seven consecutive pages.
Normalization affects rendering/events, not the parent value; Pagination remains
controlled (`onPageChange` in React, `change` in Vue). Navigation buttons have
explicit names and `type="button"`. Static/Tailwind users apply the same classes
and native attributes; no separate form-state runtime is provided.

## Presentation extensions (R007)

React `DataTable<T>` uses typed `column.render(value, row)`; Vue uses the typed
`#cell="{ value, row, column }"` scoped slot with a string fallback. Vue row keys
remain dynamic strings; React keys are `keyof T`. Both render scoped column headers.
React FeatureGrid takes `item.icon`; Vue uses `#icon="{ item }"`. Navbar brand is
ReactNode in React and text in Vue; actions/visuals use React props or named Vue
slots. These are intentional framework idioms, not identical TypeScript APIs.
Avatar initials now expose role=img/name; actual images retain native alt text.
Breadcrumb marks the last non-link item current. Pricing buttons never implicitly
submit a containing form. Shared CSS and semantic tokens are unchanged.

CLI parsing (R008): create requires exactly one safe name; the three flags accept
`--key value` and `--key=value`, in either order relative to the name. Unknown,
duplicate and missing/empty values fail before output creation. list/help accept
no extra arguments. Generated React/Vue theme listeners are scoped to the app
root and removed by the framework's unmount lifecycle.

R009 layout: Pagination wraps at narrow widths. Tailwind theme imports
Tailwind theme/utilities without preflight; load shared base.css for the reset.
The acme-focus utility uses the same opaque semantic ring as :focus-visible.
