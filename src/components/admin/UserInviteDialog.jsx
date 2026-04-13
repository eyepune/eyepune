import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function UserInviteDialog({ open, onOpenChange }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const queryClient = useQueryClient();

    const inviteMutation = useMutation({
        mutationFn: async ({ email, role }) => {
            await base44.users.inviteUser(email, role);
        },
        onSuccess: () => {
            toast.success('User invitation sent successfully');
            queryClient.invalidateQueries(['users']);
            setEmail('');
            setRole('user');
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to invite user');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            inviteMutation.mutate({ email, role });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Invite User
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Email Address</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Role</label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Client</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Clients can view their projects. Admins have full access.
                        </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={!email.trim() || inviteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 flex-1"
                        >
                            {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}