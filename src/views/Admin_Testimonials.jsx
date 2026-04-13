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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Star, StarOff } from 'lucide-react';
import { toast } from 'sonner';

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
        onSuccess: () => { queryClient.invalidateQueries(['admin-testimonials']); resetForm(); toast.success('Testimonial added'); },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase.from('testimonials').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-testimonials']); resetForm(); toast.success('Testimonial updated'); },
        onError: (e) => toast.error(e.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('testimonials').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-testimonials']); toast.success('Testimonial deleted'); },
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
        toast.success(`Testimonial ${newStatus === 'approved' ? 'approved' : 'unapproved'}`);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Testimonials</h1>
                    <p className="text-gray-500 mt-1">Manage client testimonials displayed on your website</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
            ) : testimonials.length === 0 ? (
                <Card className="bg-[#111] border-white/[0.06]">
                    <CardContent className="py-12 text-center text-gray-500">
                        <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="mb-4">No testimonials yet</p>
                        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-600 hover:bg-red-700">
                            <Plus className="w-4 h-4 mr-2" /> Add First Testimonial
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((item) => (
                        <Card key={item.id} className="bg-[#111] border-white/[0.06]">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-base">{item.customer_name}</CardTitle>
                                        <p className="text-xs text-gray-500">{item.customer_company}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(item)} title={item.status === 'approved' ? 'Unapprove' : 'Approve'}>
                                            {item.status === 'approved' ? <Star className="w-4 h-4 text-yellow-500" /> : <StarOff className="w-4 h-4 text-gray-500" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                            <Pencil className="w-4 h-4 text-gray-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(item.id); }}>
                                            <Trash2 className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-300 text-sm italic mb-3">&ldquo;{item.content}&rdquo;</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(i => (
                                            <Star key={i} className={`w-3 h-3 ${i <= item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                                        ))}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        item.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="bg-[#111] border-white/[0.06] text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Client Name *</Label>
                                <Input value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} required className="bg-[#1a1a1a] border-white/[0.06]" />
                            </div>
                            <div>
                                <Label className="text-gray-400">Company</Label>
                                <Input value={formData.customer_company} onChange={(e) => setFormData({...formData, customer_company: e.target.value})} className="bg-[#1a1a1a] border-white/[0.06]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Job Title</Label>
                                <Input value={formData.customer_title} onChange={(e) => setFormData({...formData, customer_title: e.target.value})} className="bg-[#1a1a1a] border-white/[0.06]" />
                            </div>
                            <div>
                                <Label className="text-gray-400">Service</Label>
                                <Input value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} className="bg-[#1a1a1a] border-white/[0.06]" placeholder="e.g. social_media, web_app, ai_automation" />
                            </div>
                        </div>
                        <div>
                            <Label className="text-gray-400">Testimonial *</Label>
                            <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={4} required className="bg-[#1a1a1a] border-white/[0.06]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Rating</Label>
                                <Select value={String(formData.rating)} onValueChange={(v) => setFormData({...formData, rating: parseInt(v)})}>
                                    <SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[5,4,3,2,1].map(n => <SelectItem key={n} value={String(n)}>{'★'.repeat(n)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-gray-400">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                    <SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-gray-400">Featured on Homepage</Label>
                            <Switch checked={formData.featured} onCheckedChange={(v) => setFormData({...formData, featured: v})} />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-red-600 hover:bg-red-700">
                                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {editingItem ? 'Update' : 'Add'} Testimonial
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm} className="border-white/[0.06]">Cancel</Button>
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
