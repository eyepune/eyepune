'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Folder, TrendingUp, Calendar, Upload, CheckCircle2, 
    Clock, AlertCircle, FileText, Download, Loader2, BarChart3, Target, MessageSquare, Star, Phone, LogOut, Settings,
    Zap, ArrowUpRight, ShieldCheck, Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import FileManager from "@/components/dashboard/FileManager";
import FeedbackDialog from "@/components/client/FeedbackDialog";
import ReportSubscriptionSettings from "@/components/client/ReportSubscriptionSettings";
import ClientMessaging from "@/components/client/ClientMessaging";
import ReportsHistory from "@/components/client/ReportsHistory";
import ClientDashboardMetrics from "@/components/client/ClientDashboardMetrics";
import DeliverableApprovalCard from "@/components/client/DeliverableApprovalCard";
import DashboardCustomizer from "@/components/client/DashboardCustomizer";
import ProgressWidget from "@/components/client/widgets/ProgressWidget";
import MilestonesWidget from "@/components/client/widgets/MilestonesWidget";
import DeadlinesWidget from "@/components/client/widgets/DeadlinesWidget";
import BudgetWidget from "@/components/client/widgets/BudgetWidget";
import ActivityWidget from "@/components/client/widgets/ActivityWidget";
import OnboardingAssistant from "@/components/client/OnboardingAssistant";
import OnboardingTrigger from "@/components/client/OnboardingTrigger";
import OnboardingProgress from "@/components/client/OnboardingProgress";
import NotificationCenter from "@/components/client/NotificationCenter";
import SetupWizard from "@/components/onboarding/SetupWizard";
import SharedDocumentEditor from "@/components/collaboration/SharedDocumentEditor";
import ProjectDiscussionForum from "@/components/collaboration/ProjectDiscussionForum";
import DeliverableDiscussion from "@/components/collaboration/DeliverableDiscussion";
import KanbanBoard from "@/components/collaboration/KanbanBoard";
import QuickConsultationScheduler from "@/components/client/QuickConsultationScheduler";
import ClientInvoices from "@/components/client/ClientInvoices";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import ClientLayout from "@/components/client/ClientLayout";

