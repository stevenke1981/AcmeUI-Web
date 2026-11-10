import { useId, useState } from "react";
import { DynamicTabsExample } from "./dynamic-tabs";
import { Button, Checkbox, Field, Input, Pagination, Progress, Select, Switch, Textarea } from "@acmeui/react";

export function BehaviorExamples() {
  const id = useId();
  const [name, setName] = useState(""), [notes, setNotes] = useState(""), [plan, setPlan] = useState("basic");
  const [loading, setLoading] = useState(false), [enabled, setEnabled] = useState(true), [page, setPage] = useState(10), [value, setValue] = useState("42.5");
  return <div className="acme-stack">
    <form className="acme-stack" onSubmit={event => event.preventDefault()}>
      <Field label="姓名" htmlFor={`${id}-name`}><Input id={`${id}-name`} name="name" required value={name} onChange={event => setName(event.target.value)} /></Field>
      <Field label="備註" htmlFor={`${id}-notes`}><Textarea id={`${id}-notes`} name="notes" value={notes} onChange={event => setNotes(event.target.value)} /></Field>
      <Field label="方案" htmlFor={`${id}-plan`}><Select id={`${id}-plan`} name="plan" value={plan} onChange={event => setPlan(event.target.value)}><option value="basic">Basic</option><option value="pro">Pro</option></Select></Field>
      <Checkbox id={`${id}-loading`} label="模擬載入中" checked={loading} onChange={event => setLoading(event.target.checked)} />
      <div className="acme-cluster"><Button loading={loading}>儲存示範</Button><Switch checked={enabled} onCheckedChange={setEnabled} label="啟用通知" /><Switch disabled label="停用的開關" /></div>
      <p>Button 預設不送出表單；載入中時停用並顯示「載入中…」。Switch 支援受控狀態或 defaultChecked。</p>
    </form>
    <Field label="進度值（可輸入 NaN／Infinity）" htmlFor={`${id}-progress`}><Input id={`${id}-progress`} value={value} onChange={event => setValue(event.target.value)} /></Field>
    <Progress value={Number(value)} label="邊界值示範進度" />
    <p>有限值限制在 0–100；非有限值顯示 0。</p>
    <Pagination page={page} totalPages={20} onPageChange={setPage} />
    <p>目前第 {page}／20 頁；最多顯示包含目前頁的七頁；窄螢幕自動換行。</p>
    <DynamicTabsExample />
  </div>;
}
