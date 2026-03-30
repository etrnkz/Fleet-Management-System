'use client'

import { useState, useEffect } from 'react'
import { maintenanceApi, vehicleApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'

// TypeScript interfaces
interface MaintenanceRequest {
  id: string
  requestNumber: string
  vehicle: {
    id: string
    plateNumber: string
    make: string
    model: string
  }
  submittedBy: {
    name: string
    email: string
  }
  issueDescription: string
  priority: string
  status: string
  inspectionNotes?: string
  inspectedBy?: { name: string }
  inspectedAt?: string
  estimatedCost?: number
  actualCost?: number
  approvedBy?: { name: string }
  approvedAt?: string
  completionNotes?: string
  completedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

interface Vehicle {
  id: string
  plateNumber: string
  make: string
  model: string
  status: string
}

export default function MaintenancePage() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [filterByStatus, setFilterByStatus] = useState<string | null>(null)
  const [showNewMaintenanceForm, setShowNewMaintenanceForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  
  // New Maintenance Form State
  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicleId: '',
    issueDescription: '',
    priority: 'Medium',
  })

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [filterByStatus])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch maintenance requests
      const requests = await maintenanceApi.getAll(filterByStatus || undefined) as MaintenanceRequest[]
      setMaintenanceRequests(requests)

      // Fetch vehicles
      const vehiclesData = await vehicleApi.getAll() as Vehicle[]
      setVehicles(vehiclesData)
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to fetch maintenance data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Handle new maintenance form submission
  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await maintenanceApi.create(maintenanceForm)
      setToast({ message: 'Maintenance request created successfully', type: 'success' })
      setShowNewMaintenanceForm(false)
      setMaintenanceForm({
        vehicleId: '',
        issueDescription: '',
        priority: 'Medium',
      })
      fetchData()
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to create maintenance request', type: 'error' })
    }
  }

  // Map status to display info
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      'Submitted': { text: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      'UnderInspection': { text: 'Under Inspection', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      'EstimateProvided': { text: 'Estimate Provided', color: 'text-purple-700', bgColor: 'bg-purple-100' },
      'BudgetApproved': { text: 'Budget Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
      'InProgress': { text: 'In Progress', color: 'text-orange-700', bgColor: 'bg-orange-100' },
      'Completed': { text: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100' },
      'Rejected': { text: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
    }
    return statusMap[status] || { text: status, color: 'text-gray-700', bgColor: 'bg-gray-100' }
  }

  // Map priority to display info
  const getPriorityInfo = (priority: string) => {
    const priorityMap: Record<string, { color: string; bgColor: string }> = {
      'Low': { color: 'text-gray-700', bgColor: 'bg-gray-100' },
      'Medium': { color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      'High': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
      'Critical': { color: 'text-red-700', bgColor: 'bg-red-100' },
    }
    return priorityMap[priority] || { color: 'text-gray-700', bgColor: 'bg-gray-100' }
  }

  // Calculate statistics
  const stats = {
    total: maintenanceRequests.length,
    submitted: maintenanceRequests.filter(r => r.status === 'Submitted').length,
    inProgress: maintenanceRequests.filter(r => r.status === 'InProgress').length,
    completed: maintenanceRequests.filter(r => r.status === 'Completed').length,
    critical: maintenanceRequests.filter(r => r.priority === 'Critical').length,
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading maintenance data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-3 md:p-6 h-full overflow-y-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="flex flex-col gap-4 md:gap-6 pb-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Maintenance Overview</h1>
              <p className="text-xs md:text-sm text-gray-500">Manage and track vehicle maintenance requests</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <button 
                onClick={() => setFilterByStatus(filterByStatus === 'InProgress' ? null : 'InProgress')}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border-2 rounded-lg transition-colors text-xs md:text-sm ${
                  filterByStatus === 'InProgress' 
                    ? 'bg-orange-50 border-orange-500' 
                    : 'bg-white border-orange-500 hover:bg-orange-50'
                }`}
              >
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-500 rounded-full shadow-sm"></span>
                <span className="font-medium text-gray-900 whitespace-nowrap">In Progress</span>
              </button>
              <button 
                onClick={() => setFilterByStatus(filterByStatus === 'Submitted' ? null : 'Submitted')}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border-2 rounded-lg transition-colors text-xs md:text-sm ${
                  filterByStatus === 'Submitted' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-white border-blue-500 hover:bg-blue-50'
                }`}
              >
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full shadow-sm"></span>
                <span className="font-medium text-gray-900 whitespace-nowrap">Submitted</span>
              </button>
              <button 
                onClick={() => setShowNewMaintenanceForm(true)}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs md:text-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">New Maintenance Request</span>
                <span className="sm:hidden">New Request</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">Total Requests</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">Submitted</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.submitted}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">In Progress</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-600">{stats.inProgress}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">Completed</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">Critical</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>

          {/* Maintenance Requests Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Maintenance Requests</h2>
            </div>

            {maintenanceRequests.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 font-medium">No maintenance requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Request #
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Issue
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estimated Cost
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {maintenanceRequests.map((request) => {
                      const statusInfo = getStatusInfo(request.status)
                      const priorityInfo = getPriorityInfo(request.priority)
                      return (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <span className="text-xs md:text-sm font-semibold text-gray-900">
                              {request.requestNumber}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <div>
                              <p className="text-xs md:text-sm font-semibold text-gray-900">
                                {request.vehicle.plateNumber}
                              </p>
                              <p className="text-[10px] md:text-xs text-gray-500">
                                {request.vehicle.make} {request.vehicle.model}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span className="text-xs md:text-sm text-gray-900 line-clamp-2">
                              {request.issueDescription}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}>
                              {request.priority}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <span className="text-xs md:text-sm font-semibold text-gray-900">
                              {request.estimatedCost ? formatCurrency(request.estimatedCost) : '-'}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <span className="text-xs md:text-sm text-gray-600">
                              {formatDate(request.createdAt)}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Maintenance Request Modal */}
      {showNewMaintenanceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Maintenance Request</h2>
              <button
                onClick={() => setShowNewMaintenanceForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitMaintenance} className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={maintenanceForm.vehicleId}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, vehicleId: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={maintenanceForm.issueDescription}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, issueDescription: e.target.value})}
                  placeholder="Describe the maintenance issue..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, priority: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewMaintenanceForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 md:px-6 py-3 md:py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Maintenance Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Request Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Request #{selectedRequest.requestNumber}</h3>
                <p className="text-sm text-gray-600">Created on {formatDate(selectedRequest.createdAt)}</p>
              </div>

              {/* Vehicle & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRequest.vehicle.plateNumber}</p>
                  <p className="text-xs text-gray-600">{selectedRequest.vehicle.make} {selectedRequest.vehicle.model}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedRequest.status).bgColor} ${getStatusInfo(selectedRequest.status).color}`}>
                    {getStatusInfo(selectedRequest.status).text}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityInfo(selectedRequest.priority).bgColor} ${getPriorityInfo(selectedRequest.priority).color}`}>
                    {selectedRequest.priority}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRequest.submittedBy.name}</p>
                  <p className="text-xs text-gray-600">{selectedRequest.submittedBy.email}</p>
                </div>
              </div>

              {/* Issue Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Issue Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">
                  {selectedRequest.issueDescription}
                </p>
              </div>

              {/* Inspection Info */}
              {selectedRequest.inspectionNotes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Inspection Notes</h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">
                    {selectedRequest.inspectionNotes}
                  </p>
                  {selectedRequest.inspectedBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Inspected by {selectedRequest.inspectedBy.name} on {formatDate(selectedRequest.inspectedAt!)}
                    </p>
                  )}
                </div>
              )}

              {/* Cost Info */}
              {(selectedRequest.estimatedCost || selectedRequest.actualCost) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {selectedRequest.estimatedCost && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-blue-600 mb-1">Estimated Cost</p>
                      <p className="text-lg font-bold text-blue-700">
                        {formatCurrency(selectedRequest.estimatedCost)}
                      </p>
                    </div>
                  )}
                  {selectedRequest.actualCost && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-green-600 mb-1">Actual Cost</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(selectedRequest.actualCost)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Completion Info */}
              {selectedRequest.completionNotes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Completion Notes</h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">
                    {selectedRequest.completionNotes}
                  </p>
                  {selectedRequest.completedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Completed on {formatDate(selectedRequest.completedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Rejection Info */}
              {selectedRequest.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Rejection Reason</h4>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
