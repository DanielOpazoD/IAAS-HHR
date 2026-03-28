import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseExcelFile, ImportResult } from '@/services/excel/excelImport'
import { isFirebaseConfigured } from '@/config/firebase'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/utils/errors'
import { getLocalKey, loadLocal, saveLocal } from '@/utils/localStorage'
import * as firestoreService from '@/services/firestore'

export default function ImportPage() {
  const navigate = useNavigate()
  const { addToast } = useToastContext()
  const [result, setResult] = useState<ImportResult | null>(null)
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'replace' | 'merge'>('merge')

  const MAX_FILE_SIZE_MB = 10
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setDone(false)

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). El límite es ${MAX_FILE_SIZE_MB} MB.`)
      e.target.value = ''
      return
    }

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Solo se aceptan archivos Excel (.xlsx o .xls).')
      e.target.value = ''
      return
    }

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer
        const parsed = parseExcelFile(buffer)
        setResult(parsed)
      } catch (err: unknown) {
        setError(`Error al leer el archivo: ${getErrorMessage(err)}`)
      }
    }
    reader.readAsArrayBuffer(file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = result
    ? result.cirugias.length + result.partos.length + result.dip.length + result.arepi.length + result.registroIaas.length
    : 0

  const handleImport = async () => {
    if (!result) return
    setImporting(true)
    setError('')

    try {
      const { anio, cirugias, partos, dip, arepi, registroIaas } = result

      if (!isFirebaseConfigured) {
        const collections = [
          { key: 'cirugias', data: cirugias },
          { key: 'partos', data: partos },
          { key: 'dip', data: dip },
          { key: 'arepi', data: arepi },
          { key: 'registroIaas', data: registroIaas },
        ]

        for (const { key, data } of collections) {
          if (data.length === 0) continue
          const localKey = getLocalKey(key, anio)
          if (mode === 'replace') {
            saveLocal(localKey, data as unknown[])
          } else {
            const existing = loadLocal<Record<string, unknown>>(localKey)
            const existingKeys = new Set(existing.map((r) => `${r.rut}-${r.mes}-${r.nombre}`))
            const newItems = (data as unknown as Record<string, unknown>[]).filter((r) => !existingKeys.has(`${r.rut}-${r.mes}-${r.nombre}`))
            saveLocal(localKey, [...newItems, ...existing])
          }
        }
      } else {
        // Firebase mode
        const collections = [
          { name: 'cirugias', data: cirugias },
          { name: 'partos', data: partos },
          { name: 'dip', data: dip },
          { name: 'arepi', data: arepi },
          { name: 'registroIaas', data: registroIaas },
        ]

        for (const { name, data } of collections) {
          for (const item of data) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = item
            await firestoreService.create(name, rest as Record<string, unknown>)
          }
        }
      }

      setDone(true)
      addToast(`${total} registros importados correctamente`, 'success')
    } catch (err: unknown) {
      setError(`Error al importar: ${getErrorMessage(err)}`)
      addToast('Error al importar datos', 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Importar datos desde Excel</h1>

      {/* Upload zone */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex flex-col items-center">
          <svg className="w-12 h-12 text-primary-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600 mb-4">Selecciona la planilla Excel de Vigilancia Epidemiológica</p>
          <label className="cursor-pointer bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium">
            Seleccionar archivo .xlsx
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
          </label>
          {fileName && (
            <p className="mt-3 text-sm text-gray-500">
              Archivo: <span className="font-medium text-gray-700">{fileName}</span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {/* Preview */}
      {result && !done && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Vista previa - Datos {result.anio}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <PreviewCard label="Cirugías Trazadoras" count={result.cirugias.length} color="bg-blue-50 text-blue-700" />
            <PreviewCard label="Partos / Cesárea" count={result.partos.length} color="bg-pink-50 text-pink-700" />
            <PreviewCard label="DIP" count={result.dip.length} color="bg-amber-50 text-amber-700" />
            <PreviewCard label="AREpi" count={result.arepi.length} color="bg-purple-50 text-purple-700" />
            <PreviewCard label="Registro IAAS" count={result.registroIaas.length} color="bg-teal-50 text-teal-700" />
            <div className="p-4 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{total}</span>
              <span className="text-xs text-gray-500 mt-1">Total registros</span>
            </div>
          </div>

          {/* Detail tables */}
          {result.cirugias.length > 0 && (
            <DetailSection title="Cirugías Trazadoras" items={result.cirugias} columns={['mes', 'nombre', 'rut', 'tipoCirugia', 'fechaCirugia']} headers={['Mes', 'Nombre', 'RUT', 'Cirugía', 'Fecha']} />
          )}
          {result.partos.length > 0 && (
            <DetailSection title="Partos / Cesárea" items={result.partos} columns={['mes', 'nombre', 'rut', 'tipo', 'fechaParto']} headers={['Mes', 'Nombre', 'RUT', 'Tipo', 'Fecha']} />
          )}
          {result.dip.length > 0 && (
            <DetailSection title="DIP" items={result.dip} columns={['mes', 'nombre', 'rut', 'servicio', 'tipoDIP', 'totalDias']} headers={['Mes', 'Nombre', 'RUT', 'Servicio', 'DIP', 'Días']} />
          )}
          {result.arepi.length > 0 && (
            <DetailSection title="AREpi" items={result.arepi} columns={['fechaVE', 'nombre', 'rut', 'servicioClinico']} headers={['Fecha', 'Nombre', 'RUT', 'Servicio']} />
          )}
          {result.registroIaas.length > 0 && (
            <DetailSection title="Registro IAAS" items={result.registroIaas} columns={['mes', 'nombre', 'rut', 'iaas']} headers={['Mes', 'Nombre', 'RUT', 'IAAS']} />
          )}

          {/* Import options */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-6 mb-4">
              <span className="text-sm font-medium text-gray-700">Modo de importación:</span>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="mode" checked={mode === 'merge'} onChange={() => setMode('merge')} className="text-primary-600" />
                <span>Agregar sin duplicar</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} className="text-primary-600" />
                <span>Reemplazar todo</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={importing || total === 0}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {importing ? 'Importando...' : `Importar ${total} registros`}
              </button>
              <button
                onClick={() => { setResult(null); setFileName('') }}
                className="text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-lg font-semibold text-green-800 mb-1">Importación completada</h3>
          <p className="text-green-600 mb-4">Se importaron {total} registros para el año {result?.anio}.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ir al Dashboard
            </button>
            <button
              onClick={() => { setResult(null); setFileName(''); setDone(false) }}
              className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Importar otro archivo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`p-4 rounded-lg ${color} flex flex-col items-center`}>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs mt-1 text-center">{label}</span>
    </div>
  )
}

// Items typed loosely to accept any registry interface (TS interfaces lack index signatures)
function DetailSection<T extends object>({ title, items, columns, headers }: { title: string; items: readonly T[]; columns: string[]; headers: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? items : items.slice(0, 5)

  return (
    <div className="mb-4">
      <button onClick={() => setExpanded(!expanded)} className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1 hover:text-primary-600">
        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {title} ({items.length})
      </button>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h) => (
                <th key={h} className="px-3 py-1.5 text-left font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((item, i) => (
              <tr key={i} className="border-t border-gray-100">
                {columns.map((col) => (
                  <td key={col} className="px-3 py-1.5 text-gray-700">{String((item as Record<string, unknown>)[col] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {items.length > 5 && !expanded && (
          <button onClick={() => setExpanded(true)} className="text-xs text-primary-600 mt-1 hover:underline">
            Ver {items.length - 5} más...
          </button>
        )}
      </div>
    </div>
  )
}
