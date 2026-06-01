"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Upload, AlertTriangle, Info, CheckCircle2, Loader2, ArrowRight, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@supabase/ssr';

export default function LexProAnalyze() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isRedlining, setIsRedlining] = useState(false);
    const [redlineResult, setRedlineResult] = useState(null);
    const [contractText, setContractText] = useState('');
    const fileInputRef = useRef(null);

    const loadPdfJs = async () => {
        if (window.pdfjsLib) return window.pdfjsLib;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(window.pdfjsLib);
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            if (file.type === 'application/pdf') {
                const pdfjs = await loadPdfJs();
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }
                setContractText(fullText.trim());
            } else if (file.type === 'text/plain') {
                const text = await file.text();
                setContractText(text);
            } else {
                alert('Please upload a PDF or TXT file.');
            }
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Failed to read file. Please ensure it is a valid PDF or text document.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!contractText.trim()) return;
        
        setIsAnalyzing(true);
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setRedlineResult(null);

        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/lex-pro/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({ contractText })
            });
            const data = await response.json();

            if (data.success && data.analysis) {
                // Map API risk strings to UI colors and icons
                const mappedClauses = data.analysis.clauses.map(clause => {
                    const riskStr = clause.risk.toLowerCase();
                    if (riskStr.includes('high')) {
                        return { ...clause, risk: 'High', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
                    } else if (riskStr.includes('medium')) {
                        return { ...clause, risk: 'Medium', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
                    } else {
                        return { ...clause, risk: 'Low', icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
                    }
                });

                setAnalysisResult({
                    score: data.analysis.score,
                    summary: data.analysis.summary,
                    clauses: mappedClauses
                });
            } else {
                console.error("Analysis Error:", data.error);
                alert(`Failed to analyze: ${data.error}`);
            }
        } catch (error) {
            console.error("API Error:", error);
            alert(`API Error: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateRedline = async () => {
        if (!analysisResult) return;
        
        setIsRedlining(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            const { data: { session } } = await supabase.auth.getSession();

            // We can hit a specific redline endpoint or a generic AI endpoint
            const response = await fetch('/api/lex-pro/redline', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({ 
                    contractText,
                    analysis: analysisResult
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setRedlineResult(data.redline);
            } else {
                alert(`Error generating redline: ${data.error}`);
            }
        } catch (error) {
            console.error("Redline Error:", error);
            alert("Failed to generate redline due to network error.");
        } finally {
            setIsRedlining(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
            
            {/* Left: Input Area */}
            <div className="w-full lg:w-1/2 flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                            Risk Analysis Engine
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Paste your contract text to identify legal risks.</p>
                    </div>
                    <div>
                        <input 
                            type="file" 
                            accept=".pdf,.txt" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                        />
                        <Button 
                            variant="outline" 
                            className="border-white/10 bg-white/5"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {isUploading ? 'Extracting...' : 'Upload PDF'}
                        </Button>
                    </div>
                </div>
                
                <div className="flex-1 p-6 relative">
                    <textarea 
                        className="w-full h-full bg-black/40 border border-white/10 rounded-xl p-6 text-gray-300 font-serif leading-relaxed focus:outline-none focus:border-red-500/50 resize-none"
                        placeholder="Paste contract text here..."
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                    />
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20">
                    <Button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !contractText.trim()}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] h-12"
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Clauses...</>
                        ) : (
                            <><ShieldAlert className="w-5 h-5 mr-2" /> Run AI Risk Analysis</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Right: Results Area */}
            <div className="w-full lg:w-1/2 flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl relative">
                <div className="h-20 border-b border-white/10 bg-black/20 flex items-center px-6">
                    <h2 className="text-xl font-bold text-white">Analysis Report</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-red-500/20 scrollbar-track-transparent">
                    {!analysisResult && !isAnalyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <ShieldCheck className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Awaiting Document</h3>
                            <p className="text-gray-400 max-w-sm">Paste a document and run the analysis to see a detailed clause breakdown and risk score here.</p>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                            <div className="relative mb-8">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
                                />
                                <ShieldAlert className="w-16 h-16 text-red-500 relative z-10 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Scanning Clauses...</h3>
                            <p className="text-red-400">Cross-referencing Indian Contract Act</p>
                        </div>
                    )}

                    {analysisResult && !isAnalyzing && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Score Card */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-red-950/20 border border-red-500/20 flex gap-6 items-center">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                                        <path
                                            className="text-white/10"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                        <motion.path
                                            initial={{ strokeDasharray: "0, 100" }}
                                            animate={{ strokeDasharray: `${analysisResult.score}, 100` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="text-orange-500"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-2xl font-black text-white">{analysisResult.score}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Score</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Contract Health</h3>
                                    <p className="text-sm text-gray-300 leading-relaxed">{analysisResult.summary}</p>
                                </div>
                            </div>

                            {/* Clause Breakdown */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    Clause Breakdown
                                </h3>
                                
                                {analysisResult.clauses.map((clause, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (idx * 0.1) }}
                                        className={`p-5 rounded-xl border ${clause.border} ${clause.bg} relative overflow-hidden group`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                <clause.icon className={`w-6 h-6 ${clause.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-white">{clause.title}</h4>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${clause.border} ${clause.color}`}>
                                                        {clause.risk} Risk
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300 mb-3">{clause.description}</p>
                                                
                                                <div className="p-3 bg-black/40 rounded-lg border border-white/5 flex gap-2">
                                                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                                    <p className="text-xs text-blue-200">
                                                        <span className="font-bold text-blue-400">AI Recommendation:</span> {clause.recommendation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {/* Redline Generation Area */}
                            <div className="pt-6 border-t border-white/10 mt-8">
                                {!redlineResult && (
                                    <Button 
                                        onClick={handleGenerateRedline}
                                        disabled={isRedlining}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] h-12"
                                    >
                                        {isRedlining ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Redlined Response...</>
                                        ) : (
                                            <><PenTool className="w-5 h-5 mr-2" /> Generate Redline Response</>
                                        )}
                                    </Button>
                                )}
                                
                                {redlineResult && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <PenTool className="w-5 h-5 text-blue-400" />
                                            Proposed Redline Response
                                        </h3>
                                        
                                        <div className="p-4 bg-black/60 rounded-xl border border-white/10 text-sm text-gray-300 font-sans whitespace-pre-wrap">
                                            {redlineResult.email}
                                        </div>
                                        
                                        <div className="space-y-3 mt-4">
                                            <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Suggested Edits</h4>
                                            {redlineResult.changes.map((change, idx) => (
                                                <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-xl text-sm">
                                                    <div className="line-through text-red-400/70 mb-2 p-2 bg-red-500/10 rounded">
                                                        - {change.original}
                                                    </div>
                                                    <div className="text-green-400 mb-3 p-2 bg-green-500/10 rounded">
                                                        + {change.new}
                                                    </div>
                                                    <div className="text-gray-400 italic text-xs border-l-2 border-blue-500 pl-2">
                                                        Rationale: {change.reason}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex gap-4 pt-4">
                                            <Button className="flex-1 bg-white text-black hover:bg-gray-200">
                                                Copy Email & Redlines
                                            </Button>
                                            <Button variant="outline" className="border-white/10 text-white">
                                                Export to DOCX
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                        </motion.div>
                    )}
                </div>
            </div>
            
        </div>
    );
}
