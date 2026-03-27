import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('loads the dashboard page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2').first()).toContainText('Dashboard')
  })

  test('sidebar has all navigation links', async ({ page }) => {
    await page.goto('/')
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar).toBeVisible()

    await expect(sidebar.getByText('Dashboard')).toBeVisible()
    await expect(sidebar.getByText('Cirugias Trazadoras')).toBeVisible()
    await expect(sidebar.getByText('Partos / Cesarea')).toBeVisible()
    await expect(sidebar.getByText('DIP')).toBeVisible()
    await expect(sidebar.getByText('AREpi')).toBeVisible()
    await expect(sidebar.getByText('Registro IAAS')).toBeVisible()
    await expect(sidebar.getByText('Consolidacion Tasas')).toBeVisible()
    await expect(sidebar.getByText('Importar Excel')).toBeVisible()
  })

  test('navigates to each registry page', async ({ page }) => {
    await page.goto('/')

    // Navigate to Cirugias
    await page.getByTestId('sidebar').getByText('Cirugias Trazadoras').click()
    await expect(page.getByTestId('page-title')).toContainText('Cirugías Trazadoras')

    // Navigate to Partos (page title is "Endometritis Puerperal")
    await page.getByTestId('sidebar').getByText('Partos / Cesarea').click()
    await expect(page.getByTestId('page-title')).toContainText('Endometritis Puerperal')

    // Navigate to DIP
    await page.getByTestId('sidebar').getByText('DIP').click()
    await expect(page.getByTestId('page-title')).toContainText('DIP')

    // Navigate to AREpi
    await page.getByTestId('sidebar').getByText('AREpi').click()
    await expect(page.getByTestId('page-title')).toContainText('AREpi')

    // Navigate to Registro IAAS
    await page.getByTestId('sidebar').getByText('Registro IAAS').click()
    await expect(page.getByTestId('page-title')).toContainText('Registro IAAS')
  })

  test('navigates to consolidation page', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('sidebar').getByText('Consolidacion Tasas').click()
    // Consolidación page has its own h2, not using PageHeader
    await expect(page.locator('h2').first()).toContainText('Consolidación')
  })

  test('sidebar collapse toggle works', async ({ page }) => {
    await page.goto('/')
    const sidebar = page.getByTestId('sidebar')

    // Initially expanded — verify a nav label is visible
    await expect(sidebar.getByText('Dashboard')).toBeVisible()

    // Click collapse button
    await sidebar.getByTitle('Colapsar menu').click()

    // The sidebar should be narrower (72px). Check text is hidden
    await expect(sidebar.getByText('Dashboard')).toBeHidden()

    // Expand again
    await sidebar.getByTitle('Expandir menu').click()
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
  })

  test('admin user sees Usuarios link', async ({ page }) => {
    await page.goto('/')
    const sidebar = page.getByTestId('sidebar')
    // In demo mode, user is admin, so Usuarios should be visible
    await expect(sidebar.getByText('Usuarios')).toBeVisible()
  })
})
