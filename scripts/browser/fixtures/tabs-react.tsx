import { createRoot } from 'react-dom/client';
import { Tabs } from '../../../packages/react/src/index';
import '../../../packages/styles/src/base.css';
createRoot(document.getElementById('app')!).render(<main className="acme-container"><h1>Tabs keyboard</h1><Tabs items={[{ value: 'a', label: 'Alpha', content: 'First' }, { value: 'b', label: 'Beta', content: 'Second' }]}/></main>);
