"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, FileText, Calendar, Download, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

const documentsData = [
    { id: "DOC-001", name: "Vehicle Registration - Toyota Hilux", type: "Registration", vehicle: "Toyota Hilux (V-001)", expiryDate: "2025-06-15", uploadDate: "2024-01-10", status: "Valid", size: "2.4 MB" },
    { id: "DOC-002", name: "Insurance Policy - Isuzu D-Max", type: "Insurance", vehicle: "Isuzu D-Max (V-002)", expiryDate: "2024-12-31", uploadDate: "2024-01-15", status: "Valid", size: "1.8 MB" },
    { id: "DOC-003", name: "Driver License - John Doe", type: "License", vehicle: "N/A", expiryDate: "2026-03-20", uploadDate: "2024-01-20", status: "Valid", size: "856 KB" },
    { id: "DOC-004", name: "Vehicle Registration - Mercedes Sprinter", type: "Registration", vehicle: "Mercedes Sprinter (V-003)", expiryDate: "2024-03-10", uploadDate: "2023-12-05", status: "Expiring Soon", size: "2.1 MB" },
    { id: "DOC-005", name: "Insurance Policy - Hino 500", type: "Insurance", vehicle: "Hino 500 (V-005)", expiryDate: "2024-11-25", uploadDate: "2024-01-08", status: "Valid", size: "1.9 MB" },
    { id: "DOC-006", name: "Driver License - Jane Smith", type: "License", vehicle: "N/A", expiryDate: "2025-08-14", uploadDate: "2024-01-12", status: "Valid", size: "742 KB" },
    { id: "DOC-007", name: "Maintenance Certificate - Ford Transit", type: "Certificate", vehicle: "Ford Transit (V-004)", expiryDate: "2024-09-30", uploadDate: "2024-02-01", status: "Valid", size: "1.2 MB" },
    { id: "DOC-008", name: "Road Tax Receipt - Toyota Hilux", type: "Tax", vehicle: "Toyota Hilux (V-001)", expiryDate: "2024-12-31", uploadDate: "2024-01-05", status: "Valid", size: "456 KB" },
];

const documentTypes = [
    { name: "All Documents", count: documentsData.length, color: "blue" },
    { name: "Registration", count: documentsData.filter(d => d.type === "Registration").length, color: "green" },
    { name: "Insurance", count: documentsData.filter(d => d.type === "Insurance").length, color: "purple" },
    { name: "License", count: documentsData.filter(d => d.type === "License").length, color: "orange" },
    { name: "Certificate", count: documentsData.filter(d => d.type === "Certificate").length, color: "cyan" },
];

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("All Documents");

    const filteredDocuments = documentsData.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "All Documents" || doc.type === selectedType;
        return matchesSearch && matchesType;
    });

    const expiringCount = documentsData.filter(d => d.status === "Expiring Soon").length;

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage all fleet documents and certificates</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documentsData.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">All documents</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiringCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires renewal</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valid</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {documentsData.filter(d => d.status === "Valid").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Up to date</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12.4 MB</div>
                        <p className="text-xs text-muted-foreground mt-1">Of 1 GB used</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {documentTypes.map((type) => (
                    <button
                        key={type.name}
                        onClick={() => setSelectedType(type.name)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedType === type.name
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                        {type.name} ({type.count})
                    </button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Library</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredDocuments.length} of {documentsData.length} documents
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                        doc.type === "Registration" ? "bg-green-500/10" :
                                        doc.type === "Insurance" ? "bg-purple-500/10" :
                                        doc.type === "License" ? "bg-orange-500/10" :
                                        doc.type === "Certificate" ? "bg-cyan-500/10" :
                                        "bg-blue-500/10"
                                    }`}>
                                        <FileText className={`h-5 w-5 ${
                                            doc.type === "Registration" ? "text-green-500" :
                                            doc.type === "Insurance" ? "text-purple-500" :
                                            doc.type === "License" ? "text-orange-500" :
                                            doc.type === "Certificate" ? "text-cyan-500" :
                                            "text-blue-500"
                                        }`} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{doc.name}</p>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                doc.status === "Valid" 
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                                    : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                            }`}>
                                                {doc.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {doc.type}
                                            </span>
                                            <span>•</span>
                                            <span>{doc.vehicle}</span>
                                            <span>•</span>
                                            <span>{doc.size}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>Uploaded: {doc.uploadDate}</span>
                                            <span>•</span>
                                            <span>Expires: {doc.expiryDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" className="gap-2">
                                        <Eye className="h-4 w-4" />
                                        View
                                    </Button>
                                    <Button size="sm" variant="ghost" className="gap-2">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="gap-2 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
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
