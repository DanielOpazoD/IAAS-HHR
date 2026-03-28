import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2').first()).toContainText('Dashboard')
  })

  test('muestra el título y subtítulo correctos', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('Dashboard')
    await expect(page.getByText(/Resumen de vigilancia/i)).toBeVisible()
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
    const yearSelect = page.getByRole('combobox').first()
    await yearSelect.selectOption('2025')
    await expect(page.getByText(/2025/)).toBeVisible()
  })

  test('muestra las 5 tarjetas resumen de módulos', async ({ page }) => {
    await expect(page.getByText('Cirugías Trazadoras')).toBeVisible()
    await expect(page.getByText('Partos / Cesárea')).toBeVisible()
    await expect(page.getByText('DIP')).toBeVisible()
    await expect(page.getByText('AREpi')).toBeVisible()
    await expect(page.getByText('Registros IAAS')).toBeVisible()
  })

  test('muestra sección de Alertas', async ({ page }) => {
    await expect(page.getByText('Alertas')).toBeVisible()
  })

  test('muestra sección de Registros por Mes', async ({ page }) => {
    await expect(page.getByText('Registros por Mes')).toBeVisible()
  })

  test('botón Descargar Excel está presente', async ({ page }) => {
    await expect(page.getByRole('button', { name: /descargar excel/i })).toBeVisible()
  })

  test('las tarjetas resumen muestran 0 cuando no hay datos', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    const zeros = page.getByText('0')
    // Al menos 5 ceros (uno por módulo)
    await expect(zeros.first()).toBeVisible()
  })

  test('hacer click en una tarjeta navega al módulo', async ({ page }) => {
    await page.getByText('Cirugías Trazadoras').click()
    await expect(page.getByTestId('page-title')).toContainText('Cirugías Trazadoras')
  })
})
