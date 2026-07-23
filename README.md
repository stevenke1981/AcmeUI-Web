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
完整依賴安裝後執行 `pnpm typecheck && pnpm build`。

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
