import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send, AtSign } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskComments({ task, onClose }) {
    const [commentText, setCommentText] = useState('');
    const [mentionSearch, setMentionSearch] = useState('');
    const queryClient = useQueryClient();

    const { data: comments = [] } = useQuery({
        queryKey: ['task-comments', task.id],
        queryFn: async () => {
            const allComments = await base44.entities.TaskComment.list();
            return allComments
                .filter(c => c.task_id === task.id)
                .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        },
        refetchInterval: 5000, // Real-time polling every 5 seconds
    });

    const { data: teamMembers = [] } = useQuery({
        queryKey: ['team-members'],
        queryFn: async () => {
            const users = await base44.entities.User.list();
            return users.filter(u => u.role === 'admin');
        },
    });

    const createCommentMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.TaskComment.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task-comments'] });
            setCommentText('');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        // Extract mentions (@username)
        const mentions = [];
        const mentionRegex = /@(\S+)/g;
        let match;
        while ((match = mentionRegex.exec(commentText)) !== null) {
            const mentionedUser = teamMembers.find(m => 
                m.full_name.toLowerCase().includes(match[1].toLowerCase()) ||
                m.email.toLowerCase().includes(match[1].toLowerCase())
            );
            if (mentionedUser) mentions.push(mentionedUser.email);
        }

        createCommentMutation.mutate({
            task_id: task.id,
            project_id: task.project_id,
            comment_text: commentText,
            mentioned_users: mentions
        });
    };

    const handleTextChange = (e) => {
        const text = e.target.value;
        setCommentText(text);

        // Detect @ mentions
        const lastAtIndex = text.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const searchTerm = text.substring(lastAtIndex + 1);
            if (!searchTerm.includes(' ')) {
                setMentionSearch(searchTerm);
            } else {
                setMentionSearch('');
            }
        } else {
            setMentionSearch('');
        }
    };

    const insertMention = (member) => {
        const lastAtIndex = commentText.lastIndexOf('@');
        const beforeAt = commentText.substring(0, lastAtIndex);
        setCommentText(`${beforeAt}@${member.full_name} `);
        setMentionSearch('');
    };

    const filteredMembers = mentionSearch
        ? teamMembers.filter(m => 
            m.full_name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
            m.email.toLowerCase().includes(mentionSearch.toLowerCase())
          )
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Discussion ({comments.length})
                </h3>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No comments yet. Start the discussion!
                    </p>
                ) : (
                    comments.map(comment => (
                        <Card key={comment.id} className="p-3">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm">{comment.created_by}</span>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                                </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
                            {comment.mentioned_users?.length > 0 && (
                                <div className="mt-2 flex gap-1">
                                    {comment.mentioned_users.map(email => (
                                        <span key={email} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                            <AtSign className="w-3 h-3 inline mr-1" />
                                            {email.split('@')[0]}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Mention Suggestions */}
            {mentionSearch && filteredMembers.length > 0 && (
                <Card className="p-2 absolute bottom-20 left-0 right-0 z-10">
                    {filteredMembers.slice(0, 5).map(member => (
                        <button
                            key={member.email}
                            onClick={() => insertMention(member)}
                            className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm"
                        >
                            {member.full_name} • {member.email}
                        </button>
                    ))}
                </Card>
            )}

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                    value={commentText}
                    onChange={handleTextChange}
                    placeholder="Add a comment... (use @ to mention team members)"
                    className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                        <AtSign className="w-3 h-3 inline mr-1" />
                        Use @ to mention team members
                    </span>
                    <Button 
                        type="submit" 
                        size="sm"
                        disabled={!commentText.trim() || createCommentMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Comment
                    </Button>
                </div>
            </form>
        </div>
    );
}