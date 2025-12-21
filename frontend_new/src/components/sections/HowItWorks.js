'use client';
import { motion } from "framer-motion";
import { Upload, Cpu, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "Ingest & Analyze",
    description: "Securely upload documents in any format. Our AI immediately begins parsing and classifying your data using advanced OCR and semantic understanding.",
    icon: Upload,
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20"
  },
  {
    title: "Intelligence Engine",
    description: "The platform extracts deep insights, performs reconciliations, and identifies anomalies across your entire document hub automatically.",
    icon: Cpu,
    color: "bg-purple-500",
    shadow: "shadow-purple-500/20"
  },
  {
    title: "Actionable Results",
    description: "Get structured data, generate comprehensive audit reports, and interact with your document knowledge using our RAG-powered AI chat.",
    icon: BarChart3,
    color: "bg-green-500",
    shadow: "shadow-green-500/20"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-text-primary mb-6"
          >
            How it <span className="text-accent-blue">Works</span>
          </motion.h2>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-xl text-text-secondary leading-relaxed"
          >
            NiyamR Flow transforms complex document processing into a simple, automated intelligence workflow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting lines for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10"></div>

          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative bg-background-card border border-border p-10 rounded-3xl shadow-soft hover:shadow-elevated transition-all group hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-2xl ${step.color} ${step.shadow} flex items-center justify-center mb-8 mx-auto md:mx-0 group-hover:scale-110 transition-transform`}>
                 <step.icon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute top-10 right-10 text-4xl font-black text-text-secondary/10 group-hover:text-accent-blue/10 transition-colors">
                0{index + 1}
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4 text-center md:text-left">{step.title}</h3>
              <p className="text-text-secondary text-lg leading-relaxed text-center md:text-left">
                {step.description}
              </p>
              
              {index < steps.length - 1 && (
                <div className="mt-8 flex justify-center md:justify-start">
                   <ArrowRight className="w-6 h-6 text-accent-blue opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-24 text-center"
        >
           <Link href="/dashboard" className="inline-flex items-center gap-2 text-accent-blue font-bold text-xl hover:underline">
              Experience the workflow now
              <ArrowRight className="w-5 h-5" />
           </Link>
        </motion.div>
      </div>
    </section>
  );
}
