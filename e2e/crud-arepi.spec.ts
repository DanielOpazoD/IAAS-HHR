import { test, expect } from '@playwright/test'

test.describe('CRUD — AREpi (Agentes Riesgo Epidémico)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    // Navigate to AREpi
    await page.getByTestId('sidebar').getByText('AREpi').click()
    await expect(page.getByTestId('page-title')).toContainText('AREpi')
  })

  test('shows empty state when no records', async ({ page }) => {
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(page.getByTestId('empty-message')).toContainText('No hay')
  })

  test('creates a new record', async ({ page }) => {
    // Click add button
    await page.getByTestId('btn-add').click()

    // Modal should be visible
    await expect(page.getByTestId('modal')).toBeVisible()

    // Fill the form
    await page.getByLabel('Nombre del Paciente').fill('Juan Pérez')
    await page.getByLabel('RUT').fill('12.345.678-5')
    await page.getByLabel('Fecha VE').fill('2026-03-15')

    // Submit the form
    await page.getByTestId('btn-submit').click()

    // Modal should close
    await expect(page.getByTestId('modal')).toBeHidden()

    // The record should appear in the table
    await expect(page.getByTestId('data-table')).toBeVisible()
    await expect(page.getByText('Juan Pérez')).toBeVisible()
    await expect(page.getByText('12.345.678-5')).toBeVisible()
  })

  test('edits an existing record', async ({ page }) => {
    // First create a record
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('María González')
    await page.getByLabel('RUT').fill('11.111.111-1')
    await page.getByLabel('Fecha VE').fill('2026-02-10')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    // Click edit on the record
    await page.getByTestId('btn-edit').first().click()
    await expect(page.getByTestId('modal')).toBeVisible()

    // Change the name
    const nameInput = page.getByLabel('Nombre del Paciente')
    await nameInput.clear()
    await nameInput.fill('María González Updated')

    // Submit
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    // Verify updated text
    await expect(page.getByText('María González Updated')).toBeVisible()
  })

  test('deletes a record', async ({ page }) => {
    // Create a record
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('Carlos Muñoz')
    await page.getByLabel('RUT').fill('22.222.222-2')
    await page.getByLabel('Fecha VE').fill('2026-01-20')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    // Verify record exists
    await expect(page.getByText('Carlos Muñoz')).toBeVisible()

    // Click delete
    await page.getByTestId('btn-delete').first().click()

    // Confirm dialog should appear
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await page.getByTestId('btn-confirm').click()

    // Record should be gone — back to empty state
    await expect(page.getByText('Carlos Muñoz')).toBeHidden()
  })

  test('cancels form without saving', async ({ page }) => {
    await page.getByTestId('btn-add').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    await page.getByLabel('Nombre del Paciente').fill('No Guardar')
    await page.getByTestId('btn-cancel').click()

    await expect(page.getByTestId('modal')).toBeHidden()
    // Should still be empty
    await expect(page.getByTestId('empty-state')).toBeVisible()
  })

  test('closes modal with Escape key', async ({ page }) => {
    await page.getByTestId('btn-add').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('modal')).toBeHidden()
  })

  test('creates multiple records and shows table', async ({ page }) => {
    // Record 1
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('Paciente Uno')
    await page.getByLabel('RUT').fill('11.111.111-1')
    await page.getByLabel('Fecha VE').fill('2026-01-05')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    // Record 2
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('Paciente Dos')
    await page.getByLabel('RUT').fill('22.222.222-2')
    await page.getByLabel('Fecha VE').fill('2026-02-10')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    // Both should be in the table
    await expect(page.getByText('Paciente Uno')).toBeVisible()
    await expect(page.getByText('Paciente Dos')).toBeVisible()

    // Footer should show count
    await expect(page.getByText('2 registros')).toBeVisible()
  })
})
