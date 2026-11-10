import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { fireEvent, getAllByRole, getByLabelText, getByRole } from "@testing-library/dom";
import { createElement, useState, type ComponentType } from "react";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref, type Component } from "vue";
import * as ReactUI from "../../packages/react/src/index";
import * as VueUI from "../../packages/vue/src/index";

const wrappers: VueWrapper[] = [];
afterEach(() => { cleanup(); wrappers.splice(0).forEach(w => w.unmount()); document.body.innerHTML = ""; });
type Kind = "Button" | "Switch" | "Progress" | "Pagination";
function control(framework: string, kind: Kind, props: Record<string, unknown>, text?: string) {
  if (framework === "React") {
    const component = ReactUI[kind] as unknown as ComponentType<Record<string, unknown>>;
    const view = render(createElement(component, props, text));
    return { root: view.container, update: async (next: Record<string, unknown>) => { view.rerender(createElement(component, { ...props, ...next }, text)); } };
  }
  const view = mount(VueUI[kind] as Component, { props, slots: text ? { default: text } : {}, attachTo: document.body });
  wrappers.push(view);
  return { root: view.element as HTMLElement, update: async (next: Record<string, unknown>) => { await view.setProps(next); } };
}
const activate = (node: HTMLElement) => { act(() => node.click()); };
const tick = async () => { await nextTick(); };

