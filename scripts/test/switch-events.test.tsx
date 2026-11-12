import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { Switch } from '../../packages/react/src/index';
import VueSwitch from '../../packages/vue/src/components/Switch.vue';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
function expectChecked(button: HTMLElement, checked: boolean) {
  expect(button.getAttribute('aria-checked')).toBe(String(checked));
  expect(button.getAttribute('data-checked')).toBe(String(checked));
}
for (const framework of ['React', 'Vue']) for (const controlled of [false, true]) for (const initial of [false, true]) {
  it(`${framework} Switch ${controlled ? 'controlled' : 'uncontrolled'} (${initial}) respects capture cancellation then toggles once`, async () => {
    const changed = vi.fn();
    let cancel = true;
    const capture = (event: Event) => { if (cancel) event.preventDefault(); };
    const model = ref(initial);
    const reactView = framework === 'React' ? render(<div onClickCapture={event => capture(event.nativeEvent)}><Switch checked={controlled ? initial : undefined} defaultChecked={initial} onCheckedChange={changed}/></div>) : undefined;
    const vueView = framework === 'Vue' ? mount({ render: () => h('div', {}, [h(VueSwitch, { modelValue: controlled ? model.value : undefined, defaultChecked: initial, 'onUpdate:modelValue': changed })]) }, { attachTo: document.body }) : undefined;
    if (vueView) disposers.push(() => vueView.unmount());
    const button = document.querySelector<HTMLElement>('[role="switch"]')!;
    if (vueView) button.addEventListener('click', capture, true);
    expectChecked(button, initial);
    const cancelled = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(button, cancelled); await nextTick();
    expect(cancelled.defaultPrevented).toBe(true);
    expectChecked(button, initial);
    expect(changed).not.toHaveBeenCalled();
    cancel = false;
    fireEvent.click(button); await nextTick();
    expect(changed).toHaveBeenCalledExactlyOnceWith(!initial);
    expectChecked(button, controlled ? initial : !initial);
    if (controlled) {
      // The consumer owns the displayed value, including after a successful request.
      if (reactView) reactView.rerender(<div onClickCapture={event => capture(event.nativeEvent)}><Switch checked={!initial} onCheckedChange={changed}/></div>);
      model.value = !initial; await nextTick();
      expectChecked(button, !initial);
      expect(changed).toHaveBeenCalledTimes(1);
    }
  });
}
for (const framework of ['React', 'Vue']) it(`${framework} disabled Switch stays inert`, async () => {
  const changed = vi.fn();
  if (framework === 'React') render(<Switch disabled defaultChecked onCheckedChange={changed}/>);
  else {
    const view = mount(VueSwitch, { props: { disabled: true, defaultChecked: true, 'onUpdate:modelValue': changed }, attachTo: document.body });
    disposers.push(() => view.unmount());
  }
  const button = document.querySelector<HTMLButtonElement>('[role="switch"]')!;
  expect(button.disabled).toBe(true);
  fireEvent.click(button); await nextTick();
  expectChecked(button, true);
  expect(changed).not.toHaveBeenCalled();
});
for (const cancelled of [false, true]) it(`React Switch calls onClick before deciding whether to toggle (${cancelled})`, () => {
  const changed = vi.fn();
  const clicked = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
    expect(changed).not.toHaveBeenCalled();
    if (cancelled) event.preventDefault();
  });
  const view = render(<Switch onClick={clicked} onCheckedChange={changed}/>);
  const button = view.getByRole('switch');
  fireEvent.click(button);
  expect(clicked).toHaveBeenCalledTimes(1);
  expectChecked(button, !cancelled);
  if (cancelled) expect(changed).not.toHaveBeenCalled();
  else expect(changed).toHaveBeenCalledExactlyOnceWith(true);
});
