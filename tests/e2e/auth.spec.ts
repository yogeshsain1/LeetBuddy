import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/LeetSocial/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should show validation errors on invalid login', async ({ page }) => {
    await page.goto('/login');
    
    // Click login without entering credentials
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=/email/i')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/LeetSocial/);
    await expect(page.locator('h2')).toContainText('Create your account');
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/signup');
    
    // Type a weak password
    await page.fill('input[type="password"]', 'weak');
    
    // Should show password strength
    await expect(page.locator('text=/strength/i')).toBeVisible();
  });
});

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LeetSocial/);
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/messages');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to login when accessing friends page without auth', async ({ page }) => {
    await page.goto('/friends');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
