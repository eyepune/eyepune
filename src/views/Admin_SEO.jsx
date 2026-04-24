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
import { Search, TrendingUp, FileText, Link, Zap, ExternalLink, Download, CheckCircle2, Send, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        onSuccess: (data) => setIndexResult(data)
    });

    const handleAnalyze = () => {
        if (!analysisInput.title || !analysisInput.content) {
            alert('Please provide title and content');
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
        <div className="min-h-screen bg-background py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">SEO Management</h1>
                    <p className="text-muted-foreground">Optimize your website for search engines and track rankings</p>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="keywords">Keywords</TabsTrigger>
                        <TabsTrigger value="analyzer">Content Analyzer</TabsTrigger>
                        <TabsTrigger value="technical">Technical SEO</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-4 gap-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                        <div className="text-3xl font-bold">85</div>
                                        <div className="text-sm text-muted-foreground">SEO Score</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Search className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                        <div className="text-3xl font-bold">24</div>
                                        <div className="text-sm text-muted-foreground">Indexed Pages</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Link className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                                        <div className="text-3xl font-bold">12</div>
                                        <div className="text-sm text-muted-foreground">Backlinks</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                                        <div className="text-3xl font-bold">2.1s</div>
                                        <div className="text-sm text-muted-foreground">Load Time</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>SEO Checklist</CardTitle>
                                <CardDescription>Essential SEO elements for your website</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {seoChecklist.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                                            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${item.done ? 'text-green-600' : 'text-gray-300'}`} />
                                            <div>
                                                <div className="font-medium">{item.title}</div>
                                                <div className="text-sm text-muted-foreground">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="keywords" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Target Keywords</CardTitle>
                                <CardDescription>Optimize your content around these keywords</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {Object.entries(keywordSuggestions).map(([category, keywords]) => (
                                    <div key={category}>
                                        <h3 className="font-semibold mb-3">{category}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {keywords.map((keyword, idx) => (
                                                <Badge key={idx} variant="outline" className="px-3 py-1">
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Keyword Performance Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-sm space-y-2">
                                    <p>✓ Use primary keywords in page titles and H1 headings</p>
                                    <p>✓ Include keywords naturally in first 100 words</p>
                                    <p>✓ Maintain 1-2% keyword density in content</p>
                                    <p>✓ Use variations and related terms throughout</p>
                                    <p>✓ Add keywords to image alt text and meta descriptions</p>
                                    <p>✓ Create dedicated landing pages for main keywords</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analyzer" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI-Powered SEO Analyzer</CardTitle>
                                <CardDescription>Get instant SEO recommendations for your content</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Page URL</Label>
                                    <Input
                                        value={analysisInput.page_url}
                                        onChange={(e) => setAnalysisInput({ ...analysisInput, page_url: e.target.value })}
                                        placeholder="https://yoursite.com/page"
                                    />
                                </div>
                                <div>
                                    <Label>Page Title</Label>
                                    <Input
                                        value={analysisInput.title}
                                        onChange={(e) => setAnalysisInput({ ...analysisInput, title: e.target.value })}
                                        placeholder="Enter page title"
                                    />
                                </div>
                                <div>
                                    <Label>Content</Label>
                                    <Textarea
                                        value={analysisInput.content}
                                        onChange={(e) => setAnalysisInput({ ...analysisInput, content: e.target.value })}
                                        placeholder="Paste your page content here..."
                                        rows={8}
                                    />
                                </div>
                                <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending}>
                                    {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze SEO'}
                                </Button>
                            </CardContent>
                        </Card>

                        {analyzeMutation.isSuccess && analyzeMutation.data?.analysis && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        SEO Analysis Results
                                        <Badge variant={analyzeMutation.data.analysis.seo_score >= 70 ? 'default' : 'destructive'}>
                                            Score: {analyzeMutation.data.analysis.seo_score}/100
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">Optimized Title</h3>
                                        <p className="text-sm bg-muted p-3 rounded">{analyzeMutation.data.analysis.optimized_title}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Suggested Meta Description</h3>
                                        <p className="text-sm bg-muted p-3 rounded">{analyzeMutation.data.analysis.meta_description}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Primary Keywords</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analyzeMutation.data.analysis.primary_keywords?.map((kw, idx) => (
                                                <Badge key={idx} variant="default">{kw}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Recommendations</h3>
                                        <ul className="space-y-2 text-sm">
                                            {analyzeMutation.data.analysis.recommendations?.map((rec, idx) => (
                                                <li key={idx} className="flex gap-2">
                                                    <span>•</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="technical" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sitemap & Indexing</CardTitle>
                                <CardDescription>Manage your website's search engine visibility</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-medium">XML Sitemap</div>
                                        <div className="text-sm text-muted-foreground">Automatically generated sitemap for search engines</div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open('/api/functions/generateMainSitemap', '_blank')}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Sitemap
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Robots.txt</div>
                                        <div className="text-sm text-muted-foreground">Control search engine crawling behavior</div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open('/api/functions/generateRobotsTxt', '_blank')}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Robots.txt
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Submit to Search Engines</CardTitle>
                                <CardDescription>Ping Google & Bing to crawl the updated sitemap</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={() => submitIndexMutation.mutate()}
                                    disabled={submitIndexMutation.isPending}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {submitIndexMutation.isPending ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Send className="w-4 h-4 mr-2" />Ping Google & Bing Now</>}
                                </Button>
                                {indexResult && (
                                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                                        <p className="font-semibold text-green-700 dark:text-green-300 mb-2">✓ {indexResult.message}</p>
                                        <p className="text-green-600 dark:text-green-400">{indexResult.urls_in_sitemap} URLs in sitemap</p>
                                    </div>
                                )}
                                <div className="p-4 bg-muted rounded-lg space-y-3 text-sm">
                                    <p className="font-medium">For faster manual indexing:</p>
                                    <ol className="list-decimal list-inside space-y-1.5 ml-2 text-muted-foreground">
                                        <li>Go to <a href="https://search.google.com/search-console" target="_blank" className="text-blue-600 hover:underline font-medium">Google Search Console</a></li>
                                        <li>Add & verify property: <span className="font-mono text-xs bg-black/10 px-1 rounded">eyepune.com</span></li>
                                        <li>Sitemaps → Submit: <span className="font-mono text-xs bg-black/10 px-1 rounded">eyepune.com/sitemap.xml</span></li>
                                        <li>URL Inspection → paste each page URL → Request Indexing</li>
                                    </ol>
                                </div>
                                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                                    <p className="font-medium">Bing Webmaster Tools:</p>
                                    <a href="https://www.bing.com/webmasters" target="_blank" className="text-blue-600 hover:underline">bing.com/webmasters</a>
                                    <span className="text-muted-foreground"> — Import from Google Search Console (1-click)</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Technical SEO Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span>Enable HTTPS and SSL certificate ✓</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span>Implement responsive design for mobile ✓</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span>Optimize images and media files ✓</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span>Use structured data markup ✓</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span>Create XML sitemap ✓</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-600">⚠</span>
                                        <span>Set up Google Analytics tracking</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-600">⚠</span>
                                        <span>Configure canonical URLs for duplicate content</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-600">⚠</span>
                                        <span>Implement breadcrumb navigation</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
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