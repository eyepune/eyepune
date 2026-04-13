import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { User, Building2, Bell, Upload, Mail, MessageSquare } from 'lucide-react';

export default function Profile() {
    const queryClient = useQueryClient();
    const [uploadingImage, setUploadingImage] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: profile } = useQuery({
        queryKey: ['user-profile', user?.email],
        queryFn: async () => {
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            return profiles[0] || null;
        },
        enabled: !!user
    });

    const [formData, setFormData] = useState({});
    const [nameValue, setNameValue] = useState('');
    const [nameSaved, setNameSaved] = useState(false);

    React.useEffect(() => {
        if (user) setNameValue(user.full_name || '');
    }, [user]);

    const handleNameSave = async () => {
        await base44.auth.updateMe({ full_name: nameValue });
        setNameSaved(true);
        queryClient.invalidateQueries(['current-user']);
        setTimeout(() => setNameSaved(false), 2500);
    };

    React.useEffect(() => {
        if (profile) {
            setFormData(profile);
        } else if (user) {
            setFormData({
                user_email: user.email,
                phone: '',
                company: '',
                position: '',
                bio: '',
                profile_image: '',
                website: '',
                linkedin: '',
                twitter: '',
                business_name: '',
                business_type: '',
                business_size: '',
                industry: '',
                address: '',
                city: '',
                state: '',
                country: 'India',
                notification_preferences: {
                    email_marketing: true,
                    email_updates: true,
                    email_reminders: true,
                    whatsapp_notifications: true,
                    project_updates: true,
                    milestone_reminders: true,
                    invoice_reminders: true
                }
            });
        }
    }, [profile, user]);

    const handleNotificationToggle = (key) => {
        setFormData({
            ...formData,
            notification_preferences: {
                ...(formData.notification_preferences || {}),
                [key]: !(formData.notification_preferences?.[key] ?? true)
            }
        });
    };

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            if (profile) {
                return await base44.entities.UserProfile.update(profile.id, data);
            } else {
                return await base44.entities.UserProfile.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user-profile']);
        }
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, profile_image: file_url });
        setUploadingImage(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Please log in to view your profile</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-20">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
                    <p className="text-muted-foreground mb-8">Manage your personal and business information</p>

                    <Tabs defaultValue="personal" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="personal">Personal Info</TabsTrigger>
                            <TabsTrigger value="business">Business Details</TabsTrigger>
                            <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit}>
                            <TabsContent value="personal" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Personal Information
                                        </CardTitle>
                                        <CardDescription>Update your personal details and profile picture</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Profile image */}
                                        <div>
                                            <Label>Profile Picture</Label>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                    {formData.profile_image ? (
                                                        <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-10 h-10 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <input
                                                        type="file"
                                                        id="profile-image"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById('profile-image').click()}
                                                        disabled={uploadingImage}
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                             <div>
                                                 <Label>Full Name</Label>
                                                 <div className="flex gap-2 mt-1">
                                                     <Input
                                                         value={nameValue}
                                                         onChange={(e) => setNameValue(e.target.value)}
                                                         placeholder="Your full name"
                                                     />
                                                     <Button type="button" onClick={handleNameSave} disabled={!nameValue || nameValue === user.full_name} variant="outline">
                                                         {nameSaved ? '✓ Saved' : 'Save'}
                                                     </Button>
                                                 </div>
                                             </div>
                                             <div>
                                                 <Label>Email</Label>
                                                 <Input value={user.email} disabled className="mt-1" />
                                             </div>
                                         </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Phone</Label>
                                                <Input
                                                    value={formData.phone || ''}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>
                                            <div>
                                                <Label>Position</Label>
                                                <Input
                                                    value={formData.position || ''}
                                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                    placeholder="Your role"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Bio</Label>
                                            <Textarea
                                                value={formData.bio || ''}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                placeholder="Tell us about yourself"
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <Label>Website</Label>
                                                <Input
                                                    value={formData.website || ''}
                                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                    placeholder="https://yoursite.com"
                                                />
                                            </div>
                                            <div>
                                                <Label>LinkedIn</Label>
                                                <Input
                                                    value={formData.linkedin || ''}
                                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                                    placeholder="linkedin.com/in/username"
                                                />
                                            </div>
                                            <div>
                                                <Label>Twitter</Label>
                                                <Input
                                                    value={formData.twitter || ''}
                                                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                                    placeholder="@username"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="business" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="w-5 h-5" />
                                            Business Information
                                        </CardTitle>
                                        <CardDescription>Update your business and company details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Company Name</Label>
                                                <Input
                                                    value={formData.company || ''}
                                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                    placeholder="Your company"
                                                />
                                            </div>
                                            <div>
                                                <Label>Business Name</Label>
                                                <Input
                                                    value={formData.business_name || ''}
                                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                                    placeholder="Business name"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Business Type</Label>
                                                <Input
                                                    value={formData.business_type || ''}
                                                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                                    placeholder="e.g., E-commerce, SaaS"
                                                />
                                            </div>
                                            <div>
                                                <Label>Company Size</Label>
                                                <Select
                                                    value={formData.business_size || ''}
                                                    onValueChange={(value) => setFormData({ ...formData, business_size: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select size" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1-10">1-10 employees</SelectItem>
                                                        <SelectItem value="11-50">11-50 employees</SelectItem>
                                                        <SelectItem value="51-200">51-200 employees</SelectItem>
                                                        <SelectItem value="201-500">201-500 employees</SelectItem>
                                                        <SelectItem value="500+">500+ employees</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Industry</Label>
                                            <Input
                                                value={formData.industry || ''}
                                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                placeholder="e.g., Technology, Retail, Healthcare"
                                            />
                                        </div>

                                        <div>
                                            <Label>Address</Label>
                                            <Textarea
                                                value={formData.address || ''}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Street address"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <Label>City</Label>
                                                <Input
                                                    value={formData.city || ''}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div>
                                                <Label>State</Label>
                                                <Input
                                                    value={formData.state || ''}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    placeholder="State"
                                                />
                                            </div>
                                            <div>
                                                <Label>Country</Label>
                                                <Input
                                                    value={formData.country || 'India'}
                                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                    placeholder="Country"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="preferences" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bell className="w-5 h-5" />
                                            Notification Preferences
                                        </CardTitle>
                                        <CardDescription>Manage how you receive updates</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Email Notifications */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Mail className="w-5 h-5 text-muted-foreground" />
                                                <h3 className="font-semibold">Email Notifications</h3>
                                            </div>
                                            <div className="space-y-4 ml-7">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium">Marketing Emails</Label>
                                                        <p className="text-sm text-muted-foreground">Receive promotional content and special offers</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.notification_preferences?.email_marketing ?? true}
                                                        onCheckedChange={() => handleNotificationToggle('email_marketing')}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium">Product Updates</Label>
                                                        <p className="text-sm text-muted-foreground">Get notified about new features and improvements</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.notification_preferences?.email_updates ?? true}
                                                        onCheckedChange={() => handleNotificationToggle('email_updates')}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium">Reminders</Label>
                                                        <p className="text-sm text-muted-foreground">Booking confirmations and deadline reminders</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.notification_preferences?.email_reminders ?? true}
                                                        onCheckedChange={() => handleNotificationToggle('email_reminders')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* WhatsApp Notifications */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                                                <h3 className="font-semibold">WhatsApp Notifications</h3>
                                            </div>
                                            <div className="space-y-4 ml-7">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium">Important Updates</Label>
                                                        <p className="text-sm text-muted-foreground">Receive critical notifications via WhatsApp</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.notification_preferences?.whatsapp_notifications ?? true}
                                                        onCheckedChange={() => handleNotificationToggle('whatsapp_notifications')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Project Notifications */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Bell className="w-5 h-5 text-muted-foreground" />
                                                <h3 className="font-semibold">Project Notifications</h3>
                                            </div>
                                            <div className="space-y-4 ml-7">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium">Project Updates</Label>
                                                        <p className="text-sm text-muted-foreground">Stay informed about project progress</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.notification_preferences?.project_updates ?? true}
                                                        onCheckedChange={() => handleNotificationToggle('project_updates')}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium">Milestone Reminders</Label>
                                                        <p className="text-sm text-muted-foreground">Get notified when milestones are due</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.notification_preferences?.milestone_reminders ?? true}
                                                        onCheckedChange={() => handleNotificationToggle('milestone_reminders')}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium">Invoice Reminders</Label>
                                                        <p className="text-sm text-muted-foreground">Payment and invoice notifications</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.notification_preferences?.invoice_reminders ?? true}
                                                        onCheckedChange={() => handleNotificationToggle('invoice_reminders')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <div className="flex justify-end gap-4">
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                            
                            {updateMutation.isSuccess && (
                                <p className="text-green-600 text-sm text-right mt-2">Profile updated successfully!</p>
                            )}
                        </form>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    );
}