'use client';

import React, { useState } from 'react';
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    MessageCircle, Check, Smartphone, Send, Loader2, 
    CheckCircle2, AlertCircle, ExternalLink, Copy, Shield,
    Zap, ArrowRight, Globe
} from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function WhatsAppSetupContent() {
    const [testPhone, setTestPhone] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const queryClient = useQueryClient();

    // Check system status (tells us if WA env vars are set)
    const { data: systemStatus, isLoading: isLoadingStatus } = useQuery({
        queryKey: ['whatsapp-system-status'],
        queryFn: async () => {
            try {
                const res = await fetch('/api/system/verify');
                if (!res.ok) return { whatsapp: { configured: false } };
                const data = await res.json();
                return data.report || { whatsapp: { configured: false } };
            } catch {
                return { whatsapp: { configured: false } };
            }
        }
    });

    const isConnected = !!systemStatus?.whatsapp?.configured;

    const handleTestMessage = async () => {
        if (!testPhone) return toast.error('Enter a phone number with country code (e.g. 919284712033)');
        setIsTesting(true);
        try {
            const res = await fetch('/api/system/whatsapp/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: testPhone })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                toast.success('✅ Test message sent! Check your WhatsApp.');
            } else {
                toast.error(`Failed: ${data.error || data.details || 'Check your credentials'}`);
            }
        } catch (e) {
            toast.error('Network error — is the server running?');
        } finally {
            setIsTesting(false);
        }
    };

    const copyWebhookUrl = () => {
        navigator.clipboard.writeText('https://eyepune.com/api/whatsapp/webhook');
        toast.success('Webhook URL copied to clipboard');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                    <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-medium text-gray-300">WhatsApp Business API</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">WhatsApp Setup</h1>
                <p className="text-gray-400 mt-2 text-sm max-w-xl">
                    Connect the Meta WhatsApp Cloud API to send automated notifications, lead alerts, and engage with customers directly.
                </p>
            </div>

            {/* Connection Status */}
            <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden relative group">
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-100 transition-opacity",
                    isConnected ? "from-green-600/5 to-transparent" : "from-amber-600/5 to-transparent"
                )} />
                <CardContent className="p-6 flex items-center gap-4 relative z-10">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border",
                        isConnected ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20"
                    )}>
                        <Smartphone className={cn("w-7 h-7", isConnected ? "text-green-500" : "text-amber-500")} />
                    </div>
                    <div className="flex-1">
                        <p className="text-lg font-bold text-white flex items-center gap-2">
                            Meta Cloud API 
                            {isConnected 
                                ? <CheckCircle2 className="w-4 h-4 text-green-500" /> 
                                : <AlertCircle className="w-4 h-4 text-amber-500" />}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {isLoadingStatus 
                                ? 'Checking status...'
                                : isConnected 
                                    ? 'Connected — WhatsApp Business API is active and sending messages'
                                    : 'Not configured — Add your API credentials in the .env file'}
                        </p>
                    </div>
                    <Badge className={cn(
                        "text-xs font-bold uppercase tracking-wider px-3 py-1",
                        isConnected 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                        {isConnected ? 'LIVE' : 'SETUP NEEDED'}
                    </Badge>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Setup Instructions */}
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                        <CardTitle className="text-white text-xl flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-500" />
                            Setup Guide
                        </CardTitle>
                        <CardDescription className="text-gray-500 mt-1">
                            Follow these steps to activate WhatsApp messaging
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {[
                            {
                                step: 1,
                                title: 'Create a Meta Business App',
                                desc: 'Go to Meta Developer Dashboard and create a Business app with WhatsApp product enabled.',
                                link: 'https://developers.facebook.com/apps/',
                                linkText: 'Open Meta Dashboard'
                            },
                            {
                                step: 2,
                                title: 'Get your Phone Number ID',
                                desc: 'In WhatsApp > API Setup, find your "Phone number ID" and add it as WHATSAPP_PHONE_ID in your .env file.',
                            },
                            {
                                step: 3,
                                title: 'Generate Permanent Token',
                                desc: 'Create a System User in Business Settings > System Users, then generate a permanent access token with whatsapp_business_messaging permission.',
                                link: 'https://business.facebook.com/settings/system-users',
                                linkText: 'Business Settings'
                            },
                            {
                                step: 4,
                                title: 'Set Webhook URL',
                                desc: 'Configure your webhook in Meta Developer Dashboard to receive inbound messages.',
                            },
                        ].map(({ step, title, desc, link, linkText }) => (
                            <div key={step} className="flex gap-4 group/step">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 group-hover/step:bg-green-500/20 transition-colors">
                                    <span className="text-sm font-black text-green-500">{step}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-white group-hover/step:text-green-400 transition-colors">{title}</p>
                                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">{desc}</p>
                                    {link && (
                                        <a href={link} target="_blank" rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 mt-2 font-medium">
                                            {linkText} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Webhook URL */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Your Webhook URL</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm text-green-400 font-mono bg-black/50 px-4 py-2.5 rounded-xl border border-white/5 truncate">
                                    https://eyepune.com/api/whatsapp/webhook
                                </code>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={copyWebhookUrl}
                                    className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 h-10 w-10"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-gray-600">
                                Verify Token: <code className="text-gray-400">eyepune_whatsapp_verify_2026</code>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Test & Status */}
                <div className="space-y-8">
                    {/* Test Connection */}
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                            <CardTitle className="text-white text-xl flex items-center gap-3">
                                <Send className="w-5 h-5 text-green-500" />
                                Test Connection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300 text-xs uppercase tracking-widest font-bold">
                                    Recipient Phone Number
                                </Label>
                                <Input
                                    placeholder="e.g. 919284712033 (with country code, no +)"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    className="bg-[#111] border-white/10 h-12 focus:border-green-500/50 font-mono"
                                />
                            </div>
                            <Button
                                onClick={handleTestMessage}
                                disabled={isTesting || !isConnected}
                                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-green-500/20 disabled:opacity-50"
                            >
                                {isTesting 
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> 
                                    : <><Send className="w-4 h-4 mr-2" /> Send Test Message</>}
                            </Button>
                            <p className="text-[10px] text-gray-600 text-center italic">
                                Sends the standard "hello_world" Meta test template. Recipient must have the WhatsApp app installed.
                            </p>
                        </CardContent>
                    </Card>

                    {/* What's Active */}
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                            <CardTitle className="text-white text-xl flex items-center gap-3">
                                <Zap className="w-5 h-5 text-green-500" />
                                Active Automations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { 
                                    title: 'Lead Alert Notifications', 
                                    desc: 'Instant WhatsApp + email when a new lead submits a form',
                                    active: true 
                                },
                                { 
                                    title: 'Booking Confirmation Alerts', 
                                    desc: 'Notify you when a consultation is booked',
                                    active: true 
                                },
                                { 
                                    title: 'AI Assessment Alerts', 
                                    desc: 'Alert when a high-intent assessment is completed',
                                    active: true 
                                },
                                { 
                                    title: 'Sales Sniper — Hot Lead Detection', 
                                    desc: 'Real-time alerts when chatbot detects buying intent',
                                    active: true 
                                },
                                { 
                                    title: 'Inbound Auto-Responder', 
                                    desc: 'Auto-replies to common WhatsApp queries from customers',
                                    active: true 
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-green-500/20 transition-colors group">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full flex-shrink-0",
                                        item.active && isConnected ? "bg-green-500 animate-pulse" : "bg-gray-600"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">{item.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                    </div>
                                    <Badge className={cn(
                                        "text-[9px] uppercase font-bold tracking-widest",
                                        item.active && isConnected 
                                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                    )}>
                                        {item.active && isConnected ? 'Active' : 'Pending'}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Configuration */}
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Database Configuration</p>
                            <p className="text-sm text-gray-400">Instead of using .env variables, you can save your credentials directly to the secure database.</p>
                            
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Permanent Access Token</Label>
                                    <Input 
                                        id="wa-token"
                                        type="password"
                                        placeholder="EAAL..." 
                                        className="bg-[#111] border-white/10 font-mono text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Phone Number ID</Label>
                                    <Input 
                                        id="wa-phone-id"
                                        placeholder="1234567890" 
                                        className="bg-[#111] border-white/10 font-mono text-sm"
                                    />
                                </div>
                                <Button 
                                    onClick={async () => {
                                        const token = document.getElementById('wa-token').value;
                                        const phoneId = document.getElementById('wa-phone-id').value;
                                        if (!token || !phoneId) return toast.error('Both Token and Phone ID are required');
                                        
                                        const res = await fetch('/api/system/settings', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                key: 'whatsapp_config',
                                                value: { token, phone_id: phoneId }
                                            })
                                        });
                                        if (res.ok) {
                                            toast.success('Configuration saved successfully!');
                                            setTimeout(() => window.location.reload(), 1500);
                                        } else {
                                            toast.error('Failed to save configuration');
                                        }
                                    }}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                    Save Configuration to Database
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function Admin_WhatsAppSetup() {
    return (
        <AdminGuard>
            <AdminLayout>
                <WhatsAppSetupContent />
            </AdminLayout>
        </AdminGuard>
    );
}