export default function Client_Dashboard() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [selectedDeliverable, setSelectedDeliverable] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
    const [showOnboardingAssistant, setShowOnboardingAssistant] = useState(false);
    const [showSetupWizard, setShowSetupWizard] = useState(false);
    const queryClient = useQueryClient();

    const { user } = useAuth();

    // -- DATA FETCHING --
    const { data: projects = [] } = useQuery({
        queryKey: ['client-projects', user?.email],
        queryFn: async () => {
            // Admins see everything, clients see only their projects
            const isAdmin = user?.role === 'admin' || user?.email === 'connect@eyepune.com';
            
            if (isAdmin) {
                return await base44.entities.ClientProject.list('-created_at', 50);
            } else {
                return await base44.entities.ClientProject.filter({ clientEmail: user?.email });
            }
        },
        enabled: !!user?.email,
    });

    const { data: milestones = [] } = useQuery({
        queryKey: ['milestones', selectedProject?.id],
        queryFn: async () => {
            return await base44.entities.ClientMilestone.filter({ projectId: selectedProject.id });
        },
        enabled: !!selectedProject?.id,
    });

    const { data: files = [] } = useQuery({
        queryKey: ['client-files', selectedProject?.id],
        queryFn: async () => {
            return await base44.entities.ClientFile.filter({ projectId: selectedProject.id });
        },
        enabled: !!selectedProject?.id,
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['onboarding-tasks', selectedProject?.id],
        queryFn: async () => {
            return await base44.entities.OnboardingTask.filter({ 
                projectId: selectedProject.id,
                taskType: 'client'
            });
        },
        enabled: !!selectedProject?.id,
    });

    const { data: projectTasks = [] } = useQuery({
        queryKey: ['project-tasks', selectedProject?.id],
        queryFn: async () => {
            return await base44.entities.ProjectTask.filter({ projectId: selectedProject.id });
        },
        enabled: !!selectedProject?.id,
    });

    const { data: deliverables = [] } = useQuery({
        queryKey: ['deliverable-approvals', selectedProject?.id],
        queryFn: async () => {
            return await base44.entities.DeliverableApproval.filter({ projectId: selectedProject.id }, '-createdAt');
        },
        enabled: !!selectedProject?.id,
    });

    const { data: preferences } = useQuery({
        queryKey: ['dashboard-preferences', user?.email],
        queryFn: async () => {
            const results = await base44.entities.DashboardPreference.filter({ userEmail: user.email });
            return results[0] || null;
        },
        enabled: !!user?.email,
    });

    useEffect(() => {
        if (!selectedProject && projects.length > 0) {
            setSelectedProject(projects[0]);
        }
    }, [selectedProject, projects]);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <ClientLayout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                    <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-8 border border-red-600/20">
                        <Zap className="w-10 h-10 text-red-600 animate-pulse" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">Welcome to your <span className="text-red-500">Elite Command Center</span></h1>
                    <p className="text-gray-400 text-lg max-w-lg mb-10">
                        We're currently setting up your growth engine. Once your project is initialized, you'll see real-time metrics, milestones, and deliverables here.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button 
                            onClick={() => setConsultationDialogOpen(true)}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 h-14 font-bold text-lg"
                        >
                            <Phone className="w-5 h-5 mr-2" /> Book Kickoff Call
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => setShowSetupWizard(true)}
                            className="border-white/10 text-white hover:bg-white/5 rounded-2xl px-8 h-14 font-bold text-lg"
                        >
                            <Settings className="w-5 h-5 mr-2" /> View Setup Wizard
                        </Button>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    const enabledWidgets = preferences?.enabledWidgets || ['progress', 'milestones', 'deadlines', 'budget', 'activity'];
    const widgetOrder = preferences?.widgetOrder || ['progress', 'milestones', 'deadlines', 'budget', 'activity'];

    return (
        <ClientLayout>
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 space-y-12">
                {/* Hero Greeting */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                    <div className="relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 blur-[80px] rounded-full pointer-events-none" />
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                                Client Workspace
                            </Badge>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Live Updates Enabled</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4">
                            Grow Smarter, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">{(user.fullName || user.full_name || '').split(' ')[0]}</span>.
                        </h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl">
                            Your strategy is in motion. Monitor your growth engines and project health in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-xl">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Growth Phase</p>
                            <p className="text-white font-bold">{selectedProject?.status?.replace('_', ' ') || 'Initializing'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <TrendingUp className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Quick KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Project Health', value: '98%', icon: ShieldCheck, color: 'text-emerald-500', glow: 'shadow-emerald-500/10' },
                        { label: 'Active Tasks', value: projectTasks.filter(t => t.status !== 'completed').length, icon: Activity, color: 'text-blue-500', glow: 'shadow-blue-500/10' },
                        { label: 'Milestones', value: `${milestones.filter(m => m.status === 'completed').length}/${milestones.length}`, icon: Target, color: 'text-purple-500', glow: 'shadow-purple-500/10' },
                        { label: 'Next Sync', value: 'Tomorrow', icon: Clock, color: 'text-orange-500', glow: 'shadow-orange-500/10' }
                    ].map((kpi, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "p-6 rounded-[2rem] bg-[#0c0c0c]/80 border border-white/[0.05] shadow-xl relative overflow-hidden group",
                                kpi.glow
                            )}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <kpi.icon className="w-16 h-16" />
                            </div>
                            <kpi.icon className={cn("w-6 h-6 mb-4", kpi.color)} />
                            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">{kpi.label}</p>
                            <p className="text-3xl font-black text-white">{kpi.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Widgets & Progress */}
                    <div className="lg:col-span-8 space-y-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 custom-scrollbar">
                                <TabsList className="bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-2xl h-auto">
                                    <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white/[0.05] data-[state=active]:text-white">Overview</TabsTrigger>
                                    <TabsTrigger value="deliverables" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white/[0.05] data-[state=active]:text-white">Deliverables</TabsTrigger>
                                    <TabsTrigger value="invoices" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white/[0.05] data-[state=active]:text-white">Invoices & Payments</TabsTrigger>
                                    <TabsTrigger value="milestones" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white/[0.05] data-[state=active]:text-white">Milestones</TabsTrigger>
                                    <TabsTrigger value="analytics" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white/[0.05] data-[state=active]:text-white">Growth Analytics</TabsTrigger>
                                </TabsList>
                                <Button 
                                    onClick={() => setConsultationDialogOpen(true)}
                                    className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 rounded-xl font-bold ml-4"
                                >
                                    <Phone className="w-4 h-4 mr-2" /> Book Sync
                                </Button>
                            </div>

                            <AnimatePresence mode="wait">
                                <TabsContent value="overview" className="mt-0 outline-none">
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        {widgetOrder.map(widgetId => (
                                            <div key={widgetId} className="col-span-1">
                                                {widgetId === 'progress' && <ProgressWidget project={selectedProject} />}
                                                {widgetId === 'milestones' && <MilestonesWidget milestones={milestones} />}
                                                {widgetId === 'deadlines' && <DeadlinesWidget milestones={milestones} tasks={tasks} />}
                                                {widgetId === 'budget' && <BudgetWidget project={selectedProject} />}
                                                {widgetId === 'activity' && <ActivityWidget project={selectedProject} />}
                                            </div>
                                        ))}
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="deliverables" className="mt-0 outline-none">
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        {deliverables.length === 0 ? (
                                            <div className="py-24 text-center bg-[#0c0c0c]/50 rounded-[3rem] border border-dashed border-white/5">
                                                <Zap className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                                <p className="text-gray-500">No deliverables awaiting review</p>
                                            </div>
                                        ) : (
                                            deliverables.map(d => (
                                                <DeliverableApprovalCard 
                                                    key={d.id} 
                                                    deliverable={d} 
                                                    onProvideFeedback={() => {
                                                        setSelectedDeliverable(d);
                                                        setFeedbackDialogOpen(true);
                                                    }}
                                                />
                                            ))
                                        )}
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="invoices" className="mt-0 outline-none">
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <ClientInvoices userEmail={user.email} />
                                    </motion.div>
                                </TabsContent>
                            </AnimatePresence>
                        </Tabs>
                    </div>

                    {/* Right Column: Activity & Account Manager */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Account Manager Card */}
                        <Card className="bg-gradient-to-br from-red-600 to-red-800 border-0 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-xl font-black tracking-tight">Your Success Partner</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="flex items-center gap-4 mb-8">
                                    <Avatar className="h-16 w-16 border-4 border-white/20">
                                        <AvatarImage src="/team/manager.jpg" />
                                        <AvatarFallback className="bg-white/10 text-white font-black text-xl">AM</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-black text-lg">Piyush Patel</p>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Growth Strategist</p>
                                    </div>
                                </div>
                                <Button className="w-full bg-white text-red-600 hover:bg-gray-100 font-black rounded-2xl h-12">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Message Now
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <div className="bg-[#0c0c0c]/80 border border-white/[0.05] rounded-[3rem] p-8">
                            <h3 className="text-lg font-black text-white mb-6 flex items-center justify-between">
                                Stream
                                <Badge className="bg-green-500/10 text-green-500 border-0 text-[9px] uppercase font-black">Live</Badge>
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { text: 'Proposal updated for Website Revamp', time: '2h ago', icon: FileText, color: 'text-blue-400' },
                                    { text: 'Phase 1: Brand Strategy completed', time: '5h ago', icon: CheckCircle2, color: 'text-green-400' },
                                    { text: 'New report uploaded: SEO Audit', time: 'Yesterday', icon: BarChart3, color: 'text-purple-400' }
                                ].map((act, i) => (
                                    <div key={i} className="flex gap-4 group cursor-default">
                                        <div className={cn("w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.08] transition-colors", act.color)}>
                                            <act.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{act.text}</p>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">{act.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <QuickConsultationScheduler 
                open={consultationDialogOpen} 
                onOpenChange={setConsultationDialogOpen} 
                user={user}
                project={selectedProject}
            />
            <FeedbackDialog 
                open={feedbackDialogOpen} 
                onOpenChange={setFeedbackDialogOpen}
                deliverable={selectedDeliverable}
            />
            <SetupWizard 
                open={showSetupWizard} 
                onOpenChange={setShowSetupWizard} 
                user={user}
                project={selectedProject}
            />
        </ClientLayout>
    );
}