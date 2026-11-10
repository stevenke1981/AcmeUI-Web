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
