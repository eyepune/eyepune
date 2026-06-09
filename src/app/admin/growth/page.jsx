'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GrowthCommandCenter() {
    const [activeTab, setActiveTab] = useState('reddit');
    const [redditDrafts, setRedditDrafts] = useState([]);
    const [salesIntel, setSalesIntel] = useState([]);
    const [outboundLeads, setOutboundLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testLog, setTestLog] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Reddit Drafts
            const { data: reddit } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('action', 'reddit_sniper_draft')
                .eq('status', 'pending_review')
                .order('created_at', { ascending: false });
            if (reddit) setRedditDrafts(reddit);

            // Fetch Sales Intel (from bookings)
            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, name, email, company, notes, created_at')
                .not('notes', 'is', null)
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (bookings) {
                const withIntel = bookings.filter(b => b.notes && b.notes.includes('[AI SALES INTEL DOSSIER]'));
                setSalesIntel(withIntel);
            }

            // Fetch Outbound Leads
            const { data: outbound } = await supabase
                .from('outbound_leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            if (outbound) setOutboundLeads(outbound);

        } catch (error) {
            console.error('Error fetching growth data:', error);
        }
        setLoading(false);
    };

    const approveRedditDraft = async (id) => {
        await supabase.from('activity_logs').update({ status: 'approved' }).eq('id', id);
        fetchData();
    };

    const runAutomationTest = async (type) => {
        setTestLog(`Testing ${type} automation... Please wait (this can take 30-60s)`);
        try {
            let res;
            if (type === 'blog') {
                res = await fetch('/api/automation/ai-blog', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'eyepune-admin-cron'}` }
                });
            } else {
                res = await fetch(`/api/automation/trigger?test=${type}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'eyepune-admin-cron'}` }
                });
            }
            
            // Check if response is JSON, if not get text
            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                data = await res.text();
            }
            
            setTestLog(`[${type.toUpperCase()}] Result: ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`);
        } catch (e) {
            setTestLog(`[${type.toUpperCase()}] Error: ${e.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">
                            Growth Command Center
                        </h1>
                        <p className="text-gray-400 text-lg">Autonomous AI Engine Overview & Approvals</p>
                    </div>
                    <button onClick={fetchData} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                        Refresh Data
                    </button>
                </header>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-gray-800 pb-2 overflow-x-auto">
                    {['reddit', 'sales-intel', 'outbound', 'automation-tester'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-t-lg font-semibold transition-all whitespace-nowrap ${
                                activeTab === tab 
                                    ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' 
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab === 'reddit' ? 'Reddit Sniper' : tab === 'sales-intel' ? 'Sales Intel' : tab === 'outbound' ? 'Outbound Sniper' : 'Automation Diagnostics'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse">Synchronizing with AI Engine...</div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* REDDIT TAB */}
                        {activeTab === 'reddit' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-gray-200">Pending Reddit Drafts</h2>
                                {redditDrafts.length === 0 ? (
                                    <div className="bg-gray-900/50 rounded-xl p-10 text-center border border-gray-800">
                                        <span className="text-4xl mb-4 block">📡</span>
                                        <h3 className="text-xl font-medium text-gray-300">No pending drafts</h3>
                                        <p className="text-gray-500 mt-2">The Reddit Sniper is scanning for high-intent keywords.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {redditDrafts.map(draft => (
                                            <div key={draft.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Reddit Snipe</span>
                                                        <p className="text-gray-400 text-sm mt-2 font-mono">ID: {draft.id}</p>
                                                    </div>
                                                    <button onClick={() => approveRedditDraft(draft.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-colors font-semibold text-sm">
                                                        Approve & Mark Done
                                                    </button>
                                                </div>
                                                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-gray-300 whitespace-pre-wrap border border-gray-800">
                                                    {draft.details}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SALES INTEL TAB */}
                        {activeTab === 'sales-intel' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-gray-200">Latest Sales Attack Briefs</h2>
                                {salesIntel.length === 0 ? (
                                    <div className="bg-gray-900/50 rounded-xl p-10 text-center border border-gray-800">
                                        <span className="text-4xl mb-4 block">🧠</span>
                                        <h3 className="text-xl font-medium text-gray-300">No intel dossiers yet</h3>
                                        <p className="text-gray-500 mt-2">Dossiers will generate automatically when new leads book a call.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {salesIntel.map(intel => (
                                            <div key={intel.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl flex flex-col">
                                                <div className="mb-4">
                                                    <h3 className="text-xl font-bold text-white">{intel.name} <span className="text-gray-500 font-normal">from</span> {intel.company || 'Unknown'}</h3>
                                                    <p className="text-blue-400 text-sm">{intel.email}</p>
                                                </div>
                                                <div className="bg-gray-950 p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap border border-gray-800 overflow-y-auto max-h-96 flex-grow custom-scrollbar">
                                                    {intel.notes.split('[Original Notes:]')[0]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OUTBOUND TAB */}
                        {activeTab === 'outbound' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-gray-200">Outbound Sniper Queue</h2>
                                {outboundLeads.length === 0 ? (
                                    <div className="bg-gray-900/50 rounded-xl p-10 text-center border border-gray-800">
                                        <span className="text-4xl mb-4 block">🎯</span>
                                        <h3 className="text-xl font-medium text-gray-300">Queue is empty</h3>
                                        <p className="text-gray-500 mt-2">Add leads to the "outbound_leads" table to begin aggressive AI outreach.</p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                                        <table className="w-full text-left text-sm text-gray-400">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-950/50 border-b border-gray-800">
                                                <tr>
                                                    <th className="px-6 py-4">Company</th>
                                                    <th className="px-6 py-4">Contact</th>
                                                    <th className="px-6 py-4">Industry</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {outboundLeads.map(lead => (
                                                    <tr key={lead.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-white">{lead.company_name}</td>
                                                        <td className="px-6 py-4">{lead.first_name} ({lead.email})</td>
                                                        <td className="px-6 py-4">{lead.industry || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={[
                                                                'px-2 py-1 rounded text-xs font-bold uppercase',
                                                                lead.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                lead.status === 'contacted' ? 'bg-green-500/10 text-green-500' :
                                                                'bg-red-500/10 text-red-500'
                                                            ].join(' ')}>
                                                                {lead.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AUTOMATION TESTER TAB */}
                        {activeTab === 'automation-tester' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-gray-200">Automation Diagnostics</h2>
                                <p className="text-gray-400 mb-6">Trigger the core automated workflows directly to diagnose API or token issues.</p>
                                
                                <div className="flex space-x-4 mb-8">
                                    <button 
                                        onClick={() => runAutomationTest('linkedin')}
                                        className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded text-white font-bold transition shadow-lg flex items-center"
                                    >
                                        <span className="mr-2">🔗</span> Test LinkedIn Post
                                    </button>
                                    <button 
                                        onClick={() => runAutomationTest('blog')}
                                        className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded text-white font-bold transition shadow-lg flex items-center"
                                    >
                                        <span className="mr-2">📝</span> Test Blog Gen (NIM + Supabase)
                                    </button>
                                    <button 
                                        onClick={() => runAutomationTest('reddit')}
                                        className="bg-orange-600 hover:bg-orange-500 px-6 py-3 rounded text-white font-bold transition shadow-lg flex items-center"
                                    >
                                        <span className="mr-2">🎯</span> Test Reddit Sniper
                                    </button>
                                </div>

                                {testLog && (
                                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                                        <h3 className="text-blue-400 text-sm font-bold uppercase mb-4">Diagnostic Output</h3>
                                        <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-96 custom-scrollbar">
                                            {testLog}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4B5563; }
            `}</style>
        </div>
    );
}
