import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Input, Modal } from '../../../packages/react/src/index';
import '../../../packages/styles/src/base.css';
function App() {
  const [open, setOpen] = useState(false), [mounted, setMounted] = useState(true), [closes, setCloses] = useState(0), [clicks, setClicks] = useState(0);
  const [escapeConsumed, setEscapeConsumed] = useState(false);
  return <main className="acme-container"><h1>Modal isolation</h1>
    <Button id="opener" onClick={() => { setMounted(true); setEscapeConsumed(false); setOpen(true); }}>Open</Button>
    <Button id="background" onClick={() => setClicks(value => value + 1)}>Background</Button>
    <output id="clicks">{clicks}</output><output id="closes">{closes}</output>
    <aside id="existing" inert aria-hidden="true">Already inert</aside>
    {mounted && <Modal open={open} title="Modal isolation" onClose={() => { setCloses(value => value + 1); setOpen(false); }}>
      <p>Background controls are isolated while this dialog is open.</p>
      <label className="acme-field">Name<Input data-escape-consumed={String(escapeConsumed)} onKeyDown={event => { if (event.key === 'Escape' && !event.nativeEvent.isComposing && !escapeConsumed) { event.preventDefault(); setEscapeConsumed(true); } }}/></label>
      <Button id="done" onClick={() => { setCloses(value => value + 1); setOpen(false); }}>Done</Button>
      <Button id="unmount" onClick={() => setMounted(false)}>Unmount</Button>
    </Modal>}
  </main>;
}
createRoot(document.getElementById('app')!).render(<App/>);
