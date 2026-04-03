'use client'

import { useEffect, useRef, useState } from 'react'
import { trackingApi } from '@/lib/api'

const MIN_POST_INTERVAL_MS = 4_000

export type DriverGpsTrackingStatus = {
  active: boolean
  geoUnsupported: boolean
  lastPostedAt: number | null
  lastError: string | null
  engineSimulatedOff: boolean
  violationZoneName: string | null
}

const initialStatus: DriverGpsTrackingStatus = {
  active: false,
  geoUnsupported: false,
  lastPostedAt: null,
  lastError: null,
  engineSimulatedOff: false,
  violationZoneName: null,
}

/**
 * While `tripId` is set (trip IN_PROGRESS), posts GPS to the fleet API using the
 * driver's JWT — no manual fields. Stops when the trip id is cleared.
 */
export function useDriverGpsTracking(tripId: string | null) {
  const [status, setStatus] = useState<DriverGpsTrackingStatus>(initialStatus)
  const lastSentRef = useRef(0)
  const watchIdRef = useRef<number | null>(null)
  const tripIdRef = useRef(tripId)
  tripIdRef.current = tripId

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
      setStatus({
        ...initialStatus,
        geoUnsupported: true,
        lastError: 'Geolocation not available in this browser',
      })
      return
    }

    setStatus({
      ...initialStatus,
      active: true,
    })

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
        const body: Parameters<typeof trackingApi.postLocation>[1] = {
          latitude: c.latitude,
          longitude: c.longitude,
          metadata: { deviceId: 'driver-web', networkType: 'browser' },
        }
        if (c.speed != null && !Number.isNaN(c.speed) && c.speed >= 0) {
          body.speed = c.speed * 3.6
        }
        if (c.heading != null && !Number.isNaN(c.heading)) {
          body.heading = c.heading
        }
        if (c.altitude != null && !Number.isNaN(c.altitude)) {
          body.altitude = c.altitude
        }
        if (c.accuracy != null && !Number.isNaN(c.accuracy)) {
          body.accuracy = c.accuracy
        }

        trackingApi
          .postLocation(id, body)
          .then((res: {
            engineSimulatedOff?: boolean
            violationZoneName?: string | null
          }) => {
            setStatus((s) => ({
              ...s,
              active: true,
              lastPostedAt: Date.now(),
              lastError: null,
              engineSimulatedOff: Boolean(res.engineSimulatedOff),
              violationZoneName: res.violationZoneName ?? null,
            }))
          })
          .catch((e: Error) => {
            setStatus((s) => ({
              ...s,
              lastError: e.message || 'Location upload failed',
            }))
          })
      },
      (err) => {
        setStatus((s) => ({
          ...s,
          lastError: err.message || 'Location permission or GPS error',
        }))
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
