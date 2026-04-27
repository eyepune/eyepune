import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Check, DollarSign, Package, Plus, TrendingUp } from 'lucide-react';
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";

function Admin_PackageBuilder() {
    const [formData, setFormData] = useState({
        businessType: '',
        challenges: '',
        budget: '',
        industry: ''
    });
    const [recommendations, setRecommendations] = useState(null);
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);

    const queryClient = useQueryClient();

    const generateMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('generatePackageRecommendations', data);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                setRecommendations(data.recommendations);
                toast.success('AI recommendations generated!');
            }
        },
        onError: (error) => {
            toast.error('Failed to generate recommendations');
        }
    });

    const createPackagesMutation = useMutation({
        mutationFn: async (packages) => {
            return Promise.all(
                packages.map(pkg => base44.entities.Pricing_Plan.create({
                    name: pkg.name,
                    description: pkg.description,
                    price: pkg.price,
                    features: pkg.features,
                    billing_cycle: pkg.billing_cycle,
                    category: pkg.category,
                    is_popular: pkg.is_popular,
                    is_active: true
                }))
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pricing-plans']);
            toast.success('Packages created successfully!');
            setSelectedPackages([]);
        }
    });

    const createAddonsMutation = useMutation({
        mutationFn: async (addons) => {
            return Promise.all(
                addons.map(addon => base44.entities.ServiceAddon.create({
                    name: addon.name,
                    description: addon.description,
                    price: addon.price,
                    category: addon.category,
                    compatible_with: addon.compatible_with,
                    is_active: true
                }))
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['service-addons']);
            toast.success('Add-ons created successfully!');
            setSelectedAddons([]);
        }
    });

    const handleGenerate = (e) => {
        e.preventDefault();
        generateMutation.mutate(formData);
    };

    const togglePackageSelection = (pkg) => {
        setSelectedPackages(prev => {
            const exists = prev.find(p => p.name === pkg.name);
            if (exists) {
                return prev.filter(p => p.name !== pkg.name);
            }
            return [...prev, pkg];
        });
    };

    const toggleAddonSelection = (addon) => {
        setSelectedAddons(prev => {
            const exists = prev.find(a => a.name === addon.name);
            if (exists) {
                return prev.filter(a => a.name !== addon.name);
            }
            return [...prev, addon];
        });
    };

    const handleCreateSelected = () => {
        if (selectedPackages.length > 0) {
            createPackagesMutation.mutate(selectedPackages);
        }
        if (selectedAddons.length > 0) {
            createAddonsMutation.mutate(selectedAddons);
        }
    };

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Sparkles className="w-6 h-6 text-red-600" />
                        </div>
                        <h1 className="text-4xl font-bold">AI Package Builder</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Let AI suggest optimized packages and add-ons based on business context
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Input Form */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Context</CardTitle>
                                <CardDescription>
                                    Provide details to get AI-powered recommendations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleGenerate} className="space-y-4">
                                    <div>
                                        <Label>Business Type *</Label>
                                        <Input
                                            value={formData.businessType}
                                            onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                                            placeholder="e.g., E-commerce, SaaS, Consulting"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>Main Challenges *</Label>
                                        <Textarea
                                            value={formData.challenges}
                                            onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                                            placeholder="What problems do they need to solve?"
                                            className="min-h-[100px]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>Budget Range</Label>
                                        <Input
                                            value={formData.budget}
                                            onChange={(e) => setFormData({...formData, budget: e.target.value})}
                                            placeholder="e.g., ₹50K-2L, Flexible"
                                        />
                                    </div>

                                    <div>
                                        <Label>Industry</Label>
                                        <Input
                                            value={formData.industry}
                                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                            placeholder="e.g., Healthcare, Tech, Retail"
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-red-600 hover:bg-red-700"
                                        disabled={generateMutation.isPending}
                                    >
                                        {generateMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Generate Packages
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {!recommendations ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center h-full min-h-[500px]"
                                >
                                    <div className="text-center text-muted-foreground">
                                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">Enter business context to generate packages</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="recommendations"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Strategy Overview */}
                                    {recommendations.overall_strategy && (
                                        <Card className="border-red-200 dark:border-red-800">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-red-600" />
                                                    Strategy Overview
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground">{recommendations.overall_strategy}</p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Packages */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold">Recommended Packages</h3>
                                            {selectedPackages.length > 0 && (
                                                <Badge className="bg-red-600">
                                                    {selectedPackages.length} selected
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {recommendations.packages?.map((pkg, idx) => {
                                                const isSelected = selectedPackages.find(p => p.name === pkg.name);
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                    >
                                                        <Card 
                                                            className={`cursor-pointer transition-all hover:shadow-lg ${
                                                                isSelected ? 'border-2 border-red-600' : ''
                                                            }`}
                                                            onClick={() => togglePackageSelection(pkg)}
                                                        >
                                                            <CardHeader>
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                                                        <div className="flex gap-2 mt-2">
                                                                            <Badge variant="outline">{pkg.category}</Badge>
                                                                            {pkg.is_popular && (
                                                                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                                                                                    Popular
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-2xl font-bold text-red-600">
                                                                            ₹{pkg.price.toLocaleString()}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {pkg.billing_cycle}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <p className="text-sm text-muted-foreground mb-3">
                                                                    {pkg.description}
                                                                </p>
                                                                <div className="space-y-1.5">
                                                                    {pkg.features?.slice(0, 4).map((feature, fidx) => (
                                                                        <div key={fidx} className="flex items-start gap-2 text-sm">
                                                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                                            <span>{feature}</span>
                                                                        </div>
                                                                    ))}
                                                                    {pkg.features?.length > 4 && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            +{pkg.features.length - 4} more features
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {pkg.reasoning && (
                                                                    <div className="mt-3 pt-3 border-t">
                                                                        <p className="text-xs text-muted-foreground italic">
                                                                            💡 {pkg.reasoning}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Add-ons */}
                                    {recommendations.addons?.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold">Recommended Add-ons</h3>
                                                {selectedAddons.length > 0 && (
                                                    <Badge className="bg-red-600">
                                                        {selectedAddons.length} selected
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                {recommendations.addons.map((addon, idx) => {
                                                    const isSelected = selectedAddons.find(a => a.name === addon.name);
                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3 + idx * 0.05 }}
                                                        >
                                                            <Card
                                                                className={`cursor-pointer transition-all hover:shadow-md h-full ${
                                                                    isSelected ? 'border-2 border-red-600' : ''
                                                                }`}
                                                                onClick={() => toggleAddonSelection(addon)}
                                                            >
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <h4 className="font-semibold text-sm">{addon.name}</h4>
                                                                        <p className="font-bold text-red-600">
                                                                            ₹{addon.price.toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mb-2">
                                                                        {addon.description}
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {addon.compatible_with?.map((cat, cidx) => (
                                                                            <Badge key={cidx} variant="secondary" className="text-xs">
                                                                                {cat}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Create Button */}
                                    {(selectedPackages.length > 0 || selectedAddons.length > 0) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="sticky bottom-6 z-10"
                                        >
                                            <Card className="border-2 border-red-600 bg-card/95 backdrop-blur">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold">
                                                                {selectedPackages.length} packages, {selectedAddons.length} add-ons selected
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Ready to create in your catalog
                                                            </p>
                                                        </div>
                                                        <Button
                                                            onClick={handleCreateSelected}
                                                            className="bg-red-600 hover:bg-red-700"
                                                            disabled={createPackagesMutation.isPending || createAddonsMutation.isPending}
                                                        >
                                                            {(createPackagesMutation.isPending || createAddonsMutation.isPending) ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Creating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Plus className="w-4 h-4 mr-2" />
                                                                    Create Selected
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminPackageBuilderPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_PackageBuilder />
            </AdminLayout>
        </AdminGuard>
    );
}