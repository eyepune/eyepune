import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Bell, X, Check, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter({ user }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ['client-notifications', user?.email],
        queryFn: async () => {
            const all = await base44.entities.ClientNotification.list('-createdAt', 50);
            return all.filter(n => n.userEmail === user.email);
        },
        enabled: !!user?.email,
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    // Real-time subscription
    useEffect(() => {
        if (!user?.email) return;

        const unsubscribe = base44.entities.ClientNotification.subscribe((event) => {
            if (event.type === 'create' && event.data?.userEmail === user.email) {
                queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
            }
        });

        return unsubscribe;
    }, [user?.email, queryClient]);

    const markAsReadMutation = useMutation({
        mutationFn: (id) => base44.entities.ClientNotification.update(id, { isRead: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            const unread = notifications.filter(n => !n.isRead);
            await Promise.all(unread.map(n => 
                base44.entities.ClientNotification.update(n.id, { isRead: true })
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ClientNotification.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
        }
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getNotificationIcon = (type) => {
        const icons = {
            project_update: '🚀',
            new_message: '💬',
            milestone_completed: '✅',
            deliverable_ready: '📦',
            feedback_response: '💭',
            general: '📢'
        };
        return icons[type] || '📢';
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                        <Badge 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAllReadMutation.mutate()}
                        >
                            <Check className="w-3 h-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`p-4 border-b hover:bg-accent/50 transition-colors ${
                                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="text-2xl flex-shrink-0">
                                            {getNotificationIcon(notification.notificationType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 flex-shrink-0"
                                                    onClick={() => deleteMutation.mutate(notification.id)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                                <div className="flex gap-2">
                                                    {notification.actionUrl && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost"
                                                            className="h-7 px-2"
                                                            onClick={() => {
                                                                window.location.href = notification.actionUrl;
                                                                markAsReadMutation.mutate(notification.id);
                                                            }}
                                                        >
                                                            <ExternalLink className="w-3 h-3 mr-1" />
                                                            View
                                                        </Button>
                                                    )}
                                                    {!notification.isRead && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost"
                                                            className="h-7 px-2"
                                                            onClick={() => markAsReadMutation.mutate(notification.id)}
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}