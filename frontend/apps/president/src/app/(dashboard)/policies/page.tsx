'use client'

import { useState } from 'react'

export default function PoliciesPage() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [editingPolicy, setEditingPolicy] = useState<any>(null)
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    category: 'Usage',
    description: '',
    rules: ['']
  })
  const [policyList, setPolicyList] = useState([
    {
      id: 1,
      title: 'Fleet Usage Policy',
      category: 'Usage',
      lastUpdated: '2024-05-15',
      status: 'Active',
      description: 'Guidelines for proper fleet vehicle usage and authorization',
      rules: [
        'All trips must be pre-approved by department head',
        'Maximum trip duration: 7 days',
        'Vehicles must be returned with full fuel tank',
        'No personal use of university vehicles',
        'Driver must have valid license and authorization'
      ]
    },
    {
      id: 2,
      title: 'Approval Thresholds',
      category: 'Approval',
      lastUpdated: '2024-06-01',
      status: 'Active',
      description: 'Authorization levels for different types of requests',
      rules: [
        'Trips under ETB 50,000: Dean approval required',
        'Trips ETB 50,000-100,000: President approval required',
        'International trips: Always require President approval',
        'Emergency requests: Expedited approval process',
        'VIP transport: Protocol office coordination required'
      ]
    },
    {
      id: 3,
      title: 'Maintenance Schedule',
      category: 'Maintenance',
      lastUpdated: '2024-04-20',
      status: 'Active',
      description: 'Regular maintenance and inspection requirements',
      rules: [
        'Oil change every 5,000 km',
        'Safety inspection every 6 months',
        'Tire rotation every 10,000 km',
        'Annual comprehensive inspection',
        'Immediate reporting of mechanical issues'
      ]
    },
    {
      id: 4,
      title: 'Emergency Protocols',
      category: 'Safety',
      lastUpdated: '2024-03-10',
      status: 'Active',
      description: 'Procedures for handling emergency situations',
      rules: [
        'Immediate notification to fleet manager',
        'Contact emergency services if needed',
        'Document incident with photos',
        'Complete incident report within 24 hours',
        'Vehicle inspection before return to service'
      ]
    },
    {
      id: 5,
      title: 'Driver Qualification',
      category: 'Safety',
      lastUpdated: '2024-02-15',
      status: 'Active',
      description: 'Requirements for authorized drivers',
      rules: [
        'Valid Ethiopian driving license',
        'Minimum 3 years driving experience',
        'Clean driving record',
        'Annual defensive driving training',
        'Medical fitness certificate'
      ]
    },
  ])

  // Toast notification handler
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Add new rule to policy
  const addRule = (isNewPolicy: boolean) => {
    if (isNewPolicy) {
      setNewPolicy({ ...newPolicy, rules: [...newPolicy.rules, ''] })
    } else if (editingPolicy) {
      setEditingPolicy({ ...editingPolicy, rules: [...editingPolicy.rules, ''] })
    }
  }

  // Remove rule from policy
  const removeRule = (index: number, isNewPolicy: boolean) => {
    if (isNewPolicy) {
      const updatedRules = newPolicy.rules.filter((_, i) => i !== index)
      setNewPolicy({ ...newPolicy, rules: updatedRules.length > 0 ? updatedRules : [''] })
    } else if (editingPolicy) {
      const updatedRules = editingPolicy.rules.filter((_: any, i: number) => i !== index)
      setEditingPolicy({ ...editingPolicy, rules: updatedRules.length > 0 ? updatedRules : [''] })
    }
  }

  // Update rule text
  const updateRule = (index: number, value: string, isNewPolicy: boolean) => {
    if (isNewPolicy) {
      const updatedRules = [...newPolicy.rules]
      updatedRules[index] = value
      setNewPolicy({ ...newPolicy, rules: updatedRules })
    } else if (editingPolicy) {
      const updatedRules = [...editingPolicy.rules]
      updatedRules[index] = value
      setEditingPolicy({ ...editingPolicy, rules: updatedRules })
    }
  }

  // Create new policy
  const handleCreatePolicy = () => {
    if (!newPolicy.title || !newPolicy.description) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    const validRules = newPolicy.rules.filter(rule => rule.trim() !== '')
    if (validRules.length === 0) {
      showNotification('Please add at least one rule', 'error')
      return
    }

    const policy = {
      id: policyList.length + 1,
      ...newPolicy,
      rules: validRules,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'Active'
    }

    setPolicyList([...policyList, policy])
    setShowNewPolicyModal(false)
    setNewPolicy({ title: '', category: 'Usage', description: '', rules: [''] })
    showNotification('Policy created successfully!')
  }

  // Open edit modal
  const handleEditPolicy = (policy: any) => {
    setEditingPolicy({ ...policy })
    setShowViewModal(false)
    setShowEditModal(true)
  }

  // Update existing policy
  const handleUpdatePolicy = () => {
    if (!editingPolicy.title || !editingPolicy.description) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    const validRules = editingPolicy.rules.filter((rule: string) => rule.trim() !== '')
    if (validRules.length === 0) {
      showNotification('Please add at least one rule', 'error')
      return
    }

    const updatedPolicies = policyList.map(p => 
      p.id === editingPolicy.id 
        ? { ...editingPolicy, rules: validRules, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    )

    setPolicyList(updatedPolicies)
    setShowEditModal(false)
    setEditingPolicy(null)
    showNotification('Policy updated successfully!')
  }

  // View policy details
  const handleViewPolicy = (policy: any) => {
    setSelectedPolicy(policy)
    setShowViewModal(true)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${toastType === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            {toastMessage}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Fleet Policies</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage fleet management policies and guidelines</p>
        </div>
        <button 
          onClick={() => setShowNewPolicyModal(true)}
          className="px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm md:text-base whitespace-nowrap"
        >
          + New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {policyList.map((policy) => (
          <div key={policy.id} className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1">{policy.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    {policy.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {policy.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleViewPolicy(policy)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <p className="text-xs md:text-sm text-gray-600 mb-4">{policy.description}</p>

            <div className="space-y-2">
              <p className="text-xs md:text-sm font-semibold text-gray-700">Key Rules:</p>
              <ul className="space-y-1">
                {policy.rules.slice(0, 3).map((rule, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-600 mt-1 flex-shrink-0">•</span>
                    <span className="text-xs md:text-sm text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
              {policy.rules.length > 3 && (
                <button className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  View all {policy.rules.length} rules →
                </button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Last updated: {policy.lastUpdated}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New Policy Modal */}
      {showNewPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Create New Policy</h3>
              <button
                onClick={() => {
                  setShowNewPolicyModal(false)
                  setNewPolicy({ title: '', category: 'Usage', description: '', rules: [''] })
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Title *</label>
                <input
                  type="text"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Fleet Usage Policy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={newPolicy.category}
                  onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Usage">Usage</option>
                  <option value="Approval">Approval</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Safety">Safety</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Brief description of the policy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Rules *</label>
                <div className="space-y-2">
                  {newPolicy.rules.map((rule, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value, true)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder={`Rule ${index + 1}`}
                      />
                      {newPolicy.rules.length > 1 && (
                        <button
                          onClick={() => removeRule(index, true)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addRule(true)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    + Add Rule
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowNewPolicyModal(false)
                  setNewPolicy({ title: '', category: 'Usage', description: '', rules: [''] })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePolicy}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm md:text-base"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Policy Modal */}
      {showViewModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">View Policy</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2">{selectedPolicy.title}</h4>
                <p className="text-sm md:text-base text-gray-600">{selectedPolicy.description}</p>
              </div>

              <div>
                <h5 className="text-sm md:text-base font-semibold text-gray-700 mb-3">Policy Rules:</h5>
                <ul className="space-y-2">
                  {selectedPolicy.rules.map((rule: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-emerald-600 mt-1 flex-shrink-0">{idx + 1}.</span>
                      <span className="text-sm md:text-base text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Close
              </button>
              <button 
                onClick={() => handleEditPolicy(selectedPolicy)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm md:text-base"
              >
                Edit Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {showEditModal && editingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Edit Policy</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingPolicy(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Title *</label>
                <input
                  type="text"
                  value={editingPolicy.title}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={editingPolicy.category}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Usage">Usage</option>
                  <option value="Approval">Approval</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Safety">Safety</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={editingPolicy.description}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Rules *</label>
                <div className="space-y-2">
                  {editingPolicy.rules.map((rule: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value, false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder={`Rule ${index + 1}`}
                      />
                      {editingPolicy.rules.length > 1 && (
                        <button
                          onClick={() => removeRule(index, false)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addRule(false)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    + Add Rule
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingPolicy(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePolicy}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm md:text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
