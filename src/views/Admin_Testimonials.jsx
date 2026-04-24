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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Star, StarOff, Quote, MessageSquareQuote, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function Admin_Testimonials() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        customer_name: '', customer_company: '', customer_title: '', content: '', rating: 5, featured: false, status: 'pending', service: '',
    });

    const { data: testimonials = [], isLoading } = useQuery({
        queryKey: ['admin-testimonials'],
        queryFn: async () => {
            const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase.from('testimonials').insert([data]).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-testimonials']); resetForm(); toast.success('Testimonial added successfully'); },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase.from('testimonials').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-testimonials']); resetForm(); toast.success('Testimonial updated successfully'); },
        onError: (e) => toast.error(e.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('testimonials').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-testimonials']); toast.success('Testimonial deleted permanently'); },
        onError: (e) => toast.error(e.message),
    });

    const resetForm = () => {
        setFormData({ customer_name: '', customer_company: '', customer_title: '', content: '', rating: 5, featured: false, status: 'pending', service: '' });
        setEditingItem(null);
        setIsDialogOpen(false);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            customer_name: item.customer_name || '', customer_company: item.customer_company || '',
            customer_title: item.customer_title || '', content: item.content || '', rating: item.rating || 5,
            featured: item.featured || false, status: item.status || 'pending', service: item.service || '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const toggleStatus = async (item) => {
        const newStatus = item.status === 'approved' ? 'pending' : 'approved';
        const { error } = await supabase.from('testimonials').update({ status: newStatus }).eq('id', item.id);
        if (error) { toast.error(error.message); return; }
        queryClient.invalidateQueries(['admin-testimonials']);
        toast.success(`Testimonial ${newStatus === 'approved' ? 'approved for display' : 'moved to pending'}`);
    };

    const approvedCount = testimonials.filter(t => t.status === 'approved').length;
    const featuredCount = testimonials.filter(t => t.featured).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-xs font-medium text-gray-300">Social Proof</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Client Testimonials</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Manage, review, and curate client feedback to display on your website.
                    </p>
                </div>
                <Button 
                    onClick={() => { resetForm(); setIsDialogOpen(true); }} 
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white shadow-lg shadow-yellow-500/20 border-0 h-10"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Feedback</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{testimonials.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <MessageSquareQuote className="w-6 h-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Approved & Live</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{approvedCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Featured items</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{featuredCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-4" />
                    <p className="text-gray-400 text-sm">Loading testimonials...</p>
                </div>
            ) : testimonials.length === 0 ? (
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative z-10">
                    <CardContent className="py-24 text-center text-gray-500 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                            <Star className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No testimonials yet</h3>
                        <p className="mb-8 max-w-md mx-auto">Collect positive feedback from your clients to build trust and authority on your website.</p>
                        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border-0 shadow-lg shadow-yellow-500/20">
                            <Plus className="w-4 h-4 mr-2" /> Add First Testimonial
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {testimonials.map((item) => (
                        <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
                            <Card className={cn(
                                "bg-[#0c0c0c]/80 backdrop-blur-xl h-full flex flex-col relative overflow-hidden transition-all duration-300",
                                item.featured ? "border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : "border-white/5 hover:border-white/10"
                            )}>
                                {item.featured && (
                                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 w-16 h-16 rotate-45 flex items-end justify-center pb-1">
                                            <Star className="w-3.5 h-3.5 fill-yellow-500" />
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
                                    <div className="flex items-start justify-between">
                                        <div className="pr-8">
                                            <CardTitle className="text-white text-base font-semibold group-hover:text-yellow-400 transition-colors">
                                                {item.customer_name}
                                            </CardTitle>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {item.customer_title && <span>{item.customer_title}</span>}
                                                {item.customer_title && item.customer_company && <span> at </span>}
                                                {item.customer_company && <span className="font-medium text-gray-400">{item.customer_company}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 flex-grow flex flex-col">
                                    <Quote className="w-6 h-6 text-white/10 mb-2" />
                                    <p className="text-gray-300 text-sm italic mb-6 flex-grow line-clamp-4 relative z-10">
                                        "{item.content}"
                                    </p>
                                    
                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                            <div className="flex gap-0.5">
                                                {[1,2,3,4,5].map(i => (
                                                    <Star key={i} className={cn("w-3.5 h-3.5", i <= item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600')} />
                                                ))}
                                            </div>
                                            <Badge className={cn("text-[10px] uppercase tracking-wider font-semibold border px-2 py-0.5",
                                                item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            )}>
                                                {item.status}
                                            </Badge>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => toggleStatus(item)} 
                                                className={cn("flex-1 h-9 transition-colors", item.status === 'approved' ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10" : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10")}
                                            >
                                                {item.status === 'approved' ? <><StarOff className="w-3.5 h-3.5 mr-2" /> Unapprove</> : <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Approve</>}
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(item)} className="h-9 w-9 border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => { if (confirm('Are you sure you want to permanently delete this testimonial?')) deleteMutation.mutate(item.id); }} className="h-9 w-9 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="bg-[#0c0c0c]/95 backdrop-blur-2xl border-white/10 text-white max-w-xl p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
                    
                    <DialogHeader className="p-6 pb-2 border-b border-white/5 bg-white/[0.01]">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {editingItem ? <Pencil className="w-5 h-5 text-yellow-500" /> : <Plus className="w-5 h-5 text-yellow-500" />}
                            {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {editingItem ? 'Modify the details of this client feedback.' : 'Add new feedback from a client to display on the site.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Client Name <span className="text-yellow-500">*</span></Label>
                                <Input value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} required placeholder="John Doe" className="bg-[#111] border-white/10 focus:border-yellow-500/50 transition-colors h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Company Name</Label>
                                <Input value={formData.customer_company} onChange={(e) => setFormData({...formData, customer_company: e.target.value})} placeholder="Acme Corp" className="bg-[#111] border-white/10 focus:border-yellow-500/50 transition-colors h-11" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Job Title</Label>
                                <Input value={formData.customer_title} onChange={(e) => setFormData({...formData, customer_title: e.target.value})} placeholder="CEO & Founder" className="bg-[#111] border-white/10 focus:border-yellow-500/50 transition-colors h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Related Service</Label>
                                <Input value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} className="bg-[#111] border-white/10 focus:border-yellow-500/50 transition-colors h-11" placeholder="e.g. web_development, seo" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Testimonial Content <span className="text-yellow-500">*</span></Label>
                            <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={4} required placeholder="Their amazing feedback..." className="bg-[#111] border-white/10 focus:border-yellow-500/50 transition-colors resize-none custom-scrollbar" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Rating (1-5)</Label>
                                <Select value={String(formData.rating)} onValueChange={(v) => setFormData({...formData, rating: parseInt(v)})}>
                                    <SelectTrigger className="bg-[#111] border-white/10 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        {[5,4,3,2,1].map(n => <SelectItem key={n} value={String(n)}>{'★'.repeat(n)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Visibility Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                    <SelectTrigger className="bg-[#111] border-white/10 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="pending">Pending Review</SelectItem>
                                        <SelectItem value="approved">Approved (Live)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="space-y-0.5">
                                <Label className="text-white font-medium text-sm">Feature on Homepage</Label>
                                <p className="text-xs text-gray-500">Highlighted prominently on the main landing page</p>
                            </div>
                            <Switch checked={formData.featured} onCheckedChange={(v) => setFormData({...formData, featured: v})} className="data-[state=checked]:bg-yellow-500" />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button type="button" variant="outline" onClick={resetForm} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white shadow-lg shadow-yellow-500/20 border-0 px-8">
                                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {editingItem ? 'Save Changes' : 'Publish Testimonial'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminTestimonialsPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Testimonials />
            </AdminLayout>
        </AdminGuard>
    );
}
