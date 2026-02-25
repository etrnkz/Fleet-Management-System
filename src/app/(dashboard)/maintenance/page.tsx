"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

const maintenanceData = [
    { id: "M-001", vehicle: "Mercedes Sprinter", type: "Oil Change", status: "Pending", scheduledDate: "2024-02-25", cost: "1,500 ETB", priority: "High" },
    { id: "M-002", vehicle: "Toyota Hilux", type: "Tire Replacement", status: "Completed", scheduledDate: "2024-02-15", cost: "8,000 ETB", priority: "Medium" },
    { id: "M-003", vehicle: "Hino 500", type: "Brake Service", status: "In Progress", scheduledDate: "2024-02-21", cost: "5,500 ETB", priority: "High" },
    { id: "M-004", vehicle: "Ford Transit", type: "General Inspection", status: "Scheduled", scheduledDate: "2024-02-28", cost: "2,000 ETB", priority: "Low" },
    { id: "M-005", vehicle: "Isuzu D-Max", type: "Engine Tune-up", status: "Completed", scheduledDate: "2024-02-10", cost: "4,200 ETB", priority: "Medium" },
];

export default function MaintenancePage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredMaintenance = maintenanceData.filter(item =>
        item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = maintenanceData.filter(m => m.status === "Pending" || m.status === "Scheduled").length;
    const completedCount = maintenanceData.filter(m => m.status === "Completed").length;

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Maintenance
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {maintenanceData.reduce((sum, item) => sum + parseFloat(item.cost.replace(/[^0-9.]/g, '')), 0).toLocaleString()} ETB
                        </div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search maintenance records..."
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
                    <CardTitle>Maintenance Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredMaintenance.map((item) => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{item.id}</p>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            item.priority === "High" 
                                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                                                : item.priority === "Medium"
                                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                        }`}>
                                            {item.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm">{item.vehicle}</p>
                                    <p className="text-sm text-muted-foreground">{item.type}</p>
                                    <p className="text-xs text-muted-foreground">Scheduled: {item.scheduledDate}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{item.cost}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
