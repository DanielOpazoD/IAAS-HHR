import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToastContext } from '@/context/ToastContext'
import { isAdminRole, ROLE_PERMISSIONS, type UserProfile, type UserRole } from '@/types/roles'
import * as userService from '@/services/userService'
import type { Invitation } from '@/services/userService'
import { getErrorMessage } from '@/utils/errors'
import Icon from '@/components/ui/Icon'

const roleOptions = Object.entries(ROLE_PERMISSIONS).map(([key, val]) => ({
  value: key as UserRole,
  label: val.label,
}))

function AddUserForm({ onAdded }: { onAdded: () => void }) {
  const { user } = useAuth()
  const { addToast } = useToastContext()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('pabellon')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) return

    setSaving(true)
    try {
      await userService.createInvitation({
        email: trimmedEmail,
        displayName: name.trim(),
        role,
        invitedAt: new Date().toISOString(),
        invitedBy: user?.email ?? '',
      })
      addToast(`Invitacion enviada a ${trimmedEmail}`, 'success')
      setEmail('')
      setName('')
      setRole('pabellon')
      onAdded()
    } catch (err) {
      addToast(`Error al invitar usuario: ${getErrorMessage(err)}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon name="plus" className="w-4 h-4 text-primary-600" />
        Agregar nuevo usuario
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving || !email.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="plus" className="w-4 h-4" />
            {saving ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        El usuario podra ingresar con Google usando este email y tendra el rol asignado automaticamente.
      </p>
    </form>
  )
}

export default function AdminUsersPage() {
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToastContext()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      userService.getAllUsers(),
      userService.getAllInvitations(),
    ]).then(([u, inv]) => {
      setUsers(u)
      setInvitations(inv)
      setLoading(false)
    }).catch((err) => {
      addToast(`Error al cargar usuarios: ${getErrorMessage(err)}`, 'error')
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!isAdminRole(role)) {
      navigate('/', { replace: true })
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDeleteInvitation = async (email: string) => {
    try {
      await userService.deleteInvitationByEmail(email)
      setInvitations((prev) => prev.filter((inv) => inv.email !== email))
      addToast('Invitacion eliminada', 'success')
    } catch (err) {
      addToast(`Error: ${getErrorMessage(err)}`, 'error')
    }
  }

  if (!isAdminRole(role)) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Usuarios</h1>
        <p className="text-sm text-gray-500 mt-1">Administra los roles y permisos de los usuarios del sistema.</p>
      </div>

      {/* Add user form */}
      <AddUserForm onAdded={loadData} />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Active users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Usuarios activos ({users.length})</h3>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No hay usuarios registrados.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
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
                        {u.role ? (
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
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pending invitations */}
          {invitations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-amber-50">
                <h3 className="text-sm font-semibold text-amber-800">Invitaciones pendientes ({invitations.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Rol asignado</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Invitado</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.email} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{inv.displayName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                          {ROLE_PERMISSIONS[inv.role]?.label ?? inv.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(inv.invitedAt).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteInvitation(inv.email)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar invitacion"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
