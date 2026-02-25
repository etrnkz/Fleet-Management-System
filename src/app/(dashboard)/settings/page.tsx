"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { User, Bell, Shield, Globe, Save, Palette, Clock, Database, Mail, Smartphone, MapPin, DollarSign, Building, Languages, Download, Trash2, Key } from "lucide-react";
import { PageLoader } from "@/components/PageLoader";
import { useState } from "react";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        maintenance: true,
        fuel: true,
        trips: false,
        documents: true,
        drivers: false,
        email: true,
        push: false,
    });

    const [settings, setSettings] = useState({
        companyName: "HU Fleet Manager",
        email: "admin@hufleet.com",
        phone: "+251-911-000000",
        address: "Addis Ababa, Ethiopia",
        website: "www.hufleet.com",
        currency: "ETB",
        distanceUnit: "km",
        fuelUnit: "L",
        timezone: "Africa/Addis_Ababa",
        language: "English",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
    });

    return (
        <PageLoader>
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your account and application preferences</p>
                </div>
                <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general" icon={<User className="h-4 w-4" />}>
                        General
                    </TabsTrigger>
                    <TabsTrigger value="notifications" icon={<Bell className="h-4 w-4" />}>
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="regional" icon={<Globe className="h-4 w-4" />}>
                        Regional
                    </TabsTrigger>
                    <TabsTrigger value="appearance" icon={<Palette className="h-4 w-4" />}>
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="security" icon={<Shield className="h-4 w-4" />}>
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="data" icon={<Database className="h-4 w-4" />}>
                        Data
                    </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Information</CardTitle>
                                <CardDescription>Update your company details and contact information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            Company Name
                                        </label>
                                        <Input 
                                            value={settings.companyName}
                                            onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                                            placeholder="Enter company name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            Email Address
                                        </label>
                                        <Input 
                                            type="email" 
                                            value={settings.email}
                                            onChange={(e) => setSettings({...settings, email: e.target.value})}
                                            placeholder="company@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            Phone Number
                                        </label>
                                        <Input 
                                            value={settings.phone}
                                            onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                            placeholder="+251-911-000000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            Website
                                        </label>
                                        <Input 
                                            value={settings.website}
                                            onChange={(e) => setSettings({...settings, website: e.target.value})}
                                            placeholder="www.example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        Business Address
                                    </label>
                                    <Input 
                                        value={settings.address}
                                        onChange={(e) => setSettings({...settings, address: e.target.value})}
                                        placeholder="Enter full address"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose what notifications you want to receive</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold mb-4">Fleet Alerts</h3>
                                    <div className="space-y-4">
                                        {[
                                            { key: "maintenance", label: "Maintenance Alerts", desc: "Get notified about upcoming vehicle maintenance" },
                                            { key: "fuel", label: "Fuel Consumption Alerts", desc: "Notifications for unusual fuel consumption patterns" },
                                            { key: "trips", label: "Trip Status Updates", desc: "Real-time notifications for trip progress" },
                                            { key: "documents", label: "Document Expiry", desc: "Alerts when documents are about to expire" },
                                            { key: "drivers", label: "Driver Activity", desc: "Notifications for driver check-ins and updates" },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.label}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={notifications[item.key as keyof typeof notifications]}
                                                        onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-4">Notification Channels</h3>
                                    <div className="space-y-4">
                                        {[
                                            { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                                            { key: "push", label: "Push Notifications", desc: "Receive browser push notifications" },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.label}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={notifications[item.key as keyof typeof notifications]}
                                                        onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Regional Tab */}
                <TabsContent value="regional">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Regional Settings</CardTitle>
                                <CardDescription>Configure regional preferences and units</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            Currency
                                        </label>
                                        <select 
                                            value={settings.currency}
                                            onChange={(e) => setSettings({...settings, currency: e.target.value})}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="ETB">ETB - Ethiopian Birr (ብር)</option>
                                            <option value="USD">USD - US Dollar ($)</option>
                                            <option value="EUR">EUR - Euro (€)</option>
                                            <option value="GBP">GBP - British Pound (£)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            Timezone
                                        </label>
                                        <select 
                                            value={settings.timezone}
                                            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT, UTC+3)</option>
                                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                                            <option value="America/New_York">America/New York (EST, UTC-5)</option>
                                            <option value="Europe/London">Europe/London (GMT, UTC+0)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Distance Unit</label>
                                        <select 
                                            value={settings.distanceUnit}
                                            onChange={(e) => setSettings({...settings, distanceUnit: e.target.value})}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="km">Kilometers (km)</option>
                                            <option value="mi">Miles (mi)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Fuel Unit</label>
                                        <select 
                                            value={settings.fuelUnit}
                                            onChange={(e) => setSettings({...settings, fuelUnit: e.target.value})}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="L">Liters (L)</option>
                                            <option value="gal">Gallons (gal)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date Format</label>
                                        <select 
                                            value={settings.dateFormat}
                                            onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Time Format</label>
                                        <select 
                                            value={settings.timeFormat}
                                            onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="24h">24-hour (14:30)</option>
                                            <option value="12h">12-hour (2:30 PM)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance Settings</CardTitle>
                                <CardDescription>Customize the look and feel of your application</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-3 block">Theme</label>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Toggle between light and dark mode using the theme button in the header
                                        </p>
                                        <div className="flex gap-4">
                                            <div className="flex-1 p-4 rounded-lg border-2 border-primary bg-background">
                                                <div className="aspect-video bg-muted rounded mb-2"></div>
                                                <p className="text-sm font-medium">Current Theme</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Languages className="h-4 w-4 text-muted-foreground" />
                                            Language
                                        </label>
                                        <select 
                                            value={settings.language}
                                            onChange={(e) => setSettings({...settings, language: e.target.value})}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="English">English</option>
                                            <option value="Amharic">አማርኛ (Amharic)</option>
                                            <option value="Oromo">Afaan Oromoo (Oromo)</option>
                                            <option value="Tigrinya">ትግርኛ (Tigrinya)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your password to keep your account secure</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        Current Password
                                    </label>
                                    <Input type="password" placeholder="Enter current password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        New Password
                                    </label>
                                    <Input type="password" placeholder="Enter new password" />
                                    <p className="text-xs text-muted-foreground">Must be at least 8 characters with uppercase, lowercase, and numbers</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        Confirm New Password
                                    </label>
                                    <Input type="password" placeholder="Confirm new password" />
                                </div>
                                <Button className="w-full md:w-auto">Update Password</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>Add an extra layer of security to your account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
                                    </div>
                                    <Button variant="outline">Enable 2FA</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Data Tab */}
                <TabsContent value="data">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Management</CardTitle>
                                <CardDescription>Export, backup, or delete your fleet data</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <Download className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Export Data</p>
                                            <p className="text-sm text-muted-foreground">Download all your fleet data in CSV or JSON format</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Export</Button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <Database className="h-5 w-5 text-green-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Backup Database</p>
                                            <p className="text-sm text-muted-foreground">Create a complete backup of your database</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Backup</Button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 hover:bg-destructive/5 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                                        <div>
                                            <p className="font-medium text-destructive">Delete All Data</p>
                                            <p className="text-sm text-muted-foreground">Permanently remove all fleet data (cannot be undone)</p>
                                        </div>
                                    </div>
                                    <Button variant="destructive" size="sm">Delete</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Storage Information</CardTitle>
                                <CardDescription>View your current storage usage</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Storage Used</span>
                                            <span className="font-medium">12.4 MB of 1 GB</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: "1.24%" }}></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="text-center p-3 rounded-lg bg-muted/50">
                                            <p className="text-2xl font-bold">128</p>
                                            <p className="text-xs text-muted-foreground">Total Vehicles</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-muted/50">
                                            <p className="text-2xl font-bold">1,247</p>
                                            <p className="text-xs text-muted-foreground">Total Records</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
        </PageLoader>
    );
}
