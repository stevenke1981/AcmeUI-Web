export type AcmeVariant="primary"|"secondary"|"outline"|"ghost";export type AcmeTone="info"|"success"|"warning"|"danger";export const cx=(...v:Array<string|false|null|undefined>)=>v.filter(Boolean).join(" ");export const clampPercent=(v:number)=>Math.max(0,Math.min(100,Number.isFinite(v)?v:0));export const initials=(v:string)=>v.trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()??"").join("");

/** WAI-ARIA Tabs keyboard model: returns the tab index a key should move to, or null if the key is not handled. */
export function tabKeyTarget(key:string,current:number,count:number):number|null{
  if(count<=0)return null;
  switch(key){
    case"ArrowRight":return(current+1)%count;
    case"ArrowLeft":return(current-1+count)%count;
    case"Home":return 0;
    case"End":return count-1;
    default:return null;
  }
}

export const focusableSelector=[
  "a[href]","area[href]","button:not([disabled])","input:not([disabled]):not([type=hidden])",
  "select:not([disabled])","textarea:not([disabled])","iframe","[contenteditable=true]","[tabindex]:not([tabindex='-1'])",
].join(",");

/** Visible sequential-focus descendants, in DOM order (use tabindex 0 / -1 in dialogs). */
export function getFocusable(container:HTMLElement):HTMLElement[]{
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(el=>{
    if(el.matches(":disabled")||el.hasAttribute("disabled")||(el.hasAttribute("tabindex")&&el.tabIndex<0))return false;
    const view=el.ownerDocument.defaultView;
    for(let node:HTMLElement|null=el;node;node=node.parentElement){
      if(node.hidden||node.hasAttribute("inert")||node.getAttribute("aria-hidden")==="true")return false;
      const style=view?.getComputedStyle(node);
      if(style?.display==="none"||style?.visibility==="hidden"||style?.visibility==="collapse")return false;
    }
    return true;
  });
}

/** Keeps Tab / Shift+Tab inside a container. Returns true when focus was moved. */
export function trapTabKey(event:{key:string;shiftKey:boolean;preventDefault:()=>void},container:HTMLElement):boolean{
  if(event.key!=="Tab")return false;
  const items=getFocusable(container);
  if(items.length===0){event.preventDefault();container.focus();return true}
  const first=items[0]!,last=items[items.length-1]!,active=container.ownerDocument.activeElement;
  const sequential=items.some(item=>item===active);
  if(event.shiftKey&&(active===first||!sequential)){event.preventDefault();last.focus();return true}
  if(!event.shiftKey&&(active===last||!sequential)){event.preventDefault();first.focus();return true}
  return false;
}

const activeModals = new WeakMap<Document, HTMLElement>();

/** One open light-DOM modal per document. Caller owns rendering and backdrop dismissal. */
export function activateModal(panel: HTMLElement, onClose: () => void): () => void {
  const doc = panel.ownerDocument, view = doc.defaultView;
  if (!view || !doc.body.contains(panel)) throw new Error('Modal requires a connected light-DOM panel');
  if (activeModals.has(doc)) throw new Error('Only one open Modal per document is supported; nested/overlapping Modals are unsupported');
  activeModals.set(doc, panel);
  const opener = doc.activeElement as HTMLElement | null;
  const isolated = new Map<Element, string | null>();
  const restore = (node: Element, value: string | null) => {
    if (value === null) node.removeAttribute('inert'); else node.setAttribute('inert', value);
  };
  const isolate = () => {
    const background = new Set<Element>();
    for (let branch: Element = panel; branch !== doc.body && branch.parentElement; branch = branch.parentElement) {
      for (const sibling of branch.parentElement.children) if (sibling !== branch) background.add(sibling);
    }
    for (const [node, value] of isolated) if (!background.has(node)) { restore(node, value); isolated.delete(node); }
    for (const node of background) if (!isolated.has(node)) {
      isolated.set(node, node.getAttribute('inert')); if (!node.hasAttribute('inert')) node.setAttribute('inert', '');
    }
  };
  const focusInside = () => (getFocusable(panel)[0] ?? panel).focus();
  const onFocus = (event: FocusEvent) => { if (!panel.contains(event.target as Node)) focusInside(); };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); } else trapTabKey(event, panel);
  };
  isolate();
  const observer = new view.MutationObserver(isolate);
  observer.observe(doc.body, { childList: true, subtree: true });
  doc.addEventListener('focusin', onFocus, true); doc.addEventListener('keydown', onKey);
  focusInside();
  let disposed = false;
  return () => {
    if (disposed) return; disposed = true;
    observer.disconnect(); doc.removeEventListener('focusin', onFocus, true); doc.removeEventListener('keydown', onKey);
    for (const [node, value] of isolated) restore(node, value);
    isolated.clear(); activeModals.delete(doc);
    if (opener?.isConnected) opener.focus?.();
  };
}

/** Bounded pagination window; invalid/empty totals have no current page. */
export function paginationState(page:number,totalPages:number):{page:number;totalPages:number;pages:number[]}{
  const total=Number.isFinite(totalPages)?Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Math.floor(totalPages))):0;
  const current=total===0?0:Math.min(total,Math.max(1,Number.isFinite(page)?Math.floor(page):1));
  const count=Math.min(total,7),start=Math.max(1,Math.min(current-3,total-count+1));
  return{page:current,totalPages:total,pages:Array.from({length:count},(_,index)=>start+index)};
}
