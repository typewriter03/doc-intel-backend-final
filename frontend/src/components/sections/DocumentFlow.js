"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Network, Zap, TrendingUp, Shield } from "lucide-react";
import { NetworkNode } from "./NetworkNode";
import { ConnectionPaths } from "./ConnectionPaths";
import { allNodes, connections } from "./nodeData";
import { Button } from "@/components/ui/button";

const stats = [
    { label: "Processing Nodes", value: "15+", icon: Network },
    { label: "Avg Speed Boost", value: "85x", icon: Zap },
    { label: "Accuracy Rate", value: "99.8%", icon: TrendingUp },
    { label: "Enterprise Grade", value: "SOC2", icon: Shield },
];

// Cycle through these nodes automatically
const cycleNodes = ["invoice", "ocr", "ai-core", "analyzer", "json", "contract", "nlp", "enricher", "database"];

export default function DocumentFlow() {
    const [activeNodeId, setActiveNodeId] = useState("ai-core");
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [cycleIndex, setCycleIndex] = useState(2); // Start with ai-core
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Auto-cycle through nodes
    useEffect(() => {
        const interval = setInterval(() => {
            if (!hoveredNodeId) {
                setCycleIndex((prev) => (prev + 1) % cycleNodes.length);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [hoveredNodeId]);

    // Update active node based on cycle
    useEffect(() => {
        if (!hoveredNodeId) {
            setActiveNodeId(cycleNodes[cycleIndex]);
        }
    }, [cycleIndex, hoveredNodeId]);

    const handleNodeClick = useCallback((nodeId) => {
        setActiveNodeId(nodeId);
        const index = cycleNodes.indexOf(nodeId);
        if (index !== -1) {
            setCycleIndex(index);
        }
    }, []);

    const handleNodeHover = useCallback((nodeId, hover) => {
        setHoveredNodeId(hover ? nodeId : null);
        if (hover) {
            setActiveNodeId(nodeId);
        }
    }, []);

    const currentActiveId = hoveredNodeId || activeNodeId;

    return (
        <section className="relative py-24 md:py-32 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-background" />
            <div className="absolute inset-0 bg-grid-pattern" />
            <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/5 via-transparent to-accent-blue/5 rounded-t-[100px] rounded-b-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/10 rounded-full blur-[120px]" />

            <div className="container relative max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Network className="w-4 h-4 text-accent-blue" />
                        <span className="text-sm font-medium text-text-secondary">
                            Document Processing Network
                        </span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
                        How Documents Flow
                        <br />
                        <span className="bg-gradient-to-r from-accent-blue to-accent-blue-soft bg-clip-text text-transparent">Through Our AI Network</span>
                    </h2>

                    <p className="max-w-2xl mx-auto text-lg text-text-secondary">
                        Watch how your documents transform from unstructured data into
                        actionable intelligence through our interconnected AI processing network
                    </p>
                </motion.div>

                {/* Network visualization */}
                <motion.div
                    ref={containerRef}
                    className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    {/* Connection lines */}
                    <ConnectionPaths
                        nodes={allNodes}
                        connections={connections}
                        activeNodeId={currentActiveId}
                        containerWidth={dimensions.width}
                        containerHeight={dimensions.height}
                    />

                    {/* Nodes */}
                    {allNodes.map((node) => (
                        <NetworkNode
                            key={node.id}
                            node={node}
                            isActive={currentActiveId === node.id}
                            onClick={() => handleNodeClick(node.id)}
                            onHover={(hovering) => handleNodeHover(node.id, hovering)}
                        />
                    ))}
                </motion.div>



            </div>
        </section>
    );
}