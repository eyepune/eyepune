import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, User, ArrowLeft, MessageCircle, Clock, Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import SEOHead from "@/components/seo/SEOHead";

export default function BlogPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const postSlug = urlParams.get('slug');
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [commentForm, setCommentForm] = useState({
        commenter_name: '',
        commenter_email: '',
        comment_text: ''
    });

    const { data: post, isLoading } = useQuery({
        queryKey: ['blog-post', postId, postSlug],
        queryFn: async () => {
            console.group('🔍 Blog_Post Lookup');
            let query = supabase.from('blog_posts').select('*');
            if (postSlug) query = query.eq('slug', postSlug);
            else if (postId && postId !== 'undefined') query = query.eq('id', postId);
            else return null;

            const { data, error } = await query.maybeSingle();
            console.log('Result:', data);
            console.groupEnd();
            return data;
        },
        enabled: !!(postId || postSlug)
    });

    const { data: comments = [] } = useQuery({
        queryKey: ['blog-comments', post?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blog_comments')
                .select('*')
                .eq('post_id', post.id)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });
            return data || [];
        },
        enabled: !!post?.id
    });

    const getReadingTime = (content) => {
        const words = content?.split(/\s+/).length || 0;
        return Math.ceil(words / 200) || 1;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently Published';
        try {
            // Remove any trailing characters that might break the parser
            const cleanString = String(dateString).trim().replace(' ', 'T');
            const date = new Date(cleanString);
            
            if (isNaN(date.getTime())) {
                // Try one more fallback for DD/MM/YYYY formats
                const parts = cleanString.split(/[-/T]/);
                if (parts.length >= 3) {
                    const fallbackDate = new Date(parts[0], parts[1] - 1, parts[2]);
                    if (!isNaN(fallbackDate.getTime())) {
                        return fallbackDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                    }
                }
                return 'Recently Published';
            }

            return date.toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        } catch (e) {
            return 'Recently Published';
        }
    };

    useEffect(() => {
        if (post?.id) {
            supabase.rpc('increment_post_views', { post_id: post.id })
                .catch(err => console.warn('Could not increment views:', err));
        }
    }, [post?.id]);

    const handleShare = (platform) => {
        const url = window.location.href;
        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            const links = {
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            };
            window.open(links[platform], '_blank');
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#040404] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!post) return (
        <div className="min-h-screen bg-[#040404] flex items-center justify-center text-white p-6">
            <div className="text-center max-w-md">
                <h2 className="text-4xl font-black mb-6 tracking-tighter">Insight Not Found</h2>
                <p className="text-gray-500 mb-8">The article you are looking for might have been moved or updated.</p>
                <Link to={createPageUrl("Blog")}><Button className="bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl font-black">Back to Feed</Button></Link>
            </div>
        </div>
    );

    const featuredImg = post.featured_image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000';

    return (
        <div className="min-h-screen bg-[#040404] text-white selection:bg-red-500/30 font-sans">
            <SEOHead
                title={`${post.title} | EyE PunE Vision`}
                description={post.excerpt}
                ogImage={featuredImg}
                canonicalUrl={`https://eyepune.com/Blog_Post?slug=${post.slug}`}
            />

            {/* Reading Progress Bar */}
            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-red-600 z-[100] origin-left" style={{ scaleX }} />

            {/* Immersive Hero Section */}
            <header className="relative w-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <motion.div 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full"
                    >
                        <img 
                            src={featuredImg} 
                            className="w-full h-full object-cover brightness-50"
                            alt={post.title}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000' }}
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040404] via-[#040404]/80 to-transparent" />
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10 pt-32 pb-24">
                    <Link to={createPageUrl("Blog")}>
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 text-red-500 font-bold mb-12 hover:text-red-400 transition-colors cursor-pointer group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Feed
                        </motion.div>
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Badge className="bg-red-600 text-white mb-8 px-5 py-2 text-xs uppercase font-black tracking-widest border-none rounded-full">
                            {post.category?.replace('_', ' ')}
                        </Badge>
                        <h1 className="text-4xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tight">
                            {post.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-gray-400 text-sm font-bold tracking-tight">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-black text-xs">E</div>
                                <span>{post.author || 'EyE PunE Team'}</span>
                            </div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-red-600" /> {formatDate(post.published_date)}</div>
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-600" /> {getReadingTime(post.content)} min read</div>
                            <div className="flex items-center gap-2"><Share2 className="w-4 h-4 text-red-600" /> {post.views_count || 0} views</div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-24">
                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Share Sidebar (Desktop Only) */}
                    <aside className="hidden lg:block w-12 flex-shrink-0">
                        <div className="sticky top-32 space-y-6">
                            <button onClick={() => handleShare('facebook')} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all group"><Facebook className="w-5 h-5" /></button>
                            <button onClick={() => handleShare('twitter')} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-sky-500 hover:border-sky-400 transition-all"><Twitter className="w-5 h-5" /></button>
                            <button onClick={() => handleShare('linkedin')} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-700 hover:border-blue-600 transition-all"><Linkedin className="w-5 h-5" /></button>
                            <button onClick={() => handleShare('copy')} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-all">
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </aside>

                    {/* Article Content */}
                    <article className="flex-1 max-w-3xl">
                        {post.excerpt && (
                            <div className="text-2xl text-gray-400 font-medium leading-relaxed italic mb-20 pl-8 border-l-4 border-red-600">
                                {post.excerpt}
                            </div>
                        )}

                        <div className="prose prose-invert prose-xl max-w-none 
                            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
                            prose-h2:text-4xl prose-h2:mt-20 prose-h2:mb-10 prose-h2:pb-4 prose-h2:border-b prose-h2:border-white/5
                            prose-p:text-gray-300 prose-p:leading-[1.9] prose-p:mb-10
                            prose-strong:text-red-500 prose-strong:font-black
                            prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-16
                            prose-blockquote:border-red-600 prose-blockquote:bg-white/5 prose-blockquote:p-10 prose-blockquote:rounded-[2rem] prose-blockquote:not-italic
                        ">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        {/* Mobile Share */}
                        <div className="lg:hidden mt-24 pt-12 border-t border-white/10">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-500 text-center">Share Insight</h3>
                            <div className="flex gap-4">
                                <button onClick={() => handleShare('facebook')} className="flex-1 py-5 rounded-3xl bg-white/5 border border-white/5 flex justify-center"><Facebook /></button>
                                <button onClick={() => handleShare('twitter')} className="flex-1 py-5 rounded-3xl bg-white/5 border border-white/5 flex justify-center"><Twitter /></button>
                                <button onClick={() => handleShare('linkedin')} className="flex-1 py-5 rounded-3xl bg-white/5 border border-white/5 flex justify-center"><Linkedin /></button>
                            </div>
                        </div>

                        {/* Comments */}
                        <section className="mt-40 pt-24 border-t border-white/10">
                            <h2 className="text-4xl font-black mb-16 flex items-center gap-5">
                                <MessageCircle className="w-12 h-12 text-red-600" />
                                Comments ({comments.length})
                            </h2>

                            <form onSubmit={(e) => { e.preventDefault(); commentMutation.mutate({ ...commentForm, post_id: post.id, status: 'pending' }); }} className="bg-white/5 border border-white/5 p-10 md:p-16 rounded-[3rem] mb-20 shadow-2xl">
                                <h3 className="text-2xl font-black mb-10">Join the Conversation</h3>
                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-3">
                                        <Label className="text-gray-400 font-bold ml-2">Display Name</Label>
                                        <Input value={commentForm.commenter_name} onChange={e => setCommentForm({...commentForm, commenter_name: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-16 focus:border-red-500 transition-all px-6" required />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-gray-400 font-bold ml-2">Email (Private)</Label>
                                        <Input type="email" value={commentForm.commenter_email} onChange={e => setCommentForm({...commentForm, commenter_email: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-16 focus:border-red-500 transition-all px-6" required />
                                    </div>
                                </div>
                                <div className="space-y-3 mb-12">
                                    <Label className="text-gray-400 font-bold ml-2">Your Thoughts</Label>
                                    <Textarea value={commentForm.comment_text} onChange={e => setCommentForm({...commentForm, comment_text: e.target.value})} className="bg-white/5 border-white/10 rounded-3xl min-h-[200px] focus:border-red-500 transition-all p-6" required />
                                </div>
                                <Button type="submit" disabled={commentMutation.isPending} className="bg-red-600 hover:bg-red-700 h-16 px-12 rounded-2xl font-black text-xl w-full md:w-auto shadow-xl shadow-red-600/20 transition-all">
                                    {commentMutation.isPending ? 'Publishing...' : 'Post Comment'}
                                </Button>
                                {commentMutation.isSuccess && <p className="text-green-500 font-bold mt-6 ml-2 italic">Insight shared! Awaiting review.</p>}
                            </form>

                            <div className="space-y-10">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem]">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center font-black text-white text-lg">{comment.commenter_name[0]}</div>
                                            <div>
                                                <div className="font-bold text-lg text-white">{comment.commenter_name}</div>
                                                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{formatDate(comment.created_at)}</div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 leading-relaxed text-lg">{comment.comment_text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </article>
                </div>
            </main>
        </div>
    );
}