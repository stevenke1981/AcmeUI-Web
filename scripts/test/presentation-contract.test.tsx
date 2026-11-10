import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { getAllByRole, getByRole, within } from '@testing-library/dom';
import { createElement, type ComponentType } from 'react';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, type Component } from 'vue';
import * as ReactUI from '../../packages/react/src/index';
import * as VueUI from '../../packages/vue/src/index';

const wrappers: VueWrapper[] = [];
afterEach(() => { cleanup(); wrappers.splice(0).forEach(w => w.unmount()); document.body.innerHTML = ''; });
type Kind = 'Card' | 'Badge' | 'Alert' | 'Avatar' | 'DataTable' | 'Breadcrumb' | 'Navbar' | 'Sidebar' | 'Hero' | 'FeatureGrid' | 'PricingTable' | 'Footer';
for (const framework of ['React', 'Vue']) describe(`${framework} presentation contract`, () => {
  function show(kind: Kind, props: Record<string, unknown> = {}, content?: string) {
    if (framework === 'React') render(createElement(ReactUI[kind] as unknown as ComponentType<Record<string, unknown>>, props, content));
    else wrappers.push(mount(VueUI[kind] as Component, { props, slots: content ? { default: () => content } : {}, attachTo: document.body }));
    return document.body;
  }
  it.each(['Card', 'Badge'] as const)('%s preserves content, native attributes, events and class merging', kind => {
    let clicks = 0;
    show(kind, { id: 'sample', [framework === 'React' ? 'className' : 'class']: 'custom', title: 'Details', onClick: () => clicks++ }, 'Slotted content');
    const node = document.getElementById('sample')!;
    expect(node.tagName).toBe(kind === 'Card' ? 'SECTION' : 'SPAN');
    expect(node.classList.contains('custom')).toBe(true);
    expect(node.classList.contains(`acme-${kind.toLowerCase()}`)).toBe(true);
    expect(node.title).toBe('Details'); expect(node.textContent).toBe('Slotted content');
    node.click(); expect(clicks).toBe(1);
  });
  it.each(['info', 'success', 'warning', 'danger'])('Alert exposes the %s tone and content', tone => {
    const root = show('Alert', { title: 'Notice', tone }, 'Read details');
    const alert = getByRole(root, 'alert');
    expect(alert.querySelector('strong')?.textContent).toBe('Notice');
    expect(alert.textContent).toContain('Read details');
    expect(alert.classList.contains(`acme-alert--${tone}`)).toBe(tone !== 'info');
  });
  it('Avatar exposes a name for initials and handles whitespace', () => {
    show('Avatar', { name: '  Ada   Lovelace Byron  ' });
    expect(getByRole(document.body, 'img', { name: 'Ada Lovelace Byron' }).textContent).toBe('AL');
  });
  it('Avatar image keeps source and alternative text', () => {
    show('Avatar', { name: 'Ada', src: '/ada.png' });
    expect(getByRole(document.body, 'img', { name: 'Ada' }).getAttribute('src')).toBe('/ada.png');
  });
  it('DataTable exposes caption, column headers, rows and empty cells', () => {
    show('DataTable', { caption: 'Members', columns: [{ key: 'name', label: 'Name' }, { key: 'count', label: 'Count' }], rows: [{ name: 'Ada', count: 0 }, { name: 'Lin', count: null }] });
    const table = getByRole(document.body, 'table', { name: 'Members' });
    expect(getAllByRole(table, 'columnheader').map(n => n.textContent)).toEqual(['Name', 'Count']);
    expect(getAllByRole(table, 'cell').map(n => n.textContent)).toEqual(['Ada', '0', 'Lin', '']);
    expect(getAllByRole(table, 'columnheader').every(n => n.getAttribute('scope') === 'col')).toBe(true);
  });
  it('DataTable custom cells receive the value and row through framework APIs', () => {
    const rows = [{ name: 'Ada', count: 2 }];
    if (framework === 'React') render(<ReactUI.DataTable rows={rows} columns={[{ key: 'count', label: 'Count', render: (value, row) => <a href={`/members/${row.name}`}>{String(value)} seats</a> }]} />);
    else wrappers.push(mount(VueUI.DataTable, { props: { rows, columns: [{ key: 'count', label: 'Count' }] }, slots: { cell: ({ value, row }: { value: unknown; row: Record<string, unknown> }) => h('a', { href: `/members/${row.name}` }, `${value} seats`) }, attachTo: document.body }));
    expect(getByRole(document.body, 'link', { name: '2 seats' }).getAttribute('href')).toBe('/members/Ada');
  });
  it('Breadcrumb preserves links and marks the current location', () => {
    show('Breadcrumb', { items: [{ label: 'Home', href: '/' }, { label: 'Members' }] });
    const nav = getByRole(document.body, 'navigation', { name: '麵包屑' });
    expect(getByRole(nav, 'link', { name: 'Home' }).getAttribute('href')).toBe('/');
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Members');
  });
  it('Navbar preserves a named navigation, brand and action content', () => {
    const props = { brand: 'Acme', label: 'Product', links: [{ label: 'Docs', href: '/docs' }] };
    if (framework === 'React') render(<ReactUI.Navbar {...props} action={<button>Sign in</button>} />);
    else wrappers.push(mount(VueUI.Navbar, { props, slots: { action: () => h('button', 'Sign in') }, attachTo: document.body }));
    expect(getByRole(document.body, 'banner').textContent).toContain('Acme');
    expect(getByRole(getByRole(document.body, 'navigation', { name: 'Product' }), 'link', { name: 'Docs' }).getAttribute('href')).toBe('/docs');
    expect(getByRole(document.body, 'button', { name: 'Sign in' })).toBeTruthy();
  });
  it('Sidebar marks exactly the active link', () => {
    show('Sidebar', { items: [{ label: 'Home', href: '/' }, { label: 'Members', href: '/members', active: true }] });
    const aside = getByRole(document.body, 'complementary');
    expect(getByRole(aside, 'link', { name: 'Members' }).getAttribute('aria-current')).toBe('page');
    expect(getByRole(aside, 'link', { name: 'Home' }).hasAttribute('aria-current')).toBe(false);
  });
  it('Hero exposes title, description, actions and visual content', () => {
    const props = { title: 'Build together', description: 'Shared components' };
    if (framework === 'React') render(<ReactUI.Hero {...props} actions={<button>Start</button>} visual={<p>Preview</p>} />);
    else wrappers.push(mount(VueUI.Hero, { props, slots: { actions: () => h('button', 'Start'), visual: () => h('p', 'Preview') }, attachTo: document.body }));
    expect(getByRole(document.body, 'heading', { level: 1 }).textContent).toBe('Build together');
    expect(getByRole(document.body, 'button', { name: 'Start' })).toBeTruthy();
    expect(document.body.textContent).toContain('Shared components'); expect(document.body.textContent).toContain('Preview');
  });
  it('FeatureGrid exposes articles and a framework-specific icon extension', () => {
    const items = [{ title: 'Fast', description: 'Quick setup' }];
    if (framework === 'React') render(<ReactUI.FeatureGrid items={items.map(i => ({ ...i, icon: <span aria-label="Speed">→</span> }))} />);
    else wrappers.push(mount(VueUI.FeatureGrid, { props: { items }, slots: { icon: ({ item }: { item: { title: string } }) => h('span', { 'aria-label': 'Speed', title: item.title }, '→') }, attachTo: document.body }));
    const article = getByRole(document.body, 'article');
    expect(getByRole(article, 'heading', { level: 3 }).textContent).toBe('Fast');
    expect(article.textContent).toContain('Quick setup');
    expect(article.querySelector('[aria-label="Speed"]')).toBeTruthy();
  });
  it('PricingTable exposes features and never submits its parent form implicitly', () => {
    show('PricingTable', { plans: [{ name: 'Free', price: '$0', description: 'Personal', features: ['Tokens'] }, { name: 'Team', price: '$10', description: 'Teams', features: ['CLI'], featured: true }] });
    const articles = getAllByRole(document.body, 'article');
    expect(articles[1].classList.contains('acme-price--featured')).toBe(true);
    expect(within(articles[0]).getByRole('listitem').textContent).toBe('Tokens');
    expect(getAllByRole(document.body, 'button').every(b => (b as HTMLButtonElement).type === 'button')).toBe(true);
  });
  it('Footer preserves brand, column content and link destinations', () => {
    show('Footer', { brand: 'Acme', columns: [{ title: 'Resources', links: [{ label: 'Docs', href: '/docs' }] }] });
    const footer = getByRole(document.body, 'contentinfo');
    expect(footer.textContent).toContain('Acme'); expect(footer.textContent).toContain('Resources');
    expect(getByRole(footer, 'link', { name: 'Docs' }).getAttribute('href')).toBe('/docs');
  });
});
it('React composition helpers retain semantic elements, children and native attributes', () => {
  render(<ReactUI.Card><ReactUI.CardHeader id="heading">Heading</ReactUI.CardHeader><ReactUI.CardContent title="Content">Body</ReactUI.CardContent><ReactUI.CardFooter>Actions</ReactUI.CardFooter></ReactUI.Card>);
  expect(document.getElementById('heading')?.tagName).toBe('HEADER');
  expect(document.querySelector('.acme-card__content')?.getAttribute('title')).toBe('Content');
  expect(document.querySelector('.acme-card__footer')?.tagName).toBe('FOOTER');
});
