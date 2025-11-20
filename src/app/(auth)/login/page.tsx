"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Github, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { LeetSocialLogo } from "@/components/LeetSocialLogo";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Success - redirect to dashboard
      router.push("/messages");
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden p-4">
      {/* Animated Background */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-full max-w-md z-10"
      >
        <Card className="p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/">
              <LeetSocialLogo size={56} withText />
            </Link>
            <motion.h1
              className="text-3xl font-black text-gray-900 dark:text-white mt-6 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Welcome, LeetCoder!
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Sign in to chat, solve, and connect with the brightest minds in competitive programming.
            </motion.p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="space-y-4">
              <motion.div whileFocus={{ scale: 1.03 }}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white dark:bg-gray-900"
                  placeholder="you@leetcode.com"
                />
              </motion.div>
              <motion.div whileFocus={{ scale: 1.03 }}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white dark:bg-gray-900 pr-10"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:hover:text-cyan-400"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.03 }}>
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold shadow-lg hover:shadow-cyan-500/40 transition-all text-lg py-3 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                Login
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            className="mt-6 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              New here? <Link href="/signup" className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline">Sign up</Link>
            </span>
            <Button
              variant="ghost"
              type="button"
              className="gap-2"
              onClick={() => handleSocialLogin("github")}
            >
              <Github className="w-5 h-5" />
              GitHub
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
