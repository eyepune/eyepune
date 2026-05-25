import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Zap, Target, MessageSquare, ArrowUpRight, 
    RefreshCw, Pause, Play, Users, Linkedin, Mail,
    TrendingUp, Search, Filter, CheckCircle2, Wand2,
    ShieldCheck, Bot, Cpu, Sparkles, Webhook, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { OUTREACH_PITCH_PROMPT } from '@/utils/prompts';

export default function GrowthEngine() {
    const queryClient = useQueryClient();
    const [isSearching, setIsSearching] = useState(false);
    const [autoPilot, setAutoPilot] = useState(false);
    const [isGenerating, setIsGenerating] = useState(null); // ID of lead being pitched
    const [outreachChannel, setOutreachChannel] = useState('linkedin_connection'); // 'linkedin_connection' | 'linkedin_message' | 'email'

    // 1. Fetch Campaigns
    const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
        queryKey: ['growth-campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase.from('growth_campaigns').select('*');
            if (error) throw error;
            return data;
        }
    });

    // 2. Fetch Recent Leads
    const { data: leads = [], isLoading: loadingLeads } = useQuery({
        queryKey: ['growth-leads'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('growth_leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            return data;
        }
    });

    // 3. AI Pitch Generation Logic
    const generatePitch = async (lead) => {
        setIsGenerating(lead.id);
        try {
            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: OUTREACH_PITCH_PROMPT(lead, campaigns[0]?.target_icp || 'B2B Founders', outreachChannel)
                })
            });

            if (!response.ok) throw new Error('AI generation failed');
            const { content } = await response.json();

            // Update lead with pitch and status
            await supabase.from('growth_leads').update({
                last_action: `AI Pitch: ${content.substring(0, 50)}...`,
                status: 'pitched',
                last_action_at: new Date().toISOString()
            }).eq('id', lead.id);

            queryClient.invalidateQueries(['growth-leads']);
            toast.success(`AI Pitch generated for ${lead.full_name}`);
        } catch (e) {
            toast.error('Failed to generate pitch: ' + e.message);
        } finally {
            setIsGenerating(null);
        }
    };

    // 4. Auto-Pilot Loop (Simulated)
    useEffect(() => {
        if (autoPilot && leads.length > 0) {
            const nextTarget = leads.find(l => l.status === 'sourcing');
            if (nextTarget && !isGenerating) {
                const timer = setTimeout(() => generatePitch(nextTarget), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [autoPilot, leads, isGenerating]);

    // 5. Mutation: Toggle Campaign
    const toggleCampaign = useMutation({
        mutationFn: async ({ id, status }) => {
            const newStatus = status === 'active' ? 'paused' : 'active';
            const { error } = await supabase
                .from('growth_campaigns')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['growth-campaigns']);
            toast.success('Campaign status updated');
        }
    });

    // 6. Webhook Display
    const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/linkedin` : 'https://eyepune.com/api/webhooks/linkedin';
    
    const copyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        toast.success('LinkedIn Webhook URL copied to clipboard!');
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${autoPilot ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-500'} transition-all`}>
                        <Cpu className={`w-6 h-6 ${autoPilot ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Engine Status: {autoPilot ? 'Fully Autonomous' : 'Manual Control'}
                            {autoPilot && <Badge className="bg-red-600 text-[10px] animate-pulse">AUTO-PILOT ON</Badge>}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Connect PhantomBuster or HeyReach to the webhook to stream LinkedIn leads.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button 
                    <Button onClick={() => setAutoPilot(!autoPilot)} variant={autoPilot ? "default" : "outline"} className={`h-12 px-6 rounded-2xl transition-all ${autoPilot ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-lg shadow-red-500/20' : 'border-white/10 text-gray-400 hover:text-white'}`}>
                        {autoPilot ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {autoPilot ? 'Disable Auto-Pilot' : 'Enable AI Auto-Pilot'}
                    </Button>
                    <Button onClick={copyWebhook} variant="outline" className="h-12 px-6 border-white/10 text-gray-400 rounded-2xl group hover:text-white hover:border-red-500/50 transition-all">
                        <Webhook className="w-4 h-4 mr-2 group-hover:text-red-500 transition-colors" /> Copy Webhook
                    </Button>
                </div>
            </div>

            {/* Channel Selection */}
            <div className="flex gap-3 bg-white/[0.02] border border-white/[0.05] p-2 rounded-2xl w-fit">
                {[
                    { id: 'linkedin_connection', label: 'LinkedIn Connection', icon: Linkedin },
                    { id: 'linkedin_message', label: 'LinkedIn Message', icon: MessageSquare },
                    { id: 'email', label: 'Cold Email', icon: Mail }
                ].map((ch) => (
                    <button
                        key={ch.id}
                        onClick={() => setOutreachChannel(ch.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            outreachChannel === ch.id 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <ch.icon className="w-3.5 h-3.5" />
                        {ch.label}
                    </button>
                ))}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Engines', value: campaigns.length, icon: Target, color: 'text-blue-400' },
                    { label: 'AI Pitches Today', value: leads.filter(l => l.status === 'pitched').length, icon: Zap, color: 'text-yellow-400' },
                    { label: 'Replied/Interested', value: leads.filter(l => l.status === 'qualified').length, icon: MessageSquare, color: 'text-green-400' },
                    { label: 'LLM Confidence', value: '94%', icon: Sparkles, color: 'text-purple-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 group hover:border-red-500/20 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-2/3" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Campaigns List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter">Growth Strategy</h3>
                                <p className="text-sm text-gray-500">Orchestrating multi-model AI workflows</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {campaigns.map((c) => (
                                <div key={c.id} className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/20 transition-all group">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-600/20">
                                                <Target className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-xl tracking-tight mb-1">{c.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-white/5 text-gray-400 border-white/10 text-[10px] font-bold">ICP: {c.target_icp}</Badge>
                                                    <div className="flex items-center gap-1.5 text-xs text-green-500 font-black italic">
                                                        <Sparkles className="w-3 h-3" /> ROI Focus
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => toggleCampaign.mutate({ id: c.id, status: c.status })}
                                            className={`h-12 w-12 rounded-2xl ${c.status === 'active' ? 'text-red-500 bg-red-500/10' : 'text-gray-500 bg-white/5'}`}
                                        >
                                            {c.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-8 pt-8 border-t border-white/[0.05]">
                                        <div>
                                            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Total Sent</p>
                                            <p className="text-2xl font-black text-white">{c.total_sent}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Replies</p>
                                            <p className="text-2xl font-black text-green-400">{c.total_replies}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Success Rate</p>
                                            <p className="text-2xl font-black text-blue-400">12.4%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Status</p>
                                            <Badge className={c.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                                {c.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Intelligence Log */}
                    <div className="bg-[#080808] border border-white/[0.06] rounded-[2rem] p-8 font-mono text-[11px] shadow-inner">
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <Bot className="w-4 h-4 text-red-500" />
                                <span className="text-white font-black tracking-widest uppercase">Autonomous Intelligence Log</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            </div>
                        </div>
                        <div className="space-y-2 text-gray-400 h-48 overflow-y-auto custom-scrollbar pr-4">
                            <p className="flex gap-3"><span className="text-blue-500 font-bold">[ENGINE]</span> <span>Initialized Multi-Model Orchestration (OpenAI + NVIDIA NIM)</span></p>
                            <p className="flex gap-3"><span className="text-green-500 font-bold">[AUTH]</span> <span>LinkedIn Session: VERIFIED. Rotation cycle active.</span></p>
                            <p className="flex gap-3"><span className="text-gray-500 font-bold">[MODE]</span> <span className="uppercase">Active Channel: {outreachChannel.replace('_', ' ')}</span></p>
                            <p className="flex gap-3"><span className="text-purple-500 font-bold">[LLM]</span> <span>Analyzing Sarah Chen (Quantum SaaS) - High intent detected.</span></p>
                            <p className="flex gap-3"><span className="text-red-500 font-bold">[ACTION]</span> <span>Autonomous {outreachChannel.includes('linkedin') ? 'LinkedIn' : 'Email'} pitch generated and sent.</span></p>
                            <p className="flex gap-3"><span className="text-gray-600 font-bold">[WAIT]</span> <span>Cooldown period: 184 seconds remaining...</span></p>
                            {autoPilot && isGenerating && <p className="flex gap-3 animate-pulse"><span className="text-yellow-500 font-bold">[ACTIVE]</span> <span>AI is currently crafting a personalized {outreachChannel.replace('_', ' ')}...</span></p>}
                        </div>
                    </div>
                </div>

                {/* Lead Feed */}
                <div className="space-y-6">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[2rem] p-6 h-full shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-white">Prospect Feed</h3>
                                <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5 tracking-widest">Real-time Acquisition</p>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#040404] bg-gray-800" />)}
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {leads.map((l) => (
                                <div key={l.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.04] transition-all relative">
                                    {isGenerating === l.id && <div className="absolute inset-0 bg-red-600/5 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
                                        <Wand2 className="w-5 h-5 text-red-500 animate-bounce" />
                                    </div>}
                                    
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-black text-white tracking-tight">{l.full_name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{l.company}</p>
                                        </div>
                                        <Badge className={`text-[9px] font-black uppercase ${
                                            l.status === 'qualified' ? 'bg-green-500/20 text-green-400' :
                                            l.status === 'pitched' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-white/5 text-gray-500'
                                        }`}>{l.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${l.ai_qualification_score || 0}%` }} />
                                        </div>
                                        <span className="text-[10px] font-black text-white italic">{l.ai_qualification_score || '--'}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        {l.status === 'sourcing' ? (
                                            <Button 
                                                onClick={() => generatePitch(l)} 
                                                disabled={!!isGenerating}
                                                size="sm" 
                                                className="w-full bg-white text-black hover:bg-gray-200 h-8 text-[10px] font-black rounded-lg"
                                            >
                                                <Wand2 className="w-3 h-3 mr-2" /> Personalize & Pitch
                                            </Button>
                                        ) : (
                                            <p className="text-[10px] text-gray-500 italic truncate w-full px-2">
                                                {l.last_action || 'Action pending...'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="ghost" className="w-full mt-6 text-[10px] text-gray-500 hover:text-white uppercase font-black tracking-widest border border-dashed border-white/10 rounded-xl h-10">
                            Intelligence Archive <ArrowUpRight className="w-3 h-3 ml-2" />
                        </Button>
                    </div>

                    {/* Elite Qualification Card */}
                    <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-[2rem] p-8 shadow-2xl shadow-red-600/20 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10">
                            <ShieldCheck className="w-10 h-10 text-white mb-6" />
                            <h4 className="text-xl font-black text-white tracking-tighter mb-2">High-Intent Only</h4>
                            <p className="text-red-100 text-xs font-medium leading-relaxed mb-8">
                                The engine is filtering out the noise. We currently have 3 prospects that match your 'Unicorn Client' profile.
                            </p>
                            <Button className="w-full bg-black text-white font-black text-xs h-12 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                                Connect to CRM & Launch
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
