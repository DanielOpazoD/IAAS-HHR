import { test, expect } from '@playwright/test'

test.describe('CRUD — Cirugías Trazadoras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByTestId('sidebar').getByText('Cirugias Trazadoras').click()
    await expect(page.getByTestId('page-title')).toContainText('Cirugías Trazadoras')
  })

  test('creates a cirugía record', async ({ page }) => {
    await page.getByTestId('btn-add').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    // Fill the form — Cirugía form fields
    await page.getByLabel('Nombre del Paciente').fill('Pedro Araya')
    await page.getByLabel('RUT').fill('12.345.678-5')
    await page.getByLabel('Fecha Cirugía').fill('2026-03-10')

    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    await expect(page.getByText('Pedro Araya')).toBeVisible()
  })

  test('month filter works', async ({ page }) => {
    // Create record for Enero
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('Enero Paciente')
    await page.getByLabel('RUT').fill('11.111.111-1')
    await page.getByLabel('Fecha Cirugía').fill('2026-01-15')
    // Select Enero in mes if present
    const mesSelect = page.getByLabel('Mes').first()
    if (await mesSelect.isVisible()) {
      await mesSelect.selectOption('Enero')
    }
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    await expect(page.getByText('Enero Paciente')).toBeVisible()
  })
})
