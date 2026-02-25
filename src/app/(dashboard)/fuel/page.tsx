"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Fuel, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

const fuelData = [
    { id: "F-001", vehicle: "Toyota Hilux", date: "2024-02-20", amount: "45.5 L", cost: "2,275 ETB", station: "Total Station", driver: "John Doe" },
    { id: "F-002", vehicle: "Isuzu D-Max", date: "2024-02-19", amount: "38.2 L", cost: "1,910 ETB", station: "Shell Station", driver: "Jane Smith" },
    { id: "F-003", vehicle: "Ford Transit", date: "2024-02-19", amount: "52.0 L", cost: "2,600 ETB", station: "Total Station", driver: "Mike Johnson" },
    { id: "F-004", vehicle: "Hino 500", date: "2024-02-18", amount: "85.5 L", cost: "4,275 ETB", station: "Oilibya Station", driver: "Sarah Williams" },
    { id: "F-005", vehicle: "Toyota Hilux", date: "2024-02-17", amount: "42.0 L", cost: "2,100 ETB", station: "Shell Station", driver: "John Doe" },
];

export default function FuelPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFuel = fuelData.filter(fuel =>
        fuel.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fuel.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalLiters = fuelData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalCost = fuelData.reduce((sum, item) => sum + parseFloat(item.cost.replace(/[^0-9.]/g, '')), 0);

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Fuel Management</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Fuel Entry
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLiters.toFixed(1)} L</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-green-500" />
                            -5% from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCost.toLocaleString()} ETB</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-red-500" />
                            +3% from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Price/L</CardTitle>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(totalCost / totalLiters).toFixed(2)} ETB</div>
                        <p className="text-xs text-muted-foreground">Current rate</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search fuel records..."
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
                    <CardTitle>Recent Fuel Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredFuel.map((fuel) => (
                            <div key={fuel.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <p className="font-medium">{fuel.vehicle}</p>
                                    <p className="text-sm text-muted-foreground">{fuel.driver} • {fuel.station}</p>
                                    <p className="text-xs text-muted-foreground">{fuel.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{fuel.amount}</p>
                                    <p className="text-sm text-muted-foreground">{fuel.cost}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
