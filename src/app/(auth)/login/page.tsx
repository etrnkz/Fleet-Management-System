"use client";

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Mail, Lock, Eye, EyeOff, Truck } from "lucide-react"
import { useState } from "react"
import { PageLoader } from "@/components/PageLoader"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <PageLoader>
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-emerald-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }}></div>
                </div>
                
                <div className="relative z-10 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-8 hover:scale-105 transition-transform duration-300">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
                            <Truck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">HU Fleet Manager</h1>
                            <p className="text-green-100 text-sm">Professional Fleet Management</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-6 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                    <div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Haramaya University<br />Fleet Manager
                        </h2>
                        <p className="text-green-100 text-lg">
                            Track vehicles, monitor fuel consumption, manage drivers, and optimize your fleet operations all in one place.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="text-3xl font-bold text-white mb-1">128+</div>
                            <div className="text-green-100 text-sm">Active Vehicles</div>
                        </div>
                        <Link href="/gps-tracking">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group" style={{ animationDelay: "0.1s" }}>
                                <div className="text-3xl font-bold text-white mb-1 group-hover:animate-pulse">Real-Time</div>
                                <div className="text-green-100 text-sm flex items-center gap-1">
                                    <span>GPS Tracking</span>
                                    <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="relative z-10 text-green-100 text-sm animate-fadeIn" style={{ animationDelay: "0.4s" }}>
                    © 2024 HU Fleet Manager. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 hover:scale-105 transition-transform duration-300">
                        <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                            <Truck className="h-7 w-7 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">HU Fleet Manager</h1>
                            <p className="text-muted-foreground text-sm">Fleet Management System</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-green-700 dark:text-green-400">Sign in</CardTitle>
                            <CardDescription>
                                Use your email and password to login
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-green-600 transition-colors" />
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="admin@hufleet.com" 
                                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </label>
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-sm text-green-600 dark:text-green-400 hover:underline hover:text-green-700 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-green-600 transition-colors" />
                                    <Input 
                                        id="password" 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 border-green-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-green-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <label
                                    htmlFor="remember"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Remember me for 30 days
                                </label>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full h-11 text-base bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg" asChild>
                                <Link href="/">Sign in</Link>
                            </Button>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Or
                                    </span>
                                </div>
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="font-medium text-green-600 dark:text-green-400 hover:underline hover:text-green-700 transition-colors">
                                    Create account
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>

                    <p className="text-center text-xs text-muted-foreground">
                        By signing in, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-green-600 transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline hover:text-green-600 transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </PageLoader>
    )
}
