"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Bell, Shield, Globe, Save, Palette, Clock, Database, Mail, Smartphone, MapPin, DollarSign } from "lucide-react";
import { PageLoader } from "@/components/PageLoader";
import { useState } from "react";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        maintenance: true,
        fuel: true,
        trips: false,
        documents: true,
        drivers: false,
    });

    const [settings, setSettings] = useState({
        companyName: "HU Fleet Manager",
        email: "admin@hufleet.com",
        phone: "+251-911-000000",
        address: "Addis Ababa, Ethiopia",
        currency: "ETB",
        distanceUnit: "km",
        fuelUnit: "L",
        timezone: "Africa/Addis_Ababa",
        language: "English",
    });

    return (
        <PageLoader>
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your fleet management preferences</p>
                </div>
                <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-4">
                <Card className="animate-slideInLeft hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0ms' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-500" />
                            </div>
                            <CardTitle>Profile Settings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Company Name</label>
                                <Input 
                                    value={settings.companyName}
                                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                                    className="transition-all duration-200 focus:scale-[1.01]"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="email" 
                                        value={settings.email}
                                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                                        className="pl-10 transition-all duration-200 focus:scale-[1.01]"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Phone</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        value={settings.phone}
                                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                        className="pl-10 transition-all duration-200 focus:scale-[1.01]"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        value={settings.address}
                                        onChange={(e) => setSettings({...settings, address: e.target.value})}
                                        className="pl-10 transition-all duration-200 focus:scale-[1.01]"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-slideInLeft hover:shadow-lg transition-all duration-300" style={{ animationDelay: '50ms' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-green-500" />
                            </div>
                            <CardTitle>Notifications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group">
                            <div className="flex-1">
                                <p className="font-medium">Maintenance Alerts</p>
                                <p className="text-sm text-muted-foreground">Get notified about upcoming maintenance</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={notifications.maintenance}
                                onChange={(e) => setNotifications({...notifications, maintenance: e.target.checked})}
                                className="h-4 w-4 cursor-pointer transition-transform duration-200 group-hover:scale-110"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group">
                            <div className="flex-1">
                                <p className="font-medium">Fuel Alerts</p>
                                <p className="text-sm text-muted-foreground">Notifications for fuel consumption anomalies</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={notifications.fuel}
                                onChange={(e) => setNotifications({...notifications, fuel: e.target.checked})}
                                className="h-4 w-4 cursor-pointer transition-transform duration-200 group-hover:scale-110"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group">
                            <div className="flex-1">
                                <p className="font-medium">Trip Updates</p>
                                <p className="text-sm text-muted-foreground">Real-time trip status notifications</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={notifications.trips}
                                onChange={(e) => setNotifications({...notifications, trips: e.target.checked})}
                                className="h-4 w-4 cursor-pointer transition-transform duration-200 group-hover:scale-110"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group">
                            <div className="flex-1">
                                <p className="font-medium">Document Expiry</p>
                                <p className="text-sm text-muted-foreground">Alerts for expiring documents</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={notifications.documents}
                                onChange={(e) => setNotifications({...notifications, documents: e.target.checked})}
                                className="h-4 w-4 cursor-pointer transition-transform duration-200 group-hover:scale-110"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group">
                            <div className="flex-1">
                                <p className="font-medium">Driver Activity</p>
                                <p className="text-sm text-muted-foreground">Notifications for driver check-ins and updates</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={notifications.drivers}
                                onChange={(e) => setNotifications({...notifications, drivers: e.target.checked})}
                                className="h-4 w-4 cursor-pointer transition-transform duration-200 group-hover:scale-110"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-slideInLeft hover:shadow-lg transition-all duration-300" style={{ animationDelay: '100ms' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-purple-500" />
                            </div>
                            <CardTitle>Regional Settings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Currency</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <select 
                                        value={settings.currency}
                                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                                        className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:scale-[1.01]"
                                    >
                                        <option value="ETB">ETB (Ethiopian Birr)</option>
                                        <option value="USD">USD (US Dollar)</option>
                                        <option value="EUR">EUR (Euro)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Distance Unit</label>
                                <select 
                                    value={settings.distanceUnit}
                                    onChange={(e) => setSettings({...settings, distanceUnit: e.target.value})}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:scale-[1.01]"
                                >
                                    <option value="km">Kilometers (km)</option>
                                    <option value="mi">Miles (mi)</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Fuel Unit</label>
                                <select 
                                    value={settings.fuelUnit}
                                    onChange={(e) => setSettings({...settings, fuelUnit: e.target.value})}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:scale-[1.01]"
                                >
                                    <option value="L">Liters (L)</option>
                                    <option value="gal">Gallons (gal)</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Timezone</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <select 
                                        value={settings.timezone}
                                        onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                                        className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:scale-[1.01]"
                                    >
                                        <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT)</option>
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America/New York (EST)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-slideInLeft hover:shadow-lg transition-all duration-300" style={{ animationDelay: '150ms' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Palette className="h-5 w-5 text-orange-500" />
                            </div>
                            <CardTitle>Appearance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Theme</label>
                            <p className="text-sm text-muted-foreground">Toggle dark mode using the button in the header</p>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Language</label>
                            <select 
                                value={settings.language}
                                onChange={(e) => setSettings({...settings, language: e.target.value})}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:scale-[1.01]"
                            >
                                <option value="English">English</option>
                                <option value="Amharic">Amharic (አማርኛ)</option>
                                <option value="Oromo">Oromo (Afaan Oromoo)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-slideInLeft hover:shadow-lg transition-all duration-300" style={{ animationDelay: '200ms' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-red-500" />
                            </div>
                            <CardTitle>Security</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <Input 
                                type="password" 
                                placeholder="Enter current password" 
                                className="transition-all duration-200 focus:scale-[1.01]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input 
                                type="password" 
                                placeholder="Enter new password" 
                                className="transition-all duration-200 focus:scale-[1.01]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input 
                                type="password" 
                                placeholder="Confirm new password" 
                                className="transition-all duration-200 focus:scale-[1.01]"
                            />
                        </div>
                        <Button variant="outline" className="w-full md:w-auto">Update Password</Button>
                    </CardContent>
                </Card>

                <Card className="animate-slideInLeft hover:shadow-lg transition-all duration-300" style={{ animationDelay: '250ms' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                <Database className="h-5 w-5 text-cyan-500" />
                            </div>
                            <CardTitle>Data Management</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                                <p className="font-medium">Export Data</p>
                                <p className="text-sm text-muted-foreground">Download all your fleet data</p>
                            </div>
                            <Button variant="outline" size="sm">Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                                <p className="font-medium">Backup Database</p>
                                <p className="text-sm text-muted-foreground">Create a backup of your data</p>
                            </div>
                            <Button variant="outline" size="sm">Backup</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/50">
                            <div>
                                <p className="font-medium text-destructive">Delete All Data</p>
                                <p className="text-sm text-muted-foreground">Permanently remove all fleet data</p>
                            </div>
                            <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        </PageLoader>
    );
}
