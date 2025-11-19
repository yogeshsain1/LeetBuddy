"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-tl from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-2 shadow-sm backdrop-blur-sm animate-fade-in">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Welcome to the future
          </span>
        </div>

        {/* Hero headline */}
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in-up">
          Build Something{" "}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
            Amazing
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl animate-fade-in-up delay-200">
          Create stunning web experiences with modern tools and beautiful design.
          Fast, responsive, and built for the future.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row animate-fade-in-up delay-300">
          <Button
            size="lg"
            className="group h-12 gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:from-blue-500 dark:to-purple-500"
          >
            Get Started
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-2 px-8 text-base font-semibold backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg"
          >
            Learn More
          </Button>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up delay-500">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-primary transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const features = [
  {
    title: "Lightning Fast",
    description: "Built with performance in mind, delivering instant load times.",
    icon: "⚡",
  },
  {
    title: "Beautiful Design",
    description: "Crafted with attention to detail and modern aesthetics.",
    icon: "✨",
  },
  {
    title: "Fully Responsive",
    description: "Looks perfect on every device, from mobile to desktop.",
    icon: "📱",
  },
];