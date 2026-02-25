"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, FileText, File, Calendar } from "lucide-react";
import { useState } from "react";

const documentsData = [
    { id: "DOC-001", name: "Vehicle Registration - Toyota Hilux", type: "Registration", vehicle: "Toyota Hilux", expiryDate: "2025-06-15", status: "Valid" },
    { id: "DOC-002", name: "Insurance Policy - Isuzu D-Max", type: "Insurance", vehicle: "Isuzu D-Max", expiryDate: "2024-12-31", status: "Valid" },
    { id: "DOC-003", name: "Driver License - John Doe", type: "License", vehicle: "N/A", expiryDate: "2026-03-20", status: "Valid" },
    { id: "DOC-004", name: "Vehicle Registration - Mercedes Sprinter", type: "Registration", vehicle: "Mercedes Sprinter", expiryDate: "2024-03-10", status: "Expiring Soon" },
    { id: "DOC-005", name: "Insurance Policy - Hino 500", type: "Insurance", vehicle: "Hino 500", expiryDate: "2024-11-25", status: "Valid" },
    { id: "DOC-006", name: "Driver License - Jane Smith", type: "License", vehicle: "N/A", expiryDate: "2025-08-14", status: "Valid" },
];

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDocuments = documentsData.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const expiringCount = documentsData.filter(d => d.status === "Expiring Soon").length;

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documentsData.length}</div>
                        <p className="text-xs text-muted-foreground">All documents</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiringCount}</div>
                        <p className="text-xs text-muted-foreground">Requires renewal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valid</CardTitle>
                        <File className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {documentsData.filter(d => d.status === "Valid").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Up to date</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
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
                    <CardTitle>Document Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{doc.name}</p>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            doc.status === "Valid" 
                                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                                : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{doc.type} • {doc.vehicle}</p>
                                    <p className="text-xs text-muted-foreground">Expires: {doc.expiryDate}</p>
                                </div>
                                <Button size="sm" variant="ghost">
                                    View
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
