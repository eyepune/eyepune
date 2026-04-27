import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminGuard from "@/components/admin/AdminGuard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

function Admin_Feedback() {
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me(),
    });

    const { data: allFeedback = [] } = useQuery({
        queryKey: ['all-feedback'],
        queryFn: () => base44.entities.ClientFeedback.list('-created_date', 200),
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['all-projects'],
        queryFn: () => base44.entities.ClientProject.list(),
    });

    const { data: milestones = [] } = useQuery({
        queryKey: ['all-milestones'],
        queryFn: () => base44.entities.ClientMilestone.list(),
    });

    const { data: deliverables = [] } = useQuery({
        queryKey: ['all-deliverables'],
        queryFn: () => base44.entities.DeliverableApproval.list(),
    });

    const updateFeedbackMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ClientFeedback.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['all-feedback']);
            setSelectedFeedback(null);
            setAdminResponse('');
        },
    });

    const handleRespond = async (status) => {
        if (!adminResponse.trim() && status !== 'addressed') {
            alert('Please provide a response');
            return;
        }

        await updateFeedbackMutation.mutateAsync({
            id: selectedFeedback.id,
            data: {
                status,
                admin_response: adminResponse,
                reviewed_by: user.email,
                reviewed_date: new Date().toISOString()
            }
        });
    };

    const filteredFeedback = filterStatus === 'all' 
        ? allFeedback 
        : allFeedback.filter(f => f.status === filterStatus);

    const getProjectName = (projectId) => {
        return projects.find(p => p.id === projectId)?.project_name || 'Unknown Project';
    };

    const getMilestoneName = (milestoneId) => {
        return milestones.find(m => m.id === milestoneId)?.title || null;
    };

    const getDeliverableName = (deliverableId) => {
        return deliverables.find(d => d.id === deliverableId)?.deliverable_name || null;
    };

    const statusConfig = {
        pending_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
        reviewed: { color: 'bg-blue-100 text-blue-800', icon: MessageSquare, label: 'Reviewed' },
        addressed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Addressed' }
    };

    const categoryColors = {
        quality: 'bg-purple-100 text-purple-800',
        timeliness: 'bg-orange-100 text-orange-800',
        communication: 'bg-blue-100 text-blue-800',
        overall: 'bg-gray-100 text-gray-800'
    };

    const stats = {
        total: allFeedback.length,
        pending: allFeedback.filter(f => f.status === 'pending_review').length,
        avgRating: (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length || 0).toFixed(1)
    };

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Client Feedback Management</h1>
                    <p className="text-muted-foreground">Review and respond to client feedback</p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Feedback</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending Review</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-green-600 fill-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Rating</p>
                                    <p className="text-2xl font-bold">{stats.avgRating} / 5</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <Tabs value={filterStatus} onValueChange={setFilterStatus} className="mb-6">
                    <TabsList>
                        <TabsTrigger value="all">All ({allFeedback.length})</TabsTrigger>
                        <TabsTrigger value="pending_review">
                            Pending ({allFeedback.filter(f => f.status === 'pending_review').length})
                        </TabsTrigger>
                        <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                        <TabsTrigger value="addressed">Addressed</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Feedback List */}
                <div className="space-y-4">
                    {filteredFeedback.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No feedback found
                            </CardContent>
                        </Card>
                    ) : (
                        filteredFeedback.map((feedback) => {
                            const StatusIcon = statusConfig[feedback.status].icon;
                            const milestoneName = getMilestoneName(feedback.milestone_id);
                            const deliverableName = getDeliverableName(feedback.deliverable_id);
                            
                            return (
                                <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="text-base mb-2">
                                                    {getProjectName(feedback.project_id)}
                                                </CardTitle>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <Badge className={statusConfig[feedback.status].color}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {statusConfig[feedback.status].label}
                                                    </Badge>
                                                    <Badge className={categoryColors[feedback.category]}>
                                                        {feedback.category}
                                                    </Badge>
                                                    {milestoneName && (
                                                        <Badge variant="outline">Milestone: {milestoneName}</Badge>
                                                    )}
                                                    {deliverableName && (
                                                        <Badge variant="outline">Deliverable: {deliverableName}</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${
                                                                star <= feedback.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        {feedback.rating}/5
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm text-muted-foreground">
                                                <p>{format(new Date(feedback.created_date), 'MMM d, yyyy')}</p>
                                                <p className="text-xs">{feedback.created_by}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm mb-4 whitespace-pre-wrap">{feedback.feedback_text}</p>
                                        
                                        {feedback.admin_response && (
                                            <div className="bg-muted p-3 rounded-lg mb-4">
                                                <p className="text-xs font-semibold mb-1">Admin Response:</p>
                                                <p className="text-sm">{feedback.admin_response}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    By {feedback.reviewed_by} on {format(new Date(feedback.reviewed_date), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            size="sm"
                                            variant={feedback.status === 'pending_review' ? 'default' : 'outline'}
                                            onClick={() => {
                                                setSelectedFeedback(feedback);
                                                setAdminResponse(feedback.admin_response || '');
                                            }}
                                            className={feedback.status === 'pending_review' ? 'bg-red-600 hover:bg-red-700' : ''}
                                        >
                                            {feedback.status === 'pending_review' ? 'Respond' : 'Update Response'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Response Dialog */}
                {selectedFeedback && (
                    <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Respond to Feedback</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="font-semibold mb-1">{getProjectName(selectedFeedback.project_id)}</p>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${
                                                    star <= selectedFeedback.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm">{selectedFeedback.feedback_text}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Your Response</label>
                                    <Textarea
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                        placeholder="Provide a detailed response to the client..."
                                        className="min-h-[120px]"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleRespond('reviewed')}
                                        disabled={updateFeedbackMutation.isPending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Mark as Reviewed
                                    </Button>
                                    <Button
                                        onClick={() => handleRespond('addressed')}
                                        disabled={updateFeedbackMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Mark as Addressed
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedFeedback(null)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}

import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminFeedbackPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Feedback />
            </AdminLayout>
        </AdminGuard>
    );
}