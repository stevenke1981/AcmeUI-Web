import { test, expect, type Locator, type Page } from '@playwright/test';
import { assertNoOverflow } from './layout-contract.mjs';

async function isNativeModal(page: Page) {
  return page.locator('dialog').evaluate(node => node.matches(':modal'));
}

async function crossBoundary(page: Page, key: string, target: Locator) {
  await page.keyboard.press(key);
  const state = await page.evaluate(() => ({ bodyActive: document.activeElement === document.body, documentFocused: document.hasFocus(), activeTag: document.activeElement?.tagName }));
  // Chromium can leave document focus at a native-dialog boundary. Permit that
  // single observed transition, never a background control or focused body.
  if (state.bodyActive && !state.documentFocused) await page.keyboard.press(key);
  await expect(target).toBeFocused();
  return { key, ...state };
}

for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: static native dialog keyboard, modality and opener focus`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4174/static.html');
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    const dialog = page.locator('dialog'), opener = page.getByRole('button', { name: '開啟對話框' });
    const input = dialog.getByRole('textbox', { name: '姓名' }), close = dialog.getByRole('button', { name: '關閉', exact: true });
    await expect(page.getByRole('tab', { name: '總覽' })).toBeVisible(); // Module initialization finished.
    await expect(dialog).not.toBeVisible();
    await opener.focus(); await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible(); expect(await isNativeModal(page)).toBe(true);
    await expect(input).toBeFocused();
    await page.keyboard.press('Tab'); await expect(close).toBeFocused();
    const forward = await crossBoundary(page, 'Tab', input);
    const backward = await crossBoundary(page, 'Shift+Tab', close);
    await info.attach('native-tab-boundaries', { body: JSON.stringify({ forward, backward }), contentType: 'application/json' });
    await page.keyboard.press('Shift+Tab'); await expect(input).toBeFocused();
    // Native inert background must reject programmatic focus as well as Tab.
    await page.locator('a').first().evaluate(node => node.focus());
    await expect(input).toBeFocused();
    const metrics = await dialog.evaluate(node => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, viewportWidth: innerWidth, scrollWidth: document.documentElement.scrollWidth, viewportHeight: innerHeight };
    });
    assertNoOverflow(metrics, `static dialog/${width}/${theme}`);
    expect(metrics.x).toBeGreaterThanOrEqual(0); expect(metrics.y).toBeGreaterThanOrEqual(0);
    expect(metrics.right).toBeLessThanOrEqual(width); expect(metrics.bottom).toBeLessThanOrEqual(metrics.viewportHeight);
    await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await page.keyboard.press('Space'); await expect(input).toBeFocused();
    await page.keyboard.press('Tab'); await expect(close).toBeFocused();
    await page.keyboard.press('Space'); await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused(); expect(errors).toEqual([]);
  });
}

test('static content and anchor tabs remain readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 900 } });
  try {
    const page = await context.newPage(); await page.goto('http://127.0.0.1:4174/static.html');
    for (const title of ['總覽', '使用方式', '鍵盤']) await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await page.getByRole('link', { name: '使用方式', exact: true }).click(); await expect(page).toHaveURL(/#usage$/);
    await expect(page.locator('#modal-fallback')).toBeVisible();
    await page.getByRole('button', { name: '開啟對話框' }).click(); await expect(page.locator('dialog')).not.toBeVisible();
  } finally { await context.close(); }
});

test('modality guard rejects an injected non-modal show implementation', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174/static.html');
  await expect(page.getByRole('tab', { name: '總覽' })).toBeVisible();
  await page.locator('dialog').evaluate(node => { const dialog = node as HTMLDialogElement; dialog.showModal = () => dialog.show(); });
  await page.getByRole('button', { name: '開啟對話框' }).click();
  await expect(page.locator('dialog')).toBeVisible(); expect(await isNativeModal(page)).toBe(false);
  await page.locator('a').first().evaluate(node => node.focus());
  await expect(page.locator('a').first()).toBeFocused();
});
