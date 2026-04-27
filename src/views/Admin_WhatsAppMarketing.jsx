'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from 'framer-motion';
import { 
    Plus, MessageCircle, Pencil, 
    Trash2, Loader2, Sparkles, AlertCircle, 
    CheckCircle2, Smartphone, Globe, Settings2,
    Code
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Admin_WhatsAppMarketing() {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSequence, setSelectedSequence] = useState(null);
    const queryClient = useQueryClient();

    const { data: sequences = [], isLoading } = useQuery({
        queryKey: ['whatsapp-sequences'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('whatsapp_sequences')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            const { id, ...payload } = data;
            if (id) {
                const { error } = await supabase.from('whatsapp_sequences').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('whatsapp_sequences').insert([payload]);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['whatsapp-sequences']);
            setIsEditing(false);
            toast.success('WhatsApp sequence saved');
        },
        onError: (e) => toast.error(e.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('whatsapp_sequences').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['whatsapp-sequences']);
            toast.success('Sequence deleted');
        }
    });

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            trigger_type: formData.get('trigger_type'),
            template_name: formData.get('template_name'),
            language_code: formData.get('language_code'),
            status: 'active'
        };
        if (selectedSequence) data.id = selectedSequence.id;
        mutation.mutate(data);
    };

    return (
        <AdminGuard>
            <AdminLayout>
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                                <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-xs font-medium text-gray-300">WhatsApp Marketing Engine</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">WhatsApp Flows</h1>
                            <p className="text-gray-400 mt-2 text-sm max-w-xl">
                                Manage automated WhatsApp sequences for leads and inquiries. Connect your approved Meta templates here.
                            </p>
                        </div>
                        <Button 
                            onClick={() => { setSelectedSequence(null); setIsEditing(true); }} 
                            className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white shadow-lg shadow-green-500/20 border-0"
                        >
                            <Plus className="w-4 h-4 mr-2" /> New WhatsApp Rule
                        </Button>
                    </div>

                    {/* Meta Status Alert */}
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-green-500/10 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-transparent opacity-100" />
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">Meta WhatsApp Cloud API</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Templates must be approved in your <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-green-400 underline">Meta Business Suite</a> before they can be used here.
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> System Ready
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Grid of Sequences */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
                            <p className="text-gray-500">Loading your WhatsApp flows...</p>
                        </div>
                    ) : sequences.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 rounded-3xl text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                <MessageCircle className="w-10 h-10 text-gray-700" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No WhatsApp flows active</h3>
                            <p className="text-gray-500 max-w-sm mb-8">Set up your first automated WhatsApp response for new website leads.</p>
                            <Button 
                                onClick={() => { setSelectedSequence(null); setIsEditing(true); }}
                                className="bg-white text-black hover:bg-gray-200"
                            >
                                Get Started
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sequences.map((seq) => (
                                <motion.div 
                                    key={seq.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative p-6 rounded-3xl bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 hover:border-green-500/30 transition-all duration-500"
                                >
                                    <div className="absolute top-6 right-6 flex gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => { setSelectedSequence(seq); setIsEditing(true); }}
                                            className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => { if(confirm('Delete flow?')) deleteMutation.mutate(seq.id); }}
                                            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="mb-6">
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase font-bold tracking-widest mb-3">
                                            {seq.trigger_type.replace('_', ' ')}
                                        </Badge>
                                        <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors truncate pr-16">{seq.name}</h3>
                                    </div>

                                    <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500 flex items-center gap-1.5"><Code className="w-3 h-3" /> Template ID</span>
                                            <span className="text-white font-mono">{seq.template_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500 flex items-center gap-1.5"><Globe className="w-3 h-3" /> Language</span>
                                            <span className="text-white uppercase">{seq.language_code}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-xs text-green-500 font-medium capitalize">{seq.status}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-600">Created {new Date(seq.created_at).toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Editor Dialog */}
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                        <DialogContent className="bg-[#0c0c0c]/95 backdrop-blur-2xl border-white/10 text-white max-w-xl p-0 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-500" />
                            <DialogHeader className="p-8 pb-4">
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    <Settings2 className="w-6 h-6 text-green-500" />
                                    {selectedSequence ? 'Update WhatsApp Flow' : 'Create New WhatsApp Flow'}
                                </DialogTitle>
                                <DialogDescription className="text-gray-500">
                                    Configure how the system responds via WhatsApp Business API.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSave} className="p-8 space-y-6 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-gray-300 text-xs uppercase tracking-widest font-bold">Rule Name *</Label>
                                    <Input 
                                        name="name" 
                                        defaultValue={selectedSequence?.name} 
                                        required 
                                        placeholder="e.g. Welcome Message for Website Inquiries" 
                                        className="bg-[#111] border-white/10 h-12 focus:border-green-500/50" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300 text-xs uppercase tracking-widest font-bold">Trigger Event</Label>
                                        <Select name="trigger_type" defaultValue={selectedSequence?.trigger_type || 'new_inquiry'}>
                                            <SelectTrigger className="bg-[#111] border-white/10 h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10 text-white">
                                                <SelectItem value="new_inquiry">New Website Inquiry</SelectItem>
                                                <SelectItem value="new_lead">New CRM Lead</SelectItem>
                                                <SelectItem value="new_assessment">Completed AI Assessment</SelectItem>
                                                <SelectItem value="new_booking">New Appointment</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300 text-xs uppercase tracking-widest font-bold">Language</Label>
                                        <Select name="language_code" defaultValue={selectedSequence?.language_code || 'en_US'}>
                                            <SelectTrigger className="bg-[#111] border-white/10 h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10 text-white">
                                                <SelectItem value="en_US">English (US)</SelectItem>
                                                <SelectItem value="hi_IN">Hindi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300 text-xs uppercase tracking-widest font-bold flex items-center justify-between">
                                        <span>Meta Template Name *</span>
                                        <span className="text-[10px] text-orange-400 normal-case">Must match exact name in Meta Dev Panel</span>
                                    </Label>
                                    <Input 
                                        name="template_name" 
                                        defaultValue={selectedSequence?.template_name} 
                                        required 
                                        placeholder="e.g. welcome_v1" 
                                        className="bg-[#111] border-white/10 h-12 font-mono text-green-400" 
                                    />
                                </div>

                                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    <p className="text-[11px] text-gray-400 leading-relaxed">
                                        <strong>Note:</strong> Dynamic variables like <code>{"{{1}}"}</code> are currently passed as the lead's name by default. For complex custom components, please contact the development team.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsEditing(false)} 
                                        className="border-white/10 text-gray-400 hover:text-white h-12 px-6"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={mutation.isPending} 
                                        className="bg-gradient-to-r from-green-600 to-emerald-500 text-white h-12 px-10 shadow-lg shadow-green-500/20"
                                    >
                                        {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                        {selectedSequence ? 'Update Flow' : 'Create Flow'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
