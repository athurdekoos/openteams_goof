import { test, expect } from '@playwright/test';

test.describe('Toolbar Controls', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('pause button toggles text and active class', async ({ page }) => {
    const btn = page.locator('#pause-btn');

    // Initial state
    await expect(btn).toContainText('Pause');

    // Click to pause
    await btn.click();
    await expect(btn).toContainText('Resume');
    await expect(btn).toHaveClass(/active/);

    // Click to resume
    await btn.click();
    await expect(btn).toContainText('Pause');
    await expect(btn).not.toHaveClass(/active/);
  });

  test('theme button toggles body class', async ({ page }) => {
    const btn = page.locator('#theme-btn');

    // Initial state: light
    await expect(page.locator('body')).toHaveClass(/theme-light/);

    // Click to dark
    await btn.click();
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // Click back to light
    await btn.click();
    await expect(page.locator('body')).toHaveClass(/theme-light/);
  });

  test('density button toggles body class', async ({ page }) => {
    const btn = page.locator('#density-btn');

    // Initial state: comfortable
    await expect(page.locator('body')).toHaveClass(/density-comfortable/);

    // Click to compact
    await btn.click();
    await expect(page.locator('body')).toHaveClass(/density-compact/);

    // Click back
    await btn.click();
    await expect(page.locator('body')).toHaveClass(/density-comfortable/);
  });

  test('HUD button toggles overlay visibility', async ({ page }) => {
    const btn = page.locator('#hud-btn');
    const overlay = page.locator('.hud-overlay');

    // Initially hidden
    await expect(overlay).toHaveClass(/hidden/);

    // Click to show
    await btn.click();
    await expect(overlay).not.toHaveClass(/hidden/);

    // Click to hide
    await btn.click();
    await expect(overlay).toHaveClass(/hidden/);
  });

  test('seed input change triggers rebuild', async ({ page }) => {
    const seedInput = page.locator('#seed-input');
    await seedInput.fill('99');
    await seedInput.dispatchEvent('change');
    // Verify no crash — page still functional
    await page.waitForTimeout(500);
    await expect(page.locator('#main-toolbar')).toBeVisible();
  });

  test('reset button restores defaults', async ({ page }) => {
    // Change theme to dark first
    await page.locator('#theme-btn').click();
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // Reset
    await page.locator('#reset-btn').click();
    await expect(page.locator('body')).toHaveClass(/theme-light/);
  });

  test('help button shows help modal', async ({ page }) => {
    await page.locator('#help-btn').click();
    const modal = page.locator('#help-modal');
    await expect(modal).toBeVisible();

    // Has shortcut table content
    await expect(modal).toContainText('Space');
    await expect(modal).toContainText('Toggle Theme');

    // Escape closes it
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/hidden/);
  });

  test('export triggers download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^datagrid-workbench-.*\.json$/);
  });
});
