import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";



export function NetworkNode({ node, isActive, onClick, onHover }) {
    const Icon = node.icon;
    const isCore = node.type === "core";
    const size = node.size || 70;

    return (
        <motion.div
            className="absolute cursor-pointer"
            style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isActive ? 30 : isCore ? 25 : 20,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: Math.random() * 0.3,
            }}
            onClick={onClick}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
        >
            {/* Pulsing glow ring for active state */}
            {isActive && (
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        isCore ? "bg-accent-blue/30" : node.color === "green" ? "bg-accent-green/30" : "bg-accent-blue/20"
                    )}
                    style={{ width: size + 20, height: size + 20, left: -10, top: -10 }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            )}

            {/* Main node container */}
            <motion.div
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-full transition-all duration-300",
                    "backdrop-blur-xl border-2",
                    isCore
                        ? "bg-gradient-to-br from-accent-blue/20 via-background-card/95 to-accent-blue-soft/10 border-accent-blue shadow-node-active"
                        : node.color === "green"
                            ? "bg-gradient-to-br from-accent-green/10 via-background-card/95 to-accent-green/5 border-accent-green/60"
                            : "bg-gradient-to-br from-accent-blue/10 via-background-card/95 to-accent-blue-soft/5 border-accent-blue/40",
                    isActive && !isCore && "shadow-node-active border-accent-blue"
                )}
                style={{ width: size, height: size }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Inner glow */}
                <div
                    className={cn(
                        "absolute inset-1 rounded-full opacity-50",
                        isCore
                            ? "bg-gradient-to-b from-accent-blue/20 to-transparent"
                            : "bg-gradient-to-b from-white/30 to-transparent"
                    )}
                />

                {/* Emoji for input nodes */}
                {node.emoji && (
                    <span className="text-lg mb-0.5 relative z-10">{node.emoji}</span>
                )}

                {/* Icon */}
                <Icon
                    className={cn(
                        "relative z-10",
                        isCore ? "w-8 h-8 text-accent-blue" : "w-5 h-5",
                        node.color === "green" ? "text-accent-green" : "text-accent-blue"
                    )}
                    strokeWidth={isCore ? 2.5 : 2}
                />

                {/* Label */}
                <span
                    className={cn(
                        "relative z-10 font-medium mt-1",
                        isCore ? "text-xs text-text-primary" : "text-[10px] text-text-secondary"
                    )}
                >
                    {node.label}
                </span>
            </motion.div>

            {/* Risk badge */}
            {node.risk && (
                <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-risk rounded-full flex items-center justify-center border-2 border-background-card shadow-md z-40"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                >
                    <AlertTriangle className="w-3 h-3 text-primary-foreground" />
                </motion.div>
            )}

            {/* Tooltip */}
            {isActive && (
                <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-56 glass-strong rounded-xl p-3 pointer-events-none"
                    style={{ top: size + 12 }}
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="text-sm font-semibold text-text-primary mb-1">
                        {node.label}
                    </div>
                    <div className="text-xs text-text-secondary mb-2">
                        {node.description}
                    </div>
                    {node.risk && (
                        <div className="flex items-center gap-1.5 text-xs text-risk">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Risk: {node.risk}</span>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}