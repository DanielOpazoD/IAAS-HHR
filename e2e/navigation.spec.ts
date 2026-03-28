import { test, expect } from '@playwright/test'

test.describe('Navegación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2').first()).toContainText('Dashboard')
  })

  test('sidebar muestra todos los links de navegación principales', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
    await expect(sidebar.getByText('Cirugias Trazadoras')).toBeVisible()
    await expect(sidebar.getByText('Partos / Cesarea')).toBeVisible()
    await expect(sidebar.getByText('DIP')).toBeVisible()
    await expect(sidebar.getByText('AREpi')).toBeVisible()
    await expect(sidebar.getByText('Registro IAAS')).toBeVisible()
    await expect(sidebar.getByText('Consolidacion Tasas')).toBeVisible()
  })

  test('navega a cada módulo correctamente', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')

    await sidebar.getByText('Cirugias Trazadoras').click()
    await expect(page.getByTestId('page-title')).toContainText('Cirugías Trazadoras')

    await sidebar.getByText('Partos / Cesarea').click()
    await expect(page.getByTestId('page-title')).toContainText('Endometritis Puerperal')

    await sidebar.getByText('DIP').click()
    await expect(page.getByTestId('page-title')).toContainText('DIP')

    await sidebar.getByText('AREpi').click()
    await expect(page.getByTestId('page-title')).toContainText('AREpi')

    await sidebar.getByText('Registro IAAS').click()
    await expect(page.getByTestId('page-title')).toContainText('Registro IAAS')
  })

  test('navega a la página de Consolidación', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Consolidacion Tasas').click()
    await expect(page.locator('h2').first()).toContainText('Consolidación')
  })

  test('colapsa y expande el sidebar', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar.getByText('Dashboard')).toBeVisible()

    await sidebar.getByTitle('Colapsar menu').click()
    await expect(sidebar.getByText('Dashboard')).toBeHidden()

    await sidebar.getByTitle('Expandir menu').click()
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
  })

  test('el selector de año está visible en el header', async ({ page }) => {
    const yearSelect = page.getByRole('combobox').first()
    await expect(yearSelect).toBeVisible()
    const currentYear = new Date().getFullYear().toString()
    await expect(yearSelect).toHaveValue(currentYear)
  })

  test('módulos con filtro de mes muestran selector en el header', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Cirugias Trazadoras').click()
    // Year selector + month selector = 2 comboboxes
    const monthCombo = page.getByRole('combobox').nth(1)
    await expect(monthCombo).toBeVisible()
    await expect(monthCombo).toContainText('Todos los meses')
  })

  test('AREpi no muestra selector de mes', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('AREpi').click()
    // Only year selector visible — no month selector
    const allCombos = page.getByRole('combobox')
    await expect(allCombos).toHaveCount(1)
  })

  test('menu admin se abre al hacer click en el logo (modo admin)', async ({ page }) => {
    // Click the logo button to open the admin dropdown
    await page.getByTestId('sidebar').getByTitle('Menu de administracion').click()
    await expect(page.getByText('Importar Excel')).toBeVisible()
    await expect(page.getByText('Usuarios')).toBeVisible()
    await expect(page.getByText('Configuracion')).toBeVisible()
  })
})
