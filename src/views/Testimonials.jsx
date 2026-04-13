import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestimonialDisplay from "@/components/testimonials/TestimonialDisplay";
import TestimonialSubmission from "@/components/testimonials/TestimonialSubmission";

export default function Testimonials() {
    const [activeTab, setActiveTab] = useState('all');
    const [serviceFilter, setServiceFilter] = useState(null);

    return (
        <div className="min-h-screen bg-background py-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Client Success Stories
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        See how we've helped businesses like yours achieve remarkable growth
                    </p>
                </motion.div>

                {/* Testimonials tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-16">
                        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12">
                            <TabsTrigger value="all">All Testimonials</TabsTrigger>
                            <TabsTrigger value="featured">Featured</TabsTrigger>
                            <TabsTrigger value="submit">Share Yours</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <TestimonialDisplay serviceFilter={serviceFilter} limit={12} />
                        </TabsContent>

                        <TabsContent value="featured">
                            <TestimonialDisplay featured={true} serviceFilter={serviceFilter} limit={12} />
                        </TabsContent>

                        <TabsContent value="submit">
                            <div className="max-w-3xl mx-auto">
                                <TestimonialSubmission />
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>

                {/* Service filters */}
                {activeTab !== 'submit' && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-center"
                    >
                        <p className="text-muted-foreground mb-4">Filter by service:</p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {[
                                { value: null, label: 'All Services' },
                                { value: 'social_media', label: 'Social Media' },
                                { value: 'web_app', label: 'Web Development' },
                                { value: 'ai_automation', label: 'AI & Automation' },
                                { value: 'branding', label: 'Branding' },
                                { value: 'full_service', label: 'Full Service' },
                            ].map((filter) => (
                                <Button
                                    key={filter.label}
                                    variant={serviceFilter === filter.value ? 'default' : 'outline'}
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => setServiceFilter(filter.value)}
                                >
                                    {filter.label}
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}