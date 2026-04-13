import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Users, Bell, Settings, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const wizardSteps = [
    {
        id: 'welcome',
        title: 'Welcome!',
        icon: Sparkles,
        description: 'Let\'s get your project set up in just a few steps'
    },
    {
        id: 'project_settings',
        title: 'Project Settings',
        icon: Settings,
        description: 'Configure how you want to work with us'
    },
    {
        id: 'team_roles',
        title: 'Team Access',
        icon: Users,
        description: 'Add team members who should have access'
    },
    {
        id: 'notifications',
        title: 'Notifications',
        icon: Bell,
        description: 'Choose how you want to stay updated'
    },
    {
        id: 'complete',
        title: 'All Set!',
        icon: CheckCircle2,
        description: 'You\'re ready to get started'
    }
];

const tutorialContent = {
    project_settings: {
        title: "Project Communication",
        content: "Choose how often you'd like updates and your preferred meeting times. We'll adapt to your schedule!"
    },
    team_roles: {
        title: "Collaborate Better",
        content: "Add team members to keep everyone in the loop. They'll get access to project updates and communication."
    },
    notifications: {
        title: "Stay Informed",
        content: "Customize your notifications to get only what matters to you. You can change these anytime."
    }
};

export default function SetupWizard({ open, onOpenChange, user, project }) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [showTutorial, setShowTutorial] = useState(true);

    const { data: progress } = useQuery({
        queryKey: ['onboarding-progress', user?.email],
        queryFn: async () => {
            const results = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
            return results[0];
        },
        enabled: !!user
    });

    const [formData, setFormData] = useState({
        communication_frequency: 'weekly',
        preferred_meeting_time: '',
        collaboration_tools: [],
        team_members: [],
        email_notifications: true,
        milestone_updates: true,
        deliverable_notifications: true,
        team_messages: true,
        weekly_digest: true
    });

    useEffect(() => {
        if (progress) {
            setCurrentStep(progress.current_step || 0);
            setFormData(prev => ({
                ...prev,
                communication_frequency: progress.project_settings?.communication_frequency || 'weekly',
                preferred_meeting_time: progress.project_settings?.preferred_meeting_time || '',
                collaboration_tools: progress.project_settings?.collaboration_tools || [],
                team_members: progress.team_roles || [],
                ...progress.notification_preferences
            }));
        }
    }, [progress]);

    const saveProgressMutation = useMutation({
        mutationFn: async (data) => {
            if (progress?.id) {
                return await base44.entities.OnboardingProgress.update(progress.id, data);
            } else {
                return await base44.entities.OnboardingProgress.create({
                    user_email: user.email,
                    project_id: project?.id,
                    ...data
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['onboarding-progress']);
        }
    });

    const handleNext = async () => {
        const stepId = wizardSteps[currentStep].id;
        
        // Save current step data
        const updateData = {
            current_step: currentStep + 1,
            completed_steps: [...(progress?.completed_steps || []), stepId]
        };

        if (stepId === 'project_settings') {
            updateData.project_settings = {
                communication_frequency: formData.communication_frequency,
                preferred_meeting_time: formData.preferred_meeting_time,
                collaboration_tools: formData.collaboration_tools
            };
        } else if (stepId === 'team_roles') {
            updateData.team_roles = formData.team_members;
        } else if (stepId === 'notifications') {
            updateData.notification_preferences = {
                email_notifications: formData.email_notifications,
                milestone_updates: formData.milestone_updates,
                deliverable_notifications: formData.deliverable_notifications,
                team_messages: formData.team_messages,
                weekly_digest: formData.weekly_digest
            };
        }

        if (currentStep === wizardSteps.length - 2) {
            updateData.wizard_completed = true;
            updateData.tutorial_completed = true;
            
            // Celebrate completion
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        await saveProgressMutation.mutateAsync(updateData);
        
        if (currentStep < wizardSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            setShowTutorial(true);
        } else {
            onOpenChange(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const addTeamMember = () => {
        setFormData(prev => ({
            ...prev,
            team_members: [...prev.team_members, { email: '', name: '', role: 'viewer' }]
        }));
    };

    const updateTeamMember = (index, field, value) => {
        setFormData(prev => {
            const members = [...prev.team_members];
            members[index] = { ...members[index], [field]: value };
            return { ...prev, team_members: members };
        });
    };

    const removeTeamMember = (index) => {
        setFormData(prev => ({
            ...prev,
            team_members: prev.team_members.filter((_, i) => i !== index)
        }));
    };

    const currentStepData = wizardSteps[currentStep] || wizardSteps[0];
    const StepIcon = currentStepData?.icon || Sparkles;
    const tutorial = tutorialContent[currentStepData?.id];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <StepIcon className="w-5 h-5 text-red-600" />
                        {currentStepData.title}
                    </DialogTitle>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-4">
                    {wizardSteps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`h-2 flex-1 rounded-full transition-all ${
                                index <= currentStep ? 'bg-red-600' : 'bg-muted'
                            }`}
                        />
                    ))}
                </div>

                {/* Tutorial Tooltip */}
                <AnimatePresence>
                    {showTutorial && tutorial && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4"
                        >
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm mb-1">{tutorial.title}</h4>
                                    <p className="text-sm text-muted-foreground">{tutorial.content}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowTutorial(false)}
                                    className="text-xs"
                                >
                                    Got it
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="overflow-y-auto max-h-[50vh]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Welcome Step */}
                            {currentStepData.id === 'welcome' && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="w-10 h-10 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Welcome to EyE PunE!</h2>
                                    <p className="text-muted-foreground mb-6">
                                        Let's personalize your experience in just a few quick steps.
                                        This will help us serve you better!
                                    </p>
                                    {project && (
                                        <div className="bg-muted rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Your Project</p>
                                            <p className="font-semibold">{project.project_name}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Project Settings Step */}
                            {currentStepData.id === 'project_settings' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>How often would you like project updates?</Label>
                                        <Select
                                            value={formData.communication_frequency}
                                            onValueChange={(v) => setFormData(prev => ({ ...prev, communication_frequency: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Preferred Meeting Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.preferred_meeting_time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, preferred_meeting_time: e.target.value }))}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            We'll try to schedule meetings around this time
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Collaboration Tools You Use</Label>
                                        <div className="space-y-2">
                                            {['Slack', 'Microsoft Teams', 'Zoom', 'Google Meet'].map(tool => (
                                                <div key={tool} className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={formData.collaboration_tools.includes(tool)}
                                                        onCheckedChange={(checked) => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                collaboration_tools: checked
                                                                    ? [...prev.collaboration_tools, tool]
                                                                    : prev.collaboration_tools.filter(t => t !== tool)
                                                            }));
                                                        }}
                                                    />
                                                    <Label className="cursor-pointer">{tool}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Team Roles Step */}
                            {currentStepData.id === 'team_roles' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Add team members who should have access to this project
                                    </p>
                                    
                                    {formData.team_members.map((member, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="grid md:grid-cols-2 gap-3">
                                                <div>
                                                    <Label>Name</Label>
                                                    <Input
                                                        value={member.name}
                                                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Email</Label>
                                                    <Input
                                                        type="email"
                                                        value={member.email}
                                                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                                        placeholder="john@company.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <Label>Role</Label>
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(v) => updateTeamMember(index, 'role', v)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="viewer">Viewer - View only</SelectItem>
                                                            <SelectItem value="collaborator">Collaborator - Can comment</SelectItem>
                                                            <SelectItem value="manager">Manager - Full access</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeTeamMember(index)}
                                                    className="mt-auto"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addTeamMember}
                                        className="w-full"
                                    >
                                        + Add Team Member
                                    </Button>
                                </div>
                            )}

                            {/* Notifications Step */}
                            {currentStepData.id === 'notifications' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Choose what notifications you'd like to receive
                                    </p>
                                    
                                    {[
                                        { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                                        { key: 'milestone_updates', label: 'Milestone Updates', desc: 'Get notified when milestones are completed' },
                                        { key: 'deliverable_notifications', label: 'New Deliverables', desc: 'Alert when deliverables are ready' },
                                        { key: 'team_messages', label: 'Team Messages', desc: 'Notifications for new messages' },
                                        { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Summary of project activity' }
                                    ].map(item => (
                                        <div key={item.key} className="flex items-start gap-3 p-3 border rounded-lg">
                                            <Checkbox
                                                checked={formData[item.key]}
                                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [item.key]: checked }))}
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <Label className="cursor-pointer font-medium">{item.label}</Label>
                                                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Complete Step */}
                            {currentStepData.id === 'complete' && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
                                    <p className="text-muted-foreground mb-6">
                                        Your project is configured and ready to go.
                                        Let's build something amazing together!
                                    </p>
                                    <div className="bg-muted rounded-lg p-4 text-left">
                                        <h3 className="font-semibold mb-2">Next Steps:</h3>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li>✓ Explore your project dashboard</li>
                                            <li>✓ Check out upcoming milestones</li>
                                            <li>✓ Connect with your project team</li>
                                            <li>✓ Review project files and deliverables</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0 || saveProgressMutation.isPending}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={saveProgressMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {saveProgressMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : currentStep === wizardSteps.length - 1 ? (
                            'Get Started'
                        ) : (
                            <>
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}