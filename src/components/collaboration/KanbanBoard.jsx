import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, User } from 'lucide-react';

const statusColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-purple-100' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100' }
];

const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    urgent: 'bg-red-600 text-white'
};

export default function KanbanBoard({ tasks = [] }) {
    const queryClient = useQueryClient();

    const updateTaskMutation = useMutation({
        mutationFn: ({ taskId, status }) => base44.entities.ProjectTask.update(taskId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(['project-tasks']);
        },
    });

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const taskId = result.draggableId;
        const newStatus = result.destination.droppableId;

        updateTaskMutation.mutate({ taskId, status: newStatus });
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusColumns.map(column => {
                    const columnTasks = getTasksByStatus(column.id);
                    
                    return (
                        <div key={column.id} className="flex flex-col">
                            <div className={`${column.color} rounded-t-lg p-3 mb-2`}>
                                <h3 className="font-semibold flex items-center justify-between">
                                    {column.title}
                                    <Badge variant="secondary">{columnTasks.length}</Badge>
                                </h3>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 space-y-2 p-2 rounded-b-lg border-2 border-dashed min-h-[500px] ${
                                            snapshot.isDraggingOver ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                        }`}
                                    >
                                        {columnTasks.map((task, index) => (
                                            <Draggable
                                                key={task.id}
                                                draggableId={task.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`cursor-grab active:cursor-grabbing ${
                                                            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                                        }`}
                                                    >
                                                        <CardContent className="pt-4">
                                                            <h4 className="font-medium text-sm mb-2">
                                                                {task.task_name}
                                                            </h4>
                                                            {task.description && (
                                                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {task.priority && (
                                                                    <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                                                                        {task.priority}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {task.due_date && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(task.due_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            {task.assigned_to && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                                    <User className="w-3 h-3" />
                                                                    {task.assigned_to.split('@')[0]}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}