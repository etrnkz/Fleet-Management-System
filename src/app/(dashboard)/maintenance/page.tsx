"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Wrench, AlertTriangle, CheckCircle, Clock, Calendar } from "lucide-react";
import { useState } from "react";
import { PageLoader } from "@/components/PageLoader";

const maintenanceData = [
    { 
        id: "M-001", 
        vehicle: "Mercedes Sprinter", 
        vehicleId: "V-003",
        type: "Oil Change", 
        status: "Pending", 
        scheduledDate: "2024-02-25",
        scheduledTime: "09:00 AM",
        cost: "1,500", 
        priority: "High",
        description: "Regular oil change service",
        lastService: "2023-11-25",
        mileage: "78,450 km",
        technician: "Unassigned"
    },
    { 
        id: "M-002", 
        vehicle: "Toyota Hilux", 
        vehicleId: "V-001",
        type: "Tire Replacement", 
        status: "Completed", 
        scheduledDate: "2024-02-15",
        scheduledTime: "10:30 AM",
        cost: "8,000", 
        priority: "Medium",
        description: "Replace all four tires",
        lastService: "2024-02-15",
        mileage: "45,230 km",
        technician: "Ahmed Ali"
    },
    { 
        id: "M-003", 
        vehicle: "Hino 500", 
        vehicleId: "V-005",
        type: "Brake Service", 
        status: "In Progress", 
        scheduledDate: "2024-02-21",
        scheduledTime: "02:00 PM",
        cost: "5,500", 
        priority: "High",
        description: "Brake pad replacement and inspection",
        lastService: "2023-08-21",
        mileage: "120,340 km",
        technician: "Mohammed Hassan"
    },
    { 
        id: "M-004", 
        vehicle: "Ford Transit", 
        vehicleId: "V-004",
        type: "General Inspection", 
        status: "Scheduled", 
        scheduledDate: "2024-02-28",
        scheduledTime: "11:00 AM",
        cost: "2,000", 
        priority: "Low",
        description: "Routine vehicle inspection",
        lastService: "2023-11-28",
        mileage: "56,890 km",
        technician: "Unassigned"
    },
    { 
        id: "M-005", 
        vehicle: "Isuzu D-Max", 
        vehicleId: "V-002",
        type: "Engine Tune-up", 
        status: "Completed", 
        scheduledDate: "2024-02-10",
        scheduledTime: "08:30 AM",
        cost: "4,200", 
        priority: "Medium",
        description: "Complete engine tune-up service",
        lastService: "2024-02-10",
        mileage: "32,100 km",
        technician: "Yohannes Tesfaye"
    },
    { 
        id: "M-006", 
        vehicle: "Toyota Hilux", 
        vehicleId: "V-001",
        type: "Battery Replacement", 
        status: "Scheduled", 
        scheduledDate: "2024-03-05",
        scheduledTime: "03:00 PM",
        cost: "3,200", 
        priority: "Medium",
        description: "Replace vehicle battery",
        lastService: "2021-03-05",
        mileage: "45,230 km",
        technician: "Unassigned"
    },
];

export default function MaintenancePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredMaintenance = maintenanceData.filter(item => {
        const matchesSearch = item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = maintenanceData.filter(m => m.status === "Pending" || m.status === "Scheduled").length;
    const completedCount = maintenanceData.filter(m => m.status === "Completed").length;
    const inProgressCount = maintenanceData.filter(m => m.status === "In Progress").length;
    const totalCost = maintenanceData.reduce((sum, item) => sum + parseFloat(item.cost.replace(/,/g, '')), 0);

    return (
        <PageLoader>
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
                    <p className="text-sm text-muted-foreground mt-1">Schedule and track vehicle maintenance</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Maintenance
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently servicing</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCost.toLocaleString()} ETB</div>
                        <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search maintenance records..."
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
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Maintenance Schedule</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredMaintenance.length} of {maintenanceData.length} records
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredMaintenance.map((item) => (
                            <div key={item.id} className="flex items-start justify-between border rounded-lg p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                                        item.status === "Completed" 
                                            ? "bg-green-500/10" 
                                            : item.status === "In Progress"
                                            ? "bg-blue-500/10"
                                            : item.status === "Pending"
                                            ? "bg-orange-500/10"
                                            : "bg-gray-500/10"
                                    }`}>
                                        <Wrench className={`h-6 w-6 ${
                                            item.status === "Completed" 
                                                ? "text-green-500" 
                                                : item.status === "In Progress"
                                                ? "text-blue-500"
                                                : item.status === "Pending"
                                                ? "text-orange-500"
                                                : "text-gray-500"
                                        }`} />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium text-lg">{item.id}</p>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.status === "Completed" 
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                                    : item.status === "In Progress"
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                    : item.status === "Pending"
                                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                            }`}>
                                                {item.status}
                                            </span>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.priority === "High" 
                                                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                                                    : item.priority === "Medium"
                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                            }`}>
                                                {item.priority} Priority
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.vehicle} ({item.vehicleId})</p>
                                            <p className="text-sm text-muted-foreground">{item.type}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
                                            <div>
                                                <p className="text-muted-foreground text-xs">Scheduled</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {item.scheduledDate}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{item.scheduledTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Technician</p>
                                                <p className="font-medium">{item.technician}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Mileage</p>
                                                <p className="font-medium">{item.mileage}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Last Service</p>
                                                <p className="font-medium">{item.lastService}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right space-y-2 ml-4">
                                    <p className="text-2xl font-bold">{item.cost} ETB</p>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                        <Button size="sm">
                                            Edit
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
