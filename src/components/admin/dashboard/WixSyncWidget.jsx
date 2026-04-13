import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WixSyncWidget() {
    const [isLoading, setIsLoading] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [syncResult, setSyncResult] = useState(null);

    const handleSync = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('syncWixContacts', {});
            setSyncResult(response.data);
            setLastSync(new Date());
        } catch (error) {
            setSyncResult({ error: error.message });
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Wix Sync</h3>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSync}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4" />
                            Sync Now
                        </>
                    )}
                </Button>
            </div>

            {syncResult && (
                <div className={`rounded-lg p-4 mb-4 ${
                    syncResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                    <div className="flex items-start gap-3">
                        {syncResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{syncResult.message}</p>
                            {syncResult.stats && (
                                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                    <p>📊 Total Wix Contacts: <span className="font-bold">{syncResult.stats.total_wix_contacts}</span></p>
                                    <p>✅ Synced: <span className="font-bold text-green-600">{syncResult.stats.synced_new}</span></p>
                                    {syncResult.stats.failed > 0 && (
                                        <p>❌ Failed: <span className="font-bold text-red-600">{syncResult.stats.failed}</span></p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {lastSync && (
                <p className="text-xs text-muted-foreground">
                    Last synced: {lastSync.toLocaleString()}
                </p>
            )}
        </div>
    );
}