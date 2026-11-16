import { afterEach, expect, it } from 'vitest';
import { enhanceTabs } from '../../packages/static/src/interactions.mjs';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); document.body.innerHTML = ''; });

function setup(options: { registerCaptureBeforeEnhancement?: boolean } = {}) {
  document.body.innerHTML = `
    <div id="root">
      <nav data-acme-tablist>
        <a data-acme-tab id="overview-tab" href="#overview">總覽<span id="overview-label">總覽</span></a>
        <a data-acme-tab id="usage-tab" href="#usage">使用方式<span id="usage-label">使用方式</span></a>
      </nav>
      <section id="overview" aria-labelledby="overview-tab"><p>總覽內容</p></section>
      <section id="usage" aria-labelledby="usage-tab"><p>使用方式內容</p></section>
    </div>`;
  const root = document.getElementById('root')!;
  const overview = document.getElementById('overview-tab')!;
  const usage = document.getElementById('usage-tab')!;
  const usageLabel = document.getElementById('usage-label')!;
  const panels = [document.getElementById('overview')!, document.getElementById('usage')!];
  let consume = false;
  const capture = (event: MouseEvent) => { if (consume) event.preventDefault(); };
  if (options.registerCaptureBeforeEnhancement) root.addEventListener('click', capture, true);
  const dispose = enhanceTabs(root);
  if (!options.registerCaptureBeforeEnhancement) root.addEventListener('click', capture, true);
  disposers.push(dispose);
  return { root, overview, usage, usageLabel, panels, dispose, setConsume: (value: boolean) => { consume = value; } };
}

function expectSelected(tabs: ReturnType<typeof setup>, selected: 'overview' | 'usage') {
  const overviewSelected = selected === 'overview';
  expect(tabs.overview.getAttribute('aria-selected')).toBe(String(overviewSelected));
  expect(tabs.usage.getAttribute('aria-selected')).toBe(String(!overviewSelected));
  expect(tabs.overview.tabIndex).toBe(overviewSelected ? 0 : -1);
  expect(tabs.usage.tabIndex).toBe(overviewSelected ? -1 : 0);
  expect(tabs.panels[0].hidden).toBe(!overviewSelected);
  expect(tabs.panels[1].hidden).toBe(overviewSelected);
}

for (const registerCaptureBeforeEnhancement of [true, false]) {
  it(`static Tabs ignores a cancelled ${registerCaptureBeforeEnhancement ? 'pre-enhancement' : 'post-enhancement'} capture click, including a child target`, () => {
    const tabs = setup({ registerCaptureBeforeEnhancement });
    tabs.setConsume(true);
    const cancelled = new MouseEvent('click', { bubbles: true, cancelable: true });
    tabs.usageLabel.dispatchEvent(cancelled);

    expect(cancelled.defaultPrevented).toBe(true);
    expectSelected(tabs, 'overview');
  });

  it(`static Tabs activates once after cancellation is lifted, then treats an already-selected click as harmless (${registerCaptureBeforeEnhancement ? 'pre-enhancement' : 'post-enhancement'} capture)`, () => {
    const tabs = setup({ registerCaptureBeforeEnhancement });
    tabs.setConsume(true);
    tabs.usage.click();
    expectSelected(tabs, 'overview');

    tabs.setConsume(false);
    const first = new MouseEvent('click', { bubbles: true, cancelable: true });
    tabs.usage.dispatchEvent(first);
    expect(first.defaultPrevented).toBe(true);
    expectSelected(tabs, 'usage');

    const second = new MouseEvent('click', { bubbles: true, cancelable: true });
    tabs.usage.dispatchEvent(second);
    expect(second.defaultPrevented).toBe(true);
    expectSelected(tabs, 'usage');
  });
}

it('static Tabs preserves modifier-key native link behavior and ignores non-primary buttons', () => {
  const tabs = setup();
  for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const) {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, [modifier]: true });
    tabs.usage.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expectSelected(tabs, 'overview');
  }

  const secondary = new MouseEvent('click', { bubbles: true, cancelable: true, button: 1 });
  tabs.usage.dispatchEvent(secondary);
  expect(secondary.defaultPrevented).toBe(false);
  expectSelected(tabs, 'overview');
});

it('static Tabs cleanup and reinitialization preserve cancelled-click behavior and restore markup', () => {
  const tabs = setup();
  tabs.setConsume(true);
  tabs.usage.click();
  expectSelected(tabs, 'overview');
  tabs.dispose();
  tabs.dispose();
  expect(tabs.usage.hasAttribute('role')).toBe(false);
  expect(tabs.panels.some(panel => panel.hasAttribute('hidden'))).toBe(false);

  const restored = setup();
  restored.setConsume(true);
  restored.usage.click();
  expectSelected(restored, 'overview');
  restored.setConsume(false);
  restored.usage.click();
  expectSelected(restored, 'usage');
  expect(restored.dispose).toBeTypeOf('function');
  restored.dispose();
});
