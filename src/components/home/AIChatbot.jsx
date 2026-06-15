'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, MessageSquare, Sparkles, Loader2, Minus, Maximize2, Phone } from 'lucide-react';
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';

// ── Constants ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'eyebot_history';
const MAX_STORED_MESSAGES = 20;

// ── A/B Test: Trigger timing (persisted per user so they see the same experience) ──
function getTriggerDelay() {
    if (typeof window === 'undefined') return 5000;
    const stored = localStorage.getItem('eyebot_trigger_delay');
    if (stored) return Number(stored);
    const variants = [3000, 5000, 8000];
    const pick = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem('eyebot_trigger_delay', String(pick));
    // Track which variant they got
    try {
        fetch('/api/chatbot/analyze-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: null, message: `[AB_TEST] trigger_delay=${pick}ms`, userIdentifier: 'AB_TEST' })
        }).catch(() => {});
    } catch {}
    return pick;
}

// ── UTM → Personalised Greeting ─────────────────────────────────────────
function getInitialMessage() {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const utm_campaign = params?.get('utm_campaign') || '';
    const utm_source = params?.get('utm_source') || '';
    const ref = params?.get('ref') || '';

    // Ad / campaign aware
    if (utm_campaign || utm_source || ref) {
        const src = utm_campaign || utm_source || ref;
        return `Hey! 👋 Glad you found us via *${src}*. I'm EyE BoT — your AI growth strategist. We've helped businesses just like yours 3× their leads in 90 days. What's the #1 growth challenge you're facing right now?`;
    }
    // Page-specific
    if (path.includes('Solution-Founders')) return "Founder, your time is elite. 🚀 Ready to build an automated sales engine that works while you sleep? I can audit your current systems right now.";
    if (path.includes('Solution-YouTubers')) return "Creator, your content is gold. 🎥 Ready to dominate the global algorithm with our Viral Slicer AI? Let's talk distribution.";
    if (path.includes('Solution-Startups')) return "Ready to go from MVP to Global? 🦄 We build the tech stacks that unicorns are made of. Want to see our startup roadmap?";
    if (path.includes('AI-Intelligence-Hub')) return "Welcome to the frontier. 🧠 We orchestrate OpenAI, Claude, Gemini, and Meta to build your unfair advantage. Which model are you curious about?";
    if (path.includes('Service-AI')) return "Stop doing manual work. 🤖 Our Multi-Model AI systems save businesses 20+ hours a week. Ready for your 90-day automation roadmap?";
    if (path.includes('Pricing')) return "Great timing! 💰 Our packages are engineered for maximum ROI. Want me to match the right bundle to your exact business goals?";
    if (path.includes('Booking')) return "You're one step from unlocking serious growth. 🔥 Got questions before you book? I'll get you the answers in 30 seconds.";
    return "Namaste! 🙏 I'm EyE BoT, your AI growth strategist. I noticed you're exploring our ecosystem—how can I help you transform your business today?";
}

// ── System Prompt ────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "EyE BoT", the elite AI Growth Strategist for "EyE PunE". Your mission is to maximize user engagement (dwell time) while seamlessly converting visitors into high-value leads.

Strategic Identity:
- You are NOT a support bot. You are a High-Stakes Growth Consultant representing EyE PunE, an elite Tech & AI Automation company based in Pune, serving global markets.
- USPs: Elite Branding, B2B Lead Gen, Next.js Web Architecture, and Multi-Model AI Orchestration.

Dwell Time & Engagement Strategy (CRITICAL):
- ALWAYS keep the user talking. Ask probing, highly specific business questions (Socratic selling).
- If they ask about a service, explain it briefly, but immediately ask them a diagnostic question about their current setup. Example: "We build custom AI chatbots that scale lead capture. How are you currently qualifying the traffic that hits your site today?"
- NEVER end a response without asking an engaging follow-up question. The longer they chat with you, the better.

