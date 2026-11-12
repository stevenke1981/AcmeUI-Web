import { afterEach, expect, it } from 'vitest';
import { activateModal, getFocusable, trapTabKey } from '../src/index';
afterEach(() => { document.body.innerHTML = ''; });
function fixture(markup: string) { document.body.innerHTML = `<section tabindex="-1">${markup}</section>`; return document.querySelector<HTMLElement>('section')!; }
const ids = (panel: HTMLElement) => getFocusable(panel).map(node => node.id);
for (const open of [false, true]) it(`includes the first explicit summary of ${open ? 'open' : 'closed'} details`, () => {
  const panel = fixture(`<details ${open ? 'open' : ''}><summary id="summary">More</summary><input id="draft"></details><button id="last">Last</button>`);
  expect(ids(panel)).toEqual(open ? ['summary', 'draft', 'last'] : ['summary', 'last']);
});
it('keeps interactive content in the first summary but excludes the other closed subtree', () => {
  const panel = fixture('<details><summary id="summary">More <button id="action">Action</button></summary><a href="#" id="link">Hidden</a><div tabindex="0">Hidden</div></details>');
  expect(ids(panel)).toEqual(['summary', 'action']);
});
it('handles nested details and recomputes candidates after both levels change', () => {
  const panel = fixture('<details id="outer"><summary id="a">Outer</summary><input id="b"><details id="inner"><summary id="c">Inner</summary><input id="d"></details></details>');
  const [outer, inner] = panel.querySelectorAll('details');
  expect(ids(panel)).toEqual(['a']); outer.open = true; expect(ids(panel)).toEqual(['a', 'b', 'c']);
  inner.open = true; expect(ids(panel)).toEqual(['a', 'b', 'c', 'd']);
  outer.open = false; expect(ids(panel)).toEqual(['a']);
  outer.open = true; inner.open = false; expect(ids(panel)).toEqual(['a', 'b', 'c']);
});
it('requires explicit tabindex for secondary and unrelated summary elements', () => {
  const panel = fixture('<summary>Unrelated</summary><summary tabindex="0" id="opt">Opt in</summary><details open><summary id="first">First</summary><summary>Secondary</summary><summary tabindex="0" id="second-opt">Opt in</summary></details>');
  expect(ids(panel)).toEqual(['opt', 'first', 'second-opt']); panel.querySelector('details')!.open = false; expect(ids(panel)).toEqual(['opt', 'first']);
});
it('retains hidden/inert/disabled/negative-tabindex filtering around summaries', () => {
  const panel = fixture('<details hidden><summary>Hidden</summary></details><details inert><summary>Inert</summary></details><details open><summary tabindex="-1">Skip</summary><input disabled><input id="visible"></details><details style="display:none"><summary>CSS hidden</summary></details>');
  expect(ids(panel)).toEqual(['visible']);
});
it('allows explicit tabindex on closed details itself without exposing its body', () => {
  const panel = fixture('<details id="details" tabindex="0"><summary id="summary">More</summary><input></details>');
  expect(ids(panel)).toEqual(['details', 'summary']);
});
it('recomputes forward/reverse boundaries as details opens and closes', () => {
  const panel = fixture('<button id="first">First</button><details><summary id="summary">More</summary><input id="draft"></details>');
  const details = panel.querySelector('details')!, first = panel.querySelector<HTMLElement>('#first')!, summary = panel.querySelector<HTMLElement>('summary')!, draft = panel.querySelector('input')!;
  const tab = (shiftKey: boolean) => { const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true }); expect(trapTabKey(event, panel)).toBe(true); expect(event.defaultPrevented).toBe(true); };
  first.focus(); tab(true); expect(document.activeElement).toBe(summary); tab(false); expect(document.activeElement).toBe(first);
  details.open = true; first.focus(); tab(true); expect(document.activeElement).toBe(draft); tab(false); expect(document.activeElement).toBe(first);
  details.open = false; first.focus(); tab(true); expect(document.activeElement).toBe(summary);
});
it('initial modal focus can enter a summary instead of a hidden details control', () => {
  const panel = fixture('<details><summary id="summary">More</summary><input></details>');
  const release = activateModal(panel, () => {});
  try { expect(document.activeElement?.id).toBe('summary'); } finally { release(); }
});
