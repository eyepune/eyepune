import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Mail, Sparkles } from 'lucide-react';

export default function ReportSubscriptionSettings({ project, user }) {
    const queryClient = useQueryClient();

    const { data: subscription } = useQuery({
        queryKey: ['report-subscription', project.id],
        queryFn: async () => {
            const subs = await base44.entities.ClientReportSubscription.list();
            return subs.find(s => s.project_id === project.id && s.client_email === user.email);
        },
    });

    const createOrUpdateMutation = useMutation({
        mutationFn: async (data) => {
            if (subscription) {
                return await base44.entities.ClientReportSubscription.update(subscription.id, data);
            } else {
                return await base44.entities.ClientReportSubscription.create({
                    project_id: project.id,
                    client_email: user.email,
                    ...data
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['report-subscription'] });
        },
    });

    const [formData, setFormData] = useState({
        frequency: subscription?.frequency || 'weekly',
        delivery_day: subscription?.delivery_day || 'monday',
        include_sections: subscription?.include_sections || ['progress', 'achievements', 'milestones'],
        active: subscription?.active ?? true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createOrUpdateMutation.mutate(formData);
    };

    const toggleSection = (section) => {
        setFormData(prev => ({
            ...prev,
            include_sections: prev.include_sections.includes(section)
                ? prev.include_sections.filter(s => s !== section)
                : [...prev.include_sections, section]
        }));
    };

    const sections = [
        { id: 'progress', label: 'Progress Overview' },
        { id: 'achievements', label: 'Key Achievements' },
        { id: 'milestones', label: 'Upcoming Milestones' },
        { id: 'risks', label: 'Risks & Blockers' },
        { id: 'time_logs', label: 'Time Investment' },
        { id: 'team_updates', label: 'Team Activity' }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Report Subscription Settings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            Receive AI-generated progress reports automatically
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Enable Reports</Label>
                        <Checkbox
                            checked={formData.active}
                            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                        />
                    </div>

                    <div>
                        <Label>Frequency</Label>
                        <Select 
                            value={formData.frequency} 
                            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Delivery Day</Label>
                        <Select 
                            value={formData.delivery_day} 
                            onValueChange={(value) => setFormData({ ...formData, delivery_day: value })}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                <SelectItem value="thursday">Thursday</SelectItem>
                                <SelectItem value="friday">Friday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="mb-3 block">Report Sections</Label>
                        <div className="space-y-2">
                            {sections.map(section => (
                                <div key={section.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={section.id}
                                        checked={formData.include_sections.includes(section.id)}
                                        onCheckedChange={() => toggleSection(section.id)}
                                    />
                                    <label htmlFor={section.id} className="text-sm cursor-pointer">
                                        {section.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={createOrUpdateMutation.isPending}
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        {subscription ? 'Update Subscription' : 'Subscribe to Reports'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}