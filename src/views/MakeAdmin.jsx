import React, { useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function MakeAdmin() {
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const { data: user, isLoading } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me(),
    });

    const makeAdminMutation = useMutation({
        mutationFn: async () => {
            // Update current user to admin
            await base44.auth.updateMe({ role: 'admin' });
        },
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => {
                window.location.href = createPageUrl('Admin_Dashboard');
            }, 2000);
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Admin Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Please log in first to gain admin access.
                        </p>
                        <Button 
                            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (user.role === 'admin') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                            Already Admin
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            You already have admin privileges!
                        </p>
                        <Button 
                            onClick={() => navigate(createPageUrl('Admin_Dashboard'))}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            Go to Admin Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Grant Admin Access
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center py-8">
                            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Success!</h3>
                            <p className="text-muted-foreground">
                                Admin access granted. Redirecting to dashboard...
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted-foreground mb-6">
                                Click the button below to grant yourself admin privileges and access the admin dashboard.
                            </p>
                            <Button 
                                onClick={() => makeAdminMutation.mutate()}
                                disabled={makeAdminMutation.isPending}
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                {makeAdminMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Granting Access...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Make Me Admin
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}