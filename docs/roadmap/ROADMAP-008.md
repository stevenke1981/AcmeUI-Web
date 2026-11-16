# ROADMAP-008：第八輪 Modal 滑鼠關閉事件稽核

稽核日期：2026-11-16。基準：`master` / `bd74dbd`。
模式：review/fix；範圍限 AcmeUI-Web。這份文件只規劃一個有實際重現證據的
slice，不以三個 slice 為配額，也不把既有人工 NOT_RUN 項目勾成完成。

## 現況與稽核證據

- `git status --short --branch`：乾淨的 `master...origin/master`。
- `git ls-remote origin refs/heads/master`：`bd74dbdbcea3440d29a5e10796fa3cfe54ab2805`。
- `gh pr list --state open --json number,title`：`[]`，沒有待處理的綠燈 PR。
- ROADMAP-001–007 與 `todos.md` 的 R001–R026 自動化項目皆已勾選。
  `gh pr view 29 --json state,mergedAt,mergeCommit,statusCheckRollup` 確認
  R026 已於 2026-11-16 合併至上述 SHA，兩個 hosted `validate` 均為 SUCCESS。
- 讀取 spec、plan、todos、README、test、final 與專案 Skill；檢視 core 焦點與
  Modal lifecycle、React/Vue wrappers、static interactions、shared CSS、既有
  單元／Chromium fixtures、Gallery 與 CI。沿用語意 token、共用樣式與 native
  static/Tailwind dialog 契約。
- `packages/react/src/index.tsx` 的 Modal close-button `onClick={onClose}` 與
  backdrop `onMouseDown`、`packages/vue/src/components/Modal.vue` 的
  `@click` 與 `@mousedown.self` 都沒有檢查 `defaultPrevented`。兩個 backdrop
  handler 也未篩選 `MouseEvent.button`。core 已有 R019 鍵盤保護，static 已有
  R021 click/cancel 保護；缺口限於 React/Vue 的滑鼠關閉入口。
- 本機暫存 `tmp/r027-audit/modal-dismissal.test.tsx` 直接 import 真實元件，
  capture consumer 先取消事件，仍收到 close request。修正前 **8 failed / 2 passed**：
  兩框架各有 cancelled close click、cancelled backdrop mousedown、中鍵與右鍵
  四個失敗；panel／子元素普通事件的兩個對照通過。原始輸出在 ignored
  `.cache/r027-before.log`，永久回歸測試將隨實作 PR 納入版本控制。

| ID | 優先序 | Slice 與驗收條件 | 狀態 |
|---|---|---|---|
| R027 | P2 | React/Vue Modal 滑鼠關閉事件交接：已取消的 close-button click／backdrop mousedown 不要求關閉；中鍵／右鍵遮罩事件不要求關閉且不額外取消。一般主鍵遮罩、close-button click／鍵盤、Escape、inert cleanup 與 opener 還原保持可用。雙框架回歸測試、Gallery 可操作示例、四尺寸／亮暗色 Chromium 自動化與文件同步 | 已實作；永久 Vitest 修正前 10 failed / 2 passed、修正後 12 passed；Chromium 16 passed |

## 最小重現步驟

1. 在基準 SHA 安裝依賴：`pnpm install --frozen-lockfile`。
2. 建立暫存 `scripts/test/r027-repro.test.tsx`，貼入以下內容：

```tsx
import { expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Modal } from '../../packages/react/src/index';
import VueModal from '../../packages/vue/src/components/Modal.vue';

for (const framework of ['React', 'Vue']) it(`${framework} cancelled close`, async () => {
  const close = vi.fn(), cancel = (event: { preventDefault(): void }) => event.preventDefault();
  let dispose = () => {};
  try {
    if (framework === 'React') {
      render(<div onClickCapture={cancel}><Modal open title="Repro" onClose={close}>Draft</Modal></div>);
    } else {
      const view = mount({ render: () => h('div', { onClickCapture: cancel }, [
        h(VueModal, { open: true, title: 'Repro', onClose: close }, () => 'Draft'),
      ]) }, { attachTo: document.body });
      dispose = () => view.unmount(); await nextTick();
    }
    fireEvent.click(document.querySelector('[aria-label="關閉"]')!);
    expect(close).not.toHaveBeenCalled();
  } finally { dispose(); cleanup(); }
});
```

3. 執行 `pnpm exec vitest run scripts/test/r027-repro.test.tsx`；基準上兩框架都
   失敗，實際收到一次 close request。測試不呼叫 `stopPropagation()`，因此
   能區分取消事件與阻斷傳遞。
4. 將 capture 改成 React `onMouseDownCapture`／Vue `onMousedownCapture`，
   操作改成 `fireEvent.mouseDown(document.querySelector('.acme-modal')!)`，
   可重現 cancelled backdrop。移除 capture 並給 mouseDown `{ button: 1 }`
   或 `{ button: 2 }`，可重現中鍵／右鍵誤關閉。
