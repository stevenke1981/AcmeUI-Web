# ROADMAP-004：第四輪輸入與鍵盤事件契約稽核

稽核日期：2026-11-11。基準：`master` / `06ef00a`；R017 / PR #19 已於
兩組 hosted CI 成功且 MERGEABLE 後以 merge commit 合併。模式：review/fix，
僅限 AcmeUI-Web。本輪最多三個切片：先完成既有 R018 工作，再做 R019；
本路線圖完成後先稽核並撰寫下一份 ROADMAP。

## 範圍與發現

- 檢查 React/Vue Tabs 的 key、selection 與保留 panel 契約、共用 Modal 的
  document keydown、既有 Vitest/Chromium 與 Gallery。未重計前輪成果。
- React/Vue Tabs 都使用 value 作為 key 與選取識別，但未拒絕重複 value；
  同值會同時產生多個 aria-selected=true、tabindex=0 與可見 panel。
  R018 修正前的初始／動態輸入案例共重現六個失敗（含重複空字串）。
- Modal 的 document keydown 未檢查 defaultPrevented / isComposing；
  子控制項取消 Escape 或 IME 組字中的 Escape 仍會要求關閉，Tab 也可能
  覆蓋子控制項自己的鍵盤處理。R019 初次 Vitest 重現十個失敗，360/light
  Chromium 也重現子控制項取消 Escape 後仍被關閉。
  不把合成組字事件當作真人／OS IME 驗證。

## 可驗收切片

| ID | 優先序 | 範圍與自動驗收 | 狀態 |
|---|---|---|---|
| R018 | P2 | 共用 Tabs value 唯一性驗證，React/Vue 初始與動態無效輸入報錯，有效空字串／特殊字元／同一 app 多實例保持有效；Gallery/API/驗證文件更新 | 已合併 [PR #20](https://github.com/stevenke1981/AcmeUI-Web/pull/20)，merge commit 23392f9；兩組 CI 成功且 MERGEABLE |
| R019 | P2 | 共用 Modal 尊重 defaultPrevented / isComposing；兩框架 Vitest 驗證被取消的 Escape/Tab 與組字旗標、一般 Escape 仍可關閉；Chromium 以真實鍵盤驗證子控制項取消後 Modal 仍開啟，下一次未取消可關閉；Gallery/API 與 OS IME 未驗證範圍更新 | 已實作，本機五項 gate PASS；hosted/merge 證據見 PR |

每片均跑 `pnpm test`、`pnpm test:cli:installed`、`pnpm typecheck`、
`pnpm build`、`pnpm test:browser`。本機 PASS、hosted CI 全成功且 MERGEABLE
才以 merge commit 合併，之後同步 master；不等待 Codex review。

R018 本機證據：291 Vitest / 22 files、144 scaffolds / 96 workspace bundles、
三次隔離安裝 / 144 build scripts、typecheck/build 與 51 Chromium cases 全通過。
八個新增 Vitest 案例覆蓋兩框架初始／更新、有效值及同一 app 多實例；
Vue 驗證錯誤經 errorHandler 回報後修復輸入。獨立／hydrated root 的 ID prefix
由框架設定負責，本片不另行驗證。

R019 本機證據：304 Vitest / 23 files、既有 CLI 矩陣／隔離安裝、
typecheck/build 與最終 59 Chromium cases 全通過。新增 13 個 Vitest 及
8 個跨框架／Gallery 瀏覽器案例；備註修改後先處理 Escape 並保留文字，再次
Escape 關閉。首次完整 browser gate 有兩個既有 native-focus 案例逾時，
trace 同時出現約 349 秒空檔；原設定下兩個針對性案例及完整 59 案例重跑
通過。未為此修改程式、timeout、retries 或豁免；詳細證據見 VALIDATION。

## 人工與授權邊界

NOT_RUN：真人四尺寸瀏覽器／視覺／鍵盤／OS IME、螢幕閱讀器、實體觸控/DPI、
Firefox/WebKit/其他 OS、完整 rendered contrast/label、全家族狀態截圖、
完整 WCAG AA、人工核准視覺 baseline、npm/yarn 安裝矩陣。保持 React/Vue/
Tailwind/static 共用語意樣式與 token 契約。人工核准瀏覽器 release 前不建立
視覺 baseline；不發布 npm/release、不部署、不改 repo settings、不宣稱專案
完成或 production-ready。
