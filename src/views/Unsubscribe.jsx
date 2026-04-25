import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail } from 'lucide-react';

export default function Unsubscribe() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('loading'); // loading, success, error, already
    const [message, setMessage] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        
        if (emailParam) {
            setEmail(emailParam);
            handleUnsubscribe(emailParam);
        } else {
            setStatus('error');
            setMessage('No email address provided.');
        }
    }, []);

    const handleUnsubscribe = async (emailAddress) => {
        try {
            // Find lead by email
            const { data: leads, error: findErr } = await supabase
                .from('leads')
                .select('id, tags, notes')
                .eq('email', emailAddress)
                .limit(1);

            if (findErr) throw findErr;
            
            if (!leads || leads.length === 0) {
                setStatus('error');
                setMessage('Email address not found in our system.');
                return;
            }

            const lead = leads[0];

            // Check if already unsubscribed
            if (lead.tags?.includes('unsubscribed')) {
                setStatus('already');
                setMessage('You were already unsubscribed from our emails.');
                return;
            }

            // Update lead with unsubscribed tag
            const updatedTags = [...(lead.tags || []), 'unsubscribed'];
            const { error: updateErr } = await supabase
                .from('leads')
                .update({
                    tags: updatedTags,
                    notes: (lead.notes || '') + `\n[${new Date().toLocaleDateString()}] Unsubscribed from email communications`
                })
                .eq('id', lead.id);

            if (updateErr) throw updateErr;

            setStatus('success');
            setMessage('You have been successfully unsubscribed from our emails.');

        } catch (error) {
            console.error('Unsubscribe error:', error);
            setStatus('error');
            setMessage('An error occurred. Please try again or contact us directly.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                        {status === 'success' || status === 'already' ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                Unsubscribed
                            </>
                        ) : status === 'loading' ? (
                            <>
                                <Mail className="w-6 h-6" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Mail className="w-6 h-6" />
                                Unsubscribe
                            </>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center space-y-4">
                        {status === 'loading' && (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-lg font-semibold">{message}</p>
                                <p className="text-sm text-muted-foreground">
                                    You will no longer receive emails from EyE PunE.
                                </p>
                                <div className="pt-4">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Changed your mind? You're always welcome back!
                                    </p>
                                    <a href="mailto:connect@eyepune.com">
                                        <Button variant="outline" className="w-full">
                                            Contact Us
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        )}

                        {status === 'already' && (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-lg font-semibold">{message}</p>
                                <p className="text-sm text-muted-foreground">
                                    Your preferences have been saved.
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-4">
                                <p className="text-lg font-semibold text-red-600">{message}</p>
                                <p className="text-sm text-muted-foreground">
                                    If you continue to receive emails, please contact us at:
                                </p>
                                <a href="mailto:connect@eyepune.com" className="text-red-600 hover:underline">
                                    connect@eyepune.com
                                </a>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}