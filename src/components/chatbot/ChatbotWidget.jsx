'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader, Bot, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// How many messages before we ask for the user's name/email
const LEAD_CAPTURE_THRESHOLD = 3;

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: 'Hi! 👋 I\'m the EyE PunE AI Assistant. I can help you understand our services, pricing, or book a free consultation. What brings you here today?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [leadCaptured, setLeadCaptured] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadData, setLeadData] = useState({ name: '', email: '' });
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

    const saveLead = async (name, email) => {
        try {
            // Save to leads table
            await supabase.from('leads').insert([{
                full_name: name,
                email: email,
                source: 'chatbot',
                status: 'new',
                notes: `Chatbot lead. Conversation: ${messages
                    .slice(1)
                    .map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`)
                    .join('\n')}`
            }]);

            // Fire WhatsApp notify (non-blocking)
            fetch('/api/whatsapp/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'contact',
                    name,
                    email,
                    message: `Chatbot lead after ${messageCount} messages`
                })
            }).catch(() => {});

            // Fire admin email (non-blocking)
            fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'connect@eyepune.com',
                    subject: `💬 New Chatbot Lead: ${name}`,
                    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
                        <h2 style="color:#ef4444;margin-top:0">💬 New Chatbot Lead</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Messages exchanged:</strong> ${messageCount}</p>
                        <h3>Conversation:</h3>
                        <div style="background:#f9fafb;padding:16px;border-radius:8px;font-size:13px;white-space:pre-wrap">${
                            messages.slice(1).map(m => `${m.role === 'user' ? '👤 User' : '🤖 Bot'}: ${m.content}`).join('\n\n')
                        }</div>
                        <a href="https://eyepune.com/Admin_CRM" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#ef4444;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Open CRM →</a>
                    </div>`
                })
            }).catch(() => {});

        } catch (err) {
            console.warn('[Chatbot] Lead save failed:', err.message);
        }
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        if (!leadData.name || !leadData.email) return;

        await saveLead(leadData.name, leadData.email);
        setLeadCaptured(true);
        setShowLeadForm(false);

        const thankYouMessage = {
            id: messageId.current++,
            role: 'assistant',
            content: `Thanks ${leadData.name}! 🎉 I've saved your details. One of our experts will reach out to you at ${leadData.email} shortly. In the meantime, feel free to keep asking me anything!`,
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

            const systemPrompt = `You are the EyE PunE AI Assistant — friendly, professional, and concise.
EyE PunE is an AI-powered digital marketing & automation agency based in Pune, India.

Services:
- Social Media Management (₹15,000–₹35,000/month)
- Website & Sales Funnel Development (₹45,000–₹75,000)
- AI Automation & Chatbots (₹25,000–₹65,000/month)
- Branding (₹30,000 one-time)
- Full Growth Bundle (₹1,25,000/month)

Response rules:
- Keep answers under 3 sentences
- If asked about pricing, give the range and suggest a free consultation
- Encourage booking at: https://eyepune.com/Booking
- For AI Assessment, direct to: https://eyepune.com/AI_Assessment
- Never make up specific claims — stick to what's listed above`;

            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `${systemPrompt}\n\nUser: ${input}`,
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
                content: 'Sorry, something went wrong. Please reach out at connect@eyepune.com or call +91 92847 12033.',
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
                className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-br from-red-600 to-red-500 text-white p-4 shadow-[0_4px_24px_rgba(239,68,68,0.5)] hover:shadow-[0_4px_32px_rgba(239,68,68,0.7)] transition-all"
                aria-label="Open AI Chat"
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
                        className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] flex flex-col overflow-hidden"
                        style={{
                            height: '560px',
                            maxHeight: 'calc(100vh - 120px)',
                            background: 'rgba(10,10,10,0.97)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: '20px',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">EyE PunE Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-gray-500">AI-Powered • Always Online</span>
                                </div>
                            </div>
                            <div className="ml-auto">
                                <Sparkles className="w-4 h-4 text-red-500/50" />
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
                                                    ? 'bg-gradient-to-br from-red-600 to-red-500 text-white rounded-br-sm'
                                                    : 'bg-white/[0.06] text-gray-200 border border-white/5 rounded-bl-sm'
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
                                        className="bg-gradient-to-br from-red-950/40 to-black/40 border border-red-500/20 rounded-2xl p-4"
                                    >
                                        <p className="text-white text-sm font-medium mb-1">🎯 Want a personalised quote?</p>
                                        <p className="text-gray-400 text-xs mb-3">Drop your details and we'll follow up within 2 hours.</p>
                                        <form onSubmit={handleLeadSubmit} className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Your name"
                                                value={leadData.name}
                                                onChange={e => setLeadData(p => ({ ...p, name: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                                            />
                                            <input
                                                type="email"
                                                placeholder="your@email.com"
                                                value={leadData.email}
                                                onChange={e => setLeadData(p => ({ ...p, email: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm rounded-lg font-medium hover:opacity-90 transition-opacity"
                                                >
                                                    Get Free Quote
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
                                        <div className="bg-white/[0.06] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                                            <div className="flex gap-1.5">
                                                {[0, 100, 200].map(d => (
                                                    <div key={d} className="w-2 h-2 bg-red-500/60 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="border-t border-white/5 p-3 flex gap-2">
                            <Input
                                type="text"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/30 rounded-xl h-10 text-sm"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className="bg-gradient-to-br from-red-600 to-red-500 hover:opacity-90 border-0 h-10 w-10 rounded-xl flex-shrink-0 shadow-[0_2px_12px_rgba(239,68,68,0.3)]"
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