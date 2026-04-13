import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Sparkles, Edit, Trash2, Loader2, Copy, Star, Lightbulb } from 'lucide-react';

export default function TemplateManager({ documentType }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [formData, setFormData] = useState({
        template_name: '',
        template_description: '',
        document_type: documentType || 'contract',
        template_data: {
            contract_type: '',
            contract_category: 'client',
            default_payment_terms: '',
            default_scope: '',
            default_deliverables: '',
            default_terms: ''
        },
        is_default: false
    });

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['templates', documentType],
        queryFn: async () => {
            const filters = documentType ? { document_type: documentType } : {};
            return await base44.entities.DocumentTemplate.filter(filters);
        }
    });

    const createTemplateMutation = useMutation({
        mutationFn: (data) => base44.entities.DocumentTemplate.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['templates']);
            setOpen(false);
            resetForm();
        }
    });

    const updateTemplateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.DocumentTemplate.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['templates']);
            setOpen(false);
            resetForm();
        }
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: (id) => base44.entities.DocumentTemplate.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['templates'])
    });

    const resetForm = () => {
        setFormData({
            template_name: '',
            template_description: '',
            document_type: documentType || 'contract',
            template_data: {
                contract_type: '',
                contract_category: 'client',
                default_payment_terms: '',
                default_scope: '',
                default_deliverables: '',
                default_terms: ''
            },
            is_default: false
        });
        setEditingTemplate(null);
        setAiSuggestions(null);
    };

    const handleAIGenerate = async () => {
        setAiGenerating(true);
        try {
            const { data } = await base44.functions.invoke('aiTemplateGenerator', {
                action: 'generate',
                document_type: formData.document_type,
                template_type: formData.template_data.contract_type || 'standard',
                custom_requirements: formData.template_description
            });

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    template_data: {
                        ...prev.template_data,
                        ...data.template_data
                    }
                }));
            }
        } catch (error) {
            console.error('AI generation error:', error);
        }
        setAiGenerating(false);
    };

    const handleAISuggest = async () => {
        setAiGenerating(true);
        try {
            const { data } = await base44.functions.invoke('aiTemplateGenerator', {
                action: 'suggest_improvements',
                document_type: formData.document_type,
                existing_template: formData.template_data
            });

            if (data.success) {
                setAiSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('AI suggestion error:', error);
        }
        setAiGenerating(false);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            template_name: template.template_name,
            template_description: template.template_description || '',
            document_type: template.document_type,
            template_data: template.template_data || {},
            is_default: template.is_default || false
        });
        setOpen(true);
    };

    const handleDuplicate = (template) => {
        setFormData({
            template_name: `${template.template_name} (Copy)`,
            template_description: template.template_description || '',
            document_type: template.document_type,
            template_data: template.template_data || {},
            is_default: false
        });
        setOpen(true);
    };

    const handleSubmit = () => {
        if (editingTemplate) {
            updateTemplateMutation.mutate({
                id: editingTemplate.id,
                data: formData
            });
        } else {
            createTemplateMutation.mutate(formData);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Document Templates</h3>
                    <p className="text-sm text-muted-foreground">Create and manage reusable templates</p>
                </div>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingTemplate ? 'Edit Template' : 'Create New Template'}
                            </DialogTitle>
                        </DialogHeader>

                        <Tabs defaultValue="basic" className="mt-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4">
                                <div>
                                    <Label>Template Name *</Label>
                                    <Input
                                        value={formData.template_name}
                                        onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                                        placeholder="e.g., Standard Service Agreement"
                                    />
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.template_description}
                                        onChange={(e) => setFormData({ ...formData, template_description: e.target.value })}
                                        placeholder="Describe when to use this template"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label>Document Type *</Label>
                                    <Select
                                        value={formData.document_type}
                                        onValueChange={(val) => setFormData({ ...formData, document_type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="proposal">Proposal</SelectItem>
                                            <SelectItem value="invoice">Invoice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.document_type === 'contract' && (
                                    <>
                                        <div>
                                            <Label>Contract Category</Label>
                                            <Select
                                                value={formData.template_data.contract_category}
                                                onValueChange={(val) => setFormData({
                                                    ...formData,
                                                    template_data: { ...formData.template_data, contract_category: val }
                                                })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="client">Client Contract</SelectItem>
                                                    <SelectItem value="partnership">Partnership Contract</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Contract Type</Label>
                                            <Input
                                                value={formData.template_data.contract_type}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    template_data: { ...formData.template_data, contract_type: e.target.value }
                                                })}
                                                placeholder="e.g., service_agreement"
                                            />
                                        </div>
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="content" className="space-y-4">
                                <div>
                                    <Label>Default Payment Terms</Label>
                                    <Textarea
                                        value={formData.template_data.default_payment_terms}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            template_data: { ...formData.template_data, default_payment_terms: e.target.value }
                                        })}
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label>Default Scope of Work</Label>
                                    <Textarea
                                        value={formData.template_data.default_scope}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            template_data: { ...formData.template_data, default_scope: e.target.value }
                                        })}
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label>Default Deliverables (one per line)</Label>
                                    <Textarea
                                        value={formData.template_data.default_deliverables}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            template_data: { ...formData.template_data, default_deliverables: e.target.value }
                                        })}
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label>Default Terms & Conditions</Label>
                                    <Textarea
                                        value={formData.template_data.default_terms}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            template_data: { ...formData.template_data, default_terms: e.target.value }
                                        })}
                                        rows={8}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="ai" className="space-y-4">
                                <Alert>
                                    <Sparkles className="w-4 h-4" />
                                    <AlertDescription>
                                        Use AI to generate template content or get improvement suggestions
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAIGenerate}
                                        disabled={aiGenerating}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {aiGenerating ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                        ) : (
                                            <><Sparkles className="w-4 h-4 mr-2" /> Generate Template Content</>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleAISuggest}
                                        disabled={aiGenerating}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {aiGenerating ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                                        ) : (
                                            <><Lightbulb className="w-4 h-4 mr-2" /> Get Suggestions</>
                                        )}
                                    </Button>
                                </div>

                                {aiSuggestions && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold">AI Suggestions:</h4>
                                        {aiSuggestions.map((suggestion, idx) => (
                                            <Card key={idx}>
                                                <CardContent className="pt-4">
                                                    <div className="flex items-start gap-2">
                                                        <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                                                            {suggestion.priority}
                                                        </Badge>
                                                        <div>
                                                            <p className="text-sm font-medium">{suggestion.category}</p>
                                                            <p className="text-sm text-muted-foreground mt-1">{suggestion.suggestion}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!formData.template_name || createTemplateMutation.isPending || updateTemplateMutation.isPending}
                            >
                                {editingTemplate ? 'Update Template' : 'Create Template'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                </div>
            ) : templates.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No templates yet. Create your first template to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <Card key={template.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                            {template.template_name}
                                            {template.is_default && (
                                                <Badge variant="secondary">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Default
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {template.template_description || 'No description'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{template.document_type}</Badge>
                                            <span className="text-muted-foreground">Used {template.usage_count || 0} times</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleEdit(template)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDuplicate(template)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}