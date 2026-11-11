import { test, expect } from '@playwright/test';
for (const width of [360, 768, 1280, 1536]) for (const theme of ['light', 'dark']) {
  test(`${width}/${theme}: native radio and editable Modal boundaries in React/Vue`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const framework of ['react', 'vue']) {
      await page.goto(`/scripts/browser/fixtures/modal-${framework}.html`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      await page.locator('#opener').click();
      const dialog = page.getByRole('dialog'), close = page.getByRole('button', { name: '關閉' });
      // Replace only the fixture slot; the real adapter keeps its panel/lifecycle/close control.
      await dialog.evaluate(node => {
        while (node.children.length > 1) node.lastElementChild!.remove();
        node.insertAdjacentHTML('beforeend', `<div id="empty" contenteditable role="textbox" aria-label="Rich draft">Rich
          <span id="nested" contenteditable="true">Nested</span><span id="opt" contenteditable="true" tabindex="0">Opt in</span></div>
          <div id="plain" contenteditable="plaintext-only" role="textbox" aria-label="Plain draft">Plain</div>
          <label><input id="a" type="radio" name="choice" checked>Alpha</label><label><input id="b" type="radio" name="choice">Beta</label>`);
      });
      await close.focus(); await page.keyboard.press('Shift+Tab'); await expect(page.locator('#a')).toBeFocused();
      await page.keyboard.press('Tab'); await expect(close).toBeFocused();
      await page.keyboard.press('Tab'); await expect(page.locator('#empty')).toBeFocused();
      await page.keyboard.press('Tab'); await expect(page.locator('#opt')).toBeFocused();
      await page.keyboard.press('Tab'); await expect(page.locator('#plain')).toBeFocused();
      await expect(page.locator('#plain')).toHaveJSProperty('isContentEditable', true);
      await page.keyboard.type(' draft'); await expect(page.locator('#plain')).toContainText('draft');
      await page.keyboard.press('Tab'); await expect(page.locator('#a')).toBeFocused();
      await page.keyboard.press('ArrowRight'); await expect(page.locator('#b')).toBeFocused(); await expect(page.locator('#b')).toBeChecked();
      await page.keyboard.press('Tab'); await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab'); await expect(page.locator('#b')).toBeFocused();
      // A fresh unchecked group has direction-dependent entry; either member is a boundary when active.
      await page.locator('#a').evaluate(node => { const parent = node.parentElement!.parentElement!; parent.querySelectorAll('label').forEach(label => label.remove()); parent.insertAdjacentHTML('beforeend', '<input aria-label="One" id="one" type="radio" name="fresh"><input aria-label="Two" id="two" type="radio" name="fresh">'); });
      await close.focus(); await page.keyboard.press('Shift+Tab'); await expect(page.locator('#two')).toBeFocused();
      await page.keyboard.press('Tab'); await expect(close).toBeFocused();
      await page.locator('#one').focus(); await page.keyboard.press('Tab'); await expect(close).toBeFocused();
      await page.locator('#one').evaluate(node => node.remove()); await page.locator('#two').evaluate(node => node.remove());
      await dialog.evaluate(node => node.insertAdjacentHTML('beforeend', '<input aria-label="Interleaved one" type="radio" name="interleaved" id="inter-one"><button id="between">Between</button><input aria-label="Interleaved two" type="radio" name="interleaved" id="inter-two">'));
      await page.locator('#between').focus(); await page.keyboard.press('Tab'); await expect(page.locator('#inter-two')).toBeFocused();
      await page.keyboard.press('Tab'); await expect(close).toBeFocused();
      await dialog.evaluate(node => node.querySelectorAll('#inter-one,#between,#inter-two').forEach(item => item.remove()));
      await close.focus(); await page.keyboard.press('Shift+Tab'); await expect(page.locator('#plain')).toBeFocused();
      await page.keyboard.press('Tab'); await expect(close).toBeFocused();
      await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(page.locator('#opener')).toBeFocused();
    }
  });
}
