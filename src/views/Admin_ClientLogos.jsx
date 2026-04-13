import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminGuard from "@/components/admin/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, Loader2, Link } from "lucide-react";
import { toast } from 'sonner';

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

    // Fetch all client logos (admin view — uses auth token, RLS allows admin full access)
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

    // Create mutation
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
        onError: (error) => {
            toast.error('Failed to add logo: ' + error.message);
        }
    });

    // Update mutation
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
        onError: (error) => {
            toast.error('Failed to update logo: ' + error.message);
        }
    });

    // Delete mutation
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
            toast.success('Logo deleted');
        },
        onError: (error) => {
            toast.error('Failed to delete logo: ' + error.message);
        }
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
        setInputMode(logo.logo_url ? 'url' : 'upload');
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

    // Upload file directly to Supabase Storage (uses auth token, RLS allows admin uploads)
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload an image file (PNG, JPG, GIF, WebP, or SVG)');
            return;
        }
        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            // Ensure bucket exists (create if not)
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucketExists = buckets?.some(b => b.id === STORAGE_BUCKET);

            if (!bucketExists) {
                const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
                    public: true,
                    fileSizeLimit: 5242880,
                    allowedMimeTypes: allowedTypes,
                });
                if (createError) {
                    console.warn('Bucket creation warning:', createError.message);
                    // Bucket might already exist due to race condition, continue anyway
                }
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `logos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get public URL
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

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Client Logos</h1>
                        <p className="text-muted-foreground mt-1">Manage client logos displayed on your website</p>
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Logo
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : logos.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="mb-4">No client logos added yet</p>
                            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Logo
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {logos.map((logo) => (
                            <Card key={logo.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{logo.company_name}</CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(logo)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    if (confirm('Delete this logo?')) {
                                                        deleteMutation.mutate(logo.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-square bg-white rounded-lg flex items-center justify-center p-4 mb-4 border">
                                        {logo.logo_url ? (
                                            <img
                                                src={logo.logo_url}
                                                alt={logo.company_name}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`items-center justify-center text-muted-foreground text-sm ${logo.logo_url ? 'hidden' : 'flex'}`}>
                                            <ImageIcon className="w-8 h-8 opacity-30" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <span className={logo.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                                                {logo.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Order:</span>
                                            <span>{logo.display_order}</span>
                                        </div>
                                        {logo.website_url && (
                                            <div className="pt-2 border-t">
                                                <a
                                                    href={logo.website_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Visit Website
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingLogo ? 'Edit Client Logo' : 'Add Client Logo'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Company Name *</Label>
                                <Input
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    placeholder="Enter company name"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Logo Image *</Label>
                                {formData.logo_url ? (
                                    <div className="space-y-2">
                                        <div className="aspect-square bg-white rounded-lg flex items-center justify-center p-4 border">
                                            <img
                                                src={formData.logo_url}
                                                alt="Preview"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, logo_url: '' })}
                                            className="w-full"
                                        >
                                            Change Image
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Toggle between upload and URL */}
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={inputMode === 'upload' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setInputMode('upload')}
                                                className="flex-1"
                                            >
                                                <Upload className="w-4 h-4 mr-1" /> Upload File
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={inputMode === 'url' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setInputMode('url')}
                                                className="flex-1"
                                            >
                                                <Link className="w-4 h-4 mr-1" /> Paste URL
                                            </Button>
                                        </div>

                                        {inputMode === 'upload' ? (
                                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                    className="hidden"
                                                    id="logo-upload"
                                                />
                                                <label htmlFor="logo-upload" className="cursor-pointer">
                                                    {uploading ? (
                                                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                    )}
                                                    <p className="text-sm text-muted-foreground">
                                                        {uploading ? 'Uploading...' : 'Click to upload logo'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        PNG, JPG, GIF, WebP, or SVG (max 5MB)
                                                    </p>
                                                </label>
                                            </div>
                                        ) : (
                                            <div>
                                                <Input
                                                    type="url"
                                                    value={formData.logo_url}
                                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                                    placeholder="https://example.com/logo.png"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Paste a direct link to the logo image
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Website URL (Optional)</Label>
                                <Input
                                    value={formData.website_url}
                                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                    placeholder="https://example.com"
                                    type="url"
                                />
                            </div>

                            <div>
                                <Label>Display Order</Label>
                                <Input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>Active</Label>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="submit"
                                    disabled={!formData.company_name || !formData.logo_url || isPending}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    {isPending ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                    ) : (
                                        editingLogo ? 'Update Logo' : 'Add Logo'
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function AdminClientLogosPage() {
    return (
        <AdminGuard>
            <Admin_ClientLogos />
        </AdminGuard>
    );
}
