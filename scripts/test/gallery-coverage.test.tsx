import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { isInaccessible } from '@testing-library/dom';
import * as components from '../../packages/react/src/index';
import { App } from '../../apps/gallery/src/App';

// Keep the public 23-family contract explicit. Imports or metadata alone do not
// count: every family must render in a reachable Gallery state.
const selectors = {
  Button: '.acme-button', Card: '.acme-card', Badge: '.acme-badge', Field: '.acme-field',
  Input: 'input.acme-input', Textarea: 'textarea.acme-textarea', Select: 'select.acme-select',
  Checkbox: '.acme-checkbox input[type="checkbox"]', Switch: '.acme-switch[role="switch"]',
  Alert: '.acme-alert[role="alert"]', Progress: '.acme-progress[role="progressbar"]',
  Avatar: '.acme-avatar', Tabs: '.acme-tabs [role="tablist"]', Modal: '.acme-modal [role="dialog"]',
  DataTable: 'table.acme-table', Breadcrumb: 'nav.acme-breadcrumb', Pagination: 'nav.acme-pagination',
  Navbar: '.acme-navbar', Sidebar: 'aside.acme-sidebar', Hero: '.acme-hero',
  FeatureGrid: '.acme-feature-grid', PricingTable: '.acme-pricing', Footer: 'footer.acme-footer',
};
afterEach(cleanup);
function visibleFamilies(root: ParentNode = document) {
  return Object.entries(selectors).filter(([, selector]) => Array.from(root.querySelectorAll<HTMLElement>(selector))
    .some(node => !node.closest('[inert]') && !isInaccessible(node))).map(([family]) => family);
}

describe('Gallery rendered family coverage', () => {
  it('does not count hidden, aria-hidden, inert or CSS-hidden content as reachable examples', () => {
    const view = render(<main><div hidden><button className="acme-button"/></div><div aria-hidden="true"><span className="acme-badge"/></div><div inert><aside className="acme-sidebar"/></div><div style={{display:'none'}}><div className="acme-card"/></div><footer className="acme-footer"/></main>);
    expect(visibleFamilies(view.container)).toEqual(['Footer']);
  });
  it('tracks every public family while excluding the three documented Card composition helpers', () => {
    const helpers = ['CardHeader', 'CardContent', 'CardFooter'];
    expect(Object.keys(selectors).sort()).toEqual(Object.keys(components).filter(name => !helpers.includes(name)).sort());
  });
  for (const theme of ['light', 'dark']) it(`${theme}: reaches all 23 families through tabs and the Modal opener`, () => {
    render(<App />);
    if (theme === 'dark') fireEvent.click(screen.getByRole('switch', { name: '深色模式' }));
    const seen = new Set<string>();
    const record = () => {
      visibleFamilies().forEach(family => seen.add(family));
    };
    record();
    for (const tab of screen.getAllByRole('tab')) { fireEvent.click(tab); record(); }
    fireEvent.click(screen.getByRole('button', { name: '建立專案' })); record();
    expect(Object.keys(selectors)).toHaveLength(23);
    expect(Object.keys(selectors).filter(family => !seen.has(family)), 'Missing rendered Gallery families').toEqual([]);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
