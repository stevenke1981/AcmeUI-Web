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
