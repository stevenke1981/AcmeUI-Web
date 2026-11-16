import { test, expect, type Page } from '@playwright/test';

async function cancelNext(page: Page, type: 'click' | 'mousedown', selector: string) {
  await page.evaluate(({ type, selector }) => {
    const consume = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.closest(selector)) return;
      event.preventDefault(); document.removeEventListener(type, consume, true);
    };
    document.addEventListener(type, consume, true);
  }, { type, selector });
}
async function retained(page: Page) {
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Retained draft');
  await expect(page.locator('#opener')).toHaveAttribute('inert', '');
  expect(await page.getByRole('dialog').evaluate(node => node.contains(document.activeElement))).toBe(true);
}
async function closed(page: Page, count: number) {
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#closes')).toHaveText(String(count));
  await expect(page.locator('#opener')).not.toHaveAttribute('inert');
  await expect(page.locator('#opener')).toBeFocused();
}
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: Modal mouse dismissal adapters retain cancelled events`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    for (const framework of ['react', 'vue']) {
      await page.goto(`/scripts/browser/fixtures/modal-${framework}.html`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const opener = page.locator('#opener'), close = page.getByRole('button', { name: '關閉', exact: true });
      const backdrop = page.locator('.acme-modal');
      await opener.click(); await page.getByRole('textbox', { name: 'Name' }).fill('Retained draft');
      for (const button of ['middle', 'right'] as const) {
        await backdrop.click({ position: { x: 4, y: 4 }, button });
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Retained draft');
        await expect(opener).toHaveAttribute('inert', ''); await expect(page.locator('#closes')).toHaveText('0');
        // Leave non-primary defaults browser-owned; Tab re-enters the active trap.
        await page.keyboard.press('Tab'); await retained(page);
      }
      await cancelNext(page, 'click', '[aria-label="關閉"]');
      await close.click(); await retained(page); await expect(page.locator('#closes')).toHaveText('0');
      await page.locator('#background').evaluate((node: HTMLElement) => node.focus()); await retained(page);
      await close.click(); await closed(page, 1);

      await opener.click(); await page.getByRole('textbox', { name: 'Name' }).fill('Retained draft');
      await cancelNext(page, 'mousedown', '.acme-modal');
      await backdrop.click({ position: { x: 4, y: 4 } });
      await retained(page); await expect(page.locator('#closes')).toHaveText('1');
      await backdrop.click({ position: { x: 4, y: 4 } }); await closed(page, 2);

      let count = 2;
      for (const key of ['Enter', 'Space']) {
        await opener.click(); await close.press(key); await closed(page, ++count);
      }
      await opener.click(); await page.keyboard.press('Escape'); await closed(page, ++count);
    }
    expect(errors).toEqual([]);
  });
  test(`${width}/${theme}: Gallery can consume one Modal mouse dismissal`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4174');
    if (theme === 'dark') await page.getByRole('switch', { name: '深色模式' }).click();
    const opener = page.getByRole('button', { name: '建立專案', exact: true });
    const dialog = page.getByRole('dialog'), guard = page.getByRole('checkbox', { name: '攔截一次滑鼠關閉' });
    for (const target of ['close', 'backdrop']) {
      await opener.click(); await guard.check();
      const draft = page.getByRole('textbox', { name: '專案備註' }); await draft.fill('保留的專案草稿');
      const dismiss = () => target === 'close'
        ? page.getByRole('button', { name: '關閉', exact: true }).click()
        : page.locator('.acme-modal').click({ position: { x: 4, y: 4 } });
      await dismiss(); await expect(dialog).toBeVisible(); await expect(draft).toHaveText('保留的專案草稿');
      await expect(guard).not.toBeChecked();
      expect(await opener.evaluate(node => !!node.closest('[inert]'))).toBe(true);
      expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
      await dismiss(); await expect(dialog).toHaveCount(0); await expect(opener, `${target} restores opener focus`).toBeFocused();
      expect(await opener.evaluate(node => !!node.closest('[inert]'))).toBe(false);
    }
  });
}
