import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Modal as ReactModal } from '../../packages/react/src/index';
import VueModal from '../../packages/vue/src/components/Modal.vue';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
const flush = async () => { await nextTick(); await nextTick(); };
function setup(framework: 'React' | 'Vue', strict = false, initialOpen = false) {
  document.body.innerHTML = '<button id="external">External</button><aside id="existing" inert="preserved" aria-hidden="true">Hidden</aside>';
  if (initialOpen) document.getElementById('external')!.focus();
  const onClose = vi.fn();
  if (framework === 'React') {
    const content = (open: boolean) => <main id="ancestor"><button id="opener">Open</button><div id="host"><ReactModal open={open} title="Isolation" onClose={onClose}><input aria-label="Name"/><button id="save">Save</button></ReactModal><button id="sibling">Sibling</button></div></main>;
    const tree = (open: boolean) => strict ? <StrictMode>{content(open)}</StrictMode> : content(open);
    const view = render(tree(initialOpen)); disposers.push(view.unmount);
    return { onClose, setOpen: async (open: boolean) => { view.rerender(tree(open)); }, unmount: view.unmount };
  }
  const Fixture = { props: ['open'], setup: (props: { open: boolean }) => () => h('main', { id: 'ancestor' }, [
    h('button', { id: 'opener' }, 'Open'), h('div', { id: 'host' }, [
      h(VueModal, { open: props.open, title: 'Isolation', onClose }, () => [h('input', { 'aria-label': 'Name' }), h('button', { id: 'save' }, 'Save')]),
      h('button', { id: 'sibling' }, 'Sibling'),
    ]),
  ]) };
  const view = mount(Fixture, { props: { open: initialOpen }, attachTo: document.body }); disposers.push(() => view.unmount());
  return { onClose, setOpen: async (open: boolean) => { await view.setProps({ open }); await flush(); }, unmount: () => view.unmount() };
}
const node = (id: string) => document.getElementById(id)!;
for (const framework of ['React', 'Vue'] as const) describe(`${framework} Modal background isolation`, () => {
  it('isolates siblings at every ancestor while leaving the panel and its ancestors usable', async () => {
    const view = setup(framework); node('opener').focus(); await view.setOpen(true);
    for (const id of ['external', 'existing', 'opener', 'sibling']) expect(node(id).hasAttribute('inert'), id).toBe(true);
    for (const id of ['ancestor', 'host']) expect(node(id).hasAttribute('inert'), id).toBe(false);
    const dialog = document.querySelector<HTMLElement>('[role=dialog]')!;
    expect(dialog.closest('[inert]')).toBeNull(); expect(dialog.contains(document.activeElement)).toBe(true);
    expect(node('existing').getAttribute('aria-hidden')).toBe('true');
  });
  it('redirects programmatic outside focus without waiting for another Tab', async () => {
    const view = setup(framework); await view.setOpen(true);
    node('save').focus(); node('external').focus();
    // jsdom does not implement inert; this specifically proves the focusin guard.
    expect(document.activeElement?.getAttribute('aria-label')).toBe('關閉');
    document.querySelector<HTMLElement>('[role=dialog]')!.focus();
    expect(document.activeElement?.getAttribute('role')).toBe('dialog');
  });
  it('isolates inserted backgrounds and restores a node moved inside the panel', async () => {
    const view = setup(framework); await view.setOpen(true);
    const added = document.createElement('button'); added.id = 'added'; document.body.append(added);
    await flush(); expect(added.hasAttribute('inert')).toBe(true);
    document.querySelector('[role=dialog]')!.append(added);
    await flush(); expect(added.hasAttribute('inert')).toBe(false);
    added.focus(); expect(document.activeElement).toBe(added);
    await view.setOpen(false); expect(added.hasAttribute('inert')).toBe(false);
  });
  it('restores exact prior attributes and opener focus on close, then supports reopening', async () => {
    const view = setup(framework); const opener = node('opener'); opener.focus();
    await view.setOpen(true); await view.setOpen(false);
    for (const id of ['external', 'opener', 'sibling']) expect(node(id).hasAttribute('inert')).toBe(false);
    expect(node('existing').getAttribute('inert')).toBe('preserved');
    expect(node('existing').getAttribute('aria-hidden')).toBe('true'); expect(document.activeElement).toBe(opener);
    await view.setOpen(true); fireEvent.keyDown(document, { key: 'Escape' });
    expect(view.onClose).toHaveBeenCalledTimes(1); await view.setOpen(false);
    fireEvent.keyDown(document, { key: 'Escape' }); expect(view.onClose).toHaveBeenCalledTimes(1);
    node('external').focus(); expect(document.activeElement).toBe(node('external'));
  });
  it('releases isolation/listeners on unmount and skips disconnected openers', async () => {
    const view = setup(framework); const opener = node('opener'); opener.focus(); await view.setOpen(true);
    opener.remove(); const focus = vi.spyOn(opener, 'focus'); view.unmount(); await flush();
    expect(focus).not.toHaveBeenCalled(); expect(node('external').hasAttribute('inert')).toBe(false);
    const added = document.createElement('button'); document.body.append(added); await flush();
    expect(added.hasAttribute('inert')).toBe(false); added.focus(); expect(document.activeElement).toBe(added);
    fireEvent.keyDown(document, { key: 'Escape' }); expect(view.onClose).not.toHaveBeenCalled();
  });
});
it('React StrictMode replays lifecycle without leaving background inert or duplicate listeners', async () => {
  const view = setup('React', true, true);
  expect(node('external').hasAttribute('inert')).toBe(true); fireEvent.keyDown(document, { key: 'Escape' });
  expect(view.onClose).toHaveBeenCalledTimes(1); await view.setOpen(false);
  expect(node('external').hasAttribute('inert')).toBe(false); expect(document.activeElement).toBe(node('external'));
});
it('Vue quick open/close followed by unmount leaves no deferred activation', async () => {
  const view = setup('Vue'); const opening = view.setOpen(true), closing = view.setOpen(false);
  await Promise.all([opening, closing]); view.unmount(); await flush();
  expect(document.querySelector('[role=dialog]')).toBeNull(); expect(node('external').hasAttribute('inert')).toBe(false);
  node('external').focus(); expect(document.activeElement).toBe(node('external'));
});
it('Vue unmounts an initially open Modal without leaving an activation queued', async () => {
  const view = setup('Vue', false, true); view.unmount(); await flush();
  expect(node('external').hasAttribute('inert')).toBe(false); expect(document.activeElement).toBe(node('external'));
  fireEvent.keyDown(document, { key: 'Escape' }); expect(view.onClose).not.toHaveBeenCalled();
});
