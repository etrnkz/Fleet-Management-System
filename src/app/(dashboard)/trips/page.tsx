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
        driver: "Abebe Kebede", 
        from: "Haramaya University", 
        to: "Dire Dawa", 
        distance: "18", 
        duration: "25m", 
        status: "Completed", 
        date: "2024-02-20",
        startTime: "06:00 AM",
        endTime: "06:25 AM",
        fuelUsed: "2.5 L",
        avgSpeed: "43 km/h",
        route: "Direct Route",
        fromCoords: { lat: 9.4034, lng: 42.0839 },
        toCoords: { lat: 9.5930, lng: 41.8661 }
    },
    { 
        id: "T-002", 
        vehicle: "Isuzu D-Max", 
        vehicleId: "V-002",
        driver: "Tigist Alemu", 
        from: "Haramaya University", 
        to: "Harar", 
        distance: "35", 
        duration: "45m", 
        status: "In Progress", 
        date: "2024-02-21",
        startTime: "08:00 AM",
        endTime: "Est. 08:45 AM",
        fuelUsed: "4.2 L",
        avgSpeed: "47 km/h",
        route: "Via Awaday",
        fromCoords: { lat: 9.4034, lng: 42.0839 },
        toCoords: { lat: 9.3142, lng: 42.1181 }
    },
    { 
        id: "T-003", 
        vehicle: "Ford Transit", 
        vehicleId: "V-004",
        driver: "Dawit Tesfaye", 
        from: "Dire Dawa", 
        to: "Haramaya University", 
        distance: "18", 
        duration: "28m", 
        status: "Completed", 
        date: "2024-02-20",
        startTime: "09:30 AM",
        endTime: "09:58 AM",
        fuelUsed: "2.8 L",
        avgSpeed: "39 km/h",
        route: "Direct Route",
        fromCoords: { lat: 9.5930, lng: 41.8661 },
        toCoords: { lat: 9.4034, lng: 42.0839 }
    },
    { 
        id: "T-004", 
        vehicle: "Hino 500", 
        vehicleId: "V-005",
        driver: "Sara Mohammed", 
        from: "Haramaya University", 
        to: "Jijiga", 
        distance: "95", 
        duration: "1h 45m", 
        status: "Scheduled", 
        date: "2024-02-22",
        startTime: "05:00 AM",
        endTime: "Est. 06:45 AM",
        fuelUsed: "Est. 12 L",
        avgSpeed: "54 km/h",
        route: "Via Harar",
        fromCoords: { lat: 9.4034, lng: 42.0839 },
        toCoords: { lat: 9.3497, lng: 42.7975 }
    },
    { 
        id: "T-005", 
        vehicle: "Mercedes Sprinter", 
        vehicleId: "V-003",
        driver: "Yohannes Tadesse", 
        from: "Harar", 
        to: "Haramaya University", 
        distance: "35", 
        duration: "42m", 
        status: "Completed", 
        date: "2024-02-19",
        startTime: "07:00 AM",
        endTime: "07:42 AM",
        fuelUsed: "4.5 L",
        avgSpeed: "50 km/h",
        route: "Via Awaday",
        fromCoords: { lat: 9.3142, lng: 42.1181 },
        toCoords: { lat: 9.4034, lng: 42.0839 }
    },
    { 
        id: "T-006", 
        vehicle: "Toyota Hilux", 
        vehicleId: "V-001",
        driver: "Abebe Kebede", 
        from: "Haramaya University", 
        to: "Chiro", 
        distance: "65", 
        duration: "1h 15m", 
        status: "Completed", 
        date: "2024-02-21",
        startTime: "06:30 AM",
        endTime: "07:45 AM",
        fuelUsed: "8.2 L",
        avgSpeed: "52 km/h",
        route: "Via Asebe Teferi",
        fromCoords: { lat: 9.4034, lng: 42.0839 },
        toCoords: { lat: 9.0833, lng: 40.8667 }
    },
];

