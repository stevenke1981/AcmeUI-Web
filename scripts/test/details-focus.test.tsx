import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Modal } from '../../packages/react/src/index';
import VueModal from '../../packages/vue/src/components/Modal.vue';
const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
for (const framework of ['React', 'Vue']) it(`${framework} Modal recomputes explicit summary and expanded input boundaries`, async () => {
  if (framework === 'React') render(<Modal open title="Details" onClose={() => {}}><details><summary>More</summary><input aria-label="Draft"/></details></Modal>);
  else {
    const view = mount(VueModal, { props: { open: true, title: 'Details' }, slots: { default: () => h('details', [h('summary', 'More'), h('input', { 'aria-label': 'Draft' })]) }, attachTo: document.body });
    disposers.push(() => view.unmount()); await nextTick();
  }
  const first = document.querySelector<HTMLElement>('[aria-label="關閉"]')!, details = document.querySelector('details')!, summary = document.querySelector('summary')!, draft = document.querySelector('input')!;
  first.focus(); fireEvent.keyDown(first, { key: 'Tab', shiftKey: true }); expect(document.activeElement).toBe(summary);
  fireEvent.keyDown(summary, { key: 'Tab' }); expect(document.activeElement).toBe(first);
  details.open = true; fireEvent.keyDown(first, { key: 'Tab', shiftKey: true }); expect(document.activeElement).toBe(draft);
  details.open = false; first.focus(); fireEvent.keyDown(first, { key: 'Tab', shiftKey: true }); expect(document.activeElement).toBe(summary);
});
