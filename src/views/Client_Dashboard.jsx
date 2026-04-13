import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { 
    Folder, TrendingUp, Calendar, Upload, CheckCircle2, 
    Clock, AlertCircle, FileText, Download, Loader2, BarChart3, Target, MessageSquare, Star, Phone, LogOut, Settings
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
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
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

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
    const contentRef = React.useRef(null);
    const queryClient = useQueryClient();

    React.useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeTab]);

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me(),
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['client-projects', user?.email],
        queryFn: () => base44.entities.ClientProject.filter({ client_email: user?.email }),
        enabled: !!user?.email,
    });

    const { data: milestones = [] } = useQuery({
        queryKey: ['milestones', selectedProject?.id],
        queryFn: () => base44.entities.ClientMilestone.filter({ project_id: selectedProject.id }),
        enabled: !!selectedProject?.id,
    });

    const { data: files = [] } = useQuery({
        queryKey: ['client-files', selectedProject?.id],
        queryFn: () => base44.entities.ClientFile.filter({ project_id: selectedProject.id }),
        enabled: !!selectedProject?.id,
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['onboarding-tasks', selectedProject?.id],
        queryFn: () => base44.entities.OnboardingTask.filter({ 
            project_id: selectedProject.id,
            task_type: 'client'
        }),
        enabled: !!selectedProject?.id,
    });

    const { data: projectTasks = [] } = useQuery({
        queryKey: ['project-tasks', selectedProject?.id],
        queryFn: async () => {
            const all = await base44.entities.ProjectTask.list();
            return all.filter(t => t.project_id === selectedProject.id);
        },
        enabled: !!selectedProject?.id,
    });

    const { data: deliverables = [] } = useQuery({
        queryKey: ['deliverable-approvals', selectedProject?.id],
        queryFn: async () => {
            const all = await base44.entities.DeliverableApproval.list('-created_date', 100);
            return all.filter(d => d.project_id === selectedProject.id);
        },
        enabled: !!selectedProject?.id,
    });

    const { data: timeLogs = [] } = useQuery({
        queryKey: ['time-logs', selectedProject?.id],
        queryFn: async () => {
            const all = await base44.entities.TimeLog.list();
            return all.filter(log => log.project_id === selectedProject.id);
        },
        enabled: !!selectedProject?.id,
    });

    const { data: preferences } = useQuery({
        queryKey: ['dashboard-preferences', user?.email],
        queryFn: async () => {
            const prefs = await base44.entities.DashboardPreference.list();
            return prefs.find(p => p.user_email === user.email);
        },
        enabled: !!user?.email,
    });

    const { data: clientFeedback = [] } = useQuery({
        queryKey: ['client-feedback', selectedProject?.id],
        queryFn: async () => {
            const all = await base44.entities.ClientFeedback.list('-created_date', 100);
            return all.filter(f => f.project_id === selectedProject.id && f.created_by === user.email);
        },
        enabled: !!selectedProject?.id && !!user?.email,
    });

    const { data: onboardingProgress } = useQuery({
        queryKey: ['onboarding-progress', user?.email],
        queryFn: async () => {
            const results = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
            return results[0];
        },
        enabled: !!user
    });

    // Auto-show wizard for new users
    React.useEffect(() => {
        if (user && selectedProject && !onboardingProgress?.wizard_completed) {
            const timer = setTimeout(() => setShowSetupWizard(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [user, selectedProject, onboardingProgress]);

    const enabledWidgets = preferences?.enabled_widgets || ['progress', 'milestones', 'deadlines', 'budget', 'activity'];
    const widgetOrder = preferences?.widget_order || ['progress', 'milestones', 'deadlines', 'budget', 'activity'];

    // Render widgets in custom order
    const renderWidget = (widgetId) => {
        if (!enabledWidgets.includes(widgetId)) return null;
        
        switch(widgetId) {
            case 'progress':
                return <ProgressWidget key="progress" project={selectedProject} />;
            case 'milestones':
                return <MilestonesWidget key="milestones" milestones={milestones} />;
            case 'deadlines':
                return <DeadlinesWidget key="deadlines" milestones={milestones} tasks={tasks} />;
            case 'budget':
                return <BudgetWidget key="budget" project={selectedProject} timeLogs={timeLogs} />;
            case 'activity':
                return <ActivityWidget key="activity" project={selectedProject} />;
            default:
                return null;
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        const formData = new FormData(e.target);
        formData.append('project_id', selectedProject.id);

        try {
            const response = await base44.functions.invoke('uploadClientFile', formData);
            queryClient.invalidateQueries({ queryKey: ['client-files'] });
            setUploadDialogOpen(false);
            e.target.reset();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        }

        setIsUploading(false);
    };

    const updateTaskStatus = useMutation({
        mutationFn: ({ taskId, status }) => base44.entities.OnboardingTask.update(taskId, { 
            status,
            completed_date: status === 'completed' ? new Date().toISOString() : null
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] });
        },
    });

    const deleteFileMutation = useMutation({
        mutationFn: (fileId) => base44.entities.ClientFile.delete(fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-files'] });
        },
    });

    const submitFeedbackMutation = useMutation({
        mutationFn: async (feedbackData) => {
            const feedback = await base44.entities.ClientFeedback.create(feedbackData);
            // Trigger communication
            await base44.functions.invoke('sendClientCommunication', {
                event_type: 'feedback_submitted',
                project_id: selectedProject?.id,
                recipient_email: user.email,
                recipient_name: user.full_name
            });
            return feedback;
        },
        onSuccess: () => {
            alert('Thank you for your feedback!');
        },
    });

    // Sample data for visualizations
    const trafficData = [
        { date: 'Mon', visitors: 120 },
        { date: 'Tue', visitors: 150 },
        { date: 'Wed', visitors: 180 },
        { date: 'Thu', visitors: 160 },
        { date: 'Fri', visitors: 200 },
        { date: 'Sat', visitors: 95 },
        { date: 'Sun', visitors: 110 }
    ];

    const conversionFunnelData = [
        { stage: 'Visitors', value: 1000, fill: '#DC2626' },
        { stage: 'Leads', value: 600, fill: '#EF4444' },
        { stage: 'Qualified', value: 300, fill: '#F87171' },
        { stage: 'Customers', value: 150, fill: '#FCA5A5' }
    ];

    const milestoneProgress = milestones.length > 0 ? [
        { 
            name: 'Completed', 
            value: milestones.filter(m => m.status === 'completed').length,
            color: '#10B981'
        },
        { 
            name: 'In Progress', 
            value: milestones.filter(m => m.status === 'in_progress').length,
            color: '#3B82F6'
        },
        { 
            name: 'Pending', 
            value: milestones.filter(m => m.status === 'pending').length,
            color: '#6B7280'
        }
    ] : [];

    const statusColors = {
        onboarding: 'bg-blue-500/10 text-blue-600',
        in_progress: 'bg-yellow-500/10 text-yellow-600',
        review: 'bg-purple-500/10 text-purple-600',
        completed: 'bg-green-500/10 text-green-600',
        on_hold: 'bg-gray-500/10 text-gray-600'
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!selectedProject && projects.length > 0) {
        setSelectedProject(projects[0]);
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto" ref={contentRef}>
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {user.full_name}!</h1>
                        <p className="text-muted-foreground">Track your project progress and metrics</p>
                    </div>
                    <div className="flex gap-2">
                        <NotificationCenter user={user} />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSetupWizard(true)}
                            title="Setup Wizard"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Setup
                        </Button>
                        <OnboardingTrigger user={user} />
                        <DashboardCustomizer preferences={preferences} user={user} />
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => base44.auth.logout()}
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Auto-show onboarding for new users */}
                <OnboardingAssistant user={user} />

                {projects.length === 0 ? (
                    <div className="bg-card border rounded-xl p-12 text-center">
                        <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
                        <p className="text-muted-foreground">Your projects will appear here once they're created</p>
                    </div>
                ) : (
                    <>
                        {/* Project Selector */}
                        {projects.length > 1 && (
                            <div className="mb-6">
                                <Label>Select Project</Label>
                                <Select 
                                    value={selectedProject?.id} 
                                    onValueChange={(id) => setSelectedProject(projects.find(p => p.id === id))}
                                >
                                    <SelectTrigger className="max-w-md">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>
                                                {project.project_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Onboarding Progress (for new projects) */}
                        {selectedProject?.status === 'onboarding' && (
                            <div className="mb-6">
                                <OnboardingProgress 
                                    project={selectedProject} 
                                    onShowAssistant={() => setShowOnboardingAssistant(true)}
                                />
                            </div>
                        )}

                        {/* Customizable Widgets */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {widgetOrder.map(widgetId => renderWidget(widgetId))}
                        </div>

                        {/* Main Content Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                            <TabsList className="flex-wrap h-auto">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="discussion">Forum</TabsTrigger>
                                <TabsTrigger value="messages">Messages</TabsTrigger>
                                <TabsTrigger value="approvals">Deliverables</TabsTrigger>
                                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                                <TabsTrigger value="files">Files</TabsTrigger>
                                {tasks.length > 0 && <TabsTrigger value="onboarding">Onboarding</TabsTrigger>}
                                <TabsTrigger value="reports">Reports</TabsTrigger>
                                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                            </TabsList>

                            <TabsContent value="approvals" className="mt-6">
                                <div className="bg-card border rounded-xl p-6">
                                    <h3 className="text-lg font-bold mb-4">Deliverables Awaiting Review</h3>
                                    {deliverables.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No deliverables yet</p>
                                    ) : (
                                        <div className="space-y-6">
                                            {deliverables.map(deliverable => (
                                                <div key={deliverable.id} className="space-y-4">
                                                    <DeliverableApprovalCard 
                                                        deliverable={deliverable}
                                                        onProvideFeedback={(d) => {
                                                            setSelectedDeliverable(d);
                                                            setFeedbackDialogOpen(true);
                                                        }}
                                                    />
                                                    <Card>
                                                        <CardContent className="pt-6">
                                                            <DeliverableDiscussion 
                                                                deliverable={deliverable}
                                                                projectId={selectedProject.id}
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="overview" className="mt-6">
                                <div className="grid gap-6">
                                    {/* KPI Dashboard */}
                                    <div className="bg-card border rounded-xl p-6">
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5" />
                                            Key Performance Indicators
                                        </h3>
                                        {selectedProject?.metrics && Object.keys(selectedProject.metrics).length > 0 ? (
                                            <div className="grid lg:grid-cols-2 gap-6">
                                                {/* Metrics Summary */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    {Object.entries(selectedProject.metrics).map(([key, value]) => (
                                                        <motion.div 
                                                            key={key} 
                                                            className="p-4 border rounded-lg bg-gradient-to-br from-red-50 to-white dark:from-red-950/10 dark:to-background"
                                                            whileHover={{ scale: 1.02 }}
                                                        >
                                                            <p className="text-xs text-muted-foreground capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                                                            <p className="text-2xl font-bold text-red-600">{value}</p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                
                                                {/* Performance Chart */}
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-4">Growth Trend</p>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <LineChart data={[
                                                            { month: 'Week 1', value: 20 },
                                                            { month: 'Week 2', value: 35 },
                                                            { month: 'Week 3', value: 45 },
                                                            { month: 'Week 4', value: 60 }
                                                        ]}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="month" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Line type="monotone" dataKey="value" stroke="#DC2626" strokeWidth={2} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                                <p className="text-muted-foreground mb-4">KPIs will be available once your project progresses</p>
                                                <p className="text-sm text-muted-foreground">Contact your account manager for more details</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-6">
                                        <div className="bg-card border rounded-xl p-6">
                                            <h3 className="text-lg font-bold mb-4">Project Details</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Project Name</p>
                                                    <p className="font-medium">{selectedProject?.project_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Type</p>
                                                    <p className="font-medium capitalize">{selectedProject?.project_type?.replace('_', ' ')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                                    <p className="font-medium">
                                                        {selectedProject?.start_date 
                                                            ? new Date(selectedProject.start_date).toLocaleDateString()
                                                            : 'TBD'}
                                                    </p>
                                                </div>
                                                {selectedProject?.description && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Description</p>
                                                        <p className="text-sm">{selectedProject.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-card border rounded-xl p-6">
                                            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                                            <div className="space-y-3">
                                                <Button 
                                                    onClick={() => setConsultationDialogOpen(true)}
                                                    className="w-full bg-red-600 hover:bg-red-700"
                                                >
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Schedule Consultation
                                                </Button>
                                                <Button onClick={() => setUploadDialogOpen(true)} variant="outline" className="w-full">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Files
                                                </Button>
                                                <Button variant="outline" className="w-full" onClick={() => setActiveTab('messages')}>
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Message Account Manager
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="analytics" className="mt-6">
                                <div className="space-y-6">
                                    {/* Traffic Visualization */}
                                    <div className="bg-card border rounded-xl p-6">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" />
                                            Website Traffic - Last 7 Days
                                        </h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={trafficData}>
                                                <defs>
                                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="visitors" stroke="#DC2626" fillOpacity={1} fill="url(#colorVisitors)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-6">
                                        {/* Conversion Funnel */}
                                        <div className="bg-card border rounded-xl p-6">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Target className="w-5 h-5" />
                                                Lead Conversion Funnel
                                            </h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={conversionFunnelData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="stage" type="category" />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#DC2626">
                                                        {conversionFunnelData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Conversion Rate:</span>
                                                    <span className="font-bold text-green-600">15%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Avg. Time to Convert:</span>
                                                    <span className="font-bold">14 days</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Milestone Progress Chart */}
                                        {milestoneProgress.length > 0 && (
                                            <div className="bg-card border rounded-xl p-6">
                                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Milestone Progress
                                                </h3>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={milestoneProgress}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {milestoneProgress.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="mt-4 space-y-2">
                                                    {milestoneProgress.map((item) => (
                                                        <div key={item.name} className="flex justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                                <span>{item.name}</span>
                                                            </div>
                                                            <span className="font-bold">{item.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="milestones" className="mt-6">
                                <div className="bg-card border rounded-xl p-6">
                                    <h3 className="text-lg font-bold mb-4">Project Milestones</h3>
                                    {milestones.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No milestones yet</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {milestones.sort((a, b) => a.order - b.order).map((milestone) => (
                                                <div key={milestone.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        milestone.status === 'completed' ? 'bg-green-500/20' :
                                                        milestone.status === 'in_progress' ? 'bg-blue-500/20' :
                                                        milestone.status === 'overdue' ? 'bg-red-500/20' : 'bg-gray-500/20'
                                                    }`}>
                                                        {milestone.status === 'completed' ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        ) : milestone.status === 'overdue' ? (
                                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                                        ) : (
                                                            <Clock className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium mb-1">{milestone.title}</h4>
                                                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                                                                <Badge variant="outline" className="capitalize">
                                                                    {milestone.status.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedMilestone(milestone);
                                                                    setFeedbackDialogOpen(true);
                                                                }}
                                                            >
                                                                Give Feedback
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="files" className="mt-6">
                                <div className="bg-card border rounded-xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold">Project Files</h3>
                                        <Button onClick={() => setUploadDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload File
                                        </Button>
                                    </div>
                                    <FileManager 
                                        files={files} 
                                        onDelete={(fileId) => deleteFileMutation.mutate(fileId)}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="onboarding" className="mt-6">
                                <div className="bg-card border rounded-xl p-6">
                                    <h3 className="text-lg font-bold mb-4">Onboarding Checklist</h3>
                                    <div className="space-y-3">
                                        {tasks.sort((a, b) => a.order - b.order).map((task) => (
                                            <div key={task.id} className="flex items-start gap-3 p-4 border rounded-lg">
                                                <button
                                                    onClick={() => updateTaskStatus.mutate({ 
                                                        taskId: task.id, 
                                                        status: task.status === 'completed' ? 'pending' : 'completed' 
                                                    })}
                                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                                        task.status === 'completed' 
                                                            ? 'bg-green-500 border-green-500' 
                                                            : 'border-gray-300 hover:border-green-500'
                                                    }`}
                                                >
                                                    {task.status === 'completed' && (
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    )}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                            {task.task_title}
                                                        </h4>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSelectedMilestone({ ...task, title: task.task_title, description: task.task_description });
                                                                setFeedbackDialogOpen(true);
                                                            }}
                                                        >
                                                            Add Feedback
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{task.task_description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="reports" className="mt-6">
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <ReportsHistory project={selectedProject} />
                                    <ReportSubscriptionSettings project={selectedProject} user={user} />
                                </div>
                            </TabsContent>

                            <TabsContent value="kanban" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Task Board</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {projectTasks.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-12">
                                                No tasks to display
                                            </p>
                                        ) : (
                                            <KanbanBoard tasks={projectTasks} />
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="documents" className="mt-6">
                                <SharedDocumentEditor project={selectedProject} user={user} />
                            </TabsContent>

                            <TabsContent value="discussion" className="mt-6">
                                <ProjectDiscussionForum project={selectedProject} user={user} />
                            </TabsContent>

                            <TabsContent value="messages" className="mt-6">
                                <ClientMessaging project={selectedProject} user={user} />
                            </TabsContent>

                            <TabsContent value="feedback" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5" />
                                            My Feedback History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {clientFeedback.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-8">
                                                    No feedback submitted yet
                                                </p>
                                            ) : (
                                                clientFeedback.map((feedback) => (
                                                    <Card key={feedback.id}>
                                                        <CardContent className="pt-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <Star
                                                                            key={star}
                                                                            className={`w-4 h-4 ${
                                                                                star <= feedback.rating
                                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                                    : 'text-gray-300'
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <Badge className={
                                                                    feedback.status === 'pending_review' 
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : feedback.status === 'reviewed'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                }>
                                                                    {feedback.status.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm mb-2">{feedback.feedback_text}</p>
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                {format(new Date(feedback.created_date), 'MMM d, yyyy')}
                                                            </p>
                                                            {feedback.admin_response && (
                                                                <div className="bg-muted p-3 rounded-lg mt-3">
                                                                    <p className="text-xs font-semibold mb-1">Team Response:</p>
                                                                    <p className="text-sm">{feedback.admin_response}</p>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                            <Button
                                                onClick={() => setFeedbackDialogOpen(true)}
                                                className="w-full bg-red-600 hover:bg-red-700"
                                            >
                                                Submit New Feedback
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}

                {/* Upload Dialog */}
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload File</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleFileUpload} className="space-y-4">
                            <div>
                                <Label>File *</Label>
                                <Input name="file" type="file" required />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select name="category" defaultValue="other">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="asset">Asset</SelectItem>
                                        <SelectItem value="deliverable">Deliverable</SelectItem>
                                        <SelectItem value="feedback">Feedback</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea name="description" placeholder="Optional description" />
                            </div>
                            <Button type="submit" disabled={isUploading} className="w-full bg-red-600 hover:bg-red-700">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload'
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <FeedbackDialog
                    open={feedbackDialogOpen}
                    onClose={() => {
                        setFeedbackDialogOpen(false);
                        setSelectedMilestone(null);
                        setSelectedDeliverable(null);
                    }}
                    milestone={selectedMilestone}
                    deliverable={selectedDeliverable}
                    projectId={selectedProject?.id}
                    onSubmit={(feedbackData) => submitFeedbackMutation.mutate(feedbackData)}
                />

                <QuickConsultationScheduler
                    project={selectedProject}
                    user={user}
                    open={consultationDialogOpen}
                    onClose={() => setConsultationDialogOpen(false)}
                />

                <OnboardingAssistant
                    user={user}
                    project={selectedProject}
                    forceOpen={showOnboardingAssistant}
                    onComplete={() => setShowOnboardingAssistant(false)}
                />

                <SetupWizard
                    open={showSetupWizard}
                    onOpenChange={setShowSetupWizard}
                    user={user}
                    project={selectedProject}
                />
            </div>
        </div>
    );
}