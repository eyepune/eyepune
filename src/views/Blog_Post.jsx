import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Tag, MessageCircle, Clock, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import ShareButtons from '@/components/blog/ShareButtons';

// Helper function to convert :::highlight::: syntax to markdown blockquote
const formatHighlightBoxes = (content) => {
    return content.replace(/:::highlight\n([\s\S]*?)\n:::/g, '> $1');
};

export default function BlogPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const postSlug = urlParams.get('slug');
    const queryClient = useQueryClient();

    const [commentForm, setCommentForm] = useState({
        commenter_name: '',
        commenter_email: '',
        comment_text: ''
    });

    const { data: post, isLoading } = useQuery({
        queryKey: ['blog-post', postId, postSlug],
        queryFn: async () => {
            if (postSlug) {
                const posts = await base44.entities.BlogPost.filter({ slug: postSlug, status: 'published' });
                return posts[0];
            } else if (postId) {
                const posts = await base44.entities.BlogPost.filter({ id: postId });
                return posts[0];
            }
            return null;
        },
        enabled: !!(postId || postSlug)
    });

    const { data: comments = [] } = useQuery({
        queryKey: ['blog-comments', postId],
        queryFn: () => base44.entities.BlogComment.filter({ post_id: postId, status: 'approved' }, '-created_date'),
        enabled: !!postId
    });

    const { data: relatedPosts = [] } = useQuery({
        queryKey: ['related-posts', post?.category],
        queryFn: () => post ? base44.entities.BlogPost.filter({ status: 'published', category: post.category }, '-published_date', 6) : [],
        enabled: !!post?.category
    });

    const getReadingTime = (content) => {
        const wordsPerMinute = 200;
        const words = content?.split(/\s+/).length || 0;
        return Math.ceil(words / wordsPerMinute);
    };

    useEffect(() => {
        if (post) {
            base44.entities.BlogPost.update(post.id, {
                views_count: (post.views_count || 0) + 1
            });
        }
    }, [post?.id]);

    const commentMutation = useMutation({
        mutationFn: (data) => base44.entities.BlogComment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['blog-comments', postId]);
            setCommentForm({ commenter_name: '', commenter_email: '', comment_text: '' });
        }
    });

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        commentMutation.mutate({
            ...commentForm,
            post_id: postId,
            status: 'pending'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Post not found</h2>
                    <Link to={createPageUrl("Blog")}>
                        <Button>Back to Blog</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* SEO Meta Tags */}
            {post.meta_title && (
                <title>{post.meta_title}</title>
            )}
            {post.meta_description && (
                <meta name="description" content={post.meta_description} />
            )}

            {/* Featured Image */}
            {post.featured_image && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="aspect-video overflow-hidden bg-muted w-full"
                >
                    <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            )}

            <article className="max-w-4xl mx-auto px-6 py-16">
                {/* Back button */}
                <Link to={createPageUrl("Blog")}>
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Button>
                </Link>

                {/* Article Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Badge className="bg-red-100 text-red-800 mb-4">
                        {post.category?.replace('_', ' ').toUpperCase()}
                    </Badge>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{post.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{post.author_name}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.published_date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{getReadingTime(post.content)} min read</span>
                        </div>
                        <span>•</span>
                        <span>{post.views_count || 0} views</span>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.map((tag) => (
                                <Badge key={tag} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-3">Share this article:</p>
                        <ShareButtons post={post} />
                    </div>
                </motion.div>

                {/* Summary section */}
                {post.excerpt && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-red-50 dark:bg-red-950 border-l-4 border-red-600 p-6 mb-12 rounded-r-lg"
                    >
                        <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">Summary</h2>
                        <p className="text-red-900 dark:text-red-200 leading-relaxed">
                            {post.excerpt}
                        </p>
                    </motion.div>
                )}

                {/* Post content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="prose prose-lg dark:prose-invert max-w-none mb-16 prose-headings:font-bold prose-p:leading-relaxed prose-li:leading-relaxed prose-li:mb-4 prose-p:mb-8 prose-ul:space-y-4 prose-ol:space-y-4"
                >
                    <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-12 mb-6 pt-8 border-t" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                            h4: ({ node, ...props }) => <h4 className="text-xl font-semibold mt-6 mb-3" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-5 leading-relaxed" {...props} />,
                            ul: ({ node, ...props }) => <ul className="my-6 ml-6 list-disc space-y-3" {...props} />,
                            ol: ({ node, ...props }) => <ol className="my-6 ml-6 list-decimal space-y-3" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-3" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-red-600 pl-4 py-2 my-6 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-4 rounded-r" {...props} />
                            ),
                            table: ({ node, ...props }) => (
                                <table className="w-full border-collapse my-6" {...props} />
                            ),
                            thead: ({ node, ...props }) => (
                                <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
                            ),
                            th: ({ node, ...props }) => (
                                <th className="border p-3 text-left font-bold" {...props} />
                            ),
                            td: ({ node, ...props }) => (
                                <td className="border p-3" {...props} />
                            ),
                            code: ({ node, inline, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <pre className="bg-gray-900 dark:bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4 border">
                                        <code className={className} {...props}>{children}</code>
                                    </pre>
                                ) : (
                                    <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 text-sm" {...props}>{children}</code>
                                );
                            },
                            a: ({ node, ...props }) => (
                                <a className="text-red-600 hover:text-red-500 underline" target="_blank" rel="noopener noreferrer" {...props} />
                            ),
                        }}
                    >
                        {formatHighlightBoxes(post.content)}
                    </ReactMarkdown>
                </motion.div>

                {/* Related Posts */}
                {relatedPosts.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-16 py-12 border-y"
                    >
                        <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {relatedPosts.filter(p => p.id !== post.id).slice(0, 2).map((relatedPost, idx) => (
                                <Link 
                                    key={relatedPost.id} 
                                    to={createPageUrl("Blog_Post") + `?id=${relatedPost.id}`}
                                    className="block h-full"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group h-full"
                                    >
                                        <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                            {relatedPost.featured_image && (
                                                <div className="aspect-video overflow-hidden bg-muted">
                                                    <img
                                                        src={relatedPost.featured_image}
                                                        alt={relatedPost.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-semibold text-base mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                                                    {relatedPost.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(relatedPost.published_date).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <Clock className="w-3 h-3" />
                                                    <span>{getReadingTime(relatedPost.content)} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Comments section */}
                {post.allow_comments && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="border-t pt-12"
                    >
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <MessageCircle className="w-6 h-6" />
                            Comments ({comments.length})
                        </h2>

                        {/* Comment form */}
                        <form onSubmit={handleCommentSubmit} className="mb-12 p-6 bg-card border rounded-2xl">
                            <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <Label>Name *</Label>
                                    <Input
                                        value={commentForm.commenter_name}
                                        onChange={(e) => setCommentForm({ ...commentForm, commenter_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={commentForm.commenter_email}
                                        onChange={(e) => setCommentForm({ ...commentForm, commenter_email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <Label>Your Comment *</Label>
                                <Textarea
                                    value={commentForm.comment_text}
                                    onChange={(e) => setCommentForm({ ...commentForm, comment_text: e.target.value })}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>
                            <Button type="submit" disabled={commentMutation.isPending}>
                                {commentMutation.isPending ? 'Submitting...' : 'Post Comment'}
                            </Button>
                            {commentMutation.isSuccess && (
                                <p className="text-green-600 text-sm mt-2">Comment submitted! It will appear after approval.</p>
                            )}
                        </form>

                        {/* Comments list */}
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="p-6 bg-card border rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                                            {comment.commenter_name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{comment.commenter_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(comment.created_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground">{comment.comment_text}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </article>
        </div>
    );
}