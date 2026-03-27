import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('shows dashboard with title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2')).toContainText('Dashboard')
  })

  test('shows demo mode indicator', async ({ page }) => {
    await page.goto('/')
    // Demo mode should show demo user info somewhere
    await expect(page.getByText(/demo/i)).toBeVisible()
  })

  test('year selector is present', async ({ page }) => {
    await page.goto('/')
    // Should have year selector combobox
    await expect(page.getByRole('combobox').first()).toBeVisible()
  })
})