export default function TripsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedTrip, setSelectedTrip] = useState<typeof tripsData[0] | null>(null);
    const [showRouteMap, setShowRouteMap] = useState(false);

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
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Map className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTrips}</div>
                        <p className="text-xs text-muted-foreground mt-1">This week</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressTrips}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active now</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MapPin className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDistance.toLocaleString()} km</div>
                        <p className="text-xs text-muted-foreground mt-1">This week</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                        {filteredTrips.map((trip, index) => (
                            <div 
                                key={trip.id} 
                                className="flex items-start justify-between border rounded-lg p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer animate-slideInLeft group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                                        trip.status === "Completed" 
                                            ? "bg-green-500/10 group-hover:bg-green-500/20" 
                                            : trip.status === "In Progress"
                                            ? "bg-blue-500/10 group-hover:bg-blue-500/20"
                                            : "bg-orange-500/10 group-hover:bg-orange-500/20"
                                    }`}>
                                        <Navigation className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${
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
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 group-hover:scale-105 ${
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
                                            <MapPin className="h-4 w-4 text-blue-500 transition-transform duration-300 group-hover:scale-125" />
                                            <span className="font-medium">{trip.from}</span>
                                            <span className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1">→</span>
                                            <MapPin className="h-4 w-4 text-green-500 transition-transform duration-300 group-hover:scale-125" />
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
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTrip(trip);
                                                setShowRouteMap(true);
                                            }}
                                            className="hover:bg-blue-50 hover:border-blue-500 transition-all duration-200"
                                        >
                                            <Map className="h-3 w-3 mr-1" />
                                            View Route
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Route Map Modal */}
            {showRouteMap && selectedTrip && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowRouteMap(false)}>
                    <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Map className="h-5 w-5" />
                                        Trip Route - {selectedTrip.id}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedTrip.from} → {selectedTrip.to}
                                    </p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setShowRouteMap(false)}
                                    className="hover:bg-red-100 dark:hover:bg-red-950"
                                >
                                    <Plus className="h-5 w-5 rotate-45 text-gray-600 dark:text-gray-400" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative h-[600px]">
                                {/* Google Maps Embed with Directions */}
                                <iframe
                                    src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${selectedTrip.fromCoords.lat},${selectedTrip.fromCoords.lng}&destination=${selectedTrip.toCoords.lat},${selectedTrip.toCoords.lng}&mode=driving`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="rounded-b-lg"
                                ></iframe>

                                {/* Trip Info Overlay */}
                                <div className="absolute top-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border-2 border-blue-500 animate-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">From</p>
                                                <p className="font-semibold text-sm">{selectedTrip.from}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">To</p>
                                                <p className="font-semibold text-sm">{selectedTrip.to}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                                                <Navigation className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Distance</p>
                                                <p className="font-semibold text-sm">{selectedTrip.distance} km</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Duration</p>
                                                <p className="font-semibold text-sm">{selectedTrip.duration}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="text-muted-foreground">Vehicle: <span className="font-medium text-foreground">{selectedTrip.vehicle}</span></span>
                                            <span className="text-muted-foreground">Driver: <span className="font-medium text-foreground">{selectedTrip.driver}</span></span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            selectedTrip.status === "Completed" 
                                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                                : selectedTrip.status === "In Progress"
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                        }`}>
                                            {selectedTrip.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Route Legend */}
                                <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 animate-in slide-in-from-bottom-4 duration-700">
                                    <h4 className="font-semibold text-sm mb-3">Route Information</h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                            <span>Starting Point</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                            <span>Destination</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-0.5 w-6 bg-blue-500"></div>
                                            <span>Route Path</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                                        <p>Route: {selectedTrip.route}</p>
                                        <p className="mt-1">Avg Speed: {selectedTrip.avgSpeed}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
        </PageLoader>
    );
}
