'use client'
import { getMonthlyTripBars } from '@/lib/utils'

interface MonthlyBarChartProps {
  trips: any[]
  months?: number
  avgTripsPerDay?: number | null
  height?: string
}

export default function MonthlyBarChart({
  trips, months = 6, avgTripsPerDay, height = 'h-32 md:h-40',
}: MonthlyBarChartProps) {
  const bars = getMonthlyTripBars(trips, months)

  return (
    <div>
      <div className={`bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200`}>
        <div className={`flex justify-between items-end ${height} gap-2 md:gap-3`}>
          {bars.map(({ label, count, pct }) => (
            <div key={label} className="flex flex-col justify-end items-center gap-1 flex-1">
              {count > 0 && (
                <span className="text-[9px] text-gray-500">{count}</span>
              )}
              <div
                className="w-full bg-[#152e22] rounded-t shadow-sm transition-all"
                style={{ height: pct, minHeight: count > 0 ? '4px' : '2px' }}
              />
              <span className="text-[10px] md:text-xs text-gray-700 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center pt-3 border-t border-gray-200 mt-4">
        <div className="text-xs md:text-sm text-gray-500">Avg. Trips/Day</div>
        <div className="text-xl md:text-2xl font-bold text-[#1B3D2F]">
          {avgTripsPerDay != null
            ? avgTripsPerDay.toFixed(1)
            : trips.length > 0
              ? (trips.length / 180).toFixed(1)
              : '0.0'}
        </div>
      </div>
    </div>
  )
}
