import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Tabs } from '../../packages/react/src/index';
import VueTabs from '../../packages/vue/src/components/Tabs.vue';
import { enhanceTabs } from '../../packages/static/src/interactions.mjs';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
async function setup(framework: string, capture: (event: KeyboardEvent) => void) {
  const items = [{ value: 'a', label: 'A', content: 'Alpha' }, { value: 'b', label: 'B', content: 'Beta' }];
  if (framework === 'React') render(<div onKeyDownCapture={event => capture(event.nativeEvent)}><Tabs items={items}/></div>);
  else if (framework === 'Vue') {
    const view = mount({ render: () => h('div', { onKeydownCapture: capture }, [h(VueTabs, { items })]) }, { attachTo: document.body });
    disposers.push(() => view.unmount()); await nextTick();
  } else {
    document.body.innerHTML = '<div id="root"><nav data-acme-tablist><a data-acme-tab id="a" href="#pa">A</a><a data-acme-tab id="b" href="#pb">B</a></nav><section id="pa">Alpha</section><section id="pb">Beta</section></div>';
    const root = document.getElementById('root')!;
    root.addEventListener('keydown', capture, true); disposers.push(enhanceTabs(root));
  }
  return Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]'));
}
for (const framework of ['React', 'Vue', 'static']) for (const mode of ['cancelled', 'composing']) {
  it(`${framework} Tabs preserves ${mode} keys and still handles the next ordinary key`, async () => {
    let consume = mode === 'cancelled';
    const tabs = await setup(framework, event => { if (consume) event.preventDefault(); });
    const cases: Array<[string, number, number]> = [['ArrowRight', 0, 1], ['ArrowLeft', 0, 1], ['Home', 1, 0], ['End', 0, 1]];
    if (framework === 'static') cases.push(['Enter', 1, 1], [' ', 1, 1]);
    for (const [key, source, target] of cases) {
      fireEvent.click(tabs[key === 'Enter' || key === ' ' ? 0 : source]); await nextTick();
      tabs[source].focus();
      const selected = tabs.find(tab => tab.getAttribute('aria-selected') === 'true')!;
      consume = mode === 'cancelled';
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, isComposing: mode === 'composing' });
      fireEvent(tabs[source], event); await nextTick();
      expect(event.defaultPrevented, key).toBe(mode === 'cancelled');
      expect(selected.getAttribute('aria-selected'), key).toBe('true');
      expect(document.activeElement, key).toBe(tabs[source]);
      expect(tabs.filter(tab => tab.tabIndex === 0)).toEqual([selected]);
      consume = false;
      const ordinary = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      fireEvent(tabs[source], ordinary); await nextTick();
      expect(ordinary.defaultPrevented, key).toBe(true);
      expect(tabs[target].getAttribute('aria-selected'), key).toBe('true');
      expect(document.activeElement, key).toBe(tabs[target]);
    }
  });
}
