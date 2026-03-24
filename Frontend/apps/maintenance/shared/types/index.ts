// Shared types across all Fleet Management apps

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin' | 'maintenance' | 'college-dean' | 'president' | 'deployment-office' | 'driver';
  department?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  year: number;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
  capacity: number;
}

export interface TripRequest {
  id: string;
  requesterId: string;
  destination: string;
  purpose: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  vehicleId?: string;
  driverId?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  date: string;
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed';
}
