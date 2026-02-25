"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Bell, Shield, Globe, Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <CardTitle>Profile Settings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <Input defaultValue="HU Fleet Manager" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" defaultValue="admin@hufleet.com" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input defaultValue="+251-911-000000" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Maintenance Alerts</p>
                                <p className="text-sm text-muted-foreground">Get notified about upcoming maintenance</p>
                            </div>
                            <input type="checkbox" defaultChecked className="h-4 w-4" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Fuel Alerts</p>
                                <p className="text-sm text-muted-foreground">Notifications for fuel consumption anomalies</p>
                            </div>
                            <input type="checkbox" defaultChecked className="h-4 w-4" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Trip Updates</p>
                                <p className="text-sm text-muted-foreground">Real-time trip status notifications</p>
                            </div>
                            <input type="checkbox" className="h-4 w-4" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            <CardTitle>Regional Settings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Currency</label>
                            <Input defaultValue="ETB (Ethiopian Birr)" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Distance Unit</label>
                            <Input defaultValue="Kilometers (km)" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Fuel Unit</label>
                            <Input defaultValue="Liters (L)" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <CardTitle>Security</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <Input type="password" placeholder="Enter current password" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input type="password" placeholder="Enter new password" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input type="password" placeholder="Confirm new password" />
                        </div>
                        <Button variant="outline">Update Password</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
