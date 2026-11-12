import { afterEach, expect, it, vi } from 'vitest';
import { enhanceModal } from '../../packages/static/src/interactions.mjs';
const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); document.body.innerHTML = ''; });
function setup() {
  document.body.innerHTML = '<button id="opener">Open</button><dialog><input aria-label="Draft"><button data-acme-modal-close><span>Close</span></button></dialog>';
  const dialog = document.querySelector('dialog')!, opener = document.getElementById('opener')!, close = dialog.querySelector('button')!;
  dialog.showModal = vi.fn(() => { dialog.open = true; dialog.querySelector('input')!.focus(); });
  dialog.close = vi.fn(() => { dialog.open = false; dialog.dispatchEvent(new Event('close')); });
  const dispose = enhanceModal(dialog, [opener]); disposers.push(dispose);
  opener.focus();
  return { dialog, opener, close, dispose };
}
it('static Modal respects a cancelled opener click, then opens once normally', () => {
  const { dialog, opener } = setup(); let consume = true;
  opener.addEventListener('click', event => { if (consume) event.preventDefault(); }, true);
  opener.click(); expect(dialog.showModal).not.toHaveBeenCalled(); expect(dialog.open).toBe(false); expect(document.activeElement).toBe(opener);
  consume = false; opener.click(); opener.click(); expect(dialog.showModal).toHaveBeenCalledTimes(1); expect(dialog.open).toBe(true);
});
it('static Modal respects native cancel even when consumer capture is registered after enhancement', () => {
  const { dialog, opener } = setup(); let consume = true;
  dialog.addEventListener('cancel', event => { if (consume) event.preventDefault(); }, true);
  opener.click(); const draft = dialog.querySelector('input')!; draft.value = 'Keep';
  const cancelled = new Event('cancel', { cancelable: true }); dialog.dispatchEvent(cancelled);
  expect(cancelled.defaultPrevented).toBe(true); expect(dialog.close).not.toHaveBeenCalled(); expect(dialog.open).toBe(true); expect(document.activeElement).toBe(draft); expect(draft.value).toBe('Keep');
  consume = false; const ordinary = new Event('cancel', { cancelable: true }); dialog.dispatchEvent(ordinary);
  expect(ordinary.defaultPrevented).toBe(true); expect(dialog.close).toHaveBeenCalledTimes(1); expect(dialog.open).toBe(false); expect(document.activeElement).toBe(opener);
});
it('static Modal preserves a cancelled descendant close click and restores opener on the next click', () => {
  const { dialog, opener, close } = setup(); let consume = true;
  close.addEventListener('click', event => { if (consume) event.preventDefault(); });
  opener.click(); close.querySelector('span')!.click();
  expect(dialog.close).not.toHaveBeenCalled(); expect(dialog.open).toBe(true);
  consume = false; close.querySelector('span')!.click(); expect(dialog.close).toHaveBeenCalledTimes(1); expect(document.activeElement).toBe(opener);
});
it('cleanup still closes a preserved dialog once and detaches enhancement listeners', () => {
  const { dialog, opener, close, dispose } = setup();
  dialog.addEventListener('cancel', event => event.preventDefault(), true);
  opener.click(); dialog.dispatchEvent(new Event('cancel', { cancelable: true })); expect(dialog.open).toBe(true);
  dispose(); dispose(); expect(dialog.close).toHaveBeenCalledTimes(1); expect(document.activeElement).toBe(opener);
  opener.click(); close.click(); dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
  expect(dialog.showModal).toHaveBeenCalledTimes(1); expect(dialog.close).toHaveBeenCalledTimes(1);
});
it('idempotent enhancement and reinitialization do not duplicate cancellation or close handling', () => {
  const { dialog, opener, dispose } = setup();
  expect(enhanceModal(dialog, [opener])).toBe(dispose); dispose();
  disposers.push(enhanceModal(dialog, [opener])); let consume = true;
  dialog.addEventListener('cancel', event => { if (consume) event.preventDefault(); }, true);
  opener.click(); dialog.dispatchEvent(new Event('cancel', { cancelable: true })); expect(dialog.close).not.toHaveBeenCalled();
  consume = false; dialog.dispatchEvent(new Event('cancel', { cancelable: true })); expect(dialog.close).toHaveBeenCalledTimes(1); expect(document.activeElement).toBe(opener);
});
