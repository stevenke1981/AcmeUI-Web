# Cloudflare Pages 部署

## 正式環境

- Pages project：`daytrading-calculator-tw`
- Production branch：`main`
- Production URL：<https://daytrading-calculator-tw.pages.dev/>
- 首次部署 ID：`f6922568-57b9-41d0-9d9d-673939612b47`
- 首次部署時間：2026-07-24（Asia/Taipei）
- 最新部署可用 `npx --yes wrangler pages deployment list --project-name daytrading-calculator-tw` 查詢。

## 發布內容

正式站只需要下列檔案：

```text
index.html
styles.css
calculator.js
market-info.js
_headers
_routes.json
audio/
  yi-fei-chong-tian.mp3
functions/
  _shared/market-data.mjs
  api/market.js
  api/stock.js
```

`_headers` 的 Content Security Policy 已允許 AdSense loader、廣告 iframe、圖片與必要的連線來源。

`spec.md`、測試、計畫與交付文件不應上傳到公開站。

## 重新部署

先確認 Cloudflare OAuth：

```powershell
npx --yes wrangler whoami
```

建立一個暫存目錄，只複製正式資產與歌曲，再部署：

```powershell
$uploadDir = Join-Path $env:TEMP ('daytrading-cloudflare-upload-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $uploadDir | Out-Null

@('index.html', 'styles.css', 'calculator.js', 'market-info.js', '_headers', '_routes.json') | ForEach-Object {
  Copy-Item -LiteralPath (Join-Path $PWD $_) -Destination (Join-Path $uploadDir $_)
}
New-Item -ItemType Directory -Path (Join-Path $uploadDir 'audio') | Out-Null
Copy-Item -LiteralPath (Join-Path $PWD 'audio\yi-fei-chong-tian.mp3') `
  -Destination (Join-Path $uploadDir 'audio\yi-fei-chong-tian.mp3')

npx --yes wrangler pages deploy $uploadDir `
  --project-name daytrading-calculator-tw `
  --branch main `
  --commit-dirty=true
```

部署命令需從 `Daytrading` 目錄執行，Wrangler 才會一併編譯同層的 `functions/`。

## 首次部署驗證

- Production homepage：HTTP 200
- `styles.css`：HTTP 200，`text/css`
- `calculator.js`：HTTP 200，`application/javascript`
- `audio/yi-fei-chong-tian.mp3`：HTTP 200，`audio/mpeg`
- Content Security Policy：已套用
- Chromium runtime：標題為「台股市場資訊站｜當沖小算盤」
- 預設淨損益：`$1,008`
- 預設淨報酬率：`1.008%`
- 預設自動賣價：`$101.24`
- 預設損益兩平價：`$100.23`
- Browser console：0 errors、0 warnings
- `/api/market`：HTTP 200，回傳 TWSE／TPEx 官方盤後摘要、成交排行與 TWSE 消息
- `/api/stock?query=2330`：HTTP 200，回傳台積電盤後行情與當沖資格
