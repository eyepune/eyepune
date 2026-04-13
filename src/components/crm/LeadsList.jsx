import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Phone, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeadsList({ onSelectLead, onNewLead }) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const queryClient = useQueryClient();

    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads', filterStatus],
        queryFn: () => base44.entities.Lead.list('-updated_date', 100),
    });

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                            lead.email?.toLowerCase().includes(search.toLowerCase()) ||
                            lead.company?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusColors = {
        new: 'bg-blue-100 text-blue-800',
        contacted: 'bg-yellow-100 text-yellow-800',
        qualified: 'bg-green-100 text-green-800',
        proposal_sent: 'bg-purple-100 text-purple-800',
        closed_won: 'bg-emerald-100 text-emerald-800',
        closed_lost: 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                        placeholder="Search leads by name, email, or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={onNewLead} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" /> New Lead
                </Button>
            </div>

            <div className="space-y-2">
                {isLoading ? (
                    <div className="text-center py-8">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No leads found</div>
                ) : (
                    filteredLeads.map((lead, idx) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => onSelectLead(lead)}
                            className="p-4 bg-card border rounded-lg hover:border-red-500 cursor-pointer transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{lead.full_name}</h3>
                                    <p className="text-sm text-muted-foreground">{lead.company}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {lead.email}
                                        </span>
                                        {lead.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {lead.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={statusColors[lead.status] || 'bg-gray-100'}>
                                        {lead.status?.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {lead.lead_score && (
                                        <div className="text-xs font-semibold">
                                            Score: {lead.lead_score}
                                        </div>
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