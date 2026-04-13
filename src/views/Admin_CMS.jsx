import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminGuard from "@/components/admin/AdminGuard";
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, Sparkles } from 'lucide-react';
import AIContentAssistant from "@/components/cms/AIContentAssistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

function Admin_CMS() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPage, setSelectedPage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [formValues, setFormValues] = useState({});
    const queryClient = useQueryClient();

    const { data: pages = [], isLoading } = useQuery({
        queryKey: ['cms-pages'],
        queryFn: () => base44.entities.CMS_Page.list('-created_date', 100),
    });

    const createPageMutation = useMutation({
        mutationFn: (data) => base44.entities.CMS_Page.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
            setIsEditing(false);
            setSelectedPage(null);
        },
    });

    const updatePageMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.CMS_Page.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
            setIsEditing(false);
            setSelectedPage(null);
        },
    });

    const deletePageMutation = useMutation({
        mutationFn: (id) => base44.entities.CMS_Page.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
        },
    });

    const filteredPages = pages.filter(page =>
        page.page_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            page_name: formData.get('page_name'),
            slug: formData.get('slug'),
            title: formData.get('title'),
            content: formData.get('content'),
            meta_description: formData.get('meta_description'),
            meta_keywords: formData.get('meta_keywords'),
            og_image: formData.get('og_image'),
            page_type: formData.get('page_type'),
            published: formData.get('published') === 'true'
        };

        if (selectedPage) {
            updatePageMutation.mutate({ id: selectedPage.id, data });
        } else {
            createPageMutation.mutate(data);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Content Management</h1>
                        <p className="text-muted-foreground">Manage website pages and SEO</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowAIAssistant(true)} variant="outline">
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Assistant
                        </Button>
                        <Button onClick={() => { setSelectedPage(null); setIsEditing(true); }} className="bg-red-600 hover:bg-red-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Page
                        </Button>
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Search pages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPages.map((page) => (
                        <motion.div
                            key={page.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border rounded-xl p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold mb-1">{page.page_name}</h3>
                                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                                </div>
                                <Badge variant={page.published ? "default" : "secondary"}>
                                    {page.published ? 'Published' : 'Draft'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {page.meta_description || 'No description'}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setSelectedPage(page); setIsEditing(true); }}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deletePageMutation.mutate(page.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="flex justify-end mb-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setShowAIAssistant(true)}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI Help
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Page Name *</Label>
                                    <Input 
                                        name="page_name" 
                                        defaultValue={selectedPage?.page_name}
                                        value={formValues.page_name}
                                        onChange={(e) => setFormValues({...formValues, page_name: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div>
                                    <Label>URL Slug *</Label>
                                    <Input name="slug" defaultValue={selectedPage?.slug} required />
                                </div>
                            </div>
                            <div>
                                <Label>Page Title *</Label>
                                <Input 
                                    name="title" 
                                    defaultValue={selectedPage?.title}
                                    value={formValues.title}
                                    onChange={(e) => setFormValues({...formValues, title: e.target.value})}
                                    required 
                                />
                            </div>
                            <div>
                                <Label>Content</Label>
                                <Textarea 
                                    name="content" 
                                    defaultValue={selectedPage?.content}
                                    value={formValues.content}
                                    onChange={(e) => setFormValues({...formValues, content: e.target.value})}
                                    className="min-h-[200px]" 
                                />
                            </div>
                            <div>
                                <Label>Meta Description</Label>
                                <Textarea 
                                    name="meta_description" 
                                    defaultValue={selectedPage?.meta_description}
                                    value={formValues.meta_description}
                                    onChange={(e) => setFormValues({...formValues, meta_description: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Meta Keywords</Label>
                                <Input name="meta_keywords" defaultValue={selectedPage?.meta_keywords} />
                            </div>
                            <div>
                                <Label>OG Image URL</Label>
                                <Input name="og_image" defaultValue={selectedPage?.og_image} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Page Type</Label>
                                    <Select name="page_type" defaultValue={selectedPage?.page_type || 'other'}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="service">Service</SelectItem>
                                            <SelectItem value="blog">Blog</SelectItem>
                                            <SelectItem value="landing">Landing</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select name="published" defaultValue={selectedPage?.published ? 'true' : 'false'}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Published</SelectItem>
                                            <SelectItem value="false">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                                    {selectedPage ? 'Update' : 'Create'} Page
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <AIContentAssistant
                    open={showAIAssistant}
                    onClose={() => setShowAIAssistant(false)}
                    onApply={(data) => setFormValues({...formValues, ...data})}
                />
            </div>
        </div>
    );
}

export default function AdminCMSPage() {
    return (
        <AdminGuard>
            <Admin_CMS />
        </AdminGuard>
    );
}