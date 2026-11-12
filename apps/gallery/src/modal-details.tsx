import { useId } from 'react';
import { Field, Input } from '@acmeui/react';

export function ModalDetailsExample() {
  const id = useId();
  return <details>
    <summary>進階選項</summary>
    <p>展開後可輸入專案代碼；收合時 Tab 會略過內容，草稿仍保留。</p>
    <Field label="專案代碼" htmlFor={`${id}-code`}><Input id={`${id}-code`} defaultValue=""/></Field>
  </details>;
}
