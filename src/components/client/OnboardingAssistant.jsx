import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, X, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function OnboardingAssistant({ user, project, onComplete, forceOpen }) {
    const [open, setOpen] = useState(forceOpen || false);
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef(null);

    // Check if user should see onboarding
    const { data: hasSeenOnboarding } = useQuery({
        queryKey: ['onboarding-status', user?.email],
        queryFn: async () => {
            const prefs = await base44.entities.DashboardPreference.list();
            const userPref = prefs.find(p => p.user_email === user.email);
            return !!userPref; // If preferences exist, they've been onboarded
        },
        enabled: !!user?.email,
    });

    useEffect(() => {
        if (forceOpen || (user && hasSeenOnboarding === false)) {
            setOpen(true);
            initializeConversation();
        }
    }, [user, hasSeenOnboarding, forceOpen]);

    useEffect(() => {
        setOpen(forceOpen);
    }, [forceOpen]);

    const initializeConversation = async () => {
        try {
            const conv = await base44.agents.createConversation({
                agent_name: 'clientOnboardingAssistant',
                metadata: {
                    name: 'Onboarding Session',
                    user_email: user.email,
                    project_id: project?.id,
                    project_type: project?.project_type
                }
            });
            setConversation(conv);
            
            // Send initial greeting with project context
            const greeting = project 
                ? `Hello! I'm a new client for the project: ${project.project_name} (${project.project_type}). Please help me get started with onboarding.`
                : 'Hello! I just joined as a new client.';
            
            await base44.agents.addMessage(conv, {
                role: 'user',
                content: greeting
            });
        } catch (error) {
            console.error('Failed to initialize onboarding:', error);
        }
    };

    useEffect(() => {
        if (!conversation) return;

        const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
            setMessages(data.messages);
            setIsStreaming(data.messages[data.messages.length - 1]?.role === 'assistant' && 
                          data.messages[data.messages.length - 1]?.streaming);
        });

        return unsubscribe;
    }, [conversation?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message.trim() || !conversation || isStreaming) return;

        const userMessage = message;
        setMessage('');
        
        await base44.agents.addMessage(conversation, {
            role: 'user',
            content: userMessage
        });
    };

    const handleComplete = () => {
        setOpen(false);
        if (onComplete) onComplete();
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        Welcome to Your Client Portal!
                    </DialogTitle>
                </DialogHeader>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mr-2 flex-shrink-0">
                                    <Sparkles className="w-4 h-4 text-red-600" />
                                </div>
                            )}
                            <Card className={`p-3 max-w-[85%] ${
                                msg.role === 'user' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-muted'
                            }`}>
                                {msg.role === 'user' ? (
                                    <p className="text-sm">{msg.content}</p>
                                ) : (
                                    <ReactMarkdown 
                                        className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1"
                                        components={{
                                            p: ({ children }) => <p className="my-1">{children}</p>,
                                            ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </Card>
                        </div>
                    ))}
                    {isStreaming && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Assistant is typing...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="pt-4 border-t space-y-2">
                    <div className="flex gap-2">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ask me anything about the portal..."
                            className="flex-1 min-h-[60px]"
                            disabled={isStreaming}
                        />
                        <Button 
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isStreaming}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleComplete}
                        >
                            I'm Ready to Explore
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}