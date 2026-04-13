'use client';

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/shared/Logo';
import { Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            // Check if user is admin
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'admin') {
                window.location.href = '/Admin_Dashboard';
            } else {
                toast.error('You do not have admin privileges');
                await supabase.auth.signOut();
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo variant="dark" size="md" className="justify-center mb-4" />
                    <h1 className="text-2xl font-bold text-white">Admin Login</h1>
                    <p className="text-gray-500 mt-1">Sign in to manage your website</p>
                </div>

                <Card className="bg-[#111] border-white/[0.06]">
                    <CardContent className="pt-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label className="text-gray-400">Email</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@eyepune.com"
                                        className="pl-10 bg-[#1a1a1a] border-white/[0.06] text-white"
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
                                        className="pl-10 bg-[#1a1a1a] border-white/[0.06] text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                            >
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-600 mt-6">
                    EyE PunE Admin Panel • Authorized access only
                </p>
            </div>
        </div>
    );
}
