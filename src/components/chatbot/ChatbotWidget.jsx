import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: 'Hi! 👋 I\'m EyE PunE\'s AI assistant. How can I help you today? Feel free to ask about our services, book a consultation, or take the AI Assessment.',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);
    const messageId = useRef(messages.length + 1);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        // Add user message
        const userMessage = {
            id: messageId.current++,
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = `You are the EyE PunE AI Assistant. EyE PunE is an AI-powered Digital Growth Agency based in Pune, India. 
            We specialize in:
            - AI Automation & Workflows
            - Web Development & Sales Funnels
            - Social Media Management
            - Paid Ads (Google/Meta)
            - Branding & Performance Marketing
            
            Be professional, helpful, and concise. If the user asks about specific services, encourage them to book a consultation or take our Free AI Assessment.
            User's message: ${input}`;

            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: systemPrompt,
                    temperature: 0.7
                }),
            });

            if (!response.ok) throw new Error('API failed');
            
            const data = await response.json();

            const assistantMessage = {
                id: messageId.current++,
                role: 'assistant',
                content: data.content,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = {
                id: messageId.current++,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again or contact us at connect@eyepune.com',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-40 rounded-full bg-red-600 hover:bg-red-700 text-white p-4 shadow-lg"
                aria-label="Open chat"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-background border rounded-xl shadow-2xl flex flex-col"
                        style={{ maxHeight: '600px' }}
                    >
                        {/* Header */}
                        <div className="bg-red-600 text-white p-4 rounded-t-xl">
                            <h3 className="font-semibold">EyE PunE Assistant</h3>
                            <p className="text-xs text-red-100">Always here to help</p>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-xs px-4 py-2 rounded-lg ${
                                                message.role === 'user'
                                                    ? 'bg-red-600 text-white rounded-br-none'
                                                    : 'bg-muted text-foreground rounded-bl-none'
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    message.role === 'user'
                                                        ? 'text-red-100'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {new Date(message.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted px-4 py-2 rounded-lg rounded-bl-none">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="border-t p-4 flex gap-2"
                        >
                            <Input
                                type="text"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}