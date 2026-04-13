import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PackageCard({ pkg, onSelect, index }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative rounded-3xl p-8 h-full flex flex-col ${
                pkg.popular 
                    ? 'bg-gradient-to-br from-red-950/50 to-red-900/30 border-2 border-red-500/30' 
                    : 'bg-white/[0.02] border border-white/[0.08]'
            }`}
        >
            {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-500 rounded-full text-white text-sm font-medium flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Most Popular
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-gray-400 text-sm capitalize">
                    {pkg.category?.replace(/_/g, ' ')}
                </p>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{formatPrice(pkg.price)}</span>
                </div>
                {pkg.delivery_days && (
                    <p className="text-gray-500 text-sm mt-2">
                        Delivery in {pkg.delivery_days} days
                    </p>
                )}
            </div>

            <div className="flex-grow mb-8">
                <p className="text-gray-400 text-sm font-medium mb-4">What's included:</p>
                <ul className="space-y-3">
                    {pkg.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Button
                onClick={() => onSelect(pkg)}
                className={`w-full py-6 rounded-xl text-base font-medium transition-all ${
                    pkg.popular
                        ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
            >
                Select Package
            </Button>
        </motion.div>
    );
}