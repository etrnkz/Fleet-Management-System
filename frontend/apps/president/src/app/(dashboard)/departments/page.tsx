'use client'

import { useState, useEffect } from 'react'
import { collegeApi, departmentApi } from '../../lib/api'

export default function DepartmentsPage() {
  const [expandedCollege, setExpandedCollege] = useState<string | null>(null)
  const [colleges, setColleges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollegesData()
  }, [])

  const loadCollegesData = async () => {
    try {
      setLoading(true)
      const collegesData = await collegeApi.getAll()
      
      // Load departments for each college and calculate stats
      const collegesWithStats = await Promise.all(
        collegesData.map(async (college: any) => {
          try {
            const departments = await departmentApi.getByCollege(college.id)
            
            // Calculate aggregate stats (placeholder values for now)
            const totalVehicles = departments.length * 2 // Estimate
            const totalTrips = Math.floor(Math.random() * 200) + 50
            const totalCost = totalTrips * 8500 // Estimate cost per trip
            const utilization = Math.floor(Math.random() * 40) + 50
            
            return {
              ...college,
              dean: college.head?.firstName ? `${college.head.firstName} ${college.head.lastName}` : 'Not Assigned',
              phone: college.head?.phone || 'N/A',
              email: college.head?.email || 'N/A',
              totalVehicles,
              totalTrips,
              totalCost,
              utilization,
              departments: departments.map((dept: any) => ({
                name: dept.name,
                vehicles: Math.floor(Math.random() * 3) + 1,
                trips: Math.floor(Math.random() * 50) + 10,
                cost: Math.floor(Math.random() * 300000) + 100000,
                utilization: Math.floor(Math.random() * 40) + 50,
              }))
            }
          } catch (error) {
            console.error(`Failed to load departments for college ${college.id}:`, error)
            return {
              ...college,
              dean: 'Not Assigned',
              phone: 'N/A',
              email: 'N/A',
              totalVehicles: 0,
              totalTrips: 0,
              totalCost: 0,
              utilization: 0,
              departments: []
            }
          }
        })
      )
      
      setColleges(collegesWithStats)
    } catch (error) {
      console.error('Failed to load colleges data:', error)
      setColleges([])
    } finally {
      setLoading(false)
    }
  }

  const toggleCollege = (collegeName: string) => {
    setExpandedCollege(expandedCollege === collegeName ? null : collegeName)
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Colleges & Departments</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Fleet usage and cost analysis by college and department</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Colleges & Departments</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Fleet usage and cost analysis by college and department</p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {colleges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No colleges found</p>
          </div>
        ) : (
          colleges.map((college) => (
          <div key={college.name} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* College Header */}
            <div 
              className="p-4 md:p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 cursor-pointer hover:bg-emerald-100 transition-colors"
              onClick={() => toggleCollege(college.name)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base md:text-lg font-bold text-gray-800">{college.name}</h3>
                    <svg 
                      className={`w-5 h-5 text-gray-600 transition-transform ${expandedCollege === college.name ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Vehicles</p>
                      <p className="text-sm md:text-base font-bold text-gray-800">{college.totalVehicles}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Trips</p>
                      <p className="text-sm md:text-base font-bold text-gray-800">{college.totalTrips}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Cost</p>
                      <p className="text-sm md:text-base font-bold text-emerald-600">ETB {(college.totalCost / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Utilization</p>
                      <p className="text-sm md:text-base font-bold text-gray-800">{college.utilization}%</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-gray-600">
                    <span>Dean: {college.dean}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{college.phone}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{college.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Departments (Expandable) */}
            {expandedCollege === college.name && (
              <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
                <h4 className="text-sm md:text-base font-bold text-gray-800 mb-4">Departments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {college.departments.map((dept) => (
                    <div key={dept.name} className="bg-white rounded-lg shadow p-3 md:p-4 hover:shadow-md transition-shadow">
                      <h5 className="text-sm md:text-base font-bold text-gray-800 mb-3">{dept.name}</h5>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Vehicles</span>
                          <span className="text-xs md:text-sm font-bold text-gray-800">{dept.vehicles}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Trips</span>
                          <span className="text-xs md:text-sm font-bold text-gray-800">{dept.trips}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Cost</span>
                          <span className="text-xs md:text-sm font-bold text-emerald-600">ETB {(dept.cost / 1000).toFixed(0)}K</span>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Utilization</span>
                            <span className="text-xs md:text-sm font-bold text-gray-800">{dept.utilization}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${dept.utilization}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          ))
        )}
      </div>
    </div>
  )
}
