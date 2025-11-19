"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Code2, ArrowRight, CheckCircle2, Shield, Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call - In production, this would authenticate with backend
    setTimeout(() => {
      if (email && password && leetcodeUsername) {
        // Redirect to profile page with username
        window.location.href = `/profile/${leetcodeUsername}`;
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Column - Branding */}
        <div className="space-y-6 text-center lg:text-left">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">LeetSocial</span>
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Connect Your{" "}
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              LeetCode Journey
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join 50,000+ developers sharing solutions, discussing algorithms, 
            and growing together. Your coding stats will be automatically synced!
          </p>

          <div className="space-y-4 pt-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Login Form */}
        <Card className="p-8 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Sign in with LeetCode
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your LeetCode username to get started
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-12 text-lg pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 text-lg pl-11 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LeetCode Username
                </label>
                <div className="relative">
                  <Code2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    placeholder="e.g., john_coder123"
                    className="h-12 text-lg pl-11"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  We'll fetch your public LeetCode profile data
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password || !leetcodeUsername}
                className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <>
                    Sign Up & Connect LeetCode
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/signin" className="text-orange-600 hover:text-orange-700 font-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
                  Why LeetCode login?
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2">
                    {reason.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reason.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By signing in, you agree to our{" "}
                <Link href="#" className="text-orange-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-orange-600 hover:underline">
                  Privacy Policy
                </Link>
                . We only access your public LeetCode profile data.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

const benefits = [
  {
    title: "Auto-Sync Your Stats",
    description: "Problem counts, contest ratings, and badges automatically updated",
  },
  {
    title: "Find Your Level",
    description: "Connect with developers at your skill level (Easy, Medium, Hard)",
  },
  {
    title: "Share Solutions",
    description: "Discuss approaches with syntax-highlighted code snippets",
  },
];

const reasons = [
  {
    icon: <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    label: "Instant Setup",
  },
  {
    icon: <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    label: "Secure & Safe",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    label: "Public Data Only",
  },
  {
    icon: <Code2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    label: "100% Free",
  },
];
