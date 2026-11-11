import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Modal } from '../../packages/react/src/index';
import VueModal from '../../packages/vue/src/components/Modal.vue';
import { ModalNotesExample } from '../../apps/gallery/src/modal-notes';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
type Consumer = (event: { key: string; preventDefault(): void }) => void;
async function setup(framework: string, consume?: Consumer) {
  const onClose = vi.fn();
  if (framework === 'React') render(<div onKeyDown={consume}><Modal open title="Keyboard contract" onClose={onClose}><input aria-label="Draft"/><button id="last">Last</button></Modal></div>);
  else {
    const view = mount({ render: () => h('div', { onKeydown: consume }, [h(VueModal, { open: true, title: 'Keyboard contract', onClose }, () => [h('input', { 'aria-label': 'Draft' }), h('button', { id: 'last' }, 'Last')])]) }, { attachTo: document.body });
    disposers.push(() => view.unmount()); await nextTick();
  }
  return { onClose, first: document.querySelector<HTMLElement>('[aria-label="關閉"]')!, last: document.getElementById('last')! };
}
it('Gallery notes preserve composing Escape, consume the first normal Escape, then allow dismissal', () => {
  const onClose = vi.fn();
  render(<Modal open title="Gallery keyboard example" onClose={onClose}><ModalNotesExample/></Modal>);
  const draft = document.querySelector<HTMLElement>('[aria-label="專案備註"]')!;
  act(() => draft.focus());
  draft.textContent = 'Edited note'; fireEvent.input(draft);
  expect(key(draft, { key: 'Escape', isComposing: true }).defaultPrevented).toBe(false);
  expect(draft.dataset.editing).toBe('true'); expect(onClose).not.toHaveBeenCalled();
  expect(key(draft, { key: 'Escape' }).defaultPrevented).toBe(true);
  expect(draft.dataset.editing).toBe('false'); expect(onClose).not.toHaveBeenCalled();
  expect(draft.textContent).toBe('Edited note');
  expect(key(draft, { key: 'Escape' }).defaultPrevented).toBe(true);
  expect(onClose).toHaveBeenCalledTimes(1);
});
function key(target: HTMLElement, init: KeyboardEventInit) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  fireEvent(target, event); return event;
}
for (const framework of ['React', 'Vue']) {
  it(`${framework} Modal respects a consumer's cancelled Escape and handles the next uncancelled Escape`, async () => {
    let consume = true;
    const view = await setup(framework, event => { if (consume && event.key === 'Escape') event.preventDefault(); });
    const draft = document.querySelector<HTMLInputElement>('input')!; draft.focus();
    expect(key(draft, { key: 'Escape' }).defaultPrevented).toBe(true);
    expect(view.onClose).not.toHaveBeenCalled(); expect(document.activeElement).toBe(draft);
    consume = false;
    expect(key(draft, { key: 'Escape' }).defaultPrevented).toBe(true);
    expect(view.onClose).toHaveBeenCalledTimes(1);
  });
  it(`${framework} Modal preserves cancelled Tab/Shift+Tab boundaries and still wraps ordinary keys`, async () => {
    let consume = true;
    const view = await setup(framework, event => { if (consume && event.key === 'Tab') event.preventDefault(); });
    for (const shiftKey of [false, true]) {
      const source = shiftKey ? view.first : view.last, destination = shiftKey ? view.last : view.first;
      source.focus(); consume = true;
      expect(key(source, { key: 'Tab', shiftKey }).defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(source);
      consume = false;
      expect(key(source, { key: 'Tab', shiftKey }).defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(destination);
    }
    expect(view.onClose).not.toHaveBeenCalled();
  });
  for (const init of [{ key: 'Escape' }, { key: 'Tab' }, { key: 'Tab', shiftKey: true }]) {
    it(`${framework} Modal leaves composing ${init.shiftKey ? 'Shift+' : ''}${init.key} unhandled, then handles a normal key`, async () => {
      const view = await setup(framework), source = init.shiftKey ? view.first : view.last;
      source.focus();
      expect(key(source, { ...init, isComposing: true }).defaultPrevented).toBe(false);
      expect(view.onClose).not.toHaveBeenCalled(); expect(document.activeElement).toBe(source);
      expect(key(source, init).defaultPrevented).toBe(true);
      if (init.key === 'Escape') expect(view.onClose).toHaveBeenCalledTimes(1);
      else expect(document.activeElement).toBe(init.shiftKey ? view.last : view.first);
    });
  }
  it(`${framework} Modal leaves unrelated keys to the focused control`, async () => {
    const view = await setup(framework); view.last.focus();
    expect(key(view.last, { key: 'ArrowDown' }).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(view.last); expect(view.onClose).not.toHaveBeenCalled();
  });
}
