'use client'
import dynamic from 'next/dynamic'
import { PageSpinner } from './LoadingSkeleton'

/**
 * Lazy-loaded Map component.
 * Leaflet is ~150KB — only load it when the map is actually rendered.
 * Use this instead of importing Map directly.
 *
 * Usage:
 *   import LazyMap from '@/components/LazyMap'
 *   <LazyMap tripId={...} ... />
 */
const LazyMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
      <PageSpinner />
    </div>
  ),
})

export default LazyMap
