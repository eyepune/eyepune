'use client';

import React, { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Send, Mail, Users, Clock, Zap, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

function Admin_DripAutomations() {
    const [isSeqDialogOpen, setIsSeqDialogOpen] = useState(false);
    const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
    const [editingSeq, setEditingSeq] = useState(null);
    const [editingStep, setEditingStep] = useState(null);
    const [selectedSeqId, setSelectedSeqId] = useState(null);
    const queryClient = useQueryClient();

    const [seqFormData, setSeqFormData] = useState({ name: '', description: '', is_active: true });
    const [stepFormData, setStepFormData] = useState({ step_order: 1, delay_days: 1, email_subject: '', email_content: '' });

    // -- QUERIES --
    const { data: sequences = [], isLoading: isSeqsLoading } = useQuery({
        queryKey: ['admin-drip-sequences'],
        queryFn: async () => {
            const { data, error } = await supabase.from('drip_sequences').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const { data: steps = [], isLoading: isStepsLoading } = useQuery({
        queryKey: ['admin-drip-steps', selectedSeqId],
        queryFn: async () => {
            const { data, error } = await supabase.from('drip_steps').select('*').eq('sequence_id', selectedSeqId).order('step_order', { ascending: true });
            if (error) throw error;
            return data || [];
        },
        enabled: !!selectedSeqId,
    });

    // -- MUTATIONS --
    const createSeqMutation = useMutation({
        mutationFn: async (data) => {
            const { data: res, error } = await supabase.from('drip_sequences').insert([data]).select().single();
            if (error) throw error;
            return res;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-drip-sequences']); setIsSeqDialogOpen(false); toast.success('Sequence created'); },
    });

    const createStepMutation = useMutation({
        mutationFn: async (data) => {
            const { data: res, error } = await supabase.from('drip_steps').insert([{ ...data, sequence_id: selectedSeqId }]).select().single();
            if (error) throw error;
            return res;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-drip-steps', selectedSeqId]); setIsStepDialogOpen(false); toast.success('Step added'); },
    });

    const toggleSeqMutation = useMutation({
        mutationFn: async ({ id, is_active }) => {
            await supabase.from('drip_sequences').update({ is_active }).eq('id', id);
        },
        onSuccess: () => queryClient.invalidateQueries(['admin-drip-sequences']),
    });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">AI Drip Sequences</h1>
                    <p className="text-gray-500 mt-1">Automated lead nurturing journeys</p>
                </div>
                <Button onClick={() => { setSeqFormData({ name: '', description: '', is_active: true }); setIsSeqDialogOpen(true); }} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" /> New Sequence
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sequences List */}
                <div className="space-y-4">
                    {sequences.map(seq => (
                        <Card 
                            key={seq.id} 
                            className={`bg-[#0c0c0c] border-white/[0.05] cursor-pointer transition-all ${selectedSeqId === seq.id ? 'border-red-600/40 ring-1 ring-red-600/20' : ''}`}
                            onClick={() => setSelectedSeqId(seq.id)}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-white font-bold">{seq.name}</h3>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => { e.stopPropagation(); toggleSeqMutation.mutate({ id: seq.id, is_active: !seq.is_active }); }}
                                    >
                                        {seq.is_active ? <Pause className="w-4 h-4 text-orange-500" /> : <Play className="w-4 h-4 text-green-500" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">{seq.description}</p>
                                <Badge className={seq.is_active ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                                    {seq.is_active ? 'Active' : 'Paused'}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Steps Details */}
                <div className="lg:col-span-2">
                    {selectedSeqId ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Sequence Steps</h2>
                                <Button size="sm" onClick={() => setIsStepDialogOpen(true)} className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                                    <Plus className="w-4 h-4 mr-2" /> Add Step
                                </Button>
                            </div>

                            <div className="space-y-4 relative">
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/5" />
                                {steps.map((step, i) => (
                                    <div key={step.id} className="relative pl-14">
                                        <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-red-600 border-4 border-black z-10 flex items-center justify-center text-[10px] font-black text-white">
                                            {i + 1}
                                        </div>
                                        <Card className="bg-[#111] border-white/[0.05]">
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline" className="text-[10px] text-gray-500 border-white/10">
                                                        Wait {step.delay_days} days
                                                    </Badge>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500"><Pencil className="w-3 h-3" /></Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500"><Trash2 className="w-3 h-3" /></Button>
                                                    </div>
                                                </div>
                                                <h4 className="text-white font-bold text-sm mb-1">{step.email_subject}</h4>
                                                <div className="text-xs text-gray-500 line-clamp-2 font-mono">
                                                    {step.email_content.replace(/<[^>]*>?/gm, '')}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                                {steps.length === 0 && <p className="text-center py-12 text-gray-600">No steps added yet.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] flex items-center justify-center border border-dashed border-white/5 rounded-[3rem]">
                            <p className="text-gray-600 font-medium">Select a sequence to manage its steps</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isSeqDialogOpen} onOpenChange={setIsSeqDialogOpen}>
                <DialogContent className="bg-[#0c0c0c] border-white/10 text-white">
                    <DialogHeader><DialogTitle>New Sequence</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Sequence Name</Label>
                            <Input value={seqFormData.name} onChange={e => setSeqFormData({...seqFormData, name: e.target.value})} className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={seqFormData.description} onChange={e => setSeqFormData({...seqFormData, description: e.target.value})} className="bg-white/5 border-white/10" />
                        </div>
                        <Button onClick={() => createSeqMutation.mutate(seqFormData)} className="w-full bg-red-600">Create Sequence</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
                <DialogContent className="bg-[#0c0c0c] border-white/10 text-white max-w-2xl">
                    <DialogHeader><DialogTitle>Add Journey Step</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Wait Delay (Days)</Label>
                                <Input type="number" value={stepFormData.delay_days} onChange={e => setStepFormData({...stepFormData, delay_days: parseInt(e.target.value)})} className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Step Order</Label>
                                <Input type="number" value={stepFormData.step_order} onChange={e => setStepFormData({...stepFormData, step_order: parseInt(e.target.value)})} className="bg-white/5 border-white/10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email Subject</Label>
                            <Input value={stepFormData.email_subject} onChange={e => setStepFormData({...stepFormData, email_subject: e.target.value})} className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Content (HTML)</Label>
                            <Textarea value={stepFormData.email_content} onChange={e => setStepFormData({...stepFormData, email_content: e.target.value})} rows={10} className="bg-white/5 border-white/10 font-mono text-sm" />
                        </div>
                        <Button onClick={() => createStepMutation.mutate(stepFormData)} className="w-full bg-red-600">Save Step</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminDripAutomationsPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_DripAutomations />
            </AdminLayout>
        </AdminGuard>
    );
}
