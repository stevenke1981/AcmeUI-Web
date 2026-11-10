import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Modal, Tabs } from "../src/index";

afterEach(cleanup);

const items = [
  { value: "a", label: "Alpha", content: "Panel A" },
  { value: "b", label: "Beta", content: "Panel B" },
  { value: "c", label: "Gamma", content: "Panel C" },
];

describe("React Tabs keyboard", () => {
  it("falls back to the first item for an unknown default value", () => {
    render(<Tabs items={items} defaultValue="missing" />);
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("Alpha");
    expect(screen.getByRole("tabpanel").textContent).toBe("Panel A");
  });

  it("supports an empty-string value", () => {
    render(<Tabs items={[...items, { value: "", label: "Empty", content: "Empty panel" }]} defaultValue="" />);
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("Empty");
  });

  it("recovers after loading and clearing an initially empty list", () => {
    const view = render(<Tabs items={[]} defaultValue="b" />);
    expect(screen.queryByRole("tab")).toBeNull();
    view.rerender(<Tabs items={items} defaultValue="b" />);
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("Alpha");
    fireEvent.click(screen.getByRole("tab", { name: "Gamma" }));
    view.rerender(<Tabs items={[]} />);
    expect(screen.queryByRole("tabpanel")).toBeNull();
    view.rerender(<Tabs items={items} />);
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("Alpha");
  });

  it("replaces a removed selection and does not resurrect it when reinserted", () => {
    const view = render(<Tabs items={items} defaultValue="b" />);
    view.rerender(<Tabs items={[items[0], items[2]]} defaultValue="b" />);
    expect(screen.getByRole("tab", { selected: true }).tabIndex).toBe(0);
    expect(screen.getByRole("tabpanel").textContent).toBe("Panel A");
    view.rerender(<Tabs items={items} defaultValue="c" />);
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("Alpha");
  });

  it("preserves selection and keyboard targets after reorder and prepend", () => {
    const view = render(<Tabs items={items} defaultValue="b" />);
    view.rerender(<Tabs items={[{ value: "d", label: "Delta", content: "Panel D" }, items[2], items[1], items[0]]} />);
    const beta = screen.getByRole("tab", { selected: true });
    expect(beta.textContent).toBe("Beta");
    beta.focus();
    fireEvent.keyDown(beta, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Alpha" }));
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Delta" }));
  });

  it("moves selection and focus with arrows, wrapping, and Home/End", () => {
    render(<Tabs items={items} />);
    const [a, b, c] = screen.getAllByRole("tab");
    expect(a.tabIndex).toBe(0);
    expect(b.tabIndex).toBe(-1);
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(b.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(b);
    expect(screen.getByRole("tabpanel").textContent).toBe("Panel B");
    fireEvent.keyDown(b, { key: "End" });
    expect(document.activeElement).toBe(c);
    fireEvent.keyDown(c, { key: "ArrowRight" });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(c);
    fireEvent.keyDown(c, { key: "Home" });
    expect(a.getAttribute("aria-selected")).toBe("true");
  });

  it("links tabs and panels and still switches on click", () => {
    render(<Tabs items={items} defaultValue="b" label="Example tabs" />);
    expect(screen.getByRole("tablist", { name: "Example tabs" })).toBeTruthy();
    const panel = screen.getByRole("tabpanel");
    const selected = screen.getByRole("tab", { selected: true });
    expect(selected.textContent).toBe("Beta");
    expect(selected.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(selected.id);
    fireEvent.click(screen.getByText("Gamma"));
    expect(screen.getByRole("tabpanel").textContent).toBe("Panel C");
  });
});

function Harness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} title="Dialog" onClose={() => { onClose?.(); setOpen(false); }}>
        <input aria-label="name" />
        <button>Save</button>
      </Modal>
    </>
  );
}

describe("React Modal focus", () => {
  it("skips hidden and nonsequential content when wrapping from the close button", () => {
    render(<Modal open title="Dialog" onClose={() => {}}>
      <button>Visible action</button>
      <div hidden><button>Hidden action</button></div>
      <button tabIndex={-1}>Programmatic only</button>
    </Modal>);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText("Visible action"));
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByLabelText("關閉"));
    screen.getByRole("dialog").focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByLabelText("關閉"));
  });

  it("focuses inside, closes on Escape and restores focus to the opener", () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByText("Open");
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(dialog.getAttribute("aria-labelledby")).toBe(screen.getByText("Dialog").id);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("traps Tab and Shift+Tab inside the dialog", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("Open"));
    const close = screen.getByLabelText("關閉");
    const save = screen.getByText("Save");
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(save);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });
});
