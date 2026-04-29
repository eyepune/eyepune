import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Edit, Trash2, Plus, Eye, Upload } from 'lucide-react';
import DynamicQuill from '@/components/shared/DynamicQuill';
import 'react-quill/dist/quill.snow.css';
import AdminGuard from "@/components/admin/AdminGuard";

function AdminBlogContent() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category: 'business_growth',
        tags: [],
        status: 'draft',
        scheduled_date: '',
        meta_title: '',
        meta_description: '',
        allow_comments: true
    });

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['admin-blog-posts'],
        queryFn: () => base44.entities.BlogPost.list('-created_date', 100)
    });

    const { data: comments = [] } = useQuery({
        queryKey: ['pending-comments'],
        queryFn: () => base44.entities.BlogComment.filter({ status: 'pending' })
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.BlogPost.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-blog-posts']);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-blog-posts']);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.BlogPost.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-blog-posts']);
        }
    });

    const approveCommentMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.BlogComment.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(['pending-comments']);
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            featured_image: '',
            category: 'business_growth',
            tags: [],
            status: 'draft',
            scheduled_date: '',
            meta_title: '',
            meta_description: '',
            allow_comments: true
        });
        setEditingPost(null);
        setIsDialogOpen(false);
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setFormData({ ...post, tags: post.tags || [] });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const postData = {
            ...formData,
            author_email: user.email,
            author_name: user.full_name,
            slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            published_date: formData.status === 'published' && !formData.published_date ? new Date().toISOString() : formData.published_date
        };

        if (editingPost) {
            updateMutation.mutate({ id: editingPost.id, data: postData });
        } else {
            createMutation.mutate(postData);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, featured_image: file_url });
        setUploadingImage(false);
    };

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Blog Management</h1>
                        <p className="text-muted-foreground mt-2">Manage blog posts and comments</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={async () => {
                                try {
                                    const response = await base44.functions.invoke('generateMissingBlogImages');
                                    if (response.data.success) {
                                        alert(`Generated ${response.data.success_count} images for blog posts!`);
                                        queryClient.invalidateQueries(['admin-blog-posts']);
                                    }
                                } catch (error) {
                                    alert('Error generating images');
                                }
                            }}
                        >
                            Generate Missing Images
                        </Button>
                        <Button
                            variant="outline"
                            onClick={async () => {
                                try {
                                    const response = await base44.functions.invoke('optimizeBlogSEO', {});
                                    if (response.data.success) {
                                        alert(`Optimized SEO for ${response.data.success_count} blog posts!`);
                                        queryClient.invalidateQueries(['admin-blog-posts']);
                                    }
                                } catch (error) {
                                    alert('Error optimizing SEO');
                                }
                            }}
                        >
                            Optimize SEO
                        </Button>
                        <Button
                            variant="outline"
                            onClick={async () => {
                                try {
                                    const response = await base44.functions.invoke('generateBlogSitemap', {});
                                    const blob = new Blob([response.data], { type: 'application/xml' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'blog-sitemap.xml';
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    a.remove();
                                } catch (error) {
                                    alert('Error generating sitemap');
                                }
                            }}
                        >
                            Download Sitemap
                        </Button>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="posts" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="posts">All Posts ({posts.length})</TabsTrigger>
                        <TabsTrigger value="comments">Pending Comments ({comments.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-12">Loading...</div>
                        ) : posts.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <p className="text-muted-foreground">No blog posts yet. Create your first one!</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {posts.map((post) => (
                                    <Card key={post.id}>
                                        <CardContent className="p-6">
                                            <div className="flex gap-6">
                                                {post.featured_image && (
                                                    <img
                                                        src={post.featured_image}
                                                        alt={post.title}
                                                        className="w-32 h-32 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                                                            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={async () => {
                                                                    try {
                                                                        const response = await base44.functions.invoke('optimizeBlogSEO', { post_id: post.id });
                                                                        if (response.data.success) {
                                                                            alert('SEO optimized for this post!');
                                                                            queryClient.invalidateQueries(['admin-blog-posts']);
                                                                        }
                                                                    } catch (error) {
                                                                        alert('Error optimizing SEO');
                                                                    }
                                                                }}
                                                            >
                                                                SEO
                                                            </Button>
                                                            {post.status === 'published' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={async () => {
                                                                        try {
                                                                            const res = await fetch('/api/automation/linkedin', {
                                                                                method: 'POST',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ postId: post.id })
                                                                            });
                                                                            const result = await res.json();
                                                                            if (result.success) {
                                                                                alert('Successfully posted to LinkedIn!');
                                                                            } else {
                                                                                alert('LinkedIn Error: ' + result.error);
                                                                            }
                                                                        } catch (error) {
                                                                            alert('Error posting to LinkedIn: ' + error.message);
                                                                        }
                                                                    }}
                                                                >
                                                                    📱 LinkedIn
                                                                </Button>
                                                            )}
                                                            <Button size="icon" variant="ghost" onClick={() => handleEdit(post)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => deleteMutation.mutate(post.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                                            {post.status}
                                                        </Badge>
                                                        <Badge variant="outline">{post.category}</Badge>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(post.created_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Eye className="w-3 h-3" />
                                                            {post.views_count || 0} views
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="comments" className="space-y-4">
                        {comments.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <p className="text-muted-foreground">No pending comments</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {comments.map((comment) => (
                                    <Card key={comment.id}>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold">{comment.commenter_name}</p>
                                                    <p className="text-sm text-muted-foreground">{comment.commenter_email}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => approveCommentMutation.mutate({ id: comment.id, status: 'approved' })}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => approveCommentMutation.mutate({ id: comment.id, status: 'spam' })}
                                                    >
                                                        Spam
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground">{comment.comment_text}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Post Editor Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Title *</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>URL Slug</Label>
                                    <Input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="auto-generated-from-title"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Excerpt</Label>
                                <Textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label>Content *</Label>
                                <DynamicQuill
                                    value={formData.content}
                                    onChange={(value) => setFormData({ ...formData, content: value })}
                                    className="bg-background"
                                />
                            </div>

                            <div>
                                <Label>Featured Image</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    {formData.featured_image && (
                                        <img src={formData.featured_image} alt="Preview" className="w-32 h-32 rounded object-cover" />
                                    )}
                                    <div>
                                        <input
                                            type="file"
                                            id="featured-image"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('featured-image').click()}
                                                disabled={uploadingImage}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={async () => {
                                                    setUploadingImage(true);
                                                    try {
                                                        const result = await base44.integrations.Core.GenerateImage({
                                                            prompt: `Professional blog header image for article about: ${formData.title}. Modern, clean, business-focused design.`
                                                        });
                                                        setFormData({ ...formData, featured_image: result.url });
                                                    } catch (error) {
                                                        console.error('Failed to generate image:', error);
                                                    }
                                                    setUploadingImage(false);
                                                }}
                                                disabled={uploadingImage || !formData.title}
                                            >
                                                {uploadingImage ? 'Generating...' : 'AI Generate'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="social_media">Social Media</SelectItem>
                                            <SelectItem value="web_development">Web Development</SelectItem>
                                            <SelectItem value="ai_automation">AI & Automation</SelectItem>
                                            <SelectItem value="branding">Branding</SelectItem>
                                            <SelectItem value="business_growth">Business Growth</SelectItem>
                                            <SelectItem value="case_studies">Case Studies</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Status *</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.status === 'scheduled' && (
                                    <div>
                                        <Label>Schedule Date</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.scheduled_date}
                                            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Tags (comma-separated)</Label>
                                <Input
                                    value={formData.tags.join(', ')}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                                    })}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Meta Title (SEO)</Label>
                                    <Input
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Meta Description (SEO)</Label>
                                    <Textarea
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminBlog() {
    return (
        <AdminGuard>
            <AdminLayout>
                <AdminBlogContent />
            </AdminLayout>
        </AdminGuard>
    );
}