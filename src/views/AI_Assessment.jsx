import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { Bot, ChevronRight, ChevronLeft, CheckCircle, Loader2, TrendingUp, AlertCircle, Lightbulb, Target, Zap, Award, Sparkles, Clock, Phone, Brain, Globe } from 'lucide-react';
import Link from 'next/link';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from "@/utils";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';
import SEOHead from '@/components/seo/SEOHead';

const auditSteps = [
  { id: 0, label: "Resolving secure DNS records & domain endpoints..." },
  { id: 1, label: "Crawling layout DOM, tag hierarchies & page meta..." },
  { id: 2, label: "Simulating Lighthouse performance and server latency..." },
  { id: 3, label: "Mapping strategic CRM integrations & funnel barriers..." },
  { id: 4, label: "Compiling personalized 90-day neural growth roadmap..." }
];

const questions = [
  { id: 'business_type', question: 'What type of business do you run?', type: 'input', placeholder: 'e.g., E-commerce, Consulting, SaaS, etc.' },
  { id: 'revenue_range', question: 'What is your current annual revenue range?', type: 'select', options: ['0-10L', '10L-50L', '50L-1Cr', '1Cr-5Cr', '5Cr+'] },
  { id: 'lead_generation_method', question: 'How do you currently generate leads?', type: 'textarea', placeholder: 'e.g., Social media, referrals, paid ads, cold calling...' },
  { id: 'sales_process', question: 'Describe your sales process', type: 'textarea', placeholder: 'How do you take a lead from first contact to closed deal?' },
  { id: 'marketing_channels', question: 'Which marketing channels do you use?', type: 'input', placeholder: 'e.g., Instagram, LinkedIn, Email, Google Ads' },
  { id: 'team_size', question: 'How many people are on your team?', type: 'select', options: ['1-5', '6-10', '11-25', '26-50', '50+'] },
  { id: 'online_presence', question: 'How would you describe your online presence?', type: 'select', options: ['no_website', 'basic_website', 'advanced_website', 'full_digital'] },
  { id: 'crm_usage', question: 'Do you use a CRM to track leads and customers?', type: 'select', options: ['none', 'spreadsheet', 'basic_crm', 'advanced_crm'] },
  { id: 'biggest_challenge', question: 'What is your biggest business challenge right now?', type: 'textarea', placeholder: 'Be specific - what keeps you up at night?' },
  { id: 'growth_goals', question: 'What are your growth goals for the next 12 months?', type: 'textarea', placeholder: 'Revenue targets, market expansion, team growth, etc.' }
];

