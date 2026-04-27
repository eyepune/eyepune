import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Plus, Trash2, Settings, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

import AdminLayout from '@/components/admin/AdminLayout';

export default function Admin_CRMSync() {
    const [editingConfig, setEditingConfig] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showConnectDialog, setShowConnectDialog] = useState(false);
    const queryClient = useQueryClient();

    const { data: configs, isLoading } = useQuery({
        queryKey: ['crm-configs'],
        queryFn: () => base44.entities.CRMSyncConfig.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.CRMSyncConfig.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['crm-configs']);
            toast.success('CRM configuration created');
            setEditingConfig(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.CRMSyncConfig.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['crm-configs']);
            toast.success('CRM configuration updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.CRMSyncConfig.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['crm-configs']);
            toast.success('CRM configuration deleted');
        }
    });

    const handleSyncNow = async (direction) => {
        setIsSyncing(true);
        try {
            const functionName = direction === 'from' ? 'syncFromCRM' : 'syncToCRM';
            const response = await base44.functions.invoke(functionName);
            
            if (response.data.success) {
                toast.success(`Sync completed: ${response.data.results?.length || 0} operations`);
                queryClient.invalidateQueries(['crm-configs']);
            } else {
                toast.error('Sync failed');
            }
        } catch (error) {
            toast.error('Error during sync');
        }
        setIsSyncing(false);
    };

    const testConnection = async (provider) => {
        try {
            const response = await base44.functions.invoke('testCRMConnection', { crm_provider: provider });
            if (response.data.success) {
                toast.success(`Connected! Found ${response.data.contact_count} contacts`);
            } else {
                toast.error(response.data.error || 'Connection failed');
            }
        } catch (error) {
            toast.error('Connection test failed');
        }
    };

    return (
        <AdminGuard>
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">CRM Synchronization</h1>
                            <p className="text-muted-foreground">
                                Connect and sync with external CRM systems
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setEditingConfig({
                                        crm_provider: 'wix',
                                        is_active: true,
                                        sync_direction: 'bidirectional',
                                        sync_frequency: 'realtime',
                                        field_mappings: []
                                    })}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add CRM Connection
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Configure CRM Sync</DialogTitle>
                                    </DialogHeader>
                                    <CRMConfigForm
                                        config={editingConfig}
                                        onSave={(data) => {
                                            if (editingConfig?.id) {
                                                updateMutation.mutate({ id: editingConfig.id, data });
                                            } else {
                                                createMutation.mutate(data);
                                            }
                                        }}
                                        onCancel={() => setEditingConfig(null)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Setup Guide */}
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Setup Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">How to connect Wix:</h4>
                                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                                    <li>Go to <a href="https://dev.wix.com" target="_blank" className="text-blue-600 underline">Wix Developer Console</a></li>
                                    <li>Navigate to your site and create an API Key</li>
                                    <li>Copy your Site ID, Account ID, and API Key</li>
                                    <li>Set these as secrets: WIX_API_KEY, WIX_SITE_ID, WIX_ACCOUNT_ID</li>
                                    <li>Click "Test Connection" below to verify</li>
                                </ol>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => testConnection('wix')}
                                >
                                    Test Wix Connection
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => testConnection('hubspot')}
                                >
                                    Test HubSpot Connection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sync Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Sync</CardTitle>
                            <CardDescription>Manually trigger synchronization</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => handleSyncNow('to')}
                                    disabled={isSyncing}
                                    variant="outline"
                                >
                                    {isSyncing ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                                    )}
                                    Sync To External CRM
                                </Button>
                                <Button
                                    onClick={() => handleSyncNow('from')}
                                    disabled={isSyncing}
                                    variant="outline"
                                >
                                    {isSyncing ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                                    )}
                                    Sync From External CRM
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CRM Connections */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {configs?.map((config) => (
                            <Card key={config.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {config.crm_provider.toUpperCase()}
                                                {config.is_active ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                                )}
                                            </CardTitle>
                                            <CardDescription>
                                                {config.sync_direction} • {config.sync_frequency}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setEditingConfig(config)}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => deleteMutation.mutate(config.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Active</span>
                                        <Switch
                                            checked={config.is_active}
                                            onCheckedChange={(checked) =>
                                                updateMutation.mutate({
                                                    id: config.id,
                                                    data: { is_active: checked }
                                                })
                                            }
                                        />
                                    </div>

                                    {config.sync_stats && (
                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                            <div>
                                                <p className="text-2xl font-bold">
                                                    {config.sync_stats.total_synced || 0}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Total Synced</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">
                                                    {config.sync_stats.last_sync_count || 0}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Last Sync</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {config.sync_stats.errors || 0}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Errors</p>
                                            </div>
                                        </div>
                                    )}

                                    {config.last_sync && (
                                        <p className="text-xs text-muted-foreground">
                                            Last sync: {new Date(config.last_sync).toLocaleString()}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {configs?.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No CRM Connections</h3>
                                <p className="text-muted-foreground mb-4">
                                    Connect your external CRM to start syncing data
                                </p>
                                <Button onClick={() => setEditingConfig({
                                    crm_provider: 'wix',
                                    is_active: true,
                                    sync_direction: 'bidirectional',
                                    sync_frequency: 'realtime',
                                    field_mappings: []
                                })}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Connection
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}

function CRMConfigForm({ config, onSave, onCancel }) {
    const [formData, setFormData] = useState(config || {});
    const [mappings, setMappings] = useState(config?.field_mappings || []);

    const addMapping = () => {
        setMappings([...mappings, {
            internal_field: '',
            external_field: '',
            sync_direction: 'both'
        }]);
    };

    const updateMapping = (index, field, value) => {
        const updated = [...mappings];
        updated[index][field] = value;
        setMappings(updated);
    };

    const removeMapping = (index) => {
        setMappings(mappings.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        onSave({ ...formData, field_mappings: mappings });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>CRM Provider</Label>
                <Select
                    value={formData.crm_provider}
                    onValueChange={(value) => setFormData({ ...formData, crm_provider: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="wix">Wix</SelectItem>
                        <SelectItem value="hubspot">HubSpot</SelectItem>
                        <SelectItem value="salesforce">Salesforce</SelectItem>
                        <SelectItem value="custom">Custom API</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Sync Direction</Label>
                <Select
                    value={formData.sync_direction}
                    onValueChange={(value) => setFormData({ ...formData, sync_direction: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bidirectional">Two-Way Sync</SelectItem>
                        <SelectItem value="to_external">To External CRM Only</SelectItem>
                        <SelectItem value="from_external">From External CRM Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Sync Frequency</Label>
                <Select
                    value={formData.sync_frequency}
                    onValueChange={(value) => setFormData({ ...formData, sync_frequency: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {formData.crm_provider === 'custom' && (
                <div>
                    <Label>API Endpoint</Label>
                    <Input
                        value={formData.api_endpoint || ''}
                        onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                        placeholder="https://api.yourcrm.com/contacts"
                    />
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Field Mappings</Label>
                    <Button size="sm" variant="outline" onClick={addMapping}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Mapping
                    </Button>
                </div>
                {mappings.map((mapping, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Input
                            placeholder="Internal field (e.g., full_name)"
                            value={mapping.internal_field}
                            onChange={(e) => updateMapping(index, 'internal_field', e.target.value)}
                        />
                        <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="External field (e.g., name)"
                            value={mapping.external_field}
                            onChange={(e) => updateMapping(index, 'external_field', e.target.value)}
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeMapping(index)}
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                    Save Configuration
                </Button>
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}