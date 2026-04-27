import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminGuard from "@/components/admin/AdminGuard";
import { motion } from 'framer-motion';
import { Plus, Play, Edit, Trash2, FileStack, FileText, FileSignature, Receipt, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import InvoiceGenerator from "@/components/admin/InvoiceGenerator";
import ProposalGenerator from "@/components/admin/ProposalGenerator";
import AgreementEditor from "@/components/admin/AgreementEditor";
import AIAssistant from "@/components/admin/AIAssistant";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';

function Admin_Projects() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
    const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
    const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
    const [aiContext, setAiContext] = useState(null);
    const queryClient = useQueryClient();

    const { data: projects = [] } = useQuery({
        queryKey: ['all-projects'],
        queryFn: () => base44.entities.ClientProject.list('-created_date', 100),
    });

    const { data: templates = [] } = useQuery({
        queryKey: ['project-templates'],
        queryFn: () => base44.entities.ProjectTemplate.filter({ is_active: true }),
    });

    const createProjectMutation = useMutation({
        mutationFn: async (data) => {
            const project = await base44.entities.ClientProject.create(data);
            // Auto-generate personalized onboarding checklist
            try {
                await base44.functions.invoke('generatePersonalizedOnboarding', {
                    project_id: project.id,
                    client_email: data.client_email
                });
                toast.success('Project created with personalized onboarding checklist!');
            } catch (error) {
                console.error('Failed to generate onboarding:', error);
                toast.warning('Project created, but onboarding generation failed');
            }
            return project;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-projects'] });
            setIsEditing(false);
            setSelectedProject(null);
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ClientProject.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-projects'] });
            setIsEditing(false);
            setSelectedProject(null);
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: (id) => base44.entities.ClientProject.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-projects'] });
        },
    });

    const initiateOnboardingMutation = useMutation({
        mutationFn: (projectId) => base44.functions.invoke('initiateClientOnboarding', { projectId }),
        onSuccess: () => {
            toast.success('Onboarding initiated successfully!');
        },
    });

    const applyTemplateMutation = useMutation({
        mutationFn: ({ project_id, template_id }) => 
            base44.functions.invoke('applyProjectTemplate', { project_id, template_id }),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['all-projects']);
            toast.success(`Template applied: ${response.data.results.milestones.length} milestones, ${response.data.results.tasks.length} tasks, ${response.data.results.documents.length} documents created`);
            setSelectedTemplate('');
        },
    });

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            client_email: formData.get('client_email'),
            client_name: formData.get('client_name'),
            project_name: formData.get('project_name'),
            project_type: formData.get('project_type'),
            status: formData.get('status'),
            start_date: formData.get('start_date'),
            expected_completion_date: formData.get('expected_completion_date'),
            budget: parseFloat(formData.get('budget')) || 0,
            progress_percentage: parseInt(formData.get('progress_percentage')) || 0,
            description: formData.get('description')
        };

        if (selectedProject) {
            updateProjectMutation.mutate({ id: selectedProject.id, data });
        } else {
            createProjectMutation.mutate(data);
        }
    };

    const statusColors = {
        onboarding: 'bg-blue-500/10 text-blue-600',
        in_progress: 'bg-yellow-500/10 text-yellow-600',
        review: 'bg-purple-500/10 text-purple-600',
        completed: 'bg-green-500/10 text-green-600',
        on_hold: 'bg-gray-500/10 text-gray-600'
    };

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Client Projects</h1>
                        <p className="text-muted-foreground">Manage client projects and onboarding</p>
                    </div>
                    <Button onClick={() => { setSelectedProject(null); setIsEditing(true); }} className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border rounded-xl p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold mb-1">{project.project_name}</h3>
                                    <p className="text-sm text-muted-foreground">{project.client_name}</p>
                                </div>
                                <Badge className={statusColors[project.status]}>
                                    {project.status?.replace('_', ' ')}
                                </Badge>
                            </div>

                            <Progress value={project.progress_percentage || 0} className="mb-4" />
                            <p className="text-sm text-muted-foreground mb-4">
                                {project.progress_percentage || 0}% complete
                            </p>

                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    {project.status === 'onboarding' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => initiateOnboardingMutation.mutate(project.id)}
                                        >
                                            <Play className="w-4 h-4 mr-1" />
                                            Start Onboarding
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                await base44.functions.invoke('generatePersonalizedOnboarding', {
                                                    project_id: project.id,
                                                    client_email: project.client_email
                                                });
                                                toast.success('Onboarding checklist generated!');
                                            } catch (error) {
                                                toast.error('Failed to generate checklist');
                                            }
                                        }}
                                        title="Generate/Regenerate Onboarding Checklist"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setSelectedProject(project); setIsEditing(true); }}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteProjectMutation.mutate(project.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { 
                                                setSelectedProject(project);
                                                setAiContext({
                                                    action: 'suggest_template',
                                                    project
                                                });
                                                setAiAssistantOpen(true);
                                            }}
                                            className="flex-1"
                                        >
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            AI Assist
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setSelectedProject(project); setInvoiceDialogOpen(true); }}
                                            className="flex-1"
                                        >
                                            <Receipt className="w-3 h-3 mr-1" />
                                            Invoice
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setSelectedProject(project); setProposalDialogOpen(true); }}
                                            className="flex-1"
                                        >
                                            <FileText className="w-3 h-3 mr-1" />
                                            Proposal
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setSelectedProject(project); setAgreementDialogOpen(true); }}
                                            className="flex-1"
                                        >
                                            <FileSignature className="w-3 h-3 mr-1" />
                                            Agreement
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedProject ? 'Edit Project' : 'Create Project'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Client Name *</Label>
                                    <Input name="client_name" defaultValue={selectedProject?.client_name} required />
                                </div>
                                <div>
                                    <Label>Client Email *</Label>
                                    <Input name="client_email" type="email" defaultValue={selectedProject?.client_email} required />
                                </div>
                            </div>
                            <div>
                                <Label>Project Name *</Label>
                                <Input name="project_name" defaultValue={selectedProject?.project_name} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Project Type *</Label>
                                    <Select name="project_type" defaultValue={selectedProject?.project_type || 'web_app'}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="social_media">Social Media</SelectItem>
                                            <SelectItem value="web_app">Web/App</SelectItem>
                                            <SelectItem value="ai_automation">AI Automation</SelectItem>
                                            <SelectItem value="branding">Branding</SelectItem>
                                            <SelectItem value="full_service">Full Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Status *</Label>
                                    <Select name="status" defaultValue={selectedProject?.status || 'onboarding'}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="onboarding">Onboarding</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="on_hold">On Hold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Start Date</Label>
                                    <DatePicker name="start_date" defaultValue={selectedProject?.start_date} />
                                </div>
                                <div>
                                    <Label>Expected Completion</Label>
                                    <DatePicker name="expected_completion_date" defaultValue={selectedProject?.expected_completion_date} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Budget (₹)</Label>
                                    <Input name="budget" type="number" defaultValue={selectedProject?.budget} />
                                </div>
                                <div>
                                    <Label>Progress %</Label>
                                    <Input name="progress_percentage" type="number" min="0" max="100" defaultValue={selectedProject?.progress_percentage || 0} />
                                </div>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea name="description" defaultValue={selectedProject?.description} />
                            </div>
                            
                            {selectedProject && (
                                <div className="border-t pt-4">
                                    <Label>Apply Project Template</Label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Apply a template to create pre-defined milestones, tasks, and documents
                                    </p>
                                    <div className="flex gap-2">
                                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select template..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.map(template => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.template_name} ({template.project_type})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={!selectedTemplate || applyTemplateMutation.isPending}
                                            onClick={() => {
                                                if (selectedTemplate) {
                                                    applyTemplateMutation.mutate({
                                                        project_id: selectedProject.id,
                                                        template_id: selectedTemplate
                                                    });
                                                }
                                            }}
                                        >
                                            <FileStack className="w-4 h-4 mr-2" />
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                                    {selectedProject ? 'Update' : 'Create'} Project
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <InvoiceGenerator
                    open={invoiceDialogOpen}
                    onClose={() => setInvoiceDialogOpen(false)}
                    project={selectedProject}
                />

                <ProposalGenerator
                    open={proposalDialogOpen}
                    onClose={() => setProposalDialogOpen(false)}
                    project={selectedProject}
                />

                <AgreementEditor
                    open={agreementDialogOpen}
                    onClose={() => setAgreementDialogOpen(false)}
                    project={selectedProject}
                />

                {aiContext && (
                    <AIAssistant
                        open={aiAssistantOpen}
                        onClose={() => {
                            setAiAssistantOpen(false);
                            setAiContext(null);
                        }}
                        action={aiContext.action}
                        context={aiContext.project}
                        title="AI Project Assistant"
                    />
                )}
            </div>
        </div>
    );
}

import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminProjectsPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Projects />
            </AdminLayout>
        </AdminGuard>
    );
}