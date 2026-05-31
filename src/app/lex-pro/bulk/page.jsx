"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Upload, Loader2, CheckCircle2, AlertTriangle, Play, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@supabase/ssr';

// Same schema as draft page
const contractSchema = {
    nda: [ { id: 'purpose', label: 'Purpose of NDA' }, { id: 'duration', label: 'Duration of Confidentiality' } ],
    employment: [ { id: 'role', label: 'Job Title / Role' }, { id: 'salary', label: 'Annual Compensation' }, { id: 'probation', label: 'Probation Period' }, { id: 'notice', label: 'Notice Period' } ],
    service: [ { id: 'scope', label: 'Scope of Services' }, { id: 'paymentTerms', label: 'Payment Terms' } ],
    freelance: [ { id: 'deliverables', label: 'Specific Deliverables' }, { id: 'fee', label: 'Consulting Fee' } ],
    consulting: [ { id: 'services', label: 'Consulting Services' }, { id: 'retainer', label: 'Retainer Amount' } ],
    founders: [ { id: 'equity', label: 'Equity Split (%)' }, { id: 'vesting', label: 'Vesting Schedule' }, { id: 'roles', label: 'Founder Roles' } ],
    shareholders: [ { id: 'boardSeats', label: 'Board Seats Allocation' }, { id: 'lockIn', label: 'Founder Lock-in Period' } ],
    partnership: [ { id: 'capital', label: 'Capital Contribution' }, { id: 'profitShare', label: 'Profit/Loss Sharing Ratio' } ],
    joint_venture: [ { id: 'jvPurpose', label: 'Purpose of Joint Venture' }, { id: 'ownership', label: 'Ownership Structure' } ],
    mou: [ { id: 'intention', label: 'Primary Intention' }, { id: 'validity', label: 'MoU Validity Period' } ],
    saas: [ { id: 'subscription', label: 'Subscription Plan / Tier' }, { id: 'users', label: 'Number of Permitted Users' }, { id: 'uptime', label: 'SLA Uptime Guarantee' } ],
    terms: [ { id: 'websiteURL', label: 'Website/App URL' }, { id: 'userType', label: 'Target Audience' } ],
    lease: [ { id: 'property', label: 'Property Address' }, { id: 'rent', label: 'Monthly Rent' }, { id: 'deposit', label: 'Security Deposit' }, { id: 'lockInLease', label: 'Lock-in Period' } ],
    rent: [ { id: 'propertyRent', label: 'Property Address' }, { id: 'rentAmount', label: 'Monthly Rent' }, { id: 'depositAmount', label: 'Security Deposit' } ],
    vendor: [ { id: 'goods', label: 'Goods/Services Provided' }, { id: 'delivery', label: 'Delivery Terms' } ],
    franchise: [ { id: 'territory', label: 'Exclusive Territory' }, { id: 'royalty', label: 'Royalty Fee (%)' } ]
};

