import { test, expect, type Page } from '@playwright/test';
import registry from '../../templates/registry.json';
import { assertEquivalent, assertNoOverflow } from './layout-contract.mjs';
const widths = [360, 768, 1280, 1536];
const selectors = ['.acme-navbar', '.acme-navbar__inner', '.acme-hero', '.acme-hero h1', '.acme-hero p', '.acme-button', '.acme-card', '.acme-badge', '.acme-avatar', '.acme-input', '.acme-alert', '.acme-progress', '.acme-table-wrap', '.acme-table th', '.acme-feature', '.acme-price'];
async function stable(page: Page) {
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.locator('main').waitFor();
}
async function overflow(page: Page) {
  return page.evaluate(() => ({ viewportWidth: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
}
async function measure(page: Page) {
  return page.evaluate(selectors => Object.fromEntries(selectors.map(selector => [selector, [...document.querySelectorAll<HTMLElement>(selector)].map(node => {
    const rect = node.getBoundingClientRect(), css = getComputedStyle(node);
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, color: css.color, background: css.backgroundColor, border: css.borderColor, radius: css.borderRadius, fontSize: css.fontSize, fontWeight: css.fontWeight, display: css.display, padding: css.padding };
  })])), selectors);
}
function errorsFor(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  return errors;
}
for (const width of widths) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: all 48 previews have readable layouts and theme toggles`, async ({ page }) => {
    test.setTimeout(120_000); const errors = errorsFor(page);
    await page.setViewportSize({ width, height: 900 });
    for (const item of registry.templates) {
      await page.goto(`/previews/${item.slug}/index.html`); await stable(page);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const metrics = await overflow(page); assertNoOverflow(metrics, `${item.slug}/${width}/${theme}`);
      await expect(page.locator('h1')).toBeVisible();
      const main = await page.locator('main').boundingBox(); expect(main?.width).toBeGreaterThan(0);
      const toggle = page.locator('.theme-toggle');
      if (await toggle.count()) { await toggle.click(); await expect(page.locator('html')).toHaveAttribute('data-theme', theme === 'dark' ? 'light' : 'dark'); }
    }
    expect(errors).toEqual([]);
  });
  test(`${width}/${theme}: React/Vue/static/Tailwind geometry and semantic styles agree`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 }); const errors = errorsFor(page);
    let reference: Awaited<ReturnType<typeof measure>> | undefined;
    const all: Record<string, unknown> = {};
    for (const framework of ['react', 'vue', 'static', 'tailwind']) {
      await page.goto(`/scripts/browser/fixtures/${framework}.html`); await stable(page);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      assertNoOverflow(await overflow(page), `${framework}/${width}/${theme}`);
      const metrics = await measure(page); all[framework] = metrics;
      for (const selector of selectors) expect(metrics[selector].length, selector).toBeGreaterThan(0);
      if (!reference) reference = metrics; else assertEquivalent(reference, metrics, `${framework}/${width}/${theme}`);
      // Use keyboard input to get real :focus-visible, rather than jsdom focus().
      await page.keyboard.press('Tab');
      if (width > 800) await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
      await page.keyboard.press('Tab');
      const start = page.getByRole('button', { name: 'Start', exact: true });
      await expect(start).toBeFocused();
      const focus = await start.evaluate(node => {
        const css = getComputedStyle(node), probe = document.createElement('span');
        probe.style.color = 'var(--acme-ring)'; document.body.append(probe);
        const ring = getComputedStyle(probe).color; probe.remove();
        return { width: css.outlineWidth, style: css.outlineStyle, color: css.outlineColor, ring };
      });
      expect(focus.width).toBe('3px'); expect(focus.style).toBe('solid'); expect(focus.color).toBe(focus.ring);
      all[`${framework}Focus`] = focus;
    }
    await info.attach('computed-layouts', { body: JSON.stringify(all, null, 2), contentType: 'application/json' });
    expect(errors).toEqual([]);
  });
  test(`${width}/${theme}: Gallery tabs/modal stay in the viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); const errors = errorsFor(page);
    await page.goto('http://127.0.0.1:4174/'); await stable(page);
    if (theme === 'dark') await page.getByRole('switch', { name: '深色模式' }).click();
    for (const name of ['Buttons', '表單與邊界行為', '內容與資料', 'Pricing']) {
      await page.getByRole('tab', { name, exact: true }).click();
      assertNoOverflow(await overflow(page), `Gallery/${name}/${width}/${theme}`);
    }
    await page.getByRole('button', { name: '建立專案', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible(); assertNoOverflow(await overflow(page), `Gallery/modal/${width}/${theme}`);
    await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '建立專案', exact: true })).toBeFocused();
    expect(errors).toEqual([]);
  });
}
test('layout guards reject injected overflow and style drift', async ({ page }) => {
  await page.goto('/scripts/browser/fixtures/react.html'); await stable(page);
  const reference = await measure(page);
  await page.addStyleTag({ content: '.acme-button{padding:5rem!important} main{width:200vw!important}' });
  expect(() => assertNoOverflow({ viewportWidth: 1280, scrollWidth: 2560 }, 'negative')).toThrow(/overflow/);
  const changed = await measure(page); expect(() => assertEquivalent(reference, changed, 'negative')).toThrow();
  const metrics = await overflow(page); expect(() => assertNoOverflow(metrics, 'injected')).toThrow(/overflow/);
});
