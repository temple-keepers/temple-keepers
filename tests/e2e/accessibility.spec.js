import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('landing page should be accessible', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('login page should be accessible', async ({ page }) => {
    await page.getByText('Sign In').click()
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('signup page should be accessible', async ({ page }) => {
    await page.goto('/signup')
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    expect(headings.length).toBeGreaterThan(0)
    
    // Check that h1 exists
    const h1 = await page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('should have alt text for images', async ({ page }) => {
    const images = await page.locator('img').all()
    
    for (const image of images) {
      const altText = await image.getAttribute('alt')
      expect(altText).not.toBeNull()
    }
  })

  test('forms should have proper labels', async ({ page }) => {
    await page.getByText('Sign In').click()
    
    const inputs = await page.locator('input').all()
    
    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        return !!el.getAttribute('aria-label') || 
               !!el.getAttribute('aria-labelledby') ||
               !!el.closest('label') ||
               !!document.querySelector(`label[for="${el.id}"]`)
      })
      
      expect(hasLabel).toBe(true)
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    const firstFocusable = await page.evaluate(() => document.activeElement.tagName)
    expect(['A', 'BUTTON', 'INPUT'].includes(firstFocusable)).toBe(true)
    
    // Continue tabbing and ensure focus is visible
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })
})