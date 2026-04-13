import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import CommunicationHistory from './CommunicationHistory';
import TaskAssignment from './TaskAssignment';
import { motion } from 'framer-motion';

export default function LeadDetail({ lead, onBack }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(lead);
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    const statusColors = {
        new: 'bg-blue-100 text-blue-800',
        contacted: 'bg-yellow-100 text-yellow-800',
        qualified: 'bg-green-100 text-green-800',
        proposal_sent: 'bg-purple-100 text-purple-800',
        closed_won: 'bg-emerald-100 text-emerald-800',
        closed_lost: 'bg-red-100 text-red-800'
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await base44.entities.Lead.update(lead.id, formData);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving lead:', error);
        }
        setIsSaving(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">{formData.full_name}</h2>
                    <p className="text-muted-foreground">{formData.company}</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="ml-auto">
                        Edit Lead
                    </Button>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Lead Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Status</label>
                            {isEditing ? (
                                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="qualified">Qualified</SelectItem>
                                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                                        <SelectItem value="closed_won">Closed Won</SelectItem>
                                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge className={statusColors[formData.status] || 'bg-gray-100'}>
                                    {formData.status?.replace('_', ' ').toUpperCase()}
                                </Badge>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground">Lead Score</label>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.lead_score || 0}
                                    onChange={(e) => setFormData({ ...formData, lead_score: parseInt(e.target.value) })}
                                    className="mt-1"
                                />
                            ) : (
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-600 h-2 rounded-full transition-all"
                                            style={{ width: `${formData.lead_score || 0}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-sm">{formData.lead_score || 0}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground">Email</label>
                            {isEditing ? (
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1"
                                />
                            ) : (
                                <p className="mt-1 font-medium">{formData.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground">Phone</label>
                            {isEditing ? (
                                <Input
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="mt-1"
                                />
                            ) : (
                                <p className="mt-1 font-medium">{formData.phone || '-'}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground">Revenue Potential</label>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    value={formData.revenue_potential || 0}
                                    onChange={(e) => setFormData({ ...formData, revenue_potential: parseInt(e.target.value) })}
                                    className="mt-1"
                                />
                            ) : (
                                <p className="mt-1 font-medium">₹{(formData.revenue_potential || 0).toLocaleString()}</p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-red-600 hover:bg-red-700">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" /> Save
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(lead); }}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Communication & Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border rounded-lg p-6">
                        <CommunicationHistory leadId={lead.id} />
                    </div>

                    <div className="bg-card border rounded-lg p-6">
                        <TaskAssignment leadId={lead.id} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}