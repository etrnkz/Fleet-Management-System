import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { OverviewChart } from "@/components/OverviewChart";
import { Car, Fuel, Users, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Vehicles
                        </CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">128</div>
                        <p className="text-xs text-muted-foreground">
                            +4 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Drivers
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Fuel Consumption
                        </CardTitle>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,345 L</div>
                        <p className="text-xs text-muted-foreground">
                            -5% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Alerts
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            +1 since yesterday
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <span className="relative flex h-2 w-2 mr-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Vehicle #1042 started trip
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        New York to Boston
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">2m ago</div>
                            </div>
                            <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-orange-500 mr-4" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Maintenance Alert: Truck #55
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Oil change required
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">1h ago</div>
                            </div>
                            <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-green-500 mr-4" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Driver Check-in: John Doe
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Route 66 Delivery
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">3h ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
