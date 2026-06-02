"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Upload, Loader2, CheckCircle2, AlertTriangle, Play, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@supabase/ssr';

// Same schema as draft page
const contractSchema = {
    nda: [
        { id: 'purpose', label: 'Purpose of NDA', placeholder: 'e.g., Software Evaluation' },
        { id: 'duration', label: 'Duration of Confidentiality', placeholder: 'e.g., 3 Years' }
    ],
    employment: [
        { id: 'role', label: 'Job Title / Role', placeholder: 'e.g., Senior Developer' },
        { id: 'salary', label: 'Annual Compensation', placeholder: 'e.g., INR 12,00,000' },
        { id: 'probation', label: 'Probation Period', placeholder: 'e.g., 6 Months' },
        { id: 'notice', label: 'Notice Period', placeholder: 'e.g., 60 Days' }
    ],
    service: [
        { id: 'scope', label: 'Scope of Services', placeholder: 'e.g., Marketing and SEO' },
        { id: 'paymentTerms', label: 'Payment Terms', placeholder: 'e.g., Net 30' }
    ],
    freelance: [
        { id: 'deliverables', label: 'Specific Deliverables', placeholder: 'e.g., 5 articles per month' },
        { id: 'fee', label: 'Consulting Fee', placeholder: 'e.g., INR 50,000 / month' }
    ],
    consulting: [
        { id: 'services', label: 'Consulting Services', placeholder: 'e.g., Financial Auditing' },
        { id: 'retainer', label: 'Retainer Amount', placeholder: 'e.g., INR 1,00,000 / month' }
    ],
    founders: [
        { id: 'equity', label: 'Equity Split (%)', placeholder: 'e.g., 50/50' },
        { id: 'vesting', label: 'Vesting Schedule', placeholder: 'e.g., 4 years with 1 year cliff' },
        { id: 'roles', label: 'Founder Roles', placeholder: 'e.g., CEO and CTO' }
    ],
    shareholders: [
        { id: 'boardSeats', label: 'Board Seats Allocation', placeholder: 'e.g., 2 for Investors, 3 for Founders' },
        { id: 'lockIn', label: 'Founder Lock-in Period', placeholder: 'e.g., 3 Years' }
    ],
    partnership: [
        { id: 'capital', label: 'Capital Contribution', placeholder: 'e.g., INR 5 Lakhs each' },
        { id: 'profitShare', label: 'Profit/Loss Sharing Ratio', placeholder: 'e.g., 60:40' }
    ],
    joint_venture: [
        { id: 'jvPurpose', label: 'Purpose of Joint Venture', placeholder: 'e.g., Real Estate Development' },
        { id: 'ownership', label: 'Ownership Structure', placeholder: 'e.g., 51% Party A, 49% Party B' }
    ],
    mou: [
        { id: 'intention', label: 'Primary Intention', placeholder: 'e.g., Explore Merger Opportunities' },
        { id: 'validity', label: 'MoU Validity Period', placeholder: 'e.g., 6 Months' }
    ],
    saas: [
        { id: 'subscription', label: 'Subscription Plan / Tier', placeholder: 'e.g., Enterprise Tier' },
        { id: 'users', label: 'Number of Permitted Users', placeholder: 'e.g., Up to 50' },
        { id: 'uptime', label: 'SLA Uptime Guarantee', placeholder: 'e.g., 99.9%' }
    ],
    terms: [
        { id: 'websiteURL', label: 'Website/App URL', placeholder: 'e.g., https://eyepune.com' },
        { id: 'userType', label: 'Target Audience', placeholder: 'e.g., B2B Businesses' }
    ],
    lease: [
        { id: 'property', label: 'Property Address', placeholder: 'e.g., 101 Tech Park, Pune' },
        { id: 'rent', label: 'Monthly Rent', placeholder: 'e.g., INR 1,50,000' },
        { id: 'deposit', label: 'Security Deposit', placeholder: 'e.g., 6 Months Rent' },
        { id: 'lockInLease', label: 'Lock-in Period', placeholder: 'e.g., 3 Years' }
    ],
    rent: [
        { id: 'propertyRent', label: 'Property Address', placeholder: 'e.g., Flat 202, ABC Tower' },
        { id: 'rentAmount', label: 'Monthly Rent', placeholder: 'e.g., INR 25,000' },
        { id: 'depositAmount', label: 'Security Deposit', placeholder: 'e.g., INR 1,00,000' }
    ],
    vendor: [
        { id: 'goods', label: 'Goods/Services Provided', placeholder: 'e.g., Office Supplies' },
        { id: 'delivery', label: 'Delivery Terms', placeholder: 'e.g., Within 7 days of PO' }
    ],
    franchise: [
        { id: 'territory', label: 'Exclusive Territory', placeholder: 'e.g., Pune District' },
        { id: 'royalty', label: 'Royalty Fee (%)', placeholder: 'e.g., 5% of Gross Sales' }
    ]
};

