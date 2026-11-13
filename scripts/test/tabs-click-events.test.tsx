import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Tabs } from '../../packages/react/src/index';
import VueTabs from '../../packages/vue/src/components/Tabs.vue';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });

const items = [
  { value: 'a', label: 'A', content: 'Alpha' },
  { value: 'b', label: 'B', content: 'Beta' },
];

async function setup(framework: 'React' | 'Vue', capture: (event: MouseEvent) => void) {
  if (framework === 'React') {
    render(<div onClickCapture={event => capture(event.nativeEvent)}><Tabs items={items}/></div>);
  } else {
    const view = mount({ render: () => h('div', { onClickCapture: capture }, [h(VueTabs, { items })]) }, { attachTo: document.body });
    disposers.push(() => view.unmount());
    await nextTick();
  }
  return {
    tabs: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]')),
    panels: Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]')),
  };
}

function panelHidden(framework: 'React' | 'Vue', panel: HTMLElement) {
  return framework === 'React' ? panel.hidden : getComputedStyle(panel).display === 'none';
}

function expectSelected(framework: 'React' | 'Vue', tabs: HTMLElement[], panels: HTMLElement[], index: number) {
  tabs.forEach((tab, i) => {
    expect(tab.getAttribute('aria-selected'), `tab ${i} aria-selected`).toBe(String(i === index));
    expect(tab.tabIndex, `tab ${i} tabindex`).toBe(i === index ? 0 : -1);
  });
  panels.forEach((panel, i) => {
    expect(panelHidden(framework, panel), `panel ${i} hidden`).toBe(i !== index);
  });
}

for (const framework of ['React', 'Vue'] as const) {
  it(`${framework} Tabs ignores a cancelled capture click and keeps the original selection`, async () => {
    let consume = true;
    const { tabs, panels } = await setup(framework, event => { if (consume) event.preventDefault(); });
    expectSelected(framework, tabs, panels, 0);

    const cancelled = new MouseEvent('click', { bubbles: true, cancelable: true });
    tabs[1].dispatchEvent(cancelled);
    await nextTick();

    expect(cancelled.defaultPrevented).toBe(true);
    expectSelected(framework, tabs, panels, 0);
  });

  it(`${framework} Tabs activates once after cancellation is lifted, then treats an already-selected click as harmless`, async () => {
    let consume = true;
    const { tabs, panels } = await setup(framework, event => { if (consume) event.preventDefault(); });

    tabs[1].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await nextTick();
    expectSelected(framework, tabs, panels, 0);

    consume = false;
    const first = new MouseEvent('click', { bubbles: true, cancelable: true });
    tabs[1].dispatchEvent(first);
    await nextTick();
    expectSelected(framework, tabs, panels, 1);

    const second = new MouseEvent('click', { bubbles: true, cancelable: true });
    tabs[1].dispatchEvent(second);
    await nextTick();
    expectSelected(framework, tabs, panels, 1);
  });
}
