"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileBarChart, Download, Calendar, TrendingUp, FileText } from "lucide-react";

const reportTypes = [
    { name: "Fleet Performance", description: "Overall fleet efficiency and utilization metrics", icon: TrendingUp, period: "Monthly" },
    { name: "Fuel Consumption", description: "Detailed fuel usage and cost analysis", icon: FileBarChart, period: "Weekly" },
    { name: "Maintenance Summary", description: "Maintenance costs and schedule overview", icon: FileText, period: "Monthly" },
    { name: "Driver Performance", description: "Driver efficiency and safety metrics", icon: FileBarChart, period: "Monthly" },
    { name: "Trip Analytics", description: "Route optimization and trip statistics", icon: TrendingUp, period: "Weekly" },
    { name: "Cost Analysis", description: "Comprehensive cost breakdown and trends", icon: FileBarChart, period: "Quarterly" },
];

export default function ReportsPage() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                <Button className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Custom Report
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reportTypes.map((report, index) => {
                    const Icon = report.icon;
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {report.name}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        {report.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {report.period}
                                        </span>
                                        <Button size="sm" variant="outline" className="gap-2">
                                            <Download className="h-3 w-3" />
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="space-y-1">
                                <p className="font-medium">Fleet Performance Report - January 2024</p>
                                <p className="text-sm text-muted-foreground">Generated on Feb 1, 2024</p>
                            </div>
                            <Button size="sm" variant="ghost" className="gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="space-y-1">
                                <p className="font-medium">Fuel Consumption Report - Week 7</p>
                                <p className="text-sm text-muted-foreground">Generated on Feb 18, 2024</p>
                            </div>
                            <Button size="sm" variant="ghost" className="gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">Maintenance Summary - January 2024</p>
                                <p className="text-sm text-muted-foreground">Generated on Feb 1, 2024</p>
                            </div>
                            <Button size="sm" variant="ghost" className="gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
