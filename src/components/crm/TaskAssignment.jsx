import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskAssignment({ leadId }) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        task_name: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const { data: tasks = [] } = useQuery({
        queryKey: ['lead-tasks', leadId],
        queryFn: () => base44.entities.ProjectTask.filter({ project_id: leadId }, '-created_date', 50),
        enabled: !!leadId,
    });

    const { data: users = [] } = useQuery({
        queryKey: ['team-users'],
        queryFn: () => base44.entities.User.list('', 50),
    });

    const priorityColors = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
    };

    const statusColors = {
        todo: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        review: 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        blocked: 'bg-red-100 text-red-800'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await base44.entities.ProjectTask.create({
                project_id: leadId,
                task_name: formData.task_name,
                description: formData.description,
                assigned_to: formData.assigned_to,
                priority: formData.priority,
                due_date: formData.due_date,
                status: 'todo',
            });

            queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
            setFormData({ task_name: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error creating task:', error);
        }

        setIsSubmitting(false);
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            await base44.entities.ProjectTask.update(taskId, { status: newStatus });
            queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (confirm('Delete this task?')) {
            try {
                await base44.entities.ProjectTask.delete(taskId);
                queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tasks & Follow-ups</h3>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> Assign Task
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-card border rounded-lg p-4 space-y-4"
                    >
                        <div>
                            <label className="text-sm font-medium">Task Name</label>
                            <Input
                                value={formData.task_name}
                                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                                placeholder="e.g., Send proposal"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add task details..."
                                className="mt-1 min-h-20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Assign To</label>
                                <Select value={formData.assigned_to} onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select team member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.email}>
                                                {user.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Due Date</label>
                            <DatePicker
                                value={formData.due_date}
                                onChange={(val) => setFormData({ ...formData, due_date: val })}
                                className="mt-1"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.task_name || !formData.assigned_to}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                                    </>
                                ) : 'Create Task'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {tasks.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No tasks assigned</p>
                ) : (
                    tasks.map((task, idx) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 bg-card border rounded-lg"
                        >
                            <div className="flex items-start gap-4">
                                <Checkbox
                                    checked={task.status === 'completed'}
                                    onCheckedChange={() => 
                                        handleTaskStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')
                                    }
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                            {task.task_name}
                                        </h4>
                                        <Badge className={priorityColors[task.priority] || 'bg-gray-100'}>
                                            {task.priority}
                                        </Badge>
                                        <Badge className={statusColors[task.status] || 'bg-gray-100'}>
                                            {task.status?.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    {task.description && (
                                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                        {task.assigned_to && <span>Assigned to: {task.assigned_to}</span>}
                                        {task.due_date && (
                                            <span> • Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}