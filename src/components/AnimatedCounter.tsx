"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

interface CounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1500, 
  delay = 0, 
  className = "",
  suffix = "",
  prefix = ""
}: CounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const obj = { value: 0 };
    
    animate(obj, {
      value,
      duration,
      delay,
      easing: "out(3)",
      round: 1,
      update: function () {
        if (elementRef.current) {
          elementRef.current.textContent = `${prefix}${obj.value}${suffix}`;
        }
      },
    });
  }, [value, duration, delay, prefix, suffix]);

  return <span ref={elementRef} className={className}>0</span>;
}
