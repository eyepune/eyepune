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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Send, Mail, Users, Eye } from 'lucide-react';
import { toast } from 'sonner';

function Admin_EmailCampaigns() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [sendingId, setSendingId] = useState(null);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '', subject: '', content: '', status: 'draft', target_audience: 'all',
    });

    const { data: campaigns = [], isLoading } = useQuery({
        queryKey: ['admin-campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const { data: leadCount } = useQuery({
        queryKey: ['lead-count'],
        queryFn: async () => {
            const { count, error } = await supabase.from('leads').select('*', { count: 'exact', head: true });
            if (error) throw error;
            return count || 0;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase.from('campaigns').insert([data]).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-campaigns']); resetForm(); toast.success('Campaign created'); },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase.from('campaigns').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-campaigns']); resetForm(); toast.success('Campaign updated'); },
        onError: (e) => toast.error(e.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-campaigns']); toast.success('Campaign deleted'); },
        onError: (e) => toast.error(e.message),
    });

    const handleSend = async (campaign) => {
        if (!confirm(`Send "${campaign.name}" to all leads?`)) return;
        setSendingId(campaign.id);
        try {
            // Fetch all lead emails
            const { data: leads } = await supabase.from('leads').select('email').not('email', 'is', null);
            const emails = leads?.map(l => l.email).filter(Boolean) || [];

            if (emails.length === 0) {
                toast.error('No leads with email addresses found');
                return;
            }

            // Send via API route
            const res = await fetch('/api/email/send-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: campaign.subject,
                    html: campaign.content,
                    recipients: emails,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Send failed');

            // Update campaign status
            await supabase.from('campaigns').update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                recipient_count: emails.length,
            }).eq('id', campaign.id);

            queryClient.invalidateQueries(['admin-campaigns']);
            toast.success(`Email sent to ${emails.length} leads`);
        } catch (error) {
            toast.error('Failed to send: ' + error.message);
        } finally {
            setSendingId(null);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', subject: '', content: '', status: 'draft', target_audience: 'all' });
        setEditingCampaign(null);
        setIsDialogOpen(false);
    };

    const handleEdit = (campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            name: campaign.name || '', subject: campaign.subject || '',
            content: campaign.content || '', status: campaign.status || 'draft',
            target_audience: campaign.target_audience || 'all',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCampaign) {
            updateMutation.mutate({ id: editingCampaign.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Email Marketing</h1>
                    <p className="text-gray-500 mt-1">Create and send bulk email campaigns to your leads</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-white/[0.06] text-gray-400">
                        <Users className="w-3 h-3 mr-1" /> {leadCount || 0} leads
                    </Badge>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" /> New Campaign
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
            ) : campaigns.length === 0 ? (
                <Card className="bg-[#111] border-white/[0.06]">
                    <CardContent className="py-12 text-center text-gray-500">
                        <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="mb-4">No email campaigns yet</p>
                        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-600 hover:bg-red-700">
                            <Plus className="w-4 h-4 mr-2" /> Create Your First Campaign
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {campaigns.map((campaign) => (
                        <Card key={campaign.id} className="bg-[#111] border-white/[0.06]">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-white font-semibold text-lg">{campaign.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                campaign.status === 'draft' ? 'bg-gray-500/10 text-gray-400' :
                                                campaign.status === 'sent' ? 'bg-green-500/10 text-green-400' :
                                                'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-1">Subject: {campaign.subject}</p>
                                        {campaign.sent_at && (
                                            <p className="text-xs text-gray-600">
                                                Sent {new Date(campaign.sent_at).toLocaleString()} • {campaign.recipient_count || 0} recipients
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {campaign.status === 'draft' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleSend(campaign)}
                                                disabled={sendingId === campaign.id}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {sendingId === campaign.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                                                Send
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(campaign)}>
                                            <Pencil className="w-4 h-4 text-gray-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(campaign.id); }}>
                                            <Trash2 className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="bg-[#111] border-white/[0.06] text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'New Email Campaign'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Campaign Name *</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="bg-[#1a1a1a] border-white/[0.06]" />
                            </div>
                            <div>
                                <Label className="text-gray-400">Target Audience</Label>
                                <Select value={formData.target_audience} onValueChange={(v) => setFormData({...formData, target_audience: v})}>
                                    <SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Leads</SelectItem>
                                        <SelectItem value="new">New Leads Only</SelectItem>
                                        <SelectItem value="qualified">Qualified Leads</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-gray-400">Email Subject *</Label>
                            <Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required className="bg-[#1a1a1a] border-white/[0.06]" />
                        </div>
                        <div>
                            <Label className="text-gray-400">Email Content (HTML) *</Label>
                            <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={10} required className="bg-[#1a1a1a] border-white/[0.06] font-mono text-sm" placeholder="<h1>Hello!</h1><p>Your email content here...</p>" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-red-600 hover:bg-red-700">
                                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {editingCampaign ? 'Update' : 'Create'} Campaign
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm} className="border-white/[0.06]">Cancel</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminEmailCampaignsPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_EmailCampaigns />
            </AdminLayout>
        </AdminGuard>
    );
}
