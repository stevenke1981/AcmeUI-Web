import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Modal } from '../../packages/react/src/index';
import VueModal from '../../packages/vue/src/components/Modal.vue';
const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
for (const framework of ['React', 'Vue']) for (const visibility of ['hidden', 'collapse'] as const) {
  it(`${framework} Modal wraps to and from a visible override inside visibility:${visibility}`, async () => {
    if (framework === 'React') render(<Modal open title="Visibility" onClose={() => {}}><div style={{ visibility }}><button id="last" style={{ visibility: 'visible' }}>Last</button></div></Modal>);
    else {
      const view = mount(VueModal, { props: { open: true, title: 'Visibility' }, slots: { default: () => h('div', { style: { visibility } }, [h('button', { id: 'last', style: { visibility: 'visible' } }, 'Last')]) }, attachTo: document.body });
      disposers.push(() => view.unmount()); await nextTick();
    }
    const first = document.querySelector<HTMLElement>('[aria-label="關閉"]')!, last = document.querySelector<HTMLElement>('#last')!;
    expect(getComputedStyle(last).visibility).toBe('visible');
    first.focus(); fireEvent.keyDown(first, { key: 'Tab', shiftKey: true }); expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: 'Tab' }); expect(document.activeElement).toBe(first);
  });
}
