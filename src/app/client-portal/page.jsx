"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientPortal() {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', 'client_123'); // In production, get from auth context
    formData.append('projectPhase', 'design');

    try {
      // Send to the Secure Asset Vault API we just built
      const res = await fetch('/api/client-portal/assets', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer placeholder' },
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Asset securely vaulted!");
      } else {
        toast.error("Upload failed: " + data.error);
      }
    } catch (err) {
      toast.error("Server error during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-red-500/30">
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">
              Growth Command Center
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">Welcome back. Let's build your empire.</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-400 text-sm font-medium">Project Active: Phase 1</span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex space-x-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit backdrop-blur-md">
              {['assets', 'invoices', 'deliverables'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-white/10 text-white shadow-lg shadow-black/20' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Secure Asset Vault */}
            {activeTab === 'assets' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 border border-white/5 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-500/10 rounded-xl"><UploadCloud className="text-red-400 w-6 h-6" /></div>
                  <h2 className="text-2xl font-semibold">Secure Asset Vault</h2>
                </div>
                <p className="text-neutral-400 mb-8">Upload your brand guidelines, pitch decks, and high-res logos here. Everything is end-to-end encrypted and routed directly to our engineering team.</p>
                
                <div className="border-2 border-dashed border-white/10 hover:border-red-500/30 transition-colors rounded-2xl p-12 text-center bg-black/20 group relative cursor-pointer">
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500/10 transition-all">
                      <UploadCloud className="w-8 h-8 text-neutral-400 group-hover:text-red-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{isUploading ? 'Securing Asset...' : 'Click or drag files to upload'}</p>
                      <p className="text-neutral-500 text-sm mt-1">SVG, PNG, JPG, PDF (Max 50MB)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Native Billing */}
            {activeTab === 'invoices' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:bg-neutral-900/80 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl"><CheckCircle className="text-green-400 w-6 h-6" /></div>
                    <div>
                      <h3 className="font-medium text-lg">Phase 1 Deposit</h3>
                      <p className="text-neutral-400 text-sm">Paid on Oct 12, 2026</p>
                    </div>
                  </div>
                  <span className="font-mono text-neutral-300">₹25,000</span>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-red-500/10 transition-all">
                  <div className="flex items-start md:items-center gap-4">
                    <div className="p-3 bg-red-500/20 rounded-xl mt-1 md:mt-0"><Clock className="text-red-400 w-6 h-6" /></div>
                    <div>
                      <h3 className="font-medium text-lg text-white">System Architecture & Design</h3>
                      <p className="text-red-400/80 text-sm mt-1">Due in 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <span className="font-mono text-xl font-medium">₹40,000</span>
                    <button className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors w-full md:w-auto">
                      Pay Now
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'deliverables' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center p-24 border border-white/5 rounded-3xl bg-neutral-900/30">
                <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-neutral-300">No deliverables yet</h3>
                <p className="text-neutral-500 mt-2">Your automated strategy documents will appear here once generated.</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar / AI Fulfillment Status */}
          <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                AI Fulfillment Engine
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-red-500 bg-black text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-medium text-sm">Intake Assessment</h4>
                    <p className="text-xs text-neutral-500 mt-1">Processed</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/20 bg-black text-white/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-white/10 bg-white/5 opacity-80">
                    <h4 className="font-medium text-sm">Strategy Generation</h4>
                    <p className="text-xs text-neutral-500 mt-1">Awaiting Payment</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-red-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]"></div>
      </div>
    </div>
  );
}
