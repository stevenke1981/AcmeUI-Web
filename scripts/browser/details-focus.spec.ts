import { test, expect, type Locator } from '@playwright/test';
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: native details and nested summary boundaries in React/Vue/static Modals`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const boundaries: unknown[] = [];
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    for (const framework of ['react', 'vue', 'static']) {
      await page.goto(framework === 'static' ? 'http://127.0.0.1:4174/static.html' : `/scripts/browser/fixtures/modal-${framework}.html`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const opener = framework === 'static' ? page.getByRole('button', { name: '開啟對話框' }) : page.locator('#opener');
      await opener.click(); const dialog = page.getByRole('dialog'), close = dialog.getByRole('button', { name: '關閉', exact: true });
      await dialog.evaluate(node => {
        const panel = node.classList.contains('acme-modal__panel') ? node : node.querySelector('.acme-modal__panel')!;
        if (panel === node) { while (panel.children.length > 1) panel.lastElementChild!.remove(); }
        else for (const child of [...panel.children]) if (child.tagName !== 'H2' && !child.hasAttribute('data-acme-modal-close')) child.remove();
        panel.insertAdjacentHTML('beforeend', '<details id="outer"><summary id="outer-summary">More</summary><label>Outer draft<input id="outer-draft"></label><details id="inner"><summary id="inner-summary">Nested</summary><label>Inner draft<input id="inner-draft"></label></details></details>');
      });
      const boundary = async (key: string, target: Locator) => {
        await page.keyboard.press(key);
        // R013 permits one unfocused-document transition, never a background control.
        const state = await page.evaluate(() => ({ bodyActive: document.activeElement === document.body, documentFocused: document.hasFocus() }));
        boundaries.push({ framework, key, ...state });
        if (framework === 'static' && state.bodyActive && !state.documentFocused) await page.keyboard.press(key);
        await expect(target).toBeFocused();
      };
      const outer = page.locator('#outer-summary'), inner = page.locator('#inner-summary'), draft = page.locator('#outer-draft'), nested = page.locator('#inner-draft');
      await close.focus(); await boundary('Shift+Tab', outer);
      await boundary('Tab', close);
      await outer.focus(); await page.keyboard.press('Enter'); await expect(draft).toBeVisible();
      await page.keyboard.press('Tab'); await expect(draft).toBeFocused(); await draft.fill('Keep');
      await page.keyboard.press('Tab'); await expect(inner).toBeFocused(); await expect(nested).not.toBeVisible();
      await boundary('Tab', close);
      await boundary('Shift+Tab', inner);
      await page.keyboard.press('Enter'); await page.keyboard.press('Tab'); await expect(nested).toBeFocused();
      await nested.fill('Nested value'); await boundary('Tab', close); await boundary('Shift+Tab', nested);
      await inner.focus(); await page.keyboard.press('Enter'); await expect(nested).not.toBeVisible();
      await close.focus(); await boundary('Shift+Tab', inner);
      await outer.focus(); await page.keyboard.press('Space'); await expect(draft).not.toBeVisible();
      await close.focus(); await boundary('Shift+Tab', outer);
      await page.keyboard.press('Enter'); await expect(draft).toHaveValue('Keep');
      await inner.focus(); await page.keyboard.press('Enter'); await expect(nested).toHaveValue('Nested value');
      await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible(); await expect(opener).toBeFocused();
    }
    await page.goto('http://127.0.0.1:4174');
    if (theme === 'dark') await page.getByRole('switch', { name: '深色模式' }).click();
    await page.getByRole('button', { name: '建立專案', exact: true }).click();
    const close = page.getByRole('button', { name: '關閉', exact: true }), summary = page.locator('summary').filter({ hasText: '進階選項' });
    await close.focus(); await page.keyboard.press('Shift+Tab'); await expect(summary).toBeFocused();
    await page.keyboard.press('Enter'); await page.keyboard.press('Tab'); await expect(page.getByRole('textbox', { name: '專案代碼' })).toBeFocused();
    await info.attach('details-tab-boundaries', { body: JSON.stringify(boundaries), contentType: 'application/json' });
    expect(errors).toEqual([]);
  });
}
