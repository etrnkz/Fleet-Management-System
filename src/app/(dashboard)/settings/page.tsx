"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Bell, Shield, Globe, Save, Palette, Clock, Database, Mail, Smartphone, MapPin, DollarSign, Building, Languages, Download, Trash2, Key, Sun, Moon, Monitor, Camera, Upload, AlertCircle, CheckCircle, XCircle, Info, Wrench, Fuel as FuelIcon, FileText, Car } from "lucide-react";
import { PageLoader } from "@/components/PageLoader";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState("general");
    const [profileImage, setProfileImage] = useState<string | null>(null);
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
        // User Profile
        firstName: "Admin",
        lastName: "User",
        username: "admin",
        userEmail: "admin@hufleet.com",
        userPhone: "+251-911-123456",
        role: "Fleet Manager",
        department: "Operations",
        // Company Information
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const sections = [
        { id: "general", label: "General", icon: User, color: "text-blue-500" },
        { id: "notifications", label: "Notifications", icon: Bell, color: "text-green-500" },
        { id: "regional", label: "Regional", icon: Globe, color: "text-purple-500" },
        { id: "appearance", label: "Appearance", icon: Palette, color: "text-orange-500" },
        { id: "security", label: "Security", icon: Shield, color: "text-red-500" },
        { id: "data", label: "Data Management", icon: Database, color: "text-cyan-500" },
    ];

    return (
        <PageLoader>
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your account and application preferences</p>
                </div>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex gap-6">
                {/* Left Sidebar Navigation */}
                <div className="w-64 flex-shrink-0">
                    <Card className="sticky top-6">
                        <CardContent className="p-2">
                            <nav className="space-y-1">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                                isActive
                                                    ? "bg-blue-500 text-white shadow-lg scale-105"
                                                    : "hover:bg-muted hover:scale-102"
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 ${isActive ? "text-white" : section.color}`} />
                                            <span className="font-medium">{section.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 space-y-6">
                    {/* General Section */}
                    {activeSection === "general" && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* User Profile Card */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-500" />
                                        User Profile
                                    </CardTitle>
                                    <CardDescription>Manage your personal information and profile picture</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Profile Photo Upload */}
                                    <div className="flex items-start gap-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-4 border-blue-200">
                                                {profileImage ? (
                                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{settings.firstName[0]}{settings.lastName[0]}</span>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 shadow-lg">
                                                <Camera className="h-4 w-4" />
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{settings.firstName} {settings.lastName}</h3>
                                            <p className="text-sm text-muted-foreground">{settings.role}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{settings.department}</p>
                                            <Button variant="outline" size="sm" className="mt-3 border-blue-500 text-blue-600 hover:bg-blue-50">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload New Photo
                                            </Button>
                                        </div>
                                    </div>

                                    {/* User Information Fields */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                First Name
                                            </label>
                                            <Input 
                                                value={settings.firstName}
                                                onChange={(e) => setSettings({...settings, firstName: e.target.value})}
                                                placeholder="Enter first name"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                Last Name
                                            </label>
                                            <Input 
                                                value={settings.lastName}
                                                onChange={(e) => setSettings({...settings, lastName: e.target.value})}
                                                placeholder="Enter last name"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                Username
                                            </label>
                                            <Input 
                                                value={settings.username}
                                                onChange={(e) => setSettings({...settings, username: e.target.value})}
                                                placeholder="Enter username"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-500" />
                                                Email Address
                                            </label>
                                            <Input 
                                                type="email" 
                                                value={settings.userEmail}
                                                onChange={(e) => setSettings({...settings, userEmail: e.target.value})}
                                                placeholder="user@example.com"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-blue-500" />
                                                Phone Number
                                            </label>
                                            <Input 
                                                value={settings.userPhone}
                                                onChange={(e) => setSettings({...settings, userPhone: e.target.value})}
                                                placeholder="+251-911-000000"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Building className="h-4 w-4 text-blue-500" />
                                                Role
                                            </label>
                                            <select 
                                                value={settings.role}
                                                onChange={(e) => setSettings({...settings, role: e.target.value})}
                                                className="w-full h-10 rounded-md border border-blue-200 bg-background px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            >
                                                <option value="Fleet Manager">Fleet Manager</option>
                                                <option value="Administrator">Administrator</option>
                                                <option value="Supervisor">Supervisor</option>
                                                <option value="Operator">Operator</option>
                                                <option value="Viewer">Viewer</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Building className="h-4 w-4 text-blue-500" />
                                                Department
                                            </label>
                                            <Input 
                                                value={settings.department}
                                                onChange={(e) => setSettings({...settings, department: e.target.value})}
                                                placeholder="Enter department"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Company Information Card */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-blue-500" />
                                        Company Information
                                    </CardTitle>
                                    <CardDescription>Update your company details and contact information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Building className="h-4 w-4 text-blue-500" />
                                                Company Name
                                            </label>
                                            <Input 
                                                value={settings.companyName}
                                                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                                                placeholder="Enter company name"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-500" />
                                                Company Email
                                            </label>
                                            <Input 
                                                type="email" 
                                                value={settings.email}
                                                onChange={(e) => setSettings({...settings, email: e.target.value})}
                                                placeholder="company@example.com"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-blue-500" />
                                                Company Phone
                                            </label>
                                            <Input 
                                                value={settings.phone}
                                                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                                placeholder="+251-911-000000"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-blue-500" />
                                                Website
                                            </label>
                                            <Input 
                                                value={settings.website}
                                                onChange={(e) => setSettings({...settings, website: e.target.value})}
                                                placeholder="www.example.com"
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            Business Address
                                        </label>
                                        <Input 
                                            value={settings.address}
                                            onChange={(e) => setSettings({...settings, address: e.target.value})}
                                            placeholder="Enter full address"
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === "notifications" && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Active Notifications Card */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-green-500" />
                                        Active Notifications
                                    </CardTitle>
                                    <CardDescription>Recent notification messages and alerts</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { 
                                                id: 1, 
                                                type: "warning", 
                                                icon: AlertCircle, 
                                                color: "text-orange-500", 
                                                bgColor: "bg-orange-50 dark:bg-orange-950/20",
                                                borderColor: "border-orange-200",
                                                title: "Maintenance Due", 
                                                message: "Vehicle ET-3-12345 requires scheduled maintenance in 2 days",
                                                time: "2 hours ago",
                                                read: false
                                            },
                                            { 
                                                id: 2, 
                                                type: "error", 
                                                icon: XCircle, 
                                                color: "text-red-500", 
                                                bgColor: "bg-red-50 dark:bg-red-950/20",
                                                borderColor: "border-red-200",
                                                title: "Document Expired", 
                                                message: "Insurance document for vehicle ET-3-67890 has expired",
                                                time: "5 hours ago",
                                                read: false
                                            },
                                            { 
                                                id: 3, 
                                                type: "success", 
                                                icon: CheckCircle, 
                                                color: "text-green-500", 
                                                bgColor: "bg-green-50 dark:bg-green-950/20",
                                                borderColor: "border-green-200",
                                                title: "Trip Completed", 
                                                message: "Driver Abebe Kebede completed trip #TR-2024-0156 successfully",
                                                time: "1 day ago",
                                                read: true
                                            },
                                            { 
                                                id: 4, 
                                                type: "info", 
                                                icon: Info, 
                                                color: "text-blue-500", 
                                                bgColor: "bg-blue-50 dark:bg-blue-950/20",
                                                borderColor: "border-blue-200",
                                                title: "Fuel Alert", 
                                                message: "Unusual fuel consumption detected for vehicle ET-3-11111",
                                                time: "1 day ago",
                                                read: true
                                            },
                                            { 
                                                id: 5, 
                                                type: "info", 
                                                icon: Car, 
                                                color: "text-cyan-500", 
                                                bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
                                                borderColor: "border-cyan-200",
                                                title: "New Vehicle Added", 
                                                message: "Vehicle ET-3-99999 has been added to the fleet",
                                                time: "2 days ago",
                                                read: true
                                            },
                                        ].map((notification, index) => {
                                            const Icon = notification.icon;
                                            return (
                                                <div 
                                                    key={notification.id}
                                                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 hover:scale-102 hover:shadow-md ${
                                                        notification.read 
                                                            ? "border-muted bg-muted/30" 
                                                            : `${notification.borderColor} ${notification.bgColor}`
                                                    }`}
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div className={`p-2 rounded-full ${notification.bgColor}`}>
                                                        <Icon className={`h-5 w-5 ${notification.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className={`font-semibold ${!notification.read ? notification.color : ""}`}>
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.read && (
                                                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <Button variant="outline" size="sm" className="text-green-600 border-green-500 hover:bg-green-50">
                                            Mark All as Read
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                                            Clear All
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notification Preferences Card */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-green-500" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold mb-4 text-green-600">Fleet Alerts</h3>
                                        <div className="space-y-4">
                                            {[
                                                { key: "maintenance", label: "Maintenance Alerts", desc: "Get notified about upcoming vehicle maintenance" },
                                                { key: "fuel", label: "Fuel Consumption Alerts", desc: "Notifications for unusual fuel consumption patterns" },
                                                { key: "trips", label: "Trip Status Updates", desc: "Real-time notifications for trip progress" },
                                                { key: "documents", label: "Document Expiry", desc: "Alerts when documents are about to expire" },
                                                { key: "drivers", label: "Driver Activity", desc: "Notifications for driver check-ins and updates" },
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-start justify-between p-4 rounded-lg border border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
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
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold mb-4 text-green-600">Notification Channels</h3>
                                        <div className="space-y-4">
                                            {[
                                                { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                                                { key: "push", label: "Push Notifications", desc: "Receive browser push notifications" },
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-start justify-between p-4 rounded-lg border border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
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
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Regional Section */}
                    {activeSection === "regional" && (
                        <div className="space-y-6 animate-fadeIn">
                            <Card className="border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-purple-500" />
                                        Regional Settings
                                    </CardTitle>
                                    <CardDescription>Configure regional preferences and units</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-purple-500" />
                                                Currency
                                            </label>
                                            <select 
                                                value={settings.currency}
                                                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                                                className="w-full h-10 rounded-md border border-purple-200 bg-background px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="ETB">ETB - Ethiopian Birr (ብር)</option>
                                                <option value="USD">USD - US Dollar ($)</option>
                                                <option value="EUR">EUR - Euro (€)</option>
                                                <option value="GBP">GBP - British Pound (£)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-purple-500" />
                                                Timezone
                                            </label>
                                            <select 
                                                value={settings.timezone}
                                                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                                                className="w-full h-10 rounded-md border border-purple-200 bg-background px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT, UTC+3)</option>
                                                <option value="UTC">UTC (Coordinated Universal Time)</option>
                                                <option value="America/New_York">America/New York (EST, UTC-5)</option>
                                                <option value="Europe/London">Europe/London (GMT, UTC+0)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-purple-600">Distance Unit</label>
                                            <select 
                                                value={settings.distanceUnit}
                                                onChange={(e) => setSettings({...settings, distanceUnit: e.target.value})}
                                                className="w-full h-10 rounded-md border border-purple-200 bg-background px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="km">Kilometers (km)</option>
                                                <option value="mi">Miles (mi)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-purple-600">Fuel Unit</label>
                                            <select 
                                                value={settings.fuelUnit}
                                                onChange={(e) => setSettings({...settings, fuelUnit: e.target.value})}
                                                className="w-full h-10 rounded-md border border-purple-200 bg-background px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="L">Liters (L)</option>
                                                <option value="gal">Gallons (gal)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-purple-600">Date Format</label>
                                            <select 
                                                value={settings.dateFormat}
                                                onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                                                className="w-full h-10 rounded-md border border-purple-200 bg-background px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-purple-600">Time Format</label>
                                            <select 
                                                value={settings.timeFormat}
                                                onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
                                                className="w-full h-10 rounded-md border border-purple-200 bg-background px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="24h">24-hour (14:30)</option>
                                                <option value="12h">12-hour (2:30 PM)</option>
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Appearance Section */}
                    {activeSection === "appearance" && (
                        <div className="space-y-6 animate-fadeIn">
                            <Card className="border-l-4 border-l-orange-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-orange-500" />
                                        Appearance Settings
                                    </CardTitle>
                                    <CardDescription>Customize the look and feel of your application</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-3 block text-orange-600">Theme Mode</label>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Choose your preferred theme or let the system decide
                                            </p>
                                            <div className="space-y-3">
                                                <label 
                                                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                        theme === "light"
                                                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                                            : "border-muted hover:border-orange-300 hover:bg-muted/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Sun className={`h-5 w-5 ${theme === "light" ? "text-orange-500" : "text-muted-foreground"}`} />
                                                        <div>
                                                            <p className={`font-medium ${theme === "light" ? "text-orange-600" : ""}`}>Light</p>
                                                            <p className="text-xs text-muted-foreground">Always use light theme</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="theme"
                                                        value="light"
                                                        checked={theme === "light"}
                                                        onChange={() => setTheme("light")}
                                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                                    />
                                                </label>
                                                
                                                <label 
                                                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                        theme === "dark"
                                                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                                            : "border-muted hover:border-orange-300 hover:bg-muted/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Moon className={`h-5 w-5 ${theme === "dark" ? "text-orange-500" : "text-muted-foreground"}`} />
                                                        <div>
                                                            <p className={`font-medium ${theme === "dark" ? "text-orange-600" : ""}`}>Dark</p>
                                                            <p className="text-xs text-muted-foreground">Always use dark theme</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="theme"
                                                        value="dark"
                                                        checked={theme === "dark"}
                                                        onChange={() => setTheme("dark")}
                                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                                    />
                                                </label>
                                                
                                                <label 
                                                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                        theme === "auto"
                                                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                                            : "border-muted hover:border-orange-300 hover:bg-muted/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Monitor className={`h-5 w-5 ${theme === "auto" ? "text-orange-500" : "text-muted-foreground"}`} />
                                                        <div>
                                                            <p className={`font-medium ${theme === "auto" ? "text-orange-600" : ""}`}>Auto</p>
                                                            <p className="text-xs text-muted-foreground">Follow system preferences</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="theme"
                                                        value="auto"
                                                        checked={theme === "auto"}
                                                        onChange={() => setTheme("auto")}
                                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Languages className="h-4 w-4 text-orange-500" />
                                                Language
                                            </label>
                                            <select 
                                                value={settings.language}
                                                onChange={(e) => setSettings({...settings, language: e.target.value})}
                                                className="w-full h-10 rounded-md border border-orange-200 bg-background px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
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
                    )}

                    {/* Security Section */}
                    {activeSection === "security" && (
                        <div className="space-y-6 animate-fadeIn">
                            <Card className="border-l-4 border-l-red-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-red-500" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription>Update your password to keep your account secure</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Key className="h-4 w-4 text-red-500" />
                                            Current Password
                                        </label>
                                        <Input type="password" placeholder="Enter current password" className="border-red-200 focus:border-red-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Key className="h-4 w-4 text-red-500" />
                                            New Password
                                        </label>
                                        <Input type="password" placeholder="Enter new password" className="border-red-200 focus:border-red-500" />
                                        <p className="text-xs text-muted-foreground">Must be at least 8 characters with uppercase, lowercase, and numbers</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Key className="h-4 w-4 text-red-500" />
                                            Confirm New Password
                                        </label>
                                        <Input type="password" placeholder="Confirm new password" className="border-red-200 focus:border-red-500" />
                                    </div>
                                    <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">Update Password</Button>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-red-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-red-500" />
                                        Two-Factor Authentication
                                    </CardTitle>
                                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                                        <div>
                                            <p className="font-medium">Two-Factor Authentication</p>
                                            <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
                                        </div>
                                        <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">Enable 2FA</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Data Management Section */}
                    {activeSection === "data" && (
                        <div className="space-y-6 animate-fadeIn">
                            <Card className="border-l-4 border-l-cyan-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-cyan-500" />
                                        Data Management
                                    </CardTitle>
                                    <CardDescription>Export, backup, or delete your fleet data</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <Download className="h-5 w-5 text-cyan-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Export Data</p>
                                                <p className="text-sm text-muted-foreground">Download all your fleet data in CSV or JSON format</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-600 hover:bg-cyan-50">Export</Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <Database className="h-5 w-5 text-cyan-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Backup Database</p>
                                                <p className="text-sm text-muted-foreground">Create a complete backup of your database</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-600 hover:bg-cyan-50">Backup</Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-red-600">Delete All Data</p>
                                                <p className="text-sm text-muted-foreground">Permanently remove all fleet data (cannot be undone)</p>
                                            </div>
                                        </div>
                                        <Button variant="destructive" size="sm">Delete</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-cyan-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-cyan-500" />
                                        Storage Information
                                    </CardTitle>
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
                                                <div className="bg-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: "1.24%" }}></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="text-center p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200">
                                                <p className="text-2xl font-bold text-cyan-600">128</p>
                                                <p className="text-xs text-muted-foreground">Total Vehicles</p>
                                            </div>
                                            <div className="text-center p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200">
                                                <p className="text-2xl font-bold text-cyan-600">1,247</p>
                                                <p className="text-xs text-muted-foreground">Total Records</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </PageLoader>
    );
}
