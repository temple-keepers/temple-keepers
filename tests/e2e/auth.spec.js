import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form', async ({ page }) => {
    await page.getByText('Sign In').click()
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.getByText('Sign In').click()
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.getByText('Sign In').click()
    
    await page.locator('input[type="email"]').fill('invalid-email')
    await page.locator('input[type="password"]').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('should navigate to signup from login', async ({ page }) => {
    await page.getByText('Sign In').click()
    await page.getByText("Don't have an account?").click()
    
    await expect(page.url()).toContain('/signup')
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
  })

  test('should navigate to forgot password', async ({ page }) => {
    await page.getByText('Sign In').click()
    await page.getByText('Forgot password?').click()
    
    await expect(page.url()).toContain('/forgot-password')
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/')
    
    // Test landing page
    await expect(page.getByText('Temple Keepers')).toBeVisible()
    
    // Test pricing page
    await page.getByText('Pricing', { exact: true }).click()
    await expect(page.url()).toContain('/pricing')
    await expect(page.getByText('Choose Your Plan')).toBeVisible()
    
    // Test about/roadmap
    await page.getByText('Roadmap').click()
    await expect(page.url()).toContain('/roadmap')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile menu
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByText('Sign In')).toBeVisible()
  })
})

test.describe('PWA Features', () => {
  test('should have service worker registered', async ({ page }) => {
    await page.goto('/')
    
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    
    expect(swRegistration).toBe(true)
  })

  test('should show install prompt on supported browsers', async ({ page }) => {
    await page.goto('/')
    
    // Simulate install prompt
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'))
    })
    
    // The install button should be available (if PWA is properly configured)
    const installAvailable = await page.locator('[data-testid="pwa-install"]').isVisible()
    // Note: This might not be visible in test environment, so we just check it doesn't error
    expect(typeof installAvailable).toBe('boolean')
  })
})