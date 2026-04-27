import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, User, ArrowLeft, MessageCircle, Clock, Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    const postId = searchParams.get('id');
    const postSlug = searchParams.get('slug');
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
            try {
                let query = supabase.from('blog_posts').select('*');
                
                if (postSlug && postSlug !== 'undefined') {
                    console.log('Fetching by slug:', postSlug);
                    query = query.eq('slug', postSlug);
                } else if (postId && postId !== 'undefined') {
                    console.log('Fetching by id:', postId);
                    query = query.eq('id', postId);
                } else {
                    console.warn('No valid slug or ID provided');
                    console.groupEnd();
                    return null;
                }

                const { data, error } = await query.maybeSingle();
                if (error) {
                    console.error('Supabase Query Error:', error);
                    console.groupEnd();
                    return null;
                }
                
                console.log('Success:', data);
                console.groupEnd();
                return data;
            } catch (e) {
                console.error('Fetch Crash:', e);
                console.groupEnd();
                return null;
            }
        },
        enabled: !!(postId || postSlug)
    });

    const { data: relatedPosts = [] } = useQuery({
        queryKey: ['related-posts', post?.category, post?.id],
        queryFn: async () => {
            if (!post?.category || !post?.id) return [];
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('category', post.category)
                .neq('id', post.id)
                .limit(2);
            return data || [];
        },
        enabled: !!post?.id
    });

    const { data: comments = [] } = useQuery({
        queryKey: ['blog-comments', post?.id],
        queryFn: async () => {
            if (!post?.id) return [];
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
            const cleanString = String(dateString).trim().replace(' ', 'T');
            const date = new Date(cleanString);
            if (isNaN(date.getTime())) return 'Recently Published';
            return date.toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        } catch (e) {
            return 'Recently Published';
        }
    };

    useEffect(() => {
        async function trackView() {
            if (post?.id) {
                try {
                    const { error } = await supabase.rpc('increment_post_views', { post_id: post.id });
                    if (error) console.warn('View tracking error:', error.message);
                } catch (e) {
                    console.warn('View tracking crashed (likely function missing)');
                }
            }
        }
        trackView();
    }, [post?.id]);

    const commentMutation = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('blog_comments').insert([data]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['blog-comments', post?.id]);
            setCommentForm({ commenter_name: '', commenter_email: '', comment_text: '' });
        }
    });

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
                <Link href={createPageUrl("Blog")}><Button className="bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl font-black">Back to Feed</Button></Link>
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

            {/* Hero Section */}
            <header className="relative w-full overflow-hidden min-h-[60vh] flex items-end">
                <div className="absolute inset-0 z-0">
                        <div className="relative w-full h-full">
                            <Image 
                                src={featuredImg} 
                                fill
                                sizes="100vw"
                                priority
                                className="object-cover brightness-[0.6]"
                                alt={post.title || "Blog Post Header"}
                            />
                        </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040404] via-[#040404]/80 to-transparent" />
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10 py-24 w-full">
                    <Link href={createPageUrl("Blog")}>
                        <div className="inline-flex items-center gap-2 text-red-500 font-bold mb-10 hover:text-red-400 transition-colors cursor-pointer group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Feed
                        </div>
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Badge className="bg-red-600 text-white mb-6 px-4 py-1.5 text-xs uppercase font-black tracking-widest border-none rounded-full">
                            {post.category?.replace('_', ' ')}
                        </Badge>
                        <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-[10px]">E</div>
                                <span>{post.author || 'EyE PunE'}</span>
                            </div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-red-600" /> {formatDate(post.published_date)}</div>
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-600" /> {getReadingTime(post.content)} min read</div>
                            <div className="flex items-center gap-2"><Share2 className="w-4 h-4 text-red-600" /> {post.views_count || 0} views</div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-24">
                <div className="flex flex-col lg:flex-row gap-16">
                    <aside className="hidden lg:block w-12 flex-shrink-0">
                        <div className="sticky top-32 space-y-6">
                            <button onClick={() => handleShare('facebook')} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all"><Facebook className="w-5 h-5" /></button>
                            <button onClick={() => handleShare('twitter')} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-sky-500 transition-all"><Twitter className="w-5 h-5" /></button>
                            <button onClick={() => handleShare('linkedin')} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-700 transition-all"><Linkedin className="w-5 h-5" /></button>
                            <button onClick={() => handleShare('copy')} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-600 transition-all">
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </aside>

                    <article className="flex-1 max-w-3xl">
                        {post.excerpt && (
                            <div className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed italic mb-16 pl-8 border-l-4 border-red-600">
                                {post.excerpt}
                            </div>
                        )}

                        <div className="prose prose-invert prose-base md:prose-lg max-w-none 
                            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
                            prose-h2:text-2xl md:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-white/5
                            prose-p:text-gray-300 prose-p:leading-[1.7] prose-p:mb-8
                            prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12
                            prose-blockquote:border-red-600 prose-blockquote:bg-white/5 prose-blockquote:p-8 prose-blockquote:rounded-3xl
                        ">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        {/* Related Articles */}
                        {relatedPosts.length > 0 && (
                            <section className="mt-32 pt-20 border-t border-white/10">
                                <h2 className="text-3xl font-black mb-12">Related Vision Insights</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {relatedPosts.map((relatedPost) => (
                                        <Link key={relatedPost.id} href={createPageUrl(`Blog_Post?slug=${relatedPost.slug}`)} className="group block">
                                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all h-full flex flex-col">
                                                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                                                    <Image src={relatedPost.featured_image || featuredImg} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform" alt={relatedPost.title || "Related Post"} />
                                                </div>
                                                <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors line-clamp-2">{relatedPost.title}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Comments */}
                        <section className="mt-32 pt-20 border-t border-white/10">
                            <h2 className="text-3xl font-black mb-12 flex items-center gap-4">
                                <MessageCircle className="w-10 h-10 text-red-600" />
                                Community Discussions ({comments.length})
                            </h2>

                            <form onSubmit={(e) => { e.preventDefault(); commentMutation.mutate({ ...commentForm, post_id: post.id, status: 'pending' }); }} className="bg-white/5 border border-white/5 p-8 md:p-12 rounded-[2.5rem] mb-16">
                                <h3 className="text-xl font-bold mb-8 text-red-500 uppercase tracking-widest text-xs">Post a Comment</h3>
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <Input value={commentForm.commenter_name} onChange={e => setCommentForm({...commentForm, commenter_name: e.target.value})} placeholder="Name" className="bg-white/5 border-white/10 rounded-xl h-14" required />
                                    <Input type="email" value={commentForm.commenter_email} onChange={e => setCommentForm({...commentForm, commenter_email: e.target.value})} placeholder="Email" className="bg-white/5 border-white/10 rounded-xl h-14" required />
                                </div>
                                <Textarea value={commentForm.comment_text} onChange={e => setCommentForm({...commentForm, comment_text: e.target.value})} placeholder="Join the discussion..." className="bg-white/5 border-white/10 rounded-2xl min-h-[150px] mb-8" required />
                                <Button type="submit" disabled={commentMutation.isPending} className="bg-red-600 hover:bg-red-700 h-14 px-10 rounded-xl font-black">
                                    {commentMutation.isPending ? 'Publishing...' : 'Post Insight'}
                                </Button>
                            </form>

                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="p-8 bg-white/5 border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black text-white">{comment.commenter_name[0]}</div>
                                            <div>
                                                <div className="font-bold">{comment.commenter_name}</div>
                                                <div className="text-xs text-gray-500">{formatDate(comment.created_at)}</div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400">{comment.comment_text}</p>
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