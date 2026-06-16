import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from "@/utils";
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import GlowCard from '@/components/shared/GlowCard';

const fallbackImages = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
];

export default function RecentInsights() {
    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['recent-blog-posts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('published_date', { ascending: false })
                .limit(6); // Increased limit for better marquee flow
            if (error) { console.warn('[RecentInsights] fetch error:', error.message); return []; }
            return data || [];
        },
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'Coming Soon';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Recent' : date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (isLoading || posts.length === 0) return null;

    const marqueeItems = [...posts, ...posts]; // Duplicate array for seamless looping

    const PostCard = ({ post, idx }) => (
        <Link href={createPageUrl(`Blog_Post?slug=${post.slug}`)} className="block h-full">
            <GlowCard className="group h-full flex flex-col p-6 cursor-pointer !rounded-3xl border border-white/10 hover:border-red-500/30 bg-black/40 backdrop-blur-sm">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-6 border border-white/10">
                    <Image 
                        src={post.featured_image || fallbackImages[idx % fallbackImages.length]} 
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => { 
                            e.currentTarget.srcset = "";
                            e.currentTarget.src = fallbackImages[idx % fallbackImages.length];
                        }}
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                    <span className="text-red-400">{post.category?.replace('_', ' ') || 'Insight'}</span>
                    <span>•</span>
                    <span>{formatDate(post.published_date)}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors line-clamp-2 leading-tight">
                    {post.title}
                </h3>
                
                <p className="text-gray-300 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-950 flex items-center justify-center text-[10px] font-black text-red-400 border border-red-500/30">E</div>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{post.author || 'EyE PunE'}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Read More
                    </div>
                </div>
            </GlowCard>
        </Link>
    );

    return (
        <section className="py-32 bg-transparent relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-red-900/5 to-transparent pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-red-500 font-medium tracking-widest text-sm uppercase">Latest Insights</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4">
                            The Vision <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Feed</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl">
                            Strategies, case studies, and insights on how to aggressively scale your revenue using AI and modern tech.
                        </p>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Link href={createPageUrl("Blog")} className="group flex items-center gap-2 text-white hover:text-red-400 transition-colors font-semibold">
                            View All Articles <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Reverse Infinite Marquee / Mobile Grid */}
            <div className="relative w-full overflow-hidden pb-8 mt-4 -mx-6 px-6 lg:mx-0 lg:px-0">
                <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-background via-background/90 to-transparent z-10 pointer-events-none hidden md:block" />
                <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-background via-background/90 to-transparent z-10 pointer-events-none hidden md:block" />
                
                {/* Mobile: Grid (No Scroll) */}
                <div className="grid grid-cols-1 gap-6 md:hidden">
                    {posts.map((post, idx) => (
                        <div key={`${post.id}-mobile`} className="w-full">
                            <PostCard post={post} idx={idx} />
                        </div>
                    ))}
                </div>

                {/* Desktop: Reverse Infinite Marquee */}
                <div className="hidden md:flex whitespace-nowrap">
                    <motion.div 
                        animate={{ x: ["-50%", "0%"] }} // Starts at -50% and moves right to 0%
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="flex gap-4 md:gap-6 items-stretch px-4 md:px-6 hover:[animation-play-state:paused]"
                    >
                        {marqueeItems.map((post, idx) => (
                            <div key={`${post.id}-${idx}`} className="w-[280px] sm:w-[320px] md:w-[420px] whitespace-normal shrink-0">
                                <PostCard post={post} idx={idx} />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
