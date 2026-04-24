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
import { Plus, Pencil, Trash2, Loader2, Mail, Eye, Save, Code } from 'lucide-react';
import { toast } from 'sonner';

function Admin_EmailTemplates() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        content: '',
        category: 'marketing',
        variables: ['{{name}}', '{{email}}', '{{company}}']
    });

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['admin-email-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch('/api/email/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create template');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-email-templates']);
            resetForm();
            toast.success('Template created successfully');
        },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch('/api/email/templates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update template');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-email-templates']);
            resetForm();
            toast.success('Template updated successfully');
        },
        onError: (e) => toast.error(e.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/email/templates?id=${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete template');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-email-templates']);
            toast.success('Template deleted');
        },
        onError: (e) => toast.error(e.message),
    });

    const resetForm = () => {
        setFormData({
            name: '',
            subject: '',
            content: '',
            category: 'marketing',
            variables: ['{{name}}', '{{email}}', '{{company}}']
        });
        setEditingTemplate(null);
        setIsDialogOpen(false);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name || '',
            subject: template.subject || '',
            content: template.content || '',
            category: template.category || 'marketing',
            variables: template.variables || ['{{name}}', '{{email}}', '{{company}}']
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, ...formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const insertVariable = (variable) => {
        setFormData({ ...formData, content: formData.content + ' ' + variable });
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Email Templates</h1>
                    <p className="text-gray-500 mt-1">Design reusable email templates for campaigns and automations</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" /> New Template
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                </div>
            ) : templates.length === 0 ? (
                <Card className="bg-[#111] border-white/[0.06]">
                    <CardContent className="py-12 text-center text-gray-500">
                        <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>No templates found. Start by creating one.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="bg-[#111] border-white/[0.06] hover:border-red-500/30 transition-all group">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 capitalize">
                                        {template.category}
                                    </Badge>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(template)}>
                                            <Pencil className="w-4 h-4 text-gray-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(template.id) }}>
                                            <Trash2 className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-white mt-2">{template.name}</CardTitle>
                                <p className="text-xs text-gray-500 truncate mt-1">Subject: {template.subject}</p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-600">Created {new Date(template.created_at).toLocaleDateString()}</span>
                                    <Button variant="outline" size="sm" className="text-xs border-white/[0.06] hover:bg-white/[0.04]" onClick={() => { setEditingTemplate(template); setIsPreviewOpen(true); }}>
                                        <Eye className="w-3 h-3 mr-1" /> Preview
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="bg-[#111] border-white/[0.06] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Email Template'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400 mb-1.5 block">Template Name *</Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    className="bg-[#1a1a1a] border-white/[0.06] focus:border-red-500" 
                                    placeholder="e.g., Welcome Email"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-400 mb-1.5 block">Category</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                                    <SelectTrigger className="bg-[#1a1a1a] border-white/[0.06]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="transactional">Transactional</SelectItem>
                                        <SelectItem value="outreach">Outreach</SelectItem>
                                        <SelectItem value="support">Support</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-gray-400 mb-1.5 block">Email Subject *</Label>
                            <Input 
                                value={formData.subject} 
                                onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                                required 
                                className="bg-[#1a1a1a] border-white/[0.06] focus:border-red-500" 
                                placeholder="Subject line with {{name}}"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Label className="text-gray-400">Email Content (HTML) *</Label>
                                <div className="flex gap-2">
                                    {formData.variables.map(v => (
                                        <button 
                                            key={v} 
                                            type="button" 
                                            onClick={() => insertVariable(v)}
                                            className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded hover:bg-red-500/20 border border-red-500/20"
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Textarea 
                                value={formData.content} 
                                onChange={(e) => setFormData({...formData, content: e.target.value})} 
                                rows={12} 
                                required 
                                className="bg-[#1a1a1a] border-white/[0.06] font-mono text-sm focus:border-red-500 min-h-[300px]" 
                                placeholder="<html><body><h1>Hello {{name}}!</h1></body></html>"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-red-600 hover:bg-red-700">
                                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                {editingTemplate ? 'Update Template' : 'Create Template'}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm} className="border-white/[0.06]">Cancel</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="bg-white text-black max-w-2xl p-0 overflow-hidden">
                    <div className="bg-gray-100 p-4 border-b">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Preview</p>
                        <h2 className="text-lg font-bold mt-1">{editingTemplate?.subject}</h2>
                    </div>
                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: editingTemplate?.content }} />
                    </div>
                    <div className="bg-gray-50 p-4 border-t flex justify-end">
                        <Button onClick={() => setIsPreviewOpen(false)} className="bg-black text-white hover:bg-gray-800">Close Preview</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminEmailTemplatesPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_EmailTemplates />
            </AdminLayout>
        </AdminGuard>
    );
}
