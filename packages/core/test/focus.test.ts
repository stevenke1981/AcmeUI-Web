import { afterEach, describe, expect, it } from "vitest";
import { getFocusable, trapTabKey } from "../src/index";

afterEach(() => { document.body.innerHTML = ""; });

function fixture(content: string) {
  document.body.innerHTML = `<section tabindex="-1">${content}</section>`;
  return document.querySelector<HTMLElement>("section")!;
}

function tab(container: HTMLElement, shiftKey = false) {
  const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey, cancelable: true });
  const moved = trapTabKey(event, container);
  return { moved, prevented: event.defaultPrevented };
}

describe("Modal sequential focus candidates", () => {
  it("excludes negative tabindex, hidden inputs and disabled controls, keeping DOM order", () => {
    const panel = fixture(`<button id="first">First</button><a href="#" tabindex="-1">Skip</a>
      <button tabindex="-2">Skip</button><input type="hidden"><button disabled>Skip</button>
      <fieldset disabled><input><button>Skip</button></fieldset>
      <div tabindex="0" id="custom">Custom</div><a href="#" id="last">Last</a>`);
    expect(getFocusable(panel).map(el => el.id)).toEqual(["first", "custom", "last"]);
  });

  it.each(["hidden", "inert", 'aria-hidden="true"', 'style="display:none"', 'style="visibility:hidden"'])
    ("excludes descendants of %s as well as hidden elements themselves", attributes => {
      const panel = fixture(`<button ${attributes}>Hidden</button>
        <div ${attributes}><a href="#">Hidden descendant</a></div><button id="visible">Visible</button>`);
      expect(getFocusable(panel).map(el => el.id)).toEqual(["visible"]);
    });

  it("uses computed stylesheet visibility", () => {
    const panel = fixture('<style>.off{display:none}</style><div class="off"><button>Hidden</button></div><input id="visible">');
    expect(getFocusable(panel).map(el => el.id)).toEqual(["visible"]);
  });

  it("recovers from the panel, a negative-tabindex descendant and outside focus in both directions", () => {
    const panel = fixture('<button id="first">First</button><p tabindex="-1">Heading</p><button id="last">Last</button>');
    const first = panel.querySelector<HTMLElement>("#first")!;
    const last = panel.querySelector<HTMLElement>("#last")!;
    const outside = document.createElement("button");
    document.body.append(outside);
    for (const origin of [panel, panel.querySelector<HTMLElement>("p")!, outside]) {
      origin.focus();
      expect(tab(panel)).toEqual({ moved: true, prevented: true });
      expect(document.activeElement).toBe(first);
      origin.focus();
      expect(tab(panel, true)).toEqual({ moved: true, prevented: true });
      expect(document.activeElement).toBe(last);
    }
  });

  it("wraps boundaries but leaves ordinary middle navigation to the browser", () => {
    const panel = fixture('<button>First</button><input><button>Last</button>');
    const [first, middle, last] = getFocusable(panel);
    first.focus();
    expect(tab(panel, true).moved).toBe(true);
    expect(document.activeElement).toBe(last);
    expect(tab(panel).moved).toBe(true);
    expect(document.activeElement).toBe(first);
    middle.focus();
    expect(tab(panel)).toEqual({ moved: false, prevented: false });
    expect(tab(panel, true)).toEqual({ moved: false, prevented: false });
  });

  it("focuses the container if no sequential candidates remain and ignores other keys", () => {
    const panel = fixture('<button hidden>Hidden</button>');
    expect(tab(panel)).toEqual({ moved: true, prevented: true });
    expect(document.activeElement).toBe(panel);
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true });
    expect(trapTabKey(event, panel)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });
});

it('collapses checked radio groups by form owner and treats unnamed radios independently', () => {
  const panel = fixture(`<form id="one"><input id="a" type="radio" name="choice"><input id="b" type="radio" name="choice" checked></form>
    <form id="two"><input id="c" type="radio" name="choice" checked></form>
    <input id="d" type="radio" name="choice"><input id="e" type="radio" name="choice" checked>
    <input id="f" type="radio"><input id="g" type="radio" name="">
    <input id="h" type="radio" name="choice" form="one">`);
  expect(getFocusable(panel).map(el => el.id)).toEqual(['b', 'c', 'e', 'f', 'g']);
});
it.each(['hidden', 'disabled', 'tabindex="-1"'])('ignores a %s checked member when choosing a radio fallback', attr => {
  const panel = fixture(`<input id="a" type="radio" name="choice"><input type="radio" name="choice" checked ${attr}><input id="b" type="radio" name="choice">`);
  expect(getFocusable(panel).map(el => el.id)).toEqual(['a']);
  panel.focus(); tab(panel, true); expect(document.activeElement?.id).toBe('b');
});
it('recomputes checked radio boundaries after selection changes without intercepting arrow keys', () => {
  const panel = fixture('<button id="first">First</button><input id="a" type="radio" name="a" checked><input id="b" type="radio" name="a">');
  const a = panel.querySelector<HTMLInputElement>('#a')!, b = panel.querySelector<HTMLInputElement>('#b')!;
  a.focus(); expect(tab(panel).prevented).toBe(true); expect(document.activeElement?.id).toBe('first');
  b.checked = true; b.focus(); expect(tab(panel).prevented).toBe(true); expect(document.activeElement?.id).toBe('first');
  a.focus(); expect(tab(panel)).toEqual({ moved: false, prevented: false });
});
it('wraps an unchecked group from either focused member but preserves middle navigation', () => {
  const panel = fixture('<button id="first">First</button><input id="a" type="radio" name="a"><input id="b" type="radio" name="a">');
  for (const id of ['a', 'b']) {
    panel.querySelector<HTMLElement>(`#${id}`)!.focus(); expect(tab(panel).prevented).toBe(true); expect(document.activeElement?.id).toBe('first');
  }
  panel.querySelector<HTMLElement>('#first')!.focus(); tab(panel, true); expect(document.activeElement?.id).toBe('b');
  panel.querySelector<HTMLElement>('#a')!.focus(); expect(tab(panel, true).prevented).toBe(false);
});
it('includes editing hosts for empty/plaintext/mixed-case values, with nested tabindex opt-in', () => {
  const panel = fixture(`<div id="empty" contenteditable><span contenteditable="true">Nested</span>
    <span id="opt" contenteditable="true" tabindex="0">Opt in</span>
    <div contenteditable="false"><div id="inner" contenteditable="plaintext-only">Inner host</div></div></div>
    <div id="plain" contenteditable="plaintext-only">Plain</div><div id="upper" contenteditable="TRUE">Upper</div>
    <div contenteditable="false">False</div><div contenteditable="invalid">Invalid</div>
    <div contenteditable="true" tabindex="-1">Excluded</div>`);
  expect(getFocusable(panel).map(el => el.id)).toEqual(['empty', 'opt', 'inner', 'plain', 'upper']);
});

it('leaves entry into an interleaved unchecked group to the browser', () => {
  const panel = fixture('<input id="a" type="radio" name="a"><button id="middle">Middle</button><input id="b" type="radio" name="a">');
  panel.querySelector<HTMLElement>('#middle')!.focus();
  expect(tab(panel).prevented).toBe(false); expect(tab(panel, true).prevented).toBe(false);
});
