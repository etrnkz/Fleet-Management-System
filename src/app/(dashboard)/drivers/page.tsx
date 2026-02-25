"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, User, Phone, Mail } from "lucide-react";
import { useState } from "react";

const driversData = [
    { id: "D-001", name: "John Doe", phone: "+251-911-234567", email: "john.doe@example.com", status: "Active", vehicle: "Toyota Hilux", license: "AA-123456" },
    { id: "D-002", name: "Jane Smith", phone: "+251-911-345678", email: "jane.smith@example.com", status: "Active", vehicle: "Isuzu D-Max", license: "AA-234567" },
    { id: "D-003", name: "Mike Johnson", phone: "+251-911-456789", email: "mike.j@example.com", status: "Active", vehicle: "Ford Transit", license: "AA-345678" },
    { id: "D-004", name: "Sarah Williams", phone: "+251-911-567890", email: "sarah.w@example.com", status: "Active", vehicle: "Hino 500", license: "AA-456789" },
    { id: "D-005", name: "David Brown", phone: "+251-911-678901", email: "david.b@example.com", status: "Off Duty", vehicle: "Unassigned", license: "AA-567890" },
];

export default function DriversPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDrivers = driversData.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Driver
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search drivers..."
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
                {filteredDrivers.map((driver) => (
                    <Card key={driver.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {driver.id}
                            </CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xl font-bold">{driver.name}</p>
                                    <p className="text-xs text-muted-foreground">License: {driver.license}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                        driver.status === "Active" 
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                    }`}>
                                        {driver.status}
                                    </span>
                                </div>
                                <div className="text-sm space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">{driver.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground text-xs">{driver.email}</span>
                                    </div>
                                    <p><span className="text-muted-foreground">Vehicle:</span> {driver.vehicle}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
