"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Star } from "lucide-react";


 const testimonials = [
  {
    name: "Sarah Chen",
    role: "CFO at TechCorp",
    avatar: "S",
    quote: "NiyamR Flow reduced our invoice processing time from 5 days to 5 minutes. We've eliminated nearly all manual errors.",
  },
  {
    name: "Michael Rodriguez",
    role: "Legal Director",
    avatar: "M",
    quote: "Contract analysis that used to take our team hours now happens in seconds. The clause detection feature is a game-changer for due diligence.",
  },
  {
    name: "Emily Watson",
    role: "Operations Manager",
    avatar: "E",
    quote: "We process thousands of medical forms daily. This AI understands complex healthcare documents better than expected. Truly impressive.",
  },
 
];
export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative py-12 md:py-16 bg-background overflow-hidden"
    >
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue-soft/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-accent-blue uppercase tracking-widest mb-4"
          >
            Testimonials
          </motion.p>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary leading-tight">
            Loved by Teams
            <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
              Around the World
            </span>
          </h2>

          <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
            Hear from professionals who transformed their document workflows with our platform
          </p>
        </motion.div>

        {/* Testimonials Grid - Masonry Style */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="break-inside-avoid mb-6 md:mb-8"
            >
              <div className="group bg-background-card rounded-2xl p-6 md:p-8 border border-border shadow-soft hover:shadow-elevated hover:border-accent-blue/30 transition-all duration-300">
                {/* Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <Quote className="w-8 h-8 md:w-10 md:h-10 text-accent-blue/20 group-hover:text-accent-blue/40 transition-colors" />
                  
                  {/* Star Rating */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-accent-blue text-accent-blue"
                      />
                    ))}
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-text-secondary leading-relaxed mb-6 text-base md:text-lg">
                  "{testimonial.quote}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  {/* Avatar */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-accent-blue to-accent-blue-soft flex items-center justify-center text-xl md:text-2xl font-semibold text-white shadow-soft flex-shrink-0">
                    {testimonial.avatar}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="font-bold text-text-primary text-sm md:text-base truncate">
                      {testimonial.name}
                    </div>
                    <div className="text-xs md:text-sm text-text-muted truncate">
                      {testimonial.role}
                    </div>
                    {testimonial.company && (
                      <div className="text-xs text-accent-blue font-medium mt-0.5 truncate">
                        {testimonial.company}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-text-muted text-sm md:text-base">
            Join thousands of satisfied customers transforming their document workflows
          </p>
        </motion.div>
      </div>
    </section>
  );
}