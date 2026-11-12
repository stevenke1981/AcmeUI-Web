import { useId, useState } from "react";
import { Button, Field, Input, Tabs } from "@acmeui/react";

export function DynamicTabsExample() {
  const id = useId();
  const [paused, setPaused] = useState(false);
  const [details, setDetails] = useState(true), [empty, setEmpty] = useState(false), [reverse, setReverse] = useState(false);
  const items = [
    { value: "overview", label: "動態總覽", content: "選取項目不存在時，回到第一個可用分頁。" },
    ...(details ? [{ value: "details", label: "動態詳細", content: <Field label="分頁草稿" htmlFor={`${id}-draft`}><Input id={`${id}-draft`} defaultValue=""/></Field> }] : []),
  ];
  return <section className="acme-stack" aria-label="動態分頁示範">
    <h3>動態 Tabs</h3>
    <p>每個分頁 value 必須唯一（空字串也可作為值）。先選取詳細分頁並輸入草稿；切換與重排會保留內容。移除或清空會卸載內容，清單恢復後仍可用 Tab 與方向鍵操作。</p>
    <div className="acme-cluster">
      <Button variant="outline" aria-pressed={!details} onClick={() => setDetails(value => !value)}>移除／加入詳細分頁</Button>
      <Button variant="outline" aria-pressed={empty} onClick={() => setEmpty(value => !value)}>清空／載入分頁</Button>
      <Button variant="outline" aria-pressed={reverse} onClick={() => setReverse(value => !value)}>反轉分頁順序</Button>
    </div>
    <label className="acme-checkbox" htmlFor={`${id}-paused`}><input id={`${id}-paused`} type="checkbox" checked={paused} onChange={event => setPaused(event.target.checked)}/><span>暫停分頁快捷鍵</span></label>
    <p>勾選後先行取消方向鍵、Home 與 End；分頁保留目前選取及焦點。組字中的按鍵由輸入法處理。</p>
    <div onKeyDownCapture={event => { if (paused && !event.nativeEvent.isComposing && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) event.preventDefault(); }}>
      <Tabs label="動態分頁" items={empty ? [] : reverse ? [...items].reverse() : items} />
    </div>
  </section>;
}
