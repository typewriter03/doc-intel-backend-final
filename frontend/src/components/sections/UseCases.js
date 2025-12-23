"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useCases } from "@/lib/content/useCases";

export default function UseCases() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="use-cases" ref={ref} className="py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-accent-green/10 to-accent-blue/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-text-primary">
            Built for Real-World
            <br />
            <span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">
              Use Cases
            </span>
          </h2>
          <p className="text-xl text-text-secondary leading-relaxed">
            From finance to healthcare, NiyamR Flow powers document processing
            across industries
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background-card rounded-2xl p-8 border border-border hover:shadow-elevated transition-all duration-300 h-full">
                {/* Emoji Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {useCase.emoji}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 text-text-primary">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed mb-4">
                  {useCase.description}
                </p>

                {/* Stats */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20">
                  <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                  <span className="text-sm font-medium text-accent-blue">
                    {useCase.stats}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}