export default function LexProBulk() {
    const [contractType, setContractType] = useState('employment');
    const [csvData, setCsvData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, successes: 0, failures: 0 });
    const [logs, setLogs] = useState([]);
    
    const fileInputRef = useRef(null);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
    };

    const downloadTemplate = () => {
        // Base headers
        const baseHeaders = ['partyA', 'partyB', 'jurisdiction', 'governingLaw', 'additionalTerms'];
        // Dynamic headers
        const dynamicHeaders = (contractSchema[contractType] || []).map(f => f.id);
        
        const allHeaders = [...baseHeaders, ...dynamicHeaders];
        const csvContent = "data:text/csv;charset=utf-8," + allHeaders.join(',') + "\n";
        
        // Add a sample row
        const sampleRow = baseHeaders.map(() => 'Sample Data')
            .concat(dynamicHeaders.map(() => 'Sample Variable'))
            .join(',');
        
        const encodedUri = encodeURI(csvContent + sampleRow);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `lexpro_${contractType}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            parseCSV(text);
        };
        reader.readAsText(file);
    };

    const parseCSV = (text) => {
        // Basic CSV parser (splits by newline and comma, ignoring quotes for simplicity in MVP)
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            alert('CSV must contain a header row and at least one data row.');
            return;
        }

        const head = lines[0].split(',').map(h => h.trim());
        setHeaders(head);

        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const rowObj = {};
            head.forEach((col, index) => {
                rowObj[col] = values[index] || '';
            });
            data.push(rowObj);
        }
        setCsvData(data);
        addLog(`Successfully parsed ${data.length} rows from CSV.`, 'success');
    };

    const startBulkGeneration = async () => {
        if (csvData.length === 0) return;
        
        setIsGenerating(true);
        setProgress({ current: 0, total: csvData.length, successes: 0, failures: 0 });
        setLogs([]);
        addLog(`Starting bulk generation for ${csvData.length} contracts...`, 'info');

        let successCount = 0;
        let failCount = 0;

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const { data: { session } } = await supabase.auth.getSession();
        const authHeaders = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        };

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            setProgress(prev => ({ ...prev, current: i + 1 }));
            addLog(`[${i + 1}/${csvData.length}] Generating draft for ${row.partyB || 'Unknown Party'}...`);

            try {
                // 1. Prepare dynamic fields string
                const dynamicFields = contractSchema[contractType] || [];
                const formattedDynamicAnswers = dynamicFields.map(field => `${field.label}: ${row[field.id] || 'Not specified'}`).join('\n');
                
                const payload = {
                    contractType: contractType,
                    partyA: row.partyA || 'Not specified',
                    partyB: row.partyB || 'Not specified',
                    jurisdiction: row.jurisdiction || 'Maharashtra',
                    governingLaw: row.governingLaw || 'Indian Contract Act, 1872',
                    additionalTerms: `${row.additionalTerms || ''}\n\nSpecific Details:\n${formattedDynamicAnswers}`
                };

                // 2. Call Draft API
                const draftRes = await fetch('/api/lex-pro/draft', {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify(payload)
                });
                const draftData = await draftRes.json();

                if (!draftData.success) throw new Error(draftData.error);

                addLog(`[${i + 1}/${csvData.length}] Draft generated successfully. Saving to database...`);

                // 3. Save to Supabase
                const title = `Bulk ${contractType.toUpperCase()} - ${row.partyA} & ${row.partyB} - ${new Date().getTime().toString().slice(-4)}`;
                const saveRes = await fetch('/api/lex-pro/save-draft', {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({
                        title: title,
                        contractType: contractType,
                        content: draftData.draft
                    })
                });
                const saveData = await saveRes.json();

                if (!saveData.success) throw new Error(saveData.error);

                successCount++;
                addLog(`[${i + 1}/${csvData.length}] Successfully saved: ${title}`, 'success');

            } catch (error) {
                failCount++;
                addLog(`[${i + 1}/${csvData.length}] Failed: ${error.message}`, 'error');
            }

            setProgress(prev => ({ ...prev, successes: successCount, failures: failCount }));
        }

        setIsGenerating(false);
        addLog(`Bulk generation complete! Success: ${successCount}, Failed: ${failCount}`, 'info');
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6 h-[calc(100vh-8rem)]">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Database className="w-7 h-7 text-orange-400" />
                        Bulk Contract Generator
                    </h1>
                    <p className="text-gray-400 mt-1">Upload a CSV dataset to autonomously generate and save hundreds of contracts instantly.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Left: Setup & Upload */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">1. Select Contract Type</label>
                            <select 
                                value={contractType} 
                                onChange={(e) => { setContractType(e.target.value); setCsvData([]); setHeaders([]); }}
                                disabled={isGenerating}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                            >
                                <option value="nda">Non-Disclosure Agreement (NDA)</option>
                                <option value="employment">Employment Agreement</option>
                                <option value="service">Master Service Agreement (MSA)</option>
                                <option value="freelance">Independent Contractor / Freelance Agreement</option>
                                <option value="consulting">Consulting Agreement</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">2. Get Dataset Template</label>
                            <Button 
                                onClick={downloadTemplate}
                                variant="outline" 
                                disabled={isGenerating}
                                className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            >
                                <Download className="w-4 h-4 mr-2" /> Download CSV Template
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">3. Upload Filled Data</label>
                            <input 
                                type="file" 
                                accept=".csv" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                            <Button 
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline" 
                                disabled={isGenerating}
                                className="w-full border-white/10 bg-white/5 hover:bg-white/10"
                            >
                                <Upload className="w-4 h-4 mr-2" /> Upload Filled CSV
                            </Button>
                        </div>
                        
                        {csvData.length > 0 && (
                            <Button 
                                onClick={startBulkGeneration}
                                disabled={isGenerating}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] h-12 mt-4"
                            >
                                {isGenerating ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                    <><Play className="w-5 h-5 mr-2" /> Start Bulk Generation ({csvData.length})</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right: Data Preview & Orchestrator Console */}
                <div className="w-full lg:w-2/3 flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl shadow-xl overflow-hidden relative">
                    
                    {/* Progress Header */}
                    {isGenerating && (
                        <div className="p-6 border-b border-white/10 bg-black/60">
                            <div className="flex justify-between text-sm text-gray-300 mb-2 font-medium">
                                <span>Total Progress</span>
                                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                            <div className="flex gap-6 mt-4 text-sm font-medium">
                                <span className="text-gray-400">Total: {progress.total}</span>
                                <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Success: {progress.successes}</span>
                                <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Failed: {progress.failures}</span>
                            </div>
                        </div>
                    )}

                    {/* Console Output */}
                    <div className="flex-1 overflow-y-auto p-6 font-mono text-xs">
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <Database className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-lg">Awaiting Dataset...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-3 ${
                                        log.type === 'success' ? 'text-green-400' :
                                        log.type === 'error' ? 'text-red-400' :
                                        'text-gray-300'
                                    }`}>
                                        <span className="text-gray-500 shrink-0">[{log.time}]</span>
                                        <span>{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