Sales Sniper Strategy:
- **Lead Capture**: Once they have answered 2-3 of your questions and are highly engaged, offer to build them a custom "Growth Roadmap." Ask for their Email or WhatsApp to send it over.
- **When they share contact info**: Respond enthusiastically: "Perfect! 🎯 I've securely saved your details. Our strategy team will review our chat and reach out via WhatsApp/Email. While we wait, what is the biggest bottleneck in your sales process?"
- **Pricing**: NEVER give specific prices. Explain that we build bespoke infrastructure based on ROI, then pivot to asking about their revenue goals.
- **CTAs**:
  - If they are deeply engaged: Output exactly the token [BOOK_MEETING]. This renders a glowing "Book Strategy Call" button.
  - If they want an audit: Send them to [AI Assessment](https://eyepune.com/AI-Assessment).

Tone & Persona:
- Elite, confident, deeply curious, and ROI-obsessed.
- Use words like: "Engineered," "Dominate," "Bottleneck," "Unfair Advantage."
- Keep responses short, punchy, and highly conversational.`;

// ── Funnel Tracker ───────────────────────────────────────────────────────
function trackFunnelEvent(event, data = {}) {
    try {
        fetch('/api/chatbot/analyze-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: null,
                message: `[FUNNEL] ${event}`,
                userIdentifier: data.contact || 'anonymous',
                ...data
            })
        }).catch(() => {});
    } catch {}
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isPathAllowed, setIsPathAllowed] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // artificial typing delay
    const [leadSaved, setLeadSaved] = useState(false);
    const scrollRef = useRef(null);
    const exitIntentFired = useRef(false);
    const hasOpened = useRef(false);

    // ── Path guard ───────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.startsWith('/Admin') || path.startsWith('/Admin-') || path.startsWith('/SignProposal') || path.startsWith('/lex-pro')) {
                setIsPathAllowed(false);
            }
        }
    }, []);

    // ── 1. Load persisted history ────────────────────────────────────────
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed.slice(-MAX_STORED_MESSAGES));
                    return;
                }
            }
        } catch {}
        // Fresh session — will be set in the proactive trigger
    }, []);

    // ── 2. Persist messages to localStorage ─────────────────────────────
    useEffect(() => {
        if (messages.length === 0) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
        } catch {}
    }, [messages]);

    // ── 3. A/B Trigger + proactive messaging ────────────────────────────
    useEffect(() => {
        let hasTriggered = false;

        const triggerProactive = () => {
            if (hasTriggered) return;
            hasTriggered = true;
            setIsVisible(true);


            // Only set initial message if no history loaded
            setMessages(prev => {
                if (prev.length > 0) return prev; // has history — keep it
                return [{ role: 'assistant', content: getInitialMessage() }];
            });

            trackFunnelEvent('chatbot_visible');
        };

        const delay = getTriggerDelay();
        const timer = setTimeout(triggerProactive, delay);

        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 20) triggerProactive();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // ── 4. Exit Intent ───────────────────────────────────────────────────
    useEffect(() => {
        const handleMouseLeave = (e) => {
            if (e.clientY <= 10 && !exitIntentFired.current && isVisible && !isOpen) {
                exitIntentFired.current = true;
                setIsOpen(true);
                setIsMinimized(false);
                // Inject an exit-intent message
                setMessages(prev => {
                    const exitMsg = { role: 'assistant', content: "⚡ Wait! Before you go — did you know we offer a **FREE AI Growth Audit** for your business? Takes 3 minutes and reveals exactly where you're losing leads. Want one?" };
                    const last = prev[prev.length - 1];
                    if (last?.content === exitMsg.content) return prev;
                    return [...prev, exitMsg];
                });
                trackFunnelEvent('exit_intent_triggered');
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [isVisible, isOpen]);

    // ── 5. Track open event ──────────────────────────────────────────────
    useEffect(() => {
        if (isOpen && !hasOpened.current) {
            hasOpened.current = true;
            trackFunnelEvent('chatbot_opened');
        }
    }, [isOpen]);

    // ── Scroll to bottom ─────────────────────────────────────────────────
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading, isTyping]);

    // ── Pre-fill: push contact info to sessionStorage for Booking page ──
    const persistContactForBooking = useCallback((email, phone, name) => {
        try {
            const existing = JSON.parse(sessionStorage.getItem('chatbot_lead') || '{}');
            sessionStorage.setItem('chatbot_lead', JSON.stringify({
                ...existing,
                ...(email && { email }),
                ...(phone && { phone }),
                ...(name && { name }),
            }));
        } catch {}
    }, []);

    // ── Save lead via API ────────────────────────────────────────────────
    const saveLead = useCallback(async (email, phone, name) => {
        if (leadSaved && !email && !phone) return;
        try {
            await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name || 'Chatbot Prospect',
                    email: email || 'no-email@eyepune.com',
                    phone: phone || '',
                    service_interest: 'AI Chatbot Conversation',
                    message: `Lead captured during chat. Email: ${email || 'N/A'}, Phone: ${phone || 'N/A'}`,
                    source: 'chatbot',
                    hp_verification: ''
                })
            });
            setLeadSaved(true);
            persistContactForBooking(email, phone, name);
            trackFunnelEvent('lead_captured', { contact: email || phone || 'unknown' });
        } catch (err) {
            console.warn('[AIChatbot] Lead save failed (non-fatal):', err.message);
        }
    }, [leadSaved, persistContactForBooking]);

    // ── Send message ─────────────────────────────────────────────────────
    const handleSend = async () => {
        if (!input.trim() || isLoading || isTyping) return;

        const userInput = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userInput }]);
        setInput('');
        setIsLoading(true);

        trackFunnelEvent('message_sent');

        // Auto-extract contact info
        const emailMatch = userInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = userInput.match(/(\+91|91|0)?[6-9]\d{9}/);
        if (emailMatch || phoneMatch) {
            saveLead(emailMatch?.[0], phoneMatch?.[0], null);
        }

        // Fire high-intent alert
        fetch('/api/chatbot/analyze-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: null, message: userInput, userIdentifier: emailMatch?.[0] || phoneMatch?.[0] || 'Chat User' })
        }).catch(() => {});

        try {
            const conversationHistory = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

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

            // 5. Artificial typing delay (makes it feel human)
            setIsLoading(false);
            setIsTyping(true);
            const typingDelay = Math.min(800 + content.length * 8, 2500); // scale with message length, max 2.5s
            await new Promise(resolve => setTimeout(resolve, typingDelay));
            setIsTyping(false);

            setMessages(prev => [...prev, { role: 'assistant', content }]);

            // Track if [BOOK_MEETING] was triggered
            if (content.includes('[BOOK_MEETING]')) {
                trackFunnelEvent('book_meeting_cta_shown');
            }
        } catch (error) {
            console.error('[AIChatbot] Error:', error);
            setIsLoading(false);
            setIsTyping(false);
            const isRateLimit = error.message?.includes('429') || error.message?.toLowerCase().includes('rate limit');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: isRateLimit
                    ? "I'm a bit busy right now with many Pune businesses! 📈 Please give me a minute and ask again."
                    : "I'm experiencing a quick blip! You can also reach us at connect@eyepune.com or [book a call](https://eyepune.com/Booking). 🚀"
            }]);
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
                        className={`bg-black border border-white/10 rounded-[20px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto ${
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
                                <a
                                    href="https://wa.me/919284712033?text=Hi%20EyE%20PunE%2C%20I%20was%20just%20chatting%20with%20your%20AI%20bot%20and%20want%20to%20connect%20with%20a%20human."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors group relative"
                                    aria-label="Connect on WhatsApp"
                                    onClick={() => trackFunnelEvent('whatsapp_header_clicked')}
                                >
                                    <Phone className="w-4 h-4 text-white group-hover:text-green-400 transition-colors" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                                </a>
                                <button
                                    aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minus className="w-4 h-4 text-white" />}
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
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                m.role === 'user'
                                                    ? 'bg-red-600 text-white rounded-tr-sm'
                                                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
                                            }`}>
                                                {m.content.includes('[BOOK_MEETING]') ? (
                                                    <div className="space-y-3">
                                                        <ReactMarkdown
                                                            className="prose prose-invert prose-sm max-w-none"
                                                            components={{ a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" className="text-orange-300 underline underline-offset-2 hover:text-orange-200" {...props} /> }}
                                                        >
                                                            {m.content.replace(/\[BOOK_MEETING\]/g, '')}
                                                        </ReactMarkdown>
                                                        <a
                                                            href="/Booking"
                                                            onClick={() => trackFunnelEvent('book_meeting_clicked')}
                                                            className="block w-full text-center bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all animate-pulse text-sm"
                                                        >
                                                            🔥 Book Your Strategy Call
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <ReactMarkdown
                                                        className="prose prose-invert prose-sm max-w-none"
                                                        components={{ a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" className="text-orange-300 underline underline-offset-2 hover:text-orange-200" {...props} /> }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Typing / loading indicator */}
                                    {(isLoading || isTyping) && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                                {isTyping ? (
                                                    <div className="flex gap-1">
                                                        {[0, 150, 300].map(d => (
                                                            <span key={d} className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Loader2 className="w-4 h-4 animate-spin text-red-500 flex-shrink-0" />
                                                )}
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                                    {isTyping ? 'EyE BoT is typing...' : 'AI is thinking...'}
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
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Ask anything about EyE PunE..."
                                            disabled={isLoading || isTyping}
                                            className="bg-white/5 border-white/10 rounded-2xl h-12 pl-4 pr-14 text-white placeholder:text-gray-600 focus:border-red-600/50 text-sm"
                                            aria-label="Chat message input"
                                        />
                                        <button
                                            aria-label="Send message"
                                            onClick={handleSend}
                                            disabled={isLoading || isTyping || !input.trim()}
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
