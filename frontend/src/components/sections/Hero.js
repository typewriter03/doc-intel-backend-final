"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Hero() {
  const [tilt, setTilt] = useState(45);
  const [duration, setDuration] = useState(0.8);

  useEffect(() => {
    const handleScroll = () => {
      const maxTilt = 45; // Maximum tilt angle
      const scrollY = window.scrollY;
      const tiltValue = Math.max(maxTilt - scrollY / 8, 0); // Adjust based on scroll
      setTilt(tiltValue);
      setDuration(0.3);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Grid Background Pattern - Outside section */}
      <div className="absolute w-full left-0 top-[10%] md:top-[20%] h-[300px] pointer-events-none  ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="gridPattern"
              patternUnits="userSpaceOnUse"
              width="20"
              height="20"
              patternTransform="scale(3) rotate(0)"
            >
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="hsla(0, 0%, 100%, 0)"
              ></rect>
              <path
                d="M 10,-2.55e-7 V 20 Z M -1.1677362e-8,10 H 20 Z"
                strokeWidth="0.5"
                stroke="currentColor"
                className="text-black/15"

                fill="none"
              ></path>
            </pattern>
          </defs>
          <rect
            width="800%"
            height="800%"
            transform="translate(0,0)"
            fill="url(#gridPattern)"
          ></rect>
        </svg>
        {/* Gradient overlays to fade grid */}
        <div className="bg-gradient-to-b from-background from-20% to-transparent absolute inset-0"></div>
        <div className="bg-gradient-to-l from-background from-1% to-transparent to-30% absolute inset-0"></div>
        <div className="bg-gradient-to-r from-background from-1% to-transparent to-30% absolute inset-0"></div>
        <div className="bg-gradient-to-t from-background from-1% to-transparent to-30% absolute inset-0"></div>
      </div>

      <section className="relative z-10 flex flex-col items-start md:items-center py-16 md:py-24 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-accent-blue/10 to-accent-blue-soft/10 blur-3xl rounded-full"></div>
        </div>

        {/* Floating documents - minimal */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-32 left-10 w-32 h-40 bg-gradient-to-br from-white to-background-subtle rounded-xl shadow-elevated border border-border opacity-60 hidden md:block"
        >
          <div className="p-4 space-y-2">
            <div className="h-1.5 bg-text-muted/20 rounded w-3/4"></div>
            <div className="h-1.5 bg-text-muted/20 rounded w-full"></div>
            <div className="h-1.5 bg-text-muted/20 rounded w-5/6"></div>
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -2, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-48 right-10 w-32 h-40 bg-gradient-to-br from-white to-background-subtle rounded-xl shadow-elevated border border-border opacity-60 hidden md:block"
        >
          <div className="p-4 space-y-2">
            <div className="h-1.5 bg-text-muted/20 rounded w-full"></div>
            <div className="h-1.5 bg-text-muted/20 rounded w-2/3"></div>
            <div className="h-1.5 bg-text-muted/20 rounded w-5/6"></div>
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full  border border-border shadow-soft">
                <Sparkles className="w-4 h-4 text-accent-blue" />
                <span className="text-sm font-medium text-text-secondary">
                  Powered by Advanced AI
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight"
            >
              <span className="text-text-primary">Transform Documents</span>
              <br />
              <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
                Into Intelligence
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
            >
              AI-powered document processing that extracts, understands, and
              structures information from any document—automatically.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <button className="bg-button-primary hover:bg-button-primary/90 text-button-primary-text px-8 h-12 rounded-lg text-base group shadow-elevated transition-all hover:scale-105 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 h-12 rounded-lg text-base border border-border hover:bg-background-subtle group transition-colors flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>


          </div>

          {/* Trusted by Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-12"
          >
            <p className="text-sm text-text-muted mb-6 text-center opacity-100">
              Trusted by forward-thinking enterprises
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              {["ACME", "GLOBEX", "INITECH", "UMBRELLA", "WAYNE"].map((company) => (
                <span
                  key={company}
                  className="text-base md:text-lg font-semibold tracking-wider text-text-muted"
                >
                  {company}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}