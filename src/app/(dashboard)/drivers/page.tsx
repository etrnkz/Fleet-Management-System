"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, User, Phone, Mail, MapPin, Calendar, Award } from "lucide-react";
import { useState } from "react";
import { PageLoader } from "@/components/PageLoader";

const driversData = [
    { 
        id: "D-001", 
        name: "John Doe", 
        phone: "+251-911-234567", 
        email: "john.doe@example.com", 
        status: "Active", 
        vehicle: "Toyota Hilux (V-001)", 
        license: "AA-123456",
        licenseExpiry: "2026-05-15",
        experience: "8 years",
        trips: 245,
        rating: 4.8,
        joinDate: "2020-03-15"
    },
    { 
        id: "D-002", 
        name: "Jane Smith", 
        phone: "+251-911-345678", 
        email: "jane.smith@example.com", 
        status: "Active", 
        vehicle: "Isuzu D-Max (V-002)", 
        license: "AA-234567",
        licenseExpiry: "2025-08-20",
        experience: "5 years",
        trips: 189,
        rating: 4.9,
        joinDate: "2021-06-10"
    },
    { 
        id: "D-003", 
        name: "Mike Johnson", 
        phone: "+251-911-456789", 
        email: "mike.j@example.com", 
        status: "Active", 
        vehicle: "Ford Transit (V-004)", 
        license: "AA-345678",
        licenseExpiry: "2027-02-10",
        experience: "12 years",
        trips: 412,
        rating: 4.7,
        joinDate: "2019-01-20"
    },
    { 
        id: "D-004", 
        name: "Sarah Williams", 
        phone: "+251-911-567890", 
        email: "sarah.w@example.com", 
        status: "Active", 
        vehicle: "Hino 500 (V-005)", 
        license: "AA-456789",
        licenseExpiry: "2026-11-30",
        experience: "6 years",
        trips: 198,
        rating: 4.6,
        joinDate: "2020-09-05"
    },
    { 
        id: "D-005", 
        name: "David Brown", 
        phone: "+251-911-678901", 
        email: "david.b@example.com", 
        status: "Off Duty", 
        vehicle: "Unassigned", 
        license: "AA-567890",
        licenseExpiry: "2025-04-18",
        experience: "3 years",
        trips: 87,
        rating: 4.5,
        joinDate: "2022-02-14"
    },
    { 
        id: "D-006", 
        name: "Emily Davis", 
        phone: "+251-911-789012", 
        email: "emily.d@example.com", 
        status: "Active", 
        vehicle: "Mercedes Sprinter (V-003)", 
        license: "AA-678901",
        licenseExpiry: "2026-09-25",
        experience: "7 years",
        trips: 276,
        rating: 4.9,
        joinDate: "2020-05-22"
    },
];

export default function DriversPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredDrivers = driversData.filter(driver => {
        const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || driver.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activeDrivers = driversData.filter(d => d.status === "Active").length;
    const totalTrips = driversData.reduce((sum, d) => sum + d.trips, 0);
    const avgRating = (driversData.reduce((sum, d) => sum + d.rating, 0) / driversData.length).toFixed(1);

    return (
        <PageLoader>
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage driver profiles and assignments</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Driver
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driversData.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered drivers</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeDrivers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently on duty</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTrips}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Award className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgRating}</div>
                        <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search drivers..."
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
                        <option value="Off Duty">Off Duty</option>
                    </select>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDrivers.map((driver) => (
                    <Card key={driver.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                    {driver.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <CardTitle className="text-base">{driver.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{driver.id}</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                driver.status === "Active" 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}>
                                {driver.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{driver.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground truncate">{driver.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{driver.vehicle}</span>
                                </div>
                                <div className="pt-3 border-t space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">License:</span>
                                        <span className="font-medium">{driver.license}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Expires:</span>
                                        <span className="font-medium">{driver.licenseExpiry}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Experience:</span>
                                        <span className="font-medium">{driver.experience}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Trips:</span>
                                        <span className="font-medium">{driver.trips}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Rating:</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Award className="h-3 w-3 text-amber-500" />
                                            {driver.rating}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-3 flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        View Profile
                                    </Button>
                                    <Button size="sm" className="flex-1">
                                        Assign Vehicle
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
