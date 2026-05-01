import React from 'react'

interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string      // text color class e.g. 'text-[#1B3D2F]'
  icon?: React.ReactNode
  iconBg?: string     // bg class e.g. 'bg-blue-100'
  iconColor?: string  // icon color class
  progress?: number   // 0-100 for progress bar
  className?: string
}

export default function StatsCard({
  label, value, sub, color = 'text-gray-900',
  icon, iconBg, iconColor, progress, className = '',
}: StatsCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 md:p-6 ${className}`}>
      {icon && (
        <div className={`w-10 h-10 ${iconBg || 'bg-gray-100'} rounded-lg flex items-center justify-center ${iconColor || 'text-gray-600'} mb-3`}>
          {icon}
        </div>
      )}
      <p className="text-xs md:text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[#1B3D2F] h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
