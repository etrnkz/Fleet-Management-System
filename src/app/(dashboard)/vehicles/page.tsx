"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Car } from "lucide-react";
import { useState } from "react";

const vehiclesData = [
    { id: "V-001", name: "Toyota Hilux", type: "Pickup", status: "Active", driver: "John Doe", mileage: "45,230 km", lastService: "2024-02-15" },
    { id: "V-002", name: "Isuzu D-Max", type: "Pickup", status: "Active", driver: "Jane Smith", mileage: "32,100 km", lastService: "2024-02-10" },
    { id: "V-003", name: "Mercedes Sprinter", type: "Van", status: "Maintenance", driver: "Unassigned", mileage: "78,450 km", lastService: "2024-01-28" },
    { id: "V-004", name: "Ford Transit", type: "Van", status: "Active", driver: "Mike Johnson", mileage: "56,890 km", lastService: "2024-02-12" },
    { id: "V-005", name: "Hino 500", type: "Truck", status: "Active", driver: "Sarah Williams", mileage: "120,340 km", lastService: "2024-02-08" },
];

export default function VehiclesPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredVehicles = vehiclesData.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vehicles..."
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {vehicle.id}
                            </CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xl font-bold">{vehicle.name}</p>
                                    <p className="text-xs text-muted-foreground">{vehicle.type}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                        vehicle.status === "Active" 
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                            : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                    }`}>
                                        {vehicle.status}
                                    </span>
                                </div>
                                <div className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Driver:</span> {vehicle.driver}</p>
                                    <p><span className="text-muted-foreground">Mileage:</span> {vehicle.mileage}</p>
                                    <p><span className="text-muted-foreground">Last Service:</span> {vehicle.lastService}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
