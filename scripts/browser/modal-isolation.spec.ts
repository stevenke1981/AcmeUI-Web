import { test, expect } from '@playwright/test';
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: React/Vue Modal background isolation, focus and lifecycle`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [], metrics: Record<string, unknown> = {};
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    let reference: { width: number; height: number; background: string; color: string } | undefined;
    for (const framework of ['react', 'vue']) {
      await page.goto(`/scripts/browser/fixtures/modal-${framework}.html`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const opener = page.locator('#opener'), dialog = page.getByRole('dialog'), close = page.getByRole('button', { name: '關閉' });
      await opener.focus(); await page.keyboard.press('Enter'); await expect(dialog).toBeVisible(); await expect(close).toBeFocused();
      for (const id of ['opener', 'background', 'existing', 'clicks', 'closes']) await expect(page.locator(`#${id}`)).toHaveAttribute('inert', '');
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      const measured = await dialog.evaluate(node => {
        const rect = node.getBoundingClientRect(), css = getComputedStyle(node);
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, background: css.backgroundColor, color: css.color, isolated: !!node.closest('[inert]') };
      });
      expect(measured.isolated).toBe(false); expect(measured.x).toBeGreaterThanOrEqual(0); expect(measured.x + measured.width).toBeLessThanOrEqual(width);
      expect(measured.y).toBeGreaterThanOrEqual(0); expect(measured.y + measured.height).toBeLessThanOrEqual(900);
      if (reference) {
        expect(Math.abs(measured.width - reference.width)).toBeLessThanOrEqual(1); expect(Math.abs(measured.height - reference.height)).toBeLessThanOrEqual(1);
        expect(measured.background).toBe(reference.background); expect(measured.color).toBe(reference.color);
      } else reference = measured;
      metrics[framework] = measured;
      await page.locator('#background').evaluate(node => node.focus()); await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab'); await expect(page.locator('#unmount')).toBeFocused();
      await page.keyboard.press('Tab'); await expect(close).toBeFocused();
      await page.keyboard.press('Tab'); await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused();
      await page.evaluate(() => {
        const node = document.createElement('button'); node.id = 'inserted'; node.textContent = 'Inserted'; document.body.append(node);
      });
      await expect(page.locator('#inserted')).toHaveAttribute('inert', '');
      // Bypass native inert deliberately to exercise the independent focusin guard.
      await page.locator('#inserted').evaluate(node => { node.removeAttribute('inert'); node.focus(); }); await expect(close).toBeFocused();
      // Temporarily expose the underlying button to a real pointer; inert must block activation.
      const point = await page.locator('#background').boundingBox(); expect(point).not.toBeNull();
      await page.locator('.acme-modal').evaluate(node => { (node as HTMLElement).style.pointerEvents = 'none'; });
      await page.mouse.click(point!.x + point!.width / 2, point!.y + point!.height / 2);
      await expect(page.locator('#clicks')).toHaveText('0');
      await page.locator('.acme-modal').evaluate(node => { (node as HTMLElement).style.pointerEvents = ''; });
      await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused(); await expect(page.locator('#closes')).toHaveText('1');
      await expect(page.locator('#background')).not.toHaveAttribute('inert'); await expect(page.locator('#inserted')).not.toHaveAttribute('inert');
      await expect(page.locator('#existing')).toHaveAttribute('inert', ''); await expect(page.locator('#existing')).toHaveAttribute('aria-hidden', 'true');
      await page.locator('#background').click(); await expect(page.locator('#clicks')).toHaveText('1');
      await opener.focus(); await page.keyboard.press('Space'); await expect(close).toBeFocused();
      await page.locator('#done').click(); await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
      await opener.click(); await page.locator('#unmount').click(); await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
      await page.keyboard.press('Escape'); await expect(page.locator('#closes')).toHaveText('2');
      await expect(page.locator('#background')).not.toHaveAttribute('inert');
      await opener.click(); await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(page.locator('#closes')).toHaveText('3');
    }
    await info.attach('modal-adapter-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
    expect(errors).toEqual([]);
  });
}
