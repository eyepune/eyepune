import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Building2, Wallet, Shield, CheckCircle, Loader2, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function CheckoutModal({ pkg, isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
    });

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: async () => {
            try {
                return await base44.auth.me();
            } catch {
                return null;
            }
        },
    });

    useEffect(() => {
        loadRazorpayScript();
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.full_name || prev.name,
                email: user.email || prev.email
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if user is authenticated (Bypass for testing only if ?test_payment=true is present)
        const isTestMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test_payment') === 'true';
        if (!user && !isTestMode) {
            alert('Please login to continue with payment');
            base44.auth.redirectToLogin(window.location.href);
            return;
        }

        setIsLoading(true);
        try {
            // Create Razorpay order via local API
            const orderRes = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: pkg.price,
                    currency: 'INR',
                    receipt: `pkg_${Date.now()}`
                })
            });

            const order = await orderRes.json();
            if (order.error) throw new Error(order.error);

            // Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'EyE PunE',
                description: pkg.name,
                order_id: order.id,
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: '#DC2626'
                },
                handler: async function (response) {
                    try {
                        // Verify payment on server
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                metadata: {
                                    customer_name: formData.name,
                                    customer_email: formData.email,
                                    customer_phone: formData.phone,
                                    plan_name: pkg.name,
                                    amount: pkg.price,
                                    notes: formData.notes
                                }
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            setStep(2);
                        } else {
                            throw new Error(verifyData.error || 'Verification failed');
                        }
                    } catch (err) {
                        alert('Payment verification failed. Please contact support with your payment ID.');
                    } finally {
                        setIsLoading(false);
                    }
                },
                modal: {
                    ondismiss: function() {
                        setIsLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment initialization error:', error);
            alert(`Failed to start payment: ${error.message}`);
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-start sm:items-center overflow-y-auto p-4 sm:p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-card border rounded-3xl max-w-lg w-full my-auto shadow-2xl relative overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">
                                {step === 1 ? 'Complete Payment' : 'Payment Successful!'}
                            </h2>
                            <p className="text-muted-foreground text-sm mt-1">{pkg.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {step === 1 ? (
                        <>
                            {/* Order summary */}
                            <div className="p-6 border-b bg-muted/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total Amount</span>
                                    <span className="text-2xl font-bold">{formatPrice(pkg.price)}</span>
                                </div>
                            </div>

                            {/* Login prompt if not authenticated */}
                            {!user && (
                                <div className="p-6 border-b bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-start gap-3">
                                        <LogIn className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                                Login Required
                                            </p>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                You need to be logged in to complete the payment. Click below to login or create an account.
                                            </p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                                                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                                            >
                                                <LogIn className="w-4 h-4 mr-2" />
                                                Login to Continue
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <Label className="mb-2 block">Full Name *</Label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <Label className="mb-2 block">Email *</Label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <Label className="mb-2 block">Phone *</Label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <Label className="mb-2 block">Company</Label>
                                        <Input
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            placeholder="Your company"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Additional Notes</Label>
                                    <Textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="min-h-[80px]"
                                        placeholder="Tell us about your project..."
                                    />
                                </div>

                                {/* Payment methods info */}
                                <div className="p-4 rounded-xl bg-muted border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        <span className="text-sm">Secure payment via Razorpay</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Smartphone className="w-4 h-4" />
                                            <span className="text-xs">UPI</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <CreditCard className="w-4 h-4" />
                                            <span className="text-xs">Cards</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Building2 className="w-4 h-4" />
                                            <span className="text-xs">Net Banking</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Wallet className="w-4 h-4" />
                                            <span className="text-xs">Wallets</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-base font-medium"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Proceed to Pay ${formatPrice(pkg.price)}`
                                    )}
                                </Button>

                                <p className="text-center text-muted-foreground text-xs">
                                    You will be redirected to Razorpay secure checkout
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </motion.div>
                            <h3 className="text-2xl font-bold mb-3">Payment Successful!</h3>
                            <p className="text-muted-foreground mb-6">
                                Thank you for choosing EyE PunE. Check your email for the onboarding details and next steps.
                            </p>
                            <Button
                                onClick={onClose}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-5 rounded-xl"
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}