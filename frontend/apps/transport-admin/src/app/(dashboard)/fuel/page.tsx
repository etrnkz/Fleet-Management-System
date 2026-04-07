'use client'

import { useState, useEffect } from 'react'
import { fuelApi, vehicleApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'

// TypeScript interfaces
interface FuelRecord {
  id: string
  vehicle: {
    id: string
    plateNumber: string
    make: string
    model: string
  }
  type: string
  quantity: number
  pricePerLiter: number
  totalCost: number
  mileageAtRefuel?: number
  station?: string
  receiptNumber?: string
  notes?: string
  recordedBy: {
    name: string
    email: string
  }
  createdAt: string
}

interface FuelStatistics {
  totalRecords: number
  totalCost: number
  totalQuantity: number
  averagePricePerLiter: number
  byType: Record<string, number>
  byVehicle: Record<string, {
    count: number
    totalCost: number
    totalQuantity: number
  }>
}

interface Vehicle {
  id: string
  plateNumber: string
  make: string
  model: string
}

export default function FuelPage() {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [statistics, setStatistics] = useState<FuelStatistics | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [timeRange, setTimeRange] = useState('Last 30 Days')
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all')

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [selectedVehicle, timeRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      if (timeRange === 'Last 7 Days') {
        startDate.setDate(endDate.getDate() - 7)
      } else if (timeRange === 'Last 30 Days') {
        startDate.setDate(endDate.getDate() - 30)
      } else if (timeRange === 'Last 90 Days') {
        startDate.setDate(endDate.getDate() - 90)
      } else if (timeRange === 'Last Year') {
        startDate.setFullYear(endDate.getFullYear() - 1)
      }

      // Fetch fuel records
      const params: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }
      if (selectedVehicle !== 'all') {
        params.vehicleId = selectedVehicle
      }

      const records = await fuelApi.getAll() as FuelRecord[]
      setFuelRecords(records)

      // Fetch statistics
      const stats = await fuelApi.getStatistics(startDate.toISOString(), endDate.toISOString()) as FuelStatistics
      setStatistics(stats)

      // Fetch vehicles
      const vehiclesData = await vehicleApi.getAll() as Vehicle[]
      setVehicles(vehiclesData)
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to fetch fuel data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  }

  // Calculate efficiency
  const calculateEfficiency = (record: FuelRecord, prevRecord?: FuelRecord) => {
    if (!record.mileageAtRefuel || !prevRecord?.mileageAtRefuel) return null
    const distance = record.mileageAtRefuel - prevRecord.mileageAtRefuel
    const efficiency = (distance / record.quantity) * 100
    return efficiency.toFixed(1)
  }

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3D2F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fuel data...</p>
        </div>
      </div>
    )
  }

  return (
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
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Fuel Management</h1>
          <p className="text-xs md:text-sm text-gray-500">Monitor consumption and manage fuel records</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">Total Records</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.totalRecords}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">Total Cost</p>
              <p className="text-2xl md:text-3xl font-bold text-[#1B3D2F]">
                {formatCurrency(statistics.totalCost)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">Total Quantity</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {statistics.totalQuantity.toFixed(1)} L
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2">Avg Price/L</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-600">
                ETB {statistics.averagePricePerLiter.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none bg-white text-xs md:text-sm"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Vehicle
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none bg-white text-xs md:text-sm"
              >
                <option value="all">All Vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fuel Records by Vehicle */}
        {statistics && statistics.byVehicle && Object.keys(statistics.byVehicle).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Consumption by Vehicle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {Object.entries(statistics.byVehicle).map(([plateNumber, data]) => (
                <div key={plateNumber} className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="text-xs md:text-sm font-semibold text-gray-900 mb-2">{plateNumber}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Records:</span>
                      <span className="font-medium text-gray-900">{data.count}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium text-[#1B3D2F]">
                        {formatCurrency(data.totalCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Total Fuel:</span>
                      <span className="font-medium text-blue-600">{data.totalQuantity.toFixed(1)} L</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Fuel Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Recent Fuel Transactions</h2>
          </div>

          {fuelRecords.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 font-medium">No fuel records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Station
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mileage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fuelRecords.slice(0, 20).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div>
                          <p className="text-xs md:text-sm font-semibold text-gray-900">
                            {record.vehicle.plateNumber}
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-500">
                            {record.vehicle.make} {record.vehicle.model}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm text-gray-600">
                          {formatDate(record.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          record.type === 'Refuel' 
                            ? 'bg-green-100 text-green-700' 
                            : record.type === 'TripConsumption'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm font-semibold text-blue-600">
                          {record.quantity.toFixed(1)} L
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm font-semibold text-gray-900">
                          {formatCurrency(record.totalCost)}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm text-gray-600">
                          {record.station || '-'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm text-gray-600">
                          {record.mileageAtRefuel ? `${record.mileageAtRefuel.toLocaleString()} km` : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
