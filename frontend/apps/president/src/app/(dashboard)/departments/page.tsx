'use client'

import { useState } from 'react'

export default function DepartmentsPage() {
  const [expandedCollege, setExpandedCollege] = useState<string | null>(null)

  const colleges = [
    { 
      name: 'College of Engineering', 
      dean: 'Dr. Abebe Kebede',
      phone: '+251-91-234-5678',
      email: 'abebe.k@hu.edu.et',
      totalVehicles: 8, 
      totalTrips: 145, 
      totalCost: 1250000, 
      utilization: 85,
      departments: [
        { name: 'Civil Engineering', vehicles: 2, trips: 45, cost: 380000, utilization: 88 },
        { name: 'Mechanical Engineering', vehicles: 2, trips: 38, cost: 320000, utilization: 85 },
        { name: 'Electrical Engineering', vehicles: 2, trips: 35, cost: 295000, utilization: 82 },
        { name: 'Computer Science', vehicles: 2, trips: 27, cost: 255000, utilization: 80 },
      ]
    },
    { 
      name: 'College of Medicine', 
      dean: 'Dr. Yohannes Bekele',
      phone: '+251-91-345-6789',
      email: 'yohannes.b@hu.edu.et',
      totalVehicles: 6, 
      totalTrips: 112, 
      totalCost: 980000, 
      utilization: 72,
      departments: [
        { name: 'Clinical Medicine', vehicles: 2, trips: 42, cost: 370000, utilization: 78 },
        { name: 'Surgery', vehicles: 2, trips: 38, cost: 335000, utilization: 72 },
        { name: 'Pediatrics', vehicles: 1, trips: 18, cost: 158000, utilization: 68 },
        { name: 'Public Health', vehicles: 1, trips: 14, cost: 117000, utilization: 65 },
      ]
    },
    { 
      name: 'College of Business', 
      dean: 'Dr. Ahmed Hassan',
      phone: '+251-91-456-7890',
      email: 'ahmed.h@hu.edu.et',
      totalVehicles: 5, 
      totalTrips: 98, 
      totalCost: 750000, 
      utilization: 68,
      departments: [
        { name: 'Accounting & Finance', vehicles: 2, trips: 38, cost: 290000, utilization: 72 },
        { name: 'Management', vehicles: 2, trips: 35, cost: 268000, utilization: 68 },
        { name: 'Marketing', vehicles: 1, trips: 25, cost: 192000, utilization: 65 },
      ]
    },
    { 
      name: 'College of Natural Sciences', 
      dean: 'Prof. Fatuma Mohammed',
      phone: '+251-91-567-8901',
      email: 'fatuma.m@hu.edu.et',
      totalVehicles: 4, 
      totalTrips: 85, 
      totalCost: 620000, 
      utilization: 55,
      departments: [
        { name: 'Biology', vehicles: 1, trips: 28, cost: 205000, utilization: 62 },
        { name: 'Chemistry', vehicles: 1, trips: 25, cost: 183000, utilization: 58 },
        { name: 'Physics', vehicles: 1, trips: 18, cost: 132000, utilization: 52 },
        { name: 'Mathematics', vehicles: 1, trips: 14, cost: 100000, utilization: 48 },
      ]
    },
    { 
      name: 'College of Arts', 
      dean: 'Mr. Dawit Alemayehu',
      phone: '+251-91-678-9012',
      email: 'dawit.a@hu.edu.et',
      totalVehicles: 3, 
      totalTrips: 67, 
      totalCost: 450000, 
      utilization: 45,
      departments: [
        { name: 'Languages & Literature', vehicles: 1, trips: 25, cost: 168000, utilization: 52 },
        { name: 'History', vehicles: 1, trips: 22, cost: 148000, utilization: 45 },
        { name: 'Philosophy', vehicles: 1, trips: 20, cost: 134000, utilization: 38 },
      ]
    },
    { 
      name: 'College of Agriculture', 
      dean: 'Prof. Alemayehu Worku',
      phone: '+251-91-789-0123',
      email: 'alemayehu.w@hu.edu.et',
      totalVehicles: 3, 
      totalTrips: 45, 
      totalCost: 300000, 
      utilization: 38,
      departments: [
        { name: 'Crop Science', vehicles: 1, trips: 18, cost: 120000, utilization: 42 },
        { name: 'Animal Science', vehicles: 1, trips: 15, cost: 100000, utilization: 38 },
        { name: 'Agricultural Economics', vehicles: 1, trips: 12, cost: 80000, utilization: 35 },
      ]
    },
  ]

  const toggleCollege = (collegeName: string) => {
    setExpandedCollege(expandedCollege === collegeName ? null : collegeName)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Colleges & Departments</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Fleet usage and cost analysis by college and department</p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {colleges.map((college) => (
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
        ))}
      </div>
    </div>
  )
}
