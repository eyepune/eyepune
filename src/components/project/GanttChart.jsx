import React, { useMemo } from 'react';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { Card } from "@/components/ui/card";

export default function GanttChart({ tasks, projects }) {
    const chartData = useMemo(() => {
        const allDates = tasks
            .filter(t => t.start_date && t.due_date)
            .flatMap(t => [new Date(t.start_date), new Date(t.due_date)]);

        if (allDates.length === 0) return { tasks: [], startDate: new Date(), endDate: new Date(), totalDays: 0 };

        const startDate = startOfWeek(new Date(Math.min(...allDates)));
        const endDate = endOfWeek(new Date(Math.max(...allDates)));
        const totalDays = differenceInDays(endDate, startDate);

        const tasksWithPosition = tasks
            .filter(t => t.start_date && t.due_date)
            .map(task => {
                const taskStart = new Date(task.start_date);
                const taskEnd = new Date(task.due_date);
                const startOffset = differenceInDays(taskStart, startDate);
                const duration = differenceInDays(taskEnd, taskStart);
                const project = projects.find(p => p.id === task.project_id);

                return {
                    ...task,
                    project_name: project?.project_name || 'Unknown',
                    startOffset: (startOffset / totalDays) * 100,
                    width: (duration / totalDays) * 100
                };
            });

        return { tasks: tasksWithPosition, startDate, endDate, totalDays };
    }, [tasks, projects]);

    const statusColors = {
        todo: '#9CA3AF',
        in_progress: '#3B82F6',
        review: '#8B5CF6',
        completed: '#10B981',
        blocked: '#EF4444'
    };

    if (chartData.tasks.length === 0) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">No tasks with dates to display in Gantt chart</p>
            </Card>
        );
    }

    return (
        <Card className="p-6 overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Header */}
                <div className="flex border-b pb-4 mb-4">
                    <div className="w-64 font-semibold">Task / Project</div>
                    <div className="flex-1 flex justify-between px-4 text-sm text-muted-foreground">
                        <span>{format(chartData.startDate, 'MMM d')}</span>
                        <span>{format(chartData.endDate, 'MMM d')}</span>
                    </div>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                    {chartData.tasks.map((task) => (
                        <div key={task.id} className="flex items-center">
                            <div className="w-64">
                                <div className="font-medium text-sm truncate">{task.task_name}</div>
                                <div className="text-xs text-muted-foreground truncate">{task.project_name}</div>
                            </div>
                            <div className="flex-1 relative h-10 bg-muted/30 rounded">
                                <div
                                    className="absolute h-8 top-1 rounded shadow-sm flex items-center px-2 text-xs text-white font-medium"
                                    style={{
                                        left: `${task.startOffset}%`,
                                        width: `${task.width}%`,
                                        backgroundColor: statusColors[task.status],
                                        minWidth: '60px'
                                    }}
                                >
                                    <span className="truncate">{task.task_name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-6 pt-4 border-t text-xs">
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}