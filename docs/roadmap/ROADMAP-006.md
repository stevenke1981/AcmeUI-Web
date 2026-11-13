# ROADMAP-006：第六輪 cancelled click 與 visibility 稽核

稽核日期：2026-11-13。基準：`master` / `e592160`。
本輪為 review/fix，僅限 AcmeUI-Web；沿用語意 CSS/token 與跨框架契約。

| ID | 優先序 | 稽核定位與驗收條件 | 狀態 |
|---|---|---|---|
| R023 | P2 | Vue Switch 在 capture consumer 已取消 click 後仍切換／emit；toggle 接收事件並先檢查 defaultPrevented，保留 disabled guard、一般與受控 modelValue 行為。React/Vue Vitest 覆蓋取消、一般、受控與 disabled；另確認 React onClick 先執行並可取消切換 | 已實作；修正前 4 個 Vue 案例失敗，修正後 12 個 targeted Vitest 通過 |
| R024 | P2 | core focusCandidates 排除 visibility:hidden 祖先內明確 visibility:visible 的控制項，造成 Modal Tab trap 遺漏；只檢查 el 自身 computed visibility，祖先仍依 display:none／hidden／inert／aria-hidden 排除；補 core 與 adapter 焦點回歸驗證 | 已實作；修正前 6 failed / 8 passed，修正後 14 個 targeted Vitest 通過 |
| R025 | P2 | static enhanceTabs click 尚未尊重 defaultPrevented；先取消的 click 應保留選取／焦點，一般 click 維持既有行為，補事件交接測試 | 已實作；修正前 5 failed / 1 passed，修正後 6 個 targeted Vitest 通過；Chromium 8 個全數先失敗後通過 |

## R023 驗證證據

永久測試：`scripts/test/switch-events.test.tsx`。修正前同一測試為
4 failed / 8 passed，失敗全為 Vue cancelled click；原始本機輸出保存在 ignored
`.cache/r023-before.log`。修正後 12 passed，React runtime 不需變更。
涵蓋初始 true/false、aria-checked/data-checked、事件次數與受控 prop 更新。

```bash
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm exec vitest run scripts/test/switch-events.test.tsx
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm typecheck
```

完整 gates（pnpm test/test:cli:installed/typecheck/build/test:browser）與 hosted CI 結果記錄於 R023 PR。

## 人工與授權邊界

NOT_RUN：真人瀏覽器／視覺／鍵盤審查（360/768/1280/1536）、真實 OS IME、
螢幕閱讀器、實體觸控/DPI、Firefox/WebKit/其他 OS、完整 rendered contrast/label、
全家族狀態截圖、完整 WCAG AA、人工核准視覺回歸 baseline、npm/yarn 安裝矩陣。
合成事件與 jsdom 僅代表列出的 DOM 自動化範圍，不宣稱原生鍵盤或視覺驗證。
不 npm publish、不發 release、不部署、不改 repo settings、不破壞性刪除或
force-push，不宣稱專案完成或可上線。

## R024 驗證證據

`packages/core/test/visibility-focus.test.ts` 與 `scripts/test/visibility-focus.test.tsx`：
移除修正後 6 failed / 8 passed（ignored `.cache/r024-before.log`），套回後 14 passed。
`scripts/browser/visibility-focus.spec.ts` 以四尺寸／雙主題 Chromium 真實 Tab／Shift+Tab
驗證 React/Vue Modal：修正前 8 個全數失敗，修正後通過。jsdom 已斷言 hidden/collapse 繼承。
完整 gates 與 hosted CI 記錄於 R024 PR。

## R025 驗證證據

永久測試：`scripts/test/static-tabs-events.test.ts`。修正前 5 failed / 1 passed；
失敗為 capture consumer（enhancement 前後註冊）取消 tab 或其子元素 click 後，
`aria-selected` 仍被切到 usage，期望值為 retained `true`、實際值為 `false`。
原始本機輸出保存在 ignored `.cache/r025-before.log`。修正後同一組 6 個案例
全數通過，且既有 `packages/static/test/interactions.test.ts`（23）與
`scripts/test/tabs-keyboard.test.tsx`（6）合計 35 passed。

新增 `scripts/browser/static-tabs-events.spec.ts`：360/768/1280/1536 × light/dark
在 Gallery static Tabs 用真實 capture consumer 取消「使用方式」第一次 click，
斷言「總覽」仍選取且可見；第二次 click 才切到「使用方式」。修正前 8 個全數
失敗（ignored `.cache/r025-before-browser.log`），套回修正後 8 passed
（`.cache/r025-after-browser.log`）。此為 Chromium-only 自動化契約，不是
真人鍵盤／視覺、Firefox/WebKit 或螢幕閱讀器驗證。

```bash
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm exec vitest run scripts/test/static-tabs-events.test.ts
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm exec vitest run scripts/test/static-tabs-events.test.ts packages/static/test/interactions.test.ts scripts/test/tabs-keyboard.test.tsx
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm typecheck
```

本機完整 gates 皆 exit 0：`pnpm install --frozen-lockfile`、`pnpm test`
（358 Vitest / 31 files）、`pnpm test:cli:installed`、`pnpm typecheck`、
`pnpm build`、`pnpm test:browser`（99 Chromium）。hosted CI 結果記錄於 R025 PR。
