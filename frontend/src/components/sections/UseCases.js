"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Building2,
  Stethoscope,
  Scale,
  Home,
  Truck,
  GraduationCap,
  Zap,
  Quote,
  FileText,
  FileJson,
  FileSpreadsheet,
  Database,
  BarChart3,
  CheckCircle,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

// ============================================
// USE CASES DATA
// ============================================
const useCases = [
  {
    id: "finance",
    industry: "Finance & Banking",
    icon: Building2,
    title: "Automate Financial Document Processing",
    description:
      "Transform invoices, statements, and financial reports into structured data instantly. Reduce manual entry errors and accelerate reconciliation.",
    color: "#3A7BFF", // Your theme blue
    documents: ["Invoices", "Bank Statements", "Tax Forms", "Receipts"],
    outputs: ["JSON Export", "Excel Reports", "ERP Integration", "Audit Trails"],
    stats: [
      { label: "Processing Time", value: "-92%" },
      { label: "Error Rate", value: "0.02%" },
      { label: "Cost Savings", value: "$2.4M" },
    ],
    testimonial: {
      quote: "We processed 50,000 invoices in the time it used to take for 500.",
      author: "Sarah Chen",
      role: "CFO, FinTech Corp",
    },
  },
  {
    id: "healthcare",
    industry: "Healthcare",
    icon: Stethoscope,
    title: "Streamline Medical Records Management",
    description:
      "Extract patient data from clinical documents, lab reports, and prescriptions with HIPAA-compliant processing.",
    color: "#19C37D", // Your theme green
    documents: [
      "Patient Records",
      "Lab Results",
      "Prescriptions",
      "Insurance Claims",
    ],
    outputs: [
      "EHR Integration",
      "HL7/FHIR",
      "Analytics Dashboard",
      "Compliance Reports",
    ],
    stats: [
      { label: "Data Accuracy", value: "99.9%" },
      { label: "HIPAA Compliant", value: "100%" },
      { label: "Time Saved", value: "15hrs/day" },
    ],
    testimonial: {
      quote: "Patient onboarding went from 45 minutes to under 5.",
      author: "Dr. Michael Torres",
      role: "CIO, Metro Health",
    },
  },
  {
    id: "legal",
    industry: "Legal",
    icon: Scale,
    title: "Accelerate Contract Analysis",
    description:
      "Extract clauses, identify risks, and compare contracts at scale. Never miss a critical detail in legal documents again.",
    color: "#3A7BFF", // Using your blue for consistency
    documents: ["Contracts", "NDAs", "Legal Briefs", "Court Filings"],
    outputs: [
      "Clause Library",
      "Risk Scores",
      "Comparison Reports",
      "Deal Room",
    ],
    stats: [
      { label: "Review Speed", value: "85x faster" },
      { label: "Risk Detection", value: "99.5%" },
      { label: "Contracts/Day", value: "10,000+" },
    ],
    testimonial: {
      quote: "Due diligence that took weeks now takes hours.",
      author: "Jennifer Walsh",
      role: "Partner, Legal Associates",
    },
  },
  {
    id: "insurance",
    industry: "Insurance",
    icon: Shield,
    title: "Accelerate Claims Processing",
    description: "Auto-extract data from claim forms, medical bills, and supporting documents. Detect fraud patterns and streamline adjudication.",
    color: "#3A7BFF",
    documents: ["Claim Forms", "Medical Bills", "Accident Photos", "Police Reports"],
    outputs: ["Auto-Adjudication", "Fraud Scores", "Settlement Letters", "Analytics"],
    stats: [
      { label: "Processing Time", value: "-85%" },
      { label: "Fraud Detection", value: "99.2%" },
      { label: "Cost Savings", value: "$3.1M" }
    ],
    testimonial: {
      quote: "We went from 7 days to 2 hours for average claim processing.",
      author: "David Martinez",
      role: "COO, InsureMax"
    }
  },
  {
    id: "compliance",
    industry: "Compliance & Audit",
    icon: ShieldCheck,
    title: "Streamline Regulatory Compliance",
    description: "Monitor policy documents, certifications, and audit trails. Auto-detect compliance gaps and generate audit-ready reports.",
    color: "#3A7BFF",
    documents: ["Policy Docs", "Audit Reports", "Certifications", "Training Records"],
    outputs: ["Risk Dashboard", "Gap Analysis", "Audit Reports", "Alerts"],
    stats: [
      { label: "Audit Prep", value: "-70%" },
      { label: "Violations", value: "0" },
      { label: "Coverage", value: "100%" }
    ],
    testimonial: {
      quote: "Passed SOC2 audit with zero findings. Game changer.",
      author: "James Wilson",
      role: "CISO, DataCorp"
    }
  },
  {
    id: "hr",
    industry: "HR & Recruitment",
    icon: Users,
    title: "Automate Talent Acquisition",
    description: "Screen thousands of resumes instantly. Extract skills, experience, and qualifications. Automated candidate matching and scoring.",
    color: "#19C37D",
    documents: ["Resumes", "Cover Letters", "References", "Certifications"],
    outputs: ["Candidate Scores", "Skills Database", "ATS Integration", "Interview Briefs"],
    stats: [
      { label: "Screening Speed", value: "100x" },
      { label: "Match Accuracy", value: "94%" },
      { label: "Time-to-Hire", value: "-60%" }
    ],
    testimonial: {
      quote: "We now screen 1,000 resumes in the time it took for 10.",
      author: "Emily Foster",
      role: "Head of Talent, TechGiant"
    }
  },
];

