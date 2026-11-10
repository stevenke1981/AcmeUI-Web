# ROADMAP-002：第二輪自動化品質稽核

稽核日期：2026-11-11。基準：`master` / `d493d70`（PR #2–#12 已合併）。
模式：Review/fix。僅限 AcmeUI-Web；本次最多三個切片，各自建立 PR。

## 稽核範圍與發現

- 已讀專案規格、計畫、狀態、驗證文件與 AcmeUI Web Skill；檢查 core、23 家族的 React/Vue 實作、共用/static CSS、Tailwind adapter、CLI、HTML validator、Gallery、Vitest、Chromium 與 CI。
- 既有 R001–R010 已涵蓋 export/registry/token drift、144 scaffold、96 bundle、隔離安裝、Gallery axe、四尺寸代表樣式比較。這些是既有證據，第二輪不重新宣稱為新增功能。
- React/Vue Tabs 僅在初始化選取項目；無效 defaultValue、空清單之後載入資料、刪除目前項目都可能使所有 tab 的 tabindex 為 -1，沒有可見 panel。Vue 的 v-for ref 陣列也不應假定在重排後仍與資料索引一致。
- `scripts/serve-static.mjs` 用字串 startsWith 判斷根目錄，會接受同前綴的相鄰路徑；未處理 decodeURIComponent 例外，畸形 request 可終止服務。尚無 HTTP 回歸測試。
- Static Modal 的原生 showModal/close 只有 jsdom test doubles；目前 Chromium gate 只操作 Gallery React Modal，不能證明原生 Tab、背景焦點限制或 Escape。
- Static Tabs 的錯誤訊息承諾唯一 tab id，但目前僅驗證 id 存在及 panel 不重複，未拒絕重複 tab id。
- React/Vue Modal 使用 aria-modal 與 Tab 攔截，但未實作背景 inert；程式移動焦點到背景的情境未涵蓋。巢狀 Modal 已明確不支援。
- 公開 API、DOM、token 與代表幾何檢查不等同完整視覺一致、WCAG AA 或真人審查。既有文件將未執行範圍列為 NOT_RUN，後續只更新實際新增證據。

## 可驗收切片

| ID | 優先序 | 範圍與自動驗收 | 狀態 |
|---|---|---|---|
| R011 | P1 | React/Vue Tabs 正規化無效選取、空清單、移除/重排；Vitest 對照測試、Gallery 動態範例與 API/static 說明；不改 CSS/tokens | [PR #13](https://github.com/stevenke1981/AcmeUI-Web/pull/13) 已合併；本機五 gates、兩組 hosted CI PASS |
| R012 | P1 | Static preview server 使用目錄邊界與實際路徑限制，安全處理畸形 URL；Vitest 真實 HTTP 測試含同前綴目錄、symlink、錯誤後服務存活、正常 HTML/CSS/JS | [PR #14](https://github.com/stevenke1981/AcmeUI-Web/pull/14) 已合併；本機五 gates、兩組 hosted CI PASS |
| R013 | P1 | Chromium 操作真實 static dialog：四尺寸/亮暗色、鍵盤開啟、Tab/Shift+Tab、背景 focus 阻擋、Escape/close 焦點還原；保留 Vitest 委派/cleanup 回歸，記錄瀏覽器範圍 | 已實作；本機五 gates PASS（237 Vitest / 35 Chromium），CI/合併見本切片 PR |
| R014 | P2 | Static Tabs 初始化前拒絕重複 tab id / 歧義關聯，錯誤後 markup 不變；Vitest 反例與重建測試 | 後續 |
| R015 | P1 | React/Vue Modal 背景互動隔離契約與焦點外移防護；Vitest/browser 跨框架測試、Gallery 及 cleanup 邊界；先定義巢狀/多實例限制 | 後續 |

每個切片都須先重現缺口，再執行 `pnpm test`、`pnpm test:cli:installed`、
`pnpm typecheck`、`pnpm build`、`pnpm test:browser`。CI 全部通過且 GitHub
顯示 MERGEABLE 才以 merge commit 合併；不等待 Codex review。

## 保留的人工作業與授權邊界

NOT_RUN：真人瀏覽器/視覺審查（360/768/1280/1536）、螢幕閱讀器、實體觸控/DPI、
Firefox/WebKit/其他 OS、完整 rendered contrast/label 稽核、全家族/狀態截圖、
完整 WCAG AA 與人工核准視覺 baseline。原生 dialog 的自動化結果只在 R013
實際執行後更新，不能換算成人工通過。

視覺 baseline 等待人工核准的瀏覽器 release。npm publish、建立 release、部署與
repo settings 變更皆不在本次範圍；不得宣稱專案完成或 production-ready。

## R013 實測補充

原生 dialog 在 Chromium 的 Tab 邊界可能出現 body active 且 document.hasFocus()
為 false 的一次轉移，再按同方向 Tab 才回到對話框。初版 fixture 假設一步循環，
造成 8 個失敗；量測後修正該假設，未更動 runtime。測試只容許這一種離開 document
的狀態，背景控制項或仍有焦點的 body 都會失敗；反例以 show() 取代 showModal()
證明可區分非模態 dialog。完整附件與範圍見 docs/BROWSER_SMOKE.md。

本次三個切片已實作；R014、R015 留待後續，不因此宣稱專案完成或 production-ready。
