'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from 'framer-motion';
import { Plus, Send, Pause, Play, BarChart3, Bot, Pencil, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

function Admin_Marketing() {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAutomation, setIsEditingAutomation] = useState(false);
    const [selectedAutomation, setSelectedAutomation] = useState(null);
    const queryClient = useQueryClient();

    const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const { data: automations = [], isLoading: isLoadingAutomations } = useQuery({
        queryKey: ['admin-automations'],
        queryFn: async () => {
            const res = await fetch('/api/email/automations');
            if (!res.ok) throw new Error('Failed to fetch automations');
            return res.json();
        }
    });

    const { data: templates = [] } = useQuery({
        queryKey: ['admin-email-templates'],
        queryFn: async () => {
            const res = await fetch('/api/email/templates');
            return res.json();
        }
    });

    const { data: systemStatus } = useQuery({
        queryKey: ['system-status'],
        queryFn: async () => {
            const res = await fetch('/api/system/verify');
            const data = await res.json();
            return data.report;
        }
    });

    const campaignMutation = useMutation({
        mutationFn: async (data) => {
            const { id, ...payload } = data;
            if (id) {
                const { error } = await supabase.from('campaigns').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('campaigns').insert([payload]);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['campaigns']);
            setIsEditing(false);
            toast.success('Campaign saved');
        }
    });

    const seedMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/email/seed', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to install defaults');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-email-templates']);
            queryClient.invalidateQueries(['admin-automations']);
            toast.success('Professional marketing suite installed!');
        }
    });

    const automationMutation = useMutation({
        mutationFn: async (data) => {
            const method = data.id ? 'PUT' : 'POST';
            const res = await fetch('/api/email/automations', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-automations']);
            setIsEditingAutomation(false);
            toast.success('Automation rule saved');
        }
    });

    const handleSaveCampaign = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            type: formData.get('type'),
            subject: formData.get('subject'),
            content: formData.get('content'),
            target_audience: formData.get('target_audience'),
            status: 'draft'
        };
        if (selectedCampaign) data.id = selectedCampaign.id;
        campaignMutation.mutate(data);
    };

    const handleSaveAutomation = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            trigger_type: formData.get('trigger_type'),
            template_id: formData.get('template_id'),
            status: 'active'
        };
        if (selectedAutomation) data.id = selectedAutomation.id;
        automationMutation.mutate(data);
    };

    const toggleCampaignStatus = async (campaign) => {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        const { error } = await supabase.from('campaigns').update({ status: newStatus }).eq('id', campaign.id);
        if (!error) queryClient.invalidateQueries(['campaigns']);
    };

    const statusColors = {
        draft: 'bg-gray-500/10 text-gray-600',
        scheduled: 'bg-blue-500/10 text-blue-600',
        active: 'bg-green-500/10 text-green-600',
        completed: 'bg-purple-500/10 text-purple-600',
        paused: 'bg-yellow-500/10 text-yellow-600'
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Marketing & Automation</h1>
                        <p className="text-gray-500 mt-1">Manage bulk campaigns and automated email triggers</p>
                    </div>
                    <div className="flex gap-3">
                        {templates.length === 0 && (
                            <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                                {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                                Install Defaults
                            </Button>
                        )}
                        <Button onClick={() => { setSelectedCampaign(null); setIsEditing(true); }} className="bg-red-600 hover:bg-red-700 text-white">
                            <Plus className="w-4 h-4 mr-2" /> New Campaign
                        </Button>
                        <Button variant="outline" onClick={() => { setSelectedAutomation(null); setIsEditingAutomation(true); }} className="border-white/[0.06] hover:bg-white/[0.04] text-white">
                            <Plus className="w-4 h-4 mr-2" /> New Automation
                        </Button>
                    </div>
                </div>

                {/* System Status Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card className="bg-[#111] border-white/[0.06] overflow-hidden">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${systemStatus?.zoho?.configured ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                                    <Mail className={`w-5 h-5 ${systemStatus?.zoho?.configured ? 'text-green-500' : 'text-yellow-500'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Zoho Mail Status</p>
                                    <p className="text-xs text-gray-500">
                                        {systemStatus?.zoho?.configured ? 'Connected & Ready' : 'Authorization Required'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.open('/api/zoho/auth', '_blank')} className="border-white/[0.06] text-xs text-white">
                                {systemStatus?.zoho?.configured ? 'Re-authorize' : 'Authorize Now'}
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-white/[0.06]">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Automation Engine</p>
                                <p className="text-xs text-gray-500">Watching {automations.length} active rules</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="campaigns" className="mb-6">
                    <TabsList className="bg-[#111] border-white/[0.06]">
                        <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
                        <TabsTrigger value="automations">Automation Rules</TabsTrigger>
                    </TabsList>

                    <TabsContent value="campaigns" className="space-y-4 mt-6">
                        {isLoadingCampaigns ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500" /> : campaigns.length === 0 ? (
                            <Card className="bg-[#111] border-white/[0.06] py-12 text-center text-gray-500">
                                <p>No campaigns yet.</p>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {campaigns.map((campaign) => (
                                    <motion.div key={campaign.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111] border border-white/[0.06] rounded-xl p-6 hover:border-red-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-white mb-1">{campaign.name}</h3>
                                                <p className="text-xs text-gray-500 capitalize">{campaign.type}</p>
                                            </div>
                                            <Badge className={statusColors[campaign.status] || 'bg-gray-500/10 text-gray-400'}>
                                                {campaign.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                                            <div><p className="text-gray-600 uppercase">Sent</p><p className="font-medium text-white">{campaign.sent_count || 0}</p></div>
                                            <div><p className="text-gray-600 uppercase">Opened</p><p className="font-medium text-white">{campaign.opened_count || 0}</p></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => toggleCampaignStatus(campaign)} className="border-white/[0.06] text-white">
                                                {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => { setSelectedCampaign(campaign); setIsEditing(true); }} className="flex-1 border-white/[0.06] text-white">
                                                Edit
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="automations" className="mt-6">
                        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-8">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Bot className="w-5 h-5 text-red-500" /> Active Automations
                            </h3>
                            <div className="space-y-4">
                                {isLoadingAutomations ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-500" />
                                ) : automations.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No automation rules defined.</p>
                                ) : (
                                    automations.map((automation) => (
                                        <div key={automation.id} className="flex justify-between items-center p-4 border border-white/[0.04] rounded-lg bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                                            <div>
                                                <p className="font-medium text-white">{automation.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Trigger: <span className="text-red-400">{automation.trigger_type.replace('_', ' ')}</span> • 
                                                    Template: <span className="text-gray-400">{automation.template?.name || 'N/A'}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={automation.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}>
                                                    {automation.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" onClick={() => { setSelectedAutomation(automation); setIsEditingAutomation(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Pencil className="w-4 h-4 text-gray-400" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Campaign Dialog */}
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="max-w-2xl bg-[#111] border-white/[0.06] text-white">
                        <DialogHeader><DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSaveCampaign} className="space-y-4">
                            <div><Label className="text-gray-400">Name *</Label><Input name="name" defaultValue={selectedCampaign?.name} required className="bg-[#1a1a1a] border-white/[0.06]" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label className="text-gray-400">Type</Label><Select name="type" defaultValue={selectedCampaign?.type || 'email'}><SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10 text-white"><SelectItem value="email">Email</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem></SelectContent></Select></div>
                                <div><Label className="text-gray-400">Audience</Label><Select name="target_audience" defaultValue={selectedCampaign?.target_audience || 'all'}><SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10 text-white"><SelectItem value="all">All Leads</SelectItem><SelectItem value="new">New Leads</SelectItem></SelectContent></Select></div>
                            </div>
                            <div><Label className="text-gray-400">Subject</Label><Input name="subject" defaultValue={selectedCampaign?.subject} className="bg-[#1a1a1a] border-white/[0.06]" /></div>
                            <div><Label className="text-gray-400">Content *</Label><Textarea name="content" defaultValue={selectedCampaign?.content} className="min-h-[200px] bg-[#1a1a1a] border-white/[0.06]" required /></div>
                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Save Campaign</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Automation Dialog */}
                <Dialog open={isEditingAutomation} onOpenChange={setIsEditingAutomation}>
                    <DialogContent className="max-w-xl bg-[#111] border-white/[0.06] text-white">
                        <DialogHeader><DialogTitle>{selectedAutomation ? 'Edit Automation' : 'New Automation'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSaveAutomation} className="space-y-4">
                            <div><Label className="text-gray-400">Rule Name *</Label><Input name="name" defaultValue={selectedAutomation?.name} required className="bg-[#1a1a1a] border-white/[0.06]" /></div>
                            <div><Label className="text-gray-400">Trigger Event</Label><Select name="trigger_type" defaultValue={selectedAutomation?.trigger_type || 'new_lead'}><SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10 text-white"><SelectItem value="new_lead">On New Lead</SelectItem><SelectItem value="new_inquiry">On New Inquiry</SelectItem></SelectContent></Select></div>
                            <div><Label className="text-gray-400">Template</Label><Select name="template_id" defaultValue={selectedAutomation?.template_id}><SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue placeholder="Select template" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10 text-white">{templates.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent></Select></div>
                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Save Rule</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function AdminMarketingPage() {
    return <AdminGuard><AdminLayout><Admin_Marketing /></AdminLayout></AdminGuard>;
}