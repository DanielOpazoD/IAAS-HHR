import { test, expect } from '@playwright/test'

test.describe('Navegación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2').first()).toContainText('Vigilancia Epidemiológica')
  })

  test('sidebar muestra Vigilancia Epidemiológica y submódulos', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.getByText('Vigilancia Epidemiológica')).toBeVisible()
    await expect(sidebar.getByText('Cirugías Trazadoras')).toBeVisible()
    await expect(sidebar.getByText('Partos / Cesárea')).toBeVisible()
    await expect(sidebar.getByText('DIP')).toBeVisible()
    await expect(sidebar.getByText('AREpi')).toBeVisible()
    await expect(sidebar.getByText('Registro IAAS')).toBeVisible()
    await expect(sidebar.getByText('Documentos IAAS')).toBeVisible()
  })

  test('navega a cada módulo correctamente', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')

    await sidebar.getByText('Cirugías Trazadoras').click()
    await expect(page.getByTestId('page-title')).toContainText('Cirugías Trazadoras')

    await sidebar.getByText('Partos / Cesárea').click()
    await expect(page.getByTestId('page-title')).toContainText('Endometritis Puerperal')

    await sidebar.getByText('DIP').click()
    await expect(page.getByTestId('page-title')).toContainText('DIP')

    await sidebar.getByText('AREpi').click()
    await expect(page.getByTestId('page-title')).toContainText('AREpi')

    await sidebar.getByText('Registro IAAS').click()
    await expect(page.getByTestId('page-title')).toContainText('Registro IAAS')
  })

  test('tab Consolidación de Tasas se abre desde Vigilancia Epidemiológica', async ({ page }) => {
    await page.getByRole('button', { name: 'Consolidación de Tasas' }).click()
    await expect(page.getByText('Consolidación de Tasas').first()).toBeVisible()
  })

  test('colapsa y expande el sidebar', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar.getByText('Vigilancia Epidemiológica')).toBeVisible()

    await sidebar.getByTitle('Colapsar menú').click()
    await expect(sidebar.getByText('Vigilancia Epidemiológica')).toBeHidden()

    await sidebar.getByTitle('Expandir menú').click()
    await expect(sidebar.getByText('Vigilancia Epidemiológica')).toBeVisible()
  })

  test('el selector de año está visible en el header', async ({ page }) => {
    const yearSelect = page.getByRole('combobox').first()
    await expect(yearSelect).toBeVisible()
    const currentYear = new Date().getFullYear().toString()
    await expect(yearSelect).toHaveValue(currentYear)
  })

  test('módulos con filtro de mes muestran selector en el header', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Cirugías Trazadoras').click()
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
    await page.getByTestId('sidebar').getByTitle('Menú de administración').click()
    await expect(page.getByText('Importar Excel')).toBeVisible()
    await expect(page.getByText('Usuarios')).toBeVisible()
    await expect(page.getByText('Configuración')).toBeVisible()
  })
})
