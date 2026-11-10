import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import Tabs from "../src/components/Tabs.vue";
import Modal from "../src/components/Modal.vue";
import Navbar from "../src/components/Navbar.vue";

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
  it("falls back to the first item for an unknown default value", () => {
    attach(mount(Tabs, { props: { items, defaultValue: "missing" }, attachTo: document.body }));
    expect(document.querySelector('[role=tab][aria-selected=true]')?.textContent).toBe("Alpha");
    expect(visiblePanel()?.textContent).toBe("Panel A");
  });

  it("supports an empty-string value", () => {
    attach(mount(Tabs, { props: { items: [...items, { value: "", label: "Empty", content: "Empty panel" }], defaultValue: "" }, attachTo: document.body }));
    expect(document.querySelector('[role=tab][aria-selected=true]')?.textContent).toBe("Empty");
  });

  it("recovers after loading and clearing an initially empty list", async () => {
    const view = attach(mount(Tabs, { props: { items: [], defaultValue: "b" }, attachTo: document.body }));
    expect(document.querySelector('[role=tab]')).toBeNull();
    await view.setProps({ items });
    expect(document.querySelector('[role=tab][aria-selected=true]')?.textContent).toBe("Alpha");
    await view.findAll('[role=tab]')[2].trigger('click');
    await view.setProps({ items: [] });
    expect(document.querySelector('[role=tabpanel]')).toBeNull();
    await view.setProps({ items });
    expect(document.querySelector('[role=tab][aria-selected=true]')?.textContent).toBe("Alpha");
  });

  it("replaces a removed selection and does not resurrect it when reinserted", async () => {
    const view = attach(mount(Tabs, { props: { items, defaultValue: "b" }, attachTo: document.body }));
    await view.setProps({ items: [items[0], items[2]] });
    expect(document.querySelector<HTMLElement>('[role=tab][aria-selected=true]')?.tabIndex).toBe(0);
    expect(visiblePanel()?.textContent).toBe("Panel A");
    await view.setProps({ items, defaultValue: "c" });
    expect(document.querySelector('[role=tab][aria-selected=true]')?.textContent).toBe("Alpha");
  });

  it("preserves selection and keyboard targets after reorder and prepend", async () => {
    const view = attach(mount(Tabs, { props: { items, defaultValue: "b" }, attachTo: document.body }));
    await view.setProps({ items: [{ value: "d", label: "Delta", content: "Panel D" }, items[2], items[1], items[0]] });
    const beta = view.find('[role=tab][aria-selected=true]');
    expect(beta.text()).toBe("Beta");
    (beta.element as HTMLElement).focus();
    await beta.trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement?.textContent).toBe("Alpha");
    await view.findAll('[role=tab]')[3].trigger('keydown', { key: 'Home' });
    expect(document.activeElement?.textContent).toBe("Delta");
  });

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
    attach(mount(Tabs, { props: { items, defaultValue: "b", label: "Example tabs" }, attachTo: document.body }));
    expect(document.querySelector("[role=tablist]")?.getAttribute("aria-label")).toBe("Example tabs");
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
  it("skips hidden and nonsequential content when wrapping from the close button", async () => {
    attach(mount(Modal, {
      props: { open: true, title: "Dialog" }, attachTo: document.body,
      slots: { default: '<button id="visible">Visible action</button><div hidden><button>Hidden action</button></div><button tabindex="-1">Programmatic only</button>' },
    }));
    await flush();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true }));
    expect(document.activeElement).toBe(document.getElementById("visible"));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    const close = document.querySelector<HTMLElement>("[aria-label='關閉']")!;
    expect(document.activeElement).toBe(close);
    document.querySelector<HTMLElement>("[role=dialog]")!.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    expect(document.activeElement).toBe(close);
  });

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

it("Vue Navbar exposes a configurable navigation name", async () => {
  const view = attach(mount(Navbar, { props: { brand: "Acme", links: [], label: "Product navigation" }, attachTo: document.body }));
  expect(document.querySelector("nav")?.getAttribute("aria-label")).toBe("Product navigation");
  await view.setProps({ label: "" });
  expect(document.querySelector("nav")?.getAttribute("aria-label")).toBe("主要導覽");
});
