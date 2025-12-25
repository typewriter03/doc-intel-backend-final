"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-background">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] premium-gradient opacity-[0.08] blur-3xl rounded-full"></div>
      </div>

      {/* Floating documents - clean and minimal */}
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
        className="absolute top-32 left-10 w-32 h-40 holographic-doc rounded-xl shadow-elevated border border-border opacity-60"
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
        className="absolute top-48 right-10 w-32 h-40 holographic-doc rounded-xl shadow-elevated border border-border opacity-60"
      >
        <div className="p-4 space-y-2">
          <div className="h-1.5 bg-text-muted/20 rounded w-full"></div>
          <div className="h-1.5 bg-text-muted/20 rounded w-2/3"></div>
          <div className="h-1.5 bg-text-muted/20 rounded w-5/6"></div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-card border border-border shadow-soft">
              <Sparkles className="w-4 h-4 text-accent-blue" />
              <span className="text-sm font-medium text-text-secondary">Powered by Advanced AI</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight"
          >
            <span className="text-text-primary">Understand Every</span>
            <br />
            <span className="text-gradient-blue">Document Instantly</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            A unified AI platform that parses, understands, compares, and structures
            information across all your documents.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              className="bg-button-primary hover:bg-button-primary/90 text-button-primary-text px-8 h-12 text-base group shadow-elevated"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 text-base border-button-secondary-border hover:bg-background-subtle group"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-12 pt-12"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-1">99.9%</div>
              <div className="text-sm text-text-muted">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-1">10M+</div>
              <div className="text-sm text-text-muted">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-1">50+</div>
              <div className="text-sm text-text-muted">File Formats</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center p-1.5"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1.5 bg-text-muted rounded-full"
          ></motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}