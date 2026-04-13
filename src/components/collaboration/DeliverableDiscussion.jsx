import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, ThumbsUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function DeliverableDiscussion({ deliverable, projectId }) {
    const [commentText, setCommentText] = useState('');
    const queryClient = useQueryClient();

    const { data: comments = [] } = useQuery({
        queryKey: ['deliverable-comments', deliverable.id],
        queryFn: async () => {
            const all = await base44.entities.TaskComment.list('-created_date', 500);
            return all.filter(c => c.task_id === deliverable.id);
        },
    });

    // Real-time updates
    useEffect(() => {
        const unsubscribe = base44.entities.TaskComment.subscribe((event) => {
            queryClient.invalidateQueries(['deliverable-comments']);
        });
        return unsubscribe;
    }, [queryClient]);

    const createCommentMutation = useMutation({
        mutationFn: (data) => base44.entities.TaskComment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['deliverable-comments']);
            setCommentText('');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        createCommentMutation.mutate({
            task_id: deliverable.id,
            project_id: projectId,
            comment_text: commentText,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-semibold text-sm">
                        Comments & Feedback
                    </h4>
                    <Badge variant="outline" className="text-xs">
                        {comments.length}
                    </Badge>
                </div>
                {deliverable.approval_status === 'revision_requested' && (
                    <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Needs Revision
                    </Badge>
                )}
            </div>

            {/* Comments Thread */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {comments.length === 0 ? (
                    <Card className="bg-muted/50">
                        <CardContent className="pt-6 pb-6 text-center">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                No feedback yet. Be the first to comment!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    comments.map(comment => (
                        <Card key={comment.id}>
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-semibold text-red-600">
                                            {comment.created_by?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {comment.created_by?.split('@')[0]}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm whitespace-pre-wrap ml-10">{comment.comment_text}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your feedback or request changes..."
                    className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                        💡 Tip: Be specific about what changes you'd like to see
                    </span>
                    <Button 
                        type="submit" 
                        size="sm"
                        disabled={!commentText.trim() || createCommentMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {createCommentMutation.isPending ? 'Posting...' : 'Comment'}
                    </Button>
                </div>
            </form>
        </div>
    );
}