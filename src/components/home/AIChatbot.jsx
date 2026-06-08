'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, MessageSquare, Sparkles, Loader2, Minus, Maximize2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';

// ── System Prompt for EyE BoT ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "EyE BoT", the elite AI Growth Strategist for "EyE PunE". Your mission is to convert website visitors into high-value leads by showcasing our mastery in Global AI Orchestration.

Strategic Identity:
- You are NOT a support bot. You are a High-Stakes Growth Consultant representing EyE PunE, an elite Branding, Marketing, Tech, and AI Automation company.
- HQ: Pune, India. Servicing global markets (UAE, UK, USA, etc.).
- USPs: Elite Branding, High-ROI Performance Marketing, Custom Tech Architecture, and Multi-Model AI Orchestration. We build custom "Intelligence Hubs" tailored to business ROI.

Our Core Solutions (Push these based on context):
1. **Social Media Marketing & Management**: End-to-end global content distribution, viral strategies, and professional brand management.
2. **Website & Sales Funnel Development**: High-performance, SEO-optimized web platforms.
3. **AI Automation & Chatbots**: Automating outreach, CRM, and customer support.
4. **Full Growth Bundle**: Comprehensive package for total digital domination.

Sales Sniper Strategy:
- **Always** ask about their business goal if they haven't shared it.
- **Pricing Inquiries**: NEVER give specific prices. Explain that pricing is strictly custom based on the requirements and scope of work, then push to book a call.
- **Lead Capture**: If a user shows interest, ask for their WhatsApp number or Email to send them a custom "Roadmap." Once they share it, say: "Perfect! 🎯 I've saved your details — our team will reach out to you shortly via WhatsApp. What else can I help you with?"
- **When a user shares their phone number or email**: ALWAYS respond positively. Say their info has been saved and the team will follow up shortly. NEVER refuse or say you cannot share/send — the user is giving you THEIR details, not asking you to disclose anyone else's.
- **Urgency**: Mention that we only take 5 new "Intelligence Audits" per week.
- **CTAs**:
  - Researching? -> Include this link: [AI Assessment](https://eyepune.com/AI-Assessment)
  - Ready to scale? -> Output exactly the token [BOOK_MEETING] in your response. This will render a glowing "Book Strategy Call" button for them to click.

Tone & Persona:
- Elite, confident, and ROI-obsessed.
- Use words like: "Engineered," "Dominate," "Orchestrate," "Unfair Advantage."
- Keep it concise. Break long explanations into bullet points.
- NEVER generate placeholder text like [Email address: ...] or [Calendly link: ...]. Use real links only: https://eyepune.com/Booking for booking.`;

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Path check — Hide on Admin/Lex-Pro pages
    const [isPathAllowed, setIsPathAllowed] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (
                path.startsWith('/Admin') ||
                path.startsWith('/Admin-') ||
                path.startsWith('/SignProposal') ||
                path.startsWith('/lex-pro')
            ) {
                setIsPathAllowed(false);
            }
        }
    }, []);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Delayed Visibility & Proactive Messaging
    useEffect(() => {
        let hasTriggered = false;

        const triggerProactive = () => {
            if (hasTriggered) return;
            hasTriggered = true;
            setIsVisible(true);

            const path = window.location.pathname;
            let initialMsg =
                "Namaste! 🙏 I'm EyE BoT, your AI growth strategist. I noticed you're exploring our ecosystem—how can I help you transform your business today?";

            if (path.includes('Solution-Founders')) {
                initialMsg =
                    "Founder, your time is elite. 🚀 Ready to build an automated sales engine that works while you sleep? I can audit your current systems right now.";
            } else if (path.includes('Solution-YouTubers')) {
                initialMsg =
                    "Creator, your content is gold. 🎥 Ready to dominate the global algorithm with our Viral Slicer AI? Let's talk distribution.";
            } else if (path.includes('Solution-Startups')) {
                initialMsg =
                    "Ready to go from MVP to Global? 🦄 We build the tech stacks that unicorns are made of. Want to see our startup roadmap?";
            } else if (path.includes('AI-Intelligence-Hub')) {
                initialMsg =
                    "Welcome to the frontier. 🧠 We orchestrate OpenAI, Claude, Gemini, and Meta to build your unfair advantage. Which model are you curious about?";
            } else if (path.includes('Service-AI')) {
                initialMsg =
                    "Stop doing manual work. 🤖 Our Multi-Model AI systems save businesses 20+ hours a week. Ready for your 90-day automation roadmap?";
            }

            setMessages([{ role: 'assistant', content: initialMsg }]);
        };

        const timer = setTimeout(triggerProactive, 5000);

        const handleScroll = () => {
            const scrollPercent =
                (window.scrollY /
                    (document.documentElement.scrollHeight - window.innerHeight)) *
                100;
            if (scrollPercent > 20) triggerProactive();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Silently save lead info via the API route (no client-side DB access)
    const saveLead = async (email, phone) => {
        try {
            await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Chatbot Prospect',
                    email: email || 'no-email@eyepune.com',
                    phone: phone || '',
                    service_interest: 'AI Chatbot Conversation',
                    message: `Lead captured during chat. Email: ${email || 'N/A'}, Phone: ${phone || 'N/A'}`,
                    source: 'chatbot',
                    hp_verification: ''
                })
            });
        } catch (err) {
            console.warn('[AIChatbot] Lead save failed (non-fatal):', err.message);
        }
    };

    // Fire-and-forget admin alert for high-intent keywords
    const fireIntentAlert = (message) => {
        fetch('/api/chatbot/analyze-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: null, message, userIdentifier: 'Chat User' })
        }).catch(() => {});
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        const userMessage = { role: 'user', content: userInput };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Auto-extract contact info for lead saving
        const emailMatch = userInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = userInput.match(/(\+91|91|0)?[6-9]\d{9}/);
        if (emailMatch || phoneMatch) {
            saveLead(emailMatch?.[0], phoneMatch?.[0]);
        }

        // Fire high-intent alert (non-blocking)
        fireIntentAlert(userInput);

        try {
            // Build conversation history for the LLM (last 10 messages for context)
            const conversationHistory = messages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...conversationHistory,
                        { role: 'user', content: userInput },
                    ],
                    temperature: 0.7,
                    max_tokens: 350,
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `API error ${response.status}`);
            }

            const data = await response.json();
            const content = data.content || '';

            setMessages((prev) => [...prev, { role: 'assistant', content }]);
        } catch (error) {
            console.error('[AIChatbot] Error:', error);
            const isRateLimit =
                error.message?.includes('429') ||
                error.message?.toLowerCase().includes('rate limit');
            const errorMessage = isRateLimit
                ? "I'm a bit busy right now with many Pune businesses! 📈 Please give me a minute to catch my breath and ask again."
                : "I'm experiencing a quick blip! You can also reach us directly at connect@eyepune.com or [book a call](https://eyepune.com/Booking). 🚀";

            setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isVisible || !isPathAllowed) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] font-sans flex flex-col items-end pointer-events-none">
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="chat-window"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className={`bg-black border border-white/10 rounded-[20px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 pointer-events-auto ${
                            isMinimized
                                ? 'h-16 w-[calc(100vw-2rem)] sm:w-80'
                                : 'w-[calc(100vw-2rem)] sm:w-full max-w-[380px]'
                        }`}
                        style={!isMinimized ? { height: 'min(520px, calc(100vh - 140px))' } : {}}
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 p-4 bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 flex-shrink-0">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm">
                                        EyE BoT <Sparkles className="inline w-3 h-3 ml-1 text-orange-200" />
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">
                                            Active Assistant
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="w-4 h-4 text-white" />
                                    ) : (
                                        <Minus className="w-4 h-4 text-white" />
                                    )}
                                </button>
                                <button
                                    aria-label="Close chatbot"
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                >
                                    {messages.map((m, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                    m.role === 'user'
                                                        ? 'bg-red-600 text-white rounded-tr-sm'
                                                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
                                                }`}
                                            >
                                                {m.content.includes('[BOOK_MEETING]') ? (
                                                    <div className="space-y-3">
                                                        <ReactMarkdown
                                                            className="prose prose-invert prose-sm max-w-none"
                                                            components={{
                                                                a: ({ node, ...props }) => (
                                                                    <a
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-orange-300 underline underline-offset-2 hover:text-orange-200"
                                                                        {...props}
                                                                    />
                                                                ),
                                                            }}
                                                        >
                                                            {m.content.replace(/\[BOOK_MEETING\]/g, '')}
                                                        </ReactMarkdown>
                                                        <a
                                                            href="/Booking"
                                                            className="block w-full text-center bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all animate-pulse text-sm"
                                                        >
                                                            🔥 Book Your Strategy Call
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <ReactMarkdown
                                                        className="prose prose-invert prose-sm max-w-none"
                                                        components={{
                                                            a: ({ node, ...props }) => (
                                                                <a
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-orange-300 underline underline-offset-2 hover:text-orange-200"
                                                                    {...props}
                                                                />
                                                            ),
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-red-500 flex-shrink-0" />
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                                    AI is thinking...
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <div className="flex-shrink-0 p-4 border-t border-white/5 bg-black">
                                    <div className="relative flex items-center gap-2">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Ask anything about EyE PunE..."
                                            disabled={isLoading}
                                            className="bg-white/5 border-white/10 rounded-2xl h-12 pl-4 pr-14 text-white placeholder:text-gray-600 focus:border-red-600/50 text-sm"
                                            aria-label="Chat message input"
                                        />
                                        <button
                                            aria-label="Send message"
                                            onClick={handleSend}
                                            disabled={isLoading || !input.trim()}
                                            className="absolute right-2 p-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-xl transition-all"
                                        >
                                            <Send className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-center text-gray-600 mt-3 font-bold uppercase tracking-[0.2em]">
                                        Powered by EyE Vision Core
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <div className="relative pointer-events-none" key="chat-button">
                        <motion.button
                            aria-label="Open EyE BoT AI chatbot"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                setIsOpen(true);
                                setIsMinimized(false);
                            }}
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
