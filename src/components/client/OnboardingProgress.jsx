import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OnboardingProgress({ project, onShowAssistant }) {
    const queryClient = useQueryClient();

    const { data: tasks = [] } = useQuery({
        queryKey: ['onboarding-tasks', project?.id],
        queryFn: async () => {
            const allTasks = await base44.entities.OnboardingTask.list();
            return allTasks
                .filter(t => t.projectId === project.id)
                .sort((a, b) => a.order - b.order);
        },
        enabled: !!project?.id
    });

    const completeTaskMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.OnboardingTask.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] });
        }
    });

    const clientTasks = tasks.filter(t => t.taskType === 'client');
    const completedTasks = clientTasks.filter(t => t.status === 'completed').length;
    const progressPercentage = clientTasks.length > 0 
        ? Math.round((completedTasks / clientTasks.length) * 100) 
        : 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-600" />
                        Onboarding Progress
                    </CardTitle>
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={onShowAssistant}
                    >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Get Help
                    </Button>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                            {completedTasks} of {clientTasks.length} tasks completed
                        </span>
                        <span className="font-semibold">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {clientTasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                            task.status === 'completed' 
                                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                                : 'bg-card hover:bg-accent/50'
                        }`}
                    >
                        <button
                            onClick={() => completeTaskMutation.mutate({
                                id: task.id,
                                status: task.status === 'completed' ? 'pending' : 'completed'
                            })}
                            className="mt-0.5"
                        >
                            {task.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                            )}
                        </button>
                        <div className="flex-1">
                            <h4 className={`font-medium mb-1 ${
                                task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                            }`}>
                                {task.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {task.description}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {clientTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Onboarding tasks will appear here once your project is initiated.</p>
                    </div>
                )}

                {progressPercentage === 100 && clientTasks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-4 bg-green-100 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 text-center"
                    >
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            Onboarding Complete! 🎉
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            You're all set. Your project team will be in touch shortly!
                        </p>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}