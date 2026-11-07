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

/** Focusable descendants of a container, in DOM order. */
export function getFocusable(container:HTMLElement):HTMLElement[]{
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(el=>!el.hasAttribute("disabled")&&el.getAttribute("aria-hidden")!=="true");
}

/** Keeps Tab / Shift+Tab inside a container. Returns true when focus was moved. */
export function trapTabKey(event:{key:string;shiftKey:boolean;preventDefault:()=>void},container:HTMLElement):boolean{
  if(event.key!=="Tab")return false;
  const items=getFocusable(container);
  if(items.length===0){event.preventDefault();container.focus();return true}
  const first=items[0]!,last=items[items.length-1]!,active=container.ownerDocument.activeElement;
  const inside=active instanceof HTMLElement&&container.contains(active);
  if(event.shiftKey&&(active===first||!inside)){event.preventDefault();last.focus();return true}
  if(!event.shiftKey&&(active===last||!inside)){event.preventDefault();first.focus();return true}
  return false;
}
