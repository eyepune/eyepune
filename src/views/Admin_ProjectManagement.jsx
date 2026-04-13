import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminGuard from "@/components/admin/AdminGuard";
import { motion } from 'framer-motion';
import { 
    Plus, Calendar, Clock, AlertTriangle, CheckCircle2, 
    Users, TrendingUp, Filter, Search, Edit, Trash2, BarChart3, Sparkles, MessageSquare
} from 'lucide-react';
import GanttChart from "@/components/project/GanttChart";
import ResourceAllocationView from "@/components/project/ResourceAllocationView";
import InvoiceManager from "@/components/project/InvoiceManager";
import TaskComments from "@/components/project/TaskComments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function Admin_ProjectManagement() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [showTimeLogDialog, setShowTimeLogDialog] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [commentingTask, setCommentingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    const { data: projects = [] } = useQuery({
        queryKey: ['admin-projects'],
        queryFn: () => base44.entities.ClientProject.list('-created_date', 100),
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['project-tasks'],
        queryFn: () => base44.entities.ProjectTask.list('-created_date', 500),
    });

    const { data: timeLogs = [] } = useQuery({
        queryKey: ['time-logs'],
        queryFn: () => base44.entities.TimeLog.list('-date', 500),
    });

    const { data: teamMembers = [] } = useQuery({
        queryKey: ['team-members'],
        queryFn: async () => {
            const users = await base44.entities.User.list();
            return users.filter(u => u.role === 'admin');
        },
    });

    const createTaskMutation = useMutation({
        mutationFn: (data) => base44.entities.ProjectTask.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
            setShowTaskDialog(false);
            setEditingTask(null);
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ProjectTask.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
            setShowTaskDialog(false);
            setEditingTask(null);
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id) => base44.entities.ProjectTask.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks'] }),
    });

    const createTimeLogMutation = useMutation({
        mutationFn: (data) => base44.entities.TimeLog.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-logs'] });
            setShowTimeLogDialog(false);
        },
    });

    // Calculate project health metrics
    const projectHealth = useMemo(() => {
        return projects.map(project => {
            const projectTasks = tasks.filter(t => t.project_id === project.id);
            const overdueTasks = projectTasks.filter(t => 
                t.status !== 'completed' && 
                t.due_date && 
                new Date(t.due_date) < new Date()
            );
            const blockedTasks = projectTasks.filter(t => t.status === 'blocked');
            const completedTasks = projectTasks.filter(t => t.status === 'completed');
            const totalHours = timeLogs
                .filter(log => log.project_id === project.id)
                .reduce((sum, log) => sum + log.hours, 0);

            let healthScore = 100;
            if (overdueTasks.length > 0) healthScore -= overdueTasks.length * 10;
            if (blockedTasks.length > 0) healthScore -= blockedTasks.length * 15;
            if (projectTasks.length > 0) {
                const completionRate = (completedTasks.length / projectTasks.length) * 100;
                if (completionRate < 30) healthScore -= 20;
            }

            return {
                ...project,
                healthScore: Math.max(0, healthScore),
                overdueTasks: overdueTasks.length,
                blockedTasks: blockedTasks.length,
                completedTasks: completedTasks.length,
                totalTasks: projectTasks.length,
                totalHours
            };
        });
    }, [projects, tasks, timeLogs]);

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            project_id: selectedProject?.id,
            task_name: formData.get('task_name'),
            description: formData.get('description'),
            assigned_to: formData.get('assigned_to'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date'),
            estimated_hours: parseFloat(formData.get('estimated_hours')) || 0
        };

        if (editingTask) {
            updateTaskMutation.mutate({ id: editingTask.id, data });
        } else {
            createTaskMutation.mutate(data);
        }
    };

    const handleTimeLogSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        createTimeLogMutation.mutate({
            project_id: selectedProject?.id,
            task_id: formData.get('task_id'),
            user_email: formData.get('user_email'),
            hours: parseFloat(formData.get('hours')),
            date: formData.get('date'),
            description: formData.get('description'),
            billable: formData.get('billable') === 'true'
        });
    };

    const priorityColors = {
        low: 'bg-blue-500/10 text-blue-600',
        medium: 'bg-yellow-500/10 text-yellow-600',
        high: 'bg-orange-500/10 text-orange-600',
        urgent: 'bg-red-500/10 text-red-600'
    };

    const statusColors = {
        todo: 'bg-gray-500/10 text-gray-600',
        in_progress: 'bg-blue-500/10 text-blue-600',
        review: 'bg-purple-500/10 text-purple-600',
        completed: 'bg-green-500/10 text-green-600',
        blocked: 'bg-red-500/10 text-red-600'
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Project Management</h1>
                        <p className="text-muted-foreground">Manage tasks, time tracking, and resources</p>
                    </div>
                </div>

                {/* Project Health Dashboard */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                At Risk
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {projectHealth.filter(p => p.healthScore < 50).length}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Overdue Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {projectHealth.reduce((sum, p) => sum + p.overdueTasks, 0)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {projectHealth.reduce((sum, p) => sum + p.completedTasks, 0)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Total Hours
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {projectHealth.reduce((sum, p) => sum + p.totalHours, 0).toFixed(1)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Project List with Health Indicators */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {projectHealth.map((project) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => setSelectedProject(project)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{project.project_name}</h3>
                                    <p className="text-sm text-muted-foreground">{project.client_name}</p>
                                </div>
                                <Badge variant={project.healthScore >= 70 ? 'default' : project.healthScore >= 50 ? 'secondary' : 'destructive'}>
                                    Health: {project.healthScore}%
                                </Badge>
                            </div>

                            <Progress value={project.healthScore} className="mb-4" />

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Tasks</p>
                                    <p className="font-bold">{project.completedTasks}/{project.totalTasks}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Overdue</p>
                                    <p className="font-bold text-red-600">{project.overdueTasks}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Hours</p>
                                    <p className="font-bold">{project.totalHours.toFixed(1)}h</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Project Detail View */}
                {selectedProject && (
                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{selectedProject.project_name}</h2>
                            <div className="flex gap-2">
                                <Button onClick={() => { setEditingTask(null); setShowTaskDialog(true); }} className="bg-red-600 hover:bg-red-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>
                                <Button onClick={() => setShowTimeLogDialog(true)} variant="outline">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Log Time
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="tasks">
                            <TabsList>
                                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                                <TabsTrigger value="timeline">Time Logs</TabsTrigger>
                                <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
                                <TabsTrigger value="resources">Resources</TabsTrigger>
                                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                            </TabsList>

                            <TabsContent value="tasks" className="mt-6">
                                <div className="flex gap-4 mb-4">
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="blocked">Blocked</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Search tasks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {tasks
                                        .filter(t => t.project_id === selectedProject.id)
                                        .filter(t => filterStatus === 'all' || t.status === filterStatus)
                                        .filter(t => t.task_name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-medium">{task.task_name}</h4>
                                                        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                                                        <Badge className={statusColors[task.status]}>{task.status}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        {task.assigned_to && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {task.assigned_to.split('@')[0]}
                                                            </span>
                                                        )}
                                                        {task.due_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(task.due_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {task.estimated_hours > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {task.actual_hours || 0}/{task.estimated_hours}h
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCommentingTask(task)}
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => { setEditingTask(task); setShowTaskDialog(true); }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => deleteTaskMutation.mutate(task.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="timeline" className="mt-6">
                                <div className="space-y-3">
                                    {timeLogs
                                        .filter(log => log.project_id === selectedProject.id)
                                        .map((log) => (
                                            <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{log.description || 'Time logged'}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {log.user_email.split('@')[0]} • {new Date(log.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">{log.hours}h</p>
                                                    {log.billable && (
                                                        <Badge variant="outline" className="text-xs">Billable</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="gantt" className="mt-6">
                                <GanttChart 
                                    tasks={tasks.filter(t => t.project_id === selectedProject.id)} 
                                    projects={[selectedProject]}
                                />
                            </TabsContent>

                            <TabsContent value="resources" className="mt-6">
                                <ResourceAllocationView projects={[selectedProject]} />
                            </TabsContent>

                            <TabsContent value="invoices" className="mt-6">
                                <InvoiceManager project={selectedProject} />
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* Task Dialog */}
                <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleTaskSubmit} className="space-y-4">
                            <div>
                                <Label>Task Name *</Label>
                                <Input name="task_name" defaultValue={editingTask?.task_name} required />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input name="description" defaultValue={editingTask?.description} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Assigned To</Label>
                                    <Select name="assigned_to" defaultValue={editingTask?.assigned_to}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select team member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teamMembers.map((member) => (
                                                <SelectItem key={member.email} value={member.email}>
                                                    {member.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select name="status" defaultValue={editingTask?.status || 'todo'}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="blocked">Blocked</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Priority</Label>
                                    <Select name="priority" defaultValue={editingTask?.priority || 'medium'}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Due Date</Label>
                                    <DatePicker name="due_date" defaultValue={editingTask?.due_date} />
                                </div>
                            </div>
                            <div>
                                <Label>Estimated Hours</Label>
                                <Input type="number" step="0.5" name="estimated_hours" defaultValue={editingTask?.estimated_hours} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                                    {editingTask ? 'Update' : 'Create'} Task
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowTaskDialog(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Time Log Dialog */}
                <Dialog open={showTimeLogDialog} onOpenChange={setShowTimeLogDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log Time</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleTimeLogSubmit} className="space-y-4">
                            <div>
                                <Label>Task (optional)</Label>
                                <Select name="task_id">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select task" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tasks
                                            .filter(t => t.project_id === selectedProject?.id)
                                            .map((task) => (
                                                <SelectItem key={task.id} value={task.id}>
                                                    {task.task_name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Team Member *</Label>
                                <Select name="user_email" required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teamMembers.map((member) => (
                                            <SelectItem key={member.email} value={member.email}>
                                                {member.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Hours *</Label>
                                    <Input type="number" step="0.5" name="hours" required />
                                </div>
                                <div>
                                    <Label>Date *</Label>
                                    <DatePicker name="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                                </div>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input name="description" placeholder="What did you work on?" />
                            </div>
                            <div>
                                <Label>Billable</Label>
                                <Select name="billable" defaultValue="true">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                                    Log Time
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowTimeLogDialog(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Task Comments Dialog */}
                {commentingTask && (
                    <Dialog open={!!commentingTask} onOpenChange={() => setCommentingTask(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{commentingTask.task_name}</DialogTitle>
                            </DialogHeader>
                            <TaskComments task={commentingTask} onClose={() => setCommentingTask(null)} />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}

export default function AdminProjectManagementPage() {
    return (
        <AdminGuard>
            <Admin_ProjectManagement />
        </AdminGuard>
    );
}