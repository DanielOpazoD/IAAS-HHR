import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2').first()).toContainText('Dashboard')
  })

  test('muestra el título y subtítulo correctos', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('Dashboard')
    await expect(page.getByText('Resumen de vigilancia epidemiológica IAAS')).toBeVisible()
  })

  test('muestra indicador de modo demo', async ({ page }) => {
    await expect(page.getByText(/demo/i)).toBeVisible()
  })

  test('selector de año está presente y tiene el año actual', async ({ page }) => {
    const yearSelect = page.getByRole('combobox').first()
    await expect(yearSelect).toBeVisible()
    const currentYear = new Date().getFullYear().toString()
    await expect(yearSelect).toHaveValue(currentYear)
  })

  test('cambiar el año actualiza el subtítulo', async ({ page }) => {
    await page.getByRole('combobox').first().selectOption('2025')
    // The subtitle is unique enough to avoid strict mode
    await expect(page.getByText('Resumen de vigilancia epidemiológica IAAS - 2025')).toBeVisible()
  })

  test('muestra las 5 tarjetas resumen de módulos', async ({ page }) => {
    // Scope to main to avoid matching the sidebar nav items
    const main = page.locator('main#main-content')
    await expect(main.getByText('Cirugías Trazadoras')).toBeVisible()
    await expect(main.getByText('Partos / Cesárea')).toBeVisible()
    await expect(main.getByText('DIP')).toBeVisible()
    await expect(main.getByText('AREpi')).toBeVisible()
    await expect(main.getByText('Registros IAAS')).toBeVisible()
  })

  test('muestra sección de Alertas', async ({ page }) => {
    const main = page.locator('main#main-content')
    await expect(main.getByRole('heading', { name: 'Alertas' })).toBeVisible()
  })

  test('muestra sección de Registros por Mes', async ({ page }) => {
    const main = page.locator('main#main-content')
    await expect(main.getByRole('heading', { name: 'Registros por Mes' })).toBeVisible()
  })

  test('botón Descargar Excel está presente', async ({ page }) => {
    await expect(page.getByRole('button', { name: /descargar excel/i })).toBeVisible()
  })

  test('las tarjetas resumen muestran contadores numéricos', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    // Each stat card shows a number — scoped to main to avoid option elements
    const main = page.locator('main#main-content')
    // All counts should be 0 (no data), visible as text in the stat cards
    const statNumbers = main.locator('.text-3xl, .text-2xl, [class*="font-bold"]').filter({ hasText: /^\d+$/ })
    await expect(statNumbers.first()).toBeVisible()
  })
})
