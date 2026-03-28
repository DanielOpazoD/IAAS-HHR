import { test, expect } from '@playwright/test'

test.describe('CRUD — Cirugías Trazadoras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.getByTestId('sidebar').getByText('Cirugias Trazadoras').click()
    await expect(page.getByTestId('page-title')).toContainText('Cirugías Trazadoras')
  })

  test('muestra estado vacío cuando no hay registros', async ({ page }) => {
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(page.getByTestId('empty-message')).toContainText('No hay')
  })

  test('abre y cierra el modal al hacer click en Agregar', async ({ page }) => {
    await page.getByTestId('btn-add').click()
    await expect(page.getByTestId('modal')).toBeVisible()
    await page.getByTestId('btn-cancel').click()
    await expect(page.getByTestId('modal')).toBeHidden()
  })

  test('cierra el modal con la tecla Escape', async ({ page }) => {
    await page.getByTestId('btn-add').click()
    await expect(page.getByTestId('modal')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('modal')).toBeHidden()
  })

  test('crea un registro de cirugía', async ({ page }) => {
    await page.getByTestId('btn-add').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    await page.getByLabel('Nombre del Paciente').fill('Pedro Araya')
    await page.getByLabel('RUT').fill('12.345.678-5')
    await page.getByLabel('Fecha Cirugía').fill('2026-03-10')

    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()
    await expect(page.getByText('Pedro Araya')).toBeVisible()
  })

  test('edita un registro existente', async ({ page }) => {
    // Crear primero
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('Ana González')
    await page.getByLabel('RUT').fill('11.111.111-1')
    await page.getByLabel('Fecha Cirugía').fill('2026-01-20')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    // Editar
    await page.getByTestId('btn-edit').first().click()
    await expect(page.getByTestId('modal')).toBeVisible()

    const nameInput = page.getByLabel('Nombre del Paciente')
    await nameInput.clear()
    await nameInput.fill('Ana González Editada')

    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()
    await expect(page.getByText('Ana González Editada')).toBeVisible()
  })

  test('elimina un registro con confirmación', async ({ page }) => {
    // Crear
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('Carlos Muñoz')
    await page.getByLabel('RUT').fill('22.222.222-2')
    await page.getByLabel('Fecha Cirugía').fill('2026-02-05')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    // Eliminar
    await page.getByTestId('btn-delete').first().click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await page.getByTestId('btn-confirm').click()

    await expect(page.getByText('Carlos Muñoz')).toBeHidden()
    await expect(page.getByTestId('empty-state')).toBeVisible()
  })

  test('cancela el borrado cuando se rechaza la confirmación', async ({ page }) => {
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('María Pérez')
    await page.getByLabel('RUT').fill('11.111.111-1')
    await page.getByLabel('Fecha Cirugía').fill('2026-03-01')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    await page.getByTestId('btn-delete').first().click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await page.getByTestId('btn-cancel-confirm').click()

    // El registro debe seguir existiendo
    await expect(page.getByText('María Pérez')).toBeVisible()
  })

  test('el filtro de mes en el header funciona', async ({ page }) => {
    // Crear un registro de Enero
    await page.getByTestId('btn-add').click()
    await page.getByLabel('Nombre del Paciente').fill('Paciente Enero')
    await page.getByLabel('RUT').fill('11.111.111-1')
    await page.getByLabel('Fecha Cirugía').fill('2026-01-10')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('modal')).toBeHidden()

    // Seleccionar Febrero en el filtro del header — el registro no debe aparecer
    const monthSelect = page.getByRole('combobox').nth(1)
    await monthSelect.selectOption('Febrero')
    await expect(page.getByText('Paciente Enero')).toBeHidden()

    // Limpiar el filtro — el registro vuelve a aparecer
    await monthSelect.selectOption('')
    await expect(page.getByText('Paciente Enero')).toBeVisible()
  })

  test('crea múltiples registros y muestra la tabla correctamente', async ({ page }) => {
    for (const [nombre, rut, fecha] of [
      ['Paciente Uno', '11.111.111-1', '2026-01-05'],
      ['Paciente Dos', '22.222.222-2', '2026-02-10'],
      ['Paciente Tres', '11.111.111-1', '2026-03-15'],
    ]) {
      await page.getByTestId('btn-add').click()
      await page.getByLabel('Nombre del Paciente').fill(nombre)
      await page.getByLabel('RUT').fill(rut)
      await page.getByLabel('Fecha Cirugía').fill(fecha)
      await page.getByTestId('btn-submit').click()
      await expect(page.getByTestId('modal')).toBeHidden()
    }

    await expect(page.getByText('Paciente Uno')).toBeVisible()
    await expect(page.getByText('Paciente Dos')).toBeVisible()
    await expect(page.getByText('Paciente Tres')).toBeVisible()
    await expect(page.getByTestId('data-table')).toBeVisible()
  })
})
