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

/** Bounded pagination window; invalid/empty totals have no current page. */
export function paginationState(page:number,totalPages:number):{page:number;totalPages:number;pages:number[]}{
  const total=Number.isFinite(totalPages)?Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Math.floor(totalPages))):0;
  const current=total===0?0:Math.min(total,Math.max(1,Number.isFinite(page)?Math.floor(page):1));
  const count=Math.min(total,7),start=Math.max(1,Math.min(current-3,total-count+1));
  return{page:current,totalPages:total,pages:Array.from({length:count},(_,index)=>start+index)};
}
