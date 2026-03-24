"use client";

import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface FeedbackItem {
  id: string;
  tripId: string;
  rating: number;
  comment: string;
  date: string;
  category: string;
  status: "Resolved" | "Under Review";
}

const mockFeedback: FeedbackItem[] = [
  {
    id: "1",
    tripId: "TRP-2023-911",
    rating: 5,
    comment: "The driver was very professional and arrived exactly on time. The vehicle was...",
    date: "Dec 15, 2023",
    category: "Professionalism",
    status: "Resolved",
  },
  {
    id: "2",
    tripId: "TRP-2023-855",
    rating: 4,
    comment: "The GPS route taken was a bit longer than usual, costing about 15 minutes of delay...",
    date: "Nov 28, 2023",
    category: "Efficiency",
    status: "Under Review",
  },
  {
    id: "3",
    tripId: "TRP-2023-720",
    rating: 5,
    comment: "App crashed once during the booking process, but the ride itself was great.",
    date: "Nov 15, 2023",
    category: "App Experience",
    status: "Resolved",
  },
];

export default function FeedbackPage() {
  const [selectedTrip, setSelectedTrip] = useState("TRP-2024-001 - Downtown");
  const [category, setCategory] = useState("Driver Professionalism");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback submitted:", { selectedTrip, category, rating, comments });
    // Handle feedback submission
  };

  return (
    <>
      <PageHeader title="Provide Feedback" subtitle="Tell us about your recent trip experience" />
      <div className="p-8">

      <div className="grid grid-cols-3 gap-6">
        {/* Left Side - Feedback Form */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            {/* Select Recent Trip */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Recent Trip
                </label>
                <select
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                >
                  <option>TRP-2024-001 - Downtown</option>
                  <option>TRP-2023-911 - City Center</option>
                  <option>TRP-2023-855 - Airport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                >
                  <option>Driver Professionalism</option>
                  <option>Vehicle Condition</option>
                  <option>Route Efficiency</option>
                  <option>App Experience</option>
                  <option>Customer Service</option>
                </select>
              </div>
            </div>

            {/* Overall Experience Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Overall Experience
              </label>
              <div className="flex items-center gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <svg
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "text-teal-500"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-500">{star}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Comments */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Detailed Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Please share your experience with us..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-gray-900 bg-white"
              />
            </div>

            {/* Attachments */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Drop files here or click to upload photo</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Right Side - Recent Feedback */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Feedback</h2>
              <button className="text-teal-600 text-sm font-medium hover:text-teal-700">
                HISTORY
              </button>
            </div>

            <div className="space-y-4">
              {mockFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-teal-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        feedback.status === "Resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {feedback.status}
                    </span>
                  </div>

                  <p className="font-medium text-gray-900 mb-2">{feedback.tripId}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    "{feedback.comment}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{feedback.date}</span>
                    <span>• {feedback.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-teal-600 text-sm font-medium hover:text-teal-700">
              View All Feedback
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-teal-50 rounded-lg border border-teal-200 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-teal-600 shrink-0 mt-1" />
              <div>
                <p className="font-medium text-teal-900 mb-2">Your voice matters</p>
                <p className="text-sm text-teal-700">
                  Feedback is anonymous unless you choose to share details. We use this data to
                  improve fleet quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
