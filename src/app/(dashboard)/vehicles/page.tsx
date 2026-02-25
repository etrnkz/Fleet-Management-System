"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Car, Gauge, Calendar, Wrench, Fuel } from "lucide-react";
import { useState } from "react";
import { PageLoader } from "@/components/PageLoader";

const vehiclesData = [
    { 
        id: "V-001", 
        name: "Toyota Hilux", 
        type: "Pickup", 
        status: "Active", 
        driver: "John Doe", 
        mileage: "45,230", 
        lastService: "2024-02-15",
        nextService: "2024-05-15",
        fuelLevel: "75%",
        year: "2020",
        plateNumber: "AA-12345",
        color: "White"
    },
    { 
        id: "V-002", 
        name: "Isuzu D-Max", 
        type: "Pickup", 
        status: "Active", 
        driver: "Jane Smith", 
        mileage: "32,100", 
        lastService: "2024-02-10",
        nextService: "2024-05-10",
        fuelLevel: "60%",
        year: "2021",
        plateNumber: "AA-23456",
        color: "Silver"
    },
    { 
        id: "V-003", 
        name: "Mercedes Sprinter", 
        type: "Van", 
        status: "Maintenance", 
        driver: "Unassigned", 
        mileage: "78,450", 
        lastService: "2024-01-28",
        nextService: "2024-02-25",
        fuelLevel: "30%",
        year: "2019",
        plateNumber: "AA-34567",
        color: "Black"
    },
    { 
        id: "V-004", 
        name: "Ford Transit", 
        type: "Van", 
        status: "Active", 
        driver: "Mike Johnson", 
        mileage: "56,890", 
        lastService: "2024-02-12",
        nextService: "2024-05-12",
        fuelLevel: "85%",
        year: "2020",
        plateNumber: "AA-45678",
        color: "Blue"
    },
    { 
        id: "V-005", 
        name: "Hino 500", 
        type: "Truck", 
        status: "Active", 
        driver: "Sarah Williams", 
        mileage: "120,340", 
        lastService: "2024-02-08",
        nextService: "2024-05-08",
        fuelLevel: "50%",
        year: "2018",
        plateNumber: "AA-56789",
        color: "Red"
    },
    { 
        id: "V-006", 
        name: "Toyota Coaster", 
        type: "Bus", 
        status: "Active", 
        driver: "Emily Davis", 
        mileage: "89,200", 
        lastService: "2024-02-05",
        nextService: "2024-05-05",
        fuelLevel: "70%",
        year: "2019",
        plateNumber: "AA-67890",
        color: "White"
    },
];

export default function VehiclesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredVehicles = vehiclesData.filter(vehicle => {
        const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || vehicle.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalVehicles = vehiclesData.length;
    const activeVehicles = vehiclesData.filter(v => v.status === "Active").length;
    const maintenanceVehicles = vehiclesData.filter(v => v.status === "Maintenance").length;
    const avgMileage = Math.round(vehiclesData.reduce((sum, v) => sum + parseInt(v.mileage.replace(/,/g, '')), 0) / vehiclesData.length);

    return (
        <PageLoader>
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your fleet vehicles</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Car className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVehicles}</div>
                        <p className="text-xs text-muted-foreground mt-1">In fleet</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Car className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeVehicles}</div>
                        <p className="text-xs text-muted-foreground mt-1">On the road</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maintenanceVehicles}</div>
                        <p className="text-xs text-muted-foreground mt-1">In service</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Mileage</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Gauge className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgMileage.toLocaleString()} km</div>
                        <p className="text-xs text-muted-foreground mt-1">Per vehicle</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vehicles..."
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
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <div className="flex items-center gap-3">
                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                                    vehicle.type === "Pickup" ? "bg-blue-500/10" :
                                    vehicle.type === "Van" ? "bg-purple-500/10" :
                                    vehicle.type === "Truck" ? "bg-orange-500/10" :
                                    "bg-green-500/10"
                                }`}>
                                    <Car className={`h-6 w-6 ${
                                        vehicle.type === "Pickup" ? "text-blue-500" :
                                        vehicle.type === "Van" ? "text-purple-500" :
                                        vehicle.type === "Truck" ? "text-orange-500" :
                                        "text-green-500"
                                    }`} />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{vehicle.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{vehicle.id}</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                vehicle.status === "Active" 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                    : vehicle.status === "Maintenance"
                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}>
                                {vehicle.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Type</p>
                                        <p className="font-medium">{vehicle.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Year</p>
                                        <p className="font-medium">{vehicle.year}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Plate Number</p>
                                        <p className="font-medium">{vehicle.plateNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Color</p>
                                        <p className="font-medium">{vehicle.color}</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Gauge className="h-3 w-3" />
                                            Mileage
                                        </span>
                                        <span className="font-medium">{vehicle.mileage} km</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Fuel className="h-3 w-3" />
                                            Fuel Level
                                        </span>
                                        <span className="font-medium">{vehicle.fuelLevel}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Last Service
                                        </span>
                                        <span className="font-medium">{vehicle.lastService}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Wrench className="h-3 w-3" />
                                            Next Service
                                        </span>
                                        <span className="font-medium">{vehicle.nextService}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                                        <span className="text-muted-foreground">Driver</span>
                                        <span className="font-medium">{vehicle.driver}</span>
                                    </div>
                                </div>
                                <div className="pt-3 flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        View Details
                                    </Button>
                                    <Button size="sm" className="flex-1">
                                        Assign Driver
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
        </PageLoader>
    );
}
