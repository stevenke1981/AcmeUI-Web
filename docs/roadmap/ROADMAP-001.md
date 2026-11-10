# ROADMAP-001：可自動化品質缺口

稽核日期：2026-11-10。基準：`master` / `79aa7d1`（PR #2）。
模式：Review/fix。僅限 AcmeUI-Web；不發布套件、不建立 release、不變更設定。

## 稽核結論

- PR #2 **已同時實作 React 與 Vue** 的 Tabs 箭頭／Home／End、roving tabindex、Modal Escape／焦點循環／焦點還原；現有 Vitest 共 8 個案例。不可把 Vue parity 當成尚未實作。
- `getFocusable` 只排除自身的 disabled / aria-hidden；隱藏祖先、inert、CSS 隱藏、負 tabindex 與 disabled fieldset 仍可能污染焦點循環。`trapTabKey` 從 dialog 容器或不可 Tab 的後代起始時也可能漏出。
- CLI 的 48 × 3 矩陣只驗證入口檔案與 metadata。React 產物未宣告 React 型別套件；React / Vue HTML 外殼缺少語言、viewport 與標題。尚無產物編譯 gate。
- `scripts/validate.mjs` 以 Vue 匯出清單迴圈檢查 Vue 自己，無法偵測 Vue 刪除元件或 React 獨有家族；預覽只用字串檢查 doctype / viewport。靜態 `base.css` 是手動副本，沒有 drift gate。
- 除 Tabs / Modal 外，21 個元件家族與 core helpers 缺少行為測試；例如 Vue Progress 未共用非有限值防護、Vue Button loading 的 slot 仍顯示原文、Pagination 超過 7 頁無法顯示目前頁。
- 靜態 HTML 套件目前只有 CSS 與按鈕 README；未提供 Tabs / Modal 的鍵盤 JS 或原生 dialog 示範。Tailwind 為樣式 adapter，沒有獨立互動實作。
- 共用 CSS 仍有 switch 白色與 modal overlay 原始色值；focus ring 的混色對比尚無自動計算。Gallery 搜尋框缺少明確 accessible name，展示未涵蓋所有家族。
- `VALIDATION.md` 日期與範圍已落後於 PR #1 / #2；`test.md` 未列 Vitest。既有「Passed」包含未在目前腳本執行的 HTML parser / JSON 全域檢查。

## 優先序與可驗收切片

| ID | 優先序 | 具體範圍與自動驗收 | 狀態 |
|---|---|---|---|
| R001 | P0 | 修正共用 Modal 焦點候選與容器 fallback；core 反例測試、React / Vue 隱藏內容整合測試、Gallery 範例 | [PR #3](https://github.com/stevenke1981/AcmeUI-Web/pull/3) 已合併 |
| R002 | P0 | 補齊 CLI 產物的型別依賴與語意 HTML 外殼；以既有 workspace toolchain 編譯全部 React / Vue 產物，Vitest 覆蓋錯誤輸入與非空目標保護 | [PR #4](https://github.com/stevenke1981/AcmeUI-Web/pull/4) 已合併 |
| R003 | P1 | 固定 23 家族契約、雙向 export parity、static/shared CSS drift、registry metadata / preview / catalog / Gallery 資料對齊；以壞 fixture 驗證 validator 確實失敗 | 已完成（50 tests / 本機 gates PASS） |
| R004 | P1 | 靜態 HTML Tabs / Modal 漸進增強範例與可選 JS；鍵盤、焦點、cleanup 測試；更新 framework matrix 與 Gallery 連結 | [PR #6](https://github.com/stevenke1981/AcmeUI-Web/pull/6) 已合併（native Tab 待瀏覽器） |
| R005 | P1 | 表單／Switch／Button／Progress／Pagination 邊界行為與 React / Vue 對照測試；修正可重現 API 差異並更新 Gallery | [PR #7](https://github.com/stevenke1981/AcmeUI-Web/pull/7) 已合併 |
| R006 | P1 | 語意 overlay / switch tokens、亮暗色文字與 focus 對比自動計算、Gallery accessible names、axe 基線；不得以 jsdom 代替瀏覽器審查 | 已完成自動化（110 tests / 本機 gates PASS；瀏覽器審查 NOT_RUN） |
| R007 | P2 | 其餘展示元件的語意、插槽、原生屬性與 export API 測試；單元測試也納入 TypeScript 檢查 | [PR #9](https://github.com/stevenke1981/AcmeUI-Web/pull/9) 已合併（147 tests；人工瀏覽器 NOT_RUN） |
| R008 | P2 | CLI 完整參數 parser（未知／重複／缺值 flags）、產物 theme listener cleanup 與套件安裝後實際 build matrix | [PR #10](https://github.com/stevenke1981/AcmeUI-Web/pull/10) 已合併（170 tests；3 隔離安裝 / 144 script builds） |
| R009 | P2 | 以 HTML parser 驗證 48 預覽的巢狀結構／重複 ID／連結；360/768/1280/1536 自動瀏覽器 layout smoke 與跨框架比較 | 已完成自動化（185 Vitest / 25 Chromium；人工審查 NOT_RUN） |
| R010 | P2 | CI / docs 的驗證命令與結果範圍同步，build warnings 分類並設 gate；建立 Gallery 全家族覆蓋檢查 | 已完成自動化（209 Vitest / 25 Chromium；人工審查 NOT_RUN） |

R001–R010 的自動化切片已實作；目前 todos 沒有其餘已授權的未勾選自動化項目。
視覺 baseline 與 npm 發布繼續維持未勾選，不將自動化通過等同於專案完成或
人工審查通過。CI 與合併證據見各 PR；不等待額度已用盡的 Codex review。

## 基準驗證與限制

基準命令與後續每個切片結果記錄於 `VALIDATION.md`。
初次 pnpm 執行因全域 Corepack cache 權限失敗；改用 repo 內 `.cache`，
並以 `TMPDIR` 將 CLI 測試產物留在 repo。此環境調整不改動產品。

NOT_RUN：真人瀏覽器審查、螢幕閱讀器、實體觸控／DPI、四個指定寬度的視覺審查、
經人工核准的視覺回歸 baseline。舊版瀏覽器被阻擋的紀錄僅屬歷史，並非本次實測。
視覺 baseline 必須等待人工核准的瀏覽器 release；npm publish / release 不在本次授權範圍。
