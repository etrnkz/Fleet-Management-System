'use client'

import { useEffect, useMemo, useState } from 'react'
import { vehicleApi, driverApi } from '@/lib/api'

interface DocumentRow {
  id: string
  ownerType: 'Vehicle' | 'Driver'
  ownerName: string
  documentType: string
  expiryDate: string | null
  status: 'valid' | 'expiring' | 'expired' | 'unknown'
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

export default function DocumentsPage() {
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [vehicles, drivers] = await Promise.all([vehicleApi.getAll(), driverApi.getAll()])

        const vehicleRows: DocumentRow[] = (Array.isArray(vehicles) ? vehicles : []).flatMap((v: any) => {
          const items: DocumentRow[] = [
            {
              id: `vehicle-insurance-${v.id}`,
              ownerType: 'Vehicle',
              ownerName: `${v.plateNumber} (${v.make} ${v.model})`,
              documentType: 'Insurance',
              expiryDate: v.insuranceExpiryDate || null,
              status: getStatus(v.insuranceExpiryDate || null),
            },
          ]
          return items
        })

        const driverRows: DocumentRow[] = (Array.isArray(drivers) ? drivers : []).map((d: any) => ({
          id: `driver-license-${d.id}`,
          ownerType: 'Driver',
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
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      `${r.ownerName} ${r.documentType} ${r.ownerType}`.toLowerCase().includes(q),
    )
  }, [rows, search])

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-600">Live document status derived from vehicle and driver records.</p>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {loading && <div className="text-sm text-gray-600">Loading documents...</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.ownerName}</td>
                  <td className="px-4 py-3">{row.ownerType}</td>
                  <td className="px-4 py-3">{row.documentType}</td>
                  <td className="px-4 py-3">{row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-6 text-sm text-gray-500">No document records found.</div>}
        </div>
      )}
    </div>
  )
}
