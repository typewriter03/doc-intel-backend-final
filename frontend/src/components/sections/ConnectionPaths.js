import { useMemo, useId } from "react";


function getNodePosition(node, width, height) {
    return {
        x: (node.position.x / 100) * width,
        y: (node.position.y / 100) * height,
    };
}

function generateBezierPath(
    from,
    to
) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control point offset based on distance and direction
    const curvature = Math.min(distance * 0.35, 60);

    // Calculate control points for smooth S-curve
    const midY = (from.y + to.y) / 2;
    const cp1x = from.x + dx * 0.3;
    const cp1y = from.y + (dy > 0 ? Math.abs(curvature) : -Math.abs(curvature)) * 0.6;
    const cp2x = to.x - dx * 0.3;
    const cp2y = to.y - (dy > 0 ? Math.abs(curvature) : -Math.abs(curvature)) * 0.6;

    return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
}

export function ConnectionPaths({
    nodes,
    connections,
    activeNodeId,
    containerWidth,
    containerHeight,
}) {
    const uniqueId = useId();

    const nodeMap = useMemo(() => {
        const map = new Map();
        nodes.forEach((node) => map.set(node.id, node));
        return map;
    }, [nodes]);

    const paths = useMemo(() => {
        return connections.map((conn, index) => {
            const fromNode = nodeMap.get(conn.from);
            const toNode = nodeMap.get(conn.to);

            if (!fromNode || !toNode) return null;

            const from = getNodePosition(fromNode, containerWidth, containerHeight);
            const to = getNodePosition(toNode, containerWidth, containerHeight);
            const path = generateBezierPath(from, to);

            // Check if this connection involves the active node
            const isActive =
                activeNodeId === conn.from ||
                activeNodeId === conn.to ||
                (activeNodeId === "ai-core" && (conn.from === "ai-core" || conn.to === "ai-core"));

            // Check if it's a direct connection to active node
            const isDirectActive = activeNodeId === conn.from || activeNodeId === conn.to;

            return {
                id: `${conn.from}-${conn.to}`,
                path,
                isActive,
                isDirectActive,
                index,
                from,
                to,
            };
        }).filter(Boolean);
    }, [connections, nodeMap, containerWidth, containerHeight, activeNodeId]);

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
            viewBox={`0 0 ${containerWidth} ${containerHeight}`}
            preserveAspectRatio="xMidYMid meet"
        >
            <defs>
                {/* Enhanced glow filter for active paths */}
                <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Stronger glow for particles */}
                <filter id={`particleGlow-${uniqueId}`} x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur stdDeviation="3" result="blur1" />
                    <feGaussianBlur stdDeviation="6" result="blur2" />
                    <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Gradient for particles */}
                <radialGradient id={`particleGradient-${uniqueId}`}>
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                    <stop offset="50%" stopColor="#3A7BFF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#3A7BFF" stopOpacity="0.3" />
                </radialGradient>

                {/* Green gradient for output connections */}
                <radialGradient id={`greenParticleGradient-${uniqueId}`}>
                    <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                    <stop offset="50%" stopColor="#19C37D" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#19C37D" stopOpacity="0.3" />
                </radialGradient>
            </defs>

            {/* Connection lines */}
            {paths.map((pathData) => {
                if (!pathData) return null;
                const { id, path, isActive, isDirectActive, index } = pathData;
                const pathId = `path-${uniqueId}-${id}`;
                const isOutputPath = id.includes("json") || id.includes("excel") || id.includes("database") || id.includes("api");

                return (
                    <g key={id}>
                        {/* Base path - subtle when inactive */}
                        <path
                            d={path}
                            fill="none"
                            stroke={isOutputPath && isActive ? "#19C37D" : "#3A7BFF"}
                            strokeWidth={isDirectActive ? 2 : 1.5}
                            strokeOpacity={isActive ? 0.5 : 0.12}
                            strokeDasharray="6 4"
                            strokeLinecap="round"
                            style={{
                                filter: isActive ? `url(#glow-${uniqueId})` : "none",
                                transition: "stroke-opacity 0.3s ease",
                            }}
                        />

                        {/* Animated dash overlay for active paths */}
                        {isActive && (
                            <path
                                d={path}
                                fill="none"
                                stroke={isOutputPath ? "#19C37D" : "#3A7BFF"}
                                strokeWidth={1.5}
                                strokeOpacity={0.3}
                                strokeDasharray="6 4"
                                strokeLinecap="round"
                                className="animate-dash-flow"
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                }}
                            />
                        )}

                        {/* Hidden path for particle motion reference */}
                        <path id={pathId} d={path} fill="none" stroke="none" />

                        {/* Animated particles on active paths */}
                        {isActive && (
                            <>
                                {[0, 1, 2, 3].map((particleIndex) => (
                                    <circle
                                        key={`${id}-particle-${particleIndex}`}
                                        r={isDirectActive ? 3.5 : 2.5}
                                        fill={isOutputPath ? `url(#greenParticleGradient-${uniqueId})` : `url(#particleGradient-${uniqueId})`}
                                        filter={`url(#particleGlow-${uniqueId})`}
                                    >
                                        <animate
                                            attributeName="opacity"
                                            values="0;1;1;1;0"
                                            dur="2.5s"
                                            repeatCount="indefinite"
                                            begin={`${particleIndex * 0.6}s`}
                                        />
                                        <animateMotion
                                            dur="2.5s"
                                            repeatCount="indefinite"
                                            begin={`${particleIndex * 0.6}s`}
                                        >
                                            <mpath href={`#${pathId}`} />
                                        </animateMotion>
                                    </circle>
                                ))}
                            </>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}