import { test, expect } from '@playwright/test';

for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: static Tabs honours cancelled then ordinary clicks`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4174/static.html');
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);

    const overview = page.getByRole('tab', { name: '總覽', exact: true });
    const usage = page.getByRole('tab', { name: '使用方式', exact: true });
    const overviewPanel = page.getByRole('tabpanel', { name: '總覽' });
    const usagePanel = page.getByRole('tabpanel', { name: '使用方式' });
    await expect(overview).toBeVisible();
    await usage.evaluate(node => node.addEventListener('click', event => event.preventDefault(), { capture: true, once: true }));

    await usage.click();
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('tabindex', '0');
    await expect(usage).toHaveAttribute('aria-selected', 'false');
    await expect(usage).toHaveAttribute('tabindex', '-1');
    await expect(overviewPanel).toBeVisible();
    await expect(usagePanel).toBeHidden();

    await usage.click();
    await expect(usage).toHaveAttribute('aria-selected', 'true');
    await expect(usage).toHaveAttribute('tabindex', '0');
    await expect(overview).toHaveAttribute('aria-selected', 'false');
    await expect(overview).toHaveAttribute('tabindex', '-1');
    await expect(overviewPanel).toBeHidden();
    await expect(usagePanel).toBeVisible();

    await usage.click();
    await expect(usage).toHaveAttribute('aria-selected', 'true');
    await expect(overviewPanel).toBeHidden();
    expect(errors).toEqual([]);
  });
}