export default function LexProBulk() {
    const [contractType, setContractType] = useState('employment');
    const [csvData, setCsvData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, successes: 0, failures: 0 });
    const [logs, setLogs] = useState([]);
    const [accessToken, setAccessToken] = useState(null);
    
    const fileInputRef = useRef(null);

    // Load session once on mount — avoids GoTrueClient multi-instance race condition
    useEffect(() => {
        const loadSession = async () => {
            try {
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) setAccessToken(session.access_token);
            } catch (e) {
                console.warn('[LexPro Bulk] Failed to load session:', e.message);
            }
        };
        loadSession();
    }, []);

    // Small delay between requests to avoid rate-limiting the LLM API
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Retry a fetch call up to `maxRetries` times on failure
    const fetchWithRetry = async (url, options, maxRetries = 2) => {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const res = await fetch(url, options);
                const data = await res.json();
                if (res.ok && data.success) return data;
                // If we got a 401, no point retrying
                if (res.status === 401) throw new Error('Unauthorized — please log in again.');
                throw new Error(data.error || `HTTP ${res.status}`);
            } catch (err) {
                lastError = err;
                if (attempt < maxRetries) {
                    addLog(`  ↳ Attempt ${attempt} failed (${err.message}). Retrying in 2s...`, 'info');
                    await sleep(2000);
                }
            }
        }
        throw lastError;
    };

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

        const authHeaders = {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
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

                // 2. Call Draft API with retry
                const draftData = await fetchWithRetry('/api/lex-pro/draft', {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify(payload)
                }, 2);

                if (!draftData.success) throw new Error(draftData.error || 'Draft generation failed');

                addLog(`[${i + 1}/${csvData.length}] ✓ Draft generated. Saving to database...`);

                // 3. Save to Supabase with retry
                const title = `Bulk ${contractType.toUpperCase()} - ${row.partyA} & ${row.partyB} - ${new Date().getTime().toString().slice(-4)}`;
                await fetchWithRetry('/api/lex-pro/save-draft', {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({
                        title,
                        contractType,
                        content: draftData.draft
                    })
                }, 2);

                successCount++;
                addLog(`[${i + 1}/${csvData.length}] ✓ Saved: ${title}`, 'success');

            } catch (error) {
                failCount++;
                addLog(`[${i + 1}/${csvData.length}] ✗ Failed after retries: ${error.message}`, 'error');
            }

            setProgress(prev => ({ ...prev, successes: successCount, failures: failCount }));
            
            // Throttle: wait 300ms between each contract to avoid LLM rate limits
            if (i < csvData.length - 1) await sleep(300);
        }

        setIsGenerating(false);
        addLog(`Bulk generation complete! Success: ${successCount}, Failed: ${failCount}`, 'info');
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6 h-[calc(100vh-8rem)]">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Database className="w-7 h-7 text-blue-400" />
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
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
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
                                className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
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
                                className="w-full bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] h-12 mt-4"
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
                                    className="h-full bg-gradient-to-r from-blue-500 to-slate-500"
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
