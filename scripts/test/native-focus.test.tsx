import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Modal } from '../../packages/react/src/index';
import VueModal from '../../packages/vue/src/components/Modal.vue';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
for (const framework of ['React', 'Vue']) it(`${framework} Modal uses selected radios and editable hosts as live Tab boundaries`, async () => {
  const html = '<input id="a" type="radio" name="choice" checked><input id="b" type="radio" name="choice"><div id="editor" contenteditable="plaintext-only" tabindex="0">Draft</div>';
  if (framework === 'React') render(<Modal open title="Native focus" onClose={() => {}}><div dangerouslySetInnerHTML={{ __html: html }}/></Modal>);
  else { const view = mount(VueModal, { props: { open: true, title: 'Native focus' }, slots: { default: html }, attachTo: document.body }); disposers.push(() => view.unmount()); await nextTick(); }
  const close = document.querySelector<HTMLElement>('[aria-label="關閉"]')!, editor = document.getElementById('editor')!;
  // tabindex is only a jsdom focus-method aid; core/browser tests cover implicit editing hosts.
  close.focus(); fireEvent.keyDown(document, { key: 'Tab', shiftKey: true }); expect(document.activeElement).toBe(editor);
  fireEvent.keyDown(document, { key: 'Tab' }); expect(document.activeElement).toBe(close);
  editor.remove(); close.focus(); fireEvent.keyDown(document, { key: 'Tab', shiftKey: true }); expect(document.activeElement?.id).toBe('a');
  fireEvent.keyDown(document, { key: 'Tab' }); expect(document.activeElement).toBe(close);
  document.querySelector<HTMLInputElement>('#b')!.checked = true;
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true }); expect(document.activeElement?.id).toBe('b');
});
