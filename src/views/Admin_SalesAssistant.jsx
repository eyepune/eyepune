import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bot, Send, Loader2, User, TrendingUp, Calendar, DollarSign, MessageSquare, Plus } from 'lucide-react';
import AdminGuard from "@/components/admin/AdminGuard";
import ReactMarkdown from 'react-markdown';

export default function Admin_SalesAssistant() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const [newConvLeadId, setNewConvLeadId] = useState('');
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: conversations = [] } = useQuery({
        queryKey: ['sales-conversations'],
        queryFn: () => base44.agents.listConversations({ agent_name: 'salesAssistant' }),
        refetchInterval: 5000
    });

    const { data: leads = [] } = useQuery({
        queryKey: ['leads-for-assistant'],
        queryFn: () => base44.entities.Lead.filter({ source: 'ai_assessment' }, '-created_date', 100)
    });

    const { data: activeConversation, isLoading: loadingConversation } = useQuery({
        queryKey: ['conversation-detail', selectedConversation?.id],
        queryFn: () => base44.agents.getConversation(selectedConversation.id),
        enabled: !!selectedConversation,
        refetchInterval: 2000
    });

    useEffect(() => {
        if (activeConversation && selectedConversation) {
            const unsubscribe = base44.agents.subscribeToConversation(selectedConversation.id, (data) => {
                queryClient.setQueryData(['conversation-detail', selectedConversation.id], data);
            });
            return () => unsubscribe();
        }
    }, [selectedConversation?.id, activeConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const createConversationMutation = useMutation({
        mutationFn: async (leadId) => {
            const lead = leads.find(l => l.id === leadId);
            return await base44.agents.createConversation({
                agent_name: 'salesAssistant',
                metadata: {
                    name: `Sales - ${lead.full_name}`,
                    lead_id: leadId,
                    lead_email: lead.email
                }
            });
        },
        onSuccess: (newConv) => {
            queryClient.invalidateQueries(['sales-conversations']);
            setSelectedConversation(newConv);
            setIsCreatingConversation(false);
            setNewConvLeadId('');
        }
    });

    const sendMessageMutation = useMutation({
        mutationFn: async ({ conversation, message }) => {
            return await base44.agents.addMessage(conversation, {
                role: 'user',
                content: message
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['conversation-detail', selectedConversation.id]);
            setMessage('');
        }
    });

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !activeConversation) return;
        
        sendMessageMutation.mutate({
            conversation: activeConversation,
            message: message.trim()
        });
    };

    const handleCreateConversation = (e) => {
        e.preventDefault();
        if (!newConvLeadId) return;
        createConversationMutation.mutate(newConvLeadId);
    };

    const getLeadForConversation = (conv) => {
        return leads.find(l => l.id === conv.metadata?.lead_id);
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-background">
                <div className="h-screen flex flex-col">
                    {/* Header */}
                    <div className="border-b bg-card px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <Bot className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">AI Sales Assistant</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Engage and qualify leads from AI assessments
                                    </p>
                                </div>
                            </div>
                            <Button onClick={() => setIsCreatingConversation(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Conversation
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Conversations Sidebar */}
                        <div className="w-80 border-r bg-muted/30">
                            <ScrollArea className="h-full">
                                <div className="p-4 space-y-2">
                                    {conversations.map((conv) => {
                                        const lead = getLeadForConversation(conv);
                                        const lastMessage = conv.messages?.[conv.messages?.length - 1];
                                        
                                        return (
                                            <motion.div
                                                key={conv.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <Card
                                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                                        selectedConversation?.id === conv.id ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : ''
                                                    }`}
                                                    onClick={() => setSelectedConversation(conv)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                                {lead?.full_name?.charAt(0) || 'L'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold truncate">
                                                                    {lead?.full_name || 'Unknown Lead'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {lead?.company || lead?.email || 'No details'}
                                                                </p>
                                                                {lastMessage && (
                                                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                                                        {lastMessage.content?.substring(0, 40)}...
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {conv.messages?.length || 0} msgs
                                                                    </Badge>
                                                                    {lead?.status && (
                                                                        <Badge className="text-xs">
                                                                            {lead.status}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                    
                                    {conversations.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No conversations yet</p>
                                            <Button 
                                                variant="link" 
                                                onClick={() => setIsCreatingConversation(true)}
                                                className="mt-2"
                                            >
                                                Start one now
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {selectedConversation && activeConversation ? (
                                <>
                                    {/* Lead Info Header */}
                                    {(() => {
                                        const lead = getLeadForConversation(selectedConversation);
                                        return lead ? (
                                            <div className="border-b bg-card p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
                                                            {lead.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg">{lead.full_name}</h3>
                                                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        {lead.lead_score && (
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                                                                <TrendingUp className="w-4 h-4 text-red-600" />
                                                                <span className="text-sm font-semibold">Score: {lead.lead_score}</span>
                                                            </div>
                                                        )}
                                                        <Badge>{lead.status}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Messages */}
                                    <ScrollArea className="flex-1 p-6">
                                        <div className="space-y-6 max-w-4xl mx-auto">
                                            {activeConversation.messages?.map((msg, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {msg.role === 'assistant' && (
                                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                                            <Bot className="w-5 h-5 text-red-600" />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                                                        <div className={`rounded-2xl px-4 py-3 ${
                                                            msg.role === 'user' 
                                                                ? 'bg-red-600 text-white' 
                                                                : 'bg-muted'
                                                        }`}>
                                                            {msg.role === 'assistant' ? (
                                                                <ReactMarkdown
                                                                    className="prose prose-sm dark:prose-invert max-w-none"
                                                                    components={{
                                                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                                        ul: ({node, ...props}) => <ul className="mb-2 ml-4 list-disc" {...props} />,
                                                                        ol: ({node, ...props}) => <ol className="mb-2 ml-4 list-decimal" {...props} />,
                                                                        li: ({node, ...props}) => <li className="mb-1" {...props} />
                                                                    }}
                                                                >
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            ) : (
                                                                <p className="text-sm">{msg.content}</p>
                                                            )}
                                                        </div>
                                                        {msg.tool_calls && msg.tool_calls.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {msg.tool_calls.map((tool, tidx) => (
                                                                    <div key={tidx} className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {tool.name?.split('.').pop()}
                                                                        </Badge>
                                                                        {tool.status && <span>• {tool.status}</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {msg.role === 'user' && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>

                                    {/* Input */}
                                    <div className="border-t p-4 bg-card">
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <Input
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1"
                                                disabled={sendMessageMutation.isPending}
                                            />
                                            <Button 
                                                type="submit"
                                                disabled={!message.trim() || sendMessageMutation.isPending}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {sendMessageMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">Select a conversation to start</p>
                                        <p className="text-sm mt-2">or create a new one to engage with a lead</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Create Conversation Dialog */}
                <AnimatePresence>
                    {isCreatingConversation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setIsCreatingConversation(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                className="bg-card border rounded-2xl p-6 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-bold mb-4">Start Sales Conversation</h3>
                                <form onSubmit={handleCreateConversation} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Select Lead</label>
                                        <select
                                            value={newConvLeadId}
                                            onChange={(e) => setNewConvLeadId(e.target.value)}
                                            className="w-full p-2 border rounded-lg bg-background"
                                            required
                                        >
                                            <option value="">Choose a lead...</option>
                                            {leads.map(lead => (
                                                <option key={lead.id} value={lead.id}>
                                                    {lead.full_name} - {lead.company || lead.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreatingConversation(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-red-600 hover:bg-red-700"
                                            disabled={createConversationMutation.isPending}
                                        >
                                            {createConversationMutation.isPending ? 'Creating...' : 'Create'}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminGuard>
    );
}