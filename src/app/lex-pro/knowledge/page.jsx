"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@supabase/ssr';

export default function LexProKnowledgeBase() {
    const [isUploading, setIsUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [statusType, setStatusType] = useState('success');

    const [formData, setFormData] = useState({
        title: '',
        sourceType: 'Precedent',
        content: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpload = async () => {
        if (!formData.title || !formData.content) {
            setStatusType('error');
            setStatusMessage('Please provide both a title and the document content.');
            return;
        }

        setIsUploading(true);
        setStatusMessage(null);

        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/lex-pro/embed-knowledge', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                setStatusType('success');
                setStatusMessage('Successfully embedded and saved to your secure Knowledge Base!');
                setFormData({ title: '', sourceType: 'Precedent', content: '' }); // reset form
            } else {
                setStatusType('error');
                setStatusMessage(`Error saving: ${data.error}`);
            }
        } catch (error) {
            setStatusType('error');
            setStatusMessage(`Failed to reach the RAG engine: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Database className="w-8 h-8 text-blue-400" />
                    Knowledge Base Manager
                </h1>
                <p className="text-gray-400 mt-2">
                    Upload your custom precedents, Indian Acts, or past contracts. 
                    Lex Pro's AI will embed these documents and automatically retrieve them as context during future drafting via RAG (Retrieval-Augmented Generation).
                </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Document Title</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange}
                        placeholder="e.g., Standard NDA Clause - Non Compete 2026"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Source Type</label>
                    <select 
                        name="sourceType" 
                        value={formData.sourceType} 
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                    >
                        <option value="Precedent">Internal Precedent (Law Firm Data)</option>
                        <option value="Act">Statutory Law / Indian Act</option>
                        <option value="Custom">Custom Standard Clause</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                        <span>Document Content</span>
                        <span className="text-xs text-blue-400/80 bg-blue-500/10 px-2 py-1 rounded">Text limits apply</span>
                    </label>
                    <textarea 
                        name="content" 
                        value={formData.content} 
                        onChange={handleInputChange}
                        placeholder="Paste the raw text of the precedent or clause here..."
                        className="w-full h-64 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-serif focus:outline-none focus:border-blue-500/50 resize-y"
                    />
                </div>

                {statusMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${statusType === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
                    >
                        {statusType === 'success' ? <BookOpen className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{statusMessage}</span>
                    </motion.div>
                )}

                <div className="pt-4 border-t border-white/10">
                    <Button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-500 hover:to-slate-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] h-12 text-lg"
                    >
                        {isUploading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Embedding Vector & Saving...</>
                        ) : (
                            <><Upload className="w-5 h-5 mr-2" /> Vectorize & Add to Knowledge Base</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
