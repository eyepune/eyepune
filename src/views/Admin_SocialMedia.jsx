'use client';

import React, { useState } from 'react';
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Twitter, CheckCircle2, AlertCircle, Loader2, Save, Send, Shield
} from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function SocialMediaContent() {
    const queryClient = useQueryClient();
    const [isTesting, setIsTesting] = useState(false);

    // Fetch system status
    const { data: systemStatus, isLoading: isLoadingStatus } = useQuery({
        queryKey: ['twitter-system-status'],
        queryFn: async () => {
            try {
                const res = await fetch('/api/system/verify');
                if (!res.ok) return { twitter: { configured: false } };
                const data = await res.json();
                return data.report || { twitter: { configured: false } };
            } catch {
                return { twitter: { configured: false } };
            }
        }
    });

    const isConnected = !!systemStatus?.twitter?.configured;

    // Mutation to save keys
    const saveMutation = useMutation({
        mutationFn: async (credentials) => {
            const res = await fetch('/api/system/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'twitter_config',
                    value: credentials
                })
            });
            if (!res.ok) throw new Error('Failed to save settings');
            return res.json();
        },
        onSuccess: () => {
            toast.success("X (Twitter) credentials saved securely!");
            queryClient.invalidateQueries(['twitter-system-status']);
        },
        onError: (e) => {
            toast.error(e.message || "Failed to save settings");
        }
    });

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        saveMutation.mutate({
            apiKey: formData.get('apiKey'),
            apiSecret: formData.get('apiSecret'),
            accessToken: formData.get('accessToken'),
            accessSecret: formData.get('accessSecret')
        });
    };

    const handleTest = async () => {
        setIsTesting(true);
        try {
            const res = await fetch('/api/system/twitter/test', { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            
            if (res.ok && data.success) {
                toast.success('Test Tweet sent successfully!');
            } else {
                toast.error(data.error || 'Failed to send test Tweet. Check your credentials.');
            }
        } catch (e) {
            toast.error('Network error while testing.');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Twitter className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-medium text-gray-300">Social Media Engine</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">X (Twitter) Syndication</h1>
                <p className="text-gray-400 mt-2 text-sm max-w-xl">
                    Configure your X API credentials to enable autonomous viral thread generation and blog syndication.
                </p>
            </div>

            {/* Connection Status */}
            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden relative group">
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-100 transition-opacity",
                    isConnected ? "from-blue-600/5 to-transparent" : "from-amber-600/5 to-transparent"
                )} />
                <CardContent className="p-6 flex items-center gap-4 relative z-10">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border",
                        isConnected ? "bg-blue-500/10 border-blue-500/20" : "bg-amber-500/10 border-amber-500/20"
                    )}>
                        <Twitter className={cn("w-7 h-7", isConnected ? "text-blue-500" : "text-amber-500")} />
                    </div>
                    <div className="flex-1">
                        <p className="text-lg font-bold text-white flex items-center gap-2">
                            X API Connection
                            {isConnected 
                                ? <CheckCircle2 className="w-4 h-4 text-green-500" /> 
                                : <AlertCircle className="w-4 h-4 text-amber-500" />
                            }
                        </p>
                        <p className={cn("text-sm", isConnected ? "text-green-400/80" : "text-amber-400/80")}>
                            {isLoadingStatus ? "Checking status..." : 
                             isConnected ? "Connected and ready for syndication" : "Configuration required"}
                        </p>
                    </div>
                    {isConnected && (
                        <Button 
                            onClick={handleTest} 
                            disabled={isTesting}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Test Tweet
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Credentials Form */}
            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                <form onSubmit={handleSave}>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-400" /> API Credentials
                        </CardTitle>
                        <CardDescription>
                            These credentials are encrypted and stored securely in your database. 
                            You need a Twitter Developer account with Read and Write permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input 
                                    id="apiKey" 
                                    name="apiKey" 
                                    type="password"
                                    placeholder="Enter your X API Key" 
                                    className="bg-black/50 border-white/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apiSecret">API Key Secret</Label>
                                <Input 
                                    id="apiSecret" 
                                    name="apiSecret" 
                                    type="password"
                                    placeholder="Enter your X API Key Secret" 
                                    className="bg-black/50 border-white/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accessToken">Access Token</Label>
                                <Input 
                                    id="accessToken" 
                                    name="accessToken" 
                                    type="password"
                                    placeholder="Enter your Access Token" 
                                    className="bg-black/50 border-white/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accessSecret">Access Token Secret</Label>
                                <Input 
                                    id="accessSecret" 
                                    name="accessSecret" 
                                    type="password"
                                    placeholder="Enter your Access Token Secret" 
                                    className="bg-black/50 border-white/10"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={saveMutation.isPending}
                                className="bg-white text-black hover:bg-gray-200"
                            >
                                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Credentials
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}

export default function Admin_SocialMedia() {
    return (
        <AdminGuard>
            <AdminLayout>
                <SocialMediaContent />
            </AdminLayout>
        </AdminGuard>
    );
}
