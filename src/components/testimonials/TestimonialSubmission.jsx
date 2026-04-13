import React, { useState, useEffect } from 'react';
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Upload, CheckCircle, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestimonialSubmission() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_title: '',
        customer_company: '',
        content: '',
        rating: 5,
        customer_image: '',
        service: 'full_service'
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                setFormData(prev => ({
                    ...prev,
                    customer_name: currentUser.full_name || '',
                }));
            } catch {
                setUser(null);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const submitMutation = useMutation({
        mutationFn: (data) => base44.entities.Testimonial.create({ ...data, status: 'pending' }),
        onSuccess: () => {
            setIsSuccess(true);
            setFormData({
                customer_name: '',
                customer_title: '',
                customer_company: '',
                content: '',
                rating: 5,
                customer_image: '',
                service: 'full_service'
            });
        }
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, customer_image: file_url });
        setUploadingImage(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitMutation.mutate(formData);
    };

    if (checkingAuth) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
                </CardContent>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Login Required</CardTitle>
                    <CardDescription>
                        Please login to share your testimonial
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-6">
                        You need to be logged in to submit a testimonial. This helps us verify authentic feedback from our clients.
                    </p>
                    <Button 
                        onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login / Sign Up
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-12"
            >
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Thank You!</h3>
                <p className="text-muted-foreground mb-6">
                    Your testimonial has been submitted and is pending approval.
                </p>
                <Button onClick={() => setIsSuccess(false)}>Submit Another</Button>
            </motion.div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
                <CardDescription>
                    We'd love to hear about your experience working with us
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Your Name *</Label>
                            <Input
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                required
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div>
                            <Label>Company</Label>
                            <Input
                                value={formData.customer_company}
                                onChange={(e) => setFormData({ ...formData, customer_company: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Job Title</Label>
                            <Input
                                value={formData.customer_title}
                                onChange={(e) => setFormData({ ...formData, customer_title: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Service Used *</Label>
                            <Select
                                value={formData.service}
                                onValueChange={(value) => setFormData({ ...formData, service: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="social_media">Social Media Marketing</SelectItem>
                                    <SelectItem value="web_app">Website / App Development</SelectItem>
                                    <SelectItem value="ai_automation">AI Automations</SelectItem>
                                    <SelectItem value="branding">Branding & Content</SelectItem>
                                    <SelectItem value="full_service">Full Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Rating *</Label>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= formData.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label>Your Testimonial *</Label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                            className="min-h-[120px]"
                            placeholder="Tell us about your experience..."
                        />
                    </div>

                    <div>
                        <Label>Profile Photo (Optional)</Label>
                        <div className="flex items-center gap-4 mt-2">
                            {formData.customer_image && (
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                                    <img src={formData.customer_image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div>
                                <input
                                    type="file"
                                    id="customer-image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('customer-image').click()}
                                    disabled={uploadingImage}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                        {submitMutation.isPending ? 'Submitting...' : 'Submit Testimonial'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}