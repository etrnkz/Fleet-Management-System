'use client'

import { useEffect, useRef, useState } from 'react'
import { trackingApi } from '@/lib/api'

const MIN_POST_INTERVAL_MS = 4_000
const OFFLINE_QUEUE_KEY = 'hufms_gps_offline_queue'

export type DriverGpsTrackingStatus = {
  active: boolean
  geoUnsupported: boolean
  lastPostedAt: number | null
  lastError: string | null
  engineSimulatedOff: boolean
  violationZoneName: string | null
  offlineQueueSize: number
}

const initialStatus: DriverGpsTrackingStatus = {
  active: false,
  geoUnsupported: false,
  lastPostedAt: null,
  lastError: null,
  engineSimulatedOff: false,
  violationZoneName: null,
  offlineQueueSize: 0,
}

// ── Offline queue helpers ─────────────────────────────────────────────────────

function getQueue(tripId: string): any[] {
  try {
    const raw = localStorage.getItem(`${OFFLINE_QUEUE_KEY}_${tripId}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveQueue(tripId: string, queue: any[]) {
  try {
    localStorage.setItem(`${OFFLINE_QUEUE_KEY}_${tripId}`, JSON.stringify(queue))
  } catch {}
}

function clearQueue(tripId: string) {
  localStorage.removeItem(`${OFFLINE_QUEUE_KEY}_${tripId}`)
}

async function flushQueue(tripId: string): Promise<boolean> {
  const queue = getQueue(tripId)
  if (queue.length === 0) return true
  try {
    await trackingApi.bulkUpdateLocations(tripId, queue)
    clearQueue(tripId)
    return true
  } catch {
    return false
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDriverGpsTracking(tripId: string | null) {
  const [status, setStatus] = useState<DriverGpsTrackingStatus>(initialStatus)
  const lastSentRef = useRef(0)
  const watchIdRef = useRef<number | null>(null)
  const tripIdRef = useRef(tripId)
  tripIdRef.current = tripId

  // Flush offline queue when coming back online
  useEffect(() => {
    if (!tripId) return
    const handleOnline = async () => {
      const flushed = await flushQueue(tripId)
      if (flushed) {
        setStatus(s => ({ ...s, offlineQueueSize: 0, lastError: null }))
      }
    }
    window.addEventListener('online', handleOnline)
    // Also try to flush on mount in case we're already online with queued points
    if (navigator.onLine) handleOnline()
    return () => window.removeEventListener('online', handleOnline)
  }, [tripId])

  useEffect(() => {
    if (!tripId) {
      if (watchIdRef.current != null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setStatus(initialStatus)
      return
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus({ ...initialStatus, geoUnsupported: true, lastError: 'Geolocation not available' })
      return
    }

    setStatus({ ...initialStatus, active: true })

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 20_000,
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const id = tripIdRef.current
        if (!id) return

        const now = Date.now()
        if (now - lastSentRef.current < MIN_POST_INTERVAL_MS) return
        lastSentRef.current = now

        const c = pos.coords
        const body: any = {
          latitude: c.latitude,
          longitude: c.longitude,
          timestamp: new Date().toISOString(),
          metadata: { deviceId: 'driver-web', networkType: 'browser' },
        }
        if (c.speed != null && !isNaN(c.speed) && c.speed >= 0) body.speed = c.speed * 3.6
        if (c.heading != null && !isNaN(c.heading)) body.heading = c.heading
        if (c.altitude != null && !isNaN(c.altitude)) body.altitude = c.altitude
        if (c.accuracy != null && !isNaN(c.accuracy)) body.accuracy = c.accuracy

        if (!navigator.onLine) {
          // Offline — queue the point
          const queue = getQueue(id)
          queue.push(body)
          saveQueue(id, queue)
          setStatus(s => ({
            ...s,
            offlineQueueSize: queue.length,
            lastError: `Offline — ${queue.length} point${queue.length > 1 ? 's' : ''} queued`,
          }))
          return
        }

        // Online — flush any queued points first, then send current
        flushQueue(id).then(() => {
          trackingApi.postLocation(id, body)
            .then((res: any) => {
              setStatus(s => ({
                ...s,
                active: true,
                lastPostedAt: Date.now(),
                lastError: null,
                offlineQueueSize: 0,
                engineSimulatedOff: Boolean(res.engineSimulatedOff),
                violationZoneName: res.violationZoneName ?? null,
              }))
            })
            .catch((e: Error) => {
              // Failed to send — queue it
              const queue = getQueue(id)
              queue.push(body)
              saveQueue(id, queue)
              setStatus(s => ({
                ...s,
                offlineQueueSize: queue.length,
                lastError: e.message || 'Upload failed — queued',
              }))
            })
        })
      },
      (err) => {
        setStatus(s => ({ ...s, lastError: err.message || 'GPS error' }))
      },
      options,
    )

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setStatus(initialStatus)
    }
  }, [tripId])

  return status
}
