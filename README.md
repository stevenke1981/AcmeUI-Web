# AcmeUI Web
**跨框架靜態網頁元件庫與模板平台。**

AcmeUI Web 延續 AcmeUI Native 的分層、語意化 Token、Gallery 與完整工程文件，
並將目標改為瀏覽器與靜態部署。它吸收 shadcn/ui 的原始碼可控性、MUI 的元件完整度、
Ant Design 的資料密集介面、Mantine 的開發體驗、Chakra 的可存取理念，以及
Element Plus、Semi Design、Arco Design 的企業級產品模式，但不複製其原始碼。

## 交付
- **23 個 React 元件家族**
- **23 個 Vue 3 元件家族**
- **Tailwind CSS v4 CSS-first adapter**
- **純 HTML/CSS 元件類別**
- **48 套可獨立部署模板**
- CLI 建站工具、React Gallery、靜態模板 Gallery
- 暗色模式、響應式、可見焦點、reduced-motion
- CI、Docker、文件、測試與三種範例

## 快速開始
```bash
corepack enable
pnpm install
pnpm test
pnpm dev
```
不安裝相依套件也可直接開啟 `previews/index.html`。

`pnpm preview:static` 提供 `previews/` 的 HTTP 預覽。服務以目錄邊界與 realpath
檢查限制讀取範圍；根目錄外的路徑/symlink 回傳 403，畸形 URL 回傳 400，
服務仍繼續回應正常請求。repo 內的真實 HTTP fixtures 會驗證這些情境。

## CLI
```bash
node packages/cli/bin/acmeui.mjs list
node packages/cli/bin/acmeui.mjs create my-site \
  --framework react \
  --template saas-launch
```

## Workspace
```text
apps/gallery        React 元件與模板展示
packages/core       共用型別與工具
packages/tokens     語意化設計 Token
packages/styles     框架中立 CSS
packages/react      React 元件
packages/vue        Vue 3 元件
packages/tailwind   Tailwind CSS v4 adapter
packages/static     純 HTML/CSS
packages/cli        建站產生器
templates           模板 Registry
previews            48 套獨立預覽
examples            React / Vue / Static
docs                架構、設計系統、部署
```

## 驗證
```bash
node scripts/validate.mjs
node scripts/validate-skill.mjs
node scripts/test-cli.mjs
```
完整依賴安裝後，本機與 CI 使用相同的必要命令：

```bash
pnpm test
pnpm test:cli:installed
pnpm typecheck
pnpm build
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" pnpm exec playwright install chromium --only-shell
pnpm test:browser
```

`test:cli:installed` 會進行 3 次隔離 pnpm 安裝，執行全部 144 個產物的 build
script；這不是 144 次獨立安裝。Chromium 安裝只需在尚未安裝時執行。

`pnpm test` 另包含 Vitest 與全部 CLI 產物檢查：144 組結構驗證、96 組
React/Vue 來源型別檢查與 Vite 打包（沿用 example toolchain）。驗證器也會
拒絕元件家族、shared/static CSS、registry metadata、catalog 與 Gallery 資料
漂移。尚待實作與未驗證範圍見 [ROADMAP-001](docs/roadmap/ROADMAP-001.md)、
第二輪 [ROADMAP-002](docs/roadmap/ROADMAP-002.md)、
第三輪 [ROADMAP-003](docs/roadmap/ROADMAP-003.md)
及 [VALIDATION.md](VALIDATION.md)。

## Agent Skill

專案內建 [`acmeui-web` Skill](skills/acmeui-web/SKILL.md)，涵蓋跨框架元件、
語意 Token、模板、CLI、Gallery、可存取性與發布流程。Repo 的 `AGENTS.md`
會要求相符任務先載入 Skill；`pnpm lint` 與 `pnpm test` 也會驗證 Skill
結構、manifest、Codex 介面 metadata，以及專案健康檢查結果。

```bash
node skills/acmeui-web/scripts/check-project.mjs .
```

## License
MIT。第三方產品名稱僅用於描述設計參考來源。

Gallery 的靜態 Tabs／Modal 範例位於 `/static.html`。新增表單行為對照、
語意色彩對比與 axe DOM gate；覆蓋範圍及未驗證項目見
[Accessibility automation scope](docs/ACCESSIBILITY.md)。自動化通過不代表真人
瀏覽器、視覺 baseline 或完整 WCAG AA 稽核通過。

R009 另加入 48 預覽的 HTML parser / 本機連結 gate，以及 `pnpm test:browser`
的四尺寸 Chromium smoke、React/Vue/static/Tailwind 代表元件比較。安裝命令、
CI artifacts 與未驗證範圍見 [browser smoke](docs/BROWSER_SMOKE.md)；
這不建立或核准視覺回歸 baseline。

R010 將 Gallery 的 23 個公開家族逐一納入可到達狀態的 DOM 覆蓋檢查，補上
Sidebar／Footer 範例。Gallery 與 React／Vue example 的正式 build、CLI workspace
打包會把 Vite `warn`／`warnOnce` 分類並立即設為失敗（含未知類別，沒有豁免）。
隔離產物 build 使用輸出文字 gate；詳細分類、限制與目前證據見
[驗證策略](test.md) 與 [驗證報告](VALIDATION.md)。

R013 擴充為 35 個 Chromium 案例，加入原生 static dialog 四尺寸/亮暗色的
鍵盤、背景焦點阻擋與焦點還原，以及無 JavaScript fallback / 非模態反例。
Tab 邊界的 document-focus 行為與限制見 [browser smoke](docs/BROWSER_SMOKE.md)。

R015 加入 React/Vue Modal 共用背景 native inert、程式焦點外移防護與 cleanup，
每份 document 同時只支援一個開啟的 Modal。八個四尺寸/亮暗色跨框架案例使
Chromium gate 擴充為 43 案例；契約、原有 inert 還原及未支援情境見
[framework matrix](docs/FRAMEWORK_MATRIX.md) 與 [browser smoke](docs/BROWSER_SMOKE.md)。

R016 讓 React 與 Vue/static 一樣保留所有 Tabs panel，未選取內容隱藏，
每個 aria-controls 都有對應目標，切換/重排保留內容狀態。Gallery 動態分頁
展示草稿保留，家族 gate 僅計算可見且未被 inert/aria-hidden 排除的範例。
內容生命週期契約見 [API reference](skills/acmeui-web/references/api-reference.md)。
