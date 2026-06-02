"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Building, Users, CreditCard, Shield, Save, Loader2, Plus, Mail, Code, Webhook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@supabase/ssr';

export default function LexProSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchSettingsData = async () => {
            try {
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );
                
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (profileData) {
                    setProfile({ ...profileData, email: user.email });
                    
                    // Fetch Organization
                    if (profileData.organization_id) {
                        const { data: orgData } = await supabase
                            .from('organizations')
                            .select('*')
                            .eq('id', profileData.organization_id)
                            .single();
                        
                        if (orgData) setOrganization(orgData);

                        // Fetch Team Members
                        const { data: teamData } = await supabase
                            .from('profiles')
                            .select('id, full_name, role')
                            .eq('organization_id', profileData.organization_id);
                        
                        if (teamData) setTeamMembers(teamData);
                    }
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettingsData();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            
            await supabase.from('profiles').update({
                full_name: profile.full_name,
            }).eq('id', profile.id);

            if (organization) {
                await supabase.from('organizations').update({
                    name: organization.name,
                    type: organization.type
                }).eq('id', organization.id);
            }

            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInvite = async () => {
        const email = window.prompt("Enter the email address of the team member you wish to invite:");
        if (!email) return;
        
        if (!organization?.id) {
            alert("You must be part of an organization to invite members.");
            return;
        }

        try {
            const response = await fetch('/api/lex-pro/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role: 'Member', organizationId: organization.id })
            });
            const data = await response.json();
            if (data.success) {
                alert(`Invitation successfully sent to ${email}`);
            } else {
                alert(`Failed to send invite: ${data.error}`);
            }
        } catch (error) {
            alert('An error occurred while sending the invite.');
        }
    };

    const handleUpgrade = async () => {
        try {
            const response = await fetch('/api/lex-pro/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile?.email || 'user@example.com', planId: 'lex_pro_enterprise' })
            });
            const data = await response.json();
            if (data.success) {
                alert(`Order Created! ID: ${data.orderId}. (Razorpay SDK pop-up will mount here in production).`);
            } else {
                alert(`Checkout failed: ${data.error}`);
            }
        } catch (error) {
            alert('An error occurred during checkout.');
        }
    };

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 min-h-[calc(100vh-8rem)]">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0 space-y-2">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-blue-400" />
                    Platform Settings
                </h2>
                
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <User className="w-5 h-5" /> My Profile
                </button>
                <button 
                    onClick={() => setActiveTab('organization')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'organization' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Building className="w-5 h-5" /> Organization
                </button>
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'team' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Users className="w-5 h-5" /> Team Management
                </button>
                <button 
                    onClick={() => setActiveTab('billing')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'billing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <CreditCard className="w-5 h-5" /> Billing & Plan
                </button>
                <button 
                    onClick={() => setActiveTab('developer')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'developer' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Code className="w-5 h-5" /> Developer API
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                
                {activeTab === 'profile' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 space-y-6">
                        <div className="border-b border-white/10 pb-6">
                            <h3 className="text-2xl font-bold text-white">My Profile</h3>
                            <p className="text-gray-400 mt-1">Manage your personal account settings and preferences.</p>
                        </div>
                        
                        <div className="space-y-4 max-w-xl">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Full Name</label>
                                <input 
                                    type="text" 
                                    value={profile?.full_name || ''} 
                                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email Address (Read Only)</label>
                                <input 
                                    type="email" 
                                    value={profile?.email || ''} 
                                    disabled
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Platform Role</label>
                                <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl w-fit">
                                    <Shield className="w-4 h-4" />
                                    {profile?.role || 'User'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Profile Changes
                            </Button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'organization' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 space-y-6">
                        <div className="border-b border-white/10 pb-6">
                            <h3 className="text-2xl font-bold text-white">Organization Details</h3>
                            <p className="text-gray-400 mt-1">Manage your firm or company workspace details.</p>
                        </div>
                        
                        {organization ? (
                            <div className="space-y-4 max-w-xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Firm / Company Name</label>
                                    <input 
                                        type="text" 
                                        value={organization.name || ''} 
                                        onChange={(e) => setOrganization({...organization, name: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Organization Type</label>
                                    <select 
                                        value={organization.type || ''}
                                        onChange={(e) => setOrganization({...organization, type: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                                    >
                                        <option value="Law Firm">Law Firm</option>
                                        <option value="CA Practice">CA Practice</option>
                                        <option value="CS Practice">CS Practice</option>
                                        <option value="Business">Business / Enterprise</option>
                                    </select>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Update Organization
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 flex flex-col items-center justify-center text-center">
                                <Building className="w-12 h-12 mb-4 opacity-50" />
                                <h4 className="font-bold mb-2">No Organization Found</h4>
                                <p className="text-sm opacity-80 mb-4">You are currently using a personal account. Upgrade to a business plan to create an organization.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'team' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 space-y-6">
                        <div className="border-b border-white/10 pb-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Team Management</h3>
                                <p className="text-gray-400 mt-1">Manage access for your partners and associates.</p>
                            </div>
                            <Button onClick={handleInvite} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Invite Member
                            </Button>
                        </div>
                        
                        {teamMembers.length > 0 ? (
                            <div className="space-y-3">
                                {teamMembers.map((member, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                {(member.full_name || 'U')[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{member.full_name || 'Unknown User'}</div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> {member.role || 'Member'}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10">Remove</Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No team members found.</p>
                        )}
                    </motion.div>
                )}

                {activeTab === 'billing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 space-y-6">
                        <div className="border-b border-white/10 pb-6">
                            <h3 className="text-2xl font-bold text-white">Billing & Subscription</h3>
                            <p className="text-gray-400 mt-1">Manage your active Lex Pro Enterprise plan.</p>
                        </div>
                        
                        <div className="p-6 bg-gradient-to-br from-black/60 to-blue-950/20 border border-blue-500/20 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CreditCard className="w-32 h-32 text-blue-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                    Active Plan
                                </div>
                                <h4 className="text-3xl font-black text-white mb-2">Lex Pro Enterprise</h4>
                                <p className="text-gray-400 mb-6 max-w-md">Unlimited bulk document generation, 50 team seats, and premium AI Risk Analysis.</p>
                                
                                <div className="flex gap-4">
                                    <Button onClick={handleUpgrade} className="bg-white text-black hover:bg-gray-200">
                                        Manage Subscription
                                    </Button>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                                        View Invoices
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'developer' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 space-y-6">
                        <div className="border-b border-white/10 pb-6">
                            <h3 className="text-2xl font-bold text-white">Developer API & Webhooks</h3>
                            <p className="text-gray-400 mt-1">Integrate Lex Pro Enterprise with your internal CRMs or workflows.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Code className="w-5 h-5 text-blue-400" />
                                    Secret API Key
                                </h4>
                                <p className="text-sm text-gray-400 mb-4">Use this key to authenticate REST API requests (e.g., generating contracts programmatically).</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-mono flex items-center blur-sm hover:blur-none transition-all cursor-crosshair">
                                        sk_lex_pro_************************9f2
                                    </div>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                                        Regenerate Key
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Webhook className="w-5 h-5 text-blue-400" />
                                    Execution Webhooks
                                </h4>
                                <p className="text-sm text-gray-400 mb-4">Ping a URL whenever a counterparty successfully signs a document.</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input 
                                        type="url" 
                                        placeholder="https://your-server.com/lex-webhook"
                                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                    <Button className="bg-white text-black hover:bg-gray-200 min-w-[140px]">
                                        Save Endpoint
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
