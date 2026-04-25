'use client'

import { useState, useEffect } from 'react'
import { tripApi } from '@/lib/api'

export default function FeedbackPage() {
  const [feedbackStats, setFeedbackStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeedbackStatistics()
  }, [])

  const loadFeedbackStatistics = async () => {
    try {
      setLoading(true)
      const stats = await tripApi.getFeedbackStatistics()
      setFeedbackStats(stats)
    } catch (error) {
      console.error('Failed to load feedback statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}/5</span>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trip Feedback</h1>
          <p className="text-gray-600 mt-1">View and analyze customer feedback on trips</p>
        </div>
        <button
          onClick={loadFeedbackStatistics}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Average Ratings Overview */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-emerald-900 mb-4">Overall Service Rating</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-emerald-700 mb-2 font-medium">Overall</p>
                <StarDisplay rating={feedbackStats?.averageOverallRating || 0} />
              </div>
              <div>
                <p className="text-sm text-emerald-700 mb-2 font-medium">Driver</p>
                <StarDisplay rating={feedbackStats?.averageDriverRating || 0} />
              </div>
              <div>
                <p className="text-sm text-emerald-700 mb-2 font-medium">Vehicle</p>
                <StarDisplay rating={feedbackStats?.averageVehicleRating || 0} />
              </div>
              <div>
                <p className="text-sm text-emerald-700 mb-2 font-medium">Punctuality</p>
                <StarDisplay rating={feedbackStats?.averagePunctualityRating || 0} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-white rounded-xl p-6 shadow-sm min-w-[180px]">
            <p className="text-sm text-gray-600 mb-2">Total Responses</p>
            <p className="text-4xl font-bold text-emerald-700">{feedbackStats?.totalFeedback || 0}</p>
            <div className="mt-3 pt-3 border-t border-gray-200 w-full text-center">
              <p className="text-xs text-gray-500">Would Recommend</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {feedbackStats?.recommendationRate ? `${feedbackStats.recommendationRate.toFixed(0)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      {feedbackStats?.recentFeedback && feedbackStats.recentFeedback.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {feedbackStats.recentFeedback.map((feedback: any) => (
              <div key={feedback.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      Trip to {feedback.tripRequest?.destination || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {feedback.tripRequest?.requestNumber || 'N/A'} • {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StarDisplay rating={feedback.overallRating} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                  {feedback.driverRating && (
                    <div>
                      <span className="text-gray-600">Driver:</span>
                      <span className="ml-1 font-medium">{feedback.driverRating}/5 ★</span>
                    </div>
                  )}
                  {feedback.vehicleRating && (
                    <div>
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="ml-1 font-medium">{feedback.vehicleRating}/5 ★</span>
                    </div>
                  )}
                  {feedback.punctualityRating && (
                    <div>
                      <span className="text-gray-600">Punctuality:</span>
                      <span className="ml-1 font-medium">{feedback.punctualityRating}/5 ★</span>
                    </div>
                  )}
                  {feedback.wouldRecommend !== undefined && (
                    <div>
                      <span className="text-gray-600">Recommend:</span>
                      <span className={`ml-1 font-medium ${feedback.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback.wouldRecommend ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>

                {feedback.comments && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Comments:</span> {feedback.comments}
                    </p>
                  </div>
                )}

                {feedback.suggestions && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">Suggestions:</span> {feedback.suggestions}
                    </p>
                  </div>
                )}

                {feedback.issues && feedback.issues.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {feedback.issues.map((issue: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!feedbackStats?.recentFeedback || feedbackStats.recentFeedback.length === 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <p className="text-gray-500">No feedback available yet</p>
        </div>
      )}
    </div>
  )
}
