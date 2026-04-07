'use client'

import { useState, useEffect } from 'react'
import { maintenanceApi } from '@/lib/api'

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveTarget, setApproveTarget] = useState<any>(null)
  const [scheduleNotes, setScheduleNotes] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [approving, setApproving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [maintenanceList, setMaintenanceList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMaintenance()
  }, [])

  const loadMaintenance = async () => {
    try {
      setError(null)
      const data = await maintenanceApi.getAllMaintenanceRequests()
      setMaintenanceList(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load maintenance records')
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'submitted': return { label: 'Submitted', color: 'bg-orange-100 text-orange-700' }
      case 'underinspection': return { label: 'Under Inspection', color: 'bg-yellow-100 text-yellow-700' }
      case 'estimateprovided': return { label: 'Estimate Provided', color: 'bg-purple-100 text-purple-700' }
      case 'budgetapproved': return { label: 'Budget Approved', color: 'bg-blue-100 text-blue-700' }
      case 'inprogress':
      case 'in progress': return { label: 'In Progress', color: 'bg-blue-100 text-blue-700' }
      case 'completed': return { label: 'Completed', color: 'bg-[#1B3D2F]/15 text-emerald-700' }
      case 'rejected': return { label: 'Rejected', color: 'bg-red-100 text-red-700' }
      case 'pending': return { label: 'Pending', color: 'bg-gray-100 text-gray-700' }
      case 'scheduled': return { label: 'Scheduled', color: 'bg-yellow-100 text-yellow-700' }
      default: return { label: status || 'Unknown', color: 'bg-gray-100 text-gray-700' }
    }
  }

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleViewDetails = (maintenance: any) => {
    setSelectedMaintenance(maintenance)
    setShowDetailsModal(true)
  }

  const handleApprove = (maintenance: any) => {
    setApproveTarget(maintenance)
    setScheduleNotes('')
    setEstimatedCost('')
    setShowApproveModal(true)
  }

  const handleApproveSubmit = async () => {
    if (!approveTarget) return
    setApproving(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || localStorage.getItem('access_token') : null
      // Step 1: inspect (moves to EstimateProvided)
      await fetch(`http://localhost:3000/api/v1/maintenance/${approveTarget.id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inspectionNotes: scheduleNotes || 'Approved by deployment office', estimatedCost: Number(estimatedCost) || 0 })
      })
      // Step 2: approve-budget (moves to BudgetApproved — driver can now start)
      await fetch(`http://localhost:3000/api/v1/maintenance/${approveTarget.id}/approve-budget`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      showNotification('Maintenance approved — driver will be notified to take vehicle for service', 'success')
      setShowApproveModal(false)
      loadMaintenance()
    } catch (err: any) {
      showNotification(err.message || 'Failed to approve', 'error')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async (maintenance: any) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || localStorage.getItem('access_token') : null
      await fetch(`http://localhost:3000/api/v1/maintenance/${maintenance.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason })
      })
      showNotification('Maintenance request rejected', 'success')
      loadMaintenance()
    } catch (err: any) {
      showNotification(err.message || 'Failed to reject', 'error')
    }
  }

  const getFilteredMaintenance = () => {
    return maintenanceList.filter(maintenance => {
      const vehicleName = maintenance.vehicleName || maintenance.vehicle?.model || maintenance.vehicle?.name || ''
      const vehiclePlate = maintenance.vehiclePlate || maintenance.vehicle?.plateNumber || maintenance.vehicle?.plate || ''
      const matchesSearch = searchQuery === '' ||
        (maintenance.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (maintenance.type || maintenance.maintenanceType || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' ||
        (maintenance.status || '').toLowerCase().replace(/\s/g, '') === statusFilter.toLowerCase().replace(/\s/g, '')
      return matchesSearch && matchesStatus
    })
  }

  const filteredMaintenance = getFilteredMaintenance()

  const stats = {
    total: maintenanceList.length,
    submitted: maintenanceList.filter(m => (m.status || '').toLowerCase() === 'submitted').length,
    inProgress: maintenanceList.filter(m => ['inprogress','in progress'].includes((m.status || '').toLowerCase())).length,
    completed: maintenanceList.filter(m => (m.status || '').toLowerCase() === 'completed').length,
    rejected: maintenanceList.filter(m => (m.status || '').toLowerCase() === 'rejected').length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${toastType === 'success' ? 'bg-[#152e22]' : 'bg-red-600'} text-white`}>
            {toastMessage}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Maintenance Management</h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage vehicle maintenance schedules</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <span className="text-xs md:text-sm text-gray-600">Total</span>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{stats.total}</h3>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <span className="text-xs md:text-sm text-gray-600">Submitted</span>
          <h3 className="text-2xl md:text-3xl font-bold text-orange-600 mt-2">{stats.submitted}</h3>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <span className="text-xs md:text-sm text-gray-600">In Progress</span>
          <h3 className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</h3>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <span className="text-xs md:text-sm text-gray-600">Completed</span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#152e22] mt-2">{stats.completed}</h3>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <span className="text-xs md:text-sm text-gray-600">Rejected</span>
          <h3 className="text-2xl md:text-3xl font-bold text-red-600 mt-2">{stats.rejected}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by ID, vehicle, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="underinspection">Under Inspection</option>
            <option value="estimateprovided">Estimate Provided</option>
            <option value="budgetapproved">Budget Approved</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={loadMaintenance} className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-xl p-12 text-center border border-red-200">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadMaintenance} className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22]">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredMaintenance.map((maintenance) => {
            const vehicleName = maintenance.vehicleName || maintenance.vehicle?.model || maintenance.vehicle?.name || 'Unknown Vehicle'
            const vehiclePlate = maintenance.vehiclePlate || maintenance.vehicle?.plateNumber || maintenance.vehicle?.plate || ''
            const maintenanceType = maintenance.type || maintenance.maintenanceType || maintenance.priority || 'N/A'
            const description = maintenance.description || maintenance.reason || maintenance.issueDescription || ''
            const scheduledDate = maintenance.scheduledDate || maintenance.scheduledAt || ''
            const requestedBy = maintenance.requestedBy || maintenance.requestedByUser?.name || maintenance.reportedBy?.user?.name || maintenance.reportedBy?.name || 'N/A'
            const { label: statusLabel, color: statusColor } = getStatusDisplay(maintenance.status)
            return (
              <div key={maintenance.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{maintenance.id}</h3>
                        <p className="text-sm text-gray-600">{vehicleName}{vehiclePlate ? ` • ${vehiclePlate}` : ''}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                      <span className="text-gray-700"><span className="font-medium">Type:</span> {maintenanceType}</span>
                      {scheduledDate && <span className="text-gray-700"><span className="font-medium">Scheduled:</span> {scheduledDate}</span>}
                      <span className="text-gray-700"><span className="font-medium">Requested by:</span> {requestedBy}</span>
                    </div>
                    {description && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(maintenance)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                    {(maintenance.status === 'Submitted') && (
                      <button
                        onClick={() => handleApprove(maintenance)}
                        className="px-4 py-2 bg-[#152e22] text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Approve & Schedule
                      </button>
                    )}
                    {(maintenance.status === 'Submitted' || maintenance.status === 'EstimateProvided') && (
                      <button
                        onClick={() => handleReject(maintenance)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && filteredMaintenance.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {showApproveModal && approveTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Approve & Schedule Maintenance</h3>
            <p className="text-sm text-gray-500 mb-4">Vehicle: {approveTarget.vehicle?.plateNumber || 'N/A'} — {approveTarget.issueDescription}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Cost (ETB)</label>
                <input type="number" min="0" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)}
                  placeholder="e.g. 2000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Schedule Notes (optional)</label>
                <textarea rows={2} value={scheduleNotes} onChange={e => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Take vehicle to workshop on Monday morning"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B3D2F] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleApproveSubmit} disabled={approving}
                className="flex-1 px-4 py-2 bg-[#152e22] text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
                {approving ? 'Approving...' : 'Approve & Notify Driver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Maintenance Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusDisplay(selectedMaintenance.status).color}`}>
                {getStatusDisplay(selectedMaintenance.status).label}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><span className="text-sm text-gray-600">Request ID</span><p className="font-medium">{selectedMaintenance.id}</p></div>
              <div><span className="text-sm text-gray-600">Type</span><p className="font-medium">{selectedMaintenance.type || selectedMaintenance.maintenanceType || 'N/A'}</p></div>
              <div><span className="text-sm text-gray-600">Vehicle</span><p className="font-medium">{selectedMaintenance.vehicleName || selectedMaintenance.vehicle?.model || 'N/A'}</p></div>
              <div><span className="text-sm text-gray-600">Scheduled</span><p className="font-medium">{selectedMaintenance.scheduledDate || selectedMaintenance.scheduledAt || 'N/A'}</p></div>
            </div>
            {(selectedMaintenance.description || selectedMaintenance.reason) && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Reason</h4>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedMaintenance.description || selectedMaintenance.reason}</p>
              </div>
            )}
            <button onClick={() => setShowDetailsModal(false)} className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
