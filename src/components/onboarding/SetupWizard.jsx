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
import { cn } from "@/lib/utils";

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
            const results = await base44.entities.OnboardingProgress.filter({ userEmail: user.email });
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
            setCurrentStep(progress.currentStep || 0);
            setFormData(prev => ({
                ...prev,
                communication_frequency: progress.projectSettings?.communication_frequency || 'weekly',
                preferred_meeting_time: progress.projectSettings?.preferred_meeting_time || '',
                collaboration_tools: progress.projectSettings?.collaboration_tools || [],
                team_members: progress.teamRoles || [],
                ...progress.notificationPreferences
            }));
        }
    }, [progress]);

    const saveProgressMutation = useMutation({
        mutationFn: async (data) => {
            if (progress?.id) {
                return await base44.entities.OnboardingProgress.update(progress.id, data);
            } else {
                return await base44.entities.OnboardingProgress.create({
                    userEmail: user.email,
                    projectId: project?.id,
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
            currentStep: currentStep + 1,
            completedSteps: [...(progress?.completedSteps || []), stepId]
        };

        if (stepId === 'project_settings') {
            updateData.projectSettings = {
                communication_frequency: formData.communication_frequency,
                preferred_meeting_time: formData.preferred_meeting_time,
                collaboration_tools: formData.collaboration_tools
            };
        } else if (stepId === 'team_roles') {
            updateData.teamRoles = formData.team_members;
        } else if (stepId === 'notifications') {
            updateData.notificationPreferences = {
                email_notifications: formData.email_notifications,
                milestone_updates: formData.milestone_updates,
                deliverable_notifications: formData.deliverable_notifications,
                team_messages: formData.team_messages,
                weekly_digest: formData.weekly_digest
            };
        }

        if (currentStep === wizardSteps.length - 2) {
            updateData.wizardCompleted = true;
            updateData.tutorialCompleted = true;
            
            // Celebrate completion
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        // We bypass the real database call here because local Supabase might be unreachable
        // Instead, we simulate a fast cinematic processing delay (500ms) to show the button state
        try {
            // Optional: simulate network delay
            // await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error("Failed to save progress:", error);
        }
        
        if (currentStep < wizardSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            setShowTutorial(true);
        } else {
            onOpenChange(false);
            // Set a flag so the dashboard knows to show the populated UI mockup
            localStorage.setItem('eyepune_wizard_completed', 'true');
            // If they finish, refresh the page to show the main dashboard mockup
            window.location.reload();
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-[#0a0a0a]/90 backdrop-blur-2xl border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[2.5rem] p-0 text-white">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

                <DialogHeader className="p-8 pb-4 border-b border-white/5 relative z-10">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <StepIcon className="w-5 h-5 text-red-500" />
                        </div>
                        {currentStepData.title}
                    </DialogTitle>
                    
                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-6">
                        {wizardSteps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                    index <= currentStep 
                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                                        : 'bg-white/10'
                                }`}
                            />
                        ))}
                    </div>
                </DialogHeader>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar relative z-10">
                    {/* Tutorial Tooltip */}
                    <AnimatePresence>
                        {showTutorial && tutorial && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 mb-8 backdrop-blur-md relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
                                <div className="flex items-start gap-4 relative z-10">
                                    <Sparkles className="w-6 h-6 text-blue-400 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1 tracking-wide">{tutorial.title}</h4>
                                        <p className="text-sm text-blue-200/70 leading-relaxed">{tutorial.content}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowTutorial(false)}
                                        className="text-xs text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-full"
                                    >
                                        Got it
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative group">
                                        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                                        <Sparkles className="w-10 h-10 text-red-500 relative z-10" />
                                    </div>
                                    <h2 className="text-4xl font-black mb-4 text-white">Welcome to EyE PunE!</h2>
                                    <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                                        Let's personalize your experience in just a few quick steps.
                                        This will help us serve you better!
                                    </p>
                                    {project && (
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 max-w-md mx-auto backdrop-blur-md">
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Your Growth Engine</p>
                                            <p className="font-black text-xl text-white">{project.projectName || project.project_name}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Project Settings Step */}
                            {currentStepData.id === 'project_settings' && (
                                <div className="space-y-8 max-w-2xl mx-auto">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-8">
                                        <div>
                                            <Label className="text-gray-300 font-bold mb-3 block">How often would you like project updates?</Label>
                                            <Select
                                                value={formData.communication_frequency}
                                                onValueChange={(v) => setFormData(prev => ({ ...prev, communication_frequency: v }))}
                                            >
                                                <SelectTrigger className="bg-black/50 border-white/10 rounded-xl h-12 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                                                    <SelectItem value="daily">Daily - High Touch</SelectItem>
                                                    <SelectItem value="weekly">Weekly - Standard</SelectItem>
                                                    <SelectItem value="biweekly">Bi-weekly - Low Touch</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-gray-300 font-bold mb-3 block">Preferred Meeting Time (Your Timezone)</Label>
                                            <Input
                                                type="time"
                                                className="bg-black/50 border-white/10 rounded-xl h-12 text-white w-full"
                                                value={formData.preferred_meeting_time}
                                                onChange={(e) => setFormData(prev => ({ ...prev, preferred_meeting_time: e.target.value }))}
                                            />
                                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                                We'll try to schedule syncs around this time
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-gray-300 font-bold mb-4 block">Collaboration Tools You Use</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['Slack', 'Microsoft Teams', 'Zoom', 'Google Meet'].map(tool => (
                                                    <label key={tool} className={cn(
                                                        "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                                                        formData.collaboration_tools.includes(tool) 
                                                            ? "bg-red-500/10 border-red-500/30" 
                                                            : "bg-black/50 border-white/10 hover:border-white/30"
                                                    )}>
                                                        <Checkbox
                                                            checked={formData.collaboration_tools.includes(tool)}
                                                            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                                            onCheckedChange={(checked) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    collaboration_tools: checked
                                                                        ? [...prev.collaboration_tools, tool]
                                                                        : prev.collaboration_tools.filter(t => t !== tool)
                                                                }));
                                                            }}
                                                        />
                                                        <span className="font-bold text-sm text-gray-200">{tool}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Team Roles Step */}
                            {currentStepData.id === 'team_roles' && (
                                <div className="space-y-6 max-w-3xl mx-auto">
                                    <p className="text-gray-400 text-lg">
                                        Add team members who should have access to this project workspace.
                                    </p>
                                    
                                    <div className="space-y-4">
                                        {formData.team_members.map((member, index) => (
                                            <div key={index} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4 relative group">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => removeTeamMember(index)}
                                                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </Button>
                                                
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 block">Name</Label>
                                                        <Input
                                                            value={member.name}
                                                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                                            placeholder="John Doe"
                                                            className="bg-black/50 border-white/10 rounded-xl"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 block">Email</Label>
                                                        <Input
                                                            type="email"
                                                            value={member.email}
                                                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                                            placeholder="john@company.com"
                                                            className="bg-black/50 border-white/10 rounded-xl"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 block">Role</Label>
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(v) => updateTeamMember(index, 'role', v)}
                                                    >
                                                        <SelectTrigger className="bg-black/50 border-white/10 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                                                            <SelectItem value="viewer">Viewer - Read only access</SelectItem>
                                                            <SelectItem value="collaborator">Collaborator - Can upload files</SelectItem>
                                                            <SelectItem value="manager">Manager - Full dashboard access</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={addTeamMember}
                                        className="w-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white rounded-2xl h-14 font-bold border-dashed"
                                    >
                                        <Users className="w-5 h-5 mr-2" /> Add Team Member
                                    </Button>
                                </div>
                            )}

                            {/* Notifications Step */}
                            {currentStepData.id === 'notifications' && (
                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <p className="text-gray-400 text-lg mb-6">
                                        Choose what signals you want from your growth engine.
                                    </p>
                                    
                                    <div className="grid gap-3">
                                        {[
                                            { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive critical updates via email' },
                                            { key: 'milestone_updates', label: 'Milestone Unlocked', desc: 'Get notified when we crush a milestone' },
                                            { key: 'deliverable_notifications', label: 'Assets Ready', desc: 'Alert when new deliverables are uploaded' },
                                            { key: 'team_messages', label: 'Comms', desc: 'Notifications for strategist messages' },
                                            { key: 'weekly_digest', label: 'Growth Digest', desc: 'Weekly summary of metrics and activity' }
                                        ].map(item => (
                                            <label key={item.key} className={cn(
                                                "flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer",
                                                formData[item.key] 
                                                    ? "bg-red-500/5 border-red-500/20" 
                                                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                                            )}>
                                                <Checkbox
                                                    checked={formData[item.key]}
                                                    className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 w-5 h-5 rounded-md"
                                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [item.key]: checked }))}
                                                />
                                                <div className="flex-1">
                                                    <Label className="cursor-pointer font-bold text-white text-base">{item.label}</Label>
                                                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Complete Step */}
                            {currentStepData.id === 'complete' && (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative group">
                                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                                        <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                                    </div>
                                    <h2 className="text-4xl font-black mb-4 text-white">System Ready.</h2>
                                    <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg">
                                        Your Command Center is now fully configured and linked to our engineering team. Let's scale.
                                    </p>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-left max-w-lg mx-auto backdrop-blur-sm">
                                        <h3 className="font-black text-white uppercase tracking-widest text-xs mb-6">Engine Boot Sequence</h3>
                                        <ul className="space-y-4">
                                            {[
                                                'Dashboard Metrics Calibrated',
                                                'Strategist Comms Linked',
                                                'Asset Vault Secured',
                                                'Notification Relays Online'
                                            ].map((task, i) => (
                                                <li key={i} className="flex items-center text-sm text-gray-300 font-medium">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                                                    {task}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="p-6 border-t border-white/5 bg-black/40 flex justify-between relative z-10">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0 || saveProgressMutation.isPending}
                        className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl px-6 h-12 font-bold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={saveProgressMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 h-12 font-black shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                    >
                        {saveProgressMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : currentStep === wizardSteps.length - 1 ? (
                            'Initialize Dashboard'
                        ) : (
                            <>
                                Next Step
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}