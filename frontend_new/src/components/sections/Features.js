"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { features } from "@/lib/content/features";
import { Sparkles, ArrowRight } from "lucide-react";

function FeatureCard({ feature, index, isInView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className="group h-full"
    >
      <div className="relative bg-background-card backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-accent-blue/50 shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 rounded-2xl bg-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

        {/* Icon Container */}
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-xl bg-accent-blue/10 flex items-center justify-center group-hover:bg-accent-blue group-hover:scale-105 transition-all duration-300">
            <feature.icon className="w-7 h-7 text-accent-blue group-hover:text-white transition-colors duration-300" />
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 flex flex-col">
          <h3 className="text-xl font-semibold mb-3 text-text-primary group-hover:text-accent-blue transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-text-secondary leading-relaxed flex-1">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-20 overflow-hidden bg-background"
    >
      {/* Subtle gradient overlay - matching Hero */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-accent-blue/5 to-accent-blue-soft/5 blur-3xl rounded-full"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {/* Top Label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-accent-blue uppercase tracking-widest mb-4"
          >
            Capabilities
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-text-primary"
          >
            Enterprise-Grade{" "}
            <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
              Document Intelligence
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary leading-relaxed"
          >
            Powerful features designed to transform how you work with documents,
            powered by state-of-the-art AI technology.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}