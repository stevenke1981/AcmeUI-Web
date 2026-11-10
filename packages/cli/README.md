# AcmeUI CLI
```bash
node packages/cli/bin/acmeui.mjs list
node packages/cli/bin/acmeui.mjs create my-site --framework react --template saas-launch
```

支援 `react`、`vue`、`static`；非空目標資料夾會失敗，避免覆寫現有檔案。
React / Vue 產出含語言、viewport、標題與描述；React 宣告 build 所需的型別套件。
兩者以預覽 HTML 注入內容，尚未轉換為原生框架元件。

```bash
node scripts/test-cli.mjs            # 144 組結構 / HTML 外殼 / metadata，含 static JS syntax
node scripts/test-cli.mjs --compile  # 另 typecheck + Vite bundle 全部 96 組 React / Vue
```

`pnpm test` 包含 `--compile`。編譯 gate 沿用 repo 中兩個 example 的已安裝
toolchain，所有同框架來源共用一次型別檢查，每組各自執行 Vite 打包（不寫入 dist）；
編譯警告會使 gate 失敗。測試目錄位於 repo 的 `tmp/`，結束時只清理當次 fixture。
這不代表已執行每個產物的獨立 `npm install`／`npm run build`，也不代表瀏覽器驗證。

參數先完整解析再寫入。`create` 必須有一個合法名稱；支援
`--framework=value` 或 `--framework value`（template/out 同理），可將選項置於
名稱前。未知/重複 flags、空值、下一個 flag 被當成值、多餘 positional arguments
都會失敗；`list` / `help` 不接受額外參數。

React / Vue 產物的 `src/theme.ts` 僅在自身根節點找 theme button，並回傳可重複
呼叫的 cleanup；React effect / Vue onUnmounted 都會清理。Vitest 實際編譯並
掛載產物來驗證 toggle、unmount、remount 與範圍隔離。Static 為整頁生命週期，
其原始 script 不宣稱支援框架式 unmount。

```bash
pnpm test:cli:installed # CI 另執行：隔離安裝後，跑 144 個產物的原始 build scripts
```

每個框架先驗證 48 份 package manifests（除名稱外）一致，再為該 manifest
在 repo tmp/ 內執行 `pnpm install --ignore-workspace --ignore-scripts`。
其他同框架產物連到這份隔離安裝的 node_modules，沒有連到 workspace/example
依賴；全部 96 份 React/Vue 執行自己的型別檢查與 Vite build 並寫入 dist，
48 份 static 執行自己的 ready script（並非 bundler）。這是三個安裝群組與
144 個 script builds，不是 144 次獨立安裝；也未驗證 npm/yarn 或其他 OS。
只有當次 fixture 會清理，pnpm store 留在 repo `.cache/`。