// ============================================
// DOCUMENT CARD COMPONENT
// ============================================
const DocumentCard = ({ name, index, isInput, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isInput ? -20 : 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
      }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="group relative"
    >
      <div
        className="px-3 py-2 rounded-xl border-2 bg-background-card backdrop-blur-sm text-center transition-all duration-300"
        style={{
          borderColor: isInput ? "#E2E4EA" : color,
          boxShadow: isInput
            ? "0 2px 8px rgba(0,0,0,0.04)"
            : `0 4px 12px ${color}20`,
        }}
      >
        <div className="text-xs font-semibold text-text-primary whitespace-nowrap">
          {name}
        </div>

        {/* Success indicator for outputs */}
        {!isInput && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center border-2 border-background"
          >
            <CheckCircle className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// TRANSFORMATION VISUAL COMPONENT
// ============================================
const TransformationVisual = ({ useCase }) => {
  return (
    <div className="relative flex items-center justify-center gap-4 lg:gap-8 py-8">
      {/* Input Documents */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 text-center">
          Input
        </span>
        {useCase.documents.map((doc, index) => (
          <DocumentCard
            key={doc}
            name={doc}
            index={index}
            isInput={true}
            color={useCase.color}
          />
        ))}
      </div>

      {/* Transformation Arrow with AI Core */}
      <div className="relative flex flex-col items-center justify-center mx-4 lg:mx-8">
        {/* Animated connection lines */}
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          style={{ minWidth: 120, minHeight: 200 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9DA3AF" stopOpacity="0.3" />
              <stop offset="50%" stopColor={useCase.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#9DA3AF" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Flow lines */}
          {[0, 1, 2, 3].map((i) => (
            <motion.path
              key={i}
              d={`M 0 ${40 + i * 45} Q 60 ${80 + (i % 2) * 40} 120 ${40 + i * 45
                }`}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: i * 0.2 }}
            />
          ))}

          {/* Flowing particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={`particle-${i}`}
              r="3"
              fill={useCase.color}
              filter="url(#glow)"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                offsetPath: `path("M 0 ${40 + i * 45} Q 60 ${80 + (i % 2) * 40
                  } 120 ${40 + i * 45}")`,
              }}
            >
              <animateMotion
                dur="2s"
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
                path={`M 0 ${40 + i * 45} Q 60 ${80 + (i % 2) * 40} 120 ${40 + i * 45
                  }`}
              />
            </motion.circle>
          ))}
        </svg>

        {/* AI Processing Core */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
        >
          <motion.div
            className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${useCase.color}20, ${useCase.color}40)`,
              boxShadow: `0 0 40px ${useCase.color}30, inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}
            animate={{
              boxShadow: [
                `0 0 20px ${useCase.color}20`,
                `0 0 40px ${useCase.color}40`,
                `0 0 20px ${useCase.color}20`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles
              className="w-8 h-8 lg:w-10 lg:h-10"
              style={{ color: useCase.color }}
            />

            {/* Orbiting elements */}
            <motion.div
              className="absolute w-full h-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{ backgroundColor: useCase.color }}
              />
            </motion.div>
            <motion.div
              className="absolute w-full h-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-green"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-background-card border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Zap className="w-3 h-3" style={{ color: useCase.color }} />
            <span className="text-xs font-semibold text-text-primary">
              AI Processing
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Output Documents */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 text-center">
          Output
        </span>
        {useCase.outputs.map((output, index) => (
          <DocumentCard
            key={output}
            name={output}
            index={index}
            isInput={false}
            color={useCase.color}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// STAT BADGE COMPONENT
// ============================================
const StatBadge = ({ label, value, index, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="relative group"
    >
      <div
        className="px-4 py-3 rounded-xl bg-background-card backdrop-blur-sm border transition-all duration-300 text-center"
        style={{
          borderColor: `${color}30`,
          boxShadow: `0 4px 20px ${color}10`,
        }}
      >
        <div className="text-2xl lg:text-3xl font-bold mb-1" style={{ color }}>
          {value}
        </div>
        <div className="text-xs text-text-muted font-medium uppercase tracking-wider">
          {label}
        </div>

        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
          style={{
            background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)`,
          }}
        />
      </div>
    </motion.div>
  );
};

// ============================================
// TESTIMONIAL CARD COMPONENT
// ============================================
const TestimonialCard = ({ quote, author, role, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: "spring" }}
      className="relative mt-6 p-5 rounded-2xl bg-background-card backdrop-blur-sm border border-border"
      style={{
        boxShadow: `0 4px 30px ${color}10`,
      }}
    >
      {/* Quote icon */}
      <div
        className="absolute -top-3 left-6 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}CC)`,
          boxShadow: `0 4px 12px ${color}40`,
        }}
      >
        <Quote className="w-4 h-4 text-white" />
      </div>

      <p className="text-text-primary font-medium italic mt-2 mb-4">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}AA)`,
          }}
        >
          {author
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <div className="font-semibold text-text-primary text-sm">
            {author}
          </div>
          <div className="text-xs text-text-muted">{role}</div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// INDUSTRY TAB COMPONENT
// ============================================
const IndustryTab = ({ id, industry, icon: Icon, color, isActive, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
        }`}
      style={{
        backgroundColor: isActive ? `${color}15` : "transparent",
        border: isActive ? `2px solid ${color}` : "2px solid transparent",
      }}
    >
      <Icon
        className="w-5 h-5"
        style={{ color: isActive ? color : "currentColor" }}
      />
      <span className="hidden sm:inline">{industry}</span>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-xl -z-10"
          style={{
            background: `linear-gradient(135deg, ${color}10, ${color}05)`,
            boxShadow: `0 4px 20px ${color}20`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Pulse indicator for active */}
      {isActive && (
        <motion.div
          className="absolute -right-1 -top-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

// ============================================
// MAIN USE CASES SECTION
// ============================================
export default function UseCasesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activeUseCase = useCases[activeIndex];

  // Auto-cycle through use cases
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % useCases.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 15 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  return (
    <section
      id="use-cases"
      className="relative py-24 lg:py-32 bg-background overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: activeUseCase.color }}
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: activeUseCase.color }}
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(${activeUseCase.color} 1px, transparent 1px), linear-gradient(90deg, ${activeUseCase.color} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-card border border-border shadow-soft mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-semibold text-accent-blue">
              Industry Solutions
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4"
          >
            Transforming Every Industry
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            See how leading organizations across industries are revolutionizing
            their document workflows
          </motion.p>
        </div>

        {/* Industry Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {useCases.map((useCase, index) => (
            <IndustryTab
              key={useCase.id}
              {...useCase}
              isActive={activeIndex === index}
              onClick={() => handleTabClick(index)}
            />
          ))}
        </motion.div>

        {/* Main Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUseCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative max-w-6xl mx-auto"
          >
            {/* Glassmorphism card */}
            <div
              className="relative rounded-3xl p-6 lg:p-10 bg-background-card backdrop-blur-xl border border-border overflow-hidden"
              style={{
                boxShadow: `0 20px 60px ${activeUseCase.color}15, 0 0 0 1px ${activeUseCase.color}10`,
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${activeUseCase.color}40, transparent)`,
                }}
              />

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left: Info */}
                <div className="flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Industry badge */}
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4"
                      style={{
                        backgroundColor: `${activeUseCase.color}15`,
                        color: activeUseCase.color,
                      }}
                    >
                      <activeUseCase.icon className="w-4 h-4" />
                      {activeUseCase.industry}
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-bold text-text-primary mb-4">
                      {activeUseCase.title}
                    </h3>

                    <p className="text-text-secondary mb-6 leading-relaxed">
                      {activeUseCase.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {activeUseCase.stats.map((stat, index) => (
                        <StatBadge
                          key={stat.label}
                          {...stat}
                          index={index}
                          color={activeUseCase.color}
                        />
                      ))}
                    </div>

                    {/* Testimonial */}
                    {activeUseCase.testimonial && (
                      <TestimonialCard
                        {...activeUseCase.testimonial}
                        color={activeUseCase.color}
                      />
                    )}
                  </motion.div>
                </div>

                {/* Right: Transformation Visual */}
                <div className="flex items-center justify-center">
                  <TransformationVisual useCase={activeUseCase} />
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {useCases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    width: activeIndex === index ? 32 : 12,
                    backgroundColor:
                      activeIndex === index
                        ? activeUseCase.color
                        : "#E2E4EA",
                  }}
                >
                  {activeIndex === index && isAutoPlaying && (
                    <motion.div
                      className="absolute inset-0 bg-white/50"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 6, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}