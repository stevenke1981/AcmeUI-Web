import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, getAllByRole, getByRole } from "@testing-library/dom";
import { enhanceModal, enhanceTabs } from "../src/interactions.mjs";

const cleanups: Array<() => void> = [];
afterEach(() => { cleanups.splice(0).forEach(fn => fn()); document.body.innerHTML = ""; });
function fixture() {
  const html = readFileSync("apps/gallery/static.html", "utf8");
  document.body.innerHTML = html.match(/<body>([\s\S]*)<script type="module">/)![1];
  return document.querySelector<HTMLElement>("[data-acme-tabs]")!;
}
function tabs() {
  const root = fixture();
  cleanups.push(enhanceTabs(root));
  return { root, tabs: getAllByRole(root, "tab") };
}

describe("static progressive Tabs", () => {
  it("keeps all linked sections readable before enhancement and restores markup on cleanup", () => {
    const root = fixture(), original = root.innerHTML;
    expect(getAllByRole(root, "link")).toHaveLength(3);
    expect(root.querySelectorAll("[hidden]")).toHaveLength(0);
    const cleanup = enhanceTabs(root);
    expect(getAllByRole(root, "tabpanel")).toHaveLength(1);
    cleanup(); cleanup();
    expect(root.innerHTML).toBe(original);
    const link = getAllByRole(root, "link")[1];
    expect(fireEvent.click(link)).toBe(true);
    expect(link.hasAttribute("aria-selected")).toBe(false);
    cleanups.push(enhanceTabs(root));
    expect(getAllByRole(root, "tab")).toHaveLength(3);
  });
  it("supports arrows, wrap, Home/End, roving tabindex and click selection", () => {
    const { root, tabs: [a, b, c] } = tabs();
    expect(a.tabIndex).toBe(0); expect(b.tabIndex).toBe(-1);
    a.focus();
    for (const [source, key, target] of [[a, "ArrowRight", b], [b, "End", c], [c, "ArrowRight", a], [a, "ArrowLeft", c], [c, "Home", a]] as const) {
      expect(fireEvent.keyDown(source, { key })).toBe(false);
      expect(document.activeElement).toBe(target);
      expect(target.getAttribute("aria-selected")).toBe("true");
      expect(target.getAttribute("aria-controls")).toBe(getByRole(root, "tabpanel").id);
      expect(getByRole(root, "tabpanel").getAttribute("aria-labelledby")).toBe(target.id);
      expect(target.tabIndex).toBe(0);
    }
    expect(fireEvent.keyDown(a, { key: "ArrowDown" })).toBe(true);
    expect(fireEvent.keyDown(c, { key: " " })).toBe(false);
    expect(c.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(a);
    expect(fireEvent.keyDown(c, { key: "Enter" })).toBe(false);
    fireEvent.click(c);
    expect(c.getAttribute("aria-selected")).toBe("true");
    expect(a.tabIndex).toBe(-1);
  });
  it("is idempotent and rejects invalid panels without partially enhancing", () => {
    const { root } = tabs();
    expect(enhanceTabs(root)).toBe(enhanceTabs(root));
    const broken = fixture(); broken.querySelector("a")!.setAttribute("href", "#missing");
    const original = broken.innerHTML;
    expect(() => enhanceTabs(broken)).toThrow(/panel/i);
    expect(broken.innerHTML).toBe(original);
  });
});

describe("static native Modal delegation (jsdom doubles; native behavior is in the browser gate)", () => {
  function modal() {
    fixture();
    const dialog = document.querySelector("dialog")!, opener = document.querySelector<HTMLButtonElement>("[data-acme-modal-open]")!;
    // jsdom lacks native dialog methods: these spies verify delegation, not the UA focus trap.
    dialog.showModal = vi.fn(() => { dialog.setAttribute("open", ""); dialog.querySelector<HTMLElement>("button")?.focus(); });
    dialog.close = vi.fn(() => { dialog.removeAttribute("open"); dialog.dispatchEvent(new Event("close")); });
    const cleanup = enhanceModal(dialog, [opener]); cleanups.push(cleanup);
    return { dialog, opener, cleanup };
  }
  it("delegates modal opening to showModal and restores focus on native close", () => {
    const { dialog, opener } = modal();
    opener.focus(); opener.click();
    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    expect(dialog.contains(document.activeElement)).toBe(true);
    dialog.querySelector<HTMLButtonElement>("[data-acme-modal-close]")!.click();
    expect(dialog.close).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(opener);
  });
  it("handles the native Escape cancel event and repeated open attempts", () => {
    const { dialog, opener } = modal();
    opener.focus(); opener.click(); opener.click();
    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    const event = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });
  it("cleans up an open modal, restores focus and detaches all listeners", () => {
    const { dialog, opener, cleanup } = modal();
    opener.focus(); opener.click(); cleanup(); cleanup();
    expect(dialog.open).toBe(false); expect(document.activeElement).toBe(opener);
    opener.click(); dialog.dispatchEvent(new Event("cancel"));
    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    expect(dialog.close).toHaveBeenCalledTimes(1);
  });
  it("leaves unsupported browsers on their readable fallback", () => {
    fixture();
    const dialog = document.querySelector("dialog")!, opener = document.querySelector<HTMLButtonElement>("[data-acme-modal-open]")!;
    Object.defineProperty(dialog, "showModal", { value: undefined });
    const cleanup = enhanceModal(dialog, [opener]);
    expect(() => { opener.click(); cleanup(); }).not.toThrow();
    expect(dialog.open).toBe(false);
    expect(document.querySelector("#modal-fallback")).not.toBeNull();
  });
  it("restores focus after a native close event independent of the close button", () => {
    const { dialog, opener } = modal();
    opener.focus(); opener.click();
    dialog.removeAttribute("open"); dialog.dispatchEvent(new Event("close"));
    expect(document.activeElement).toBe(opener);
    opener.click(); expect(dialog.showModal).toHaveBeenCalledTimes(2);
  });
  it("skips a disconnected opener when native close fires", () => {
    const { dialog, opener } = modal();
    opener.focus(); opener.click(); opener.remove();
    const focus = vi.spyOn(opener, "focus");
    dialog.close(); expect(focus).not.toHaveBeenCalled();
    expect(dialog.open).toBe(false);
  });
  it("can reinitialize after cleanup with a different opener", () => {
    const { dialog, opener, cleanup } = modal();
    cleanup();
    const alternate = document.createElement("button"); alternate.textContent = "Alternate opener";
    document.body.append(alternate); cleanups.push(enhanceModal(dialog, [alternate]));
    opener.click(); expect(dialog.open).toBe(false);
    alternate.focus(); alternate.click(); expect(dialog.open).toBe(true);
    dialog.close(); expect(document.activeElement).toBe(alternate);
    expect(dialog.showModal).toHaveBeenCalledTimes(1);
  });
});
