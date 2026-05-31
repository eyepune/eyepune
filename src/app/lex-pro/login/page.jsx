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
                    Sign in to access your secure AI legal workspace.
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
                    </form>
                </div>
            </div>
        </div>
    );
}
