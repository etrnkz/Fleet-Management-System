"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Fuel, TrendingDown, TrendingUp, Calendar, DollarSign, Droplet } from "lucide-react";
import { useState } from "react";
import { PageLoader } from "@/components/PageLoader";

const fuelData = [
    { 
        id: "F-001", 
        vehicle: "Toyota Hilux", 
        vehicleId: "V-001",
        date: "2024-02-20", 
        time: "08:30 AM",
        amount: "45.5", 
        cost: "2,275", 
        pricePerLiter: "50.00",
        station: "Total Station", 
        driver: "John Doe",
        odometer: "45,230",
        fuelType: "Diesel"
    },
    { 
        id: "F-002", 
        vehicle: "Isuzu D-Max", 
        vehicleId: "V-002",
        date: "2024-02-19", 
        time: "02:15 PM",
        amount: "38.2", 
        cost: "1,910", 
        pricePerLiter: "50.00",
        station: "Shell Station", 
        driver: "Jane Smith",
        odometer: "32,100",
        fuelType: "Diesel"
    },
    { 
        id: "F-003", 
        vehicle: "Ford Transit", 
        vehicleId: "V-004",
        date: "2024-02-19", 
        time: "10:45 AM",
        amount: "52.0", 
        cost: "2,600", 
        pricePerLiter: "50.00",
        station: "Total Station", 
        driver: "Mike Johnson",
        odometer: "56,890",
        fuelType: "Diesel"
    },
    { 
        id: "F-004", 
        vehicle: "Hino 500", 
        vehicleId: "V-005",
        date: "2024-02-18", 
        time: "03:20 PM",
        amount: "85.5", 
        cost: "4,275", 
        pricePerLiter: "50.00",
        station: "Oilibya Station", 
        driver: "Sarah Williams",
        odometer: "120,340",
        fuelType: "Diesel"
    },
    { 
        id: "F-005", 
        vehicle: "Toyota Hilux", 
        vehicleId: "V-001",
        date: "2024-02-17", 
        time: "09:00 AM",
        amount: "42.0", 
        cost: "2,100", 
        pricePerLiter: "50.00",
        station: "Shell Station", 
        driver: "John Doe",
        odometer: "44,890",
        fuelType: "Diesel"
    },
    { 
        id: "F-006", 
        vehicle: "Mercedes Sprinter", 
        vehicleId: "V-003",
        date: "2024-02-17", 
        time: "11:30 AM",
        amount: "48.3", 
        cost: "2,415", 
        pricePerLiter: "50.00",
        station: "Total Station", 
        driver: "Emily Davis",
        odometer: "78,450",
        fuelType: "Diesel"
    },
];

export default function FuelPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("All");

    const filteredFuel = fuelData.filter(fuel =>
        fuel.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fuel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fuel.driver.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalLiters = fuelData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalCost = fuelData.reduce((sum, item) => sum + parseFloat(item.cost.replace(/,/g, '')), 0);
    const avgPricePerLiter = totalCost / totalLiters;
    const avgConsumption = totalLiters / fuelData.length;

    return (
        <PageLoader>
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fuel Management</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track and analyze fuel consumption</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Fuel Entry
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Droplet className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLiters.toFixed(1)} L</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingDown className="h-3 w-3 text-green-500" />
                            <span className="text-green-500 font-medium">-5%</span> from last week
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCost.toLocaleString()} ETB</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-red-500" />
                            <span className="text-red-500 font-medium">+3%</span> from last week
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Price/L</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Fuel className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgPricePerLiter.toFixed(2)} ETB</div>
                        <p className="text-xs text-muted-foreground mt-1">Current rate</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Consumption</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Fuel className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgConsumption.toFixed(1)} L</div>
                        <p className="text-xs text-muted-foreground mt-1">Per refill</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search fuel records..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 rounded-md border border-input bg-background text-sm"
                    >
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="Week">This Week</option>
                        <option value="Month">This Month</option>
                    </select>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Fuel Entries</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredFuel.length} of {fuelData.length} entries
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredFuel.map((fuel, index) => (
                            <div 
                                key={fuel.id} 
                                className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer animate-slideInLeft group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                                        <Fuel className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-lg">{fuel.vehicle}</p>
                                            <span className="text-xs text-muted-foreground">({fuel.vehicleId})</span>
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 transition-all duration-200 group-hover:scale-105">
                                                {fuel.fuelType}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground text-xs">Driver</p>
                                                <p className="font-medium">{fuel.driver}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Station</p>
                                                <p className="font-medium">{fuel.station}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Date & Time</p>
                                                <p className="font-medium">{fuel.date} {fuel.time}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Odometer</p>
                                                <p className="font-medium">{fuel.odometer} km</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right space-y-1 ml-4">
                                    <div className="flex items-center gap-2">
                                        <Droplet className="h-4 w-4 text-blue-500 transition-transform duration-300 group-hover:scale-125" />
                                        <p className="text-2xl font-bold">{fuel.amount} L</p>
                                    </div>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400 transition-all duration-300 group-hover:scale-105">{fuel.cost} ETB</p>
                                    <p className="text-xs text-muted-foreground">{fuel.pricePerLiter} ETB/L</p>
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
