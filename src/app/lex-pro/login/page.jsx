"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2, KeyRound, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LexProLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    
    // Initialize Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Needs to be added to .env
    const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;

    useEffect(() => {
        // Redirect if already logged in
        if (supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    router.push('/lex-pro/dashboard');
                }
            });
        }
    }, [router, supabase]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!supabase) {
            setError('Supabase client is not configured. Check environment variables.');
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // If user doesn't exist, try to sign them up automatically (for MVP simplicity)
                if (error.message.includes('Invalid login credentials')) {
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email,
                        password,
                    });
                    
                    if (signUpError) throw signUpError;
                    
                    if (signUpData.session) {
                        router.push('/lex-pro/dashboard');
                    } else if (signUpData.user) {
                        setError('Account created! Please check your email to confirm your account before logging in.');
                    } else {
                        throw new Error('Sign up failed.');
                    }
                } else {
                    throw error;
                }
            } else if (data.session) {
                router.push('/lex-pro/dashboard');
            } else {
                router.push('/lex-pro/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
                    Welcome to Lex Pro
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Sign in or create an account to access your secure AI legal workspace.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/5 border border-white/10 py-8 px-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <div className="mt-2 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 sm:text-sm"
                                    placeholder="attorney@lawfirm.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="mt-2 relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                {error}
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">Enter Workspace <ArrowRight className="w-4 h-4" /></span>
                                )}
                            </Button>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.06]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#111] px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        const { error } = await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: window.location.origin + '/lex-pro/dashboard'
                                            }
                                        });
                                        if (error) throw error;
                                    } catch (error) {
                                        setError(error.message || 'OAuth failed');
                                        setIsLoading(false);
                                    }
                                }}
                                className="w-full bg-white/[0.03] border-white/[0.06] text-white hover:bg-white/[0.08]"
                            >
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        const { error } = await supabase.auth.signInWithOAuth({
                                            provider: 'linkedin_oidc',
                                            options: {
                                                redirectTo: window.location.origin + '/lex-pro/dashboard'
                                            }
                                        });
                                        if (error) throw error;
                                    } catch (error) {
                                        setError(error.message || 'OAuth failed');
                                        setIsLoading(false);
                                    }
                                }}
                                className="w-full bg-[#0077b5] border-transparent text-white hover:bg-[#005582]"
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                LinkedIn
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
