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
import { Plus, Pencil, Trash2, Loader2, Search, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS = {
    new: 'bg-blue-500/10 text-blue-400',
    contacted: 'bg-yellow-500/10 text-yellow-400',
    qualified: 'bg-orange-500/10 text-orange-400',
    proposal_sent: 'bg-purple-500/10 text-purple-400',
    negotiation: 'bg-pink-500/10 text-pink-400',
    won: 'bg-green-500/10 text-green-400',
    lost: 'bg-red-500/10 text-red-400',
};

function Admin_CRM() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', company: '',
        source: 'website', status: 'new', notes: '',
    });

    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['admin-leads', statusFilter],
        queryFn: async () => {
            let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (statusFilter !== 'all') query = query.eq('status', statusFilter);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
    });

    const filteredLeads = leads.filter(l =>
        l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase.from('leads').insert([data]).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-leads']); resetForm(); toast.success('Lead added'); },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase.from('leads').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-leads']); resetForm(); toast.success('Lead updated'); },
        onError: (e) => toast.error(e.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('leads').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-leads']); toast.success('Lead deleted'); },
        onError: (e) => toast.error(e.message),
    });

    const resetForm = () => {
        setFormData({ full_name: '', email: '', phone: '', company: '', source: 'website', status: 'new', notes: '' });
        setEditingLead(null);
        setIsDialogOpen(false);
    };

    const handleEdit = (lead) => {
        setEditingLead(lead);
        setFormData({
            full_name: lead.full_name || '', email: lead.email || '', phone: lead.phone || '',
            company: lead.company || '', source: lead.source || 'website', status: lead.status || 'new',
            notes: lead.notes || '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingLead) {
            updateMutation.mutate({ id: editingLead.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">CRM / Leads</h1>
                    <p className="text-gray-500 mt-1">Manage your leads and pipeline</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Lead
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search leads..."
                        className="pl-10 bg-[#111] border-white/[0.06] text-white"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-44 bg-[#111] border-white/[0.06] text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Leads Table */}
            <Card className="bg-[#111] border-white/[0.06]">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No leads found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Contact</th>
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Company</th>
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Source</th>
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                                        <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                            <td className="px-4 py-3 text-white font-medium">{lead.full_name}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    {lead.email && <span className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                                                    {lead.phone && <span className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-sm">{lead.company || '-'}</td>
                                            <td className="px-4 py-3 text-gray-400 text-sm capitalize">{lead.source?.replace('_', ' ')}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[lead.status] || 'bg-gray-500/10 text-gray-400'}`}>
                                                    {lead.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(lead)}>
                                                        <Pencil className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(lead.id); }}>
                                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="bg-[#111] border-white/[0.06] text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingLead ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Full Name *</Label>
                                <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required className="bg-[#1a1a1a] border-white/[0.06]" />
                            </div>
                            <div>
                                <Label className="text-gray-400">Email</Label>
                                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-[#1a1a1a] border-white/[0.06]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Phone</Label>
                                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-[#1a1a1a] border-white/[0.06]" />
                            </div>
                            <div>
                                <Label className="text-gray-400">Company</Label>
                                <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="bg-[#1a1a1a] border-white/[0.06]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Source</Label>
                                <Select value={formData.source} onValueChange={(v) => setFormData({...formData, source: v})}>
                                    <SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="website">Website</SelectItem>
                                        <SelectItem value="referral">Referral</SelectItem>
                                        <SelectItem value="social_media">Social Media</SelectItem>
                                        <SelectItem value="google_ads">Google Ads</SelectItem>
                                        <SelectItem value="manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-gray-400">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                    <SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="qualified">Qualified</SelectItem>
                                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                                        <SelectItem value="negotiation">Negotiation</SelectItem>
                                        <SelectItem value="won">Won</SelectItem>
                                        <SelectItem value="lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-gray-400">Notes</Label>
                            <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="bg-[#1a1a1a] border-white/[0.06]" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-red-600 hover:bg-red-700">
                                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {editingLead ? 'Update' : 'Add'} Lead
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm} className="border-white/[0.06]">Cancel</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminCRMPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_CRM />
            </AdminLayout>
        </AdminGuard>
    );
}
