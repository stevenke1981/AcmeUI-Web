import { test, expect } from '@playwright/test';
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: React/Vue Modal visibility overrides retain native Tab boundaries`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const framework of ['react', 'vue']) {
      await page.goto(`/scripts/browser/fixtures/modal-${framework}.html`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      await page.locator('#opener').click();
      const dialog = page.getByRole('dialog'), close = dialog.getByRole('button', { name: '關閉', exact: true });
      await dialog.evaluate(panel => {
        while (panel.children.length > 1) panel.lastElementChild!.remove();
        panel.insertAdjacentHTML('beforeend', '<div id="wrapper" style="visibility:hidden"><button id="inherited">Inherited hidden</button><button id="override" style="visibility:visible">Visible override</button></div><div style="display:none"><button style="visibility:visible">Display hidden</button></div>');
      });
      for (const visibility of ['hidden', 'collapse']) {
        await page.locator('#wrapper').evaluate((node, value) => { (node as HTMLElement).style.visibility = value; }, visibility);
        const override = page.locator('#override');
        await expect(override).toBeVisible(); await expect(page.locator('#inherited')).toBeHidden();
        await close.focus(); await page.keyboard.press('Shift+Tab'); await expect(override).toBeFocused();
        await page.keyboard.press('Tab'); await expect(close).toBeFocused();
        // Native forward traversal must also reach the override, skipping hidden controls.
        await page.keyboard.press('Tab'); await expect(override).toBeFocused();
      }
      await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible();
      await expect(page.locator('#opener')).toBeFocused();
    }
  });
}
