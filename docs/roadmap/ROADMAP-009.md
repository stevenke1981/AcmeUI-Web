# ROADMAP-009：第九輪 Modal CSS 焦點候選稽核

稽核日期：2026-11-16。基準：`master` / `e36bfcb5a1eaa8ca15a4768600f371600a382508`。
模式：review/fix；僅在 AcmeUI-Web 作業。本輪規劃一個可重現的 slice，
不以三個 slice 為配額，既有發布與人工視覺 baseline 待辦保持未完成。

## 現況與稽核證據

- `git status --short --branch`：乾淨的 `master...origin/master`。
- `git ls-remote origin refs/heads/master`：上述 `e36bfcb`。
- `gh pr list --state open --json number,title`：`[]`。
- `gh pr view 30`／`gh pr view 31`：兩者均 MERGED；merge commits 分別為
  `9fc49c7`／`e36bfcb`。#31 的 push 與 pull_request 兩個 hosted `validate`
  均 SUCCESS。ROADMAP-001–008 與 todos 的 R001–R027 均已勾選。
- 已讀 spec、plan、todos、README、test、final、專案 Skill 與 API reference；
  檢視 shared core、React/Vue wrappers、static enhancer、semantic CSS、Gallery、
  CI 及既有焦點／瀏覽器測試。
- `packages/core/src/index.ts` 的 `focusCandidates` 會排除 `display:none`，
  卻仍將自身 `display:contents` 的 link/button，以及祖先
  `content-visibility:hidden` 裡的控制項當成可循序聚焦節點。
  `trapTabKey` 在 reverse wrap 取消 Tab 後對這些節點呼叫 focus；Chromium
  無法聚焦該節點，因此焦點留在原處，Shift+Tab 無法抵達真正的最後控制項。
- 暫存 Vitest：**4 failed**，涵蓋兩種 CSS 的候選清單與 reverse wrap。
  暫存 Chromium：React/Vue × 兩種 CSS 的 **4 failed**；皆在真實
  Shift+Tab 後無法聚焦最後 input。原始輸出為 ignored
  `.cache/r028-layout-vitest-before.log`、`.cache/r028-layout-browser-before.log`。
  暫存測試已移至 ignored `tmp/r028-audit/`，不混入文件 PR。
- Chromium 原生對照確認：display:contents **自身**無法聚焦，但其可見子控制項
  仍能聚焦；content-visibility:hidden **自身**的有框控制項仍可聚焦，
  被隱藏的是其子孫，即使子孫設 content-visibility:visible 也不能逃出。
  這些差異必須分別處理，不能把兩個 CSS 值都當成 display:none。
- 初步 hidden input + tabindex 疑點經 jsdom／Chromium 對照均通過，
  computed display:none 已正確排除，因此不列為缺陷。

| ID | 優先序 | Slice 與驗收條件 | 狀態 |
|---|---|---|---|
| R028 | P2 | Modal CSS 焦點候選：排除自身 display:contents 與 content-visibility:hidden 祖先內的候選；保留 contents 子控制項與自身 content-visibility:hidden 的有框控制項；每次計算反映 CSS 更新。core、React/Vue 回歸、Gallery 保留草稿示例、四尺寸／亮暗色 Chromium 與 static/Tailwind 原生對照 | 待實作 |

## 最小重現步驟

1. 在基準 SHA 使用 `pnpm install --frozen-lockfile`。
2. 建立暫存 `scripts/test/r028-repro.test.ts`：

```ts
import { afterEach, expect, it } from 'vitest';
import { getFocusable, trapTabKey } from '../../packages/core/src/index';
afterEach(() => { document.body.innerHTML = ''; });
for (const html of [
  '<a href="#" style="display:contents" id="phantom">Link</a>',
  '<div style="content-visibility:hidden"><button id="phantom">Hidden</button></div>',
]) it(`ignores a non-focusable CSS boundary: ${html}`, () => {
  document.body.innerHTML = `<section tabindex="-1"><button id="last">Last</button>${html}</section>`;
  const panel = document.querySelector<HTMLElement>('section')!;
  expect(getFocusable(panel).map(node => node.id)).toEqual(['last']);
  panel.focus();
  trapTabKey(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true }), panel);
  expect(document.activeElement?.id).toBe('last');
});
```

3. 執行 `pnpm exec vitest run scripts/test/r028-repro.test.ts`；基準上兩例皆失敗。
   jsdom 的 focus 方法無法證明 CSS 原生可聚焦性，因此需以下 Chromium 對照。
4. 在 Playwright 設定 `scripts/browser/playwright.config.ts` 下建立暫存測試，
   分別前往 `/scripts/browser/fixtures/modal-react.html` 與 `modal-vue.html`，
   點擊 `#opener`，在真實 `[role=dialog]` 尾端插入
   `<input id="last-draft">`，再插入上面任一段 phantom HTML。
   聚焦 `[aria-label="關閉"]` 並 `page.keyboard.press('Shift+Tab')`；
   `expect(page.locator('#last-draft')).toBeFocused()` 在兩框架／兩 CSS 都失敗。
5. 正式實作將納入永久 regression；暫存 reproducer 不隨文件 PR 提交。
   如需 repo 內快取，使用
   `COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp"`。

## 驗收與 PR 順序

1. 先合併獨立的 ROADMAP／待辦 PR，再從已合併 master 建立 R028 分支。
2. core 只排除自身 display:contents，不能排除其全部子樹；
   content-visibility:hidden 排除祖先的子孫候選，不能把有框容器本身一併排除。
   不用 jsdom 全為零的 layout geometry 作為通用 focus 判斷。
3. 永久 Vitest 覆蓋候選順序、兩方向邊界、無候選 panel fallback、有效子孫／
   有框容器對照、深層／visible override、stylesheet 與動態 CSS 更新；
   React/Vue 使用真實 Modal，取消事件、inert cleanup 與 opener 還原繼續有效。
4. Gallery 提供可顯示／隱藏額外欄位並保留草稿的範例。
   API／framework／驗證文件說明 CSS 契約及自動化範圍。
5. Chromium 在 360/768/1280/1536 × light/dark，以真實 Tab／Shift+Tab
   驗證 React/Vue 的候選與動態更新、焦點環、草稿保留、Escape／opener 還原，
   並以 static native dialog 及 Tailwind 共用 HTML/CSS 作對照。
   原生 dialog 邊界只能沿用 R013 已記錄的一次 unfocused-document transition，
   不允許 focused body 或背景控制項。驗證不建立截圖 baseline。
6. 每個 PR 合併前必須通過 `pnpm test`、`pnpm test:cli:installed`、
   `pnpm typecheck`、`pnpm build`、`pnpm test:browser`；所有 hosted CI
   均成功且 GitHub 顯示 MERGEABLE 才合併。不等待 Codex code review，
   不留下綠燈未合併 PR。

## 未執行與範圍限制

NOT_RUN：真人瀏覽器／視覺／鍵盤審查（360/768/1280/1536）、螢幕閱讀器、
實體觸控/DPI、OS IME、Firefox/WebKit/其他 OS、完整 rendered contrast／label、
完整 WCAG AA、全家族／狀態截圖、人工核准視覺回歸 baseline、npm/yarn 安裝矩陣。
content-visibility:auto 的離屏啟發式、UA media control shadow 子樹、正 tabindex、
iframe 內部與 shadow DOM traversal 不在本 slice 的 light-DOM 契約內。
不 npm publish、不發 release、不部署、不改 repo settings、不做破壞性刪除或
force-push；不宣稱專案完成或可上線。
