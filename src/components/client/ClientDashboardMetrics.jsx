import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
    TrendingUp, Clock, CheckCircle2, AlertTriangle, 
    Calendar, Target, FileCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientDashboardMetrics({ 
    project, 
    milestones = [], 
    tasks = [],
    deliverables = [] 
}) {
    const upcomingDeadlines = [
        ...milestones.filter(m => m.status !== 'completed' && m.dueDate)
            .map(m => ({ ...m, type: 'milestone' })),
        ...tasks.filter(t => t.status !== 'completed' && t.dueDate)
            .map(t => ({ ...t, type: 'task' }))
    ]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

    const completionRate = milestones.length > 0 
        ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100 
        : 0;

    const pendingApprovals = deliverables.filter(d => d.status === 'pending_review').length;
    const approvedDeliverables = deliverables.filter(d => d.status === 'approved').length;

    const daysUntilCompletion = project?.expectedCompletionDate 
        ? Math.ceil((new Date(project.expectedCompletionDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const metrics = [
        {
            icon: Target,
            label: 'Overall Progress',
            value: `${Math.round(completionRate)}%`,
            color: 'bg-blue-500/10 text-blue-600',
            iconColor: 'text-blue-600',
            progress: completionRate
        },
        {
            icon: CheckCircle2,
            label: 'Milestones Completed',
            value: `${milestones.filter(m => m.status === 'completed').length}/${milestones.length}`,
            color: 'bg-green-500/10 text-green-600',
            iconColor: 'text-green-600'
        },
        {
            icon: FileCheck,
            label: 'Approved Deliverables',
            value: approvedDeliverables,
            color: 'bg-purple-500/10 text-purple-600',
            iconColor: 'text-purple-600'
        },
        {
            icon: AlertTriangle,
            label: 'Pending Approvals',
            value: pendingApprovals,
            color: 'bg-orange-500/10 text-orange-600',
            iconColor: 'text-orange-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${metric.color} flex items-center justify-center flex-shrink-0`}>
                                        <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                                        <p className="text-2xl font-bold">{metric.value}</p>
                                    </div>
                                </div>
                                {metric.progress !== undefined && (
                                    <Progress value={metric.progress} className="mt-3" />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Upcoming Deadlines */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-lg">Upcoming Deadlines</h3>
                    </div>
                    
                    {daysUntilCompletion !== null && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-red-600" />
                                <div>
                                    <p className="font-semibold">Project Completion Target</p>
                                    <p className="text-sm text-muted-foreground">
                                        {daysUntilCompletion > 0 
                                            ? `${daysUntilCompletion} days remaining`
                                            : daysUntilCompletion === 0
                                            ? 'Due today!'
                                            : `${Math.abs(daysUntilCompletion)} days overdue`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {upcomingDeadlines.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No upcoming deadlines</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingDeadlines.map((item, index) => {
                                const daysUntil = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                const isOverdue = daysUntil < 0;
                                const isDueSoon = daysUntil <= 3 && daysUntil >= 0;
                                
                                return (
                                    <div 
                                        key={`${item.type}-${item.id}`}
                                        className={`flex items-center justify-between p-3 border rounded-lg ${
                                            isOverdue ? 'border-red-300 bg-red-50 dark:bg-red-950' :
                                            isDueSoon ? 'border-orange-300 bg-orange-50 dark:bg-orange-950' :
                                            'bg-muted'
                                        }`}
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {item.type}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${
                                                isOverdue ? 'text-red-600' :
                                                isDueSoon ? 'text-orange-600' :
                                                'text-foreground'
                                            }`}>
                                                {new Date(item.dueDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {isOverdue 
                                                    ? `${Math.abs(daysUntil)} days overdue`
                                                    : daysUntil === 0
                                                    ? 'Due today'
                                                    : `${daysUntil} days left`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}