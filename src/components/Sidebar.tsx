"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Car,
    Users,
    Map,
    Fuel,
    Wrench,
    FileBarChart,
    FileText,
    LogOut,
    Settings,
} from "lucide-react";

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vehicles", href: "/vehicles", icon: Car },
    { name: "Drivers", href: "/drivers", icon: Users },
    { name: "Trips", href: "/trips", icon: Map },
    { name: "Fuel", href: "/fuel", icon: Fuel },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
    { name: "Reports", href: "/reports", icon: FileBarChart },
    { name: "Documents", href: "/documents", icon: FileText },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold tracking-tight text-primary">
                    HU Fleet Manager
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid items-start gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        // Handle root dashboard path matching
                        const isDashboardActive = item.href === "/dashboard" && (pathname === "/" || pathname === "/dashboard");

                        return (
                            <Link
                                key={index}
                                href={item.href === "/dashboard" ? "/" : item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
                                    "hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-sm",
                                    "active:scale-95 active:shadow-none",
                                    (isActive || isDashboardActive) ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground"
                                )}
                            >
                                <Icon className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    "group-hover:scale-110",
                                    "group-active:scale-90"
                                )} />
                                <span className="transition-all duration-200">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <Link
                    href="/settings"
                    className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
                        "hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-sm",
                        "active:scale-95 active:shadow-none",
                        pathname === "/settings" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground"
                    )}
                >
                    <Settings className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        "group-hover:scale-110 group-hover:rotate-90",
                        "group-active:scale-90"
                    )} />
                    <span>Settings</span>
                </Link>
                <Link 
                    href="/login" 
                    className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out mt-1",
                        "text-destructive hover:bg-destructive/10 hover:scale-105 hover:shadow-sm",
                        "active:scale-95 active:shadow-none",
                        "group"
                    )}
                >
                    <LogOut className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        "group-hover:scale-110 group-hover:translate-x-1",
                        "group-active:scale-90"
                    )} />
                    <span>Log out</span>
                </Link>
            </div>
        </div>
    );
}
