import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/ui/Footer";
import { Timeline } from "@/components/ui/timeline";
import HowItWorks from "@/components/sections/HowItWorks";
import DocumentFlow from "@/components/sections/DocumentFlow";
import UseCasesSection from "@/components/sections/UseCases";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DocumentFlow />

        <HowItWorks />
        <UseCasesSection />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}