export default function AI_Assessment() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        lead_name: '',
        lead_email: '',
        lead_phone: '',
        company_name: '',
        hp_verification: '', // Standardized honeypot field
    });
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState(null);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [auditUrl, setAuditUrl] = useState('');
    const [auditStep, setAuditStep] = useState(0);

    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const targetUrl = urlParams.get('url');
        
        if (targetUrl) {
            setAuditUrl(targetUrl);
            setStep(-1); // Special loading step for URL Audit
            handleUrlAudit(targetUrl);
        }
    }, []);

    const handleUrlAudit = async (targetUrl) => {
        setIsSubmitting(true);
        setIsGenerating(true);
        setAuditStep(0);
        
        let intervalId = setInterval(() => {
            setAuditStep(prev => {
                if (prev < 4) return prev + 1;
                clearInterval(intervalId);
                return prev;
            });
        }, 2200);
        
        try {
            // 1. Fetch Scrape (SEO) and PageSpeed in parallel
            const [scrapeRes, speedRes] = await Promise.all([
                fetch(`/api/scrape?url=${encodeURIComponent(targetUrl)}`),
                fetch(`/api/assessment/pagespeed?url=${encodeURIComponent(targetUrl)}`)
            ]);

            if (!scrapeRes.ok) throw new Error('Failed to analyze website URL');
            const scrapeData = await scrapeRes.json();
            const speedData = speedRes.ok ? await speedRes.json() : { data: { score: 50, lcp: 'N/A' } };
            
            if (!scrapeData.success) throw new Error(scrapeData.error || 'Failed to extract website data');
            
            const siteInfo = scrapeData.data;
            const seo = siteInfo.seo || {};
            const speed = speedData.data || {};
            
            // 2. Generate LLM Report with Hard Data
            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: "You are an elite AI Growth Consultant and Tech Strategist working FOR EyE PunE (a premium AI automation and Next.js web development agency). Your job is to analyze a POTENTIAL CLIENT'S real performance metrics and output a highly persuasive, visually structured markdown report. You must highlight the CLIENT'S critical gaps and directly pitch how EyE PunE's solutions will fix their problems. DO NOT critique EyE PunE." },
                        { role: 'user', content: `Analyze the potential client's website metrics below and generate a premium Strategy Report pitching to them.

Website URL: ${targetUrl}
Title: ${siteInfo.title}
Tech Stack Detected: ${seo.techStack}

**Technical Metrics (Hard Data):**
- Mobile Performance Score: ${speed.score}/100
- Largest Contentful Paint (LCP): ${speed.lcp}
- Cumulative Layout Shift (CLS): ${speed.cls}
- On-Page SEO Score: ${seo.rawSeoScore}/100
- H1 Tags Found: ${seo.h1Count}
- Image Alt Tag Completion: ${seo.altRatio}%

Format the report beautifully in Markdown with bolding, lists, and clear headers. 
Speak directly to the client (e.g., "Your website built on ${seo.techStack}...").
Use the exact following structure:

### Performance & SEO Score: [Insert Average of Performance & SEO Scores]/100

### Executive Summary
Provide a 2-3 sentence summary of what this client's business does and their current digital performance metrics.

### Key Strengths
* Bullet point 1
* Bullet point 2

### Critical Gaps Found
Identify 2-3 specific technical, SEO, or speed bottlenecks based on the hard data provided above (e.g. slow LCP, missing H1s, old tech stack).

### EyE PunE Strategic Recommendations
Provide 3 highly specific recommendations explaining how WE (EyE PunE) can scale them and fix their gaps. Explicitly pitch these EyE PunE services where relevant:
* **Custom & CMS Web Development** (Mention rebuilding them in Next.js for blazing fast speeds)
* **Elite Marketing Systems** (High-converting Sales Funnels, Paid Ads)
* **AI & Tech Automation** (AI Chatbots, CRM sync)

At the very bottom of your response, on a new line, output EXACTLY: [CRM_SCORE: <number>] (where number is between 1-100 indicating lead quality).` }
                    ]
                })
            });

            if (!response.ok) throw new Error('AI generation failed');

            const data = await response.json();
            const aiResponse = data?.content;
            
            const growthMatch = aiResponse.match(/Score.*?(\d+)/i);
            const growthScore = growthMatch ? parseInt(growthMatch[1]) : 65;
            
            const cleanAiResponse = aiResponse.replace(/\[CRM_SCORE:\s*\d+\]/i, '').trim();

            setReport({
                score: growthScore,
                content: cleanAiResponse
            });
            
            // Link data
            setFormData(prev => ({
                ...prev,
                company_name: siteInfo.title || targetUrl
            }));
            
            setStep(questions.length + 1); // Go to report view
            
        } catch (error) {
            console.error('Audit Error:', error);
            alert(`Audit failed: ${error.message}`);
            // Fall back to manual assessment
            setStep(0);
        } finally {
            clearInterval(intervalId);
            setIsGenerating(false);
            setIsSubmitting(false);
        }
    };

    const { useSearchParams } = require('next/navigation');
    const searchParams = useSearchParams();
    const urlEmail = searchParams ? searchParams.get('email') : null;

    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                setFormData(prev => ({
                    ...prev,
                    lead_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
                    lead_email: urlEmail || currentUser.email || '',
                    lead_phone: currentUser.user_metadata?.phone || '',
                }));
            } catch {
                setUser(null);
                if (urlEmail) {
                    setFormData(prev => ({
                        ...prev,
                        lead_email: urlEmail
                    }));
                }
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, [urlEmail]);

    const isContactStep = step === 0;
    const isQuestionStep = step > 0 && step <= questions.length;
    const isReportStep = step > questions.length;
    const isAuditLoadingStep = step === -1;
    const currentQuestion = step > 0 && step <= questions.length ? questions[step - 1] : null;

    const handleNext = () => {
        if (step < questions.length + 1) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        // Honeypot check
        if (formData.hp_verification) {
            console.warn('Bot detected by hp_verification honeypot');
            handleNext();
            return;
        }
        handleNext();
    };

    const handleAnswerChange = (value) => {
        if (currentQuestion.id === 'marketing_channels' && typeof value === 'string') {
            setAnswers({ ...answers, [currentQuestion.id]: value.split(',').map(s => s.trim()) });
        } else {
            setAnswers({ ...answers, [currentQuestion.id]: value });
        }
    };

    const handleSubmitAssessment = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        setIsGenerating(true);

        try {
            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are an elite AI Growth Consultant & Tech Strategist at EyE PunE (a premium AI automation and growth agency). Your role is to generate a highly persuasive, McKinsey/Bain-style strategic markdown report that identifies critical business gaps and explicitly pitches EyE PunE\'s solutions to solve them.' },
                        { role: 'user', content: `Analyze the following business assessment and generate a premium, highly actionable Strategy Report.

Business Profile:
- Business Type: ${answers.business_type}
- Annual Revenue: ${answers.revenue_range}
- Team Size: ${answers.team_size}
- Lead Generation: ${answers.lead_generation_method}
- Sales Process: ${answers.sales_process}
- Marketing Channels: ${Array.isArray(answers.marketing_channels) ? answers.marketing_channels.join(', ') : answers.marketing_channels}
- Online Presence: ${answers.online_presence}
- CRM Usage: ${answers.crm_usage}
- Biggest Challenge: ${answers.biggest_challenge}
- Growth Goals: ${answers.growth_goals}

Format the report beautifully in Markdown using bolding, lists, and clear headers. 
Speak directly to the client as their new growth partner.
Strictly adhere to the following structure to perfectly match our Elite PDF Generator:

### 📊 Growth Score: [Insert Score 0-100]/100

### 🎯 Executive Summary
Provide a high-impact, 2-3 sentence strategic summary of their current position and their massive potential for scale.

### ⚠️ Critical Growth Bottlenecks
Identify the top 2-3 specific barriers preventing them from hitting their growth goals based on their tech, marketing, or sales process.

### 🚀 EyE PunE Strategic Intervention
Provide 3 highly specific recommendations explaining exactly how EyE PunE will solve their bottlenecks. Explicitly pitch these EyE PunE services:
* **AI & Tech Automation** (If they lack CRM or automated sales)
* **Custom Web Development** (If their online presence is weak)
* **Elite Marketing Systems** (If their lead generation is manual/struggling)

### 📈 90-Day Execution Roadmap
* **Phase 1 (Days 1-30):** Foundation & Audit
* **Phase 2 (Days 31-60):** Automation & Deployment
* **Phase 3 (Days 61-90):** Scale & Optimization

At the very bottom of your response, on a new line, output EXACTLY: [CRM_SCORE: number] (where number is between 1-100 indicating lead quality).` }
                    ]
                })
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => 'Unknown network error');
                throw new Error(`AI generation failed (status ${response.status}): ${errText}`);
            }

            const data = await response.json();
            const aiResponse = data?.content;
            if (!aiResponse) {
                throw new Error('Server returned an empty or invalid report content.');
            }

            const growthMatch = aiResponse.match(/Growth Score.*?(\d+)/i);
            const growthScore = growthMatch ? parseInt(growthMatch[1]) : 65;
            
            const crmMatch = aiResponse.match(/\[CRM_SCORE:\s*(\d+)\]/i);
            const crmScore = crmMatch ? parseInt(crmMatch[1]) : 75;

            const cleanAiResponse = aiResponse.replace(/\[CRM_SCORE:\s*\d+\]/i, '').trim();

            const assessmentPayload = {
                name: formData.lead_name,
                email: formData.lead_email,
                phone: formData.lead_phone,
                company: formData.company_name,
                business_type: answers.business_type,
                revenue_range: answers.revenue_range,
                lead_generation_method: answers.lead_generation_method,
                sales_process: answers.sales_process,
                marketing_channels: Array.isArray(answers.marketing_channels) ? answers.marketing_channels.join(', ') : answers.marketing_channels,
                team_size: answers.team_size,
                online_presence: answers.online_presence,
                crm_usage: answers.crm_usage,
                biggest_challenge: answers.biggest_challenge,
                growth_goals: answers.growth_goals,
                score: growthScore,
                ai_report: cleanAiResponse,
                hp_verification: formData.hp_verification
            };

            // Call secure backend API
            fetch('/api/assessment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assessmentPayload)
            }).catch(e => console.warn('Backend logging failed', e));

            setReport({
                score: growthScore,
                content: cleanAiResponse
            });
            setIsGenerating(false);
            setIsSubmitting(false);
            handleNext();
        } catch (error) {
            console.error('Error in assessment submission:', error);
            alert(`Failed to generate report: ${error.message || error}. Please try again.`);
            setIsGenerating(false);
            setIsSubmitting(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!report || isPdfGenerating) return;
        setIsPdfGenerating(true);
        try {
            const clientName = formData.lead_name || "Valued Client";
            
            const response = await fetch('/api/assessment/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: clientName,
                    email: formData.lead_email,
                    business: formData.company_name,
                    score: report.score,
                    report: report.content,
                    answers: answers
                })
            });
            if (!response.ok) throw new Error('PDF failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `EyE_PunE_Strategy_${clientName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            alert('Failed to generate PDF');
        } finally {
            setIsPdfGenerating(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <>
            <SEOHead
                title="Free AI Business Assessment – Get Your Growth Roadmap | EyE PunE"
                description="Take our 3-minute AI-powered business assessment and receive a personalized growth roadmap. Discover your growth score, identify barriers, and get a 90-day action plan to scale your business in Pune."
                keywords="business assessment tool, free growth audit, AI business strategy, marketing performance score, business growth roadmap pune, scale your company"
                canonicalUrl="https://eyepune.com/AI-Assessment"
                structuredData={{ "@context": "https://schema.org", "@type": "WebPage", "name": "EyE PunE AI Business Assessment", "url": "https://eyepune.com/AI-Assessment" }}
            />

            <div className="min-h-screen bg-transparent text-white pt-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
            

            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 italic tracking-tighter">
                        {auditUrl ? 'AI Website Assessment' : 'AI Business Assessment'}
                    </h1>
                    <p className="text-xl text-gray-400">
                        {auditUrl ? 'Comprehensive tech & SEO audit in seconds' : 'Personalized growth roadmap in 3 minutes'}
                    </p>
                </div>

                {!isReportStep && !isAuditLoadingStep && (
                    <div className="mb-8">
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-red-600" animate={{ width: `${(step / (questions.length + 1)) * 100}%` }} />
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {isAuditLoadingStep && (
                        <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-10 max-w-xl mx-auto">
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                                <Bot className="w-12 h-12 text-white animate-pulse" />
                                <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            
                            <h2 className="text-3xl font-black mb-4 tracking-tight uppercase">
                                Neural Audit Running...
                            </h2>
                            <p className="text-gray-400 mb-10 text-base leading-relaxed">
                                Analyzing tech stack, performance scores, and strategic CRM growth channels for <strong className="text-white font-semibold">{auditUrl}</strong>.
                            </p>
                            
                            {/* Visual Timeline Checklist */}
                            <div className="space-y-4 text-left p-6 sm:p-8 rounded-2xl bg-white/[0.015] border border-white/5 backdrop-blur-md mb-8">
                                {auditSteps.map((s, idx) => {
                                    const isDone = auditStep > idx;
                                    const isActive = auditStep === idx;
                                    return (
                                        <div key={s.id} className="flex items-center gap-4 transition-all duration-300">
                                            {isDone ? (
                                                <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/60 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-3.5 h-3.5 text-red-400" />
                                                </div>
                                            ) : isActive ? (
                                                <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/60 flex items-center justify-center shrink-0 animate-pulse">
                                                    <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                                </div>
                                            )}
                                            
                                            <span className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
                                                isDone 
                                                    ? 'text-gray-500 line-through decoration-white/10' 
                                                    : isActive 
                                                        ? 'text-orange-400 font-semibold' 
                                                        : 'text-gray-600'
                                            }`}>
                                                {s.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-xs text-gray-600 uppercase tracking-widest flex items-center justify-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-rose-500" />
                                Custom recommendation pipeline engaged
                            </p>
                        </motion.div>
                    )}
                    {isContactStep && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <Card className="bg-[#0c0c0c] border-white/5 p-8">
                                <h2 className="text-2xl font-bold mb-6 italic">Let's start with your details</h2>
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <input type="text" className="hidden" name="hp_verification" value={formData.hp_verification} onChange={(e) => setFormData({...formData, hp_verification: e.target.value})} tabIndex="-1" />
                                    <div>
                                        <Label className="text-gray-400">Full Name *</Label>
                                        <Input value={formData.lead_name} onChange={(e) => setFormData({...formData, lead_name: e.target.value})} required className="bg-white/5 border-white/10 h-12" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-400">Email *</Label>
                                            <Input type="email" value={formData.lead_email} onChange={(e) => setFormData({...formData, lead_email: e.target.value})} required className="bg-white/5 border-white/10 h-12" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Phone *</Label>
                                            <Input value={formData.lead_phone} onChange={(e) => setFormData({...formData, lead_phone: e.target.value})} required className="bg-white/5 border-white/10 h-12" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-400">Company Name</Label>
                                        <Input value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="bg-white/5 border-white/10 h-12" />
                                    </div>
                                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-500 font-black h-12 mt-6">CONTINUE <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </form>
                            </Card>
                        </motion.div>
                    )}

                    {isQuestionStep && (
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <Card className="bg-[#0c0c0c] border-white/5 p-8">
                                <h2 className="text-2xl font-bold mb-8 italic">{currentQuestion.question}</h2>
                                {currentQuestion.type === 'input' && <Input value={answers[currentQuestion.id] || ''} onChange={(e) => handleAnswerChange(e.target.value)} className="bg-white/5 border-white/10 h-14 text-lg" placeholder={currentQuestion.placeholder} />}
                                {currentQuestion.type === 'textarea' && <Textarea value={answers[currentQuestion.id] || ''} onChange={(e) => handleAnswerChange(e.target.value)} className="bg-white/5 border-white/10 min-h-[150px] text-lg" placeholder={currentQuestion.placeholder} />}
                                {currentQuestion.type === 'select' && (
                                    <Select value={answers[currentQuestion.id] || ''} onValueChange={handleAnswerChange}>
                                        <SelectTrigger className="bg-white/5 border-white/10 h-14 text-lg">
                                            <SelectValue placeholder="Select one..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0c0c0c] border-white/10 text-white">
                                            {currentQuestion.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                                <div className="flex gap-4 mt-12">
                                    <Button variant="outline" onClick={handleBack} className="flex-1 border-white/10 text-gray-400 h-12">BACK</Button>
                                    <Button onClick={step === questions.length ? handleSubmitAssessment : handleNext} disabled={isSubmitting || !answers[currentQuestion.id]} className="flex-1 bg-red-600 hover:bg-red-500 font-black h-12">
                                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : step === questions.length ? 'GENERATE REPORT' : 'NEXT'}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {isReportStep && report && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="space-y-8">
                                <Card className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-10 text-center text-white border-none shadow-2xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <Award className="w-12 h-12 mx-auto mb-4 opacity-80" />
                                        <h2 className="text-2xl font-bold mb-2">Performance & SEO Score</h2>
                                        <div className="text-8xl font-black mb-4 tracking-tighter">{report.score}</div>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                            <Badge className="bg-white/20 text-white border-white/30 px-6 py-2">
                                                {report.score >= 80 ? 'EXCELLENT' : report.score >= 60 ? 'STRONG' : 'HIGH POTENTIAL'}
                                            </Badge>
                                            <Button onClick={handleDownloadPdf} disabled={isPdfGenerating} className="bg-white text-red-600 hover:bg-gray-100 font-black rounded-xl px-6 h-12">
                                                {isPdfGenerating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                DOWNLOAD STRATEGY PDF
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-[#0c0c0c] border-white/5 p-8">
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 italic">
                                        <Lightbulb className="w-6 h-6 text-yellow-500" /> Strategic Roadmap
                                    </h3>
                                    <div className="prose prose-invert max-w-none prose-red">
                                        <ReactMarkdown>{report.content}</ReactMarkdown>
                                    </div>
                                </Card>

                                <Card className="bg-red-600 p-8 text-center">
                                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                                    <h3 className="text-3xl font-black mb-4">Ready to Scale?</h3>
                                    <p className="text-xl mb-8 opacity-90">Let's implement your custom roadmap today.</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link href={createPageUrl("Booking")} className="flex-1">
                                            <Button className="w-full bg-white text-red-600 hover:bg-gray-100 font-black h-14 text-lg shadow-xl">
                                                BOOK STRATEGY CALL
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            </div>
        </>
    );
}
