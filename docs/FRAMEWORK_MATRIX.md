# Framework Matrix
| Capability | React | Vue 3 | Tailwind v4 | Static HTML |
|---|---:|---:|---:|---:|
| Semantic tokens | ✅ | ✅ | ✅ | ✅ |
| Component families | 23 | 23 | Utility adapter | CSS classes |
| Dark theme | ✅ | ✅ | ✅ | ✅ |
| Template CLI | ✅ | ✅ | Theme integration | ✅ |
| Standalone previews | ✅ | ✅ | ✅ | ✅ |
| SSR-compatible styling | ✅ | ✅ | ✅ | n/a |
| Tabs keyboard / Modal focus | Vitest | Vitest | Styling adapter | Optional ES module + native dialog (Vitest DOM) |

`node scripts/validate.mjs` 固定檢查 React/Vue 的 23 家族與 React 額外三個
Card composition helpers，也檢查 static/shared CSS 漂移。新增公開家族時須更新
驗證器契約、雙框架 API、文件與 Gallery。此 gate 驗證名稱與資料結構，不代表
型別 API 完全一致、真人瀏覽器視覺對齊或 WCAG AA 審查通過。

靜態 HTML 的 [Tabs／Modal 範例](../apps/gallery/static.html) 由 Gallery 一起打包。
Tailwind 只提供樣式；可搭配相同的 HTML 與互動 module。原生 dialog 的 Tab、
inert、Escape 已在 R013 以 Chromium 自動驗證；jsdom 測試僅驗證 native API
委派，真人審查仍為 NOT_RUN。

React/Vue Modal 共用背景 sibling branches 的 native inert 與 focusin 防護，
包含新增節點；關閉/卸載會還原原有 inert 與開啟者焦點。不附 inert polyfill。
每份 document 同時只支援一個開啟的 Modal；巢狀/重疊開啟會拋出錯誤，
多個關閉實例與依序開啟可用。使用 connected light DOM，不支援 shadow root、
portal 到面板外的內容，也不支援開啟期間由應用程式修改 inert。
完整契約見 [API reference](../skills/acmeui-web/references/api-reference.md)。

## Tailwind reset 與自動化版面比較

Tailwind adapter 匯入 theme/utilities，刻意不匯入 preflight；請搭配
`@acmeui/styles/base.css`，由共享 CSS 管理 reset。原先疊加 preflight 會改變
Hero、段落、表格等原生預設樣式，導致跨框架差異。`acme-focus` 使用不透明的
`--acme-ring`，與共享 `:focus-visible` 一致。

`pnpm test:browser` 實際編譯 Tailwind fixture，在 360/768/1280/1536 與 light/dark
比較 React/Vue/static/Tailwind 的代表元件幾何與 computed styles（容許 1px
捨入差異），也檢查原生鍵盤 focus-visible。這是自動 smoke，不是截圖 baseline
或人工視覺核准。完整範圍見 [browser smoke](BROWSER_SMOKE.md)。
