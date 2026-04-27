import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Paperclip, File, Calendar, Bell } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { createPageUrl } from "@/utils";

export default function ClientMessaging({ project, user }) {
    const [message, setMessage] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: messages = [], dataUpdatedAt } = useQuery({
        queryKey: ['client-messages', project.id],
        queryFn: async () => {
            const allMessages = await base44.entities.ClientMessage.list('-created_date', 100);
            return allMessages
                .filter(m => m.project_id === project.id)
                .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        },
    });

    // Real-time subscription for new messages
    useEffect(() => {
        if (!project?.id) return;

        const unsubscribe = base44.entities.ClientMessage.subscribe((event) => {
            if (event.type === 'create' && event.data?.project_id === project.id) {
                // Show notification for messages from team
                if (event.data.sender_email !== user.email) {
                    toast.success(`New message from ${event.data.sender_name}`, {
                        description: event.data.message_text.substring(0, 50) + '...',
                        duration: 5000,
                    });

                    // Browser notification if permitted
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('New Message', {
                            body: `${event.data.sender_name}: ${event.data.message_text.substring(0, 100)}`,
                            icon: '/logo.png'
                        });
                    }
                }
                queryClient.invalidateQueries({ queryKey: ['client-messages'] });
            }
        });

        return () => unsubscribe();
    }, [project?.id, user?.email, queryClient]);

    const sendMessageMutation = useMutation({
        mutationFn: async (data) => {
            let attachmentUrl = null;
            
            if (attachmentFile) {
                setIsUploading(true);
                const uploadResult = await base44.integrations.Core.UploadFile({ file: attachmentFile });
                attachmentUrl = uploadResult.file_url;
                setIsUploading(false);
            }
            
            return await base44.entities.ClientMessage.create({
                ...data,
                attachment_url: attachmentUrl
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-messages'] });
            setMessage('');
            setAttachmentFile(null);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() && !attachmentFile) return;

        sendMessageMutation.mutate({
            project_id: project.id,
            sender_email: user.email,
            sender_name: user.full_name,
            message_text: message,
            sender_type: user.role === 'admin' ? 'team' : 'client'
        });
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Message Your Account Manager
                        <Bell className="w-4 h-4 text-green-600" title="Real-time notifications enabled" />
                    </div>
                    <Link href={createPageUrl("Booking")}>
                        <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Call
                        </Button>
                    </Link>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                    Get instant responses • Messages update in real-time
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col h-[500px]">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                        {messages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No messages yet. Start a conversation!</p>
                            </div>
                        ) : (
                            messages.map(msg => {
                                const isOwnMessage = msg.sender_email === user.email;
                                return (
                                    <div 
                                        key={msg.id} 
                                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div 
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                isOwnMessage 
                                                    ? 'bg-red-600 text-white' 
                                                    : 'bg-muted'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-semibold ${isOwnMessage ? 'text-white' : 'text-foreground'}`}>
                                                    {msg.sender_name}
                                                </span>
                                                <span className={`text-xs ${isOwnMessage ? 'text-red-100' : 'text-muted-foreground'}`}>
                                                    {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                                            {msg.attachment_url && (
                                                <a 
                                                    href={msg.attachment_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2 text-xs mt-2 ${
                                                        isOwnMessage ? 'text-red-100 hover:text-white' : 'text-blue-600 hover:underline'
                                                    }`}
                                                >
                                                    <File className="w-3 h-3" />
                                                    View Attachment
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-2">
                        {attachmentFile && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                <File className="w-4 h-4" />
                                <span className="text-sm flex-1">{attachmentFile.name}</span>
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setAttachmentFile(null)}
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) => setAttachmentFile(e.target.files[0])}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-[80px]"
                            >
                                <Paperclip className="w-4 h-4" />
                            </Button>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 min-h-[80px] resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            <Button 
                                type="submit" 
                                disabled={(!message.trim() && !attachmentFile) || sendMessageMutation.isPending || isUploading}
                                className="bg-red-600 hover:bg-red-700 h-[80px]"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                    <p className="text-xs text-muted-foreground mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}