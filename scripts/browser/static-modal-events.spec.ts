import { test, expect } from '@playwright/test';
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: static Modal honours cancelled open, native cancel and close clicks`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4174/static.html');
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    await expect(page.getByRole('tab', { name: '總覽', exact: true })).toBeVisible();
    const opener = page.getByRole('button', { name: '開啟對話框' }), dialog = page.locator('dialog'), close = dialog.getByRole('button', { name: '關閉', exact: true });
    await opener.evaluate(node => node.addEventListener('click', event => event.preventDefault(), { capture: true, once: true }));
    await opener.click(); await expect(dialog).not.toBeVisible(); await expect(opener).toBeFocused();
    const confirm = page.getByRole('checkbox', { name: '下次關閉先確認一次' });
    await confirm.check(); await opener.focus(); await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible(); expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
    const draft = dialog.getByRole('textbox', { name: '姓名' }); await draft.fill('Keep this draft');
    await page.keyboard.press('Escape'); await expect(dialog).toBeVisible(); await expect(draft).toBeFocused(); await expect(draft).toHaveValue('Keep this draft');
    await expect(dialog.getByRole('status')).toContainText('再次');
    await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible(); await expect(opener).toBeFocused();
    await confirm.check(); await opener.focus(); await page.keyboard.press('Space');
    await close.click(); await expect(dialog).toBeVisible(); await expect(close).toBeFocused(); await expect(draft).toHaveValue('Keep this draft');
    await close.click(); await expect(dialog).not.toBeVisible(); await expect(opener).toBeFocused();
    expect(errors).toEqual([]);
  });
}
