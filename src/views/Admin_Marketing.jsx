import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminGuard from "@/components/admin/AdminGuard";
import { motion } from 'framer-motion';
import { Plus, Send, Pause, Play, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Admin_Marketing() {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    const { data: campaigns = [] } = useQuery({
        queryKey: ['campaigns'],
        queryFn: () => base44.entities.Campaign.list('-created_date', 100),
    });

    const createCampaignMutation = useMutation({
        mutationFn: (data) => base44.entities.Campaign.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            setIsEditing(false);
        },
    });

    const updateCampaignMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            type: formData.get('type'),
            subject: formData.get('subject'),
            content: formData.get('content'),
            target_audience: formData.get('target_audience'),
            status: 'draft'
        };

        if (selectedCampaign) {
            updateCampaignMutation.mutate({ id: selectedCampaign.id, data });
        } else {
            createCampaignMutation.mutate(data);
        }
    };

    const toggleCampaignStatus = (campaign) => {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        updateCampaignMutation.mutate({ 
            id: campaign.id, 
            data: { status: newStatus } 
        });
    };

    const statusColors = {
        draft: 'bg-gray-500/10 text-gray-600',
        scheduled: 'bg-blue-500/10 text-blue-600',
        active: 'bg-green-500/10 text-green-600',
        completed: 'bg-purple-500/10 text-purple-600',
        paused: 'bg-yellow-500/10 text-yellow-600'
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Marketing Automation</h1>
                        <p className="text-muted-foreground">Manage campaigns and automations</p>
                    </div>
                    <Button onClick={() => { setSelectedCampaign(null); setIsEditing(true); }} className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Campaign
                    </Button>
                </div>

                <Tabs defaultValue="campaigns" className="mb-6">
                    <TabsList>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                        <TabsTrigger value="automations">Automations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="campaigns" className="space-y-4 mt-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {campaigns.map((campaign) => (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card border rounded-xl p-6"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold mb-1">{campaign.name}</h3>
                                            <p className="text-sm text-muted-foreground capitalize">{campaign.type}</p>
                                        </div>
                                        <Badge className={statusColors[campaign.status]}>
                                            {campaign.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Sent</p>
                                            <p className="font-medium">{campaign.sent_count || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Opened</p>
                                            <p className="font-medium">{campaign.opened_count || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleCampaignStatus(campaign)}
                                        >
                                            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setSelectedCampaign(campaign); setIsEditing(true); }}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="automations" className="mt-6">
                        <div className="bg-card border rounded-xl p-8">
                            <h3 className="text-xl font-bold mb-4">Active Automations</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Welcome New Leads', trigger: 'Lead created', status: 'Active' },
                                    { name: 'Assessment Report', trigger: 'AI Assessment completed', status: 'Active' },
                                    { name: 'Client Onboarding', trigger: 'Payment completed', status: 'Active' },
                                ].map((automation, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{automation.name}</p>
                                            <p className="text-sm text-muted-foreground">Trigger: {automation.trigger}</p>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-600">
                                            {automation.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <Label>Campaign Name *</Label>
                                <Input name="name" defaultValue={selectedCampaign?.name} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Type *</Label>
                                    <Select name="type" defaultValue={selectedCampaign?.type || 'email'}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                            <SelectItem value="sms">SMS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Target Audience *</Label>
                                    <Select name="target_audience" defaultValue={selectedCampaign?.target_audience || 'all_leads'}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_leads">All Leads</SelectItem>
                                            <SelectItem value="new_leads">New Leads</SelectItem>
                                            <SelectItem value="qualified_leads">Qualified Leads</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>Subject</Label>
                                <Input name="subject" defaultValue={selectedCampaign?.subject} />
                            </div>
                            <div>
                                <Label>Message Content *</Label>
                                <Textarea name="content" defaultValue={selectedCampaign?.content} className="min-h-[200px]" required />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                                    {selectedCampaign ? 'Update' : 'Create'} Campaign
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function AdminMarketingPage() {
    return (
        <AdminGuard>
            <Admin_Marketing />
        </AdminGuard>
    );
}