for (const framework of ["React", "Vue"]) describe(`${framework} behavior contract`, () => {
  it.each([[-20, 0], [0, 0], [42.5, 42.5], [100, 100], [120, 100], [NaN, 0], [Infinity, 0], [-Infinity, 0]])("normalizes Progress %s to %s", (value, expected) => {
    const { root } = control(framework, "Progress", { value, label: "Upload" });
    const progress = getByRole(root.parentElement!, "progressbar", { name: "Upload" });
    expect(progress.getAttribute("aria-valuenow")).toBe(String(expected));
    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
    expect((progress.firstElementChild as HTMLElement).style.width).toBe(`${expected}%`);
  });
  it("replaces slotted Button content while loading and disables activation", async () => {
    const clicked = vi.fn();
    const { root, update } = control(framework, "Button", { loading: true, onClick: clicked }, "Save");
    const button = getByRole(root.parentElement!, "button", { name: "載入中…" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true); expect(button.getAttribute("aria-busy")).toBe("true");
    activate(button); expect(clicked).not.toHaveBeenCalled();
    await update({ loading: false });
    expect(button.textContent).toBe("Save"); expect(button.disabled).toBe(false);
    activate(button); expect(clicked).toHaveBeenCalledTimes(1);
    await update({ disabled: true }); activate(button); expect(clicked).toHaveBeenCalledTimes(1);
  });
  it("defaults Button to type=button and honors explicit type=submit", async () => {
    const { root, update } = control(framework, "Button", {}, "Action");
    const button = getByRole(root.parentElement!, "button") as HTMLButtonElement;
    const form = document.createElement("form"), submitted = vi.fn((event: Event) => event.preventDefault());
    const parent = root.parentElement!, sibling = root.nextSibling;
    document.body.append(form); form.append(root); form.addEventListener("submit", submitted);
    try {
      activate(button); expect(submitted).not.toHaveBeenCalled(); expect(button.type).toBe("button");
      await update({ type: "submit" }); activate(button); expect(submitted).toHaveBeenCalledTimes(1);
    } finally { parent.insertBefore(root, sibling); form.remove(); }
  });
  it("toggles an uncontrolled Switch and supports disabled native attributes", async () => {
    const changed = vi.fn();
    const { root, update } = control(framework, "Switch", { defaultChecked: true, label: "Notifications", id: "notifications", name: "notifications", [framework === "React" ? "onCheckedChange" : "onUpdate:modelValue"]: changed });
    const button = getByRole(root.parentElement!, "switch", { name: "Notifications" }) as HTMLButtonElement;
    expect(button.id).toBe("notifications"); expect(button.name).toBe("notifications");
    expect(button.type).toBe("button"); expect(button.getAttribute("aria-checked")).toBe("true");
    activate(button); await tick();
    expect(changed).toHaveBeenLastCalledWith(false);
    expect(button.getAttribute("aria-checked")).toBe("false"); expect(button.dataset.checked).toBe("false");
    await update({ disabled: true }); activate(button); await tick(); expect(changed).toHaveBeenCalledTimes(1);
  });
  it("keeps a controlled Switch on the supplied state until the parent updates it", async () => {
    const changed = vi.fn(), stateKey = framework === "React" ? "checked" : "modelValue";
    const { root, update } = control(framework, "Switch", { [stateKey]: false, [framework === "React" ? "onCheckedChange" : "onUpdate:modelValue"]: changed });
    const button = getByRole(root.parentElement!, "switch");
    expect(button.getAttribute("aria-checked")).toBe("false");
    activate(button); await tick(); expect(changed).toHaveBeenLastCalledWith(true);
    expect(button.getAttribute("aria-checked")).toBe("false");
    await update({ [stateKey]: true }); expect(button.getAttribute("aria-checked")).toBe("true");
    activate(button); await tick(); expect(changed).toHaveBeenLastCalledWith(false);
  });
  it("shows the current page after page 7 and emits bounded navigation", async () => {
    const changed = vi.fn();
    const { root, update } = control(framework, "Pagination", { page: 10, totalPages: 20, [framework === "React" ? "onPageChange" : "onChange"]: changed });
    const nav = getByRole(root.parentElement!, "navigation", { name: "分頁" });
    expect(getByRole(nav, "button", { name: "10", exact: true }).getAttribute("aria-current")).toBe("page");
    expect(getAllByRole(nav, "button").map(b => (b as HTMLButtonElement).type)).toEqual(Array(9).fill("button"));
    activate(getByRole(nav, "button", { name: "上一頁" })); expect(changed).toHaveBeenLastCalledWith(9);
    activate(getByRole(nav, "button", { name: "下一頁" })); expect(changed).toHaveBeenLastCalledWith(11);
    activate(getByRole(nav, "button", { name: "12", exact: true })); expect(changed).toHaveBeenLastCalledWith(12);
    await update({ page: 20 });
    expect((getByRole(nav, "button", { name: "下一頁" }) as HTMLButtonElement).disabled).toBe(true);
    expect(getByRole(nav, "button", { name: "20", exact: true }).getAttribute("aria-current")).toBe("page");
    await update({ page: -3, totalPages: 3.9 });
    expect((getByRole(nav, "button", { name: "上一頁" }) as HTMLButtonElement).disabled).toBe(true);
    expect(getByRole(nav, "button", { name: "1", exact: true }).getAttribute("aria-current")).toBe("page");
    await update({ page: NaN, totalPages: Infinity });
    expect(getAllByRole(nav, "button")).toHaveLength(2);
    expect(getAllByRole(nav, "button").every(b => (b as HTMLButtonElement).disabled)).toBe(true);
  });
  it("preserves form labels, model updates and native input attributes", async () => {
    if (framework === "React") render(<ReactForm />);
    else wrappers.push(mount(VueForm, { attachTo: document.body }));
    const name = getByLabelText(document.body, "Name") as HTMLInputElement;
    expect(name.id).toBe("name"); expect(name.name).toBe("name"); expect(name.required).toBe(true);
    fireEvent.input(name, { target: { value: "Ada" } });
    fireEvent.input(getByLabelText(document.body, "Notes"), { target: { value: "Hello" } });
    fireEvent.change(getByLabelText(document.body, "Plan"), { target: { value: "pro" } });
    activate(getByLabelText(document.body, "Accept")); await tick();
    expect(document.querySelector("output")!.textContent).toBe("Ada/Hello/pro/true");
    const checkbox = getByLabelText(document.body, "Accept") as HTMLInputElement;
    expect(checkbox.id).toBe("accept"); expect(checkbox.name).toBe("accept"); expect(checkbox.required).toBe(true);
    const disabled = getByLabelText(document.body, "Disabled") as HTMLInputElement;
    expect(disabled.disabled).toBe(true); activate(disabled); expect(disabled.checked).toBe(false);
    expect((getByLabelText(document.body, "Read only") as HTMLInputElement).readOnly).toBe(true);
  });
});

function ReactForm() {
  const [name, setName] = useState(""), [notes, setNotes] = useState(""), [plan, setPlan] = useState("basic"), [accepted, setAccepted] = useState(false);
  return <form><ReactUI.Field label="Name" htmlFor="name"><ReactUI.Input id="name" name="name" required value={name} onChange={e => setName(e.target.value)} /></ReactUI.Field><ReactUI.Field label="Notes"><ReactUI.Textarea value={notes} onChange={e => setNotes(e.target.value)} /></ReactUI.Field><ReactUI.Field label="Plan"><ReactUI.Select value={plan} onChange={e => setPlan(e.target.value)}><option value="basic">Basic</option><option value="pro">Pro</option></ReactUI.Select></ReactUI.Field><ReactUI.Checkbox id="accept" name="accept" required label="Accept" checked={accepted} onChange={e => setAccepted(e.target.checked)} /><ReactUI.Checkbox label="Disabled" disabled /><ReactUI.Field label="Read only"><ReactUI.Input readOnly value="Locked" /></ReactUI.Field><output>{`${name}/${notes}/${plan}/${accepted}`}</output></form>;
}
const VueForm = defineComponent({ setup() {
  const name = ref(""), notes = ref(""), plan = ref("basic"), accepted = ref(false);
  return () => h("form", [
    h(VueUI.Field, { label: "Name", htmlFor: "name" }, () => h(VueUI.Input, { id: "name", name: "name", required: true, modelValue: name.value, "onUpdate:modelValue": v => { name.value = v; } })),
    h(VueUI.Field, { label: "Notes" }, () => h(VueUI.Textarea, { modelValue: notes.value, "onUpdate:modelValue": v => { notes.value = v; } })),
    h(VueUI.Field, { label: "Plan" }, () => h(VueUI.Select, { options: [{ label: "Basic", value: "basic" }, { label: "Pro", value: "pro" }], modelValue: plan.value, "onUpdate:modelValue": v => { plan.value = v; } })),
    h(VueUI.Checkbox, { id: "accept", name: "accept", required: true, label: "Accept", modelValue: accepted.value, "onUpdate:modelValue": v => { accepted.value = v; } }),
    h(VueUI.Checkbox, { label: "Disabled", disabled: true }),
    h(VueUI.Field, { label: "Read only" }, () => h(VueUI.Input, { readonly: true, modelValue: "Locked" })),
    h("output", `${name.value}/${notes.value}/${plan.value}/${accepted.value}`),
  ]);
} });
