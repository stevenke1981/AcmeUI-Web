# 驗收與測試

## 自動化測試

預定執行：

```powershell
node Daytrading/market-info.test.mjs
node Daytrading/calculator.test.mjs
pnpm test
pnpm typecheck
pnpm build
```
實際執行結果：
- `node Daytrading/market-info.test.mjs`：11 / 11 通過
- `node Daytrading/calculator.test.mjs`：通過
- `pnpm test`：通過
- `pnpm typecheck`：通過
- `pnpm build`：通過

## 計算案例

1. 預設案例應得到：買進費 40、賣出費 40、交易稅 152、總成本 232、淨損益 1,008。
2. 賣價低於買價時，淨損益為負且狀態文字明示「淨損失」。
3. 小額交易啟用最低手續費時，買賣手續費各不低於設定值。
4. 關閉最低手續費時，手續費使用折扣後原值的四捨五入結果。
5. 零、負數、空值、非數字與非整數股數均回傳具體驗證錯誤，不產生 `NaN`。
6. 先賣後買使用相同損益數學，但摘要文字反映交易方向。
7. 損益兩平價代回計算後淨損益不得小於 0；低一個最小搜尋單位時應小於或接近 0。
8. 損益兩平價顯示需保留兩位小數（`formatPrice` 2 位小數檢查）。
9. `index.html` 已加入內嵌 `data:` favicon，避免本機靜態伺服器 `/favicon.ico 404`。
10. 買進價 `100` 自動反推賣出價 `101.24`，淨報酬率 `1.008%`；賣出價低一分時未達 `1%`。
11. 賣出價 `101.24` 自動反推買進價 `100.00`；買進價高一分時未達 `1%`。
12. 目標淨報酬率低於 `1%` 時顯示具體驗證錯誤。
13. 歌曲 MP3 可讀取 metadata、長度約 172.92 秒且預設不自動播放。
14. 基本常識區清楚呈現四項必要條件（含一般個人常見的 3 個月／10 筆條件）、四項新手提醒，並提供四個官方查核連結。
15. `index.html` 載入指定的 AdSense Auto ads 發布者腳本，且未新增虛構 `data-ad-slot`。

## 瀏覽器驗收

- 360 px：無水平捲動；輸入、結果與明細依序清楚；觸控目標足夠。
- 768 px：內容不擁擠，卡片可自然換行。
- 1280 / 1536 px：雙欄對齊，主要結果不因超大數字溢出。
- Tab 順序符合視覺順序，所有互動控制可由鍵盤操作。
- 焦點清楚；錯誤訊息與欄位關聯；結果摘要可被輔助科技得知。
- 正負結果同時使用文字、符號與顏色。
- reduced-motion 下不播放非必要過場。
- 直接開啟 `index.html` 與靜態伺服器兩種方式皆可使用。

## 實際結果

- 專屬測試：通過
- 既有品質閘道：`pnpm test`、`pnpm typecheck`、`pnpm build` 均通過
- Chrome `file:///E:/AcmeUI-Web/Daytrading/index.html`：直接開啟成功；新版預設結果為 `$1,008`、淨報酬率 `1.008%`。
- Playwright 寬度驗收（360 / 768 / 1280 / 1536）：四種寬度的 `scrollWidth` 均等於 viewport，無水平溢位。
- 360 px 大額壓力案例：淨損益 `-$2,297,987,698` 仍無水平溢位。
- 鍵盤焦點：Tab 首個焦點為 `direction-buy`，分段控制顯示 3 px focus ring；ArrowRight 可切換為 `sellThenBuy` 並更新摘要。
- 錯誤狀態：清空電子下單折扣後停止計算，欄位設為 `aria-invalid` 並顯示「必須介於 1 到 10 折」。
- reduced-motion：Playwright 模擬後輸入過場為 `0s`，頁面捲動行為為 `auto`。
- 瀏覽器 console：0 errors、0 warnings。
- 未使用實體螢幕閱讀器逐句聽讀；ARIA snapshot 已確認 radiogroup、欄位名稱、錯誤狀態與精簡 live region 可辨識。
- 新版四種寬度（360 / 768 / 1280 / 1536）：均無水平溢位；預設買價 `100`、賣價 `101.24`。
- Cloudflare 正式站：預設淨損益 `$1,008`、淨報酬率 `1.008%`，歌曲長度 `172.919979` 秒且未自動播放。
- Cloudflare 正式站雙向互動：賣價 `150` 反推買價 `148.17`；目標改為 `2%` 後反推買價 `146.72`、實得 `2.0011%`。
- Cloudflare 正式站門檻：輸入 `0.9%` 時 `aria-invalid="true"`，顯示「目標淨報酬率必須至少為 1%。」。
- 基本常識區：桌面雙欄、手機單欄；官方連結可開新分頁，且頁面未宣稱可替代券商資格審核。
- Cloudflare 計算器基線部署 `d4f13a78-29eb-4fe3-a3d9-5325eb62a881`：正式網址查得 AdSense 發布者腳本、基本常識標題、3 個月／10 筆常見門檻、必要條件清單、官方連結與歌曲內容；CSP 已允許廣告來源。

