import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityWidget({ project }) {
    const { data: messages = [] } = useQuery({
        queryKey: ['client-messages', project?.id],
        queryFn: async () => {
            const all = await base44.entities.ClientMessage.list('-createdAt', 10);
            return all.filter(m => m.projectId === project.id).slice(0, 3);
        },
        enabled: !!project?.id,
    });

    const { data: files = [] } = useQuery({
        queryKey: ['recent-files', project?.id],
        queryFn: async () => {
            const all = await base44.entities.ClientFile.list('-createdAt', 10);
            return all.filter(f => f.projectId === project.id).slice(0, 2);
        },
        enabled: !!project?.id,
    });

    const activities = [
        ...messages.map(m => ({ type: 'message', text: `${m.senderName} sent a message`, date: m.createdAt })),
        ...files.map(f => ({ type: 'file', text: `File uploaded: ${f.fileName}`, date: f.createdAt }))
    ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

    const icons = {
        message: MessageSquare,
        file: FileText,
        milestone: CheckCircle2
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity, idx) => {
                            const Icon = icons[activity.type] || Activity;
                            return (
                                <div key={idx} className="flex items-start gap-3">
                                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{activity.text}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(activity.date), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}