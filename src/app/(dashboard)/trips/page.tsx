"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Map, MapPin, Clock } from "lucide-react";
import { useState } from "react";

const tripsData = [
    { id: "T-001", vehicle: "Toyota Hilux", driver: "John Doe", from: "Addis Ababa", to: "Bahir Dar", distance: "565 km", duration: "8h 30m", status: "Completed", date: "2024-02-20" },
    { id: "T-002", vehicle: "Isuzu D-Max", driver: "Jane Smith", from: "Addis Ababa", to: "Hawassa", distance: "275 km", duration: "4h 15m", status: "In Progress", date: "2024-02-21" },
    { id: "T-003", vehicle: "Ford Transit", driver: "Mike Johnson", from: "Dire Dawa", to: "Harar", distance: "52 km", duration: "1h 10m", status: "Completed", date: "2024-02-20" },
    { id: "T-004", vehicle: "Hino 500", driver: "Sarah Williams", from: "Addis Ababa", to: "Mekelle", distance: "783 km", duration: "12h 45m", status: "Scheduled", date: "2024-02-22" },
    { id: "T-005", vehicle: "Mercedes Sprinter", driver: "David Brown", from: "Gondar", to: "Axum", distance: "243 km", duration: "4h 30m", status: "Completed", date: "2024-02-19" },
];

export default function TripsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTrips = tripsData.filter(trip =>
        trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driver.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Trips</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Trip
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                        <Map className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tripsData.length}</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tripsData.filter(t => t.status === "In Progress").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Active now</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tripsData.reduce((sum, trip) => sum + parseInt(trip.distance), 0).toLocaleString()} km
                        </div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search trips..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Trip History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredTrips.map((trip) => (
                            <div key={trip.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{trip.id}</p>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            trip.status === "Completed" 
                                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                                : trip.status === "In Progress"
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                        }`}>
                                            {trip.status}
                                        </span>
                                    </div>
                                    <p className="text-sm">{trip.vehicle} • {trip.driver}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {trip.from} → {trip.to}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{trip.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{trip.distance}</p>
                                    <p className="text-sm text-muted-foreground">{trip.duration}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
