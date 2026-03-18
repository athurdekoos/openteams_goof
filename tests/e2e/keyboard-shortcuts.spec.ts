import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Space toggles pause state', async ({ page }) => {
    const btn = page.locator('#pause-btn');
    await expect(btn).toContainText('Pause');

    await page.keyboard.press('Space');
    await expect(btn).toContainText('Resume');

    await page.keyboard.press('Space');
    await expect(btn).toContainText('Pause');
  });

  test('Ctrl+Shift+T toggles theme', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass(/theme-light/);

    await page.keyboard.press('Control+Shift+T');
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    await page.keyboard.press('Control+Shift+T');
    await expect(page.locator('body')).toHaveClass(/theme-light/);
  });

  test('Ctrl+Shift+H toggles HUD', async ({ page }) => {
    const overlay = page.locator('.hud-overlay');
    await expect(overlay).toHaveClass(/hidden/);

    await page.keyboard.press('Control+Shift+H');
    await expect(overlay).not.toHaveClass(/hidden/);

    await page.keyboard.press('Control+Shift+H');
    await expect(overlay).toHaveClass(/hidden/);
  });

  test('Ctrl+Shift+R resets layout', async ({ page }) => {
    // Change theme first
    await page.keyboard.press('Control+Shift+T');
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // Reset
    await page.keyboard.press('Control+Shift+R');
    await expect(page.locator('body')).toHaveClass(/theme-light/);
  });
});
