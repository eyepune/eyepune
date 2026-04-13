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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, UserPlus, Shield, Mail } from 'lucide-react';
import { toast } from 'sonner';

function Admin_Users() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        onSuccess: () => { queryClient.invalidateQueries(['admin-users']); toast.success('Role updated'); },
        onError: (e) => toast.error(e.message),
    });

    const inviteAdminMutation = useMutation({
        mutationFn: async ({ email, name }) => {
            // Create user entry in users table with admin role
            // The actual auth account is created via Supabase Admin API
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
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Users</h1>
                    <p className="text-gray-500 mt-1">Manage admin access and invite new admins</p>
                </div>
                <Button onClick={() => setIsInviteOpen(true)} className="bg-red-600 hover:bg-red-700">
                    <UserPlus className="w-4 h-4 mr-2" /> Invite Admin
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
            ) : (
                <div className="space-y-8">
                    {/* Admins */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-500" /> Admins ({admins.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {admins.map((user) => (
                                <Card key={user.id} className="bg-[#111] border-white/[0.06]">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-white font-medium">{user.full_name || 'Unnamed'}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge className="bg-red-500/10 text-red-400 text-xs">Admin</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Team Members */}
                    {team.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4">Team Members ({team.length})</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {team.map((user) => (
                                    <Card key={user.id} className="bg-[#111] border-white/[0.06]">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-white font-medium">{user.full_name || 'Unnamed'}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'admin' })} className="text-xs text-red-400">
                                                        Make Admin
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clients */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Clients ({clients.length})</h2>
                        {clients.length === 0 ? (
                            <p className="text-gray-500 text-sm">No client accounts yet</p>
                        ) : (
                            <Card className="bg-[#111] border-white/[0.06]">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/[0.06]">
                                                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                                                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Email</th>
                                                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Joined</th>
                                                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {clients.map((user) => (
                                                    <tr key={user.id} className="border-b border-white/[0.03]">
                                                        <td className="px-4 py-3 text-white text-sm">{user.full_name || '-'}</td>
                                                        <td className="px-4 py-3 text-gray-400 text-sm">{user.email}</td>
                                                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Button variant="ghost" size="sm" onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'admin' })} className="text-xs text-red-400">
                                                                Make Admin
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
                <DialogContent className="bg-[#111] border-white/[0.06] text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invite New Admin</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-400 mb-4">
                        This will create an admin account and send an invitation email.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-400">Full Name *</Label>
                            <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="John Doe" className="bg-[#1a1a1a] border-white/[0.06]" />
                        </div>
                        <div>
                            <Label className="text-gray-400">Email *</Label>
                            <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="admin@example.com" className="bg-[#1a1a1a] border-white/[0.06]" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={() => inviteAdminMutation.mutate({ email: inviteEmail, name: inviteName })}
                                disabled={!inviteEmail || inviteAdminMutation.isPending}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {inviteAdminMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                                Send Invite
                            </Button>
                            <Button variant="outline" onClick={() => setIsInviteOpen(false)} className="border-white/[0.06]">Cancel</Button>
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
