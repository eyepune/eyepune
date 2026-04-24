'use client';

import React, { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

function Admin_Forms() {
    const [tab, setTab] = useState('inquiries');
    const queryClient = useQueryClient();

    const { data: inquiries = [], isLoading: loadingInquiries } = useQuery({
        queryKey: ['admin-inquiries'],
        queryFn: async () => {
            const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const { data: assessments = [], isLoading: loadingAssessments } = useQuery({
        queryKey: ['admin-assessments'],
        queryFn: async () => {
            const { data, error } = await supabase.from('ai_assessments').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const { data: bookings = [], isLoading: loadingBookings } = useQuery({
        queryKey: ['admin-bookings'],
        queryFn: async () => {
            const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const deleteInquiryMutation = useMutation({
        mutationFn: async (id) => { const { error } = await supabase.from('inquiries').delete().eq('id', id); if (error) throw error; },
        onSuccess: () => { queryClient.invalidateQueries(['admin-inquiries']); toast.success('Deleted'); },
    });

    const deleteAssessmentMutation = useMutation({
        mutationFn: async (id) => { const { error } = await supabase.from('ai_assessments').delete().eq('id', id); if (error) throw error; },
        onSuccess: () => { queryClient.invalidateQueries(['admin-assessments']); toast.success('Deleted'); },
    });

    const deleteBookingMutation = useMutation({
        mutationFn: async (id) => { const { error } = await supabase.from('bookings').delete().eq('id', id); if (error) throw error; },
        onSuccess: () => { queryClient.invalidateQueries(['admin-bookings']); toast.success('Deleted'); },
    });

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Forms & Assessments</h1>
                <p className="text-gray-500 mt-1">View form submissions and AI assessment results</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Button variant={tab === 'inquiries' ? 'default' : 'outline'} onClick={() => setTab('inquiries')} className={tab === 'inquiries' ? 'bg-red-600' : 'border-white/[0.06] text-gray-400'}>
                    Inquiries ({inquiries.length})
                </Button>
                <Button variant={tab === 'bookings' ? 'default' : 'outline'} onClick={() => setTab('bookings')} className={tab === 'bookings' ? 'bg-red-600' : 'border-white/[0.06] text-gray-400'}>
                    Bookings ({bookings.length})
                </Button>
                <Button variant={tab === 'assessments' ? 'default' : 'outline'} onClick={() => setTab('assessments')} className={tab === 'assessments' ? 'bg-red-600' : 'border-white/[0.06] text-gray-400'}>
                    AI Assessments ({assessments.length})
                </Button>
            </div>

            {tab === 'inquiries' && (
                <Card className="bg-[#111] border-white/[0.06]">
                    <CardContent className="p-0">
                        {loadingInquiries ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
                        ) : inquiries.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No inquiries yet</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.06]">
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Email</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Phone</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Service</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Message</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Date</th>
                                            <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inquiries.map((inq) => (
                                            <tr key={inq.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                                <td className="px-4 py-3 text-white text-sm">{inq.full_name || inq.name || 'Anonymous'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">{inq.email || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">{inq.phone || '-'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">{inq.service_interest || '-'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{inq.message || '-'}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete?')) deleteInquiryMutation.mutate(inq.id); }}>
                                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {tab === 'bookings' && (
                <Card className="bg-[#111] border-white/[0.06]">
                    <CardContent className="p-0">
                        {loadingBookings ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No bookings yet</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.06]">
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Email</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Service</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Date & Time</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                                            <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                                <td className="px-4 py-3 text-white text-sm">{b.full_name || b.name || 'Anonymous'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">{b.email || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm capitalize">{b.service_type?.replace('_', ' ') || '-'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">
                                                    {b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A'} at {b.booking_time || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        b.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                                                    }`}>{b.status || 'pending'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete?')) deleteBookingMutation.mutate(b.id); }}>
                                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {tab === 'assessments' && (
                <Card className="bg-[#111] border-white/[0.06]">
                    <CardContent className="p-0">
                        {loadingAssessments ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
                        ) : assessments.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No assessments yet</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.06]">
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Email</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Business</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Score</th>
                                            <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Date</th>
                                            <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assessments.map((a) => (
                                            <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                                <td className="px-4 py-3 text-white text-sm">{a.full_name || a.name || 'Anonymous'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">{a.email || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">{a.business_name || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        (a.score || 0) >= 70 ? 'bg-green-500/10 text-green-400' :
                                                        (a.score || 0) >= 40 ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>{a.score || 0}/100</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete?')) deleteAssessmentMutation.mutate(a.id); }}>
                                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


export default function AdminFormsPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Forms />
            </AdminLayout>
        </AdminGuard>
    );
}
