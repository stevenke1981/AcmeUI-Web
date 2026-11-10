import { createRoot } from 'react-dom/client';
import { Alert, Avatar, Badge, Button, Card, DataTable, FeatureGrid, Field, Hero, Input, Navbar, PricingTable, Progress } from '../../../packages/react/src/index';
import '../../../packages/styles/src/base.css';
function App() { return <>
  <Navbar brand="Acme" links={[{ label: 'Docs', href: '#content' }]} action={<Button variant="outline">Sign in</Button>} />
  <Hero title="Shared layout" description="Semantic components across frameworks." actions={<Button>Start</Button>} visual={<Card><div className="acme-card__content">Preview</div></Card>} />
  <main id="content" className="acme-container acme-stack">
    <div className="acme-cluster"><Button>Save</Button><Badge>Ready</Badge><Avatar name="Ada Lovelace" /></div>
    <Card><div className="acme-card__content"><Field label="Name"><Input defaultValue="Ada" /></Field></div></Card>
    <Alert title="Notice">Shared content</Alert><Progress value={42} label="Upload" />
    <DataTable caption="Members" columns={[{ key: 'name', label: 'Name' }]} rows={[{ name: 'Ada' }]} />
    <FeatureGrid items={[{ title: 'Fast', description: 'Quick setup' }, { title: 'Shared', description: 'Same tokens' }, { title: 'Open', description: 'Native markup' }]} />
    <PricingTable plans={[{ name: 'Starter', price: '$0', description: 'Personal', features: ['Tokens'] }, { name: 'Team', price: '$10', description: 'Together', features: ['CLI'], featured: true }]} />
  </main>
</>; }
createRoot(document.getElementById('app')!).render(<App />);
