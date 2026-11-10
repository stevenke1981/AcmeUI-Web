// Optional, dependency-free browser enhancement. Importing has no side effects.
const tabsInstances = new WeakMap();
const modalInstances = new WeakMap();

/** Enhance link-based horizontal tabs. Returns an idempotent markup-restoring cleanup. */
export function enhanceTabs(root) {
  if (tabsInstances.has(root)) return tabsInstances.get(root);
  const list = root.querySelector("[data-acme-tablist]");
  const tabs = Array.from(list?.querySelectorAll("[data-acme-tab]") ?? []);
  const panels = tabs.map(tab => {
    const href = tab.getAttribute("href");
    const panel = href?.startsWith("#") ? root.ownerDocument.getElementById(href.slice(1)) : null;
    if (!tab.id || !panel || !root.contains(panel)) throw new Error("Static Tabs require unique tab ids and local panel links");
    return panel;
  });
  if (!list || !tabs.length || new Set(panels).size !== tabs.length) throw new Error("Static Tabs require a tablist and distinct panels");
  const snapshots = [list, ...tabs, ...panels].map(node => [node, Array.from(node.attributes, attr => [attr.name, attr.value])]);
  const select = index => {
    tabs.forEach((tab, n) => {
      tab.setAttribute("aria-selected", String(n === index));
      tab.tabIndex = n === index ? 0 : -1;
      panels[n].hidden = n !== index;
    });
  };
  list.setAttribute("role", "tablist");
  list.setAttribute("aria-orientation", "horizontal");
  tabs.forEach((tab, n) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[n].id);
    panels[n].setAttribute("role", "tabpanel");
    panels[n].setAttribute("aria-labelledby", tab.id);
    panels[n].tabIndex = 0;
  });
  select(Math.max(0, tabs.findIndex(tab => tab.getAttribute("aria-selected") === "true")));
  const click = event => {
    const index = tabs.findIndex(tab => tab.contains(event.target));
    if (index < 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault(); select(index);
  };
  const keydown = event => {
    const current = tabs.indexOf(event.target);
    if (current < 0) return;
    const next = { ArrowRight: (current + 1) % tabs.length, ArrowLeft: (current - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault(); select(next); tabs[next].focus();
  };
  list.addEventListener("click", click); list.addEventListener("keydown", keydown);
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    list.removeEventListener("click", click); list.removeEventListener("keydown", keydown);
    snapshots.forEach(([node, attributes]) => {
      Array.from(node.attributes).forEach(attr => node.removeAttribute(attr.name));
      attributes.forEach(([name, value]) => node.setAttribute(name, value));
    });
    tabsInstances.delete(root);
  };
  tabsInstances.set(root, cleanup);
  return cleanup;
}

/** Native dialog owns modality and Tab handling. Unsupported browsers retain fallback content. */
export function enhanceModal(dialog, openers = []) {
  if (modalInstances.has(dialog)) return modalInstances.get(dialog);
  if (typeof dialog.showModal !== "function" || typeof dialog.close !== "function") return () => {};
  let opener = null, disposed = false;
  const restore = () => {
    if (opener?.isConnected) opener.focus();
    opener = null;
  };
  const open = event => {
    if (dialog.open) return;
    opener = event.currentTarget;
    dialog.showModal();
  };
  const close = () => { if (dialog.open) dialog.close(); };
  const cancel = event => { event.preventDefault(); close(); };
  const click = event => { if (event.target.closest("[data-acme-modal-close]")) close(); };
  const triggers = Array.from(openers);
  triggers.forEach(node => node.addEventListener("click", open));
  dialog.addEventListener("click", click); dialog.addEventListener("cancel", cancel); dialog.addEventListener("close", restore);
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    close(); restore();
    triggers.forEach(node => node.removeEventListener("click", open));
    dialog.removeEventListener("click", click); dialog.removeEventListener("cancel", cancel); dialog.removeEventListener("close", restore);
    modalInstances.delete(dialog);
  };
  modalInstances.set(dialog, cleanup);
  return cleanup;
}
