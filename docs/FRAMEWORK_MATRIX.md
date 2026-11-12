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

R017 對齊 React/Vue Modal 的原生 radio 群組與 contenteditable editing host 焦點。
群組依 name、form owner、DOM tree 區分；未具名 radio 獨立。一般 Tab 與
方向鍵仍由瀏覽器處理，邊界以當下可聚焦的已選項為準；空值/plaintext-only
編輯區納入候選，巢狀編輯區須 tabindex=0。Static/Tailwind 保留原生 dialog
委派，所有 adapter 共用樣式/token 未變。正 tabindex、iframe 內部與 shadow
DOM 循序焦點不在契約內；未選取 radio 的瀏覽器歷史行為不保證跨引擎相同。

R019 讓 React/Vue 共用 Modal handler 尊重先行取消的鍵盤事件與 isComposing；
子控制項可以先處理 Escape，之後未取消的 Escape 仍關閉。Gallery 備註展示
先結束編輯、再次 Escape 關閉。Tab/Shift+Tab 的取消與組字旗標由 Vitest
對照，Chromium 用真實 Escape 操作兩框架及 Gallery；OS IME 不在自動驗證內。
Static/Tailwind 仍由原生 dialog 事件負責互動，共用樣式與 tokens 未變。

R021 的 static/Tailwind enhancement 尊重已取消的開啟 click、關閉 click 與原生
cancel；消費端須在 enhancer listener 前處理（例如 capture）。Gallery 可先
取消一次 Escape／關閉按鈕並保留內容；cleanup 仍明確關閉與解除 listener。
這是原生 dialog 委派的事件取消契約；React/Vue 維持 R019 鍵盤契約。

R022：React/Vue Modal 的循序焦點候選納入 details 的第一個明確 summary，
closed details 只保留該 summary 子樹；巢狀與動態 open/close 每次重新計算。
static/Tailwind 的同一 details HTML 由原生 dialog 處理。Gallery 與八個新增
四尺寸/亮暗色 Chromium 案例展示展開、收合、Tab/Shift+Tab 與草稿保留；
沒有額外 CSS/token 或人工視覺 baseline。請提供明確 summary，瀏覽器自動
生成的 fallback summary、shadow DOM 與正 tabindex 不在 helper 契約內。

## Switch cancelled click (R023)

React/Vue Switch ignore clicks already defaultPrevented, preserving checked state
and emitting no onCheckedChange / update:modelValue. Cancel before the component
handler, for example with a capture listener; React also calls its consumer
onClick prop before checking cancellation. Ordinary and controlled behavior is unchanged.

## Modal visibility override (R024)

`getFocusable` / Modal Tab trapping evaluate a candidate's own computed
`visibility`. An ancestor with `visibility:hidden|collapse` no longer excludes a
descendant that overrides to `visible`; without an override the inherited value
still excludes it. Ancestor `display:none`, `hidden`, `inert`, `aria-hidden` and
closed-details exclusions are unchanged. React/Vue share this helper; static and
Tailwind use the native dialog. No CSS/token changes.
