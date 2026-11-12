import { test, expect } from '@playwright/test';
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: Tabs respect consumer cancellation and synthetic composition in three adapters`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    for (const framework of ['react', 'vue', 'static']) {
      await page.goto(framework === 'static' ? 'http://127.0.0.1:4174/static.html' : `/scripts/browser/fixtures/tabs-${framework}.html`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const tabs = page.getByRole('tab'), first = tabs.nth(0), last = tabs.last();
      await first.focus();
      // A real capture consumer cancels before either framework or static bubble handler.
      await first.evaluate(node => document.addEventListener('keydown', event => { if (event.target === node) event.preventDefault(); }, { capture: true, once: true }));
      await page.keyboard.press('ArrowRight');
      await expect(first).toHaveAttribute('aria-selected', 'true'); await expect(first).toBeFocused();
      const cancelled = await first.evaluate(node => {
        const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true, isComposing: true });
        node.dispatchEvent(event); return event.defaultPrevented;
      });
      expect(cancelled).toBe(false); await expect(first).toHaveAttribute('aria-selected', 'true'); await expect(first).toBeFocused();
      await page.keyboard.press('End'); await expect(last).toHaveAttribute('aria-selected', 'true'); await expect(last).toBeFocused();
      await page.keyboard.press('Home'); await expect(first).toBeFocused();
      await page.keyboard.press('ArrowLeft'); await expect(last).toBeFocused();
      await page.keyboard.press('ArrowRight'); await expect(first).toBeFocused();
    }
    await page.goto('http://127.0.0.1:4174');
    if (theme === 'dark') await page.getByRole('switch', { name: '深色模式' }).click();
    await page.getByRole('tab', { name: '表單與邊界行為', exact: true }).click();
    const overview = page.getByRole('tab', { name: '動態總覽', exact: true }), details = page.getByRole('tab', { name: '動態詳細', exact: true });
    await page.getByRole('checkbox', { name: '暫停分頁快捷鍵' }).check();
    await overview.focus(); await page.keyboard.press('ArrowRight'); await expect(overview).toBeFocused(); await expect(overview).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('checkbox', { name: '暫停分頁快捷鍵' }).uncheck();
    await overview.focus(); await page.keyboard.press('ArrowRight'); await expect(details).toBeFocused(); await expect(details).toHaveAttribute('aria-selected', 'true');
    expect(errors).toEqual([]);
  });
}
