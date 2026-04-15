'use client'

import { useState } from 'react'
import { tripApi } from '../lib/api'

interface TripRequestFormProps {
  onSuccess: () => void
  onCancel: () => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export default function TripRequestForm({ onSuccess, onCancel, showToast }: TripRequestFormProps) {
  const [formData, setFormData] = useState({
    destination: '',
    tripType: '',
    purposeCategory: '',
    purpose: '',
    startDateTime: '',
    endDateTime: '',
    passengerCount: 1
  })

  // Calculate minimum date (48 hours from now)
  const getMinDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 48)
    return now.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (new Date(formData.startDateTime).getTime() - Date.now() < 48 * 60 * 60 * 1000) {
      showToast('Trip must be requested at least 48 hours in advance', 'error')
      return
    }
    if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      showToast('End date must be after start date', 'error')
      return
    }

    try {
      const tripTypeMap: Record<string, { tripType: 'Normal' | 'VIP'; tripCategory: 'STANDARD' | 'VIP' | 'SERVICE' }> = {
        STANDARD: { tripType: 'Normal', tripCategory: 'STANDARD' },
        VIP:      { tripType: 'VIP',    tripCategory: 'VIP' },
        SERVICE:  { tripType: 'Normal', tripCategory: 'SERVICE' },
      }
      const mapped = tripTypeMap[formData.tripType] || { tripType: 'Normal', tripCategory: 'STANDARD' }

      const purposeText = [
        formData.purposeCategory,
        formData.purpose ? `Details: ${formData.purpose}` : '',
      ].filter(Boolean).join(' | ')

      const created: any = await tripApi.create({
        destination: formData.destination,
        purpose: purposeText,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        passengerCount: Number(formData.passengerCount),
        tripType: mapped.tripType,
        tripCategory: mapped.tripCategory,
      })

      await tripApi.submit(created.id)

      const messages: Record<string, string> = {
        VIP: 'VIP trip submitted — sent directly to the President for approval.',
        SERVICE: 'Service trip submitted — sent directly to the President for approval.',
        STANDARD: 'Standard trip submitted — following the normal approval process.',
      }
      showToast(messages[formData.tripType] || 'Trip request submitted successfully!', 'success')
      
      // Clear form
      setFormData({
        destination: '',
        tripType: '',
        purposeCategory: '',
        purpose: '',
        startDateTime: '',
        endDateTime: '',
        passengerCount: 1
      })
      
      onSuccess()
    } catch (err: any) {
      showToast(err.message || 'Failed to submit trip request', 'error')
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">New Trip Request</h2>
          <p className="text-[#44474E] mt-2 font-medium">Submit a new official university travel request.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination and Trip Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Enter destination"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="tripType" className="block text-sm font-medium text-gray-700 mb-2">
                Trip Type <span className="text-red-500">*</span>
              </label>
              <select
                id="tripType"
                name="tripType"
                value={formData.tripType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                required
              >
                <option value="">Select trip type</option>
                <option value="STANDARD">Standard Trip</option>
                <option value="VIP">VIP Trip</option>
                <option value="SERVICE">Service Trip</option>
              </select>
            </div>
          </div>

          {/* Purpose Category */}
          <div>
            <label htmlFor="purposeCategory" className="block text-sm font-medium text-gray-700 mb-2">
              Purpose Category
            </label>
            <select
              id="purposeCategory"
              name="purposeCategory"
              value={formData.purposeCategory}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
              required
            >
              <option value="">Select purpose category</option>
              <option value="OFFICIAL">Official Business</option>
              <option value="CONFERENCE">Conference</option>
              <option value="TRAINING">Training</option>
              <option value="MEETING">Meeting</option>
              <option value="RESEARCH">Research</option>
              <option value="INSPECTION">Inspection</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          {/* Purpose Details */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              Purpose Details
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the purpose of your trip in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all resize-none"
            />
          </div>
          
          {/* Start and End Date/Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="startDateTime"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                min={getMinDateTime()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                required
              />
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Must be at least 48 hours from now
              </p>
            </div>
            <div>
              <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="endDateTime"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                min={formData.startDateTime || getMinDateTime()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                required
              />
            </div>
          </div>
          
          {/* Number of Passengers */}
          <div>
            <label htmlFor="passengerCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Passengers
            </label>
            <input
              type="number"
              id="passengerCount"
              name="passengerCount"
              value={formData.passengerCount}
              onChange={handleChange}
              min="1"
              max="50"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
              required
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#1B3D2F] text-white rounded-lg font-medium hover:bg-[#152e22] transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
