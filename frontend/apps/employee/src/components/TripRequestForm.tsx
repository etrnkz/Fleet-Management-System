'use client'

import { useState } from 'react'
import { tripApi } from '../lib/api'
import Combobox from './Combobox'

const DESTINATIONS = [
  'Haramaya University Main Campus',
  'Haramaya University Hospital',
  'Dire Dawa City',
  'Addis Ababa',
  'Harar City',
  'Jigjiga',
  'Djibouti',
  'Adama (Nazret)',
  'Hawassa',
  'Bahir Dar',
  'Mekelle',
  'Gondar',
  'Jimma',
  'Dessie',
  'Debre Birhan',
  'Shashamane',
  'Arba Minch',
  'Nekemte',
  'Assosa',
  'Gambela',
]

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
    passengerCount: 1,
    phoneNumber: '',
    alternatePhone: '',
    estimatedDistance: '',
    specialRequirements: '',
    emergencyContact: '',
    emergencyContactPhone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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
      setIsSubmitting(true)
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
        phoneNumber: formData.phoneNumber || undefined,
        estimatedDistance: formData.estimatedDistance ? Number(formData.estimatedDistance) : undefined,
        tripType: mapped.tripType,
        tripCategory: mapped.tripCategory,
      })

      await tripApi.submit(created.id)

      // Show success state
      setShowSuccess(true)
      
      // Wait 2 seconds then call onSuccess
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess()
      }, 2000)
      
    } catch (err: any) {
      showToast(err.message || 'Failed to submit trip request', 'error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--fa-primary)]">New Trip Request</h2>
          <p className="text-[var(--fa-on-surface-variant)] mt-2 font-medium">Submit a new official university travel request.</p>
        </div>
      </div>
      
      {showSuccess ? (
        <div className="bg-white rounded-lg border border-green-300 shadow-sm p-12 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce-slow">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Request Sent Successfully!</h3>
          <p className="text-gray-600 text-center">Your trip request has been submitted and is now pending approval.</p>
        </div>
      ) : (
      <div className="bg-[var(--fa-surface)] rounded-lg border border-gray-300 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination and Trip Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Combobox
                id="destination"
                name="destination"
                label="Destination"
                value={formData.destination}
                onChange={val => setFormData(prev => ({ ...prev, destination: val }))}
                options={DESTINATIONS}
                placeholder="Enter or select destination"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all resize-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
              required
            />
          </div>

          {/* Contact Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+251912345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-2">
                Alternate Contact Phone
              </label>
              <input
                type="tel"
                id="alternatePhone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                placeholder="+251923456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Full name of emergency contact"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="+251934567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
              />
            </div>
          </div>

          {/* Estimated Distance */}
          <div>
            <label htmlFor="estimatedDistance" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Distance (km)
            </label>
            <input
              type="number"
              id="estimatedDistance"
              name="estimatedDistance"
              value={formData.estimatedDistance}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="Enter estimated distance in kilometers"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Helps in vehicle allocation and fuel planning
            </p>
          </div>

          {/* Special Requirements */}
          <div>
            <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              rows={3}
              placeholder="Any special requirements (e.g., wheelchair accessible, cargo space, etc.)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--fa-primary)]/30 focus:border-[var(--fa-primary)] outline-none transition-all resize-none"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[var(--fa-primary)] text-[var(--fa-on-primary)] rounded-lg font-medium hover:bg-[var(--fa-primary)]/90 transition-all duration-300 hover:scale-105 hover:shadow-lg transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  )
}
