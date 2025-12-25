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

        const nodes = data.nodes ? [...data.nodes] : [];
        const nodeIds = new Set(nodes.map(n => n.id));
        const links = [];

        // Auto-generate missing nodes from edges
        (data.links || data.edges || []).forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            if (sourceId && !nodeIds.has(sourceId)) {
                nodes.push({ id: sourceId, label: sourceId, type: 'auto-generated' });
                nodeIds.add(sourceId);
            }
            if (targetId && !nodeIds.has(targetId)) {
                nodes.push({ id: targetId, label: targetId, type: 'auto-generated' });
                nodeIds.add(targetId);
            }

            links.push({
                ...link,
                source: sourceId,
                target: targetId
            });
        });

        return { nodes, links };
    }, [data]);

    // Custom Node Rendering - "Investigation Board" Style
    const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
        const label = node.label || node.id;
        let fontSize = 14 / globalScale;
        ctx.font = `600 ${fontSize}px Sans-Serif`;

        // Node Styling based on Type
        let bgColor = '#1e293b'; // Default dark
        let textColor = '#f1f5f9';
        let borderColor = '#94a3b8';
        let shape = 'card';

        if (node.type === 'document' || node.type === 'invoice') {
            bgColor = '#ffffff';     // White Paper
            textColor = '#0f172a';   // Dark text
            borderColor = '#cbd5e1';
        } else if (node.type === 'company' || node.type === 'vendor') {
            bgColor = '#3b82f6';     // Blue Brand
            textColor = '#ffffff';
            borderColor = '#60a5fa';
        } else if (node.type === 'customer') {
            bgColor = '#f59e0b';     // Amber Customer
            textColor = '#ffffff';
            borderColor = '#d97706';
        } else if (node.type === 'person') {
            bgColor = '#10b981';     // Green User
            shape = 'circle';
        } else if (node.type === 'issue') {
            bgColor = '#ef4444';     // Red Alert
            textColor = '#ffffff';
            shape = 'circle';
        } else if (node.type === 'transaction') {
            bgColor = '#8b5cf6';     // Violet Transaction
            textColor = '#ffffff';
            shape = 'card';
            borderColor = '#7c3aed';
        } else if (node.type === 'item') {
            bgColor = '#0891b2';     // Cyan Item
            textColor = '#ffffff';
            shape = 'circle';
            fontSize = 10 / globalScale; // Smaller text for items
        } else if (node.type === 'auto-generated') {
            bgColor = '#475569';     // Slate for implicit
            textColor = '#cbd5e1';
            shape = 'card';
            borderColor = '#64748b';
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
            <div className="absolute bottom-4 left-4 z-10 bg-gray-900/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700 text-xs text-gray-300 pointer-events-none max-w-xs">
                <h4 className="font-bold text-white mb-3">Legend</h4>

                {/* Node Types */}
                <div className="mb-3">
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">Nodes</p>
                    <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Person / Account Holder</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded bg-violet-500"></span> Transaction</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded bg-blue-500"></span> Vendor / Company</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded bg-white border border-gray-400"></span> Invoice / Document</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500"></span> Customer</div>
                </div>

                {/* Edge Types */}
                <div className="border-t border-gray-700 pt-2">
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">Relationships</p>
                    <div className="flex items-center gap-2 mb-1"><span className="w-4 h-0.5 bg-red-500"></span> Payment (Out)</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-4 h-0.5 bg-emerald-500"></span> Deposit (In)</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-4 h-0.5 bg-orange-500"></span> Withdrawal</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-4 h-0.5 bg-violet-500"></span> Transfer</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-0.5 bg-pink-400" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fb7185, #fb7185 3px, transparent 3px, transparent 6px)' }}></span> Paid To</div>
                </div>
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
                d3VelocityDecay={0.2}
                cooldownTicks={100}
                onEngineStop={() => graphRef.current?.zoomToFit(400)}
                d3AlphaDecay={0.01}
                onEngineInit={() => {
                    // 1. Massive Repulsion to push nodes apart (approx 5x stronger)
                    graphRef.current.d3Force('charge').strength(-2000).distanceMax(2000);

                    // 2. Long Link Distance for Hub-and-Spoke layouts
                    graphRef.current.d3Force('link').distance(250);

                    // 3. Keep centered
                    graphRef.current.d3Force('center').strength(0.6);
                }}
            />
        </div>
    );
};

export default GraphVisualizer;
