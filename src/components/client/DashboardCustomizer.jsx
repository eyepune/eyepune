import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const availableWidgets = [
    { id: 'progress', name: 'Overall Progress', description: 'Track project completion percentage' },
    { id: 'milestones', name: 'Milestones', description: 'View completed and total milestones' },
    { id: 'deadlines', name: 'Upcoming Deadlines', description: 'See next 3 upcoming deadlines' },
    { id: 'budget', name: 'Budget Tracker', description: 'Monitor budget utilization and hours' },
    { id: 'activity', name: 'Recent Activity', description: 'Latest messages and file uploads' }
];

export default function DashboardCustomizer({ preferences, user }) {
    const [open, setOpen] = useState(false);
    const [enabled, setEnabled] = useState(preferences?.enabled_widgets || []);
    const [widgetOrder, setWidgetOrder] = useState(preferences?.widget_order || []);
    const queryClient = useQueryClient();

    const updatePreferencesMutation = useMutation({
        mutationFn: async ({ widgets, order }) => {
            if (preferences?.id) {
                return await base44.entities.DashboardPreference.update(preferences.id, {
                    enabled_widgets: widgets,
                    widget_order: order
                });
            } else {
                return await base44.entities.DashboardPreference.create({
                    user_email: user.email,
                    enabled_widgets: widgets,
                    widget_order: order
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['dashboard-preferences']);
            setOpen(false);
        },
    });

    const handleToggle = (widgetId) => {
        setEnabled(prev => 
            prev.includes(widgetId) 
                ? prev.filter(id => id !== widgetId)
                : [...prev, widgetId]
        );
    };

    const handleSave = () => {
        updatePreferencesMutation.mutate({ widgets: enabled, order: widgetOrder });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(widgetOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setWidgetOrder(items);
    };

    // Get ordered list of widgets for display
    const orderedWidgets = widgetOrder.length > 0 
        ? widgetOrder.map(id => availableWidgets.find(w => w.id === id)).filter(Boolean)
        : availableWidgets;

    return (
        <>
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOpen(true)}
                className="gap-2"
            >
                <Settings2 className="w-4 h-4" />
                Customize Dashboard
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Customize Your Dashboard</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">
                                Select which widgets you want to see
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Drag to reorder • Check to enable
                            </p>
                        </div>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="widgets">
                                {(provided) => (
                                    <div 
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                    >
                                        {orderedWidgets.map((widget, index) => (
                                            <Draggable key={widget.id} draggableId={widget.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                                                            snapshot.isDragging ? 'bg-accent shadow-lg' : 'hover:bg-muted/50'
                                                        }`}
                                                    >
                                                        <div {...provided.dragHandleProps} className="pt-0.5">
                                                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                        </div>
                                                        <Checkbox
                                                            id={widget.id}
                                                            checked={enabled.includes(widget.id)}
                                                            onCheckedChange={() => handleToggle(widget.id)}
                                                        />
                                                        <div className="flex-1 space-y-1">
                                                            <Label htmlFor={widget.id} className="font-medium cursor-pointer">
                                                                {widget.name}
                                                            </Label>
                                                            <p className="text-xs text-muted-foreground">
                                                                {widget.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <div className="flex gap-2 pt-4">
                            <Button 
                                onClick={handleSave}
                                disabled={updatePreferencesMutation.isPending || enabled.length === 0}
                                className="bg-red-600 hover:bg-red-700 flex-1"
                            >
                                Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}