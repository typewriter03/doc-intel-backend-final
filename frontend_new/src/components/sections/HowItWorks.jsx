"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  Brain,
  FileType,
  Image as ImageIcon,
  FileSpreadsheet,
  Package,
  Scan,
  Grid,
  Languages,
  Tag,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Building2,
  Network,
  Download,
  FileJson,
  Activity,
  Layers,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

// ============================================
// STEP 1: MULTI-FORMAT UPLOAD - ULTRA VERSION
// ============================================
const MultiFormatUploadDemo = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFile, setActiveFile] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          setActiveFile((f) => (f + 1) % 2);
          return 0;
        }
        return prev + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const formats = [
    { icon: FileText, label: "PDF", color: "bg-red-500" },
    { icon: FileType, label: "DOCX", color: "bg-blue-500" },
    { icon: FileSpreadsheet, label: "XLSX", color: "bg-green-500" },
    { icon: ImageIcon, label: "PNG", color: "bg-purple-500" },
    { icon: ImageIcon, label: "JPG", color: "bg-pink-500" },
  ];

  const features = [
    "Drag & drop upload",
    "Batch upload (up to 20 docs)",
    "Real-time progress tracking",
    "Instant document preview",
  ];

  const processingFiles = [
    { name: "contract_2024.pdf", size: "2.4 MB", icon: FileText },
    { name: "invoice_march.pdf", size: "1.8 MB", icon: FileText },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      {/* Left: Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20">
          <Upload className="w-4 h-4 text-accent-blue" />
          <span className="text-sm text-accent-blue font-medium">Multi-Format Upload</span>
        </div>

        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Drop Any Document,
            <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
              Get Instant Intelligence
            </span>
          </h3>
          <p className="text-base text-text-secondary leading-relaxed">
            Simply drag and drop your documents — PDFs, images, spreadsheets, scans.
            Our AI instantly processes and extracts structured data in real-time.
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-accent-blue flex-shrink-0" />
              <span className="text-sm text-text-primary">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Format Badges */}
        <div className="flex flex-wrap gap-3 pt-4">
          {formats.map((format, index) => (
            <motion.div
              key={format.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background-subtle border border-border"
            >
              <format.icon className="w-4 h-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">{format.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Visual */}
      <div className="relative">
        <div className="bg-background-card border border-border rounded-2xl p-6 shadow-elevated">
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-accent-blue/30 rounded-xl p-8 text-center hover:border-accent-blue/60 transition-colors duration-300 cursor-pointer group mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-blue-soft/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-accent-blue" />
            </div>
            <h4 className="text-base font-semibold text-text-primary mb-2">Drop files here</h4>
            <p className="text-sm text-text-muted mb-3">or click to browse</p>
            <p className="text-xs text-text-muted">Supports PDF, DOCX, XLSX, PNG, JPG</p>
          </div>

          {/* Processing Preview */}
          <div className="space-y-3">
            {processingFiles.map((file, index) => {
              const isActive = index === activeFile;
              const isComplete = index < activeFile;

              return (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-background-subtle border border-border rounded-xl p-4 flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isComplete ? "bg-green-500/20" : "bg-accent-blue/20"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <file.icon className="w-5 h-5 text-accent-blue" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                    <p className={`text-xs ${isComplete ? "text-green-500" : "text-text-muted"}`}>
                      {isComplete ? "Complete" : "Processing..."}
                    </p>
                  </div>
                  {isActive && !isComplete && (
                    <div className="w-20 h-1.5 rounded-full bg-background overflow-hidden">
                      <motion.div
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-accent-blue rounded-full"
                      />
                    </div>
                  )}
                  {isComplete && <span className="text-xs text-text-muted">{file.size}</span>}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Decorative Glow */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

// ============================================
// STEP 2: INTELLIGENT PARSING - ULTRA VERSION
// ============================================
const IntelligentParsingDemo = () => {
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedFeatures, setDetectedFeatures] = useState([]);

  useEffect(() => {
    const features = ["OCR", "Tables", "Images", "Layout", "Languages"];
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev >= 100 ? 0 : prev + 5;
        if (next % 20 === 0 && next > 0) {
          const featureIndex = Math.floor(next / 20) - 1;
          if (featureIndex < features.length && !detectedFeatures.includes(features[featureIndex])) {
            setDetectedFeatures((prev) => [...prev, features[featureIndex]]);
          }
        }
        if (next === 0) setDetectedFeatures([]);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [detectedFeatures]);

  const features = [
    { icon: Scan, label: "OCR Scanning", key: "OCR" },
    { icon: Grid, label: "Table Detection", key: "Tables" },
    { icon: ImageIcon, label: "Image Extraction", key: "Images" },
    { icon: Layers, label: "Layout Analysis", key: "Layout" },
    { icon: Languages, label: "Multi-Language", key: "Languages" },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      {/* Left: Visual */}
      <div className="relative order-2 lg:order-1">
        <div className="bg-background-card border border-border rounded-2xl p-6 shadow-elevated">
          {/* Document Preview */}
          <div className="relative bg-white rounded-xl p-4 border border-border mb-6 overflow-hidden">
            {/* Scanning Line */}
            {scanProgress > 0 && (
              <motion.div
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-accent-blue/50 z-10"
              />
            )}

            {/* Mock Document */}
            <div className="space-y-3 relative">
              <div className="h-2 bg-background-subtle rounded w-3/4"></div>
              <div className="h-8 bg-background-subtle rounded border border-border p-2">
                <div className="grid grid-cols-3 gap-1 h-full">
                  <div className="bg-border rounded"></div>
                  <div className="bg-border rounded"></div>
                  <div className="bg-border rounded"></div>
                </div>
              </div>
              <div className="h-12 bg-background-subtle rounded flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-text-muted" />
              </div>
              <div className="h-2 bg-background-subtle rounded w-full"></div>
              <div className="h-2 bg-background-subtle rounded w-5/6"></div>
            </div>
          </div>

          {/* Detection Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => {
              const isDetected = detectedFeatures.includes(feature.key);
              return (
                <div
                  key={feature.label}
                  className={`relative p-4 rounded-xl border transition-all duration-300 ${
                    isDetected ? "bg-accent-blue/5 border-accent-blue" : "bg-background-subtle border-border"
                  }`}
                >
                  {isDetected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-soft"
                    >
                      <CheckCircle className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                  <div className="flex items-center gap-3">
                    <feature.icon className={`w-5 h-5 ${isDetected ? "text-accent-blue" : "text-text-muted"}`} />
                    <span className={`text-sm font-medium ${isDetected ? "text-accent-blue" : "text-text-muted"}`}>
                      {feature.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative Glow */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right: Content */}
      <div className="space-y-6 order-1 lg:order-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20">
          <Brain className="w-4 h-4 text-accent-blue" />
          <span className="text-sm text-accent-blue font-medium">Intelligent Parsing</span>
        </div>

        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            AI That Scans,
            <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
              Understands Structure
            </span>
          </h3>
          <p className="text-base text-text-secondary leading-relaxed">
            Advanced AI instantly analyzes document structure with OCR for scans, precise table extraction,
            image detection, and layout understanding across multiple languages.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          {[
            { value: "50+", label: "Document Types" },
            { value: "99.7%", label: "Accuracy" },
            { value: "100+", label: "Languages" },
            { value: "<1s", label: "Processing" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background-subtle border border-border rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// STEP 3: AI UNDERSTANDING - ULTRA VERSION
// ============================================
const AIUnderstandingDemo = () => {
  const [activeEntities, setActiveEntities] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEntities((prev) => {
        if (prev.length >= 5) return [];
        return [...prev, prev.length];
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const entities = [
    { icon: User, label: "John Smith", type: "Person", color: "bg-blue-500/20 text-blue-500 border-blue-500/20" },
    { icon: Calendar, label: "March 15, 2024", type: "Date", color: "bg-purple-500/20 text-purple-500 border-purple-500/20" },
    { icon: Building2, label: "Acme Corp", type: "Organization", color: "bg-green-500/20 text-green-500 border-green-500/20" },
    { icon: DollarSign, label: "$2.5M", type: "Amount", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20" },
    { icon: MapPin, label: "San Francisco", type: "Location", color: "bg-red-500/20 text-red-500 border-red-500/20" },
  ];

  const insights = [
    { icon: Tag, title: "Document Classification", description: "Legal Contract - NDA" },
    { icon: MessageSquare, title: "Sentiment Analysis", description: "Neutral / Formal Tone" },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      {/* Left: Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20">
          <Sparkles className="w-4 h-4 text-accent-blue" />
          <span className="text-sm text-accent-blue font-medium">AI Understanding</span>
        </div>

        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            AI That Reads,
            <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
              Thinks, and Extracts
            </span>
          </h3>
          <p className="text-base text-text-secondary leading-relaxed">
            Beyond simple text extraction — our AI comprehends context, identifies entities,
            classifies documents, and generates intelligent summaries.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "50+", label: "Entity Types" },
            { value: "99.7%", label: "Accuracy" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background-subtle border border-border rounded-xl p-5 text-center"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Visual */}
      <div className="relative">
        <div className="bg-background-card border border-border rounded-2xl p-6 shadow-elevated">
          {/* Entity Graph */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-muted mb-4">Extracted Entities</h4>
            <div className="flex flex-wrap gap-3">
              {entities.map((entity, index) => {
                const isActive = activeEntities.includes(index);
                return (
                  <motion.div
                    key={entity.label}
                    initial={{ opacity: 0.3, scale: 0.95 }}
                    animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1 : 0.95 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                      isActive ? entity.color : "bg-background-subtle text-text-muted border-border"
                    }`}
                  >
                    <entity.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{entity.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Insights Cards */}
          <div className="space-y-3 mb-6">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-background-subtle border border-border rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                  <insight.icon className="w-5 h-5 text-accent-blue" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-text-muted">{insight.title}</p>
                  <p className="text-sm font-medium text-text-primary">{insight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent-blue/10 to-accent-blue-soft/5 border border-accent-blue/20">
            <h4 className="text-sm font-medium text-accent-blue mb-2">AI Summary</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              "This is a Non-Disclosure Agreement between Acme Corp and John Smith, executed on March 15, 2024,
              with a total value of $2.5M covering intellectual property..."
            </p>
          </div>
        </div>

        {/* Decorative Glow */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

// ============================================
// STEP 4: EXPORT - ULTRA VERSION
// ============================================
const StructuredOutputDemo = () => {
  const [activeFormat, setActiveFormat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFormat((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formats = [
    { icon: FileJson, name: "JSON", description: "Structured data for APIs", popular: true },
    { icon: FileSpreadsheet, name: "Excel", description: "Spreadsheet-ready tables" },
    { icon: FileText, name: "Markdown", description: "Clean documentation" },
    { icon: FileText, name: "PDF", description: "Professional reports" },
  ];

  const features = [
    "Confidence scores for extracted data",
    "Processing metadata & timestamps",
    "Download individual or bundled files",
    "API access for automation",
  ];

  const codeExample = `{
  "document": "contract_2024.pdf",
  "entities": [
    {
      "type": "person",
      "value": "John Smith",
      "confidence": 0.98
    },
    {
      "type": "amount",
      "value": "$2,500,000",
      "confidence": 0.99
    }
  ],
  "metadata": {
    "processed_at": "2024-03-15",
    "pages": 12,
    "language": "en"
  }
}`;

  return (
    <div className="space-y-8">
      {/* Format Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {formats.map((format, index) => {
          const isActive = index === activeFormat;
          return (
            <motion.div
              key={format.name}
              animate={{ scale: isActive ? 1.05 : 1 }}
              className={`relative bg-background-card border rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 ${
                isActive ? "border-accent-blue shadow-elevated" : "border-border"
              }`}
              onClick={() => setActiveFormat(index)}
            >
              {format.popular && (
                <div className="absolute top-3 right-3">
                  <Sparkles className="w-4 h-4 text-accent-blue fill-accent-blue" />
                </div>
              )}

              <div
                className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                  isActive ? "bg-accent-blue" : "bg-accent-blue/20"
                }`}
              >
                <format.icon className={`w-7 h-7 ${isActive ? "text-white" : "text-accent-blue"}`} />
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-2">{format.name}</h3>
              <p className="text-sm text-text-muted">{format.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Features + Code Preview */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">Every Export Includes</h3>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-accent-blue flex-shrink-0" />
              <span className="text-sm text-text-primary">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Code Preview */}
        <div className="bg-background-card border border-border rounded-xl p-4">
          <pre className="text-xs text-text-secondary overflow-x-auto">
            <code>{codeExample}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TIMELINE DATA
// ============================================
const timelineData = [
  {
    title: "1. Upload",
    heading: "Multi-Format Upload",
    description:
      "Drag and drop any document format — PDFs, images, Word, Excel, scanned files, and more. Batch upload up to 20 documents at once with real-time progress tracking.",
    content: <MultiFormatUploadDemo />,
  },
  {
    title: "2. Parse",
    heading: "Intelligent Parsing",
    description:
      "Advanced AI instantly analyzes document structure with OCR for scans, precise table extraction, image detection, layout understanding, and multi-language support.",
    content: <IntelligentParsingDemo />,
  },
  {
    title: "3. Process",
    heading: "AI Content Understanding",
    description:
      "Deep semantic analysis extracts entities, generates summaries, detects sentiment, identifies clauses in contracts, and builds relationship graphs across your data.",
    content: <AIUnderstandingDemo />,
  },
  {
    title: "4. Export",
    heading: "Structured Output",
    description:
      "Get clean, validated data in your preferred format — JSON, Excel, Markdown, or PDF. Every output includes confidence scores and processing metadata.",
    content: <StructuredOutputDemo />,
  },
];

// ============================================
// MAIN TIMELINE COMPONENT
// ============================================
export default function HowItWorks() {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      id="how-it-works"
      className="w-full bg-background font-sans md:px-10"
      ref={containerRef}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-sm font-semibold text-accent-blue uppercase tracking-widest mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
            From Document to Intelligence
            <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
              In Four Simple Steps
            </span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Our intelligent pipeline transforms raw documents into actionable data with unprecedented speed and accuracy.
          </p>
        </motion.div>
      </div>

      {/* Timeline */}
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {timelineData.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
            {/* Step Indicator */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-background-card border-4 border-background flex items-center justify-center shadow-soft">
                <div className="h-4 w-4 rounded-full bg-accent-blue" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
                {item.title}
              </h3>
            </div>

            {/* Content */}
            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">
                {item.title}
              </h3>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                {item.content}
              </motion.div>
            </div>
          </div>
        ))}

        {/* Animated Progress Line */}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-border"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-accent-blue rounded-full"
          />
        </div>
      </div>
    </div>
  );
}