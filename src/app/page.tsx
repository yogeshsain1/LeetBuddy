"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  MessageCircle, 
  Users, 
  Trophy,
  Sparkles,
  Rocket,
  TrendingUp,
  Zap,
  Send
} from "lucide-react";
import { LeetSocialLogo } from "@/components/LeetSocialLogo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const controls = useAnimation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    setMounted(true);
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "10%", right: "10%" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-slate-800/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/" className="flex items-center group">
                <LeetSocialLogo size={44} withText />
              </Link>
            </motion.div>
            
            {/* Right Section */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-3"
            >
              {/* Theme Toggle with Animation */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ThemeToggle />
              </motion.div>
              
              {/* Login Button */}
              <Link href="/login">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button variant="outline" className="rounded-full font-semibold border-2 border-blue-500 dark:border-cyan-500 text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-slate-800">
                    Login
                  </Button>
                </motion.div>
              </Link>
              
              {/* CTA Button */}
              <Link href="/signup">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button className="relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 group">
                    {/* Animated background shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    
                    <span className="relative font-bold flex items-center gap-2">
                      Sign Up
                      <motion.div
                        animate={{ 
                          rotate: [0, 15, -15, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-8">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-full text-sm font-semibold backdrop-blur-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                </motion.div>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Join Live Discussions
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              </motion.div>
            </motion.div>
              
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black leading-tight">
                <motion.span 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="block text-gray-900 dark:text-white"
                >
                  Code.
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent"
                >
                  Chat.
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="block text-gray-900 dark:text-white"
                >
                  Win.
                </motion.span>
              </h1>
            </motion.div>
              
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium"
            >
              Real-time platform for competitive programmers
              <br />
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Discuss • Learn • Dominate</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            >
              <Link href="/messages">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    className="h-14 px-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-bold shadow-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all group relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Start Chatting
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/leaderboard">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 px-10 rounded-full text-lg font-bold border-2 border-blue-600 dark:border-cyan-500 hover:bg-blue-50 dark:hover:bg-slate-800 group transition-all"
                  >
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    Leaderboard
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <TrendingUp className="w-5 h-5 ml-2 text-green-500" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="pt-12 flex flex-wrap items-center justify-center gap-4"
            >
              {[
                { icon: "🔥", text: "0 Solved", color: "from-orange-500 to-red-500" },
                { icon: "💬", text: "0 Chatting", color: "from-blue-500 to-cyan-500" },
                { icon: "⚡", text: "0 Contests", color: "from-yellow-500 to-orange-500" },
                { icon: "👥", text: "0 Online", color: "from-green-500 to-emerald-500" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.6 + i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${item.color} rounded-full shadow-lg backdrop-blur-sm cursor-pointer`}
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="text-lg"
                  >
                    {item.icon}
                  </motion.span>
                  <span className="font-bold text-white text-sm">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Your Coding Hub
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need in one place
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "Live Chat",
                desc: "Instant problem discussions",
                emoji: "💬",
                link: "/messages",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Leaderboard",
                desc: "Compete & climb ranks",
                emoji: "🏆",
                link: "/leaderboard",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Study Groups",
                desc: "Learn with peers",
                emoji: "👥",
                link: "/groups",
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={controls}
                variants={{
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { duration: 0.5, delay: i * 0.2 } 
                  }
                }}
              >
                <Link href={feature.link}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-slate-800 hover:border-transparent hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                  >
                    {/* Gradient Overlay on Hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                    />
                    
                    {/* Emoji Background */}
                    <motion.div 
                      className="absolute -top-4 -right-4 text-8xl opacity-5"
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.emoji}
                    </motion.div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.desc}</p>
                      <motion.div 
                        className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-semibold"
                        whileHover={{ x: 4 }}
                      >
                        <span>Explore</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Zap className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-slate-900 dark:bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800"
      >
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <motion.div 
            className="flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <LeetSocialLogo size={32} withText />
          </motion.div>
          <p className="text-gray-400 text-sm">
            Where competitive programmers connect, compete, and grow together. 🚀
          </p>
          <p className="text-gray-500 text-xs">
            &copy; 2025 LeetSocial. Built with 💙 by coders, for coders.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}