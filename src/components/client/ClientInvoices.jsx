'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, CreditCard, CheckCircle2, Clock, AlertCircle, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function ClientInvoices({ userEmail }) {
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState(null);

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['client-invoices', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('client_email', userEmail)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
    });

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (invoice) => {
        setProcessingId(invoice.id);
        try {
            const res = await loadRazorpay();
            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // Create Order
            const orderRes = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: invoice.total_amount,
                    receipt: invoice.invoice_number,
                }),
            });

            const order = await orderRes.json();
            if (order.error) throw new Error(order.error);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "EyE PunE",
                description: `Payment for Invoice ${invoice.invoice_number}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                invoice_id: invoice.id
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            toast.success('Payment Successful!');
                            queryClient.invalidateQueries(['client-invoices']);
                        } else {
                            throw new Error(verifyData.error || 'Verification failed');
                        }
                    } catch (err) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    email: userEmail,
                },
                theme: {
                    color: "#dc2626",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment Error:', error);
            toast.error(error.message || 'Payment failed');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-red-600" /> Billing & Invoices
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {invoices.length === 0 ? (
                    <Card className="bg-white/[0.02] border-white/[0.05] p-12 text-center">
                        <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No invoices found for your account.</p>
                    </Card>
                ) : (
                    invoices.map((invoice) => (
                        <Card key={invoice.id} className="bg-[#0c0c0c] border-white/[0.05] overflow-hidden group hover:border-red-600/20 transition-colors">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center border",
                                            invoice.status === 'paid' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                        )}>
                                            <Receipt className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-bold text-lg">{invoice.invoice_number}</h3>
                                                <Badge className={cn(
                                                    "border-0 uppercase text-[10px] font-black",
                                                    invoice.status === 'paid' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                                                )}>
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="text-center md:text-right">
                                        <p className="text-[10px] uppercase font-black text-gray-600 tracking-widest mb-1">Total Amount</p>
                                        <p className="text-3xl font-black text-white">₹{Number(invoice.total_amount).toLocaleString()}</p>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {invoice.status !== 'paid' && (
                                            <Button 
                                                onClick={() => handlePayment(invoice)}
                                                disabled={processingId === invoice.id}
                                                className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl h-12 px-6"
                                            >
                                                {processingId === invoice.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                                                Pay Now
                                            </Button>
                                        )}
                                        <Button variant="outline" className="flex-1 md:flex-none border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-xl h-12 px-4">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
