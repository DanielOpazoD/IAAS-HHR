import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToastContext } from '@/context/ToastContext'
import * as userService from '@/services/userService'
import { ROLE_PERMISSIONS } from '@/types/roles'
import type { UserProfile, UserRole } from '@/types/roles'
import { getErrorMessage } from '@/utils/errors'

const roleOptions = Object.entries(ROLE_PERMISSIONS).map(([key, val]) => ({
  value: key as UserRole,
  label: val.label,
}))

export default function AdminUsersPage() {
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToastContext()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/', { replace: true })
      return
    }
    userService.getAllUsers().then((u) => {
      setUsers(u)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [role, navigate])

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await userService.updateUserRole(uid, newRole)
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: newRole } : u))
      addToast('Rol actualizado correctamente', 'success')
    } catch (err) {
      addToast(`Error al actualizar rol: ${getErrorMessage(err)}`, 'error')
    }
  }

  if (role !== 'admin') return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Usuarios</h1>
        <p className="text-sm text-gray-500 mt-1">Administra los roles y permisos de los usuarios del sistema.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Fecha registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.displayName || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                      disabled={u.uid === user?.uid}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
