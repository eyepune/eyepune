import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Wand2, RefreshCw, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIContentAssistant({ open, onClose, onApply, contentType = 'page' }) {
    const [activeTab, setActiveTab] = useState('generate');
    const [isLoading, setIsLoading] = useState(false);
    const [topic, setTopic] = useState('');
    const [existingContent, setExistingContent] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [seoSuggestions, setSeoSuggestions] = useState(null);

    const generateBlogPost = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a comprehensive blog post about: ${topic}. 
                Include: 
                - An engaging introduction
                - 3-4 main sections with subheadings
                - Practical tips or insights
                - A compelling conclusion
                - Keep it professional and informative
                Format in markdown.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        content: { type: "string" },
                        excerpt: { type: "string" }
                    }
                }
            });
            setGeneratedContent(response.content);
        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to generate content');
        }
        setIsLoading(false);
    };

    const generateSEOSuggestions = async () => {
        if (!existingContent.trim()) return;
        setIsLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze this content and provide SEO optimization suggestions:
                
                Content: ${existingContent}
                
                Provide:
                1. 3 SEO-optimized title suggestions
                2. 3 meta description options (150-160 characters each)
                3. 10 relevant keywords
                4. Content improvement recommendations`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        titles: { type: "array", items: { type: "string" } },
                        meta_descriptions: { type: "array", items: { type: "string" } },
                        keywords: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } }
                    }
                }
            });
            setSeoSuggestions(response);
        } catch (error) {
            console.error('SEO analysis error:', error);
            alert('Failed to analyze content');
        }
        setIsLoading(false);
    };

    const rewriteContent = async () => {
        if (!existingContent.trim()) return;
        setIsLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Rewrite this content to improve clarity, engagement, and professionalism. 
                Keep the same meaning but make it more compelling:
                
                ${existingContent}
                
                Maintain the same structure but enhance:
                - Clarity and readability
                - Engagement and hook
                - Professional tone
                - Active voice where appropriate`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        rewritten_content: { type: "string" },
                        changes_made: { type: "array", items: { type: "string" } }
                    }
                }
            });
            setGeneratedContent(response.rewritten_content);
        } catch (error) {
            console.error('Rewrite error:', error);
            alert('Failed to rewrite content');
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-red-600" />
                        AI Content Assistant
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="generate">Generate Content</TabsTrigger>
                        <TabsTrigger value="seo">SEO Optimize</TabsTrigger>
                        <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="space-y-4">
                        <div>
                            <Label>Topic or Title</Label>
                            <Input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., The Future of AI in Digital Marketing"
                                className="mt-2"
                            />
                        </div>
                        <Button
                            onClick={generateBlogPost}
                            disabled={isLoading || !topic.trim()}
                            className="bg-red-600 hover:bg-red-700 w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate Blog Post
                                </>
                            )}
                        </Button>
                        {generatedContent && (
                            <div className="mt-4">
                                <Label>Generated Content</Label>
                                <Textarea
                                    value={generatedContent}
                                    onChange={(e) => setGeneratedContent(e.target.value)}
                                    className="mt-2 min-h-[300px] font-mono text-sm"
                                />
                                <Button
                                    onClick={() => {
                                        onApply({ content: generatedContent });
                                        onClose();
                                    }}
                                    className="mt-2 bg-green-600 hover:bg-green-700"
                                >
                                    Apply to Editor
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="seo" className="space-y-4">
                        <div>
                            <Label>Content to Analyze</Label>
                            <Textarea
                                value={existingContent}
                                onChange={(e) => setExistingContent(e.target.value)}
                                placeholder="Paste your content here for SEO analysis..."
                                className="mt-2 min-h-[150px]"
                            />
                        </div>
                        <Button
                            onClick={generateSEOSuggestions}
                            disabled={isLoading || !existingContent.trim()}
                            className="bg-red-600 hover:bg-red-700 w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate SEO Suggestions
                                </>
                            )}
                        </Button>
                        {seoSuggestions && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <Label className="text-sm font-semibold">Title Suggestions</Label>
                                    <div className="space-y-2 mt-2">
                                        {seoSuggestions.titles?.map((title, i) => (
                                            <div key={i} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => onApply({ title })}>
                                                {title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Meta Descriptions</Label>
                                    <div className="space-y-2 mt-2">
                                        {seoSuggestions.meta_descriptions?.map((desc, i) => (
                                            <div key={i} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer text-sm" onClick={() => onApply({ meta_description: desc })}>
                                                {desc}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Keywords</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {seoSuggestions.keywords?.map((keyword, i) => (
                                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rewrite" className="space-y-4">
                        <div>
                            <Label>Content to Rewrite</Label>
                            <Textarea
                                value={existingContent}
                                onChange={(e) => setExistingContent(e.target.value)}
                                placeholder="Paste your content here to improve it..."
                                className="mt-2 min-h-[150px]"
                            />
                        </div>
                        <Button
                            onClick={rewriteContent}
                            disabled={isLoading || !existingContent.trim()}
                            className="bg-red-600 hover:bg-red-700 w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Rewriting...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Rewrite Content
                                </>
                            )}
                        </Button>
                        {generatedContent && (
                            <div className="mt-4">
                                <Label>Improved Content</Label>
                                <Textarea
                                    value={generatedContent}
                                    onChange={(e) => setGeneratedContent(e.target.value)}
                                    className="mt-2 min-h-[300px]"
                                />
                                <Button
                                    onClick={() => {
                                        onApply({ content: generatedContent });
                                        onClose();
                                    }}
                                    className="mt-2 bg-green-600 hover:bg-green-700"
                                >
                                    Apply to Editor
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}