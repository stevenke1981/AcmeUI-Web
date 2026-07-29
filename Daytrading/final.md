# 交付紀錄

目前狀態：網站已演進為台股市場資訊站，提供 TWSE／TPEx 官方盤後摘要、排行、消息、個股與當沖資格查詢；當沖小算盤仍是主功能。

正式站：<https://daytrading-calculator-tw.pages.dev/>

## 已完成修改

- `functions/_shared/market-data.mjs`、`functions/api/market.js`、`functions/api/stock.js`：代理並正規化官方資料，支援來源失敗、格式漂移、來源日期與五分鐘成功回應快取。
- `market-info.js`：完成市場摘要、成交排行、官方消息、個股查詢、當沖資格、失敗重試與收盤價帶入試算。
- `_routes.json`：只讓 `/api/*` 進入 Pages Functions，靜態頁與試算器維持獨立。
- `index.html`：完成即時試算頁面輸入欄位、進階設定、結果摘要、ARIA 關聯與法規連結。
- `styles.css`：完成語意化變數、焦點可視、觸控目標、寬螢幕/窄螢幕排版與 reduced-motion 處理。
- `calculator.js`：完成核心計算、輸入驗證、成本明細/損益兩平價（`0.01` 精度）、DOM 更新與共用 API。
- `calculator.js`：新增損益兩平價專用兩位小數格式化器（`formatPrice`），僅供 break-even 欄位顯示使用。
- `calculator.test.mjs`：補上：
  - 買賣金額、費率、稅費/淨損益的整數斷言（移除 `Math.round` 包裝）
  - 負數/空值/NaN/非整數股數
  - 進階欄位越界（手續費率、折扣、最低手續費、稅率）
  - `minimumFee=20.5` 時四捨五入結果（21）
  - 先賣後買摘要文字與數學一致性
  - 損益兩平價斜率方向與最小性質
  - `formatPrice` 兩位小數輸出驗證（針對 break-even 顯示）
- `todos.md`、`test.md`、`final.md`：同步更新驗證紀錄與已知限制。
- `index.html`：加入 inline `data:image/svg+xml` favicon，解決靜態伺服器缺少 `/favicon.ico` 的 404。
- `_headers`：加入 CSP、frame protection、MIME sniffing protection、referrer policy 與瀏覽器權限限制。
- `CLOUDFLARE_DEPLOYMENT.md`：記錄 Pages project、正式網址、重新部署命令與線上驗證結果。
- `calculator.js`：新增買價／賣價雙向自動反推，預設目標淨報酬率 `1%`，並納入實際費用與一分價精度。
- `index.html`、`styles.css`：加入自動對價狀態、目標報酬率設定與〈一飛衝天〉播放器。
- `audio/yi-fei-chong-tian.mp3`、`audio/一飛衝天-歌詞.md`：加入 Suno v5.5 原創歌曲與完整歌詞。
- `index.html`、`styles.css`：加入「當沖基本常識與必要條件」教育區塊，含官方查核入口與響應式雙欄排版。

## 驗證紀錄

- `node Daytrading/market-info.test.mjs`
  - 結果：11 / 11 通過
  - 註記：涵蓋日期／數字防禦、來源部分失敗、schema 漂移、資格未知狀態、HTTP cache policy、官方新聞 URL 白名單及帶入計算器。
- `node Daytrading/calculator.test.mjs`
  - 結果：通過
  - 註記：Node 無額外錯誤，使用 CJS 輸出兼容預設匯入。
- `pnpm test`
  - 結果：通過
- `pnpm typecheck`
  - 結果：通過
- `pnpm build`
  - 結果：通過
- Chrome `file://` 直接開啟
  - 結果：通過；新版預設淨損益 `$1,008`、淨報酬率 `1.008%`
- Playwright 響應式與互動驗收
  - 結果：360 / 768 / 1280 / 1536 均無水平溢位
  - 結果：鍵盤焦點、方向切換、進階欄位錯誤、ARIA invalid、reduced-motion 均符合規格
  - 結果：console 0 errors、0 warnings
- 本機 Cloudflare Pages runtime
  - 結果：Functions 成功編譯；`/api/market` 與 `/api/stock?query=2330` 回傳官方資料
  - 結果：`2330 台積電` 收盤 `2,280` 顯示成交值與當沖資格，可帶入買進價並維持原試算參數
  - 結果：靜態環境 API 失敗時，各資料區不會停在「載入中」，並提供鍵盤可操作的重新載入按鈕
- Cloudflare Pages production
  - Project：`daytrading-calculator-tw`
  - 結果：正式首頁、CSS、JavaScript 均為 HTTP 200
  - 正式網址：<https://daytrading-calculator-tw.pages.dev/>
  - 結果：首頁、CSS、JavaScript、MP3 均為 HTTP 200；MP3 為 `audio/mpeg`
  - 結果：Chromium 實測 `$1,008`、`1.008%` 與自動賣價 `$101.24`
  - 結果：賣價 `150` 可反推買價 `148.17`；目標 `2%` 可反推買價 `146.72`
  - 結果：`2330` 查詢與收盤價帶入通過；買價 `2,280` 自動得到賣價 `2,308.10`、淨報酬率 `1.0003%`
  - 限制：TPEx 官方端點目前會將 Cloudflare 邊緣子請求重新導向錯誤頁；正式 API 回傳 partial/no-store，介面顯示來源不可用，不補假資料

## 本次功能補充

- 預設買進價 `100` 會自動帶入賣出價 `101.24`，預估淨報酬率 `1.008%`。
- 編輯賣出價會反向帶入可達標的最高買進價；目標淨報酬率不得低於 `1%`。
- 歌曲：〈一飛衝天〉，Suno 版本 <https://suno.com/song/1f0044b4-fa41-4636-8f9b-ea3dd11d9472>，長度約 2:53。
- 當沖基本常識區已上線，正式網址查得四項必要條件（含 3 個月／10 筆常見門檻）、四項新手提醒與四個官方查核入口。
- 已加入 Google AdSense Auto ads 發布者腳本與相容 CSP；因未提供廣告單元 slot，未建立虛構的固定廣告區塊。

## 限制

- 市場資訊來自官方最新盤後／公告資料，不是盤中即時行情；官方來源異常時會顯示部分資料或暫時無法讀取，不會用假資料補值。
- 當沖標的公告不等於使用者已取得券商交易資格，也不代表一定有券源或一定能成交。
- 未使用實體螢幕閱讀器逐句聽讀；已以瀏覽器 accessibility snapshot 核對名稱、群組、錯誤狀態與 live region。
- `index.html` 僅為 Daytrading 模組下的靜態頁面，未更新其他 template gallery 或跨框架元件。
