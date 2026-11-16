import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Modal } from '../../packages/react/src/index';
import VueModal from '../../packages/vue/src/components/Modal.vue';
import { ModalDismissalExample } from '../../apps/gallery/src/modal-dismissal';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); cleanup(); document.body.innerHTML = ''; });
type Consumer = (event: { preventDefault(): void }) => void;
async function setup(framework: string, consumeClick?: Consumer, consumeMouseDown?: Consumer) {
  const onClose = vi.fn();
  const opener = document.createElement('button'); document.body.append(opener); opener.focus();
  if (framework === 'React') render(<div onClickCapture={consumeClick} onMouseDownCapture={consumeMouseDown}><Modal open title="Mouse dismissal" onClose={onClose}><input aria-label="Draft"/></Modal></div>);
  else {
    const view = mount({ render: () => h('div', { onClickCapture: consumeClick, onMousedownCapture: consumeMouseDown }, [h(VueModal, { open: true, title: 'Mouse dismissal', onClose }, () => h('input', { 'aria-label': 'Draft' }))]) }, { attachTo: document.body });
    disposers.push(() => view.unmount()); await nextTick();
  }
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
  return { onClose, opener, dialog, backdrop: document.querySelector<HTMLElement>('.acme-modal')!, close: dialog.querySelector<HTMLButtonElement>('[aria-label="關閉"]')! };
}
function mouse(target: HTMLElement, type: string, button = 0) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button });
  fireEvent(target, event); return event;
}
for (const target of ['close', 'backdrop']) it(`Gallery cancels one ${target} dismissal and preserves the draft`, () => {
  const onClose = vi.fn();
  render(<ModalDismissalExample open title="Gallery mouse contract" onClose={onClose}><input aria-label="Draft" defaultValue="Retained draft"/></ModalDismissalExample>);
  const guard = document.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  fireEvent.click(guard); expect(guard.checked).toBe(true);
  const node = document.querySelector<HTMLElement>(target === 'close' ? '[aria-label="關閉"]' : '.acme-modal')!;
  const type = target === 'close' ? 'click' : 'mousedown';
  expect(mouse(node, type).defaultPrevented).toBe(true);
  expect(onClose).not.toHaveBeenCalled(); expect(guard.checked).toBe(false);
  expect(document.querySelector<HTMLInputElement>('[aria-label="Draft"]')!.value).toBe('Retained draft');
  expect(mouse(node, type).defaultPrevented).toBe(target === 'backdrop'); expect(onClose).toHaveBeenCalledTimes(1);
});
for (const framework of ['React', 'Vue']) {
  it(`${framework} keeps a cancelled close-button click open and allows the next ordinary click`, async () => {
    let consume = true;
    const view = await setup(framework, event => { if (consume) event.preventDefault(); });
    expect(mouse(view.close, 'click').defaultPrevented).toBe(true);
    expect(view.onClose).not.toHaveBeenCalled();
    expect(view.dialog.contains(document.activeElement)).toBe(true); expect(view.opener.hasAttribute('inert')).toBe(true);
    consume = false;
    expect(mouse(view.close, 'click').defaultPrevented).toBe(false); expect(view.onClose).toHaveBeenCalledTimes(1);
  });
  it(`${framework} keeps a cancelled backdrop mousedown open and allows the next primary mousedown`, async () => {
    let consume = true;
    const view = await setup(framework, undefined, event => { if (consume) event.preventDefault(); });
    expect(mouse(view.backdrop, 'mousedown').defaultPrevented).toBe(true);
    expect(view.onClose).not.toHaveBeenCalled();
    expect(view.dialog.contains(document.activeElement)).toBe(true); expect(view.opener.hasAttribute('inert')).toBe(true);
    consume = false;
    expect(mouse(view.backdrop, 'mousedown').defaultPrevented).toBe(true); expect(view.onClose).toHaveBeenCalledTimes(1);
  });
  for (const button of [1, 2]) it(`${framework} ignores backdrop mouse button ${button} without cancelling it`, async () => {
    const view = await setup(framework);
    expect(mouse(view.backdrop, 'mousedown', button).defaultPrevented).toBe(false);
    expect(view.onClose).not.toHaveBeenCalled(); expect(view.dialog.contains(document.activeElement)).toBe(true);
    mouse(view.backdrop, 'mousedown'); expect(view.onClose).toHaveBeenCalledTimes(1);
  });
  it(`${framework} leaves panel and descendant mouse events alone`, async () => {
    const view = await setup(framework);
    for (const target of [view.dialog, view.dialog.querySelector<HTMLElement>('input')!]) {
      expect(mouse(target, 'mousedown').defaultPrevented).toBe(false);
      expect(mouse(target, 'click').defaultPrevented).toBe(false);
    }
    expect(view.onClose).not.toHaveBeenCalled();
    mouse(view.close, 'click'); expect(view.onClose).toHaveBeenCalledTimes(1);
  });
}
