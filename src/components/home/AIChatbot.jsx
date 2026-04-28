'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, MessageSquare, Sparkles, Loader2, Minus, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from 'react-markdown';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: "Namaste! 🙏 I'm EyE BoT, your AI growth assistant from EyE PunE. How can I help you transform your business today?" 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const context = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
            const prompt = `You are "EyE BoT", a professional AI Sales & Growth Assistant for "EyE PunE" - Pune's premier AI-powered digital marketing agency.

Our Services:
- AI Automation & Custom Bots
- High-Performance Web Development
- Strategic Social Media Marketing
- Data-Driven Paid Ads (Meta/Google)
- Premium Branding & Design

Links you MUST provide when asked:
- Free AI Assessment: https://eyepune.com/AI_Assessment
- Book a Vision Sync Call: https://eyepune.com/Booking

Tone: Professional, helpful, ambitious, and slightly futuristic. Use emojis occasionally (like 🚀, 💡, 📈). Mention Pune context if relevant.

Goal: Answer questions about our services and encourage them to book a "Vision Sync" call or complete the "AI Assessment" form using the links provided above. Always provide the full URL starting with https://. If the user asks about starting or pricing, give them these links immediately.

User History:
${context}

User: ${input}
Assistant:`;

            const response = await base44.integrations.Core.InvokeLLM({ prompt });
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered a brief system flicker. Please try asking again!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] font-sans flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`bg-[#0c0c0c] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 pointer-events-auto ${
                            isMinimized 
                                ? 'h-16 w-64 sm:h-20 sm:w-80' 
                                : 'h-[calc(100vh-120px)] sm:h-[600px] w-[calc(100vw-2rem)] sm:w-[400px] max-h-[85vh]'
                        }`}
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm">EyE BoT <Sparkles className="inline w-3 h-3 ml-1 text-orange-200" /></h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Active Assistant</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minus className="w-4 h-4 text-white" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${
                                                m.role === 'user' 
                                                ? 'bg-red-600 text-white rounded-tr-none' 
                                                : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                            }`}>
                                                <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">AI is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <div className="p-5 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                                    <div className="relative flex items-center gap-3">
                                        <Input 
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Ask anything about EyE PunE..."
                                            className="bg-white/5 border-white/10 rounded-2xl h-14 pl-5 pr-14 text-white placeholder:text-gray-600 focus:border-red-600/50"
                                        />
                                        <button 
                                            onClick={handleSend}
                                            disabled={isLoading || !input.trim()}
                                            className="absolute right-2 p-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:bg-gray-800 rounded-xl transition-all"
                                        >
                                            <Send className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-center text-gray-600 mt-4 font-bold uppercase tracking-[0.2em]">
                                        Powered by EyE Vision Core
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="bg-gradient-to-tr from-red-600 to-orange-600 p-5 rounded-full shadow-2xl shadow-red-600/40 relative group pointer-events-auto"
                    >
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#040404] rounded-full z-10" />
                        <MessageSquare className="w-8 h-8 text-white group-hover:hidden" />
                        <Sparkles className="w-8 h-8 text-white hidden group-hover:block animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
