'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Download, Code, Loader2, Wrench, FileArchive, FileJson } from 'lucide-react';
import { api } from '@/services/api';

export default function UtilitiesPage() {
    const [parserLoading, setParserLoading] = useState(false);
    const [classifierLoading, setClassifierLoading] = useState(false);
    const [classifierResult, setClassifierResult] = useState(null);

    // --- Legacy Parser Handler ---
    const handleParse = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParserLoading(true);
        try {
            const blob = await api.legacyParse(file);

            // Trigger Download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `parsed_${file.name}.zip`; // Naming convention
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error(err);
            alert("Parser failed: " + err.message);
        } finally {
            setParserLoading(false);
            // Reset input
            e.target.value = null;
        }
    };

    // --- Legacy Classifier Handler ---
    const handleClassify = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setClassifierLoading(true);
        setClassifierResult(null);
        try {
            const res = await api.legacyClassify(file);
            setClassifierResult(res);
        } catch (err) {
            console.error(err);
            alert("Classifier failed: " + err.message);
        } finally {
            setClassifierLoading(false);
            e.target.value = null;
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
                    <Wrench className="w-8 h-8 text-accent-blue" />
                    Utilities & Tools
                </h1>
                <p className="text-text-secondary">Access legacy file processing tools for raw document operations.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* 1. Legacy Parser Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background-card border border-border rounded-3xl p-8 shadow-soft hover:shadow-elevated transition-all"
                >
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                        <FileArchive className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Universal Parser</h3>
                    <p className="text-text-secondary text-sm mb-8 min-h-[40px]">
                        Upload a raw document (Excel, PDF, CSV) to convert it into a standardized ZIP package.
                    </p>

                    <div className="relative group">
                        <input
                            type="file"
                            onChange={handleParse}
                            disabled={parserLoading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                        />
                        <button className={`w-full py-4 rounded-xl border-2 border-dashed border-border group-hover:border-orange-500/50 group-hover:bg-orange-500/5 transition-all flex items-center justify-center gap-2 font-bold text-text-secondary group-hover:text-orange-500 ${parserLoading ? 'opacity-50' : ''}`}>
                            {parserLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing & Zipping...
                                </>
                            ) : (
                                <>
                                    <FileUp className="w-5 h-5" />
                                    Upload & Parse
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* 2. Legacy Classifier Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-background-card border border-border rounded-3xl p-8 shadow-soft hover:shadow-elevated transition-all flex flex-col"
                >
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                        <FileJson className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Document Classifier</h3>
                    <p className="text-text-secondary text-sm mb-8 min-h-[40px]">
                        Identify document type and extract basic metadata using the legacy heuristic engine.
                    </p>

                    <div className="relative group mb-6">
                        <input
                            type="file"
                            onChange={handleClassify}
                            disabled={classifierLoading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                        />
                        <button className={`w-full py-4 rounded-xl border-2 border-dashed border-border group-hover:border-purple-500/50 group-hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 font-bold text-text-secondary group-hover:text-purple-500 ${classifierLoading ? 'opacity-50' : ''}`}>
                            {classifierLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Classifying...
                                </>
                            ) : (
                                <>
                                    <FileUp className="w-5 h-5" />
                                    Upload & Classify
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Output */}
                    {classifierResult && (
                        <div className="mt-auto bg-background-base rounded-xl p-4 border border-border overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-text-secondary uppercase">Result</span>
                                <span className="text-xs text-purple-500 font-mono">JSON</span>
                            </div>
                            <pre className="text-xs font-mono text-text-primary overflow-x-auto">
                                {JSON.stringify(classifierResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
