'use client'

import { useEffect, useState } from 'react'
import { systemAdminApi, collegeApi, departmentApi } from '@/lib/api'
import Combobox from '@/components/Combobox'

const ROLES = ['User', 'DepartmentHead', 'CollegeHead', 'Dean', 'President', 'TransportOffice', 'DeploymentTeam', 'MaintenanceTeam', 'Driver', 'Gate', 'SystemAdmin', 'Developer']

// Roles that need a college assignment
const COLLEGE_ROLES = ['Dean', 'CollegeHead']
// Roles that need both college + department
const DEPT_ROLES = ['DepartmentHead', 'User']

const ROLE_COLORS: Record<string, string> = {
  SystemAdmin: 'bg-red-100 text-red-700',
  Developer: 'bg-purple-100 text-purple-700',
  President: 'bg-yellow-100 text-yellow-700',
  Dean: 'bg-orange-100 text-orange-700',
  CollegeHead: 'bg-blue-100 text-blue-700',
  DepartmentHead: 'bg-indigo-100 text-indigo-700',
  TransportOffice: 'bg-teal-100 text-teal-700',
  DeploymentTeam: 'bg-cyan-100 text-cyan-700',
  MaintenanceTeam: 'bg-amber-100 text-amber-700',
  Driver: 'bg-green-100 text-green-700',
  User: 'bg-gray-100 text-gray-700',
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'User', phoneNumber: '', collegeId: '', departmentId: '' })
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkRole, setBulkRole] = useState('User')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Colleges and departments for assignment
  const [colleges, setColleges] = useState<any[]>([])
  const [allDepartments, setAllDepartments] = useState<any[]>([])
  const [filteredDepts, setFilteredDepts] = useState<any[]>([])

  useEffect(() => { loadUsers(); loadStructure() }, [])

  const loadStructure = async () => {
    try {
      const [cols, depts] = await Promise.all([collegeApi.getAll(), departmentApi.getAll()])
      setColleges(Array.isArray(cols) ? cols : [])
      setAllDepartments(Array.isArray(depts) ? depts : [])
    } catch {}
  }

  // When college changes in form, filter departments
  const handleCollegeChange = (collegeId: string) => {
    setForm(f => ({ ...f, collegeId, departmentId: '' }))
    if (collegeId) {
      setFilteredDepts(allDepartments.filter((d: any) => d.college?.id === collegeId))
    } else {
      setFilteredDepts(allDepartments)
    }
  }

  const needsCollege = (role: string) => COLLEGE_ROLES.includes(role) || DEPT_ROLES.includes(role)
  const needsDept = (role: string) => DEPT_ROLES.includes(role)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await systemAdminApi.getAllUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { showToast('Full name is required', 'error'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast('Please enter a valid email address', 'error'); return }
    if (form.password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return }
    if (needsCollege(form.role) && !form.collegeId) { showToast('Please select a college for this role', 'error'); return }
    if (needsDept(form.role) && !form.departmentId) { showToast('Please select a department for this role', 'error'); return }
    setActionLoading('create')
    try {
      await systemAdminApi.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phoneNumber: form.phoneNumber || undefined,
        ...(form.collegeId ? { collegeId: form.collegeId } : {}),
        ...(form.departmentId ? { departmentId: form.departmentId } : {}),
      })
      showToast('User created successfully', 'success')
      setShowCreateModal(false)
      setForm({ name: '', email: '', password: '', role: 'User', phoneNumber: '', collegeId: '', departmentId: '' })
      loadUsers()
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error')
    } finally { setActionLoading(null) }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setActionLoading('edit')
    try {
      await systemAdminApi.updateUser(selectedUser.id, {
        name: form.name,
        role: form.role,
        phoneNumber: form.phoneNumber || undefined,
        ...(form.collegeId ? { collegeId: form.collegeId } : {}),
        ...(form.departmentId ? { departmentId: form.departmentId } : {}),
      })
      showToast('User updated successfully', 'success')
      setShowEditModal(false)
      loadUsers()
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error')
    } finally { setActionLoading(null) }
  }

  const handleToggleStatus = async (user: any) => {
    setActionLoading(user.id)
    try {
      await systemAdminApi.toggleUserStatus(user.id, !user.isActive)
      showToast(`User ${user.isActive ? 'deactivated' : 'activated'}`, 'success')
      loadUsers()
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error')
    } finally { setActionLoading(null) }
  }

  const handleResetPassword = async (user: any) => {
    if (!confirm(`Reset password for ${user.name}? A new password will be sent to their email.`)) return
    setActionLoading(`reset-${user.id}`)
    try {
      await systemAdminApi.resetUserPassword(user.id)
      showToast('Password reset email sent', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error')
    } finally { setActionLoading(null) }
  }

  const handleDelete = async (user: any) => {
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return
    setActionLoading(`delete-${user.id}`)
    try {
      await systemAdminApi.deleteUser(user.id)
      showToast('User deleted', 'success')
      loadUsers()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error')
    } finally { setActionLoading(null) }
  }

  const openEdit = (user: any) => {
    setSelectedUser(user)
    const collegeId = user.college?.id || user.department?.college?.id || ''
    setForm({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'User', phoneNumber: user.phoneNumber || '', collegeId, departmentId: user.department?.id || '' })
    if (collegeId) setFilteredDepts(allDepartments.filter((d: any) => d.college?.id === collegeId))
    else setFilteredDepts(allDepartments)
    setShowEditModal(true)
  }

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkFile) return
    setBulkLoading(true)
    try {
      const text = await bulkFile.text()
      let users: any[]
      if (bulkFile.name.endsWith('.json')) {
        users = JSON.parse(text)
      } else {
        // Parse CSV
        const lines = text.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        users = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim())
          const obj: any = {}
          headers.forEach((h, i) => { obj[h] = vals[i] })
          if (!obj.role) obj.role = bulkRole
          return obj
        })
      }
      await systemAdminApi.bulkImportUsers(users)
      showToast(`${users.length} users imported successfully`, 'success')
      setShowBulkModal(false)
      setBulkFile(null)
      loadUsers()
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error')
    } finally { setBulkLoading(false) }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setExportLoading(true)
    try {
      const result = await systemAdminApi.exportUsers({ format, filters: { role: filterRole || undefined } })
      const content = format === 'json' ? JSON.stringify(result, null, 2) : result
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Export downloaded', 'success')
    } catch (err: any) {
      showToast(err.message || 'Export failed', 'error')
    } finally { setExportLoading(false) }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !filterRole || u.role === filterRole
    const matchStatus = !filterStatus || (filterStatus === 'active' ? u.isActive : !u.isActive)
    return matchSearch && matchRole && matchStatus
  })

  return (
    <div className="space-y-6 mt-2">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-[#1B3D2F]' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3D2F]">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} total users</p>
        </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setShowBulkModal(true)}
          className="px-4 py-2 border border-[#1B3D2F] text-[#1B3D2F] rounded-lg text-sm font-medium hover:bg-[#1B3D2F]/5 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Bulk Import
        </button>
        <button onClick={() => handleExport('csv')} disabled={exportLoading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
        <button onClick={() => { setForm({ name: '', email: '', password: '', role: 'User', phoneNumber: '' }); setShowCreateModal(true) }}
          className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add User
        </button>
      </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F] outline-none" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Combobox
              value={filterRole}
              onChange={setFilterRole}
              options={['', ...ROLES]}
              placeholder="Filter by role..."
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#1B3D2F]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Phone', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1B3D2F] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</p>
                          {(user.department?.name || user.college?.name) && (
                            <p className="text-[11px] text-gray-400">{user.department?.name || user.college?.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.phoneNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button onClick={() => openEdit(user)} className="text-xs text-[#1B3D2F] font-medium hover:underline">Edit</button>
                        <button onClick={() => handleToggleStatus(user)} disabled={actionLoading === user.id}
                          className={`text-xs font-medium hover:underline ${user.isActive ? 'text-orange-600' : 'text-green-600'}`}>
                          {actionLoading === user.id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleResetPassword(user)} disabled={actionLoading === `reset-${user.id}`}
                          className="text-xs text-blue-600 font-medium hover:underline hidden sm:inline">
                          {actionLoading === `reset-${user.id}` ? '...' : 'Reset Pwd'}
                        </button>
                        <button onClick={() => handleDelete(user)} disabled={actionLoading === `delete-${user.id}`}
                          className="text-xs text-red-600 font-medium hover:underline">
                          {actionLoading === `delete-${user.id}` ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create User</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {[['Full Name','name','text',true],['Email','email','email',true],['Password','password','password',true],['Phone Number','phoneNumber','tel',false]].map(([label,key,type,required]) => (
                  <div key={key as string}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label as string}</label>
                    <input type={type as string} value={(form as any)[key as string]} onChange={e => setForm(p => ({...p, [key as string]: e.target.value}))}
                      required={required as boolean} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F] outline-none text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <Combobox
                    value={form.role}
                    onChange={val => { setForm(p => ({...p, role: val, collegeId: '', departmentId: ''})); setFilteredDepts(allDepartments) }}
                    options={ROLES}
                    placeholder="Select role..."
                  />
                </div>
                {/* College — for Dean, CollegeHead, DepartmentHead, Employee */}
                {needsCollege(form.role) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College <span className="text-red-500">*</span></label>
                    <select value={form.collegeId} onChange={e => handleCollegeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm bg-white">
                      <option value="">— Select college —</option>
                      {colleges.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {/* Department — for DepartmentHead, Employee */}
                {needsDept(form.role) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                    <select value={form.departmentId} onChange={e => setForm(p => ({...p, departmentId: e.target.value}))}
                      disabled={!form.collegeId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400">
                      <option value="">{form.collegeId ? '— Select department —' : '— Select college first —'}</option>
                      {filteredDepts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={actionLoading === 'create'} className="flex-1 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] disabled:opacity-50">
                    {actionLoading === 'create' ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                {[['Full Name','name','text'],['Phone Number','phoneNumber','tel']].map(([label,key,type]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F] outline-none text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (read-only)</label>
                  <input type="email" value={form.email} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <Combobox
                    value={form.role}
                    onChange={val => { setForm(p => ({...p, role: val, collegeId: '', departmentId: ''})); setFilteredDepts(allDepartments) }}
                    options={ROLES}
                    placeholder="Select role..."
                  />
                </div>
                {/* College */}
                {needsCollege(form.role) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College <span className="text-red-500">*</span></label>
                    <select value={form.collegeId} onChange={e => handleCollegeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm bg-white">
                      <option value="">— Select college —</option>
                      {colleges.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {/* Department */}
                {needsDept(form.role) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                    <select value={form.departmentId} onChange={e => setForm(p => ({...p, departmentId: e.target.value}))}
                      disabled={!form.collegeId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400">
                      <option value="">{form.collegeId ? '— Select department —' : '— Select college first —'}</option>
                      {filteredDepts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={actionLoading === 'edit'} className="flex-1 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] disabled:opacity-50">
                    {actionLoading === 'edit' ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBulkModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bulk Import Users</h3>
                <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleBulkImport} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV or JSON file</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1B3D2F] transition-colors">
                    <input type="file" accept=".csv,.json" onChange={e => setBulkFile(e.target.files?.[0] || null)} className="hidden" id="bulkFileInput" />
                    <label htmlFor="bulkFileInput" className="cursor-pointer">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      {bulkFile ? <p className="text-sm font-medium text-[#1B3D2F]">{bulkFile.name}</p> : <p className="text-sm text-gray-500">Click to upload CSV or JSON</p>}
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">CSV must have columns: name, email, password. JSON must be an array of user objects.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Role (for CSV imports)</label>
                  <select value={bulkRole} onChange={e => setBulkRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={!bulkFile || bulkLoading} className="flex-1 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] disabled:opacity-50">
                    {bulkLoading ? 'Importing...' : 'Import Users'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
