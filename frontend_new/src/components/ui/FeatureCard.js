"use client";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function FeatureCard({ feature, index, isInView }) {
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
      <div className="relative bg-background-card rounded-2xl p-8 border border-border hover:border-accent-blue/30 shadow-card hover:shadow-elevated transition-all duration-500 h-full flex flex-col">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-blue/0 to-accent-blue/0 group-hover:from-accent-blue/5 group-hover:to-transparent transition-all duration-500 pointer-events-none"></div>

        {/* Icon */}
        <div className="relative mb-6">
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
          >
            <feature.icon className="w-7 h-7 text-white" />
          </div>
          
          {/* Decorative dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Content */}
        <div className="relative flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-3 text-text-primary group-hover:text-accent-blue transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-text-secondary leading-relaxed mb-4 flex-1">
            {feature.description}
          </p>

          {/* Learn more link */}
          <div className="flex items-center gap-2 text-sm font-medium text-accent-blue opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span>Learn more</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
      </div>
    </motion.div>
  );
}