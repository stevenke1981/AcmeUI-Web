# @acmeui/tailwind

Tailwind v4 adapter：theme/utilities 與語意 tokens，搭配共用元件 CSS 使用。
刻意省略 preflight，避免第二份 reset 改變原生元件外觀。

```css
@import "@acmeui/tailwind/theme.css";
@import "@acmeui/tailwind/preset.css";
@import "@acmeui/styles/base.css";
```

```html
<button type="button" class="acme-button acme-button--primary focus-visible:acme-focus">
  儲存
</button>
```

不要另外疊加完整的 `@import "tailwindcss"`，否則會重新引入 preflight。
專案若刻意需要不同 reset，請自行審查整合後的版面與可存取性。
`pnpm test:browser` 會實際編譯這個 adapter 並與 React/Vue/static 代表元件比較；
範圍與限制見 [browser smoke](../../docs/BROWSER_SMOKE.md)。
