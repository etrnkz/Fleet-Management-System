'use client'

import { useState } from 'react'
import Toast, { ToastType } from '@/components/Toast'

interface ToastMessage {
  message: string
  type: ToastType
}

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All Stat')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDocumentDetail, setShowDocumentDetail] = useState<any>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showBulkRenewal, setShowBulkRenewal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [uploadForm, setUploadForm] = useState({
    documentType: 'Vehicle Insurance',
    linkedEntity: '',
    issueDate: '',
    expiryDate: '',
    issuedBy: '',
    referenceNumber: '',
    file: null as File | null
  })

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const allDocuments = [
    {
      id: 'doc-001',
      name: 'VHL-01',
      subName: 'INS - 009',
      linkedEntity: 'VHL-01',
      issueDate: '01.02.2024',
      expireDate: '04.12.2024',
      daysRemaining: 54,
      status: 'valid',
      statusColor: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500',
      type: 'Vehicle Insurance',
      category: 'Vehicle Documents',
      documentType: 'Vehicle Insurance Policy',
      issuedBy: 'Ethiopian Insurance Corporation',
      policyNumber: 'INS-009-2024',
      coverageAmount: '500,000 ETB',
      uploadedBy: 'Admin User',
      uploadedAt: '01.02.2024 10:30 AM',
      fileSize: '2.4 MB',
      fileType: 'PDF'
    },
    {
      id: 'doc-002',
      name: 'VHL-02',
      subName: 'INS - 009',
      linkedEntity: 'VHL-02',
      issueDate: '01.02.2024',
      expireDate: '04.12.2024',
      daysRemaining: 12,
      status: 'expires soon',
      statusColor: 'bg-yellow-100 text-yellow-700',
      dotColor: 'bg-yellow-500',
      type: 'Vehicle Insurance',
      category: 'Vehicle Documents',
      documentType: 'Vehicle Insurance Policy',
      issuedBy: 'Ethiopian Insurance Corporation',
      policyNumber: 'INS-009-2024',
      coverageAmount: '500,000 ETB',
      uploadedBy: 'Admin User',
      uploadedAt: '01.02.2024 10:30 AM',
      fileSize: '2.1 MB',
      fileType: 'PDF'
    },
    {
      id: 'doc-003',
      name: 'VHL-03',
      subName: 'INS - 009',
      linkedEntity: 'VHL-03',
      issueDate: '01.02.2024',
      expireDate: '04.12.2024',
      daysRemaining: -5,
      status: 'expired',
      statusColor: 'bg-red-100 text-red-700',
      dotColor: 'bg-red-500',
      type: 'Vehicle Insurance',
      category: 'Vehicle Documents',
      documentType: 'Vehicle Insurance Policy',
      issuedBy: 'Ethiopian Insurance Corporation',
      policyNumber: 'INS-009-2024',
      coverageAmount: '500,000 ETB',
      uploadedBy: 'Admin User',
      uploadedAt: '01.02.2024 10:30 AM',
      fileSize: '2.3 MB',
      fileType: 'PDF'
    },
    {
      id: 'doc-004',
      name: 'VHL-01',
      subName: 'REG - 007',
      linkedEntity: 'VHL-01',
      issueDate: '01.02.2024',
      expireDate: '04.12.2025',
      daysRemaining: 420,
      status: 'valid',
      statusColor: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500',
      type: 'Vehicle Registration',
      category: 'Vehicle Documents',
      documentType: 'Vehicle Registration Certificate',
      issuedBy: 'Transport Authority',
      policyNumber: 'REG-007-2024',
      coverageAmount: 'N/A',
      uploadedBy: 'Admin User',
      uploadedAt: '01.02.2024 11:00 AM',
      fileSize: '1.8 MB',
      fileType: 'PDF'
    },
    {
      id: 'doc-005',
      name: 'DRV-001',
      subName: 'John Doe',
      linkedEntity: 'John Doe',
      issueDate: '15.01.2024',
      expireDate: '15.01.2029',
      daysRemaining: 1825,
      status: 'valid',
      statusColor: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500',
      type: 'Driver License',
      category: 'Driver Documents',
      documentType: 'Commercial Driver License',
      issuedBy: 'Transport Authority',
      policyNumber: 'LIC-123-2024',
      coverageAmount: 'N/A',
      uploadedBy: 'HR Manager',
      uploadedAt: '15.01.2024 2:15 PM',
      fileSize: '0.8 MB',
      fileType: 'PDF',
      driverDetails: {
        fullName: 'John Doe',
        photo: '/placeholder-driver.jpg',
        licenseNumber: 'LIC-123-2024',
        licenseClass: 'Class A - Heavy Vehicles',
        dateOfBirth: '15.05.1985',
        bloodGroup: 'O+',
        address: '123 Main Street, Addis Ababa',
        phone: '+251-911-234567',
        email: 'john.doe@example.com',
        emergencyContact: 'Jane Doe - +251-911-234568',
        education: 'High School Diploma',
        educationCertificate: 'Grade 12 Certificate - 2003',
        drivingExperience: '15 years',
        previousEmployer: 'ABC Transport Company',
        trainingCertificates: ['Defensive Driving Course', 'First Aid Training', 'Heavy Vehicle Operation'],
        medicalCertificate: 'Valid until 10.03.2025',
        backgroundCheck: 'Cleared - 10.01.2024',
        employmentDate: '01.02.2024',
        contractType: 'Permanent',
        violations: 'None',
        accidents: 'None in last 5 years'
      }
    },
    {
      id: 'doc-006',
      name: 'DRV-002',
      subName: 'Jane Smith',
      linkedEntity: 'Jane Smith',
      issueDate: '10.03.2024',
      expireDate: '10.03.2025',
      daysRemaining: 280,
      status: 'valid',
      statusColor: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500',
      type: 'Medical Certificate',
      category: 'Driver Documents',
      documentType: 'Driver Medical Fitness Certificate',
      issuedBy: 'Authorized Medical Center',
      policyNumber: 'MED-456-2024',
      coverageAmount: 'N/A',
      uploadedBy: 'HR Manager',
      uploadedAt: '10.03.2024 9:45 AM',
      fileSize: '0.5 MB',
      fileType: 'PDF',
      driverDetails: {
        fullName: 'Jane Smith',
        photo: '/placeholder-driver.jpg',
        licenseNumber: 'LIC-456-2024',
        licenseClass: 'Class B - Medium Vehicles',
        dateOfBirth: '22.08.1990',
        bloodGroup: 'A+',
        address: '456 Park Avenue, Addis Ababa',
        phone: '+251-911-345678',
        email: 'jane.smith@example.com',
        emergencyContact: 'John Smith - +251-911-345679',
        education: 'Bachelor Degree in Business',
        educationCertificate: 'BA Degree - 2012',
        drivingExperience: '8 years',
        previousEmployer: 'XYZ Logistics',
        trainingCertificates: ['Customer Service Training', 'Safe Driving Course', 'Vehicle Maintenance Basics'],
        medicalCertificate: 'Valid until 10.03.2025',
        backgroundCheck: 'Cleared - 05.03.2024',
        employmentDate: '15.03.2024',
        contractType: 'Contract',
        violations: 'None',
        accidents: 'None'
      }
    },
    {
      id: 'doc-007',
      name: 'VHL-04',
      subName: 'INSP - 789',
      linkedEntity: 'VHL-04',
      issueDate: '20.02.2024',
      expireDate: '20.02.2025',
      daysRemaining: 320,
      status: 'valid',
      statusColor: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500',
      type: 'Safety Inspection',
      category: 'Compliance',
      documentType: 'Annual Safety Inspection Certificate',
      issuedBy: 'Certified Inspection Center',
      policyNumber: 'INSP-789-2024',
      coverageAmount: 'N/A',
      uploadedBy: 'Maintenance Manager',
      uploadedAt: '20.02.2024 3:30 PM',
      fileSize: '1.2 MB',
      fileType: 'PDF'
    },
    {
      id: 'doc-008',
      name: 'FLEET',
      subName: 'PERMIT - 001',
      linkedEntity: 'Fleet Operations',
      issueDate: '01.01.2024',
      expireDate: '31.12.2024',
      daysRemaining: 280,
      status: 'valid',
      statusColor: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500',
      type: 'Operating Permit',
      category: 'Compliance',
      documentType: 'Commercial Fleet Operating Permit',
      issuedBy: 'Ministry of Transport',
      policyNumber: 'PERMIT-001-2024',
      coverageAmount: 'N/A',
      uploadedBy: 'Admin User',
      uploadedAt: '01.01.2024 8:00 AM',
      fileSize: '3.5 MB',
      fileType: 'PDF'
    }
  ]

  // Filter documents
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesTab = activeTab === 'All' || doc.category === activeTab
    const matchesStatus = filterStatus === 'All Stat' || doc.status === filterStatus.toLowerCase()
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.linkedEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesTab && matchesStatus && matchesSearch
  })

  const totalDocuments = allDocuments.length
  const expiredDocuments = allDocuments.filter(d => d.status === 'expired').length
  const expiringSoon = allDocuments.filter(d => d.daysRemaining > 0 && d.daysRemaining <= 30).length

  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage)

  // Handle viewing driver profile
  const handleViewDriverProfile = (doc: any) => {
    if (doc.category === 'Driver Documents' && doc.driverDetails) {
      setSelectedDriver(doc.driverDetails)
      setViewMode('detail')
    } else {
      setShowDocumentDetail(doc)
    }
  }

  // Toggle document selection
  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    )
  }

  // Select all documents
  const toggleSelectAll = () => {
    if (selectedDocuments.length === paginatedDocuments.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(paginatedDocuments.map(doc => doc.id))
    }
  }

  // Handle upload
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    showToast(`Document uploaded successfully! Type: ${uploadForm.documentType}, Entity: ${uploadForm.linkedEntity}, Expiry: ${uploadForm.expiryDate}`, 'success')
    setShowUploadModal(false)
    setUploadForm({
      documentType: 'Vehicle Insurance',
      linkedEntity: '',
      issueDate: '',
      expiryDate: '',
      issuedBy: '',
      referenceNumber: '',
      file: null
    })
  }

  // Handle bulk renewal
  const handleBulkRenewal = () => {
    const selectedDocs = allDocuments.filter(doc => selectedDocuments.includes(doc.id))
    showToast(`Bulk renewal initiated for ${selectedDocs.length} documents`, 'success')
    setShowBulkRenewal(false)
    setSelectedDocuments([])
  }

  return (
    <>
    <div className="p-3 md:p-6 h-full overflow-y-auto">
      {viewMode === 'list' ? (
        <div className="flex flex-col gap-4 md:gap-6 pb-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Document Vault and Expirations</h1>
              <p className="text-xs md:text-sm text-gray-500">Centralized filing cabinet for insurance, registration and licenses.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs md:text-sm"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </button>
            {selectedDocuments.length > 0 && (
              <button 
                onClick={() => setShowBulkRenewal(true)}
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-xs md:text-sm"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Bulk Renewal ({selectedDocuments.length})
              </button>
            )}
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-0 mb-4 md:mb-6">
            <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 lg:pb-0">
              {['All', 'Vehicle Documents', 'Driver Documents', 'Compliance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setCurrentPage(1)
                  }}
                  className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-64 pl-9 md:pl-10 pr-3 md:pr-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto pl-9 md:pl-10 pr-8 md:pr-10 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white"
                >
                  <option>All Stat</option>
                  <option>valid</option>
                  <option>expires soon</option>
                  <option>expired</option>
                </select>
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>

              <button
                onClick={() => {
                  const csv = [
                    ['Document Name', 'Linked Entity', 'Type', 'Issue Date', 'Expire Date', 'Status'],
                    ...filteredDocuments.map(d => [d.name, d.linkedEntity, d.type, d.issueDate, d.expireDate, d.status])
                  ].map(row => row.join(',')).join('\n')
                  
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'documents-report.csv'
                  a.click()
                  window.URL.revokeObjectURL(url)
                }}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Export to CSV"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <p className="text-xs md:text-sm text-gray-600">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length} Documents</p>
            {selectedDocuments.length > 0 && (
              <p className="text-xs md:text-sm font-medium text-emerald-600">{selectedDocuments.length} document(s) selected</p>
            )}
          </div>

          {/* Documents Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === paginatedDocuments.length && paginatedDocuments.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Document Name</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Linked Entity</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Issue Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Expire Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Days Remaining</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 md:px-6 py-6 md:py-8 text-center text-xs md:text-sm text-gray-500">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  paginatedDocuments.map((doc, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => toggleDocumentSelection(doc.id)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div>
                          <p className="font-semibold text-xs md:text-sm text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500 truncate">{doc.subName}</p>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="text-xs md:text-sm text-gray-900">{doc.type}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="text-xs md:text-sm text-gray-900 truncate">{doc.linkedEntity}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="text-xs md:text-sm text-gray-900">{doc.issueDate}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className={`text-xs md:text-sm ${doc.status === 'expired' ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {doc.expireDate}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        {doc.daysRemaining < 0 ? (
                          <span className="text-xs md:text-sm text-gray-400">—</span>
                        ) : (
                          <span className={`text-xs md:text-sm ${doc.daysRemaining <= 30 ? 'text-yellow-600 font-semibold' : 'text-gray-900'}`}>
                            {doc.daysRemaining} Days
                          </span>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${doc.statusColor}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <button 
                          onClick={() => handleViewDriverProfile(doc)}
                          className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors"
                        >
                          <span className={`w-2 h-2 rounded-full ${doc.dotColor}`}></span>
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto px-4 py-2 text-xs md:text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-2 sm:pb-0">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm font-medium transition-colors flex-shrink-0 ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto px-4 py-2 text-xs md:text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
        </div>
      ) : (
        /* Driver Profile Detail View */
        <div className="flex flex-col gap-6 pb-6">
          {/* Back Button */}
          <button
            onClick={() => {
              setViewMode('list')
              setSelectedDriver(null)
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors w-fit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Documents</span>
          </button>

          {/* Driver Profile Header with Photo */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-lg p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
              {/* Driver Photo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl overflow-hidden border-4 border-white shadow-xl">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                    <svg className="w-20 h-20 md:w-24 md:h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-center text-emerald-100 mt-2">Driver ID: {selectedDriver?.licenseNumber}</p>
              </div>

              {/* Driver Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedDriver?.fullName}</h1>
                <p className="text-emerald-100 text-base md:text-lg mb-4">{selectedDriver?.licenseClass}</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-3">
                    <p className="text-xs text-emerald-100 mb-1">Experience</p>
                    <p className="text-base md:text-lg font-bold text-white">{selectedDriver?.drivingExperience}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-3">
                    <p className="text-xs text-emerald-100 mb-1">Blood Group</p>
                    <p className="text-base md:text-lg font-bold text-white">{selectedDriver?.bloodGroup}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-3">
                    <p className="text-xs text-emerald-100 mb-1">Date of Birth</p>
                    <p className="text-xs md:text-sm font-semibold text-white">{selectedDriver?.dateOfBirth}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-3">
                    <p className="text-xs text-emerald-100 mb-1">Employment</p>
                    <p className="text-xs md:text-sm font-semibold text-white">{selectedDriver?.employmentDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm md:text-base">Contact Information</span>
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{selectedDriver?.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{selectedDriver?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedDriver?.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-red-700 font-semibold">Emergency Contact</p>
                    <p className="text-xs md:text-sm font-semibold text-red-900">{selectedDriver?.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Qualifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span className="text-sm md:text-base">Education & Qualifications</span>
              </h2>
              <div className="space-y-4">
                <div className="p-3 md:p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs text-emerald-700 font-semibold mb-1">Education Level</p>
                  <p className="text-xs md:text-sm font-bold text-emerald-900">{selectedDriver?.education}</p>
                  <p className="text-xs text-emerald-600 mt-1">{selectedDriver?.educationCertificate}</p>
                </div>
                
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Training Certificates</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDriver?.trainingCertificates.map((cert: string, idx: number) => (
                      <span key={idx} className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 flex items-center gap-1">
                        <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{cert}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employment & Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Employment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm md:text-base">Employment Information</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Employment Date</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedDriver?.employmentDate}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Contract Type</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedDriver?.contractType}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Previous Employer</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{selectedDriver?.previousEmployer}</p>
                </div>
              </div>
            </div>

            {/* Compliance & Safety */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm md:text-base">Compliance & Safety Records</span>
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-green-700 font-semibold">Medical Certificate</p>
                    <p className="text-xs md:text-sm font-semibold text-green-900 truncate">{selectedDriver?.medicalCertificate}</p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-green-700 font-semibold">Background Check</p>
                    <p className="text-xs md:text-sm font-semibold text-green-900 truncate">{selectedDriver?.backgroundCheck}</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-blue-700 font-semibold">Traffic Violations</p>
                    <p className="text-xs md:text-sm font-semibold text-blue-900">{selectedDriver?.violations}</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-blue-700 font-semibold">Accident History</p>
                    <p className="text-xs md:text-sm font-semibold text-blue-900">{selectedDriver?.accidents}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm md:text-base">Driver Documents & Certificates</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">Driver License</p>
                  <p className="text-xs text-gray-500 mt-1">Valid until 2029</p>
                  <button className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                    View
                  </button>
                </div>
              </div>
              <div className="p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">Medical Certificate</p>
                  <p className="text-xs text-gray-500 mt-1">Valid until 2025</p>
                  <button className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                    View
                  </button>
                </div>
              </div>
              <div className="p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">Education Certificate</p>
                  <p className="text-xs text-gray-500 mt-1 truncate w-full px-2">{selectedDriver?.educationCertificate}</p>
                  <button className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 md:px-6 py-3 md:py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-white">Upload New Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({...uploadForm, documentType: e.target.value})}
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs md:text-sm"
                >
                  <option>Vehicle Insurance</option>
                  <option>Vehicle Registration</option>
                  <option>Safety Inspection</option>
                  <option>Emission Certificate</option>
                  <option>Driver License</option>
                  <option>Medical Certificate</option>
                  <option>Operating Permit</option>
                  <option>Route Permit</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  Linked Entity (Vehicle ID / Driver Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.linkedEntity}
                  onChange={(e) => setUploadForm({...uploadForm, linkedEntity: e.target.value})}
                  placeholder="e.g., VHL-01 or John Doe"
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs md:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadForm.issueDate}
                    onChange={(e) => setUploadForm({...uploadForm, issueDate: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadForm.expiryDate}
                    onChange={(e) => setUploadForm({...uploadForm, expiryDate: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs md:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  Issued By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.issuedBy}
                  onChange={(e) => setUploadForm({...uploadForm, issuedBy: e.target.value})}
                  placeholder="e.g., Ethiopian Insurance Corporation"
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs md:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  Reference/Policy Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.referenceNumber}
                  onChange={(e) => setUploadForm({...uploadForm, referenceNumber: e.target.value})}
                  placeholder="e.g., INS-009-2024"
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs md:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs md:text-sm text-gray-600 mb-1 truncate px-2">
                      {uploadForm.file ? uploadForm.file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors text-xs md:text-sm"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Renewal Modal */}
      {showBulkRenewal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-4 md:px-6 py-3 md:py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-white">Bulk Document Renewal</h2>
              <button
                onClick={() => setShowBulkRenewal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-yellow-800">
                  You are about to initiate renewal for <span className="font-bold">{selectedDocuments.length}</span> selected document(s).
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-gray-600">Document</th>
                      <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-gray-600">Entity</th>
                      <th className="px-3 md:px-4 py-2 text-left text-xs font-semibold text-gray-600">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allDocuments.filter(doc => selectedDocuments.includes(doc.id)).map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-900 truncate">{doc.name} - {doc.subName}</td>
                        <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 truncate">{doc.linkedEntity}</td>
                        <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600">{doc.expireDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowBulkRenewal(false)}
                  className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkRenewal}
                  className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors text-xs md:text-sm"
                >
                  Proceed with Renewal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {showDocumentDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 md:px-6 py-3 md:py-4 rounded-t-xl flex items-center justify-between z-10">
              <h2 className="text-lg md:text-xl font-bold text-white">Document Details</h2>
              <button
                onClick={() => setShowDocumentDetail(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Driver Profile Section - Only for Driver Documents */}
              {showDocumentDetail.category === 'Driver Documents' && showDocumentDetail.driverDetails && (
                <div className="mb-4 md:mb-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">Complete Driver Profile</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{showDocumentDetail.driverDetails.fullName}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <p className="text-xs text-gray-500 mb-1">License Class</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{showDocumentDetail.driverDetails.licenseClass}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <p className="text-xs text-gray-500 mb-1">Experience</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{showDocumentDetail.driverDetails.drivingExperience}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <p className="text-xs text-gray-500 mb-1">Education</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{showDocumentDetail.driverDetails.education}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                      <p className="text-xs md:text-sm font-semibold text-red-600">{showDocumentDetail.driverDetails.bloodGroup}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{showDocumentDetail.driverDetails.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      ✓ Medical: {showDocumentDetail.driverDetails.medicalCertificate}
                    </span>
                    <span className="px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      ✓ Background: {showDocumentDetail.driverDetails.backgroundCheck}
                    </span>
                    <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Violations: {showDocumentDetail.driverDetails.violations}
                    </span>
                    <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Accidents: {showDocumentDetail.driverDetails.accidents}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setViewMode('detail')
                      setSelectedDriver(showDocumentDetail.driverDetails)
                      setShowDocumentDetail(null)
                      showToast('Opening complete driver profile', 'info')
                    }}
                    className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Complete Driver Profile & Documents
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">{showDocumentDetail.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600 truncate">{showDocumentDetail.subName}</p>
                  <p className="text-xs text-gray-500 mt-1">{showDocumentDetail.category}</p>
                </div>
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${showDocumentDetail.statusColor} flex-shrink-0`}>
                  {showDocumentDetail.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Document Type</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{showDocumentDetail.documentType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Linked Entity</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{showDocumentDetail.linkedEntity}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{showDocumentDetail.issueDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Expiration Date</p>
                  <p className={`text-xs md:text-sm font-semibold ${showDocumentDetail.status === 'expired' ? 'text-red-600' : 'text-gray-900'}`}>
                    {showDocumentDetail.expireDate}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Issued By</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{showDocumentDetail.issuedBy}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Policy/Reference Number</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{showDocumentDetail.policyNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Uploaded By</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{showDocumentDetail.uploadedBy}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Upload Date</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{showDocumentDetail.uploadedAt}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">File Size</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{showDocumentDetail.fileSize}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">File Type</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{showDocumentDetail.fileType}</p>
                </div>
              </div>

              {showDocumentDetail.coverageAmount !== 'N/A' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-emerald-700 mb-1">Coverage Amount</p>
                  <p className="text-base md:text-lg font-bold text-emerald-900">{showDocumentDetail.coverageAmount}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <h4 className="text-xs md:text-sm font-semibold text-blue-900 mb-2">Document History</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Uploaded on {showDocumentDetail.uploadedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span>Last viewed 2 days ago</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    showToast(`Downloading document: ${showDocumentDetail.name} - ${showDocumentDetail.subName}`, 'success')
                  }}
                  className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => {
                    showToast(`Opening document: ${showDocumentDetail.name}`, 'info')
                  }}
                  className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
                {showDocumentDetail.status === 'expired' && (
                  <button
                    onClick={() => {
                      showToast(`Renewing document: ${showDocumentDetail.name}`, 'warning')
                      setShowDocumentDetail(null)
                    }}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors text-xs md:text-sm"
                  >
                    Renew Now
                  </button>
                )}
                {showDocumentDetail.status === 'expires soon' && (
                  <button
                    onClick={() => {
                      showToast(`Scheduling renewal for: ${showDocumentDetail.name}`, 'info')
                      setShowDocumentDetail(null)
                    }}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors text-xs md:text-sm"
                  >
                    Schedule Renewal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
