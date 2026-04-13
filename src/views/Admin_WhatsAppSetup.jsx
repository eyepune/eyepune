import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Check, Smartphone, Send, Loader2, CheckCircle2 } from 'lucide-react';
import AdminGuard from "@/components/admin/AdminGuard";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function Admin_WhatsAppSetup() {
    const [isSendingTest, setIsSendingTest] = useState(false);
    const whatsappURL = base44.agents.getWhatsAppConnectURL('salesAssistant');
    
    // Check if WhatsApp is connected
    const { data: conversations } = useQuery({
        queryKey: ['whatsapp-status'],
        queryFn: async () => {
            try {
                return await base44.agents.listConversations({ agent_name: 'salesAssistant' });
            } catch {
                return [];
            }
        }
    });

    const { data: currentUser } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    // Check if current user has connected their WhatsApp
    const myConv = conversations?.find(c => 
        c.metadata?.is_admin_notifications === true && 
        c.metadata?.admin_email === currentUser?.email
    );
    // Check if actually connected via WhatsApp (has any messages - means they sent the initial message)
    const isMyWhatsAppConnected = !!myConv && myConv.messages && myConv.messages.length > 0;
    
    // Get all admin conversations and check their connection status
    const allAdminConnections = (conversations?.filter(c => c.metadata?.is_admin_notifications === true) || [])
        .map(conv => ({
            ...conv,
            isConnected: !!(conv.messages && conv.messages.length > 0)
        }));

    const handleSendTest = async () => {
        setIsSendingTest(true);
        try {
            const response = await base44.functions.invoke('sendTestWhatsAppNotification');
            if (response.data.success) {
                toast.success('Test notification sent! Check WhatsApp at +91 9284712033');
            } else {
                toast.error('Failed to send test notification');
            }
        } catch (error) {
            toast.error('Error sending test notification');
            console.error(error);
        }
        setIsSendingTest(false);
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">WhatsApp Notifications</h1>
                        <p className="text-muted-foreground text-lg">
                            Get instant notifications for important events
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Connect Card */}
                        <Card className={isMyWhatsAppConnected ? "border-green-500" : ""}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {isMyWhatsAppConnected ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <MessageCircle className="w-5 h-5 text-green-600" />
                                    )}
                                    {isMyWhatsAppConnected ? 'Your WhatsApp Connected' : 'Connect Your WhatsApp'}
                                </CardTitle>
                                <CardDescription>
                                    {isMyWhatsAppConnected 
                                        ? 'Your WhatsApp is connected and receiving notifications'
                                        : 'Link your WhatsApp number to receive real-time notifications'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isMyWhatsAppConnected && (
                                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 text-green-900 dark:text-green-100 font-semibold mb-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Active & Connected
                                        </div>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Account: {currentUser?.full_name || currentUser?.email}
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            You will receive all admin notifications.
                                        </p>
                                    </div>
                                )}
                                
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm mb-3">You'll receive notifications for:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            New AI assessments completed
                                        </li>
                                        <li className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            High-value leads (70+ score)
                                        </li>
                                        <li className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            New bookings confirmed
                                        </li>
                                        <li className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            Qualified leads ready for proposals
                                        </li>
                                    </ul>
                                </div>
                                
                                {!isMyWhatsAppConnected && (
                                    <>
                                        <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
                                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                                <Smartphone className="w-4 h-4 mr-2" />
                                                Connect My WhatsApp
                                            </Button>
                                        </a>

                                        <p className="text-xs text-muted-foreground text-center">
                                            Opens WhatsApp to authenticate. One-time setup per admin.
                                        </p>
                                    </>
                                )}

                                {isMyWhatsAppConnected && (
                                    <div className="pt-4 border-t">
                                        <Button
                                            onClick={handleSendTest}
                                            variant="outline"
                                            className="w-full"
                                            disabled={isSendingTest}
                                        >
                                            {isSendingTest ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Test to My WhatsApp
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>How It Works</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-red-600">1</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Click Connect</p>
                                            <p className="text-sm text-muted-foreground">
                                                Opens WhatsApp with a pre-filled message
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-red-600">2</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Send the Message</p>
                                            <p className="text-sm text-muted-foreground">
                                                This authenticates your WhatsApp
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-red-600">3</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Get Notified</p>
                                            <p className="text-sm text-muted-foreground">
                                                Instant alerts for important events
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                                        💡 Pro Tip
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        You can also chat with the Sales Assistant through WhatsApp to qualify leads and check CRM data on the go!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Connected Admins List */}
                    {allAdminConnections.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Admin WhatsApp Status</CardTitle>
                                <CardDescription>
                                    {allAdminConnections.filter(c => c.isConnected).length} of {allAdminConnections.length} admin numbers connected
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {allAdminConnections.map((conv, idx) => (
                                        <div 
                                            key={conv.id} 
                                            className={`flex items-center justify-between p-3 rounded-lg ${
                                                conv.isConnected 
                                                    ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' 
                                                    : 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    conv.isConnected 
                                                        ? 'bg-green-100 dark:bg-green-900/30' 
                                                        : 'bg-orange-100 dark:bg-orange-900/30'
                                                }`}>
                                                    <CheckCircle2 className={`w-5 h-5 ${
                                                        conv.isConnected ? 'text-green-600' : 'text-orange-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">
                                                            {conv.metadata?.admin_name || 'Admin User'}
                                                        </p>
                                                        {conv.isConnected ? (
                                                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                                                                Connected
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {conv.metadata?.admin_email}
                                                    </p>
                                                    {!conv.isConnected && (
                                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                            Awaiting WhatsApp authentication
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {conv.metadata?.admin_email === currentUser?.email && (
                                                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AdminGuard>
    );
}