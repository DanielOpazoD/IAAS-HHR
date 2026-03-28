import { test, expect } from '@playwright/test'

test.describe('Vigilancia Epidemiológica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2').first()).toContainText('Vigilancia Epidemiológica')
  })

  test('muestra el título correcto', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('Vigilancia Epidemiológica')
    await expect(page.locator('main#main-content').getByText(/Hospital Hanga Roa/)).toBeVisible()
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

  test('muestra las tabs Resumen y Consolidación de Tasas', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Resumen' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Consolidación de Tasas' })).toBeVisible()
  })

  test('muestra las 5 tarjetas resumen de módulos en tab Resumen', async ({ page }) => {
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

  test('botón Descargar Excel está presente en tab Resumen', async ({ page }) => {
    await expect(page.getByRole('button', { name: /descargar excel/i })).toBeVisible()
  })

  test('tab Consolidación de Tasas carga el módulo de tasas', async ({ page }) => {
    await page.getByRole('button', { name: 'Consolidación de Tasas' }).click()
    const main = page.locator('main#main-content')
    await expect(main.getByText('Consolidación de Tasas')).toBeVisible()
    await expect(main.getByText('Vigilancia DIP')).toBeVisible()
  })

  test('las tarjetas resumen muestran contadores numéricos', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    const main = page.locator('main#main-content')
    const statNumbers = main.locator('.text-3xl, .text-2xl, [class*="font-bold"]').filter({ hasText: /^\d+$/ })
    await expect(statNumbers.first()).toBeVisible()
  })
})
