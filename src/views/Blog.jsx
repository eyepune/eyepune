import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Calendar, User, ArrowRight, Search, Tag, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";

export default function Blog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['blog-posts'],
        queryFn: () => base44.entities.BlogPost.filter({ status: 'published' }, '-published_date', 50),
    });

    const categories = [
        { value: 'all', label: 'All Posts' },
        { value: 'social_media', label: 'Social Media' },
        { value: 'web_development', label: 'Web Development' },
        { value: 'ai_automation', label: 'AI & Automation' },
        { value: 'branding', label: 'Branding' },
        { value: 'business_growth', label: 'Business Growth' },
        { value: 'case_studies', label: 'Case Studies' },
    ];

    const getReadingTime = (content) => {
        const wordsPerMinute = 200;
        const words = content?.split(/\s+/).length || 0;
        return Math.ceil(words / wordsPerMinute);
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredPosts = posts.slice(0, 3);
    const mainPosts = selectedCategory === 'all' ? filteredPosts : filteredPosts;

    return (
        <div className="min-h-screen bg-background">
        <SEOHead
            title="Digital Marketing Blog | Tips, Case Studies & Growth Insights – EyE PunE"
            description="Expert articles on social media marketing, website development, AI automation, branding and business growth strategies. Stay updated with the latest digital marketing insights from EyE PunE, Pune."
            keywords="digital marketing blog, social media tips, AI automation blog, business growth tips, marketing insights pune, SEO tips india, content marketing"
            canonicalUrl="https://eyepune.com/Blog"
            structuredData={{"@context":"https://schema.org","@type":"Blog","name":"EyE PunE Blog","url":"https://eyepune.com/Blog","publisher":{"@type":"Organization","name":"EyE PunE"}}}
        />
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 overflow-hidden py-24 md:py-32"
            >
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                            Insights & Stories
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Expert tips, case studies, and insights to help you grow your business
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto space-y-6 mb-16">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 py-6 text-lg"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map((cat, idx) => (
                            <motion.div key={cat.value} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                                <Button
                                    variant={selectedCategory === cat.value ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className="rounded-full"
                                >
                                    {cat.label}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Featured Posts */}
                {selectedCategory === 'all' && !searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20"
                    >
                        <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {featuredPosts.map((post, idx) => (
                                <Link key={post.id} to={createPageUrl(`Blog_Post?id=${post.id}`)}>
                                    <motion.article
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group h-full"
                                    >
                                        <div className="bg-card border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                            {post.featured_image && (
                                                <div className="aspect-video overflow-hidden bg-muted">
                                                    <img
                                                        src={post.featured_image}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <Badge className="w-fit mb-3 bg-red-100 text-red-800">{post.category?.replace('_', ' ')}</Badge>
                                                <h3 className="font-bold text-lg mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {getReadingTime(post.content)} min read
                                                    </span>
                                                </div>
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-3">
                                                        {post.tags.slice(0, 2).map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Main Posts Grid */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : mainPosts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        No articles found. Try a different search or category.
                    </div>
                ) : (
                    <div>
                        <h2 className="text-3xl font-bold mb-8">All Articles</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mainPosts.map((post, index) => (
                                <Link key={post.id} to={createPageUrl(`Blog_Post?id=${post.id}`)}>
                                    <motion.article
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group h-full"
                                    >
                                        <div className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                            {post.featured_image && (
                                                <div className="aspect-video overflow-hidden bg-muted">
                                                    <img
                                                        src={post.featured_image}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(post.published_date).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <Clock className="w-3 h-3" />
                                                    <span>{getReadingTime(post.content)} min</span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between mt-auto pt-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {post.tags?.slice(0, 2).map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}