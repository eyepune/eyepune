'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, CheckCircle2, Loader2, AlertTriangle, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function MakeAdmin() {
    const { user, isLoadingAuth, checkAppState } = useAuth();
    const [loading, setLoading] = useState(false);
    const [checkingAdmins, setCheckingAdmins] = useState(true);
    const [adminsExist, setAdminsExist] = useState(false);
    const [signUpMode, setSignUpMode] = useState(false);
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpName, setSignUpName] = useState('');
    const [manualInstructions, setManualInstructions] = useState(null);

    // Check if any admin users already exist
    useEffect(() => {
        async function checkAdmins() {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id')
                    .eq('role', 'admin')
                    .limit(1);

                if (error) {
                    console.warn('Could not check admins:', error.message);
                }
                setAdminsExist(data && data.length > 0);
            } catch (err) {
                console.warn('Admin check error:', err);
            } finally {
                setCheckingAdmins(false);
            }
        }
        checkAdmins();
    }, []);

    const handlePromoteToAdmin = async () => {
        if (!user) {
            toast.error('Please sign in first');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/admin/promote-first', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                // Show manual instructions if automatic promotion failed
                if (data.instructions) {
                    setManualInstructions(data.instructions);
                    toast.error('Automatic promotion failed. See instructions below.');
                } else {
                    throw new Error(data.error || data.message || 'Failed to promote to admin');
                }
                return;
            }

            toast.success('You are now an admin!');
            await checkAppState();

            // Redirect to admin dashboard after a short delay
            setTimeout(() => {
                window.location.href = '/Admin_Dashboard';
            }, 1500);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!signUpEmail || !signUpPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: signUpEmail,
                password: signUpPassword,
                options: {
                    data: { full_name: signUpName || signUpEmail.split('@')[0] },
                },
            });

            if (error) throw error;

            // Check if email confirmation is needed
            if (data?.user && !data.session) {
                toast.success('Account created! Please check your email to confirm, then come back to this page.');
                setLoading(false);
                return;
            }

            // If auto-confirmed, refresh auth state
            await checkAppState();
            toast.success('Account created successfully! Now click "Become Admin" to get admin access.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!signUpEmail || !signUpPassword) {
            toast.error('Please enter email and password');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: signUpEmail,
                password: signUpPassword,
            });

            if (error) throw error;

            await checkAppState();
            toast.success('Signed in successfully!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (isLoadingAuth || checkingAdmins) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Already admin
    if (user?.role === 'admin') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <Card className="max-w-md bg-[#111] border-white/[0.06]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                            Already Admin
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 mb-4">
                            You already have admin privileges!
                        </p>
                        <Button
                            onClick={() => window.location.href = '/Admin_Dashboard'}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            Go to Admin Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Admins already exist — can't self-promote
    if (adminsExist) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <Card className="max-w-md bg-[#111] border-white/[0.06]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-500">
                            <AlertTriangle className="w-5 h-5" />
                            Admins Already Exist
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 mb-4">
                            This site already has admin users. Ask an existing admin to promote your account.
                        </p>
                        <Button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Not logged in — show sign up / sign in form
    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Set Up Admin</h1>
                        <p className="text-gray-500">No admins exist yet. Create your account to become the first admin.</p>
                    </div>

                    <Card className="bg-[#111] border-white/[0.06]">
                        <CardHeader>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={!signUpMode ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSignUpMode(false)}
                                    className="flex-1"
                                >
                                    <LogIn className="w-4 h-4 mr-1" /> Sign In
                                </Button>
                                <Button
                                    type="button"
                                    variant={signUpMode ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSignUpMode(true)}
                                    className="flex-1"
                                >
                                    <UserPlus className="w-4 h-4 mr-1" /> Sign Up
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={signUpMode ? handleSignUp : handleSignIn} className="space-y-4">
                                {signUpMode && (
                                    <div>
                                        <Label className="text-gray-400">Full Name</Label>
                                        <Input
                                            value={signUpName}
                                            onChange={(e) => setSignUpName(e.target.value)}
                                            placeholder="Your name"
                                            className="mt-1 bg-[#1a1a1a] border-white/[0.06] text-white"
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label className="text-gray-400">Email</Label>
                                    <Input
                                        type="email"
                                        value={signUpEmail}
                                        onChange={(e) => setSignUpEmail(e.target.value)}
                                        placeholder="admin@eyepune.com"
                                        required
                                        className="mt-1 bg-[#1a1a1a] border-white/[0.06] text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-400">Password</Label>
                                    <Input
                                        type="password"
                                        value={signUpPassword}
                                        onChange={(e) => setSignUpPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="mt-1 bg-[#1a1a1a] border-white/[0.06] text-white"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {signUpMode ? 'Create Account' : 'Sign In'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Logged in but not admin, no admins exist — show promote button
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            <Card className="max-w-md bg-[#111] border-white/[0.06]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Shield className="w-5 h-5 text-red-600" />
                        Become Admin
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        No admins exist yet. Click below to become the first admin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/[0.06]">
                        <p className="text-sm text-gray-400">Signed in as:</p>
                        <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <Button
                        onClick={handlePromoteToAdmin}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                        Become Admin
                    </Button>
                    {manualInstructions && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-3">
                            <p className="text-yellow-400 text-sm font-medium">Automatic setup failed. Follow these steps:</p>
                            <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                                {manualInstructions.map((step, i) => (
                                    <li key={i} className="text-gray-400">{step}</li>
                                ))}
                            </ol>
                            <div className="pt-2">
                                <p className="text-gray-500 text-xs">Or run this SQL in Supabase SQL Editor:</p>
                                <code className="block bg-[#0a0a0a] rounded p-2 mt-1 text-green-400 text-xs break-all">
                                    UPDATE users SET role = 'admin' WHERE id = '{user.id}';
                                </code>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                onClick={() => {
                                    navigator.clipboard.writeText(`UPDATE users SET role = 'admin' WHERE id = '${user.id}';`);
                                    toast.success('SQL copied to clipboard!');
                                }}
                            >
                                Copy SQL Command
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
