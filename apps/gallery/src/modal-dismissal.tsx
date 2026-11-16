import { type ReactNode, useState } from 'react';
import { Checkbox, Modal } from '@acmeui/react';

/** A consumer can cancel a dismissal before the Modal's bubble handler. */
export function ModalDismissalExample({ open, title, onClose, children }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode;
}) {
  const [armed, setArmed] = useState(false);
  const consume = (event: { preventDefault(): void }) => {
    if (!armed) return;
    event.preventDefault(); setArmed(false);
  };
  return <div
    onMouseDownCapture={event => {
      if (event.button === 0 && event.target instanceof Element && event.target.matches('.acme-modal')) consume(event);
    }}
    onClickCapture={event => {
      if (event.target instanceof Element && event.target.closest('button[aria-label="關閉"]')) consume(event);
    }}>
    <Modal open={open} title={title} onClose={onClose}>
      <Checkbox label="攔截一次滑鼠關閉" checked={armed} onChange={event => setArmed(event.target.checked)}/>
      <p role="status">{armed ? '下一次關閉按鈕或主鍵遮罩操作將被取消，保留對話框與草稿。' : '可勾選攔截一次滑鼠關閉；中鍵與右鍵不會關閉遮罩。'}關閉按鈕的鍵盤啟動也透過 click；Escape 仍依備註編輯狀態處理。</p>
      {children}
    </Modal>
  </div>;
}
