# ROADMAP-007：第七輪 React/Vue Tabs cancelled click 稽核

稽核日期：2026-11-14。基準：`fix/r025-static-tabs-cancelled-click` / `f81591c`
（疊在未合併的 R023–R025／PR #26–#28）。R001–R025 的既有自動化項目皆已勾選或
疊加實作。本輪為 review/fix，僅限 AcmeUI-Web；沿用語意 CSS/token 與跨框架契約。

| ID | 優先序 | 稽核定位與驗收條件 | 狀態 |
|---|---|---|---|
| R026 | P2 | React/Vue Tabs click 尚未尊重 defaultPrevented；先取消的 click 應保留選取、aria-selected、roving tabindex 與面板可見性，一般 click 維持既有行為。static enhanceTabs 已由 R025 處理，不重複修改。Vitest 兩框架對照，四尺寸/亮暗色 Chromium 真實 click 驗證 | 已實作；修正前 4 個 targeted Vitest 失敗，修正後 4 通過；Chromium 8 個全數先失敗後通過 |

## R026 驗證證據

永久測試：`scripts/test/tabs-click-events.test.tsx`。修正前同一測試為
4 failed / 0 passed；失敗為 React 與 Vue 在 capture consumer 取消非選取 tab
的 click 後，第一個 tab 的 `aria-selected` 仍變為 `false`，期望值為 retained
`true`。原始本機輸出保存在 ignored `.cache/r026-before.log`。修正後同一組 4
個案例全數通過，且既有 `scripts/test/tabs-keyboard.test.tsx`（6）、
`scripts/test/tabs-values.test.tsx`（8）、`packages/react/test/tabs-modal.test.tsx`（12）、
`packages/vue/test/tabs-modal.test.ts`（12）與
`scripts/test/static-tabs-events.test.ts`（6）合計 48 passed。

新增 `scripts/browser/tabs-click-events.spec.ts`：360/768/1280/1536 × light/dark
在 React/Vue Tabs fixtures 用真實 capture consumer 取消第二次 tab（Beta）的
第一次 click，斷言 Alpha 仍選取且面板文字仍為 First；第二次 click 才切到
Beta。修正前 8 個全數失敗（ignored `.cache/r026-before-browser.log`），套回
修正後 8 passed（`.cache/r026-after-browser.log`）。此為 Chromium-only
自動化契約，不是真人鍵盤／視覺、Firefox/WebKit 或螢幕閱讀器驗證。

```bash
pnpm exec vitest run scripts/test/tabs-click-events.test.tsx
pnpm exec vitest run scripts/test/tabs-click-events.test.tsx scripts/test/tabs-keyboard.test.tsx scripts/test/tabs-values.test.tsx packages/react/test/tabs-modal.test.tsx packages/vue/test/tabs-modal.test.ts scripts/test/static-tabs-events.test.ts
pnpm typecheck
```

本機完整 gates 皆 exit 0：`pnpm install --frozen-lockfile`、`pnpm test`
（362 Vitest / 32 files）、`pnpm test:cli:installed`、`pnpm typecheck`、
`pnpm build`、`pnpm test:browser`（107 Chromium）。hosted CI 結果記錄於 R026 PR。

## 人工與授權邊界

NOT_RUN：真人瀏覽器／視覺／鍵盤審查（360/768/1280/1536）、真實 OS IME/注音、
螢幕閱讀器、實體觸控/DPI、Firefox/WebKit/其他 OS、完整 rendered contrast/label、
全家族狀態截圖、完整 WCAG AA、人工核准視覺回歸 baseline、npm/yarn 安裝矩陣。
合成事件與 jsdom 僅代表列出的 DOM 自動化範圍，不宣稱原生鍵盤或視覺驗證。
不 npm publish、不發 release、不部署、不改 repo settings、不破壞性刪除或
force-push，不宣稱專案完成或可上線。
