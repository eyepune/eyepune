'use client';

import React, { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Loader2, MessageSquare, CalendarCheck, BrainCircuit, Bot, Search, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

function Admin_Forms() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

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
        onSuccess: () => { queryClient.invalidateQueries(['admin-inquiries']); toast.success('Inquiry deleted'); },
    });

    const deleteAssessmentMutation = useMutation({
        mutationFn: async (id) => { const { error } = await supabase.from('ai_assessments').delete().eq('id', id); if (error) throw error; },
        onSuccess: () => { queryClient.invalidateQueries(['admin-assessments']); toast.success('Assessment deleted'); },
    });

    const deleteBookingMutation = useMutation({
        mutationFn: async (id) => { const { error } = await supabase.from('bookings').delete().eq('id', id); if (error) throw error; },
        onSuccess: () => { queryClient.invalidateQueries(['admin-bookings']); toast.success('Booking deleted'); },
    });

    const filteredInquiries = inquiries.filter(i => 
        (i.full_name || i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (i.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBookings = bookings.filter(b => 
        (b.full_name || b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (b.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAssessments = assessments.filter(a => 
        (a.full_name || a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.business_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-gray-300">Data Collection</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Forms & Entries</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Review submissions from contact forms, calendar bookings, and AI assessments.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="inquiries" className="relative z-10">
                <TabsList className="bg-[#111] border border-white/10 p-1 rounded-xl flex-wrap h-auto mb-6">
                    <TabsTrigger value="inquiries" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <MessageSquare className="w-4 h-4 mr-2" /> Inquiries ({inquiries.length})
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <CalendarCheck className="w-4 h-4 mr-2" /> Bookings ({bookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="assessments" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <BrainCircuit className="w-4 h-4 mr-2" /> AI Assessments ({assessments.length})
                    </TabsTrigger>
                </TabsList>

                {/* Shared Search Bar */}
                <div className="mb-6 relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search submissions by name or email..." 
                        className="pl-10 bg-[#0c0c0c]/80 backdrop-blur-xl border-white/10 focus:border-blue-500/50 text-white h-11"
                    />
                </div>

                {/* Inquiries Tab */}
                <TabsContent value="inquiries" className="focus:outline-none">
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-500" /> Contact Form Submissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingInquiries ? (
                                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                            ) : filteredInquiries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                        <AlertCircle className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">No inquiries found</h3>
                                </div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Sender</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Contact</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Interest</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Message Details</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredInquiries.map((inq) => (
                                                <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="text-white font-medium">{inq.full_name || inq.name || 'Anonymous'}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'N/A'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-gray-300">{inq.email || 'N/A'}</p>
                                                        {inq.phone && <p className="text-xs text-gray-500 mt-1">{inq.phone}</p>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="bg-white/[0.03] text-gray-400 border-white/10">
                                                            {inq.service_interest || 'General'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-gray-400 text-xs max-w-[300px] line-clamp-2" title={inq.message}>
                                                            {inq.message || '-'}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Are you sure you want to delete this inquiry?')) deleteInquiryMutation.mutate(inq.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="w-4 h-4" />
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
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="focus:outline-none">
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-purple-500" /> Discovery Call Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingBookings ? (
                                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                        <AlertCircle className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">No bookings found</h3>
                                </div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Client</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Service Focus</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Scheduled Time</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Status</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredBookings.map((b) => (
                                                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="text-white font-medium">{b.full_name || b.name || 'Anonymous'}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{b.email}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-300 capitalize">{b.service_type?.replace('_', ' ') || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="bg-white/5 border border-white/10 rounded px-3 py-1.5 inline-block">
                                                            <p className="text-white font-medium">{b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A'}</p>
                                                            <p className="text-xs text-purple-400">{b.booking_time || 'N/A'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge className={cn("border font-medium px-2.5 py-1 text-[10px] uppercase tracking-wider", b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')}>
                                                            {b.status || 'pending'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Are you sure you want to delete this booking?')) deleteBookingMutation.mutate(b.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="w-4 h-4" />
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
                </TabsContent>

                {/* Assessments Tab */}
                <TabsContent value="assessments" className="focus:outline-none">
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-emerald-500" /> AI Readiness Assessments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingAssessments ? (
                                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                            ) : filteredAssessments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                        <AlertCircle className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">No assessments found</h3>
                                </div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Respondent</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Business Name</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5 text-center">AI Readiness Score</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5">Completion Date</th>
                                                <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredAssessments.map((a) => (
                                                <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="text-white font-medium">{a.full_name || a.name || 'Anonymous'}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{a.email || 'N/A'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-300">{a.business_name || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="inline-flex items-center justify-center relative">
                                                            <svg className="w-12 h-12 transform -rotate-90">
                                                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                                                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * (a.score || 0)) / 100} className={cn((a.score || 0) >= 70 ? 'text-emerald-500' : (a.score || 0) >= 40 ? 'text-yellow-500' : 'text-red-500')} />
                                                            </svg>
                                                            <span className="absolute text-xs font-bold text-white">{a.score || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Are you sure you want to delete this assessment?')) deleteAssessmentMutation.mutate(a.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="w-4 h-4" />
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
                </TabsContent>
            </Tabs>
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