5. 暫存 reproducer 不納入實作提交；永久測試命令為
   `pnpm exec vitest run scripts/test/modal-dismissal.test.tsx`。
   若 Corepack 需要可寫入快取，命令前設定 repo 內的
   `COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp"`。

## 驗收與 PR 順序

1. 先獨立提交本 ROADMAP／待辦 PR；本機 gates 與 hosted CI 全數通過，GitHub
   顯示 MERGEABLE 後合併，不等待 Codex code review。
2. 從已合併 master 實作 R027，單獨一個 PR。close-button handler 先檢查
   `defaultPrevented`；backdrop handler 僅接受未取消、主鍵、target 等於
   currentTarget 的 mousedown，先 preventDefault 再要求關閉，避免原生焦點動作
   覆蓋 opener 還原。保留受控 `open` 與 callback／emit 語意。
3. 永久 Vitest 覆蓋兩框架 cancelled／ordinary 事件、callback／emit 次數、
   panel 子元素不誤關閉、非主鍵不額外 preventDefault、取消後 inert／焦點仍在。
4. Gallery 提供可選擇攔截一次滑鼠關閉的示例；消費端須在 component bubble
   handler 前取消（例如 ancestor capture），之後的 bubble 無法撤回已發出的請求。
5. Chromium 在 360/768/1280/1536 × light/dark 操作 React/Vue 及 Gallery，
   驗證取消後保留草稿與背景隔離，下一次正常事件關閉一次、清除 inert、
   還原 opener；檢查右鍵／中鍵、一般 close button 鍵盤啟動與 Escape。
6. 每個 PR 合併前通過 `pnpm test`、`pnpm test:cli:installed`、`pnpm typecheck`、
   `pnpm build`、`pnpm test:browser`。保留 token/CSS drift gates、共用
   React/Vue/static/Tailwind 樣式、可見焦點與既有 responsive 自動檢查。
   所有 hosted CI 必須成功且 GitHub 顯示 MERGEABLE 才合併；不留下綠燈未合併 PR。

## R027 實作與驗證證據

ROADMAP PR [#30](https://github.com/stevenke1981/AcmeUI-Web/pull/30) 的兩個
hosted `validate` 均 SUCCESS，GitHub 顯示 MERGEABLE 後合併至 `9fc49c7`。
R027 分支由此 master 建立，沒有疊在未合併 PR 上。

永久 `scripts/test/modal-dismissal.test.tsx` 加入 Gallery 兩個真實 consumer
案例後，在 runtime 修正前為 **10 failed / 2 passed**（ignored
`.cache/r027-permanent-before.log`），修正後 **12 passed**。包含雙框架取消／
一般事件、callback／emit 次數、非主鍵不額外取消、panel 子元素不誤關閉、
取消後保留內容與 inert；正常主鍵遮罩會先取消原生 mousedown 焦點預設。
另與既有 keyboard／isolation／兩框架 tabs-modal 測試合跑曾為 62 passed。

`scripts/browser/modal-dismissal.spec.ts` 新增 16 個 Chromium 案例：8 個在每個
尺寸／主題分別操作 React 和 Vue，8 個操作 Gallery 的一次性 guard。使用真實
滑鼠、Enter／Space／Escape，確認草稿保留、取消後焦點與背景隔離、正常關閉
只要求一次、清除 inert 與 opener 還原。最初基準上的 8 個 adapter 案例皆在
中鍵誤關閉處失敗（`.cache/r027-before-browser.log`）；最終 16 passed
（`.cache/r027-targeted-browser-after.log`）。

中途測試另揭露兩點（`.cache/r027-intermediate-browser.log`）：

- native 中鍵／右鍵在非可聚焦遮罩上可改變焦點；它們保留瀏覽器預設，測試
  改成斷言對話框／內容／inert 保留，並用真實 Tab 確認仍可進入既有 focus trap。
  取消操作本身仍嚴格要求焦點在對話框內，不把 native 行為誤稱為焦點維持。
- Gallery 的一般主鍵遮罩關閉後，原生 mousedown 預設會覆蓋 cleanup 還原的
  opener 焦點，8 個 Gallery 案例因此失敗。兩框架在這條已接管的關閉路徑
  先 preventDefault 才要求關閉，最終同一 opener 斷言通過，沒有放寬為 body。

共用 CSS、語意 tokens、static 與 Tailwind runtime 沿用既有契約。完整本機
五項 gates 與 hosted CI／MERGEABLE 證據記錄於 R027 PR。

## 未執行與授權邊界

NOT_RUN：真人瀏覽器／視覺／鍵盤審查（360/768/1280/1536）、螢幕閱讀器、
實體觸控/DPI、真實 OS IME、Firefox/WebKit/其他 OS、完整 rendered contrast／
label、完整 WCAG AA、全家族／狀態截圖、人工核准視覺回歸 baseline、
npm/yarn 安裝矩陣。jsdom 與 headless Chromium 只支持列出的自動化結論。
不 npm publish、不發 release、不部署、不改 repo settings、不做破壞性刪除或
force-push，不宣稱專案完成或可上線。待辦中的發布與人工視覺 baseline 保持未完成。
