'use client'

import { useState, useEffect, useRef } from 'react'
import { tripApi } from '@/lib/api'

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState<any>(null)
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const scannerRef = useRef<any>(null)
  const divRef = useRef<HTMLDivElement>(null)

  const startScanner = async () => {
    setScanning(true)
    setScannedData(null)
    setResult(null)

    const { Html5Qrcode } = await import('html5-qrcode')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          try {
            const data = JSON.parse(decodedText)
            setScannedData(data)
            stopScanner()
          } catch {
            setResult({ message: 'Invalid QR code', type: 'error' })
            stopScanner()
          }
        },
        () => {}
      )
    } catch {
      setResult({ message: 'Camera access denied or unavailable', type: 'error' })
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => () => { stopScanner() }, [])

  const handleManualSubmit = () => {
    try {
      const data = JSON.parse(manualInput)
      setScannedData(data)
      setManualInput('')
    } catch {
      setResult({ message: 'Invalid JSON input', type: 'error' })
    }
  }

  const handleConfirmStart = async () => {
    if (!scannedData?.tripId) return
    setConfirming(true)
    try {
      await (tripApi as any).startTrip(scannedData.tripId, { plateNumber: scannedData.vehicle })
      setResult({ message: `Trip ${scannedData.requestNumber} started successfully!`, type: 'success' })
      setScannedData(null)
    } catch (err: any) {
      setResult({ message: err.message || 'Failed to start trip', type: 'error' })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gate Scanner</h1>
        <p className="text-sm text-gray-500 mt-1">Scan driver QR code to confirm and start trip</p>
      </div>

      {result && (
        <div className={`p-4 rounded-lg text-sm font-medium ${result.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.message}
          <button onClick={() => setResult(null)} className="ml-3 underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Scanner */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div id="qr-reader" ref={divRef} className={scanning ? 'block' : 'hidden'}></div>

        {!scanning && !scannedData && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">Point camera at driver's QR code</p>
            <button onClick={startScanner}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Start Camera Scan
            </button>
          </div>
        )}

        {scanning && (
          <div className="text-center pt-2">
            <button onClick={stopScanner}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Scanned Result */}
      {scannedData && (
        <div className="bg-white rounded-xl border border-emerald-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">QR Scanned Successfully</h3>
          </div>
          {[
            { label: 'Trip', value: scannedData.requestNumber },
            { label: 'Destination', value: scannedData.destination },
            { label: 'Vehicle', value: scannedData.vehicle },
            { label: 'Driver', value: scannedData.driver },
            { label: 'Action', value: scannedData.action },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value || 'N/A'}</span>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setScannedData(null)}
              className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleConfirmStart} disabled={confirming}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
              {confirming ? 'Starting...' : '✓ Confirm & Start Trip'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Trip ID fallback */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Manual Entry (fallback)</h3>
        <div className="flex gap-2">
          <input type="text" value={manualInput} onChange={e => setManualInput(e.target.value)}
            placeholder='Paste QR JSON data...'
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          <button onClick={handleManualSubmit}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800">
            Parse
          </button>
        </div>
      </div>
    </div>
  )
}
