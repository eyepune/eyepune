import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from "@/utils";
import { Calendar, User, ArrowRight, Search, Tag, Clock, Sparkles, TrendingUp, Bot, Zap, Globe, Code, Database, MessageCircle, Instagram, Facebook, Linkedin, Twitter, Hash, ShieldCheck, Command } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";

export default function Blog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['blog-posts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('published_date', { ascending: false });
            if (error) { console.warn('[Blog] fetch error:', error.message); return []; }
            return data || [];
        },
    });

    const categories = [
        { value: 'all', label: 'All Insights', icon: Sparkles },
        { value: 'ai_automation', label: 'AI & Automation', icon: TrendingUp },
        { value: 'social_media', label: 'Social Media', icon: User },
        { value: 'web_development', label: 'Web Dev', icon: Clock },
        { value: 'business_growth', label: 'Growth', icon: ArrowRight },
        { value: 'case_studies', label: 'Success Stories', icon: Tag },
    ];

    const getReadingTime = (content) => {
        const wordsPerMinute = 200;
        const words = content?.split(/\s+/).length || 0;
        return Math.ceil(words / wordsPerMinute);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Coming Soon';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Recent' : date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredPost = posts[0];
    const otherPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

    return (
        <div className="min-h-screen bg-[#040404] text-white selection:bg-red-500/30">
            <SEOHead
                title="EyE PunE Blog – AI, Marketing & Growth Insights"
                description="Expert insights on digital growth, AI automation, and marketing strategy in Pune. Stay ahead of the curve with EyE PunE."
                keywords="digital marketing blog pune, AI automation insights, growth hacking india, marketing trends 2025"
                canonicalUrl="https://eyepune.com/Blog"
            />

            {/* Immersive Header */}
            <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/[0.05]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b0000,transparent_70%)] opacity-40" />
                
                {/* Floating Icons */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    {[
                        { Icon: BookOpen, x: "10%", y: "30%", delay: 0 },
                        { Icon: TrendingUp, x: "80%", y: "20%", delay: 1 },
                        { Icon: Sparkles, x: "20%", y: "70%", delay: 2 },
                        { Icon: Search, x: "70%", y: "60%", delay: 3 },
                        { Icon: Bot, x: "45%", y: "15%", delay: 4 },
                        { Icon: MessageCircle, x: "60%", y: "25%", delay: 5 },
                        { Icon: Hash, x: "30%", y: "85%", delay: 1.5 },
                        { Icon: Tag, x: "50%", y: "45%", delay: 2.5 },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                            className="absolute text-red-500"
                            style={{ left: item.x, top: item.y }}
                        >
                            <item.Icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={0.5} />
                        </motion.div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-block py-1 px-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-widest uppercase mb-6">
                            Insights & Strategy
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 italic">Vision</span> Feed
                        </h1>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
                            Deep dives into AI, marketing automation, and the future of business growth in India.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Featured Post — Cinematic Reveal */}
            {featuredPost && selectedCategory === 'all' && !searchQuery && (
                <section className="py-16 md:py-24 border-b border-white/[0.05]">
                    <div className="max-w-7xl mx-auto px-6">
                        <Link href={createPageUrl(`Blog_Post?slug=${featuredPost.slug}`)} className="group">
                            <motion.div 
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative grid lg:grid-cols-2 gap-12 items-center bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 hover:bg-white/[0.04] transition-all duration-700"
                            >
                                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-red-900/10">
                                    <Image 
                                        src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200'} 
                                        alt={featuredPost.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        priority
                                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#040404]/60 to-transparent" />
                                    <div className="absolute top-6 left-6">
                                        <Badge className="bg-red-600 text-white border-none px-4 py-1.5 text-sm font-bold shadow-lg">Featured</Badge>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-4 text-gray-500 text-sm font-medium mb-6">
                                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-red-500" /> {formatDate(featuredPost.published_date)}</span>
                                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-500" /> {getReadingTime(featuredPost.content)} min read</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 group-hover:text-red-500 transition-colors leading-tight">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-gray-400 text-lg mb-10 line-clamp-3 leading-relaxed">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center font-bold">E</div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{featuredPost.author || 'EyE PunE Team'}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest">Growth Strategist</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </section>
            )}

            {/* Filtering & Search — Sleek Sidebar Layout */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Sidebar Filters */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <div className="sticky top-32">
                                <div className="mb-12">
                                    <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500 mb-6">Search</h3>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Find insight..."
                                            className="bg-white/[0.03] border-white/[0.08] pl-11 py-6 rounded-2xl focus:border-red-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500 mb-6">Categories</h3>
                                    <div className="space-y-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.value}
                                                onClick={() => setSelectedCategory(cat.value)}
                                                className={`w-full flex items-center justify-between group p-3 rounded-xl transition-all ${
                                                    selectedCategory === cat.value 
                                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                                    : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <cat.icon className={`w-4 h-4 ${selectedCategory === cat.value ? 'text-red-500' : 'text-gray-600 group-hover:text-red-500'}`} />
                                                    <span className="text-sm font-bold tracking-tight">{cat.label}</span>
                                                </div>
                                                {selectedCategory === cat.value && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Posts Grid */}
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-8">All Articles</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <AnimatePresence mode='popLayout'>
                                    {isLoading ? (
                                        [...Array(6)].map((_, i) => (
                                            <div key={i} className="aspect-[4/5] bg-white/[0.02] border border-white/[0.05] rounded-3xl animate-pulse" />
                                        ))
                                    ) : otherPosts.length === 0 ? (
                                        <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-[2.5rem]">
                                            <p className="text-gray-500 text-lg">No insights found in this vision feed.</p>
                                        </div>
                                    ) : (
                                        otherPosts.map((post, idx) => (
                                            <motion.article
                                                key={post.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group"
                                            >
                                                <Link href={createPageUrl(`Blog_Post?slug=${post.slug}`)} className="block h-full">
                                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 h-full flex flex-col">
                                                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6">
                                                            <Image 
                                                                src={post.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'} 
                                                                alt={post.title}
                                                                fill
                                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">
                                                            <span className="text-red-500">{post.category?.replace('_', ' ')}</span>
                                                            <span>•</span>
                                                            <span>{formatDate(post.published_date)}</span>
                                                        </div>
                                                        <h3 className="text-2xl font-black mb-4 group-hover:text-red-500 transition-colors line-clamp-2 leading-tight">
                                                            {post.title}
                                                        </h3>
                                                        <p className="text-gray-500 text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                                                            {post.excerpt}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black">E</div>
                                                                <span className="text-xs font-bold text-gray-400">{post.author || 'EyE PunE'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                                                Read <ArrowRight className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.article>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}