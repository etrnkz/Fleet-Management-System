import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

interface UseVehicleTrackingOptions {
  vehicleId?: string;
  tripId?: string;
  wsUrl?: string;
}

export const useVehicleTracking = ({
  vehicleId,
  tripId,
  wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
}: UseVehicleTrackingOptions = {}) => {
  const [locations, setLocations] = useState<Map<string, VehicleLocation>>(new Map());
  const [currentLocation, setCurrentLocation] = useState<VehicleLocation | null>(null);

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'location_update') {
      const location: VehicleLocation = data.payload;
      
      setLocations((prev) => {
        const updated = new Map(prev);
        updated.set(location.vehicleId, location);
        return updated;
      });

      if (vehicleId && location.vehicleId === vehicleId) {
        setCurrentLocation(location);
      }
      
      if (tripId && data.tripId === tripId) {
        setCurrentLocation(location);
      }
    }
  }, [vehicleId, tripId]);

  const { connectionState, sendMessage, connect, disconnect } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
    onOpen: () => {
      if (vehicleId) {
        sendMessage({
          type: 'subscribe',
          vehicleId,
        });
      }
      if (tripId) {
        sendMessage({
          type: 'subscribe_trip',
          tripId,
        });
      }
    },
  });

  const subscribeToVehicle = useCallback((id: string) => {
    sendMessage({
      type: 'subscribe',
      vehicleId: id,
    });
  }, [sendMessage]);

  const unsubscribeFromVehicle = useCallback((id: string) => {
    sendMessage({
      type: 'unsubscribe',
      vehicleId: id,
    });
  }, [sendMessage]);

  return {
    connectionState,
    currentLocation,
    locations,
    subscribeToVehicle,
    unsubscribeFromVehicle,
    connect,
    disconnect,
  };
};
