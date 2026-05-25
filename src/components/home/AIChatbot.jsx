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
    const [isVisible, setIsVisible] = useState(false);
    const [isBadgeDismissed, setIsBadgeDismissed] = useState(false);

    // 0. Path check — Hide on Admin pages
    const [isPathAllowed, setIsPathAllowed] = useState(true);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.startsWith('/Admin') || path.startsWith('/Admin-') || path.startsWith('/SignProposal')) {
                setIsPathAllowed(false);
            }
        }
    }, []);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const scrollRef = useRef(null);

    // 1. Delayed Visibility & Proactive Messaging
    // 1. Intelligent Visibility & Proactive Messaging
    useEffect(() => {
        let hasTriggered = false;

        const triggerProactive = () => {
            if (hasTriggered) return;
            hasTriggered = true;
            setIsVisible(true);
            // setIsOpen(true); // Removed: Don't auto-open the chat window aggressively

            const path = window.location.pathname;
            let initialMsg = "Namaste! 🙏 I'm EyE BoT, your AI growth strategist. I noticed you're exploring our ecosystem—how can I help you transform your business today?";
            
            if (path.includes('Solution-Founders')) {
                initialMsg = "Founder, your time is elite. 🚀 Ready to build an automated sales engine that works while you sleep? I can audit your current systems right now.";
            } else if (path.includes('Solution-YouTubers')) {
                initialMsg = "Creator, your content is gold. 🎥 Ready to dominate the global algorithm with our Viral Slicer AI? Let's talk distribution.";
            } else if (path.includes('Solution-Startups')) {
                initialMsg = "Ready to go from MVP to Global? 🦄 We build the tech stacks that unicorns are made of. Want to see our startup roadmap?";
            } else if (path.includes('AI-Intelligence-Hub')) {
                initialMsg = "Welcome to the frontier. 🧠 We orchestrate OpenAI, Claude, Gemini, and Meta to build your unfair advantage. Which model are you curious about?";
            } else if (path.includes('Service-AI')) {
                initialMsg = "Stop doing manual work. 🤖 Our Multi-Model AI systems save businesses 20+ hours a week. Ready for your 90-day automation roadmap?";
            }

            setMessages([{ role: 'assistant', content: initialMsg }]);
        };

        // Trigger after 5 seconds OR 20% scroll
        const timer = setTimeout(triggerProactive, 5000);

        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 20) triggerProactive();
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // 2. Initialize Session
    useEffect(() => {
        const initSession = async () => {
            try {
                const { supabase } = await import('@/integrations/supabase/client');
                const { data, error } = await supabase.from('chat_sessions').insert([{
                    user_identifier: 'Guest ' + Math.floor(Math.random() * 1000),
                    metadata: { userAgent: navigator.userAgent, path: window.location.pathname }
                }]).select().single();
                if (data) setSessionId(data.id);
            } catch (err) {
                console.warn('[Chatbot] Session init failed:', err);
            }
        };
        initSession();
    }, []);

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
            // 1. Sync User Message to DB
            if (sessionId) {
                const { supabase } = await import('@/integrations/supabase/client');
                await supabase.from('chat_messages').insert([{
                    session_id: sessionId,
                    role: 'user',
                    content: input
                }]);
                
                // 2. Analyze Intent (Sales Sniper)
                fetch('/api/chatbot/analyze-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, message: input, userIdentifier: 'Chat User' })
                }).catch(() => {});
            }

            // Lead Capture Logic
            const emailMatch = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            const phoneMatch = input.match(/(\+91|91|0)?[6-9]\d{9}/);
            
            if (emailMatch || phoneMatch) {
                const { supabase } = await import('@/integrations/supabase/client');
                const contactInfo = emailMatch?.[0] || phoneMatch?.[0];
                
                // Update session with ID if found
                if (sessionId) {
                    await supabase.from('chat_sessions')
                        .update({ user_identifier: contactInfo })
                        .eq('id', sessionId);
                }

                await supabase.from('leads').upsert([{
                    full_name: 'Chatbot Prospect',
                    email: emailMatch?.[0] || null,
                    phone: phoneMatch?.[0] || null,
                    source: 'chatbot',
                    status: 'new',
                    notes: `Captured via Chatbot: "${input}"`
                }], { onConflict: 'email' });

                await supabase.from('inquiries').insert([{
                    full_name: 'Chatbot Prospect',
                    email: emailMatch?.[0] || 'no-email@eyepune.com',
                    phone: phoneMatch?.[0] || null,
                    service_interest: 'AI Chatbot Conversation',
                    message: `Lead captured during chat: "${input}"`,
                    source: 'chatbot',
                    status: 'new'
                }]).catch((err) => { console.warn('[Chatbot] Inquiry save failed:', err); });

                // 3. Trigger Admin Notification (Sales Sniper)
                fetch('/api/admin/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'lead',
                        payload: {
                            name: 'Chatbot Prospect',
                            email: emailMatch?.[0] || 'Email not provided',
                            company: 'Captured via Chat',
                            service: 'Chatbot Conversion'
                        }
                    })
                }).catch(() => {});
            }

            const context = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
            const prompt = `You are "EyE BoT", the elite AI Growth Strategist for "EyE PunE". Your mission is to convert website visitors into high-value leads by showcasing our mastery in Global AI Orchestration.

Strategic Identity:
- You are NOT a support bot. You are a High-Stakes Growth Consultant.
- HQ: Pune, India. Servicing global markets (UAE, UK, USA, etc.).
- USPs: Multi-Model Orchestration (OpenAI, Anthropic, Google, Meta, NVIDIA). We don't just use one AI; we build custom "Intelligence Hubs" tailored to business ROI.

Our Core Solutions (Push these based on context):
1. **Founder Sales Engines**: Automating outreach and CRM for busy CEOs.
2. **Viral Slicer AI**: Global content distribution for YouTubers and Creators.
3. **Startup Tech Stacks**: Rapid Next.js/AI deployments for scaling businesses.
4. **B2B Growth Systems**: LinkedIn and Email automation that actually converts.

Sales Sniper Strategy:
- **Always** ask about their business goal if they haven't shared it.
- **Lead Capture**: If a user shows interest, ask for their WhatsApp or Email to send them a custom "AI Roadmap."
- **Urgency**: Mention that we only take 5 new "Intelligence Audits" per week.
- **CTAs**: 
  - Researching? -> [AI Assessment](https://eyepune.com/AI-Assessment)
  - Ready to scale? -> [Book Vision Sync](https://eyepune.com/Booking)

Tone & Persona:
- Elite, confident, and ROI-obsessed. 
- Use words like: "Engineered," "Dominate," "Orchestrate," "Unfair Advantage."
- Keep it concise. Break long explanations into bullet points.

User History:
${context}

User: ${input}
Assistant:`;

            const response = await base44.integrations.Core.InvokeLLM({ prompt, max_tokens: 350 });
            
            // 3. Sync Assistant Message to DB
            if (sessionId) {
                const { supabase } = await import('@/integrations/supabase/client');
                await supabase.from('chat_messages').insert([{
                    session_id: sessionId,
                    role: 'assistant',
                    content: response
                }]);
                
                await supabase.from('chat_sessions')
                    .update({ last_active: new Date().toISOString() })
                    .eq('id', sessionId);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage = error.message?.includes('429') || error.message?.toLowerCase().includes('rate limit')
                ? "I'm a bit busy right now with many Pune businesses! 📈 Please give me a minute to catch my breath and ask again."
                : "I'm sorry, I encountered a brief system flicker. Please try asking again in a moment!";
            
            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible || !isPathAllowed) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] font-sans flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`bg-black border border-white/10 rounded-[20px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 pointer-events-auto ${
                            isMinimized 
                                ? 'h-16 w-[calc(100vw-2rem)] sm:w-80' 
                                : 'w-[calc(100vw-2rem)] sm:w-[380px]'
                        }`}
                        style={!isMinimized ? { height: 'min(520px, calc(100vh - 140px))' } : {}}
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
                                                <ReactMarkdown 
                                                    className="prose prose-invert prose-sm max-w-none"
                                                    components={{
                                                        a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="text-orange-300 underline underline-offset-2 hover:text-orange-200" {...props} />
                                                    }}
                                                >
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
                                <div className="p-5 border-t border-white/5 bg-black">
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
                    <div className="relative pointer-events-none">

                        
                        <motion.button
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsOpen(true)}
                            className="bg-gradient-to-tr from-red-600 to-orange-600 p-5 rounded-full shadow-2xl shadow-red-600/40 relative group pointer-events-auto float-right"
                        >
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#040404] rounded-full z-10" />
                            <MessageSquare className="w-8 h-8 text-white group-hover:hidden" />
                            <Sparkles className="w-8 h-8 text-white hidden group-hover:block animate-pulse" />
                        </motion.button>
                        <div className="clear-both" />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
