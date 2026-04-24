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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, UserPlus, Shield, Mail, Users, ArrowRightLeft, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Admin_Users() {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const queryClient = useQueryClient();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const admins = users.filter(u => u.role === 'admin');
    const clients = users.filter(u => u.role === 'client');
    const team = users.filter(u => u.role === 'team');

    const updateRoleMutation = useMutation({
        mutationFn: async ({ id, role }) => {
            const { error } = await supabase.from('users').update({ role }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-users']); toast.success('Role updated successfully'); },
        onError: (e) => toast.error(e.message),
    });

    const inviteAdminMutation = useMutation({
        mutationFn: async ({ email, name }) => {
            const res = await fetch('/api/admin/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, full_name: name, role: 'admin' }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Invite failed');
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            setInviteEmail('');
            setInviteName('');
            setIsInviteOpen(false);
            toast.success('Admin invited successfully');
        },
        onError: (e) => toast.error(e.message),
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('users').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => { queryClient.invalidateQueries(['admin-users']); toast.success('User removed'); },
        onError: (e) => toast.error(e.message),
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-gray-300">Access Control & Security</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">System Users</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Manage administrative privileges, team access, and view registered client accounts.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsInviteOpen(true)} 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border-0 h-10"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Invite Admin
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-400 text-sm">Loading users data...</p>
                </div>
            ) : (
                <div className="space-y-10 relative z-10">
                    {/* Admins Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" /> Administrative Users
                                <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/20">{admins.length}</Badge>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {admins.map((user) => (
                                <Card key={user.id} className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all duration-300 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardContent className="p-6 relative z-10">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-white/10 group-hover:border-blue-500/50 transition-colors shadow-xl">
                                                    <AvatarImage src={user?.avatar_url} />
                                                    <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white font-bold">
                                                        {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">{user.full_name || 'System Admin'}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                                                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                                                        Joined {new Date(user.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5">
                                                Admin
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Team Members Grid (if any) */}
                    {team.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-500" /> Team Members
                                    <Badge variant="outline" className="ml-2 bg-purple-500/10 text-purple-400 border-purple-500/20">{team.length}</Badge>
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {team.map((user) => (
                                    <Card key={user.id} className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden group hover:border-purple-500/30 transition-all duration-300 relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <CardContent className="p-6 relative z-10">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border border-white/10">
                                                        <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white font-medium">
                                                            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'T'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{user.full_name || 'Team Member'}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'admin' })} 
                                                    className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <ArrowRightLeft className="w-3 h-3 mr-1" /> Make Admin
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clients Table */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserCircle2 className="w-5 h-5 text-emerald-500" /> Registered Clients
                                <Badge variant="outline" className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{clients.length}</Badge>
                            </h2>
                        </div>
                        
                        {clients.length === 0 ? (
                            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 py-12">
                                <CardContent className="flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                        <Users className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">No clients registered</h3>
                                    <p className="text-gray-500 text-sm mt-1">Client accounts will appear here once they sign up.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium border-b border-white/5">Client User</th>
                                                    <th className="px-6 py-4 font-medium border-b border-white/5">Registration Date</th>
                                                    <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {clients.map((user) => (
                                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-9 w-9 border border-white/10">
                                                                    <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white font-medium text-xs">
                                                                        {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'C'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                                                                        {user.full_name || 'Client User'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-300">{new Date(user.created_at).toLocaleDateString()}</span>
                                                                <span className="text-xs text-gray-600">{new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'admin' })} 
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                            >
                                                                Promote to Admin
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Invite Admin Dialog */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="bg-[#0c0c0c]/95 backdrop-blur-2xl border-white/10 text-white max-w-md p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
                    
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-500" /> Invite Administrator
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 mt-2">
                            This will create a new admin account and send an invitation email to the user.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-6 pt-2 space-y-5">
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Full Name <span className="text-blue-500">*</span></Label>
                            <Input 
                                value={inviteName} 
                                onChange={(e) => setInviteName(e.target.value)} 
                                placeholder="Jane Doe" 
                                className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Email Address <span className="text-blue-500">*</span></Label>
                            <Input 
                                type="email" 
                                value={inviteEmail} 
                                onChange={(e) => setInviteEmail(e.target.value)} 
                                placeholder="jane@eyepune.com" 
                                className="bg-[#111] border-white/10 focus:border-blue-500/50 transition-colors h-11" 
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsInviteOpen(false)} 
                                className="flex-1 border-white/10 text-gray-300 hover:text-white hover:bg-white/5 h-11"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => inviteAdminMutation.mutate({ email: inviteEmail, name: inviteName })}
                                disabled={!inviteEmail || inviteAdminMutation.isPending}
                                className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 shadow-lg shadow-blue-500/20 h-11"
                            >
                                {inviteAdminMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                                Send Invitation
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Users />
            </AdminLayout>
        </AdminGuard>
    );
}
