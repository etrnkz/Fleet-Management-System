'use client'

import { useState, useEffect } from 'react'
import { tripApi } from '@/lib/api'

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex gap-1 items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ))}
    <span className="ml-1 text-sm text-gray-600">{Number(rating).toFixed(1)}/5</span>
  </div>
)

export default function FeedbackPage() {
  const [feedbackStats, setFeedbackStats] = useState<any>(null)
  const [allFeedbacks, setAllFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const stats = await tripApi.getFeedbackStatistics() as any
      setFeedbackStats(stats)

      const trips = await tripApi.getAll() as any[]
      const completed = Array.isArray(trips) ? trips.filter((t: any) => t.state === 'COMPLETED') : []
      const feedbacks: any[] = []
      for (const trip of completed.slice(0, 20)) {
        try {
          const fb = await tripApi.getFeedback(trip.id) as any
          if (fb) feedbacks.push({ ...fb, tripRequest: trip })
        } catch {}
      }
      setAllFeedbacks(feedbacks)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-700 border-t-transparent" />
    </div>
  )

  const overall = feedbackStats?.averageRatings?.overall || 0
  const driver = feedbackStats?.averageRatings?.driver || 0
  const vehicle = feedbackStats?.averageRatings?.vehicle || 0
  const punctuality = feedbackStats?.averageRatings?.punctuality || 0
  const total = feedbackStats?.totalFeedbacks || 0
  const recommendRate = feedbackStats?.recommendationRate || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trip Feedback</h1>
          <p className="text-gray-600 mt-1">View and analyze customer feedback on trips</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors text-sm font-medium">
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-emerald-900 mb-4">Average Ratings</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div><p className="text-sm text-emerald-700 mb-2 font-medium">Overall</p><StarDisplay rating={overall} /></div>
              <div><p className="text-sm text-emerald-700 mb-2 font-medium">Driver</p><StarDisplay rating={driver} /></div>
              <div><p className="text-sm text-emerald-700 mb-2 font-medium">Vehicle</p><StarDisplay rating={vehicle} /></div>
              <div><p className="text-sm text-emerald-700 mb-2 font-medium">Punctuality</p><StarDisplay rating={punctuality} /></div>
            </div>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl p-6 shadow-sm min-w-[160px]">
            <p className="text-sm text-gray-600 mb-1">Total Responses</p>
            <p className="text-4xl font-bold text-emerald-700">{total}</p>
            <div className="mt-3 pt-3 border-t border-gray-200 w-full text-center">
              <p className="text-xs text-gray-500">Would Recommend</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{recommendRate.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual feedbacks */}
      {allFeedbacks.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {allFeedbacks.map((fb: any) => (
              <div key={fb.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
                  <div>
                    <p className="font-medium text-gray-900">Trip to {fb.tripRequest?.destination || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{fb.tripRequest?.requestNumber || 'N/A'} · {new Date(fb.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StarDisplay rating={fb.overallRating} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                  {fb.driverRating && <div><span className="text-gray-500">Driver:</span> <span className="font-medium">{fb.driverRating}/5 ★</span></div>}
                  {fb.vehicleRating && <div><span className="text-gray-500">Vehicle:</span> <span className="font-medium">{fb.vehicleRating}/5 ★</span></div>}
                  {fb.punctualityRating && <div><span className="text-gray-500">Punctuality:</span> <span className="font-medium">{fb.punctualityRating}/5 ★</span></div>}
                  {fb.wouldRecommend !== undefined && (
                    <div><span className="text-gray-500">Recommend:</span> <span className={`font-medium ${fb.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>{fb.wouldRecommend ? 'Yes' : 'No'}</span></div>
                  )}
                </div>
                {fb.comments && <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700"><span className="font-medium">Comments:</span> {fb.comments}</div>}
                {fb.suggestions && <div className="bg-blue-50 rounded-lg p-3 mt-2 text-sm text-blue-900"><span className="font-medium">Suggestions:</span> {fb.suggestions}</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No feedback available yet
        </div>
      )}
    </div>
  )
}
