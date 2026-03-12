'use client'

import { useState } from 'react'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [reportPeriod, setReportPeriod] = useState('monthly')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [schedules, setSchedules] = useState([
    { id: 1, name: 'Monthly Executive Summary', frequency: 'Monthly', nextRun: '2024-07-01', recipients: 'Board Members' },
    { id: 2, name: 'Weekly Fleet Status', frequency: 'Weekly', nextRun: '2024-06-17', recipients: 'Management Team' },
    { id: 3, name: 'Quarterly Financial Review', frequency: 'Quarterly', nextRun: '2024-07-01', recipients: 'Finance Committee' },
  ])
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    frequency: 'Monthly',
    recipients: '',
    reportType: 'executive-summary'
  })

  const reportTypes = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      description: 'Comprehensive overview of fleet operations',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Budget analysis and cost breakdown',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'utilization',
      title: 'Fleet Utilization',
      description: 'Vehicle usage and efficiency metrics',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'compliance',
      title: 'Compliance Report',
      description: 'Safety and regulatory compliance status',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'department',
      title: 'Department Analysis',
      description: 'Performance by college and department',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Report',
      description: 'Vehicle maintenance and service history',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'sustainability',
      title: 'Sustainability Report',
      description: 'Environmental impact and carbon footprint',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-teal-500 to-green-600'
    },
    {
      id: 'board-presentation',
      title: 'Board Presentation',
      description: 'Executive summary for board meetings',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      color: 'from-pink-500 to-rose-600'
    },
  ]

  const recentReports = [
    { name: 'Q2 2024 Executive Summary', date: '2024-06-15', type: 'Executive', size: '2.4 MB' },
    { name: 'May 2024 Financial Report', date: '2024-06-01', type: 'Financial', size: '1.8 MB' },
    { name: 'Fleet Utilization - May 2024', date: '2024-06-01', type: 'Utilization', size: '1.2 MB' },
    { name: 'Compliance Status Report', date: '2024-05-28', type: 'Compliance', size: '950 KB' },
  ]

  // Toast notification handler
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Generate report handler
  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId)
    setShowGenerateModal(true)
  }

  const confirmGenerateReport = () => {
    setIsGenerating(true)
    setShowGenerateModal(false)
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      showNotification('Report generated successfully!')
      setSelectedReport(null)
    }, 2000)
  }

  // Download report handler
  const handleDownloadReport = (reportName: string) => {
    showNotification(`Downloading ${reportName}...`)
    // Simulate download
    setTimeout(() => {
      showNotification('Download complete!')
    }, 1500)
  }

  // Schedule handlers
  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.recipients) {
      showNotification('Please fill in all fields', 'error')
      return
    }
    
    const schedule = {
      id: schedules.length + 1,
      ...newSchedule,
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    setSchedules([...schedules, schedule])
    setShowScheduleModal(false)
    setNewSchedule({ name: '', frequency: 'Monthly', recipients: '', reportType: 'executive-summary' })
    showNotification('Schedule created successfully!')
  }

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule)
    setShowEditScheduleModal(true)
  }

  const handleUpdateSchedule = () => {
    if (!editingSchedule.name || !editingSchedule.recipients) {
      showNotification('Please fill in all fields', 'error')
      return
    }
    
    setSchedules(schedules.map(s => s.id === editingSchedule.id ? editingSchedule : s))
    setShowEditScheduleModal(false)
    setEditingSchedule(null)
    showNotification('Schedule updated successfully!')
  }

  const handleDeleteSchedule = (scheduleId: number) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(s => s.id !== scheduleId))
      showNotification('Schedule deleted successfully!')
    }
  }

  // Export handlers
  const handleExport = (format: string) => {
    showNotification(`Exporting report as ${format.toUpperCase()}...`)
    setTimeout(() => {
      showNotification(`${format.toUpperCase()} export complete!`)
    }, 1500)
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

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Generating Report...</p>
          </div>
        </div>
      )}

      {/* Generate Report Confirmation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Generate Report</h3>
            <p className="text-gray-600 mb-6">
              Generate {reportTypes.find(r => r.id === selectedReport)?.title} for {reportPeriod} period in {selectedYear}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmGenerateReport}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Schedule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Name</label>
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Monthly Executive Summary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={newSchedule.reportType}
                  onChange={(e) => setNewSchedule({ ...newSchedule, reportType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {reportTypes.map(report => (
                    <option key={report.id} value={report.id}>{report.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={newSchedule.frequency}
                  onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <input
                  type="text"
                  value={newSchedule.recipients}
                  onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Board Members, Management Team"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowScheduleModal(false)
                  setNewSchedule({ name: '', frequency: 'Monthly', recipients: '', reportType: 'executive-summary' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSchedule}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditScheduleModal && editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Schedule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Name</label>
                <input
                  type="text"
                  value={editingSchedule.name}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={editingSchedule.frequency}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, frequency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <input
                  type="text"
                  value={editingSchedule.recipients}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, recipients: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditScheduleModal(false)
                  setEditingSchedule(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSchedule}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Generate and download comprehensive fleet reports</p>
        </div>
        <div className="flex gap-2">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      {/* Report Types */}
      <div>
        <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all group"
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${report.color} rounded-xl flex items-center justify-center text-white mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                {report.icon}
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 md:mb-2">{report.title}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">{report.description}</p>
              <button 
                onClick={() => handleGenerateReport(report.id)}
                className="w-full px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs md:text-sm font-medium"
              >
                Generate Report
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold text-gray-800">Recent Reports</h2>
          <button 
            onClick={() => showNotification('Showing all reports...')}
            className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Report Name</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Size</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 font-medium">{report.name}</td>
                    <td className="py-2 md:py-3 px-3 md:px-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        {report.type}
                      </span>
                    </td>
                    <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600">{report.date}</td>
                    <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600">{report.size}</td>
                    <td className="py-2 md:py-3 px-3 md:px-4">
                      <button 
                        onClick={() => handleDownloadReport(report.name)}
                        className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold text-gray-800">Scheduled Reports</h2>
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs md:text-sm font-medium whitespace-nowrap"
          >
            + New Schedule
          </button>
        </div>
        <div className="space-y-3">
          {schedules.map((report) => (
            <div key={report.id} className="p-3 md:p-4 bg-gray-50 rounded-lg border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">{report.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                    <span>Frequency: {report.frequency}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Next: {report.nextRun}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>To: {report.recipients}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditSchedule(report)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteSchedule(report.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-emerald-500">
        <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Export Options</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => handleExport('pdf')}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-xs md:text-sm font-medium text-gray-800">PDF</span>
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs md:text-sm font-medium text-gray-800">Excel</span>
          </button>
          <button 
            onClick={() => handleExport('word')}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs md:text-sm font-medium text-gray-800">Word</span>
          </button>
          <button 
            onClick={() => handleExport('csv')}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-xs md:text-sm font-medium text-gray-800">CSV</span>
          </button>
        </div>
      </div>
    </div>
  )
}
