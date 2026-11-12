import { afterEach, expect, it } from 'vitest';
import { getFocusable, trapTabKey } from '../src/index';
afterEach(() => { document.body.innerHTML = ''; });
function fixture(content: string) {
  document.body.innerHTML = `<section tabindex="-1"><button id="first">First</button>${content}</section>`;
  return document.querySelector<HTMLElement>('section')!;
}
it.each(['hidden', 'collapse'])('includes visible overrides beneath visibility:%s and wraps both boundaries', visibility => {
  const panel = fixture(`<div style="visibility:${visibility}"><div><button id="last" style="visibility:visible">Last</button></div></div>`);
  const first = panel.querySelector<HTMLElement>('#first')!, last = panel.querySelector<HTMLElement>('#last')!;
  expect(getComputedStyle(last).visibility).toBe('visible');
  expect(getFocusable(panel).map(node => node.id)).toEqual(['first', 'last']);
  first.focus();
  for (const [shiftKey, target] of [[true, last], [false, first]] as const) {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
    expect(trapTabKey(event, panel)).toBe(true); expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(target);
  }
});
it.each(['hidden', 'collapse'])('excludes a control with its own visibility:%s', visibility => {
  const panel = fixture(`<button style="visibility:${visibility}">Hidden</button>`);
  expect(getFocusable(panel).map(node => node.id)).toEqual(['first']);
});
it.each(['hidden', 'collapse'])('inherits visibility:%s without an override in jsdom', visibility => {
  const panel = fixture(`<div style="visibility:${visibility}"><div><button id="inherited">Hidden</button></div></div>`);
  expect(getComputedStyle(panel.querySelector('#inherited')!).visibility).toBe(visibility);
  expect(getFocusable(panel).map(node => node.id)).toEqual(['first']);
});
it.each(['style="display:none"', 'hidden', 'inert', 'aria-hidden="true"'])('retains ancestor exclusion for %s despite a visible child', attributes => {
  const panel = fixture(`<div ${attributes}><button style="visibility:visible">Excluded</button></div>`);
  expect(getFocusable(panel).map(node => node.id)).toEqual(['first']);
});
