import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DeliverableApprovalCard({ deliverable, onApprove, onRequestChanges, onProvideFeedback }) {
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [feedback, setFeedback] = useState('');
    const queryClient = useQueryClient();

    const updateApprovalMutation = useMutation({
        mutationFn: async ({ status, feedbackText }) => {
            await base44.entities.DeliverableApproval.update(deliverable.id, {
                status,
                feedbackText: feedbackText,
                reviewedDate: new Date().toISOString()
            });
            
            // Trigger notification to team
            await base44.functions.invoke('sendClientCommunication', {
                event_type: 'deliverable_reviewed',
                project_id: deliverable.projectId,
                deliverable_name: deliverable.deliverableName,
                status
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['deliverable-approvals']);
            setShowFeedbackDialog(false);
            setFeedback('');
        },
    });

    const handleApprove = () => {
        updateApprovalMutation.mutate({ status: 'approved', feedbackText: 'Approved' });
    };

    const handleRequestChanges = () => {
        if (!feedback.trim()) {
            alert('Please provide feedback on what changes are needed');
            return;
        }
        updateApprovalMutation.mutate({ status: 'changes_requested', feedbackText: feedback });
    };

    const statusConfig = {
        pending_review: { label: 'Pending Review', color: 'bg-yellow-500/10 text-yellow-600' },
        approved: { label: 'Approved', color: 'bg-green-500/10 text-green-600' },
        changes_requested: { label: 'Changes Requested', color: 'bg-red-500/10 text-red-600' }
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <h4 className="font-semibold">{deliverable.deliverableName}</h4>
                            </div>
                            <Badge className={statusConfig[deliverable.status].color}>
                                {statusConfig[deliverable.status].label}
                            </Badge>
                        </div>
                    </div>

                    {deliverable.deliverableUrl && (
                        <a 
                            href={deliverable.deliverableUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Deliverable
                        </a>
                    )}

                    {deliverable.feedbackText && deliverable.status !== 'pending_review' && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Your Feedback:</p>
                            <p className="text-sm">{deliverable.feedbackText}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {deliverable.status === 'pending_review' && (
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleApprove}
                                    disabled={updateApprovalMutation.isPending}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Approve
                                </Button>
                                <Button 
                                    onClick={() => setShowFeedbackDialog(true)}
                                    disabled={updateApprovalMutation.isPending}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Request Changes
                                </Button>
                            </div>
                        )}
                        {onProvideFeedback && (
                            <Button 
                                onClick={() => onProvideFeedback(deliverable)}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Provide Detailed Feedback
                            </Button>
                        )}
                    </div>

                    {deliverable.reviewedDate && (
                        <p className="text-xs text-muted-foreground mt-3">
                            Reviewed on {new Date(deliverable.reviewedDate).toLocaleDateString()}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Changes</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please describe what changes you'd like to see:
                        </p>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Describe the changes needed..."
                            className="min-h-[120px]"
                        />
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleRequestChanges}
                                disabled={updateApprovalMutation.isPending || !feedback.trim()}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Submit Feedback
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowFeedbackDialog(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}