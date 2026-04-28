'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface Vehicle {
  id: string
  plateNumber: string
  driver: string
  status: 'moving' | 'idle' | 'stopped'
  speed: string
  location: string
  lastUpdate: string
  lat: number
  lng: number
}

interface MapProps {
  vehicles: Vehicle[]
  selectedVehicle: string
  onVehicleSelect: (id: string) => void
  followMode: boolean
}

// Component to handle map centering
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  
  return null
}

// Custom vehicle marker icons
const createVehicleIcon = (status: string) => {
  const color = status === 'moving' ? '#10b981' : status === 'idle' ? '#eab308' : '#ef4444'
  
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${status === 'moving' ? 'animation: pulse 2s infinite;' : ''}
      ">
        <svg width="24" height="24" viewBox="0 0 20 20" fill="white">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  })
}

export default function Map({ vehicles, selectedVehicle, onVehicleSelect, followMode }: MapProps) {
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle)
  const center: [number, number] = selectedVehicleData 
    ? [selectedVehicleData.lat, selectedVehicleData.lng]
    : [9.0192, 38.7525] // Addis Ababa center

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
      `}</style>
      
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {followMode && selectedVehicleData && (
          <MapController center={[selectedVehicleData.lat, selectedVehicleData.lng]} zoom={15} />
        )}
        
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={createVehicleIcon(vehicle.status)}
            eventHandlers={{
              click: () => onVehicleSelect(vehicle.id)
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-sm">{vehicle.id}</p>
                <p className="text-xs text-gray-600">{vehicle.plateNumber}</p>
                <p className="text-xs text-gray-600">Driver: {vehicle.driver}</p>
                <p className="text-xs font-semibold mt-1">Speed: {vehicle.speed}</p>
                <p className="text-xs text-gray-500">{vehicle.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  )
}
