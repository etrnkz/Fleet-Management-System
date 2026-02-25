"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Navigation, Clock, Gauge, AlertCircle, RefreshCw, Maximize2, Minimize2 } from "lucide-react";

interface VehicleLocation {
    id: string;
    name: string;
    driver: string;
    lat: number;
    lng: number;
    speed: number;
    status: "moving" | "idle" | "stopped";
    lastUpdate: string;
}

export default function GPSTrackingPage() {
    const [vehicles, setVehicles] = useState<VehicleLocation[]>([
        { id: "V001", name: "Toyota Hiace", driver: "Abebe Kebede", lat: 9.4034, lng: 42.0839, speed: 45, status: "moving", lastUpdate: "Just now" },
        { id: "V002", name: "Isuzu D-Max", driver: "Tigist Alemu", lat: 9.4124, lng: 42.0739, speed: 0, status: "stopped", lastUpdate: "2 mins ago" },
        { id: "V003", name: "Toyota Land Cruiser", driver: "Dawit Tesfaye", lat: 9.3934, lng: 42.0939, speed: 30, status: "moving", lastUpdate: "Just now" },
        { id: "V004", name: "Mitsubishi Canter", driver: "Sara Mohammed", lat: 9.4234, lng: 42.0639, speed: 15, status: "idle", lastUpdate: "1 min ago" },
    ]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [showMap, setShowMap] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const handleTrackVehicle = (vehicleId: string) => {
        setShowMap(true);
        setSelectedVehicle(vehicleId);
        
        // Scroll to map after a short delay to ensure it's rendered
        setTimeout(() => {
            mapRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    };

    // Simulate real-time updates
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            setVehicles(prev => prev.map(vehicle => ({
                ...vehicle,
                lat: vehicle.lat + (Math.random() - 0.5) * 0.001,
                lng: vehicle.lng + (Math.random() - 0.5) * 0.001,
                speed: vehicle.status === "moving" ? Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10) : 0,
                lastUpdate: "Just now"
            })));
            setLastRefresh(new Date());
        }, 3000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "moving": return "text-green-600 bg-green-50";
            case "idle": return "text-amber-600 bg-amber-50";
            case "stopped": return "text-red-600 bg-red-50";
            default: return "text-gray-600 bg-gray-50";
        }
    };

    const getMarkerColor = (status: string) => {
        switch (status) {
            case "moving": return "#10b981";
            case "idle": return "#f59e0b";
            case "stopped": return "#ef4444";
            default: return "#6b7280";
        }
    };

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Real-time GPS Tracking</h2>
                    <p className="text-gray-500 mt-1">Monitor all vehicles in real-time</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`group border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-md ${autoRefresh ? 'bg-green-50 border-green-500' : ''}`}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 transition-all duration-300 ${autoRefresh ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                        <span className="transition-all duration-300">{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
                    </Button>
                    <Button 
                        onClick={() => setShowMap(!showMap)}
                        className="group bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                        {showMap ? <Minimize2 className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" /> : <Maximize2 className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />}
                        <span className="transition-all duration-300 group-hover:translate-x-0.5">{showMap ? 'Hide Map' : 'View Map'}</span>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="group cursor-pointer border-l-4 border-l-green-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-left-4 duration-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-green-600">Active Vehicles</CardTitle>
                        <Navigation className="h-5 w-5 text-green-600 transition-all duration-300 group-hover:rotate-45 group-hover:scale-110" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-600">{vehicles.filter(v => v.status === "moving").length}</div>
                        <p className="text-xs text-gray-500 mt-1">Currently on the road</p>
                    </CardContent>
                </Card>

                <Card className="group cursor-pointer border-l-4 border-l-amber-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-amber-600">Idle Vehicles</CardTitle>
                        <Clock className="h-5 w-5 text-amber-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-amber-600">{vehicles.filter(v => v.status === "idle").length}</div>
                        <p className="text-xs text-gray-500 mt-1">Engine running, not moving</p>
                    </CardContent>
                </Card>

                <Card className="group cursor-pointer border-l-4 border-l-red-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-left-4 duration-900 delay-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-red-600">Stopped</CardTitle>
                        <AlertCircle className="h-5 w-5 text-red-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-red-600">{vehicles.filter(v => v.status === "stopped").length}</div>
                        <p className="text-xs text-gray-500 mt-1">Parked or stopped</p>
                    </CardContent>
                </Card>

                <Card className="group cursor-pointer border-l-4 border-l-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-blue-600">Avg Speed</CardTitle>
                        <Gauge className="h-5 w-5 text-blue-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                            {Math.round(vehicles.reduce((acc, v) => acc + v.speed, 0) / vehicles.length)} km/h
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Fleet average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Map View */}
            {showMap && (
                <Card ref={mapRef} className="shadow-md animate-in slide-in-from-top-4 fade-in duration-500 scroll-mt-6">
                    <CardHeader className="border-b bg-gradient-to-r from-green-50 to-white">
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <MapPin className="h-5 w-5" />
                            Live Map View - Google Maps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative h-[500px]">
                            {/* Google Maps Embed */}
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31428.89!2d42.0839!3d9.4034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1631bf8f6e8e8e8f%3A0x1234567890abcdef!2sHaramaya%20University!5e0!3m2!1sen!2set!4v1234567890123!5m2!1sen!2set"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="rounded-b-lg"
                            ></iframe>

                            {/* Vehicle Overlay Markers */}
                            <div className="absolute inset-0 pointer-events-none">
                                {vehicles.map((vehicle, index) => {
                                    // Calculate position relative to map center (Haramaya University)
                                    const centerLat = 9.4034;
                                    const centerLng = 42.0839;
                                    const latDiff = (vehicle.lat - centerLat) * 8000; // Scale factor for positioning
                                    const lngDiff = (vehicle.lng - centerLng) * 8000;
                                    
                                    const x = 50 + lngDiff; // Center at 50%
                                    const y = 50 - latDiff; // Invert Y axis
                                    
                                    return (
                                        <div
                                            key={vehicle.id}
                                            className={`absolute group cursor-pointer transition-all duration-500 hover:scale-150 hover:z-50 pointer-events-auto ${
                                                selectedVehicle === vehicle.id ? 'scale-150 z-50' : ''
                                            }`}
                                            style={{
                                                left: `${x}%`,
                                                top: `${y}%`,
                                                transform: 'translate(-50%, -100%)',
                                                animation: `float ${2 + index * 0.5}s ease-in-out infinite`
                                            }}
                                            onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
                                        >
                                            {/* Pulsing Circle */}
                                            <div className="absolute -inset-4 rounded-full animate-ping opacity-75" style={{
                                                backgroundColor: getMarkerColor(vehicle.status),
                                                animationDuration: '2s'
                                            }}></div>
                                            
                                            {/* Marker */}
                                            <div className="relative">
                                                <svg className="h-10 w-10 drop-shadow-2xl transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill={getMarkerColor(vehicle.status)}>
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                                </svg>
                                                
                                                {/* Vehicle Icon */}
                                                <Navigation 
                                                    className="absolute top-1.5 left-1/2 -translate-x-1/2 h-4 w-4 text-white"
                                                    style={{
                                                        transform: `translateX(-50%) rotate(${vehicle.status === 'moving' ? 45 : 0}deg)`
                                                    }}
                                                />
                                            </div>

                                            {/* Info Popup */}
                                            <div className={`absolute left-12 top-0 bg-white rounded-lg shadow-2xl p-3 min-w-[200px] border-2 transition-all duration-300 ${
                                                selectedVehicle === vehicle.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
                                            }`} style={{ borderColor: getMarkerColor(vehicle.status) }}>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-sm">{vehicle.name}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                                                            {vehicle.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600">Driver: {vehicle.driver}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t">
                                                        <span className="flex items-center gap-1">
                                                            <Gauge className="h-3 w-3" />
                                                            {vehicle.speed} km/h
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {vehicle.lastUpdate}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Map Legend */}
                            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-4 fade-in duration-700 z-10">
                                <h4 className="font-semibold text-sm mb-2">Status Legend</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        <span className="text-xs">Moving</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                                        <span className="text-xs">Idle</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                        <span className="text-xs">Stopped</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Banner */}
                            <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-left-4 fade-in duration-700 z-10">
                                <p className="text-xs font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Haramaya University Fleet - Live Tracking
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Vehicle List */}
            <Card className="shadow-md">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-blue-600">
                            <MapPin className="h-5 w-5" />
                            Live Vehicle Tracking
                        </CardTitle>
                        <span className="text-xs text-gray-500">
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {vehicles.map((vehicle, index) => (
                            <div
                                key={vehicle.id}
                                className="group p-4 border border-gray-200 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:border-blue-400 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
                                onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 ${
                                            vehicle.status === 'moving' ? 'bg-green-100' :
                                            vehicle.status === 'idle' ? 'bg-amber-100' :
                                            'bg-red-100'
                                        }`}>
                                            <Navigation className={`h-6 w-6 transition-all duration-300 ${
                                                vehicle.status === 'moving' ? 'text-green-600' :
                                                vehicle.status === 'idle' ? 'text-amber-600' :
                                                'text-red-600'
                                            }`} style={{
                                                transform: vehicle.status === 'moving' ? 'rotate(45deg)' : 'rotate(0deg)'
                                            }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">{vehicle.name}</h3>
                                                <span className="text-xs text-gray-500">({vehicle.id})</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 group-hover:scale-110 ${getStatusColor(vehicle.status)}`}>
                                                    {vehicle.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">Driver: {vehicle.driver}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1 transition-all duration-300 hover:text-blue-600 hover:scale-105">
                                                    <MapPin className="h-3 w-3" />
                                                    {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                                                </span>
                                                <span className="flex items-center gap-1 transition-all duration-300 hover:text-green-600 hover:scale-105">
                                                    <Gauge className="h-3 w-3" />
                                                    {vehicle.speed} km/h
                                                </span>
                                                <span className="flex items-center gap-1 transition-all duration-300 hover:text-purple-600 hover:scale-105">
                                                    <Clock className="h-3 w-3" />
                                                    {vehicle.lastUpdate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="transition-all duration-300 group-hover:scale-110 hover:shadow-md hover:bg-blue-50 hover:border-blue-400"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTrackVehicle(vehicle.id);
                                        }}
                                    >
                                        <MapPin className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                                        Track
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
