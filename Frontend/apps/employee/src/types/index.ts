export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TripRequest {
  id: string;
  requestId: string;
  destination: string;
  date: string;
  status: "Pending" | "Confirmed" | "Completed";
  driver?: string;
  vehicle?: string;
}

export interface TripAlert {
  id: string;
  type: "delayed" | "confirmed" | "assigned" | "completed";
  title: string;
  message: string;
  time: string;
}

export interface DashboardStats {
  activeTrips: number;
  pendingRequests: number;
  upcomingTrips: number;
  completedTrips: number;
}
