import { test, expect } from '@playwright/test';
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: React/Vue and Gallery children consume Escape before Modal dismissal`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const framework of ['react', 'vue']) {
      await page.goto(`/scripts/browser/fixtures/modal-${framework}.html`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const opener = page.locator('#opener'), dialog = page.getByRole('dialog'), draft = page.getByRole('textbox', { name: 'Name' });
      await opener.click(); await draft.focus(); await page.keyboard.press('Escape');
      await expect(draft).toHaveAttribute('data-escape-consumed', 'true');
      await expect(dialog).toBeVisible(); await expect(draft).toBeFocused();
      await expect(page.locator('#closes')).toHaveText('0'); await expect(opener).toHaveAttribute('inert', '');
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
      await expect(page.locator('#closes')).toHaveText('1'); await expect(opener).not.toHaveAttribute('inert');
    }
    await page.goto('http://127.0.0.1:4174');
    if (theme === 'dark') await page.getByRole('switch', { name: '深色模式' }).click();
    const opener = page.getByRole('button', { name: '建立專案', exact: true }), dialog = page.getByRole('dialog'), notes = page.getByRole('textbox', { name: '專案備註' });
    await opener.click(); await notes.fill('已編輯的備註'); await expect(notes).toHaveAttribute('data-editing', 'true');
    await page.keyboard.press('Escape');
    await expect(notes).toHaveAttribute('data-editing', 'false'); await expect(notes).toHaveText('已編輯的備註');
    await expect(dialog).toBeVisible(); await expect(notes).toBeFocused();
    await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
    expect(errors).toEqual([]);
  });
}
