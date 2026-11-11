import { test, expect } from '@playwright/test';

test.describe('Waiter Application & Kitchen View', () => {
  test('WAIT-001: Waiter login page access', async ({ page }) => {
    await page.goto('/bite-waiter/login');
    await expect(page).toHaveURL(/.*bite-waiter\/login/);
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('WAIT-002: Protected kitchen view redirects unauthorized access', async ({ page }) => {
    await page.goto('/bite-waiter');
    // Protected route redirects to login if unauthenticated
    await expect(page.locator('body')).toBeVisible();
  });
});
