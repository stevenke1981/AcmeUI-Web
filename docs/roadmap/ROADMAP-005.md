# ROADMAP-005：第五輪事件取消與原生 disclosure 焦點稽核

稽核日期：2026-11-12。基準：`master` / `6588f7919e00eb7bfec5cb9041bd002c3adfbaf2`。
R019 / [PR #21](https://github.com/stevenke1981/AcmeUI-Web/pull/21) 已合併，
R001–R019 的既有自動化項目皆已勾選。本輪為 review/fix，僅限 AcmeUI-Web；
先提交本 roadmap PR，再依 R020 → R021 → R022，各 slice 一個 PR，最多三片。
既有成果不重計為本輪新增功能；npm publication 與人工核准視覺 baseline 維持未勾選。

## 稽核證據

讀取 spec/plan/todos、ROADMAP-001–004、Skill/API、core focus/Modal helpers、
React/Vue Tabs、static enhancement、Gallery、Vitest、Chromium fixtures 與 CI。
R019 的 `defaultPrevented` / `isComposing` guard 僅套用於共用 Modal keydown，
尚未涵蓋以下其他事件入口。

| ID | 稽核定位 | 基準實際結果 | 影響與限制 |
|---|---|---|---|
| R020 | React `Tabs.onKeyDown`、Vue `Tabs.onKeydown`、static `enhanceTabs.keydown` | 三 adapter 各以已取消／合成組字 ArrowRight 重現，共六例失敗：第一個 tab 的 aria-selected 變為 false | 不應再移動焦點／選取或取消組字事件；這是合成旗標覆蓋，不是 OS IME 驗證 |
| R021 | static `enhanceModal` 的 `cancel` 無條件 close | 已先 preventDefault 的原生 cancel 仍呼叫 close，dialog.open 變 false，一例失敗 | 消費端無法保留尚未確認的內容；同時稽核 opener/close-button click 的取消與 cleanup，不更換 native dialog 模態機制 |
| R022 | core `nativeFocusableSelector` / `focusCandidates` | closed details 的結果為 `[hidden-draft,last]`，預期 `[summary,last]`，一例失敗 | 漏掉原生 summary，並將折疊內容錯列為可循序聚焦；實際鍵盤邊界待 Chromium 對照，不把 jsdom 當原生焦點證據 |

2026-11-12 基準最小 Vitest 重現：**8 tests / 8 failed**，無 runtime 修正。
命令、完整 fixture 與預期如下；原始本機 log 保存在 ignored
`.cache/validation/r020-r022/audit-before.log`，不是 hosted artifact 或人工審查。

## 可驗收切片

| ID | 優先序 | 範圍與驗收條件 | 狀態 |
|---|---|---|---|
| R020 | P2 | React/Vue/static Tabs 忽略先行取消或 isComposing 的鍵盤事件；ArrowLeft/Right/Home/End 與 static Enter/Space 的選取、焦點、defaultPrevented 保持；一般鍵仍依既有模型工作，包含真實 capture consumer；Vitest 三 adapter 對照、四尺寸/亮暗色 Chromium、Gallery/API/static 文件同步 | 已合併 [PR #23](https://github.com/stevenke1981/AcmeUI-Web/pull/23)，bb72b87；310 Vitest / 67 Chromium 與其他 gates PASS、兩組 hosted CI SUCCESS 且 MERGEABLE |
| R021 | P2 | static Modal 尊重先行取消的 cancel、開啟 click、關閉 click；未取消時仍只開／關一次、還原 opener；cleanup 可關閉並移除 listener、重複初始化與重新初始化保留契約；Vitest doubles 與四尺寸/亮暗色 Chromium 真實 Escape/按鈕驗證、static Gallery/文件同步；React/Vue 保留既有 R019 契約 | 已合併 [PR #24](https://github.com/stevenke1981/AcmeUI-Web/pull/24)，229059a；315 Vitest / 75 Chromium 與其他 gates PASS、兩組 hosted CI SUCCESS 且 MERGEABLE |
| R022 | P2 | core 與 React/Vue Modal 納入 details 第一個直接 summary；排除 closed details 非 summary 子樹、次要 summary 與無關 summary（除非有效明確 tabindex），處理巢狀及動態 open/close、原有 hidden/inert/disabled/tabindex 規則；Vitest + 四尺寸/亮暗色 Chromium 真實 Tab/Shift+Tab/Enter，Gallery/API/static 範圍同步 | 已實作；11 個新增 Vitest 的 10 個與首個 Chromium 反例先失敗，完整 gates/CI 證據見 R022 PR |

所有切片共用語意 CSS/token，Tailwind 為樣式 adapter，不增加另一份互動邏輯。
每個 PR（含 roadmap）須本機依序通過：

```bash
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm test
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm test:cli:installed
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm typecheck
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm build
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm test:browser
```

Chromium 已安裝於 repo `.cache/ms-playwright`；首次環境需依 README 安裝。
所有 hosted CI 必須 SUCCESS，GitHub 同一 HEAD 顯示 `MERGEABLE`，才以 merge
commit 合併；每次合併後同步 master 再開下一分支。不等待 Codex code review，
不留綠燈未合併 PR。結果、CI run URL、HEAD/merge SHA 記錄於各 PR。

## 基準重現步驟

在基準 SHA 的工作目錄執行以下命令，將下方 fixture 抽出至既有 test 搜尋路徑。
預期退出碼 1，六個 Tabs、一個 static Modal 與一個 focus 候選斷言失敗。
後續修正後結果會改變，需用基準 SHA 重現舊行為；勿覆寫已存在的同名測試。

```bash
mkdir -p .cache/validation/r020-r022
python3 - <<'PYFIXTURE'
from pathlib import Path
roadmap = Path('docs/roadmap/ROADMAP-005.md').read_text()
fixture = roadmap.split('```tsx\n', 1)[1].split('\n```', 1)[0]
with Path('scripts/test/roadmap005-audit.test.tsx').open('x') as target:
    target.write(fixture + '\n')
PYFIXTURE
COREPACK_HOME="$PWD/.cache/corepack" TMPDIR="$PWD/.cache/tmp" pnpm exec vitest run scripts/test/roadmap005-audit.test.tsx
# 不把預期失敗的稽核 fixture 留在正式 gate 中；保留作為本機證據。
mv scripts/test/roadmap005-audit.test.tsx .cache/validation/r020-r022/roadmap005-audit.test.tsx
```

```tsx
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Tabs } from '../../packages/react/src/index';
import VueTabs from '../../packages/vue/src/components/Tabs.vue';
import { enhanceModal, enhanceTabs } from '../../packages/static/src/interactions.mjs';
import { getFocusable } from '../../packages/core/src/index';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
for (const framework of ['React', 'Vue', 'static']) for (const cancelled of [true, false]) {
  it(`${framework} Tabs preserves selection/focus for ${cancelled ? 'cancelled' : 'composing'} ArrowRight`, async () => {
    const items = [{ value: 'a', label: 'A', content: 'Alpha' }, { value: 'b', label: 'B', content: 'Beta' }];
    if (framework === 'React') render(<Tabs items={items}/>);
    else if (framework === 'Vue') {
      const view = mount({ render: () => h(VueTabs, { items }) }, { attachTo: document.body });
      disposers.push(() => view.unmount()); await nextTick();
    } else {
      document.body.innerHTML = '<div id="root"><nav data-acme-tablist><a data-acme-tab id="a" href="#pa">A</a><a data-acme-tab id="b" href="#pb">B</a></nav><section id="pa">Alpha</section><section id="pb">Beta</section></div>';
      disposers.push(enhanceTabs(document.getElementById('root')!));
    }
    const first = document.querySelector<HTMLElement>('[role="tab"]')!; first.focus();
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true, isComposing: !cancelled });
    if (cancelled) event.preventDefault();
    fireEvent(first, event); await nextTick();
    expect(first.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(first);
  });
}
it('static Modal keeps a native dialog open after a consumer cancels cancel', () => {
  document.body.innerHTML = '<dialog open><button data-acme-modal-close>Close</button></dialog>';
  const dialog = document.querySelector('dialog')!;
  dialog.showModal = vi.fn(); dialog.close = vi.fn(() => dialog.removeAttribute('open'));
  dialog.addEventListener('cancel', event => event.preventDefault());
  disposers.push(enhanceModal(dialog));
  dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
  expect(dialog.open).toBe(true); expect(dialog.close).not.toHaveBeenCalled();
});
it('Modal includes only the first summary and excludes controls in closed details', () => {
  document.body.innerHTML = '<section><details><summary id="summary">More</summary><input id="hidden-draft"></details><button id="last">Last</button></section>';
  expect(getFocusable(document.querySelector('section')!).map(node => node.id)).toEqual(['summary', 'last']);
});
```

## 人工與授權邊界

NOT_RUN：真人瀏覽器／視覺／鍵盤審查（360/768/1280/1536）、真實 OS IME、
螢幕閱讀器、實體觸控/DPI、Firefox/WebKit/其他 OS、完整 rendered contrast/label、
全家族狀態截圖、完整 WCAG AA、人工核准視覺回歸 baseline、npm/yarn 安裝矩陣。
自動 Chromium、合成事件與 jsdom doubles 僅代表各自列出的自動化範圍。
不 npm publish、不發 release、不部署、不改 repo settings、不破壞性刪除或
force-push，不宣稱專案完成或可上線。
