"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Map, MapPin, Clock, Navigation, TrendingUp } from "lucide-react";
import { useState } from "react";
import { PageLoader } from "@/components/PageLoader";

const tripsData = [
    { 
        id: "T-001", 
        vehicle: "Toyota Hilux", 
        vehicleId: "V-001",
        driver: "John Doe", 
        from: "Addis Ababa", 
        to: "Bahir Dar", 
        distance: "565", 
        duration: "8h 30m", 
        status: "Completed", 
        date: "2024-02-20",
        startTime: "06:00 AM",
        endTime: "02:30 PM",
        fuelUsed: "45.5 L",
        avgSpeed: "66 km/h",
        route: "Via Debre Markos"
    },
    { 
        id: "T-002", 
        vehicle: "Isuzu D-Max", 
        vehicleId: "V-002",
        driver: "Jane Smith", 
        from: "Addis Ababa", 
        to: "Hawassa", 
        distance: "275", 
        duration: "4h 15m", 
        status: "In Progress", 
        date: "2024-02-21",
        startTime: "08:00 AM",
        endTime: "Est. 12:15 PM",
        fuelUsed: "22.3 L",
        avgSpeed: "65 km/h",
        route: "Via Mojo"
    },
    { 
        id: "T-003", 
        vehicle: "Ford Transit", 
        vehicleId: "V-004",
        driver: "Mike Johnson", 
        from: "Dire Dawa", 
        to: "Harar", 
        distance: "52", 
        duration: "1h 10m", 
        status: "Completed", 
        date: "2024-02-20",
        startTime: "09:30 AM",
        endTime: "10:40 AM",
        fuelUsed: "8.2 L",
        avgSpeed: "45 km/h",
        route: "Direct Route"
    },
    { 
        id: "T-004", 
        vehicle: "Hino 500", 
        vehicleId: "V-005",
        driver: "Sarah Williams", 
        from: "Addis Ababa", 
        to: "Mekelle", 
        distance: "783", 
        duration: "12h 45m", 
        status: "Scheduled", 
        date: "2024-02-22",
        startTime: "05:00 AM",
        endTime: "Est. 05:45 PM",
        fuelUsed: "Est. 85 L",
        avgSpeed: "61 km/h",
        route: "Via Dessie"
    },
    { 
        id: "T-005", 
        vehicle: "Mercedes Sprinter", 
        vehicleId: "V-003",
        driver: "David Brown", 
        from: "Gondar", 
        to: "Axum", 
        distance: "243", 
        duration: "4h 30m", 
        status: "Completed", 
        date: "2024-02-19",
        startTime: "07:00 AM",
        endTime: "11:30 AM",
        fuelUsed: "28.5 L",
        avgSpeed: "54 km/h",
        route: "Via Shire"
    },
    { 
        id: "T-006", 
        vehicle: "Toyota Hilux", 
        vehicleId: "V-001",
        driver: "John Doe", 
        from: "Bahir Dar", 
        to: "Addis Ababa", 
        distance: "565", 
        duration: "8h 15m", 
        status: "Completed", 
        date: "2024-02-21",
        startTime: "06:30 AM",
        endTime: "02:45 PM",
        fuelUsed: "44.8 L",
        avgSpeed: "68 km/h",
        route: "Via Debre Markos"
    },
];

export default function TripsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredTrips = tripsData.filter(trip => {
        const matchesSearch = trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.to.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || trip.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalTrips = tripsData.length;
    const inProgressTrips = tripsData.filter(t => t.status === "In Progress").length;
    const totalDistance = tripsData.reduce((sum, trip) => sum + parseInt(trip.distance), 0);
    const completedTrips = tripsData.filter(t => t.status === "Completed").length;

    return (
        <PageLoader>
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Trips</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track and manage vehicle trips</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Trip
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Map className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTrips}</div>
                        <p className="text-xs text-muted-foreground mt-1">This week</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressTrips}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active now</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDistance.toLocaleString()} km</div>
                        <p className="text-xs text-muted-foreground mt-1">This week</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedTrips}</div>
                        <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search trips..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-md border border-input bg-background text-sm"
                    >
                        <option value="All">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Scheduled">Scheduled</option>
                    </select>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Trip History</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredTrips.length} of {tripsData.length} trips
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredTrips.map((trip) => (
                            <div key={trip.id} className="flex items-start justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                                        trip.status === "Completed" 
                                            ? "bg-green-500/10" 
                                            : trip.status === "In Progress"
                                            ? "bg-blue-500/10"
                                            : "bg-orange-500/10"
                                    }`}>
                                        <Navigation className={`h-6 w-6 ${
                                            trip.status === "Completed" 
                                                ? "text-green-500" 
                                                : trip.status === "In Progress"
                                                ? "text-blue-500"
                                                : "text-orange-500"
                                        }`} />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium text-lg">{trip.id}</p>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                trip.status === "Completed" 
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                                    : trip.status === "In Progress"
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                    : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                            }`}>
                                                {trip.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{trip.vehicle} ({trip.vehicleId})</p>
                                            <p className="text-sm text-muted-foreground">Driver: {trip.driver}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium">{trip.from}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <MapPin className="h-4 w-4 text-green-500" />
                                            <span className="font-medium">{trip.to}</span>
                                            <span className="text-muted-foreground ml-2">({trip.route})</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
                                            <div>
                                                <p className="text-muted-foreground text-xs">Date</p>
                                                <p className="font-medium">{trip.date}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Time</p>
                                                <p className="font-medium">{trip.startTime} - {trip.endTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Fuel Used</p>
                                                <p className="font-medium">{trip.fuelUsed}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Avg Speed</p>
                                                <p className="font-medium">{trip.avgSpeed}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right space-y-2 ml-4">
                                    <div>
                                        <p className="text-2xl font-bold">{trip.distance} km</p>
                                        <p className="text-sm text-muted-foreground">{trip.duration}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            View Route
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
        </PageLoader>
    );
}
