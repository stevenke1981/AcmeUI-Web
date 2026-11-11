# @acmeui/static

```html
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./base.css">
<button class="acme-button acme-button--primary" type="button">開始使用</button>
```

`src/base.css` 與 `packages/styles/src/base.css` 共用相同 component CSS，只有
首行 token import 路徑不同。修改共用樣式時同步 static 副本；`pnpm lint` /
`pnpm test` 會拒絕漂移。Tailwind adapter 也可搭配下列相同 HTML 與互動。

## 可選互動

完整、可由 Gallery 建置的[漸進增強範例](../../apps/gallery/static.html)。
請透過 HTTP server（例如 `pnpm dev` 後開啟 `/static.html`）使用 ES module；
`file://` 的 module 支援由瀏覽器決定。無 JS 時 Tabs 是可閱讀的錨點與 section，
Modal 說明有可閱讀的 fallback。

```js
// Bundler 使用套件 subpath；直接部署時改用 ./interactions.mjs。
import { enhanceTabs, enhanceModal } from '@acmeui/static/interactions';
const cleanupTabs = enhanceTabs(document.querySelector('[data-acme-tabs]'));
const cleanupModal = enhanceModal(
  document.querySelector('dialog'),
  document.querySelectorAll('[data-acme-modal-open]'),
);
// 頁面卸載或移除元件時呼叫；可重複呼叫，之後可重新初始化。
cleanupModal();
cleanupTabs();
```

Tabs 容器需有 `[data-acme-tablist]`，其下每個 `[data-acme-tab]` 是具唯一 id、
`href="#panel-id"` 的連結；panel 必須在同一容器。tab 與 panel 的 id 在整份
document 中都必須唯一且不含空白，每個 tab 指向不同 panel；panel 不得互相
包含，也須與 tablist 分開。初始化在變更
markup 或掛上 listener 前拒絕重複 id／歧義關聯；修正後可重試。成功後
設定 tablist/tab/tabpanel、aria 關聯、roving tabindex 與 hidden。水平方向鍵、
Home/End 會自動選取並移動焦點；點擊保留 Ctrl/Meta 等修飾鍵的原生連結行為。
目前支援固定、單層、由左至右的水平 Tabs；cleanup 前請保持該元件 markup 穩定。
React/Vue Tabs 支援動態清單：無效 defaultValue 或已移除的選取會回到第一項，
清空後重新載入也選取第一項；重排保留有效選取。靜態/Tailwind HTML 若需要
重建分頁，先 cleanup、更新連結/section，再呼叫 enhanceTabs；不監聽 DOM 變動。
三種 Tabs 都保留未選取的 panel，讓每個 aria-controls 持續有效；inactive
內容以 hidden 或 v-show 隱藏。React 內容狀態、effects 與未受控表單值會保留，
移除項目/清空才會卸載；依可見性運作的 effects 須由應用程式自行暫停。

Modal 使用具 `aria-labelledby` 的 `<dialog class="acme-dialog">`，內含
`.acme-modal__panel` 與 `[data-acme-modal-close]` 按鈕。`showModal()` 讓瀏覽器
管理背景 inert 與焦點循環；cancel/close 事件及 cleanup 會處理關閉與焦點還原。
沒有原生 API 時不接管按鈕，應保留範例中的可閱讀 fallback。暫不支援巢狀 Modal。
React/Vue Modal 則共用背景 native inert 與焦點外移防護，關閉/卸載時還原；
每份 document 僅允許一個開啟的 Modal，巢狀/同時多實例不受支援。
Tailwind 仍沿用此處的原生 dialog，不提供另一套互動 runtime。

Vitest 使用 jsdom，native dialog API 以 test doubles 驗證委派與 cleanup，
不證明瀏覽器行為。R013 另以 Chromium 在四尺寸與亮暗色驗證原生 modality、
Tab／Shift+Tab、背景焦點阻擋、Escape／close 及開啟者焦點還原。
Chromium 在 Tab 邊界可能先離開 document，下一次按鍵才回到 dialog；
實測範圍與 JSON 附件見 [browser smoke](../../docs/BROWSER_SMOKE.md)。
視覺、真人瀏覽器審查、觸控與螢幕閱讀器仍為 NOT_RUN。
互動模式參考 [WAI Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) 與
[WAI Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)。

## 內容語意

React / Vue 的 Avatar、DataTable、Breadcrumb 與下列靜態標記使用相同語意；
Tailwind adapter 也使用同一份 class contract。

```html
<span class="acme-avatar"><span role="img" aria-label="Ada Lovelace">AL</span></span>
<nav class="acme-breadcrumb" aria-label="麵包屑">
  <a href="/">首頁</a><span aria-current="page">成員</span>
</nav>
<div class="acme-table-wrap"><table class="acme-table">
  <caption>成員</caption><thead><tr><th scope="col">姓名</th></tr></thead>
  <tbody><tr><td>Ada</td></tr></tbody>
</table></div>
```

方案按鈕使用 `type="button"`，放入表單時不隱式送出。

R017：React/Vue Modal 的 radio 與空值/plaintext-only contenteditable 焦點候選
已對齊；static/Tailwind 仍將循序焦點委派原生 dialog。巢狀編輯區需明確
tabindex="0" 才加入 Tab 順序；不使用正 tabindex。詳見 framework matrix。
