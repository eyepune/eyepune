'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from 'framer-motion';
import { Plus, Send, Pause, Play, BarChart3, Bot, Pencil, Loader2, Mail, Activity, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch automations');
            return Array.isArray(data) ? data : [];
        }
    });

    const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
        queryKey: ['admin-email-templates'],
        queryFn: async () => {
            const res = await fetch('/api/email/templates');
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch templates');
            return Array.isArray(data) ? data : [];
        }
    });

    const { data: systemStatus, isLoading: isLoadingStatus } = useQuery({
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
        draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };

    const isLoadingAny = isLoadingCampaigns || isLoadingAutomations || isLoadingTemplates || isLoadingStatus;

    if (isLoadingAny && campaigns.length === 0 && automations.length === 0) {
        return (
            <AdminLayout>
                <div className="min-h-[80vh] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
                        <p className="text-gray-400 font-medium animate-pulse">Initializing Marketing Engine...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-medium text-gray-300">Marketing & Automation</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Campaigns & Rules</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Design email campaigns, manage broadcast lists, and configure automated behavioral triggers.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {templates.length === 0 && (
                        <Button 
                            onClick={() => seedMutation.mutate()} 
                            disabled={seedMutation.isPending} 
                            variant="outline" 
                            className="bg-[#111] border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                        >
                            {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                            Install Defaults
                        </Button>
                    )}
                    <Button 
                        onClick={() => { setSelectedAutomation(null); setIsEditingAutomation(true); }} 
                        className="bg-[#111] border border-white/10 hover:border-blue-500/50 text-white hover:bg-white/5"
                    >
                        <Bot className="w-4 h-4 mr-2 text-blue-500" /> New Rule
                    </Button>
                    <Button 
                        onClick={() => { setSelectedCampaign(null); setIsEditing(true); }} 
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white shadow-lg shadow-purple-500/20 border-0"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Campaign
                    </Button>
                </div>
            </div>

            {/* System Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center border",
                                systemStatus?.zoho?.configured ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
                            )}>
                                <Mail className={cn("w-6 h-6", systemStatus?.zoho?.configured ? 'text-emerald-500' : 'text-amber-500')} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                    Zoho Mail Integration
                                    {systemStatus?.zoho?.configured ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {systemStatus?.zoho?.configured ? 'SMTP connected & verified' : 'OAuth authorization required to send emails'}
                                </p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => window.open('/api/zoho/auth', '_blank')} 
                            className={cn(
                                "h-9 text-xs px-4 border-0",
                                systemStatus?.zoho?.configured 
                                    ? "bg-white/5 hover:bg-white/10 text-white border border-white/10" 
                                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20"
                            )}
                        >
                            {systemStatus?.zoho?.configured ? 'Re-authorize' : 'Authorize Zoho'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Activity className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Automation Engine</p>
                            <p className="text-xs text-gray-400 mt-1">Watching <strong className="text-blue-400">{automations.length}</strong> active workflow rules</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="campaigns" className="relative z-10">
                <TabsList className="bg-[#111] border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="campaigns" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        Email Campaigns
                    </TabsTrigger>
                    <TabsTrigger value="automations" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        Automation Rules
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns" className="mt-6 focus:outline-none">
                    {campaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                <Mail className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white">No campaigns found</h3>
                            <p className="text-gray-500 text-sm mt-1 mb-6">Create your first email campaign to reach out to leads.</p>
                            <Button 
                                onClick={() => { setSelectedCampaign(null); setIsEditing(true); }} 
                                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Create Campaign
                            </Button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaigns.map((campaign) => (
                                <motion.div 
                                    key={campaign.id} 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{campaign.name}</h3>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">{campaign.type}</p>
                                            </div>
                                            <Badge className={cn("border font-medium px-2.5 py-0.5 text-[10px] uppercase tracking-wider", statusColors[campaign.status] || 'bg-gray-500/10 text-gray-400')}>
                                                {campaign.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Delivered</p>
                                                <p className="text-xl font-bold text-white">{campaign.sent_count || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Opened</p>
                                                <p className="text-xl font-bold text-white">{campaign.opened_count || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => toggleCampaignStatus(campaign)} 
                                                className={cn(
                                                    "border-white/10 hover:bg-white/5 transition-all flex-1 h-10",
                                                    campaign.status === 'active' ? "text-amber-500 hover:text-amber-400" : "text-emerald-500 hover:text-emerald-400"
                                                )}
                                            >
                                                {campaign.status === 'active' ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Resume</>}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => { setSelectedCampaign(campaign); setIsEditing(true); }} 
                                                className="border-white/10 text-white hover:bg-white/5 transition-all flex-1 h-10"
                                            >
                                                <Pencil className="w-4 h-4 mr-2 text-gray-400" /> Edit
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="automations" className="mt-6 focus:outline-none">
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                            <CardTitle className="text-white text-xl flex items-center gap-3">
                                <Bot className="w-5 h-5 text-blue-500" /> Active Workflow Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {automations.length === 0 ? (
                                <div className="py-20 text-center">
                                    <p className="text-gray-500">No automation rules defined.</p>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => { setSelectedAutomation(null); setIsEditingAutomation(true); }} 
                                        className="mt-4 border-white/10 text-white hover:bg-white/5"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Create First Rule
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {automations.map((automation) => (
                                        <div key={automation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group">
                                            <div className="mb-4 sm:mb-0">
                                                <p className="font-semibold text-white text-base group-hover:text-blue-400 transition-colors">{automation.name}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs">
                                                    <Badge variant="outline" className="bg-white/[0.03] text-gray-400 border-white/10 uppercase tracking-wide">
                                                        Trigger: {automation.trigger_type.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-gray-400 flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5" /> Template: {automation.template?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className={cn("border font-medium px-2.5 py-1 text-[10px] uppercase tracking-wider", automation.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
                                                    {automation.status}
                                                </Badge>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => { setSelectedAutomation(automation); setIsEditingAutomation(true); }} 
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Campaign Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="bg-[#0c0c0c]/95 backdrop-blur-2xl border-white/10 text-white max-w-2xl p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-500" />
                    <DialogHeader className="p-6 pb-4 border-b border-white/5 bg-white/[0.01]">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {selectedCampaign ? <Pencil className="w-5 h-5 text-purple-500" /> : <Plus className="w-5 h-5 text-purple-500" />}
                            {selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveCampaign} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Campaign Name *</Label>
                            <Input name="name" defaultValue={selectedCampaign?.name} required placeholder="e.g. Q3 Promotional Blast" className="bg-[#111] border-white/10 focus:border-purple-500/50 h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Channel Type</Label>
                                <Select name="type" defaultValue={selectedCampaign?.type || 'email'}>
                                    <SelectTrigger className="bg-[#111] border-white/10 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Target Audience</Label>
                                <Select name="target_audience" defaultValue={selectedCampaign?.target_audience || 'all'}>
                                    <SelectTrigger className="bg-[#111] border-white/10 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="all">All Leads</SelectItem>
                                        <SelectItem value="new">New Leads</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Email Subject</Label>
                            <Input name="subject" defaultValue={selectedCampaign?.subject} placeholder="Exciting news from EyE PunE!" className="bg-[#111] border-white/10 focus:border-purple-500/50 h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Message Content *</Label>
                            <Textarea name="content" defaultValue={selectedCampaign?.content} placeholder="Write your message content here..." className="min-h-[200px] bg-[#111] border-white/10 focus:border-purple-500/50 resize-none custom-scrollbar" required />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">Cancel</Button>
                            <Button type="submit" disabled={campaignMutation.isPending} className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white shadow-lg shadow-purple-500/20 border-0 px-8">
                                {campaignMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Campaign
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Automation Dialog */}
            <Dialog open={isEditingAutomation} onOpenChange={setIsEditingAutomation}>
                <DialogContent className="bg-[#0c0c0c]/95 backdrop-blur-2xl border-white/10 text-white max-w-xl p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
                    <DialogHeader className="p-6 pb-4 border-b border-white/5 bg-white/[0.01]">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {selectedAutomation ? <Pencil className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                            {selectedAutomation ? 'Edit Automation Rule' : 'Create Automation Rule'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveAutomation} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Rule Name *</Label>
                            <Input name="name" defaultValue={selectedAutomation?.name} required placeholder="e.g. Welcome Series" className="bg-[#111] border-white/10 focus:border-blue-500/50 h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Trigger Event</Label>
                            <Select name="trigger_type" defaultValue={selectedAutomation?.trigger_type || 'new_lead'}>
                                <SelectTrigger className="bg-[#111] border-white/10 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-white/10 text-white">
                                    <SelectItem value="new_lead">On New Lead</SelectItem>
                                    <SelectItem value="new_inquiry">On New Inquiry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Select Template</Label>
                            <Select name="template_id" defaultValue={selectedAutomation?.template_id}>
                                <SelectTrigger className="bg-[#111] border-white/10 h-11">
                                    <SelectValue placeholder="Choose an email template to send..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-white/10 text-white">
                                    {templates.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button type="button" variant="outline" onClick={() => setIsEditingAutomation(false)} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">Cancel</Button>
                            <Button type="submit" disabled={automationMutation.isPending} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 border-0 px-8">
                                {automationMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Rule
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminMarketingPage() {
    return <AdminGuard><AdminLayout><Admin_Marketing /></AdminLayout></AdminGuard>;
}