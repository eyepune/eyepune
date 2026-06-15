import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TestimonialDisplay({ serviceFilter = null, featured = false, limit = 6, isMarquee = false }) {
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    const { data: testimonials = [], isLoading } = useQuery({
        queryKey: ['testimonials', serviceFilter, featured],
        queryFn: async () => {
            let query = supabase.from('testimonials').select('*').eq('status', 'approved');
            
            if (featured) query = query.eq('featured', true);
            if (serviceFilter) query = query.eq('service', serviceFilter);
            
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;
            
            let results = data || [];

            // Enforce explicit ordering rules as requested
            const getAndRemove = (keyword) => {
                const idx = results.findIndex(t => 
                    t.customer_name?.toLowerCase().includes(keyword) || 
                    t.customer_company?.toLowerCase().includes(keyword)
                );
                if (idx > -1) return results.splice(idx, 1)[0];
                return null;
            };

            const vinoth = getAndRemove('vinoth');
            const karry = getAndRemove('karry'); // "karry on 2"
            const nostalgia = getAndRemove('nostalgia'); // "nostalgia 90s 4th"
            const deepa = getAndRemove('deepa');

            if (vinoth) results.unshift(vinoth);
            if (karry) results.splice(1, 0, karry);
            if (nostalgia) {
                const insertIdx = Math.min(results.length, 3);
                results.splice(insertIdx, 0, nostalgia);
            }
            if (deepa) results.push(deepa);

            return results.slice(0, limit);
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

    const TestimonialCard = ({ testimonial }) => (
        <Card 
            className="h-full hover:shadow-lg transition-shadow cursor-pointer border-white/10 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedTestimonial(testimonial)}
        >
            <CardContent className="p-6 flex flex-col h-full">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${
                                i < testimonial.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-600'
                            }`}
                        />
                    ))}
                </div>

                {/* Testimonial text */}
                <div className="relative mb-6 flex-1">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-red-600/20" />
                    <p className="text-gray-300 relative z-10 line-clamp-4">
                        {testimonial.content}
                    </p>
                </div>

                {/* Author info */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-auto">
                    {testimonial.customer_image ? (
                        <img
                            src={testimonial.customer_image}
                            alt={testimonial.customer_name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                            {testimonial.customer_name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-white">{testimonial.customer_name}</p>
                        {testimonial.customer_title && testimonial.customer_company && (
                            <p className="text-sm text-gray-400">
                                {testimonial.customer_title} at {testimonial.customer_company}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const marqueeItems = [...testimonials, ...testimonials];

    return (
        <>
            {isMarquee ? (
                <div className="relative w-full overflow-hidden py-4 -mx-6 px-6 lg:mx-0 lg:px-0">
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/90 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/90 to-transparent z-10 pointer-events-none" />
                    
                    <div className="flex whitespace-nowrap">
                        <motion.div 
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                            className="flex gap-6 items-stretch pr-6"
                        >
                            {marqueeItems.map((testimonial, index) => (
                                <div key={`${testimonial.id}-${index}`} className="w-[320px] md:w-[420px] whitespace-normal shrink-0">
                                    <TestimonialCard testimonial={testimonial} />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <TestimonialCard testimonial={testimonial} />
                        </motion.div>
                    ))}
                </div>
            )}

            <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] text-white border-white/10">
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
                                            {selectedTestimonial.customer_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{selectedTestimonial.customer_name}</p>
                                        {selectedTestimonial.customer_title && selectedTestimonial.customer_company && (
                                            <p className="text-sm text-gray-400 font-normal truncate">
                                                {selectedTestimonial.customer_title} at {selectedTestimonial.customer_company}
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
                                                    : 'text-gray-600'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <div className="relative">
                                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-red-600/20" />
                                    <p className="text-gray-300 relative z-10 text-base leading-relaxed">
                                        {selectedTestimonial.content}
                                    </p>
                                </div>

                                {selectedTestimonial.service && (
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-sm text-gray-400">
                                            Service: <span className="font-medium text-white">
                                                {selectedTestimonial.service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
