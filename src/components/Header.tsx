"use client";

import Link from "next/link";
import { Bell, Search, User, Moon, Sun, AlertCircle, CheckCircle, XCircle, Info, Car, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useRef, useEffect } from "react";

export function Header() {
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const notifications = [
        { 
            id: 1, 
            type: "warning", 
            icon: AlertCircle, 
            color: "text-orange-500", 
            bgColor: "bg-orange-50 dark:bg-orange-950/20",
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
            title: "Trip Completed", 
            message: "Driver Abebe Kebede completed trip #TR-2024-0156",
            time: "1 day ago",
            read: true
        },
        { 
            id: 4, 
            type: "info", 
            icon: Info, 
            color: "text-blue-500", 
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
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
            title: "New Vehicle Added", 
            message: "Vehicle ET-3-99999 has been added to the fleet",
            time: "2 days ago",
            read: true
        },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[300px]"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>
                
                {/* Notification Dropdown */}
                <div className="relative" ref={notificationRef}>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <>
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border border-card animate-pulse" />
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-semibold">
                                    {unreadCount}
                                </span>
                            </>
                        )}
                    </Button>

                    {/* Notification Panel */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-96 bg-card border rounded-lg shadow-2xl z-50 animate-fadeIn">
                            <div className="p-4 border-b flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">Notifications</h3>
                                    <p className="text-xs text-muted-foreground">{unreadCount} unread messages</p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="max-h-[500px] overflow-y-auto">
                                {notifications.map((notification) => {
                                    const Icon = notification.icon;
                                    return (
                                        <div 
                                            key={notification.id}
                                            className={`p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer ${
                                                !notification.read ? "bg-muted/30" : ""
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full ${notification.bgColor} flex-shrink-0`}>
                                                    <Icon className={`h-4 w-4 ${notification.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className={`font-semibold text-sm ${!notification.read ? notification.color : ""}`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <span className="flex h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-3 border-t bg-muted/30">
                                <Link href="/settings">
                                    <Button 
                                        variant="ghost" 
                                        className="w-full text-sm text-primary hover:bg-primary/10"
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        View All Notifications
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/login">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-5 w-5" />
                        </div>
                    </Link>
                </Button>
            </div>
        </header>
    );
}
