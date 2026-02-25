"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { OverviewChart } from "@/components/OverviewChart";
import { Car, Fuel, Users, AlertTriangle, TrendingUp, TrendingDown, MapPin, Wrench } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Vehicles
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Car className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">128</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500 font-medium">+4</span> from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Drivers
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500 font-medium">+2</span> from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Fuel Consumption
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Fuel className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,345 L</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingDown className="h-3 w-3 text-green-500" />
                            <span className="text-green-500 font-medium">-5%</span> from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Alerts
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-orange-500" />
                            <span className="text-orange-500 font-medium">+1</span> since yesterday
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-cyan-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-cyan-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">In progress now</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground mt-1">This week</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45,230 km</div>
                        <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-rose-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fuel Cost</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <Fuel className="h-4 w-4 text-rose-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">117,250 ETB</div>
                        <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle>Fleet Overview</CardTitle>
                        <p className="text-sm text-muted-foreground">Monthly performance metrics</p>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-t-4 border-t-green-500">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <p className="text-sm text-muted-foreground">Latest fleet updates</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 relative">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Vehicle #1042 started trip
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        New York to Boston
                                    </p>
                                    <p className="text-xs text-muted-foreground">2m ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Maintenance Alert: Truck #55
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Oil change required
                                    </p>
                                    <p className="text-xs text-muted-foreground">1h ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Driver Check-in: John Doe
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Route 66 Delivery
                                    </p>
                                    <p className="text-xs text-muted-foreground">3h ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Fuel refill completed
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Vehicle #2034 - 45.5L
                                    </p>
                                    <p className="text-xs text-muted-foreground">5h ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
