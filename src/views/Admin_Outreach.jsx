import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminGuard from '@/components/admin/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Send, Download, RefreshCw, CheckCircle2, AlertCircle, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

const PITCH_DECK_URL = 'https://media.base44.com/files/public/69697d1626923688ef1d9afa/cf0b23f7b_PitchDeck-PDF.pdf';

function OutreachContent() {
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [wixData, setWixData] = useState(null);
    const [loadingWix, setLoadingWix] = useState(false);
    const [sending, setSending] = useState(false);
    const [results, setResults] = useState(null);
    const [channel, setChannel] = useState('email');
    const [customMessage, setCustomMessage] = useState('');
    const [customSubject, setCustomSubject] = useState('');
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('leads');

    const { data: leads = [] } = useQuery({
        queryKey: ['leads-outreach'],
        queryFn: () => base44.entities.Lead.list('-created_date', 2000),
    });

    const fetchWixData = async () => {
        setLoadingWix(true);
        try {
            const res = await base44.functions.invoke('fetchWixPastData', { type: 'all' });
            setWixData(res.data);
            toast.success(`Fetched ${res.data.past_clients?.length || 0} past clients from Wix`);
        } catch (e) {
            toast.error('Failed to fetch Wix data: ' + e.message);
        }
        setLoadingWix(false);
    };

    const toggleLead = (lead) => {
        setSelectedLeads(prev =>
            prev.find(l => l.id === lead.id)
                ? prev.filter(l => l.id !== lead.id)
                : [...prev, lead]
        );
    };

    const selectAll = (list) => setSelectedLeads(list);
    const clearAll = () => setSelectedLeads([]);

    const handleSend = async () => {
        if (selectedLeads.length === 0) { toast.error('Select at least one recipient'); return; }
        setSending(true);
        setResults(null);
        try {
            const recipients = selectedLeads.map(l => ({
                name: l.full_name || l.customer_name || l.name || 'there',
                email: l.email || l.customer_email,
                phone: l.phone || l.customer_phone,
                lead_id: l.lead_id || l.id,
            })).filter(r => r.email || r.phone);

            const res = await base44.functions.invoke('sendPitchDeck', {
                recipients,
                channel,
                subject: customSubject || undefined,
                message: customMessage || undefined,
            });
            setResults(res.data);
            toast.success(`Sent to ${res.data.sent_count} recipients!`);
        } catch (e) {
            toast.error('Send failed: ' + e.message);
        }
        setSending(false);
    };

    const filteredLeads = leads.filter(l =>
        !search || l.full_name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase())
    );

    const pastClients = wixData?.past_clients || [];
    const filteredClients = pastClients.filter(c =>
        !search || c.customer_name?.toLowerCase().includes(search.toLowerCase()) || c.customer_email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Client Outreach</h1>
                    <p className="text-gray-500 text-sm mt-1">Send pitch deck via Email or WhatsApp to leads & past clients</p>
                </div>
                <a href={PITCH_DECK_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-white/10 text-gray-300 gap-2">
                        <Download className="w-4 h-4" /> View Pitch Deck
                    </Button>
                </a>
            </div>

            {/* Pitch Deck Preview */}
            <div className="bg-gradient-to-r from-red-950/40 to-orange-950/20 border border-red-500/10 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white">EyE PunE Pitch Deck — "The Architecture of Scaling"</p>
                        <p className="text-gray-500 text-sm">15 slides · PDF · Ready to share with clients via email & WhatsApp</p>
                    </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ready</Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Recipient Selection */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-white">Select Recipients</h2>
                            <Button onClick={fetchWixData} disabled={loadingWix} size="sm" variant="outline" className="border-white/10 text-gray-400 gap-2">
                                {loadingWix ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Fetch Wix Clients
                            </Button>
                        </div>

                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-white/[0.05] border-white/10 text-white mb-4"
                        />

                        <Tabs value={tab} onValueChange={setTab}>
                            <TabsList className="bg-white/[0.05] mb-4">
                                <TabsTrigger value="leads" className="data-[state=active]:bg-red-500">
                                    <Users className="w-3 h-3 mr-1" /> CRM Leads ({leads.length})
                                </TabsTrigger>
                                <TabsTrigger value="wix" className="data-[state=active]:bg-red-500">
                                    <FileText className="w-3 h-3 mr-1" /> Past Clients ({pastClients.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="leads">
                                <div className="flex gap-2 mb-3">
                                    <Button size="sm" variant="ghost" className="text-gray-400 text-xs" onClick={() => selectAll(filteredLeads.slice(0, 100))}>
                                        Select All ({Math.min(filteredLeads.length, 100)})
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-gray-400 text-xs" onClick={clearAll}>Clear</Button>
                                </div>
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {filteredLeads.slice(0, 100).map(l => (
                                        <label key={l.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                            selectedLeads.find(s => s.id === l.id)
                                                ? 'border-red-500/40 bg-red-500/10'
                                                : 'border-white/[0.05] hover:bg-white/[0.03]'
                                        }`}>
                                            <input type="checkbox" className="accent-red-500"
                                                checked={!!selectedLeads.find(s => s.id === l.id)}
                                                onChange={() => toggleLead(l)} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-medium truncate">{l.full_name}</p>
                                                <p className="text-xs text-gray-500 truncate">{l.email} {l.phone ? `· ${l.phone}` : ''}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Badge className={`text-[10px] ${
                                                    l.status === 'closed_won' ? 'bg-green-500/20 text-green-400' :
                                                    l.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>{l.status?.replace('_', ' ')}</Badge>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="wix">
                                {pastClients.length === 0 ? (
                                    <div className="text-center py-8 text-gray-600">
                                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p>Click "Fetch Wix Clients" to load past clients</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2 mb-3">
                                            <Button size="sm" variant="ghost" className="text-gray-400 text-xs"
                                                onClick={() => selectAll(filteredClients.map(c => ({ ...c, id: c.id, full_name: c.customer_name, email: c.customer_email, phone: c.customer_phone })))}>
                                                Select All
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-gray-400 text-xs" onClick={clearAll}>Clear</Button>
                                        </div>
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {filteredClients.map(c => (
                                                <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                                    selectedLeads.find(s => s.id === c.id)
                                                        ? 'border-red-500/40 bg-red-500/10'
                                                        : 'border-white/[0.05] hover:bg-white/[0.03]'
                                                }`}>
                                                    <input type="checkbox" className="accent-red-500"
                                                        checked={!!selectedLeads.find(s => s.id === c.id)}
                                                        onChange={() => toggleLead({ ...c, id: c.id, full_name: c.customer_name, email: c.customer_email, phone: c.customer_phone })} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white font-medium truncate">{c.customer_name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{c.customer_email} · Invoice #{c.invoice_number}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-green-400">₹{(c.total / 100).toLocaleString()}</p>
                                                        {c.is_known_lead && <Badge className="text-[10px] bg-purple-500/20 text-purple-400">In CRM</Badge>}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Right: Send Panel */}
                <div className="space-y-4">
                    {/* Channel */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="font-bold text-white mb-3">Channel</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {['email', 'whatsapp', 'both'].map(c => (
                                <button key={c} onClick={() => setChannel(c)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all capitalize ${
                                        channel === c ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-white/10 text-gray-500 hover:border-white/20'
                                    }`}>
                                    {c === 'email' ? '📧' : c === 'whatsapp' ? '💬' : '🔀'} {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="font-bold text-white mb-3">Customize Message</h3>
                        {(channel === 'email' || channel === 'both') && (
                            <Input placeholder="Email subject (optional)"
                                value={customSubject} onChange={e => setCustomSubject(e.target.value)}
                                className="bg-white/[0.05] border-white/10 text-white mb-3 text-sm" />
                        )}
                        <textarea
                            placeholder="Personal message (optional, leave blank for default)..."
                            value={customMessage}
                            onChange={e => setCustomMessage(e.target.value)}
                            rows={4}
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-red-500/50"
                        />
                    </div>

                    {/* Summary & Send */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400 text-sm">Selected</span>
                            <span className="text-white font-bold">{selectedLeads.length} recipients</span>
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={sending || selectedLeads.length === 0}
                            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold gap-2"
                        >
                            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {sending ? 'Sending...' : `Send Pitch Deck (${selectedLeads.length})`}
                        </Button>
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                            <h3 className="font-bold text-white mb-3">Results</h3>
                            <div className="flex gap-3 mb-3">
                                <div className="flex items-center gap-1 text-green-400 text-sm">
                                    <CheckCircle2 className="w-4 h-4" /> {results.sent_count} sent
                                </div>
                                {results.failed_count > 0 && (
                                    <div className="flex items-center gap-1 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" /> {results.failed_count} failed
                                    </div>
                                )}
                            </div>
                            {/* WhatsApp links */}
                            {results.results?.sent?.filter(r => r.channel === 'whatsapp' && r.wa_link).map((r, i) => (
                                <a key={i} href={r.wa_link} target="_blank" rel="noopener noreferrer"
                                    className="block text-xs text-green-400 hover:underline truncate mb-1">
                                    💬 Open WhatsApp: {r.phone}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import AdminLayout from '@/components/admin/AdminLayout';

export default function Admin_Outreach() {
    return (
        <AdminGuard>
            <AdminLayout>
                <OutreachContent />
            </AdminLayout>
        </AdminGuard>
    );
}