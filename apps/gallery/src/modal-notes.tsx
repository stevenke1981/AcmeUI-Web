import { useId, useState } from 'react';

export function ModalNotesExample() {
  const help = useId(), [editing, setEditing] = useState(false);
  return <div className="acme-stack">
    <p id={help}>編輯備註時，第一次 Escape 結束編輯並保留內容，第二次關閉對話框。</p>
    <div contentEditable="plaintext-only" suppressContentEditableWarning role="textbox" aria-label="專案備註" aria-multiline="true" aria-describedby={help} tabIndex={0} className="acme-input" data-editing={String(editing)}
      onFocus={() => setEditing(true)} onInput={() => setEditing(true)}
      onKeyDown={event => { if (event.key === 'Escape' && !event.nativeEvent.isComposing && editing) { event.preventDefault(); setEditing(false); } }}>可編輯專案備註</div>
  </div>;
}
