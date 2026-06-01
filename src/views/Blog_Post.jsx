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

const fallbackImages = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
];
const getFallback = (id) => {
    const str = String(id || Math.random());
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
    }
    return fallbackImages[sum % fallbackImages.length];
};

export default function BlogPost({ initialData }) {
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
        initialData: initialData,
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
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!post) return (
        <div className="min-h-screen bg-transparent flex items-center justify-center text-white p-6">
            <div className="text-center max-w-md">
                <h2 className="text-4xl font-black mb-6 tracking-tighter">Insight Not Found</h2>
                <p className="text-gray-500 mb-8">The article you are looking for might have been moved or updated.</p>
                <Link href={createPageUrl("Blog")}><Button className="bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl font-black">Back to Feed</Button></Link>
            </div>
        </div>
    );

    const featuredImg = post.featured_image || getFallback(post.id);

    return (
        <div className="min-h-screen bg-transparent text-white selection:bg-red-500/30 font-sans">
            <SEOHead
                title={`${post.title} | EyE PunE Vision`}
                description={post.excerpt}
                ogImage={featuredImg}
                canonicalUrl={`https://eyepune.com/Blog-Post?slug=${post.slug}`}
            />

            {/* Reading Progress Bar */}
            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-red-600 z-[100] origin-left" style={{ scaleX }} />

            {/* Hero Section */}
            <header className="relative w-full overflow-hidden min-h-[60vh] flex items-end">
                <div className="absolute inset-0 z-0">
                        <div className="relative w-full h-full">
                            <img 
                                src={featuredImg} 
                                className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
                                alt={post.title || "Blog Post Header"}
                                onError={(e) => { e.target.src = getFallback(post.id) }}
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

            <main className="max-w-5xl mx-auto px-6 pt-24 pb-40">
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

                    <article className="flex-1 max-w-3xl w-full min-w-0 overflow-hidden break-words">
                        {post.excerpt && (
                            <div className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed italic mb-16 pl-8 border-l-4 border-red-600">
                                {post.excerpt}
                            </div>
                        )}

                        <div className="prose prose-invert prose-base md:prose-lg max-w-none 
                            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
                            prose-h2:text-2xl md:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-white/5
                            prose-p:text-gray-300 prose-p:leading-[1.7] prose-p:mb-8
                            prose-img:max-w-full prose-img:h-auto prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12
                            prose-blockquote:border-red-600 prose-blockquote:bg-white/5 prose-blockquote:p-8 prose-blockquote:rounded-3xl
                            prose-pre:overflow-x-auto prose-pre:max-w-full prose-table:overflow-x-auto prose-table:block
                        ">
                            {post.content && /<[a-z][\s\S]*>/i.test(post.content) && post.content.includes('<p>') ? (
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            ) : (
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                    {post.content}
                                </ReactMarkdown>
                            )}
                        </div>

                        {/* Partner Affiliate Banner (Razorpay) */}
                        <div className="mt-16 p-8 bg-gradient-to-br from-blue-900/40 to-sky-900/20 border border-blue-500/20 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="relative z-10 flex-1">
                                <span className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-4 block">Featured Partner</span>
                                <svg viewBox="0 0 400 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto mb-4 text-white">
                                    <path d="M129.5 59.4V36.2h15.9c7.6 0 11.2 3.6 11.2 11 0 7.3-3.6 11.2-11.2 11.2h-15.9Zm-12.8 12.8h12.8v-7.3h15.2c10.4 0 16.9-4.3 20.8-10.4 2.1-3.3 3.3-7.6 3.3-12.4 0-14.7-9.5-22.3-24-22.3H116.7v52.4Zm64.1-1.3c0-3.3-2.1-5.7-8.3-6.4l-11.2-1.2c-2.4-.2-3.8-1.2-3.8-2.8 0-1.7 1.4-2.8 4.3-2.8 3.3 0 6.6.7 9 2.1v-6.9a26 26 0 0 0-9.2-1.7c-7.3 0-12.6 4-12.6 9.7 0 4 2.8 7.1 9 8.1l11.1 1.7c2.1.2 3.3.9 3.3 2.1 0 1.9-1.9 3.1-4.7 3.1-3.8 0-8.1-1.4-11.1-3.3v7.3c2.8 1.9 7.6 3.1 11.8 3.1 8.8.2 12.4-4 12.4-12.1Zm30.2 1.3V59.4l-14-22.3h-10l20.4 30.6-21.6 34.6h10l15.2-24.9ZM256.7 70.9c0-14-10-23.7-24-23.7-14.2 0-24.2 9.7-24.2 23.7s10 23.7 24.2 23.7c14.2.2 24-9.5 24-23.7Zm-12.3 0c0 9.7-4.5 15.6-11.6 15.6-7.3 0-11.8-5.9-11.8-15.6 0-9.5 4.5-15.4 11.8-15.4 7.1.1 11.6 6 11.6 15.4Zm43.8-14.4c0-6.2-4.5-9.3-13.3-9.3h-14v45h11.8v-17h2.8l10 17h13l-11.6-18.7c7.5-1.2 11.3-4.5 11.3-17Zm-15.4 9h-6v-10h6c3.8 0 5.4 1.2 5.4 5s-1.6 5-5.4 5Zm48 5.4c0-14-10-23.7-24-23.7-14.2 0-24.2 9.7-24.2 23.7s10 23.7 24.2 23.7c14-1 24-10.6 24-23.7Zm-12.3 0c0 9.7-4.5 15.6-11.6 15.6-7.3 0-11.8-5.9-11.8-15.6 0-9.5 4.5-15.4 11.8-15.4 7.2.1 11.6 6 11.6 15.4Zm29.9 23.7V62.4c0-4 1.7-6.2 5.7-6.2 1.4 0 2.8.2 4.3.7v-9.7a14 14 0 0 0-4.5-.7c-4 0-7.3 2.1-9.2 6.4h-.2v-5.7H314v47.4h11.6v-3.8h.3v3.8h5.3v-1.7l1.1.2Zm37.2-12.3c0-3.3-2.1-5.7-8.3-6.4l-11.1-1.2c-2.4-.2-3.8-1.2-3.8-2.8 0-1.7 1.4-2.8 4.3-2.8 3.3 0 6.6.7 9 2.1v-6.9a26 26 0 0 0-9.2-1.7c-7.3 0-12.6 4-12.6 9.7 0 4 2.8 7.1 9 8.1l11.1 1.7c2.1.2 3.3.9 3.3 2.1 0 1.9-1.9 3.1-4.7 3.1-3.8 0-8.1-1.4-11.1-3.3v7.3c2.8 1.9 7.6 3.1 11.8 3.1 8.8.4 12.3-3.8 12.3-11.9ZM77.8 88.5h9.7l3.6-15.9 36.3.2 4.3-17.5-36.1-.2 8.3-36.8L103.5 0H0v18.7h94v.2L77.8 88.5Z" fill="currentColor"/>
                                </svg>
                                <p className="text-blue-200/80 text-sm md:text-base">Join the leading payment infrastructure powering EyE PunE. Accept global transactions seamlessly.</p>
                            </div>
                            <div className="relative z-10">
                                <a 
                                    href="https://rzp.io/rzp/1rSpeFFL" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="whitespace-nowrap inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                                >
                                    Get Started Free
                                </a>
                            </div>
                        </div>

                        {/* Related Articles */}
                        {relatedPosts.length > 0 && (
                            <section className="mt-32 pt-20 border-t border-white/10">
                                <h2 className="text-3xl font-black mb-12">Related Vision Insights</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {relatedPosts.map((relatedPost) => (
                                        <Link key={relatedPost.id} href={createPageUrl(`Blog-Post?slug=${relatedPost.slug}`)} className="group block">
                                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all h-full flex flex-col">
                                                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                                                    <img src={relatedPost.featured_image || getFallback(relatedPost.id)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" alt={relatedPost.title || "Related Post"} onError={(e) => { e.target.src = getFallback(relatedPost.id) }} />
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
