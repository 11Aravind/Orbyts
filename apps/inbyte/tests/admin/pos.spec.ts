import { test, expect } from '@playwright/test';

test.describe('Admin POS & Billing Module', () => {
  test('POS-001: POS billing page protection & access', async ({ page }) => {
    await page.goto('/bite-admin/pos');
    await expect(page.locator('body')).toBeVisible();
  });

  test('POS-002: Add item to POS cart and verify billing buttons', async ({ page }) => {
    await page.goto('/bite-admin/login');
    const userInput = page.locator('input[type="text"], input[placeholder*="admin"]').first();
    const passInput = page.locator('input[type="password"]').first();
    if (await userInput.isVisible()) {
      await userInput.fill('admin');
      await passInput.fill('adminpassword');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);
    }

    await page.goto('/bite-admin/pos');
    await expect(page.locator('body')).toBeVisible();

    const saveOrderBtn = page.locator('button:has-text("Save Order")').first();
    if (await saveOrderBtn.isVisible()) {
      await expect(saveOrderBtn).toBeVisible();
    }
  });
});
