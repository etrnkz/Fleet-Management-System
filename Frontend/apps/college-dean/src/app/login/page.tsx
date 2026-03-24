"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleLogin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newErrors = { email: "", password: "" };
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-12 bg-white">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter your Credentials to access your account
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent ${errors.email ? "border-red-400" : "border-gray-300"}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-700">Password</label>
                <button type="button" className="text-xs text-teal-500 hover:text-teal-600">
                  forgot password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent pr-10 ${errors.password ? "border-red-400" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-teal-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer">
                Remember for 30 days
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Login */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
              {/* Google Icon */}
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Sign in with Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
              {/* Apple Icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M12.6 0c.07.9-.26 1.8-.8 2.46-.55.67-1.42 1.18-2.3 1.12-.09-.87.28-1.78.8-2.4C10.84.5 11.76 0 12.6 0zM15.9 13.1c-.4.9-.6 1.3-1.1 2.1-.72 1.1-1.74 2.47-3 2.48-1.12.01-1.41-.73-2.93-.72-1.52.01-1.84.73-2.97.72-1.26-.01-2.22-1.26-2.94-2.36C1.2 12.8.9 9.9 1.9 8.1c.7-1.26 1.97-2 3.16-2 1.18 0 1.92.72 2.89.72.94 0 1.52-.73 2.88-.73 1.06 0 2.2.58 2.9 1.58-2.55 1.4-2.14 5.06.27 6.43z"/>
              </svg>
              Sign in with Apple
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <button className="text-teal-500 font-medium hover:text-teal-600">
              Sign Up
            </button>
          </p>
        </div>
      </div>

      {/* Right - Image Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden rounded-l-3xl">
        {/* Background image simulation with gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-teal-400/90 via-teal-600/80 to-teal-900/90 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&auto=format&fit=crop')",
          }}
        ></div>
        {/* Logo overlay */}
        <div className="relative z-20 flex items-center justify-center w-full">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold tracking-wide">HUFMS</span>
              <span className="text-2xl font-light opacity-80">md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
