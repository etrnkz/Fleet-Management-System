"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileBarChart, Download, Calendar, TrendingUp, FileText, BarChart3, PieChart, Activity } from "lucide-react";

const reportTypes = [
    { 
        name: "Fleet Performance", 
        description: "Overall fleet efficiency and utilization metrics", 
        icon: TrendingUp, 
        period: "Monthly",
        color: "blue",
        lastGenerated: "Feb 1, 2024",
        size: "2.4 MB"
    },
    { 
        name: "Fuel Consumption", 
        description: "Detailed fuel usage and cost analysis", 
        icon: Activity, 
        period: "Weekly",
        color: "green",
        lastGenerated: "Feb 18, 2024",
        size: "1.8 MB"
    },
    { 
        name: "Maintenance Summary", 
        description: "Maintenance costs and schedule overview", 
        icon: FileText, 
        period: "Monthly",
        color: "orange",
        lastGenerated: "Feb 1, 2024",
        size: "1.2 MB"
    },
    { 
        name: "Driver Performance", 
        description: "Driver efficiency and safety metrics", 
        icon: BarChart3, 
        period: "Monthly",
        color: "purple",
        lastGenerated: "Feb 1, 2024",
        size: "1.5 MB"
    },
    { 
        name: "Trip Analytics", 
        description: "Route optimization and trip statistics", 
        icon: PieChart, 
        period: "Weekly",
        color: "cyan",
        lastGenerated: "Feb 18, 2024",
        size: "2.1 MB"
    },
    { 
        name: "Cost Analysis", 
        description: "Comprehensive cost breakdown and trends", 
        icon: FileBarChart, 
        period: "Quarterly",
        color: "rose",
        lastGenerated: "Jan 1, 2024",
        size: "3.2 MB"
    },
];

const recentReports = [
    {
        name: "Fleet Performance Report - January 2024",
        type: "Fleet Performance",
        date: "Feb 1, 2024",
        size: "2.4 MB",
        downloads: 12,
        status: "Ready"
    },
    {
        name: "Fuel Consumption Report - Week 7",
        type: "Fuel Consumption",
        date: "Feb 18, 2024",
        size: "1.8 MB",
        downloads: 8,
        status: "Ready"
    },
    {
        name: "Maintenance Summary - January 2024",
        type: "Maintenance Summary",
        date: "Feb 1, 2024",
        size: "1.2 MB",
        downloads: 15,
        status: "Ready"
    },
    {
        name: "Driver Performance - January 2024",
        type: "Driver Performance",
        date: "Feb 1, 2024",
        size: "1.5 MB",
        downloads: 10,
        status: "Ready"
    },
    {
        name: "Trip Analytics - Week 6",
        type: "Trip Analytics",
        date: "Feb 11, 2024",
        size: "2.1 MB",
        downloads: 6,
        status: "Ready"
    },
];

export default function ReportsPage() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                    <p className="text-sm text-muted-foreground mt-1">Generate and download fleet analytics reports</p>
                </div>
                <Button className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Custom Report
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <FileBarChart className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentReports.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Generated this month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Download className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {recentReports.reduce((sum, r) => sum + r.downloads, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Total downloads</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Report Types</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportTypes.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Available templates</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <FileBarChart className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">11.2 MB</div>
                        <p className="text-xs text-muted-foreground mt-1">Of 1 GB used</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Report Templates</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reportTypes.map((report, index) => {
                        const Icon = report.icon;
                        return (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                                        report.color === "blue" ? "bg-blue-500/10" :
                                        report.color === "green" ? "bg-green-500/10" :
                                        report.color === "orange" ? "bg-orange-500/10" :
                                        report.color === "purple" ? "bg-purple-500/10" :
                                        report.color === "cyan" ? "bg-cyan-500/10" :
                                        "bg-rose-500/10"
                                    }`}>
                                        <Icon className={`h-6 w-6 ${
                                            report.color === "blue" ? "text-blue-500" :
                                            report.color === "green" ? "text-green-500" :
                                            report.color === "orange" ? "text-orange-500" :
                                            report.color === "purple" ? "text-purple-500" :
                                            report.color === "cyan" ? "text-cyan-500" :
                                            "text-rose-500"
                                        }`} />
                                    </div>
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted">
                                        {report.period}
                                    </span>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <CardTitle className="text-base mb-1">
                                                {report.name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {report.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                            <span>Last: {report.lastGenerated}</span>
                                            <span>{report.size}</span>
                                        </div>
                                        <Button size="sm" className="w-full gap-2">
                                            <Download className="h-3 w-3" />
                                            Generate Report
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Your recently generated reports
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentReports.map((report, index) => (
                            <div key={index} className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <FileBarChart className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{report.name}</p>
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                {report.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {report.type}
                                            </span>
                                            <span>•</span>
                                            <span>{report.size}</span>
                                            <span>•</span>
                                            <span>{report.downloads} downloads</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Generated on {report.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Download
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
