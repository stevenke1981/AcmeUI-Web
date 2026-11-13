import { test, expect } from '@playwright/test';
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: React and Vue Tabs ignore a cancelled click then select on the next ordinary click`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const framework of ['react', 'vue'] as const) {
      await page.goto(`/scripts/browser/fixtures/tabs-${framework}.html`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const first = page.getByRole('tab', { name: 'Alpha' });
      const second = page.getByRole('tab', { name: 'Beta' });
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toHaveText('First');
      await second.evaluate(node => {
        node.addEventListener('click', event => event.preventDefault(), { capture: true, once: true });
      });
      await second.click();
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await expect(second).toHaveAttribute('aria-selected', 'false');
      await expect(page.getByRole('tabpanel')).toHaveText('First');
      await second.click();
      await expect(second).toHaveAttribute('aria-selected', 'true');
      await expect(first).toHaveAttribute('aria-selected', 'false');
      await expect(page.getByRole('tabpanel')).toHaveText('Second');
    }
    expect(errors).toEqual([]);
  });
}
