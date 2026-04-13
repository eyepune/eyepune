import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminGuard from "@/components/admin/AdminGuard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, CheckSquare, Calendar } from 'lucide-react';

export default function AdminTemplates() {
    const [showDialog, setShowDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        template_name: '',
        template_description: '',
        project_type: 'web_app',
        milestones: [],
        tasks: [],
        documents: []
    });
    const queryClient = useQueryClient();

    const { data: templates = [] } = useQuery({
        queryKey: ['project-templates'],
        queryFn: () => base44.entities.ProjectTemplate.list('-created_date'),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ProjectTemplate.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['project-templates']);
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ProjectTemplate.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['project-templates']);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ProjectTemplate.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['project-templates']);
        },
    });

    const resetForm = () => {
        setFormData({
            template_name: '',
            template_description: '',
            project_type: 'web_app',
            milestones: [],
            tasks: [],
            documents: []
        });
        setEditingTemplate(null);
        setShowDialog(false);
    };

    const handleSubmit = () => {
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            template_name: template.template_name,
            template_description: template.template_description || '',
            project_type: template.project_type,
            milestones: template.milestones || [],
            tasks: template.tasks || [],
            documents: template.documents || []
        });
        setShowDialog(true);
    };

    const addMilestone = () => {
        setFormData({
            ...formData,
            milestones: [...formData.milestones, { title: '', description: '', days_offset: 0 }]
        });
    };

    const addTask = () => {
        setFormData({
            ...formData,
            tasks: [...formData.tasks, { task_name: '', description: '', priority: 'medium', estimated_hours: 0 }]
        });
    };

    const addDocument = () => {
        setFormData({
            ...formData,
            documents: [...formData.documents, { document_title: '', document_type: 'notes', template_content: '' }]
        });
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-muted/30 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Project Templates</h1>
                        <Button onClick={() => setShowDialog(true)} className="bg-red-600 hover:bg-red-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Template
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{template.template_name}</CardTitle>
                                            <Badge variant="outline" className="mt-2">
                                                {template.project_type.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(template)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteMutation.mutate(template.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {template.template_description}
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span>{template.milestones?.length || 0} Milestones</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckSquare className="w-4 h-4 text-muted-foreground" />
                                            <span>{template.tasks?.length || 0} Tasks</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            <span>{template.documents?.length || 0} Documents</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Template Name</label>
                                        <Input
                                            value={formData.template_name}
                                            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                                            placeholder="e.g., Social Media Campaign"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Project Type</label>
                                        <Select
                                            value={formData.project_type}
                                            onValueChange={(value) => setFormData({ ...formData, project_type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="social_media">Social Media</SelectItem>
                                                <SelectItem value="web_app">Web App</SelectItem>
                                                <SelectItem value="ai_automation">AI Automation</SelectItem>
                                                <SelectItem value="branding">Branding</SelectItem>
                                                <SelectItem value="full_service">Full Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Description</label>
                                    <Textarea
                                        value={formData.template_description}
                                        onChange={(e) => setFormData({ ...formData, template_description: e.target.value })}
                                        placeholder="Template description..."
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold">Milestones</h4>
                                        <Button size="sm" variant="outline" onClick={addMilestone}>
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.milestones.map((milestone, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 p-2 border rounded">
                                                <Input
                                                    className="col-span-5"
                                                    placeholder="Title"
                                                    value={milestone.title}
                                                    onChange={(e) => {
                                                        const updated = [...formData.milestones];
                                                        updated[idx].title = e.target.value;
                                                        setFormData({ ...formData, milestones: updated });
                                                    }}
                                                />
                                                <Input
                                                    className="col-span-5"
                                                    placeholder="Description"
                                                    value={milestone.description}
                                                    onChange={(e) => {
                                                        const updated = [...formData.milestones];
                                                        updated[idx].description = e.target.value;
                                                        setFormData({ ...formData, milestones: updated });
                                                    }}
                                                />
                                                <Input
                                                    className="col-span-1"
                                                    type="number"
                                                    placeholder="Days"
                                                    value={milestone.days_offset}
                                                    onChange={(e) => {
                                                        const updated = [...formData.milestones];
                                                        updated[idx].days_offset = parseInt(e.target.value) || 0;
                                                        setFormData({ ...formData, milestones: updated });
                                                    }}
                                                />
                                                <Button
                                                    className="col-span-1"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const updated = formData.milestones.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, milestones: updated });
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold">Tasks</h4>
                                        <Button size="sm" variant="outline" onClick={addTask}>
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.tasks.map((task, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 p-2 border rounded">
                                                <Input
                                                    className="col-span-4"
                                                    placeholder="Task name"
                                                    value={task.task_name}
                                                    onChange={(e) => {
                                                        const updated = [...formData.tasks];
                                                        updated[idx].task_name = e.target.value;
                                                        setFormData({ ...formData, tasks: updated });
                                                    }}
                                                />
                                                <Input
                                                    className="col-span-4"
                                                    placeholder="Description"
                                                    value={task.description}
                                                    onChange={(e) => {
                                                        const updated = [...formData.tasks];
                                                        updated[idx].description = e.target.value;
                                                        setFormData({ ...formData, tasks: updated });
                                                    }}
                                                />
                                                <Select
                                                    value={task.priority}
                                                    onValueChange={(value) => {
                                                        const updated = [...formData.tasks];
                                                        updated[idx].priority = value;
                                                        setFormData({ ...formData, tasks: updated });
                                                    }}
                                                >
                                                    <SelectTrigger className="col-span-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                        <SelectItem value="urgent">Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    className="col-span-1"
                                                    type="number"
                                                    placeholder="Hrs"
                                                    value={task.estimated_hours}
                                                    onChange={(e) => {
                                                        const updated = [...formData.tasks];
                                                        updated[idx].estimated_hours = parseInt(e.target.value) || 0;
                                                        setFormData({ ...formData, tasks: updated });
                                                    }}
                                                />
                                                <Button
                                                    className="col-span-1"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const updated = formData.tasks.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, tasks: updated });
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold">Documents</h4>
                                        <Button size="sm" variant="outline" onClick={addDocument}>
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.documents.map((doc, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 p-2 border rounded">
                                                <Input
                                                    className="col-span-5"
                                                    placeholder="Document title"
                                                    value={doc.document_title}
                                                    onChange={(e) => {
                                                        const updated = [...formData.documents];
                                                        updated[idx].document_title = e.target.value;
                                                        setFormData({ ...formData, documents: updated });
                                                    }}
                                                />
                                                <Select
                                                    value={doc.document_type}
                                                    onValueChange={(value) => {
                                                        const updated = [...formData.documents];
                                                        updated[idx].document_type = value;
                                                        setFormData({ ...formData, documents: updated });
                                                    }}
                                                >
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="project_brief">Project Brief</SelectItem>
                                                        <SelectItem value="specification">Specification</SelectItem>
                                                        <SelectItem value="requirements">Requirements</SelectItem>
                                                        <SelectItem value="notes">Notes</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    className="col-span-3"
                                                    placeholder="Template content"
                                                    value={doc.template_content}
                                                    onChange={(e) => {
                                                        const updated = [...formData.documents];
                                                        updated[idx].template_content = e.target.value;
                                                        setFormData({ ...formData, documents: updated });
                                                    }}
                                                />
                                                <Button
                                                    className="col-span-1"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const updated = formData.documents.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, documents: updated });
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!formData.template_name || createMutation.isPending || updateMutation.isPending}
                                        className="bg-red-600 hover:bg-red-700 flex-1"
                                    >
                                        {editingTemplate ? 'Update' : 'Create'} Template
                                    </Button>
                                    <Button variant="outline" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AdminGuard>
    );
}