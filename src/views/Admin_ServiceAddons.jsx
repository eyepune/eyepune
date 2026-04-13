import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import AdminGuard from "@/components/admin/AdminGuard";

export default function Admin_ServiceAddons() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAddon, setEditingAddon] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'social_media',
        is_active: true,
        icon: 'Sparkles',
        compatible_with: []
    });

    const queryClient = useQueryClient();

    const { data: addons = [], isLoading } = useQuery({
        queryKey: ['service-addons'],
        queryFn: () => base44.entities.ServiceAddon.list('-created_date')
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ServiceAddon.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-addons']);
            resetForm();
            setDialogOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ServiceAddon.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-addons']);
            resetForm();
            setDialogOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ServiceAddon.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-addons']);
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'social_media',
            is_active: true,
            icon: 'Sparkles',
            compatible_with: []
        });
        setEditingAddon(null);
    };

    const handleEdit = (addon) => {
        setEditingAddon(addon);
        setFormData({
            name: addon.name,
            description: addon.description || '',
            price: addon.price,
            category: addon.category,
            is_active: addon.is_active ?? true,
            icon: addon.icon || 'Sparkles',
            compatible_with: addon.compatible_with || []
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            price: parseFloat(formData.price)
        };

        if (editingAddon) {
            updateMutation.mutate({ id: editingAddon.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const toggleCompatibility = (category) => {
        setFormData(prev => {
            const compatible = prev.compatible_with || [];
            if (compatible.includes(category)) {
                return { ...prev, compatible_with: compatible.filter(c => c !== category) };
            }
            return { ...prev, compatible_with: [...compatible, category] };
        });
    };

    const categories = [
        { value: 'social_media', label: 'Social Media' },
        { value: 'web_app', label: 'Web & App' },
        { value: 'ai_automation', label: 'AI Automation' },
        { value: 'branding', label: 'Branding' },
        { value: 'support', label: 'Support' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'marketing', label: 'Marketing' }
    ];

    return (
        <AdminGuard>
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Service Add-ons</h1>
                            <p className="text-muted-foreground">
                                Manage customizable services that users can add to packages
                            </p>
                        </div>
                        <Button 
                            onClick={() => {
                                resetForm();
                                setDialogOpen(true);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Add-on
                        </Button>
                    </div>

                    {/* Add-ons Grid */}
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : addons.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-20">
                                <p className="text-muted-foreground mb-4">No service add-ons yet</p>
                                <Button onClick={() => setDialogOpen(true)}>
                                    Create Your First Add-on
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {addons.map((addon, idx) => (
                                <motion.div
                                    key={addon.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className={addon.is_active ? '' : 'opacity-60'}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg mb-2">{addon.name}</CardTitle>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <Badge variant="outline">
                                                            {addon.category.replace('_', ' ')}
                                                        </Badge>
                                                        {addon.is_active ? (
                                                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Inactive</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xl font-bold text-red-600">
                                                    ₹{addon.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {addon.description || 'No description'}
                                            </p>
                                            {addon.compatible_with && addon.compatible_with.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs text-muted-foreground mb-2">Compatible with:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {addon.compatible_with.map(cat => (
                                                            <Badge key={cat} variant="secondary" className="text-xs">
                                                                {cat.replace('_', ' ')}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(addon)}
                                                    className="flex-1"
                                                >
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm('Delete this add-on?')) {
                                                            deleteMutation.mutate(addon.id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Create/Edit Dialog */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingAddon ? 'Edit Service Add-on' : 'Create Service Add-on'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Name *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="e.g., Premium Support"
                                        />
                                    </div>
                                    <div>
                                        <Label>Price (₹) *</Label>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe what this add-on includes..."
                                        className="min-h-[80px]"
                                    />
                                </div>

                                <div>
                                    <Label>Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-3 block">Compatible with Packages (optional)</Label>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Leave empty to make available for all packages
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <Badge
                                                key={cat.value}
                                                variant={formData.compatible_with?.includes(cat.value) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => toggleCompatibility(cat.value)}
                                            >
                                                {formData.compatible_with?.includes(cat.value) && (
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                )}
                                                {cat.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                        <Label>Active</Label>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            resetForm();
                                            setDialogOpen(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                    >
                                        {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Add-on'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AdminGuard>
    );
}