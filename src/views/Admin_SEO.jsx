'use client';

import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, TrendingUp, FileText, Link, Zap, ExternalLink, Download, CheckCircle2, Send, RefreshCw, AlertTriangle, Key, SearchCode, Settings2, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function AdminSEO() {
    const [analysisInput, setAnalysisInput] = useState({
        page_url: '',
        title: '',
        content: ''
    });

    const analyzeMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('analyzeSEO', data);
            return response.data;
        }
    });

    const generateSitemapMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('generateMainSitemap', {});
            return response.data;
        }
    });

    const [indexResult, setIndexResult] = useState(null);
    const submitIndexMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('googleIndexingSubmit', {});
            return response.data;
        },
        onSuccess: (data) => {
            setIndexResult(data);
            toast.success('Sitemap submitted to search engines successfully');
        },
        onError: (err) => toast.error('Failed to submit sitemap: ' + err.message)
    });

    const handleAnalyze = () => {
        if (!analysisInput.title || !analysisInput.content) {
            toast.error('Please provide both page title and content to analyze');
            return;
        }
        analyzeMutation.mutate(analysisInput);
    };

    const seoChecklist = [
        { title: 'Sitemap Generated', desc: 'XML sitemap with all pages including service pages', done: true },
        { title: 'Robots.txt Configured', desc: 'AI + search engine crawling optimized', done: true },
        { title: 'Meta Tags Optimized', desc: 'Title, description, keywords on all pages', done: true },
        { title: 'Open Graph Tags', desc: 'Social media sharing on all pages', done: true },
        { title: 'FAQ Rich Snippets', desc: 'Schema.org FAQ on all 5 service pages', done: true },
        { title: 'LocalBusiness Schema', desc: 'Local SEO schema in index.html', done: true },
        { title: 'Breadcrumb Schema', desc: 'Breadcrumb JSON-LD on all service pages', done: true },
        { title: 'Service Schema', desc: 'Service + price schema on each service page', done: true },
        { title: 'Mobile Responsive', desc: 'Mobile-first design implemented', done: true },
        { title: 'Canonical URLs', desc: 'Canonical tags on all pages', done: true },
        { title: 'WhatsApp CTA', desc: 'WhatsApp float with correct number', done: true },
        { title: 'Google Search Console', desc: 'Submit sitemap & verify ownership', done: false },
    ];

    const keywordSuggestions = {
        'Primary Keywords': [
            'digital marketing pune',
            'web development services pune',
            'social media marketing agency',
            'AI automation solutions',
            'business growth consultant'
        ],
        'Local SEO': [
            'best digital agency in pune',
            'pune web development company',
            'social media marketing pune',
            'IT services pune maharashtra'
        ],
        'Service Keywords': [
            'lead generation services',
            'CRM automation',
            'website design and development',
            'brand identity creation',
            'sales funnel optimization'
        ],
        'Long-tail Keywords': [
            'affordable web development for small business',
            'AI powered business automation pune',
            'social media management services for startups',
            'custom web application development india'
        ]
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <Globe className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="text-xs font-medium text-gray-300">Search Engine Optimization</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">SEO Management</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Optimize your website's visibility, track keyword performance, and manage technical SEO.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="relative z-10">
                <TabsList className="bg-[#111] border border-white/10 p-1 rounded-xl flex-wrap h-auto mb-6">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <TrendingUp className="w-4 h-4 mr-2" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="keywords" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <Key className="w-4 h-4 mr-2" /> Keywords
                    </TabsTrigger>
                    <TabsTrigger value="analyzer" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <SearchCode className="w-4 h-4 mr-2" /> Content Analyzer
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <Settings2 className="w-4 h-4 mr-2" /> Technical SEO
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 focus:outline-none">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div className="text-4xl font-bold text-white mb-1">85</div>
                                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Global SEO Score</div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Search className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="text-4xl font-bold text-white mb-1">24</div>
                                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Indexed Pages</div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Link className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div className="text-4xl font-bold text-white mb-1">12</div>
                                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Backlinks</div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Zap className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div className="text-4xl font-bold text-white mb-1">2.1s</div>
                                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Avg Load Time</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01] pb-4">
                            <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Pre-Launch Checklist
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Status of essential SEO foundations across the platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {seoChecklist.map((item, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={cn("flex items-start gap-3 p-4 border rounded-xl bg-white/[0.02] transition-colors", item.done ? "border-emerald-500/20 hover:border-emerald-500/40" : "border-amber-500/20 hover:border-amber-500/40")}>
                                        {item.done ? (
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-sm text-white mb-0.5">{item.title}</div>
                                            <div className="text-xs text-gray-400 leading-snug">{item.desc}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Keywords Tab */}
                <TabsContent value="keywords" className="space-y-6 focus:outline-none">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                                <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                    <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                                        <Key className="w-5 h-5 text-blue-500" /> Target Keyword Library
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">Curated keywords to target in your content and campaigns</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-8">
                                    {Object.entries(keywordSuggestions).map(([category, keywords]) => (
                                        <div key={category} className="space-y-3">
                                            <h3 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">{category}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {keywords.map((keyword, idx) => (
                                                    <Badge key={idx} variant="outline" className="px-3 py-1.5 bg-white/[0.03] border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-colors font-medium">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div>
                            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 h-full">
                                <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                    <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-500" /> Implementation Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ul className="space-y-4">
                                        {[
                                            "Use primary keywords in page titles (H1) and meta titles",
                                            "Include keywords naturally in the first 100 words of content",
                                            "Maintain a 1-2% keyword density to avoid stuffing",
                                            "Utilize LSI (Latent Semantic Indexing) variations",
                                            "Add keywords to image alt attributes",
                                            "Create dedicated landing pages for high-value terms"
                                        ].map((tip, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-gray-300">
                                                <div className="w-5 h-5 rounded bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20 text-yellow-500 font-bold text-xs">
                                                    {idx + 1}
                                                </div>
                                                <span className="leading-snug pt-0.5">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Analyzer Tab */}
                <TabsContent value="analyzer" className="space-y-6 focus:outline-none">
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                                <SearchCode className="w-5 h-5 text-purple-500" /> AI Content Analyzer
                            </CardTitle>
                            <CardDescription className="text-gray-400">Leverage AI to instantly score and optimize your page content</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Target URL (Optional)</Label>
                                    <Input value={analysisInput.page_url} onChange={(e) => setAnalysisInput({ ...analysisInput, page_url: e.target.value })} placeholder="https://eyepune.com/services/web-dev" className="bg-[#111] border-white/10 focus:border-purple-500/50 text-white h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Page Title <span className="text-purple-500">*</span></Label>
                                    <Input value={analysisInput.title} onChange={(e) => setAnalysisInput({ ...analysisInput, title: e.target.value })} placeholder="Enter current page title" className="bg-[#111] border-white/10 focus:border-purple-500/50 text-white h-11" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Raw Content <span className="text-purple-500">*</span></Label>
                                <Textarea value={analysisInput.content} onChange={(e) => setAnalysisInput({ ...analysisInput, content: e.target.value })} placeholder="Paste the text content of your page here for analysis..." rows={8} className="bg-[#111] border-white/10 focus:border-purple-500/50 text-white resize-none custom-scrollbar" />
                            </div>
                            
                            <div className="flex justify-end pt-2">
                                <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending} className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20 border-0 px-8 h-11">
                                    {analyzeMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><SearchCode className="w-4 h-4 mr-2" /> Run AI Analysis</>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {analyzeMutation.isSuccess && analyzeMutation.data?.analysis && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                                <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                    <CardTitle className="text-lg text-white font-bold flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-purple-500" /> Analysis Results
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-400 font-normal">Optimization Score:</span>
                                            <div className={cn("px-3 py-1 rounded-full text-sm font-bold border", 
                                                analyzeMutation.data.analysis.seo_score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : 
                                                analyzeMutation.data.analysis.seo_score >= 50 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : 
                                                "bg-red-500/10 text-red-400 border-red-500/30"
                                            )}>
                                                {analyzeMutation.data.analysis.seo_score} / 100
                                            </div>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> AI Optimized Title</h3>
                                                <div className="bg-[#111] border border-white/10 rounded-lg p-4 text-white text-sm font-medium leading-relaxed">
                                                    {analyzeMutation.data.analysis.optimized_title}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Suggested Meta Description</h3>
                                                <div className="bg-[#111] border border-white/10 rounded-lg p-4 text-white text-sm leading-relaxed">
                                                    {analyzeMutation.data.analysis.meta_description}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2 flex items-center gap-2"><Key className="w-3.5 h-3.5" /> Identified Primary Keywords</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {analyzeMutation.data.analysis.primary_keywords?.map((kw, idx) => (
                                                        <Badge key={idx} className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-2.5 py-1 text-xs">
                                                            {kw}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3 flex items-center gap-2"><Settings2 className="w-3.5 h-3.5" /> Actionable Recommendations</h3>
                                                <ul className="space-y-3">
                                                    {analyzeMutation.data.analysis.recommendations?.map((rec, idx) => (
                                                        <li key={idx} className="flex gap-3 text-sm text-gray-300 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                                            <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 font-medium text-xs">
                                                                {idx + 1}
                                                            </div>
                                                            <span className="leading-snug pt-0.5">{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </TabsContent>

                {/* Technical Tab */}
                <TabsContent value="technical" className="space-y-6 focus:outline-none">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                                    <Settings2 className="w-5 h-5 text-gray-400" /> Essential Files
                                </CardTitle>
                                <CardDescription className="text-gray-400">Core files that guide search engine crawlers</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#111] border border-white/10 rounded-xl group hover:border-white/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">XML Sitemap</div>
                                            <div className="text-xs text-gray-400 mt-0.5">Auto-generated map of your architecture</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={() => window.open('/api/functions/generateMainSitemap', '_blank')} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                                        <ExternalLink className="w-4 h-4 mr-2" /> View
                                    </Button>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-[#111] border border-white/10 rounded-xl group hover:border-white/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                            <FileText className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">Robots.txt</div>
                                            <div className="text-xs text-gray-400 mt-0.5">Crawler access directives</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={() => window.open('/api/functions/generateRobotsTxt', '_blank')} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                                        <ExternalLink className="w-4 h-4 mr-2" /> View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-blue-500" /> Search Engine Submission
                                </CardTitle>
                                <CardDescription className="text-gray-400">Notify search engines of updates</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <Button onClick={() => submitIndexMutation.mutate()} disabled={submitIndexMutation.isPending} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border-0 h-12 text-base font-semibold">
                                    {submitIndexMutation.isPending ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Submitting to Google & Bing...</> : <><Send className="w-5 h-5 mr-2" /> Ping Search Engines Now</>}
                                </Button>
                                
                                {indexResult && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-emerald-400 text-sm mb-0.5">{indexResult.message}</p>
                                            <p className="text-xs text-emerald-500/80">{indexResult.urls_in_sitemap} URLs discovered in sitemap</p>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="space-y-4 pt-2 border-t border-white/5">
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Manual Indexing Guides</h4>
                                        <div className="bg-[#111] border border-white/10 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-sm font-medium text-white">Google Search Console</span>
                                                </div>
                                                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">Open <ExternalLink className="w-3 h-3" /></a>
                                            </div>
                                            <div className="text-xs text-gray-500 pl-4 space-y-1 border-l border-white/5 ml-1">
                                                <p>1. Verify domain: <span className="font-mono bg-white/5 px-1 py-0.5 rounded text-gray-300">eyepune.com</span></p>
                                                <p>2. Submit sitemap: <span className="font-mono bg-white/5 px-1 py-0.5 rounded text-gray-300">/sitemap.xml</span></p>
                                                <p>3. Use URL Inspection tool for individual pages</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#111] border border-white/10 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                                <span className="text-sm font-medium text-white">Bing Webmaster Tools</span>
                                            </div>
                                            <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">Open <ExternalLink className="w-3 h-3" /></a>
                                        </div>
                                        <p className="text-xs text-gray-500 pl-4 mt-2">Import directly from Google Search Console (1-click setup)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function AdminSEOPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <AdminSEO />
            </AdminLayout>
        </AdminGuard>
    );
}