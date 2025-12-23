'use client';
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { motion } from "framer-motion";
import { Target, Users, Zap, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Vision-Led",
      description:
        "We believe document intelligence should be seamless and accessible, turning static files into dynamic knowledge hubs.",
    },
    {
      icon: Users,
      title: "Developer-First",
      description:
        "Built by developers for developers, our platform is designed for deep integration and maximum flexibility.",
    },
    {
      icon: Zap,
      title: "Innovation-Centric",
      description:
        "We push the boundaries of what's possible with AI, from RAG-powered chat to complex graph visualizations.",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description:
        "Data security is at the core of our architecture. We ensure enterprise-grade protection for every document processed.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="pt-40 pb-20 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-accent-blue/5 to-transparent pointer-events-none -z-10"></div>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-bold mb-8 text-text-primary"
              >
                The Future of
                <br />
                <span className="bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">
                  Document IQ
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-2xl mx-auto"
              >
                NiyamR Flow was founded on a singular premise: the information locked in your documents is your greatest asset. We help you unlock it.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-32 bg-background-subtle/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-background-card rounded-[3rem] p-12 md:p-20 border border-border shadow-elevated relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 text-text-primary">
                    Our Story
                  </h2>
                  <div className="space-y-8 text-lg md:text-xl text-text-secondary leading-relaxed">
                    <p>
                      We started NiyamR Flow after years of seeing organizations struggle with the bottleneck of manual document processing. From finance to healthcare, valuable data was being trapped in static files, requiring thousands of man-hours to extract and analyze.
                    </p>
                    <p>
                      Our team of AI researchers and engineers set out to build a platform that doesn't just "read" text, but truly understands the context, structure, and relationships within documents.
                    </p>
                    <p>
                      Today, NiyamR Flow is the intelligence engine behind mission-critical workflows for organizations worldwide. We're not just automating tasks we're enabling a new era of data-driven decision making.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-24">
                <h2 className="text-5xl font-bold mb-6 text-text-primary">
                  Our Values
                </h2>
                <p className="text-xl text-text-secondary">
                  The principles that drive every line of code we write.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-background-card rounded-3xl p-10 border border-border hover:border-accent-blue/50 shadow-soft hover:shadow-elevated transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <value.icon className="w-8 h-8 text-accent-blue" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-text-primary">
                      {value.title}
                    </h3>
                    <p className="text-text-secondary text-lg leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-blue/5 -z-10"></div>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl md:text-6xl font-bold mb-8 text-text-primary">
                Ready to transform your
                <br />
                <span className="text-accent-blue">document workflow?</span>
              </h2>
              <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
                Join the hundreds of organizations already using NiyamR Flow to power their document intelligence.
              </p>
              <Link href="/dashboard" className="bg-button-primary hover:bg-button-primary/90 text-button-primary-text px-12 h-16 rounded-2xl text-xl font-bold shadow-elevated transition-all hover:scale-105 inline-flex items-center gap-3">
                Launch Dashboard
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
