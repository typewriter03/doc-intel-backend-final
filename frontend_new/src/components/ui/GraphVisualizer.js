'use client';
import { useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';

// Dynamic import for No-SSR (Canvas requirement)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-accent-blue font-bold animate-pulse">Initializing Graph Engine...</div>
});

const GraphVisualizer = ({ data, onClose }) => {
    const graphRef = useRef();

    // Adapter: Backend returns 'edges', library expects 'links'
    const graphData = useMemo(() => {
        if (!data) return { nodes: [], links: [] };
        return {
            nodes: data.nodes ? [...data.nodes] : [], // Shallow copy to prevent mutation issues
            links: (data.links || data.edges || []).map(link => ({
                ...link,
                source: typeof link.source === 'object' ? link.source.id : link.source,
                target: typeof link.target === 'object' ? link.target.id : link.target
            }))
        };
    }, [data]);

    // Custom Node Rendering - "Investigation Board" Style
    const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
        const label = node.label || node.id;
        const fontSize = 14 / globalScale;
        ctx.font = `600 ${fontSize}px Sans-Serif`;

        // Node Styling based on Type
        let bgColor = '#1e293b'; // Default dark
        let textColor = '#f1f5f9';
        let borderColor = '#94a3b8';
        let shape = 'card';

        if (node.type === 'document') {
            bgColor = '#ffffff';     // White Paper
            textColor = '#0f172a';   // Dark text
            borderColor = '#cbd5e1';
        } else if (node.type === 'company' || node.type === 'vendor') {
            bgColor = '#3b82f6';     // Blue Brand
            textColor = '#ffffff';
            borderColor = '#60a5fa';
        } else if (node.type === 'person') {
            bgColor = '#10b981';     // Green User
            shape = 'circle';
        } else if (node.type === 'issue') {
            bgColor = '#ef4444';     // Red Alert
            textColor = '#ffffff';
            shape = 'circle';
        }

        // Draw Logic
        if (shape === 'circle') {
            const r = 8;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = bgColor;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5 / globalScale;
            ctx.stroke();

            // Label Below
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#cbd5e1'; // Light grey text for dark bg
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillText(label, node.x, node.y + r + 2);
        } else {
            // Card Shape
            const textWidth = ctx.measureText(label).width;
            const px = fontSize * 0.8;
            const py = fontSize * 0.5;
            const w = textWidth + px * 2;
            const h = fontSize + py * 2;
            const x = node.x - w / 2;
            const y = node.y - h / 2;

            // Shadow/Glow
            if (globalScale > 1.5) {
                ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
                ctx.shadowBlur = 4;
            }

            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y, w, h, 4);
            } else {
                ctx.rect(x, y, w, h);
            }
            ctx.fillStyle = bgColor;
            ctx.fill();

            // Border
            ctx.lineWidth = 1 / globalScale;
            ctx.strokeStyle = borderColor;
            ctx.stroke();

            // Reset Shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // Text
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, node.x, node.y);
        }
    }, []);

    return (
        <div className="relative w-full h-full bg-[#0f172a] overflow-hidden rounded-2xl border border-gray-800 shadow-2xl">
            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-gray-900/50 backdrop-blur-md p-2 rounded-xl border border-gray-700">
                <button title="Zoom In" onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400)} className="p-2 text-white hover:bg-white/10 rounded-lg">
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button title="Zoom Out" onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)} className="p-2 text-white hover:bg-white/10 rounded-lg">
                    <ZoomOut className="w-5 h-5" />
                </button>
                <button title="Fit View" onClick={() => graphRef.current?.zoomToFit(400)} className="p-2 text-white hover:bg-white/10 rounded-lg">
                    <Maximize className="w-5 h-5" />
                </button>
                {onClose && (
                    <button title="Close" onClick={onClose} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg mt-2 border-t border-gray-700 pt-2">
                        <Minimize className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl border border-gray-700 text-xs text-gray-300 pointer-events-none">
                <h4 className="font-bold text-white mb-2">Legend</h4>
                <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Client / Person</div>
                <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Document</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Company / Entity</div>
            </div>

            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="label"
                nodeCanvasObject={nodeCanvasObject}
                backgroundColor="#0f172a"
                linkColor={link => link.style?.stroke || "#64748b"}
                linkWidth={link => link.style?.strokeWidth || 1}
                linkLineDash={link => link.style?.strokeDasharray ? [4, 4] : null}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                d3VelocityDecay={0.1}
                cooldownTicks={100}
                onEngineStop={() => graphRef.current?.zoomToFit(400)}
            />
        </div>
    );
};

export default GraphVisualizer;
