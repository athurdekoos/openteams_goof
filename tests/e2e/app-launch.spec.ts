import { test, expect } from '@playwright/test';

test.describe('App Launch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page loads without error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    // Give it a moment for any async errors
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('#main-toolbar exists with role="toolbar"', async ({ page }) => {
    const toolbar = page.locator('#main-toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveAttribute('role', 'toolbar');
  });

  test('all toolbar buttons exist', async ({ page }) => {
    const buttonIds = [
      'pause-btn', 'theme-btn', 'density-btn', 'hud-btn',
      'reset-btn', 'export-btn', 'import-btn', 'help-btn',
    ];
    for (const id of buttonIds) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('#seed-input exists with correct aria-label', async ({ page }) => {
    const seedInput = page.locator('#seed-input');
    await expect(seedInput).toBeVisible();
    await expect(seedInput).toHaveAttribute('aria-label', 'Random seed');
  });

  test('#freq-slider exists with correct aria-label', async ({ page }) => {
    const slider = page.locator('#freq-slider');
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute('aria-label', 'Animation speed');
  });

  test('grid panels exist with canvas elements', async ({ page }) => {
    // Wait for panels to render
    await page.waitForTimeout(1000);

    // Check that canvas elements are present (Lumino DataGrid renders to canvas)
    const canvases = page.locator('canvas');
    const count = await canvases.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('no console errors during load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    expect(errors).toEqual([]);
  });
});
