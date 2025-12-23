"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { faqs } from "@/lib/content/faqs";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" ref={ref} className="py-16 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-accent-blue/10 to-accent-blue-soft/10 rounded-full filter blur-3xl"></div>
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-card border border-border shadow-soft mb-6"
          >
            <HelpCircle className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-medium text-text-secondary">
              FAQ
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary leading-tight">
            Frequently Asked
            <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
            Everything you need to know about NiyamR Flow and how it can transform your document workflow
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div 
                className={`bg-background-card rounded-2xl border overflow-hidden transition-all duration-300 ${
                  openIndex === index 
                    ? "border-accent-blue shadow-elevated" 
                    : "border-border shadow-soft hover:border-accent-blue/50"
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 md:px-8 py-6 flex items-start justify-between text-left hover:bg-background-subtle/50 transition-colors group"
                >
                  <div className="flex items-start gap-4 flex-1">
                  
                    
                    <span className="font-semibold text-base md:text-lg text-text-primary pr-4 leading-relaxed">
                      {faq.question}
                    </span>
                  </div>
                  
                  <ChevronDown
                    className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-all duration-300 ${
                      openIndex === index 
                        ? "rotate-180 text-accent-blue" 
                        : "group-hover:text-accent-blue"
                    }`}
                  />
                </button>

                {/* Answer */}
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 md:px-8 pb-6 pl-20">
                    <div className="text-text-secondary leading-relaxed text-base border-l-2 border-accent-blue/20 pl-6">
                      {faq.answer}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

   
      </div>
    </section>
  );
}