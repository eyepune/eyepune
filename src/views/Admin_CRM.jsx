'use client';

import React, { useState, useRef } from 'react';
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
import { Plus, Pencil, Trash2, Loader2, Search, Phone, Mail, Users, Target, Activity, Filter, CheckCircle2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    qualified: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    proposal_sent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    negotiation: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    lost: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function Admin_CRM() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
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

    // Derived stats
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === 'won').length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const winRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase.from('leads').insert([data]).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-leads'] }); resetForm(); toast.success('Lead added successfully'); },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase.from('leads').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-leads'] }); resetForm(); toast.success('Lead updated successfully'); },
        onError: (e) => toast.error(e.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('leads').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-leads'] }); toast.success('Lead deleted'); },
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

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const content = event.target.result;
                let parsedData = [];

                if (file.name.endsWith('.json')) {
                    const parsed = JSON.parse(content);
                    parsedData = Array.isArray(parsed) ? parsed : [parsed];
                } else if (file.name.endsWith('.csv')) {
                    // Simple CSV parser that handles basic quotes
                    const lines = content.split(/\r?\n/).filter(line => line.trim());
                    if (lines.length < 2) throw new Error("CSV must have headers and at least one row");
                    
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
                    
                    for (let i = 1; i < lines.length; i++) {
                        // Regex to handle commas inside quotes
                        const matches = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
                        const values = matches.map(val => val.replace(/(^"|"$)/g, '').trim());
                        
                        const obj = {};
                        headers.forEach((header, index) => {
                            if (values[index] !== undefined && values[index] !== '') {
                                obj[header] = values[index];
                            }
                        });
                        parsedData.push(obj);
                    }
                } else {
                    throw new Error("Unsupported file format. Please use .csv or .json");
                }

                // Clean data to only include valid columns and add defaults
                const validColumns = ['full_name', 'email', 'phone', 'company', 'source', 'status', 'notes'];
                const validStatuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'];
                const validSources = ['website', 'referral', 'social_media', 'google_ads', 'manual'];
                
                const cleanedData = parsedData.map(row => {
                    const cleanRow = { source: 'manual', status: 'new' };
                    validColumns.forEach(col => {
                        let val = row[col];
                        if (!val) {
                            if (col === 'full_name') val = row['name'] || row['first name'] || row['first_name'];
                        }
                        if (val) {
                            val = String(val).substring(0, 255); // Safety trim
                            if (col === 'status' && !validStatuses.includes(val.toLowerCase())) val = 'new';
                            if (col === 'source' && !validSources.includes(val.toLowerCase())) val = 'manual';
                            if (col === 'status' || col === 'source') val = val.toLowerCase();
                            cleanRow[col] = val;
                        }
                    });
                    // Ensure required fields
                    if (!cleanRow.full_name) cleanRow.full_name = 'Unknown Lead';
                    return cleanRow;
                });

                if (cleanedData.length === 0) throw new Error("No valid data found in file");

                const { error } = await supabase.from('leads').insert(cleanedData);
                if (error) throw error;

                toast.success(`Successfully imported ${cleanedData.length} leads`);
                queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            } catch (err) {
                console.error("Upload error:", err);
                toast.error(`Import failed: ${err.message}`);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-gray-300">Customer Relationship Management</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Lead Pipeline</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Track, manage, and convert your incoming leads into successful clients.
                    </p>
                </div>
                <div className="flex gap-3">
                    <input type="file" ref={fileInputRef} hidden accept=".csv,.json" onChange={handleFileUpload} />
                    <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        variant="outline"
                        disabled={isUploading}
                        className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5 h-10 shadow-lg"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Bulk Import
                    </Button>
                    <Button 
                        onClick={() => { resetForm(); setIsDialogOpen(true); }} 
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border-0 h-10"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add New Lead
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Leads</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{totalLeads}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Won Accounts</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{wonLeads}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Win Rate</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{winRate}%</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Target className="w-6 h-6 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 flex flex-col relative z-10 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.01] px-6 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-lg font-semibold flex items-center gap-2.5">
                            <Activity className="w-5 h-5 text-gray-400" /> Pipeline Database
                        </CardTitle>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative group w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, email, company..."
                                    className="pl-10 bg-[#111] border-white/10 focus:border-blue-500/50 text-white placeholder:text-gray-600 transition-all"
                                />
                            </div>
                            <div className="relative group w-full sm:w-44">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="pl-10 bg-[#111] border-white/10 focus:border-blue-500/50 text-white transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="all">All Statuses</SelectItem>
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
                    </div>
                </CardHeader>
                
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                            <p className="text-gray-400 text-sm">Loading pipeline data...</p>
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                <Search className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white">No leads found</h3>
                            <p className="text-gray-500 text-sm mt-1 max-w-sm">Try adjusting your search or filter parameters to find what you're looking for.</p>
                            <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="mt-4 border-white/10 text-gray-300 hover:bg-white/5">
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-medium border-b border-white/5">Lead Details</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5">Contact Info</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5">Source</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5">Status</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10 shadow-inner flex-shrink-0">
                                                        {lead.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{lead.full_name}</p>
                                                        {lead.company && <p className="text-xs text-gray-500 mt-0.5">{lead.company}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    {lead.email && (
                                                        <a href={`mailto:${lead.email}`} className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
                                                            <Mail className="w-3.5 h-3.5" /> <span className="truncate max-w-[150px]">{lead.email}</span>
                                                        </a>
                                                    )}
                                                    {lead.phone && (
                                                        <a href={`tel:${lead.phone}`} className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
                                                            <Phone className="w-3.5 h-3.5" /> <span>{lead.phone}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="bg-white/[0.03] text-gray-400 border-white/10 uppercase tracking-wide text-[10px] font-medium">
                                                    {lead.source?.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={cn(
                                                    "border font-medium px-2.5 py-1 text-[10px] uppercase tracking-wider",
                                                    STATUS_COLORS[lead.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                )}>
                                                    {lead.status?.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleEdit(lead)}
                                                        className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => { if (confirm('Are you sure you want to delete this lead?')) deleteMutation.mutate(lead.id); }}
                                                        className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
                <DialogContent className="bg-[#0c0c0c]/95 backdrop-blur-2xl border-white/10 text-white max-w-2xl p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
                    
                    <DialogHeader className="p-6 pb-4 border-b border-white/5 bg-white/[0.01]">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {editingLead ? <Pencil className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                            {editingLead ? 'Edit Lead Profile' : 'Create New Lead'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Full Name <span className="text-red-500">*</span></Label>
                                <Input 
                                    value={formData.full_name} 
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                                    required 
                                    placeholder="Jane Doe"
                                    className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Email Address</Label>
                                <Input 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    placeholder="jane@company.com"
                                    className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Phone Number</Label>
                                <Input 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                    placeholder="+1 (555) 000-0000"
                                    className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Company</Label>
                                <Input 
                                    value={formData.company} 
                                    onChange={(e) => setFormData({...formData, company: e.target.value})} 
                                    placeholder="Acme Corp"
                                    className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Lead Source</Label>
                                <Select value={formData.source} onValueChange={(v) => setFormData({...formData, source: v})}>
                                    <SelectTrigger className="bg-[#111] border-white/10 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="website">Website</SelectItem>
                                        <SelectItem value="referral">Referral</SelectItem>
                                        <SelectItem value="social_media">Social Media</SelectItem>
                                        <SelectItem value="google_ads">Google Ads</SelectItem>
                                        <SelectItem value="manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Pipeline Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                    <SelectTrigger className="bg-[#111] border-white/10 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
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

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Internal Notes</Label>
                            <Textarea 
                                value={formData.notes} 
                                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                                rows={4} 
                                placeholder="Add any relevant context, next steps, or conversation notes here..."
                                className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors resize-none custom-scrollbar" 
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={resetForm} 
                                className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={createMutation.isPending || updateMutation.isPending} 
                                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border-0 px-8"
                            >
                                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {editingLead ? 'Save Changes' : 'Create Lead'}
                            </Button>
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
