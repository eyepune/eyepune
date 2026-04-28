import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Plus, Reply, Users, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectDiscussionForum({ project, user }) {
    const [showNewThread, setShowNewThread] = useState(false);
    const [threadTitle, setThreadTitle] = useState('');
    const [threadContent, setThreadContent] = useState('');
    const [selectedThread, setSelectedThread] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const queryClient = useQueryClient();

    const { data: threads = [] } = useQuery({
        queryKey: ['discussion-threads', project.id],
        queryFn: async () => {
            const all = await base44.entities.TaskComment.list('-createdDate', 200);
            // Group by parent threads (comments without parent_comment_id)
            return all.filter(c => c.projectId === project.id && !c.parentCommentId);
        },
    });

    const { data: replies = [] } = useQuery({
        queryKey: ['discussion-replies', selectedThread?.id],
        queryFn: async () => {
            if (!selectedThread) return [];
            const all = await base44.entities.TaskComment.list('-createdDate', 500);
            return all.filter(c => c.parentCommentId === selectedThread.id);
        },
        enabled: !!selectedThread,
    });

    // Real-time subscription
    useEffect(() => {
        const unsubscribe = base44.entities.TaskComment.subscribe((event) => {
            queryClient.invalidateQueries(['discussion-threads']);
            queryClient.invalidateQueries(['discussion-replies']);
        });
        return unsubscribe;
    }, [queryClient]);

    const createThreadMutation = useMutation({
        mutationFn: (data) => base44.entities.TaskComment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['discussion-threads']);
            setShowNewThread(false);
            setThreadTitle('');
            setThreadContent('');
        },
    });

    const createReplyMutation = useMutation({
        mutationFn: (data) => base44.entities.TaskComment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['discussion-replies']);
            setReplyContent('');
        },
    });

    const handleCreateThread = () => {
        if (!threadTitle.trim() || !threadContent.trim()) return;
        
        createThreadMutation.mutate({
            projectId: project.id,
            taskId: 'discussion_forum', // Special identifier for forum threads
            commentText: `# ${threadTitle}\n\n${threadContent}`,
        });
    };

    const handleReply = () => {
        if (!replyContent.trim()) return;

        createReplyMutation.mutate({
            projectId: project.id,
            taskId: 'discussion_forum',
            commentText: replyContent,
            parentCommentId: selectedThread.id,
        });
    };

    const getRepliesCount = (threadId) => {
        return threads.filter(t => t.parentCommentId === threadId).length;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Project Discussion Forum
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Collaborate and discuss project topics with your team
                    </p>
                </div>
                <Button onClick={() => setShowNewThread(true)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Discussion
                </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold">{threads.length}</p>
                                <p className="text-xs text-muted-foreground">Active Threads</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-2xl font-bold">{new Set(threads.map(t => t.createdBy)).size}</p>
                                <p className="text-xs text-muted-foreground">Contributors</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-red-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {threads.filter(t => {
                                        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
                                        return new Date(t.createdDate) > hourAgo;
                                    }).length}
                                </p>
                                <p className="text-xs text-muted-foreground">Last Hour</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Threads List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">All Discussions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {threads.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No discussions yet. Start one!
                                </p>
                            ) : (
                                threads.map(thread => {
                                    const title = thread.commentText.split('\n')[0].replace('# ', '');
                                    const preview = thread.commentText.split('\n\n')[1]?.substring(0, 60) || '';
                                    
                                    return (
                                        <button
                                            key={thread.id}
                                            onClick={() => setSelectedThread(thread)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                selectedThread?.id === thread.id 
                                                    ? 'bg-red-50 border-red-500' 
                                                    : 'hover:bg-muted hover:shadow'
                                            }`}
                                        >
                                            <p className="font-semibold text-sm mb-1 line-clamp-1">{title}</p>
                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{preview}</p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    {thread.createdBy?.split('@')[0]}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    <Reply className="w-3 h-3 mr-1" />
                                                    {getRepliesCount(thread.id)}
                                                </Badge>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Thread Detail */}
                <Card className="lg:col-span-2">
                    {selectedThread ? (
                        <>
                            <CardHeader>
                                <div className="space-y-2">
                                    <CardTitle className="text-xl">
                                        {selectedThread.commentText.split('\n')[0].replace('# ', '')}
                                    </CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {selectedThread.createdBy?.split('@')[0]}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {format(new Date(selectedThread.createdDate), 'MMM d, h:mm a')}
                                        </span>
                                        <Badge variant="outline">
                                            <Reply className="w-3 h-3 mr-1" />
                                            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Original Post */}
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <p className="text-sm whitespace-pre-wrap">
                                        {selectedThread.commentText.split('\n\n').slice(1).join('\n\n')}
                                    </p>
                                </div>

                                {/* Replies */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {replies.map(reply => (
                                        <Card key={reply.id} className="bg-background">
                                            <CardContent className="pt-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-medium text-sm">
                                                        {reply.createdBy?.split('@')[0]}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(reply.createdDate), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{reply.commentText}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Reply Form */}
                                <div className="space-y-2 pt-4 border-t">
                                    <Textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write your reply..."
                                        className="min-h-[100px]"
                                    />
                                    <div className="flex justify-end">
                                        <Button 
                                            onClick={handleReply}
                                            disabled={!replyContent.trim() || createReplyMutation.isPending}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            <Reply className="w-4 h-4 mr-2" />
                                            {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex items-center justify-center h-[650px]">
                            <div className="text-center">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">Select a discussion to view details</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* New Thread Dialog */}
            <Dialog open={showNewThread} onOpenChange={setShowNewThread}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Start New Discussion</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Discussion Title</label>
                            <Input
                                value={threadTitle}
                                onChange={(e) => setThreadTitle(e.target.value)}
                                placeholder="e.g., Design Feedback for Landing Page"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Description</label>
                            <Textarea
                                value={threadContent}
                                onChange={(e) => setThreadContent(e.target.value)}
                                placeholder="Describe what you'd like to discuss..."
                                className="min-h-[150px]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCreateThread}
                                disabled={!threadTitle.trim() || !threadContent.trim() || createThreadMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 flex-1"
                            >
                                {createThreadMutation.isPending ? 'Creating...' : 'Start Discussion'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowNewThread(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}