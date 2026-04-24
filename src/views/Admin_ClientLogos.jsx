'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, Loader2, Link as LinkIcon, Building2, CheckCircle2, Globe } from "lucide-react";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const STORAGE_BUCKET = 'client-logos';

function Admin_ClientLogos() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLogo, setEditingLogo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'url'
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        company_name: '',
        logo_url: '',
        website_url: '',
        display_order: 0,
        is_active: true
    });

    const { data: logos = [], isLoading } = useQuery({
        queryKey: ['admin-client-logos'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('client_logos')
                .select('*')
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('client_logos')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-client-logos']);
            queryClient.invalidateQueries(['client-logos']);
            resetForm();
            toast.success('Logo added successfully');
        },
        onError: (error) => toast.error('Failed to add logo: ' + error.message)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase
                .from('client_logos')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-client-logos']);
            queryClient.invalidateQueries(['client-logos']);
            resetForm();
            toast.success('Logo updated successfully');
        },
        onError: (error) => toast.error('Failed to update logo: ' + error.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('client_logos')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-client-logos']);
            queryClient.invalidateQueries(['client-logos']);
            toast.success('Logo deleted permanently');
        },
        onError: (error) => toast.error('Failed to delete logo: ' + error.message)
    });

    const resetForm = () => {
        setFormData({
            company_name: '',
            logo_url: '',
            website_url: '',
            display_order: 0,
            is_active: true
        });
        setEditingLogo(null);
        setIsDialogOpen(false);
        setInputMode('upload');
    };

    const handleEdit = (logo) => {
        setEditingLogo(logo);
        setFormData({
            company_name: logo.company_name || '',
            logo_url: logo.logo_url || '',
            website_url: logo.website_url || '',
            display_order: logo.display_order || 0,
            is_active: logo.is_active
        });
        setInputMode(logo.logo_url?.startsWith('http') && !logo.logo_url.includes('supabase') ? 'url' : 'upload');
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingLogo) {
            updateMutation.mutate({ id: editingLogo.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload an image file (PNG, JPG, GIF, WebP, or SVG)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucketExists = buckets?.some(b => b.id === STORAGE_BUCKET);

            if (!bucketExists) {
                const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
                    public: true,
                    fileSizeLimit: 5242880,
                    allowedMimeTypes: allowedTypes,
                });
                if (createError) console.warn('Bucket creation warning:', createError.message);
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `logos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);

            setFormData({ ...formData, logo_url: urlData.publicUrl });
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const activeCount = logos.filter(l => l.is_active).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-gray-300">Brand Trust</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Client Logos</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Manage the partner and client logos displayed in the "Trusted By" sections.
                    </p>
                </div>
                <Button 
                    onClick={() => { resetForm(); setIsDialogOpen(true); }} 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border-0 h-10"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New Logo
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Partners</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{logos.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Active Displays</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{activeCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-400 text-sm">Loading client logos...</p>
                </div>
            ) : logos.length === 0 ? (
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative z-10">
                    <CardContent className="py-24 text-center text-gray-500 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                            <ImageIcon className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No logos uploaded yet</h3>
                        <p className="mb-8 max-w-md mx-auto">Upload client and partner logos to build authority and show who trusts your brand.</p>
                        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 shadow-lg shadow-blue-500/20">
                            <Plus className="w-4 h-4 mr-2" /> Add First Logo
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {logos.map((logo) => (
                        <motion.div key={logo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
                            <Card className={cn(
                                "bg-[#0c0c0c]/80 backdrop-blur-xl h-full flex flex-col relative overflow-hidden transition-all duration-300",
                                logo.is_active ? "border-white/5 hover:border-blue-500/30" : "border-white/5 opacity-60 grayscale hover:grayscale-0"
                            )}>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <CardHeader className="p-4 border-b border-white/5 bg-white/[0.01]">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white text-sm font-semibold truncate pr-2">
                                            {logo.company_name}
                                        </CardTitle>
                                        <Badge className={cn("text-[9px] uppercase tracking-wider font-semibold border px-1.5 py-0 shrink-0",
                                            logo.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        )}>
                                            {logo.is_active ? 'Active' : 'Hidden'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-4 flex-grow flex flex-col">
                                    <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center p-6 mb-4 border border-white/10 group-hover:border-white/20 transition-colors relative">
                                        {logo.logo_url ? (
                                            <img
                                                src={logo.logo_url}
                                                alt={logo.company_name}
                                                className={cn("max-w-full max-h-full object-contain filter", logo.is_active ? "brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" : "opacity-40")}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`items-center justify-center text-gray-500 ${logo.logo_url ? 'hidden' : 'flex'}`}>
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-[#111] px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-500 border border-white/10">
                                            #{logo.display_order}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto space-y-3">
                                        {logo.website_url ? (
                                            <a href={logo.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors truncate">
                                                <Globe className="w-3 h-3 mr-1.5 shrink-0" /> <span className="truncate">{logo.website_url.replace(/^https?:\/\//, '')}</span>
                                            </a>
                                        ) : (
                                            <div className="text-xs text-gray-600 flex items-center"><Globe className="w-3 h-3 mr-1.5 shrink-0" /> No link</div>
                                        )}
                                        
                                        <div className="flex gap-2 pt-3 border-t border-white/5">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(logo)} className="flex-1 h-8 border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                                                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => { if (confirm('Are you sure you want to permanently delete this logo?')) deleteMutation.mutate(logo.id); }} className="flex-1 h-8 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40">
                                                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
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
                <DialogContent className="bg-[#0c0c0c]/95 backdrop-blur-2xl border-white/10 text-white max-w-md p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
                    
                    <DialogHeader className="p-6 pb-2 border-b border-white/5 bg-white/[0.01]">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {editingLogo ? <Pencil className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                            {editingLogo ? 'Edit Client Logo' : 'Add Client Logo'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Upload a high-quality logo (preferably PNG/SVG with transparent background).
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Company Name <span className="text-blue-500">*</span></Label>
                            <Input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} placeholder="Acme Corp" required className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold flex justify-between">
                                Logo Image <span className="text-blue-500">*</span>
                            </Label>
                            
                            {formData.logo_url ? (
                                <div className="space-y-3">
                                    <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center p-6 border border-white/10 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-checkered-pattern opacity-10" />
                                        <img src={formData.logo_url} alt="Preview" className="max-w-full max-h-full object-contain relative z-10" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-sm">
                                            <Button type="button" variant="ghost" onClick={() => setFormData({ ...formData, logo_url: '' })} className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                                                <Trash2 className="w-5 h-5 mr-2" /> Remove Image
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-2 p-1 bg-[#111] border border-white/10 rounded-lg">
                                        <Button type="button" variant={inputMode === 'upload' ? 'default' : 'ghost'} size="sm" onClick={() => setInputMode('upload')} className={cn("flex-1 h-8", inputMode === 'upload' ? "bg-white/10 text-white shadow-sm hover:bg-white/15" : "text-gray-400 hover:text-white")}>
                                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload File
                                        </Button>
                                        <Button type="button" variant={inputMode === 'url' ? 'default' : 'ghost'} size="sm" onClick={() => setInputMode('url')} className={cn("flex-1 h-8", inputMode === 'url' ? "bg-white/10 text-white shadow-sm hover:bg-white/15" : "text-gray-400 hover:text-white")}>
                                            <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> Image URL
                                        </Button>
                                    </div>

                                    {inputMode === 'upload' ? (
                                        <div className="border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-colors rounded-xl p-8 text-center bg-white/[0.01]">
                                            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml" onChange={handleFileUpload} disabled={uploading} className="hidden" id="logo-upload" />
                                            <label htmlFor="logo-upload" className={cn("cursor-pointer flex flex-col items-center", uploading && "pointer-events-none")}>
                                                {uploading ? (
                                                    <Loader2 className="w-10 h-10 mb-3 animate-spin text-blue-500" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 text-blue-500">
                                                        <Upload className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <p className="text-sm font-medium text-white mb-1">
                                                    {uploading ? 'Uploading...' : 'Click to browse files'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, SVG, WebP (Max 5MB)
                                                </p>
                                            </label>
                                        </div>
                                    ) : (
                                        <div>
                                            <Input type="url" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://example.com/logo.png" className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Website URL (Optional)</Label>
                            <Input value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} placeholder="https://example.com" type="url" className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Display Order</Label>
                                <Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" />
                            </div>
                            <div className="flex flex-col justify-end pb-2">
                                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                                    <Label className="text-white text-sm font-medium">Visible on Site</Label>
                                    <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} className="data-[state=checked]:bg-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button type="button" variant="outline" onClick={resetForm} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!formData.company_name || !formData.logo_url || isPending || uploading} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 border-0 px-8">
                                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {editingLogo ? 'Save Changes' : 'Publish Logo'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminClientLogosPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_ClientLogos />
            </AdminLayout>
        </AdminGuard>
    );
}
