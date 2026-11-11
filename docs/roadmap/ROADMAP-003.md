# ROADMAP-003：第三輪互動契約稽核

稽核日期：2026-11-11。基準：`master` / `2058a04`（R014 / PR #16、
R015 / PR #17 已合併；各自五項本機 gates、兩組 hosted CI PASS）。
模式：Review/fix，僅限 AcmeUI-Web。本輪先完成 R016，一個切片一個 PR。

## 範圍與發現

- 檢查 React/Vue Tabs、共用 focus/Modal helper、static enhancement、Gallery
  動態例子及 family coverage、Vitest、Chromium 與現有文件。R001–R015 的既有
  自動化證據不視為本輪新增成果。
- React Tabs 只渲染選取中的 panel；未選取 tab 的 `aria-controls` 指向不存在
  的 ID。Vue 的 v-show 與 static hidden 則保留所有 panel。React 切換分頁
  同時卸載內容，表單未受控值會消失。現有測試只查目前 panel，沒有檢查所有
  tab 的 IDREF 或內容生命週期。
- Gallery family coverage 只用 querySelector；保留 inactive panels 後，單純
  DOM 存在就可能把 hidden/aria-hidden/inert 的範例誤計為可到達。R016 需同時
  強化這個 gate，不能用隱藏內容補足覆蓋率。
- `focusableSelector` 只列出 `[contenteditable=true]`，也未處理 radio group
  的原生循序焦點選取。現有測試缺少這些候選與真實 Tab 邊界。這是原始碼與
  覆蓋缺口；radio 的實際瀏覽器結果待 R017 重現，未宣稱已驗證或已修復。

## 可驗收切片

| ID | 優先序 | 範圍與自動驗收 | 狀態 |
|---|---|---|---|
| R016 | P1 | React 保留每個 panel，hidden 控制選取可見性；所有 tab/panel IDREF 在切換/重排後有效，內容值保留；Vue 對照測試、Gallery 草稿範例與可見家族 gate，四尺寸/亮暗色 Chromium 驗證 | 已實作；本機五 gates PASS（273 Vitest / 43 Chromium），CI/合併見本切片 PR |
| R017 | P2 | 先以 Vitest/Chromium 重現 radio group 與空值/plaintext-only contenteditable 的 sequential focus；修正共用候選/Tab 邊界並保留 React/Vue 對照，更新 Gallery/API 與未支援情境 | 待後續 |

每個切片仍須 `pnpm test`、`pnpm test:cli:installed`、`pnpm typecheck`、
`pnpm build`、`pnpm test:browser` PASS；hosted CI 全綠且 MERGEABLE 才用
merge commit 合併，不等待 Codex review。

## 人工與授權邊界

NOT_RUN：真人瀏覽器/視覺/鍵盤審查（360/768/1280/1536）、螢幕閱讀器、
實體觸控/DPI、Firefox/WebKit/其他 OS、完整 rendered contrast/label、
全家族/狀態截圖、完整 WCAG AA、人工核准視覺 baseline 與 npm/yarn 安裝矩陣。
視覺 baseline 必須等待人工核准的瀏覽器 release，不能由自動 smoke 標記完成。
npm publication、release、部署與 repo settings 不在本次範圍；不宣稱專案完成
或 production-ready。
