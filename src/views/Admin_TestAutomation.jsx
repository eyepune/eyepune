'use client';

import React, { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Beaker, Send, CheckCircle2, AlertCircle, Loader2, Mail, Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

export default function Admin_TestAutomation() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        name: 'Test User',
        email: 'connect@eyepune.com',
        company: 'EyE PunE Test Labs',
        service: 'Digital Marketing',
        score: '85',
        date: new Date().toLocaleDateString('en-IN'),
        time: '11:00 AM'
    });

    const triggerTest = async (triggerType) => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/automation/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    triggerType,
                    payload: formData
                })
            });
            const data = await res.json();
            setResult(data);
            if (data.success) {
                toast.success(`Automation triggered: ${triggerType}`);
            } else {
                toast.error(`Trigger failed: ${data.error}`);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminGuard>
            <AdminLayout>
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                                <Beaker className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-xs font-medium text-gray-300">Development Sandbox</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Automation Lab</h1>
                            <p className="text-gray-400 mt-2 text-sm max-w-xl">
                                Test your email triggers and behavioral workflows without waiting for real site events.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                        {/* Test Data Form */}
                        <Card className="lg:col-span-1 bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 shadow-2xl">
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-500" /> Test Data Payload
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-400 text-xs uppercase tracking-widest font-bold">Target Email</Label>
                                    <Input 
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="bg-white/5 border-white/10 text-white h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-400 text-xs uppercase tracking-widest font-bold">User Name</Label>
                                    <Input 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="bg-white/5 border-white/10 text-white h-11"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 text-xs uppercase tracking-widest font-bold">Company</Label>
                                        <Input 
                                            value={formData.company} 
                                            onChange={e => setFormData({...formData, company: e.target.value})}
                                            className="bg-white/5 border-white/10 text-white h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 text-xs uppercase tracking-widest font-bold">Service</Label>
                                        <Input 
                                            value={formData.service} 
                                            onChange={e => setFormData({...formData, service: e.target.value})}
                                            className="bg-white/5 border-white/10 text-white h-11"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-600 italic">This data will replace {{variables}} in your email templates.</p>
                            </CardContent>
                        </Card>

                        {/* Trigger Actions */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'new_inquiry', label: 'Inquiry Confirmation', icon: Mail, color: 'text-emerald-400', desc: 'Sends the "Welcome & Next Steps" template.' },
                                    { id: 'new_assessment', label: 'AI Growth Report', icon: Sparkles, color: 'text-purple-400', desc: 'Sends the score-based analysis report.' },
                                    { id: 'new_booking', label: 'Booking Confirmed', icon: Calendar, color: 'text-blue-400', desc: 'Sends the calendar appointment confirmation.' },
                                    { id: 'new_lead', label: 'General Lead Intro', icon: Send, color: 'text-red-400', desc: 'Triggers generic lead onboarding sequences.' }
                                ].map((test) => (
                                    <Button
                                        key={test.id}
                                        disabled={loading}
                                        onClick={() => triggerTest(test.id)}
                                        className="h-auto p-6 bg-[#0c0c0c]/60 border border-white/5 hover:border-white/20 transition-all flex flex-col items-start gap-2 group text-left"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                                <test.icon className={`w-5 h-5 ${test.color}`} />
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-red-500 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{test.label}</p>
                                            <p className="text-xs text-gray-500 mt-1">{test.desc}</p>
                                        </div>
                                    </Button>
                                ))}
                            </div>

                            {/* Result Feed */}
                            {result && (
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden animate-in zoom-in-95 duration-300">
                                    <div className={`h-1 w-full ${result.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <CardHeader className="px-6 py-4 border-b border-white/5 flex flex-row items-center justify-between">
                                        <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
                                            Execution Logs
                                        </CardTitle>
                                        <Badge variant="outline" className={result.success ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'}>
                                            {result.success ? 'Success' : 'Failed'}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <pre className="text-[11px] font-mono text-gray-400 bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto max-h-[300px] custom-scrollbar">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>
                            )}

                            {!result && !loading && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                                    <Beaker className="w-10 h-10 text-gray-700 mb-4" />
                                    <p className="text-gray-500 text-sm">Select a trigger above to see execution logs.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl">
                                    <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                                    <p className="text-white font-medium">Processing Automation Flow...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
