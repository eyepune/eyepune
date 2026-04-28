import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from 'lucide-react';

export default function DeadlinesWidget({ milestones = [], tasks = [] }) {
    const upcomingDeadlines = [
        ...milestones.filter(m => m.status !== 'completed' && m.dueDate)
            .map(m => ({ ...m, type: 'milestone', name: m.title })),
        ...tasks.filter(t => t.status !== 'completed' && t.dueDate)
            .map(t => ({ ...t, type: 'task', name: t.title }))
    ]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    Upcoming Deadlines
                </CardTitle>
            </CardHeader>
            <CardContent>
                {upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                ) : (
                    <div className="space-y-2">
                        {upcomingDeadlines.map((item, idx) => {
                            const daysUntil = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="truncate flex-1">{item.name}</span>
                                    <span className={`text-xs ${daysUntil <= 3 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                        {daysUntil}d
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}