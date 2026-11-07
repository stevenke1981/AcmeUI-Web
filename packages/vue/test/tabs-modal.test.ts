import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import Tabs from "../src/components/Tabs.vue";
import Modal from "../src/components/Modal.vue";

const mounted: VueWrapper[] = [];
afterEach(() => { mounted.splice(0).forEach(w => w.unmount()); document.body.innerHTML = ""; });
const attach = <T extends VueWrapper>(w: T) => { mounted.push(w); return w; };

const items = [
  { value: "a", label: "Alpha", content: "Panel A" },
  { value: "b", label: "Beta", content: "Panel B" },
  { value: "c", label: "Gamma", content: "Panel C" },
];
const visiblePanel = () => Array.from(document.querySelectorAll<HTMLElement>("[role=tabpanel]")).find(p => p.style.display !== "none");

describe("Vue Tabs keyboard", () => {
  it("moves selection and focus with arrows, wrapping, and Home/End", async () => {
    attach(mount(Tabs, { props: { items }, attachTo: document.body }));
    const [a, b, c] = Array.from(document.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    expect(a.tabIndex).toBe(0);
    expect(b.tabIndex).toBe(-1);
    a.focus();
    a.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await nextTick();
    expect(b.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(b);
    expect(visiblePanel()?.textContent).toBe("Panel B");
    b.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(c);
    c.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(a);
    a.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(c);
    c.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await nextTick();
    expect(a.getAttribute("aria-selected")).toBe("true");
  });

  it("links tabs and panels and still switches on click", async () => {
    attach(mount(Tabs, { props: { items, defaultValue: "b" }, attachTo: document.body }));
    const selected = document.querySelector<HTMLElement>("[role=tab][aria-selected=true]")!;
    expect(selected.textContent).toBe("Beta");
    const panel = document.getElementById(selected.getAttribute("aria-controls")!)!;
    expect(panel.getAttribute("aria-labelledby")).toBe(selected.id);
    Array.from(document.querySelectorAll<HTMLElement>("[role=tab]"))[2].click();
    await nextTick();
    expect(visiblePanel()?.textContent).toBe("Panel C");
  });
});

const Harness = defineComponent({
  setup() {
    const open = ref(false), closes = ref(0);
    return () => h("div", [
      h("button", { id: "opener", onClick: () => { open.value = true; } }, "Open"),
      h(Modal, { open: open.value, title: "Dialog", onClose: () => { closes.value++; open.value = false; } }, () => [
        h("input", { "aria-label": "name" }), h("button", { id: "save" }, "Save"),
      ]),
      h("output", { id: "closes" }, String(closes.value)),
    ]);
  },
});
const flush = async () => { await nextTick(); await nextTick(); };

describe("Vue Modal focus", () => {
  it("focuses inside, closes on Escape and restores focus to the opener", async () => {
    attach(mount(Harness, { attachTo: document.body }));
    const opener = document.getElementById("opener")!;
    opener.focus();
    opener.click();
    await flush();
    const dialog = document.querySelector<HTMLElement>("[role=dialog]")!;
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe("Dialog");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await flush();
    expect(document.getElementById("closes")?.textContent).toBe("1");
    expect(document.querySelector("[role=dialog]")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("traps Tab and Shift+Tab inside the dialog", async () => {
    attach(mount(Harness, { attachTo: document.body }));
    document.getElementById("opener")!.click();
    await flush();
    const close = document.querySelector<HTMLElement>("[aria-label='關閉']")!;
    const save = document.getElementById("save")!;
    expect(document.activeElement).toBe(close);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(save);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(document.activeElement).toBe(close);
  });
});
