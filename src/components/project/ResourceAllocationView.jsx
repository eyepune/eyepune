import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Plus, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResourceAllocationView({ projects }) {
    const [showDialog, setShowDialog] = useState(false);
    const queryClient = useQueryClient();

    const { data: allocations = [] } = useQuery({
        queryKey: ['resource-allocations'],
        queryFn: () => base44.entities.ResourceAllocation.list(),
    });

    const { data: teamMembers = [] } = useQuery({
        queryKey: ['team-members'],
        queryFn: async () => {
            const users = await base44.entities.User.list();
            return users.filter(u => u.role === 'admin');
        },
    });

    const createAllocationMutation = useMutation({
        mutationFn: (data) => base44.entities.ResourceAllocation.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-allocations'] });
            setShowDialog(false);
        },
    });

    // Calculate conflicts (over 100% allocation)
    const conflicts = teamMembers.map(member => {
        const memberAllocations = allocations.filter(a => a.user_email === member.email);
        const totalAllocation = memberAllocations.reduce((sum, a) => sum + a.allocation_percentage, 0);
        
        return {
            member,
            totalAllocation,
            allocations: memberAllocations,
            hasConflict: totalAllocation > 100
        };
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        createAllocationMutation.mutate({
            project_id: formData.get('project_id'),
            user_email: formData.get('user_email'),
            allocation_percentage: parseFloat(formData.get('allocation_percentage')),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            role: formData.get('role')
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Resource Allocation
                </h3>
                <Button onClick={() => setShowDialog(true)} size="sm" className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Allocate Resource
                </Button>
            </div>

            {/* Conflict Alerts */}
            {conflicts.filter(c => c.hasConflict).length > 0 && (
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-red-600 mb-2">Resource Conflicts Detected</h4>
                                <ul className="space-y-1 text-sm">
                                    {conflicts.filter(c => c.hasConflict).map(conflict => (
                                        <li key={conflict.member.email}>
                                            {conflict.member.full_name}: {conflict.totalAllocation}% allocated (over-allocated by {conflict.totalAllocation - 100}%)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Team Member Allocations */}
            <div className="grid md:grid-cols-2 gap-4">
                {conflicts.map(({ member, totalAllocation, allocations, hasConflict }) => (
                    <Card key={member.email} className={hasConflict ? 'border-red-500/30' : ''}>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>{member.full_name}</span>
                                <Badge variant={hasConflict ? 'destructive' : totalAllocation > 80 ? 'secondary' : 'outline'}>
                                    {totalAllocation}%
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Progress value={Math.min(totalAllocation, 100)} className="mb-4" />
                            <div className="space-y-2 text-sm">
                                {allocations.map(allocation => {
                                    const project = projects.find(p => p.id === allocation.project_id);
                                    return (
                                        <div key={allocation.id} className="flex justify-between items-center">
                                            <span className="text-muted-foreground">{project?.project_name || 'Unknown'}</span>
                                            <span className="font-medium">{allocation.allocation_percentage}%</span>
                                        </div>
                                    );
                                })}
                                {allocations.length === 0 && (
                                    <p className="text-muted-foreground">No active allocations</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Allocation Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Allocate Resource</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Team Member *</Label>
                            <Select name="user_email" required>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map(member => (
                                        <SelectItem key={member.email} value={member.email}>
                                            {member.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Project *</Label>
                            <Select name="project_id" required>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(project => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.project_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Allocation Percentage (%) *</Label>
                            <Input type="number" name="allocation_percentage" min="0" max="100" required className="mt-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date *</Label>
                                <DatePicker name="start_date" required className="mt-2" />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <DatePicker name="end_date" className="mt-2" />
                            </div>
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Input name="role" placeholder="e.g., Developer, Designer" className="mt-2" />
                        </div>
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                            Allocate
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}