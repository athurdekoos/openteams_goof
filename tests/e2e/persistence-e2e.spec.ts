import { test, expect } from '@playwright/test';

test.describe('Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('theme persists across reload', async ({ page }) => {
    // Toggle to dark
    await page.locator('#theme-btn').click();
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toHaveClass(/theme-dark/);
  });

  test('seed persists across reload', async ({ page }) => {
    const seedInput = page.locator('#seed-input');
    await seedInput.fill('99');
    await seedInput.dispatchEvent('change');
    await page.waitForTimeout(500);

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#seed-input')).toHaveValue('99');
  });

  test('HUD visibility persists', async ({ page }) => {
    // Show HUD
    await page.locator('#hud-btn').click();
    const overlay = page.locator('.hud-overlay');
    await expect(overlay).not.toHaveClass(/hidden/);

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.hud-overlay')).not.toHaveClass(/hidden/);
  });

  test('export downloads a .json file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test('reset clears localStorage, reload shows defaults', async ({ page }) => {
    // Change theme
    await page.locator('#theme-btn').click();
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // Reset
    await page.locator('#reset-btn').click();
    await expect(page.locator('body')).toHaveClass(/theme-light/);

    // Reload — should show defaults
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toHaveClass(/theme-light/);
    await expect(page.locator('body')).toHaveClass(/density-comfortable/);
  });
});
