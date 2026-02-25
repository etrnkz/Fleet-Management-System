"use client";

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Mail, Lock, Eye, EyeOff, Truck, User, Building } from "lucide-react"
import { useState } from "react"

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Truck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">HU Fleet Manager</h1>
                            <p className="text-purple-100 text-sm">Professional Fleet Management</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Start Managing<br />Your Fleet Today
                        </h2>
                        <p className="text-purple-100 text-lg">
                            Join thousands of fleet managers who trust our platform to streamline their operations and reduce costs.
                        </p>
                    </div>
                    
                    <div className="space-y-4 pt-8">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">✓</span>
                            </div>
                            <div>
                                <div className="text-white font-semibold">Real-time Tracking</div>
                                <div className="text-purple-100 text-sm">Monitor your entire fleet in real-time</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">✓</span>
                            </div>
                            <div>
                                <div className="text-white font-semibold">Fuel Management</div>
                                <div className="text-purple-100 text-sm">Track and optimize fuel consumption</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">✓</span>
                            </div>
                            <div>
                                <div className="text-white font-semibold">Maintenance Scheduling</div>
                                <div className="text-purple-100 text-sm">Never miss a maintenance deadline</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-purple-100 text-sm">
                    © 2024 HU Fleet Manager. All rights reserved.
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Truck className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">HU Fleet Manager</h1>
                            <p className="text-muted-foreground text-sm">Fleet Management System</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                        <p className="text-muted-foreground">
                            Enter your information to get started
                        </p>
                    </div>

                    <Card className="border-2">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl">Sign up</CardTitle>
                            <CardDescription>
                                Create your fleet management account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="text-sm font-medium">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="firstName" 
                                            placeholder="John" 
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-medium">
                                        Last Name
                                    </label>
                                    <Input 
                                        id="lastName" 
                                        placeholder="Doe" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="company" className="text-sm font-medium">
                                    Company Name
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="company" 
                                        placeholder="Your Company Ltd." 
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="admin@company.com" 
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="password" 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className="pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="confirmPassword" 
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className="pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? (
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
                                    id="terms"
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-primary hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full h-11 text-base">
                                Create Account
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
                                Already have an account?{" "}
                                <Link href="/login" className="font-medium text-primary hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
