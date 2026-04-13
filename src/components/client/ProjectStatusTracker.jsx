import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, PlayCircle, TrendingUp } from "lucide-react";
import moment from "moment";

export default function ProjectStatusTracker({ projectId }) {
    const { data: project } = useQuery({
        queryKey: ['client-project', projectId],
        queryFn: () => base44.entities.ClientProject.filter({ id: projectId }).then(r => r[0])
    });

    const { data: milestones = [] } = useQuery({
        queryKey: ['project-milestones', projectId],
        queryFn: () => base44.entities.ClientMilestone.filter({ project_id: projectId }, 'target_date')
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['project-tasks', projectId],
        queryFn: () => base44.entities.ProjectTask.filter({ project_id: projectId })
    });

    if (!project) return null;

    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = milestones.length;
    const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const overallProgress = project.progress_percentage || 0;

    const getStatusConfig = (status) => {
        const configs = {
            planning: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-600/10', label: 'Planning' },
            in_progress: { icon: PlayCircle, color: 'text-yellow-600', bg: 'bg-yellow-600/10', label: 'In Progress' },
            completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-600/10', label: 'Completed' },
            on_hold: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-600/10', label: 'On Hold' }
        };
        return configs[status] || configs.planning;
    };

    const statusConfig = getStatusConfig(project.status);
    const StatusIcon = statusConfig.icon;

    const upcomingMilestones = milestones
        .filter(m => m.status !== 'completed' && new Date(m.target_date) > new Date())
        .slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Project Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{project.project_name}</CardTitle>
                        <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusConfig.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-semibold">{Math.round(overallProgress)}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                            <p className="font-medium">{moment(project.start_date).format('MMM DD, YYYY')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                            <p className="font-medium">{moment(project.deadline).format('MMM DD, YYYY')}</p>
                        </div>
                    </div>

                    {project.description && (
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Project Description</p>
                            <p className="text-sm">{project.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Progress Stats */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-600/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Milestones</p>
                                <p className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</p>
                                <Progress value={milestoneProgress} className="h-2 mt-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Tasks</p>
                                <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
                                <Progress value={taskProgress} className="h-2 mt-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Milestones */}
            {upcomingMilestones.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingMilestones.map(milestone => (
                                <div key={milestone.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium">{milestone.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Due: {moment(milestone.target_date).format('MMM DD, YYYY')}
                                            {' '}({moment(milestone.target_date).fromNow()})
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Budget Information */}
            {project.budget && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                                <p className="text-xl font-bold">₹{project.budget.toLocaleString()}</p>
                            </div>
                            {project.budget_spent && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Spent</p>
                                    <p className="text-xl font-bold">₹{project.budget_spent.toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}