## 市場訊息站驗收（2026-07-29）

- 本機官方 live smoke：TWSE、TPEx 摘要、成交金額排行、TWSE 消息及 `2330` 查詢均成功，沒有 partial error。
- 資料時效：市場與報價資料日為 `2026-07-28`；當沖資格資料日為 `2026-07-29`；介面全程明示「官方盤後、非即時行情」。
- 本機 Pages runtime：Wrangler 成功編譯 Functions；`/api/market` 與 `/api/stock?query=2330` 回傳成功。
- 個股查詢：`2330` 顯示台積電收盤 `2,280`、OHLC、成交量與可先買後賣／先賣後買資格。
- 帶入計算器：收盤價帶入買進價後，股數仍為 `1,000`、目標仍為 `1%`，賣出價自動成為 `2,308.10`，淨報酬率 `1.0003%`。
- 響應式實測：360 / 768 / 1280 / 1536 px 均無水平溢位；手機市場卡片與桌面雙欄視覺檢查通過。
- 瀏覽器 console：0 errors、0 warnings。
- 安全邊界：新聞只接受 HTTPS 的 `twse.com.tw` 或其子網域；偽裝網域 fixture 會被捨棄。
- Cloudflare 正式站：首頁與靜態資產 HTTP 200；部分成功的 `/api/market` 回傳 HTTP 200、`partial: true` 與 `Cache-Control: no-store`，TWSE 資料正常，TPEx 官方端點從 Cloudflare 邊緣請求時被重新導向錯誤頁。
- 正式站降級呈現：市場區清楚顯示「2 個來源暫時無法讀取」，TPEx 卡片與排行使用錯誤佔位，不以假資料補值。
- 正式站個股查詢：`2330` 回傳有效 TWSE 結果；收盤 `2,280` 帶入後賣價 `2,308.10`、淨獲利 `$22,807`、淨報酬率 `1.0003%`。
- 正式站瀏覽器：1280 px 無水平溢位，console 0 errors、0 warnings；同一份資產的本機四寬度驗收均通過。

## 淡色區塊與台股色彩驗收（2026-07-29）

- 交易輸入、試算結果、成本明細、進階設定、市場概況、個股搜尋、當沖常識與音樂皆使用獨立語意淡色及邊框，標題與欄位名稱仍是主要辨識方式。
- 台股狀態色遵循上漲／獲利紅、下跌／虧損綠；正負數字仍保留 `+`／`-` 與文字，不只依賴顏色。
- Windows forced-colors 模式會回到系統 Canvas／CanvasText，避免自訂淡色降低高對比可讀性。
- 瀏覽器 computed style：8 個主要功能區取得 8 種不同背景；正向色為 `#b42336`、負向色為 `#087a55`。
- 實際視覺檢查：桌面雙欄與手機單欄皆能清楚區分各區塊，360／768／1280／1536 px 的 `scrollWidth` 均等於 viewport，console 無輸出。

## 自訂網域驗收

- Cloudflare Pages custom domain：`daytrading.aquamoon.app` 已加入 `daytrading-calculator-tw` 專案。
- DNS 必要設定：`CNAME daytrading → daytrading-calculator-tw.pages.dev`。
- 目前驗收狀態：Cloudflare 回報 `CNAME record not set`，因此自訂網域尚未 active；`pages.dev` 備援網址仍可使用。
- URL metadata 驗收：最新 deployment `de47a90c-04af-4721-a872-0de65aa9ef87` 的首頁 HTTP 200，canonical 為 `https://daytrading.aquamoon.app/`。
