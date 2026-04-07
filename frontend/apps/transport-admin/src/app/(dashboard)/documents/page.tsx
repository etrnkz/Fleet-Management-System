'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { vehicleApi, driverApi } from '@/lib/api'

interface DocumentRow {
  id: string
  ownerType: 'Vehicle' | 'Driver'
  ownerName: string
  documentType: string
  expiryDate: string | null
  status: 'valid' | 'expiring' | 'expired' | 'unknown'
  uploadedFile?: { name: string; url: string }
}

function getStatus(expiryDate: string | null): DocumentRow['status'] {
  if (!expiryDate) return 'unknown'
  const now = Date.now()
  const exp = new Date(expiryDate).getTime()
  if (exp < now) return 'expired'
  const days = (exp - now) / (1000 * 60 * 60 * 24)
  if (days <= 30) return 'expiring'
  return 'valid'
}

const statusColors: Record<string, string> = {
  valid: 'bg-green-100 text-green-700',
  expiring: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
  unknown: 'bg-gray-100 text-gray-600',
}

export default function DocumentsPage() {
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [vehicles, drivers] = await Promise.all([vehicleApi.getAll(), driverApi.getAll()])

        const vehicleRows: DocumentRow[] = (Array.isArray(vehicles) ? vehicles : []).flatMap((v: any) => ([
          {
            id: `vehicle-insurance-${v.id}`,
            ownerType: 'Vehicle' as const,
            ownerName: `${v.plateNumber} (${v.make} ${v.model})`,
            documentType: 'Insurance',
            expiryDate: v.insuranceExpiryDate || null,
            status: getStatus(v.insuranceExpiryDate || null),
          },
          {
            id: `vehicle-registration-${v.id}`,
            ownerType: 'Vehicle' as const,
            ownerName: `${v.plateNumber} (${v.make} ${v.model})`,
            documentType: 'Registration',
            expiryDate: null,
            status: 'unknown' as const,
          },
        ]))

        const driverRows: DocumentRow[] = (Array.isArray(drivers) ? drivers : []).map((d: any) => ({
          id: `driver-license-${d.id}`,
          ownerType: 'Driver' as const,
          ownerName: d.user?.name || d.licenseNumber || d.id,
          documentType: 'Driver License',
          expiryDate: d.licenseExpiry || null,
          status: getStatus(d.licenseExpiry || null),
        }))

        setRows([...vehicleRows, ...driverRows])
      } catch (err: any) {
        setError(err.message || 'Failed to load document records')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = rows
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus)
    const q = search.trim().toLowerCase()
    if (q) result = result.filter(r => `${r.ownerName} ${r.documentType} ${r.ownerType}`.toLowerCase().includes(q))
    return result
  }, [rows, search, filterStatus])

  const handleUploadClick = (id: string) => {
    setUploadingId(id)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingId) return
    const url = URL.createObjectURL(file)
    setRows(prev => prev.map(r => r.id === uploadingId ? { ...r, uploadedFile: { name: file.name, url } } : r))
    setToast(`"${file.name}" uploaded successfully`)
    setTimeout(() => setToast(null), 3000)
    setUploadingId(null)
    e.target.value = ''
  }

  const csvImportRef = useRef<HTMLInputElement>(null)

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter(Boolean)
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
      const imported: DocumentRow[] = lines.slice(1).map((line, i) => {
        const cols = line.split(',').map(c => c.replace(/"/g, '').trim())
        const get = (key: string) => cols[headers.indexOf(key)] || ''
        const expiry = get('expiry') && get('expiry') !== 'N/A' ? get('expiry') : null
        return {
          id: `imported-${Date.now()}-${i}`,
          ownerType: (get('type') as 'Vehicle' | 'Driver') || 'Vehicle',
          ownerName: get('owner'),
          documentType: get('document'),
          expiryDate: expiry,
          status: getStatus(expiry),
        }
      }).filter(r => r.ownerName)
      setRows(prev => [...prev, ...imported])
      setToast(`Imported ${imported.length} document records`)
      setTimeout(() => setToast(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExportCSV = () => {
    const headers = ['Owner', 'Type', 'Document', 'Expiry', 'Status', 'File']
    const csvRows = filtered.map(r => [
      r.ownerName, r.ownerType, r.documentType,
      r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : 'N/A',
      r.status,
      r.uploadedFile?.name || ''
    ])
    const csv = [headers, ...csvRows].map(row => row.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `documents-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const stats = {
    total: rows.length,
    valid: rows.filter(r => r.status === 'valid').length,
    expiring: rows.filter(r => r.status === 'expiring').length,
    expired: rows.filter(r => r.status === 'expired').length,
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1B3D2F] text-white px-5 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleFileChange} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500">Manage vehicle and driver documents</p>
        </div>
        <div className="flex gap-2">
          <input ref={csvImportRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          <button onClick={() => csvImportRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-[#1B3D2F] text-[#1B3D2F] rounded-lg hover:bg-[#1B3D2F]/10 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </button>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-50 border-gray-200' },
          { label: 'Valid', value: stats.valid, color: 'bg-green-50 border-green-200' },
          { label: 'Expiring Soon', value: stats.expiring, color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Expired', value: stats.expired, color: 'bg-red-50 border-red-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-xl p-4`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by owner or document type..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
        <div className="flex gap-2">
          {['all', 'valid', 'expiring', 'expired', 'unknown'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterStatus === f ? 'bg-[#1B3D2F] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500 py-8 text-center">Loading documents...</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.ownerName}</td>
                    <td className="px-4 py-3 text-gray-500">{row.ownerType}</td>
                    <td className="px-4 py-3 text-gray-700">{row.documentType}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.uploadedFile ? (
                        <a href={row.uploadedFile.url} download={row.uploadedFile.name}
                          className="flex items-center gap-1 text-[#1B3D2F] hover:text-[#1B3D2F] text-xs font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {row.uploadedFile.name.slice(0, 16)}...
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No file</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleUploadClick(row.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-[#1B3D2F]/10 hover:text-[#1B3D2F] text-gray-600 rounded-lg text-xs font-medium transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No documents found</div>}
          </div>
        </div>
      )}
    </div>
  )
}
