import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TestimonialDisplay({ serviceFilter = null, featured = false, limit = 6 }) {
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    const { data: testimonials = [], isLoading } = useQuery({
        queryKey: ['testimonials', serviceFilter, featured],
        queryFn: async () => {
            let query = { status: 'approved' };
            if (featured) query.featured = true;
            if (serviceFilter) query.service_used = serviceFilter;
            
            return await base44.entities.Testimonial.filter(query, '-created_date', limit);
        }
    });

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-20 bg-muted rounded mb-4" />
                            <div className="h-4 bg-muted rounded w-3/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (testimonials.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No testimonials available yet.
            </div>
        );
    }

    return (
        <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                    <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card 
                            className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setSelectedTestimonial(testimonial)}
                        >
                            <CardContent className="p-6">
                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < testimonial.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Testimonial text */}
                            <div className="relative mb-6">
                                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-red-600/20" />
                                <p className="text-muted-foreground relative z-10 line-clamp-4">
                                    {testimonial.testimonial_text}
                                </p>
                            </div>

                            {/* Author info */}
                            <div className="flex items-center gap-3 pt-4 border-t">
                                {testimonial.customer_image ? (
                                    <img
                                        src={testimonial.customer_image}
                                        alt={testimonial.customer_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                                        {testimonial.customer_name[0].toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold">{testimonial.customer_name}</p>
                                    {testimonial.position && testimonial.company && (
                                        <p className="text-sm text-muted-foreground">
                                            {testimonial.position} at {testimonial.company}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
            </div>

            <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedTestimonial && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 pr-8">
                                    {selectedTestimonial.customer_image ? (
                                        <img
                                            src={selectedTestimonial.customer_image}
                                            alt={selectedTestimonial.customer_name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {selectedTestimonial.customer_name[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{selectedTestimonial.customer_name}</p>
                                        {selectedTestimonial.position && selectedTestimonial.company && (
                                            <p className="text-sm text-muted-foreground font-normal truncate">
                                                {selectedTestimonial.position} at {selectedTestimonial.company}
                                            </p>
                                        )}
                                    </div>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < selectedTestimonial.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <div className="relative">
                                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-red-600/20" />
                                    <p className="text-muted-foreground relative z-10 text-base leading-relaxed">
                                        {selectedTestimonial.testimonial_text}
                                    </p>
                                </div>

                                {selectedTestimonial.service_used && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">
                                            Service: <span className="font-medium text-foreground">
                                                {selectedTestimonial.service_used.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}