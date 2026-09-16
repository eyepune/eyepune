'use client';

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from '@/components/shared/Logo';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Login() {
    const { user, isAuthenticated, isLoadingAuth } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    React.useEffect(() => {
        if (!isLoadingAuth && isAuthenticated && user) {
            if (redirectUrl) {
                router.push(redirectUrl);
            } else if (user.role === 'admin') {
                router.push('/Admin-Dashboard');
            } else {
                router.push('/Client-Dashboard');
            }
        }
    }, [isLoadingAuth, isAuthenticated, user, router, redirectUrl]);

    React.useEffect(() => {
        // Load the Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: '940883111333-7l6gh4a3cu2d42ltcdcml2slfovt9eca.apps.googleusercontent.com',
                    callback: handleGoogleCallback,
                    context: 'signin'
                });

                if (document.getElementById('google-signin-btn')) {
                    window.google.accounts.id.renderButton(
                        document.getElementById('google-signin-btn'),
                        { theme: 'filled_black', size: 'large', type: 'standard', width: 330 }
                    );
                }
            }
        };

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const handleGoogleCallback = async (response) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
            });
            if (error) throw error;
        } catch (error) {
            toast.error(error.message || 'Google Sign-In failed');
            setLoading(false);
        }
    };

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    const handleAuth = async (e) => {
        e.preventDefault();
        if (!email || !password || (mode === 'signup' && !fullName)) {
            toast.error('Please fill in all required fields');
            return;
        }
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;

                toast.success('Registration successful! Please check your email to confirm your account (if enabled), or sign in.');

                if (data?.session) {
                    // Redirect will be handled by the useEffect above
                } else {
                    setMode('signin');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Redirect will be handled by the useEffect above
            }
        } catch (error) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full max-w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full max-w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Logo variant="dark" size="md" className="justify-center mb-4" />
                    <h1 className="text-2xl font-bold text-white">Universal Portal</h1>
                    <p className="text-gray-500 mt-1">Sign in as Admin, Team, or Client to continue</p>
                </div>

                <Card className="bg-[#111] border-white/[0.06] shadow-2xl">
                    <CardContent className="pt-6">
                        <Tabs value={mode} onValueChange={(v) => { setMode(v); setEmail(''); setPassword(''); setFullName(''); }} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/[0.03] border border-white/[0.05]">
                                <TabsTrigger value="signin" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">Sign In</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">Sign Up</TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleAuth} className="space-y-4">
                                {mode === 'signup' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-gray-400">Full Name</Label>
                                        <div className="relative mt-1">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <Input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="John Doe"
                                                className="pl-10 bg-[#1a1a1a] border-white/[0.06] text-white focus-visible:ring-red-500/50"
                                                required={mode === 'signup'}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-gray-400">Email</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="pl-10 bg-[#1a1a1a] border-white/[0.06] text-white focus-visible:ring-red-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Password</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-10 bg-[#1a1a1a] border-white/[0.06] text-white focus-visible:ring-red-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all mt-4"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                </Button>

                                {mode === 'signin' && (
                                    <div className="text-center mt-4 mb-2">
                                        <button type="button" className="text-xs text-gray-500 hover:text-white transition-colors" onClick={() => toast.info('Password reset not configured yet.')}>
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/[0.06]"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#111] px-2 text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="w-full flex justify-center min-h-[40px] items-center">
                                        <div id="google-signin-btn"></div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                let callbackUrl = `${window.location.origin}/api/auth/callback`;
                                                if (redirectUrl) {
                                                    callbackUrl += `?next=${encodeURIComponent(redirectUrl)}`;
                                                }

                                                const { error } = await supabase.auth.signInWithOAuth({
                                                    provider: 'linkedin_oidc',
                                                    options: {
                                                        redirectTo: callbackUrl
                                                    }
                                                });
                                                if (error) throw error;
                                            } catch (error) {
                                                toast.error(error.message || 'OAuth failed');
                                                setLoading(false);
                                            }
                                        }}
                                        className="w-full bg-[#0077b5] border-transparent text-white hover:bg-[#005582]"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        LinkedIn
                                    </Button>
                                </div>
                            </form>
                        </Tabs>
                    </CardContent>
                </Card>

                <div className="text-center mt-8 space-y-4">
                    <p className="text-xs text-gray-600">
                        Secure Client & Admin Authentication • EyE PunE
                    </p>
                    <Link href="/System-Status" className="block text-[10px] text-gray-700 hover:text-red-500 transition-colors uppercase tracking-widest">
                        System Troubleshoot
                    </Link>
                </div>
            </div>
        </div>
    );
}
