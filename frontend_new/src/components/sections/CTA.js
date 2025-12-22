"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent-blue/5 to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-blue-soft/10 rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-[3rem] p-12 md:p-20 text-center max-w-4xl mx-auto bg-background-card/50 backdrop-blur-xl border border-border shadow-elevated"
        >
          {/* Decorative elements */}
          <div className="absolute top-8 left-8 w-4 h-4 rounded-full bg-accent-blue/30" />
          <div className="absolute top-8 right-8 w-4 h-4 rounded-full bg-accent-blue-soft/30" />
          <div className="absolute bottom-8 left-8 w-4 h-4 rounded-full bg-accent-blue-soft/30" />
          <div className="absolute bottom-8 right-8 w-4 h-4 rounded-full bg-accent-blue/30" />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Ready to Transform Your
            <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
              {" "}
              Document Workflow?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
          >
            Join thousands of enterprises already using our AI powered platform
            to process millions of documents with unprecedented accuracy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="bg-button-primary hover:bg-button-primary/90 text-button-primary-text px-8 h-14 rounded-lg text-lg font-semibold group shadow-elevated transition-all hover:scale-105 flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 h-14 rounded-lg text-lg font-semibold border-2 border-border hover:bg-background-subtle group transition-all hover:scale-105 flex items-center justify-center gap-2">
              Schedule Demo
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 text-sm text-text-muted"
          >

          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}