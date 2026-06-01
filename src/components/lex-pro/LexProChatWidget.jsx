'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader, Bot, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// How many messages before we ask for the user's name/email/phone
const LEAD_CAPTURE_THRESHOLD = 2;

export default function LexProChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: 'Hi! 👋 I\'m the Lex Pro AI Assistant. I can help you understand our enterprise legal infrastructure, API integrations, or book a demo. How can I assist you today?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [leadCaptured, setLeadCaptured] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadData, setLeadData] = useState({ name: '', email: '', phone: '', hp_verification: '' });
    const [messageCount, setMessageCount] = useState(0);
    const scrollRef = useRef(null);
    const messageId = useRef(2);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, showLeadForm]);

    // After LEAD_CAPTURE_THRESHOLD user messages, show lead form
    useEffect(() => {
        if (messageCount === LEAD_CAPTURE_THRESHOLD && !leadCaptured) {
            setTimeout(() => setShowLeadForm(true), 800);
        }
    }, [messageCount, leadCaptured]);

    const saveLead = async (name, email, phone) => {
        try {
            await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone || '',
                    company: '',
                    service_interest: 'Lex Pro Demo Request',
                    message: `Lex Pro Chatbot lead after ${messageCount} messages.\n\nConversation:\n${messages.slice(1).map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`).join('\n')}`,
                    source: 'lex_pro_chatbot',
                    hp_verification: ''
                })
            });
        } catch (err) {
            console.warn('[LexPro Chatbot] Lead save failed:', err.message);
        }
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        
        // Standardized honeypot check
        if (leadData.hp_verification) {
            console.warn('Bot detected in Chatbot lead form');
            setLeadCaptured(true);
            setShowLeadForm(false);
            return;
        }

        if (!leadData.name || !leadData.email || !leadData.phone) return;

        await saveLead(leadData.name, leadData.email, leadData.phone);
        setLeadCaptured(true);
        setShowLeadForm(false);

        const thankYouMessage = {
            id: messageId.current++,
            role: 'assistant',
            content: `Thanks ${leadData.name}! 🎉 I've forwarded your details to our enterprise team. We'll be in touch at ${leadData.email} shortly to set up your demo. What else can I answer for you?`,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, thankYouMessage]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: messageId.current++,
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setMessageCount(prev => prev + 1);

        try {
            const conversationHistory = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const systemPrompt = `You are the Lex Pro Enterprise AI Assistant — acting as a highly professional legal tech advisor.
Your goal is to answer questions about Lex Pro's capabilities and drive enterprise users to book a demo.

Capabilities:
- Autonomous Contract Drafting (India-compliant)
- Instant Legal Risk Analysis & Redlining
- Bulk Contract Generation (1000s of contracts via CSV)
- Secure Digital Signatures & Legal Audit Trails
- Organization & Team Management

Response rules:
- NEVER give long explanations. Keep answers under 2 sentences.
- Use a highly professional, legal-tech tone.
- Always end your message with a compelling question that drives them to take action.
- If they ask for a demo or pricing, push them to click the 'Book Demo' button on the site.
- Never make up specific claims — stick to the facts above.`;

            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...conversationHistory,
                        { role: 'user', content: input }
                    ],
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
        } catch {
            setMessages(prev => [...prev, {
                id: messageId.current++,
                role: 'assistant',
                content: 'Sorry, something went wrong connecting to our secure servers. Please try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[60] rounded-full bg-gradient-to-br from-blue-600 to-slate-600 text-white p-4 shadow-[0_4px_24px_rgba(59,130,246,0.5)] hover:shadow-[0_4px_32px_rgba(59,130,246,0.7)] transition-all"
                aria-label="Open Lex Pro Chat"
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
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-full max-w-[380px] flex flex-col overflow-hidden"
                        style={{
                            height: 'calc(100vh - 140px)',
                            maxHeight: '520px',
                            background: 'rgba(10,15,28,0.85)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(59,130,246,0.2)',
                            borderRadius: '20px',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-slate-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">Lex Pro Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    <span className="text-xs text-gray-400">Enterprise Grade • Secure</span>
                                </div>
                            </div>
                            <div className="ml-auto">
                                <Sparkles className="w-4 h-4 text-blue-500/50" />
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 px-4 py-3">
                            <div className="space-y-3">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                message.role === 'user'
                                                    ? 'bg-gradient-to-br from-blue-600 to-slate-600 text-white rounded-br-sm'
                                                    : 'bg-white/[0.04] text-gray-200 border border-white/5 rounded-bl-sm'
                                            }`}
                                        >
                                            {message.content}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Lead capture form */}
                                {showLeadForm && !leadCaptured && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 border border-blue-500/20 rounded-2xl p-4"
                                    >
                                        <p className="text-white text-sm font-medium mb-1">⚖️ Want a personalized demo?</p>
                                        <p className="text-gray-400 text-xs mb-3">Drop your details and our enterprise team will reach out.</p>
                                        <form onSubmit={handleLeadSubmit} className="space-y-2">
                                            <div className="sr-only opacity-0 absolute -z-10 pointer-events-none">
                                                <input
                                                    type="text"
                                                    name="hp_verification"
                                                    value={leadData.hp_verification || ''}
                                                    onChange={e => setLeadData(p => ({ ...p, hp_verification: e.target.value }))}
                                                    tabIndex="-1"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Your Name"
                                                value={leadData.name}
                                                onChange={e => setLeadData(p => ({ ...p, name: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={leadData.phone}
                                                onChange={e => setLeadData(p => ({ ...p, phone: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Work Email"
                                                value={leadData.email}
                                                onChange={e => setLeadData(p => ({ ...p, email: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-slate-600 text-white text-sm rounded-lg font-medium hover:opacity-90 transition-opacity"
                                                >
                                                    Request Demo
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowLeadForm(false); setLeadCaptured(true); }}
                                                    className="px-3 py-2 text-gray-500 text-xs rounded-lg hover:text-gray-300 transition-colors"
                                                >
                                                    Skip
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/[0.04] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                                            <div className="flex gap-1.5">
                                                {[0, 100, 200].map(d => (
                                                    <div key={d} className="w-2 h-2 bg-blue-500/60 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="border-t border-white/5 p-3 flex gap-2 bg-white/[0.02]">
                            <Input
                                type="text"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/30 rounded-xl h-10 text-sm"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className="bg-gradient-to-br from-blue-600 to-slate-600 hover:opacity-90 border-0 h-10 w-10 rounded-xl flex-shrink-0 shadow-[0_2px_12px_rgba(59,130,246,0.3)] text-white"
                            >
                                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
