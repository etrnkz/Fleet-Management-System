'use client'

/** Animated skeleton pulse block */
function Pulse({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
}

/** Full-page centered spinner */
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1B3D2F] border-t-transparent" />
        <p className="text-sm text-gray-400 font-medium">Loading…</p>
      </div>
    </div>
  )
}

/** Skeleton for a stats card grid (4 cards) */
export function StatsCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
          <Pulse className="h-3 w-24 mb-3" />
          <Pulse className="h-8 w-16 mb-2" />
          <Pulse className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton for a data table */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Pulse key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-gray-100 flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Pulse key={j} className={`h-4 flex-1 ${j === 0 ? 'max-w-[120px]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Skeleton for a card grid */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Pulse className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-3/4" />
              <Pulse className="h-3 w-1/2" />
            </div>
          </div>
          <Pulse className="h-3 w-full" />
          <Pulse className="h-3 w-5/6" />
          <Pulse className="h-8 w-full rounded-lg mt-2" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton for a dashboard with stats + chart + table */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Pulse className="h-7 w-48" />
          <Pulse className="h-4 w-32" />
        </div>
        <Pulse className="h-9 w-36 rounded-lg" />
      </div>
      <StatsCardsSkeleton count={4} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <Pulse className="h-5 w-40" />
          <div className="flex items-end gap-2 h-32">
            {[60, 80, 45, 100, 70, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <Pulse className="w-full rounded-t" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <TableSkeleton rows={4} cols={5} />
        </div>
      </div>
    </div>
  )
}
