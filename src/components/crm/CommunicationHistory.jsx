import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunicationHistory({ leadId }) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        activity_type: 'email',
        title: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const { data: activities = [] } = useQuery({
        queryKey: ['lead-activities', leadId],
        queryFn: () => base44.entities.Activity.filter({ lead_id: leadId }, '-created_date', 50),
        enabled: !!leadId,
    });

    const activityTypeIcons = {
        email: <Mail className="w-4 h-4" />,
        call: <Phone className="w-4 h-4" />,
        meeting: <Calendar className="w-4 h-4" />,
        note: <span className="text-xs">📝</span>,
    };

    const activityTypeColors = {
        email: 'bg-blue-100 text-blue-800',
        call: 'bg-green-100 text-green-800',
        meeting: 'bg-purple-100 text-purple-800',
        note: 'bg-gray-100 text-gray-800',
        status_change: 'bg-yellow-100 text-yellow-800',
        assessment: 'bg-indigo-100 text-indigo-800',
        booking: 'bg-pink-100 text-pink-800',
        payment: 'bg-emerald-100 text-emerald-800',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await base44.entities.Activity.create({
                lead_id: leadId,
                activity_type: formData.activity_type,
                title: formData.title,
                description: formData.description,
                performed_by: (await base44.auth.me()).email,
            });

            queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
            setFormData({ activity_type: 'email', title: '', description: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error adding activity:', error);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Communication History</h3>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> Log Activity
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-card border rounded-lg p-4 space-y-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Activity Type</label>
                                <Select value={formData.activity_type} onValueChange={(v) => setFormData({ ...formData, activity_type: v })}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="call">Call</SelectItem>
                                        <SelectItem value="meeting">Meeting</SelectItem>
                                        <SelectItem value="note">Note</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Follow-up call"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add details about this communication..."
                                className="mt-1 min-h-24"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.title}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                    </>
                                ) : 'Log Activity'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {activities.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No activities yet</p>
                ) : (
                    activities.map((activity, idx) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 bg-card border rounded-lg"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {activityTypeIcons[activity.activity_type] || '📌'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className={activityTypeColors[activity.activity_type] || 'bg-gray-100'}>
                                            {activity.activity_type?.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-foreground">{activity.title}</h4>
                                    {activity.description && (
                                        <p className="text-sm text-muted-foreground mt-2">{activity.description}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}