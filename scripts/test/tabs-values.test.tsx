import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { Tabs } from '../../packages/react/src/index';
import VueTabs from '../../packages/vue/src/components/Tabs.vue';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach(fn => fn()); cleanup(); document.body.innerHTML = ''; });
const items = (value: string) => [{ value, label: 'First', content: 'One' }, { value, label: 'Second', content: 'Two' }];
for (const framework of ['React', 'Vue']) {
  for (const value of ['a', '']) it(`${framework} Tabs rejects duplicate ${JSON.stringify(value)} values before rendering ambiguous selection`, () => {
    const renderInvalid = () => {
      if (framework === 'React') render(<Tabs items={items(value)}/>);
      else { const view = mount(VueTabs, { props: { items: items(value) }, attachTo: document.body }); disposers.push(() => view.unmount()); }
    };
    expect(renderInvalid).toThrow(/Tabs.*unique.*index 1/);
    expect(document.querySelectorAll('[role=tab][aria-selected=true]').length).toBeLessThanOrEqual(1);
  });
  it(`${framework} Tabs allows unique empty/special values and independently repeated values in other instances`, () => {
    const valid = [{ value: '', label: 'Empty', content: 'Empty panel' }, { value: 'a " 雪 #', label: 'Other', content: 'Other panel' }];
    if (framework === 'React') render(<><Tabs items={valid}/><Tabs items={valid}/></>);
    else { const view = mount({ render: () => h('div', [h(VueTabs, { items: valid }), h(VueTabs, { items: valid })]) }, { attachTo: document.body }); disposers.push(() => view.unmount()); }
    expect(document.querySelectorAll('[role=tab][aria-selected=true]')).toHaveLength(2);
    const tabs = Array.from(document.querySelectorAll('[role=tab]'));
    const ids = tabs.map(tab => tab.id); expect(new Set(ids).size).toBe(4);
    for (const tab of tabs) expect(document.getElementById(tab.getAttribute('aria-controls')!)?.getAttribute('aria-labelledby')).toBe(tab.id);
  });
}
it('React rejects duplicates introduced by an items update', () => {
  const view = render(<Tabs items={[items('a')[0], items('b')[0]]}/>);
  expect(() => view.rerender(<Tabs items={items('a')}/>)).toThrow(/Tabs.*unique.*index 1/);
  expect(document.querySelectorAll('[role=tab][aria-selected=true]').length).toBeLessThanOrEqual(1);
});
it('Vue reports invalid updates through framework error handling and renders repaired unique items', async () => {
  const errors: unknown[] = [];
  const view = mount(VueTabs, { props: { items: [items('a')[0], items('b')[0]] }, attachTo: document.body, global: { config: { errorHandler: error => { errors.push(error); } } } });
  disposers.push(() => view.unmount());
  await view.setProps({ items: items('a') });
  expect(errors.some(error => error instanceof Error && /Tabs.*unique.*index 1/.test(error.message))).toBe(true);
  expect(document.querySelectorAll('[role=tab][aria-selected=true]').length).toBeLessThanOrEqual(1);
  await view.setProps({ items: [items('a')[0], items('b')[0]] });
  expect(document.querySelectorAll('[role=tab]')).toHaveLength(2);
  expect(document.querySelectorAll('[role=tab][aria-selected=true]')).toHaveLength(1);
});
