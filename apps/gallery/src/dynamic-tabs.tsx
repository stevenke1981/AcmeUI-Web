import { useState } from "react";
import { Button, Tabs } from "@acmeui/react";

export function DynamicTabsExample() {
  const [details, setDetails] = useState(true), [empty, setEmpty] = useState(false), [reverse, setReverse] = useState(false);
  const items = [
    { value: "overview", label: "動態總覽", content: "選取項目不存在時，回到第一個可用分頁。" },
    ...(details ? [{ value: "details", label: "動態詳細", content: "現在移除詳細分頁，可觀察選取回復。" }] : []),
  ];
  return <section className="acme-stack" aria-label="動態分頁示範">
    <h3>動態 Tabs</h3>
    <p>先選取詳細分頁，再移除、清空或重排。清單恢復後仍可用 Tab 與方向鍵操作。</p>
    <div className="acme-cluster">
      <Button variant="outline" aria-pressed={!details} onClick={() => setDetails(value => !value)}>移除／加入詳細分頁</Button>
      <Button variant="outline" aria-pressed={empty} onClick={() => setEmpty(value => !value)}>清空／載入分頁</Button>
      <Button variant="outline" aria-pressed={reverse} onClick={() => setReverse(value => !value)}>反轉分頁順序</Button>
    </div>
    <Tabs label="動態分頁" items={empty ? [] : reverse ? [...items].reverse() : items} />
  </section>;
}
