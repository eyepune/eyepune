'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { createPageUrl } from "@/utils";

export default function ROICalculator() {
    const [monthlyTraffic, setMonthlyTraffic] = useState(5000);
    const [conversionRate, setConversionRate] = useState(1.5);
    const [averageOrderValue, setAverageOrderValue] = useState(5000);
    
    // Projected improvements
    const [projectedRev, setProjectedRev] = useState(0);
    const [currentRev, setCurrentRev] = useState(0);
    const [uplift, setUplift] = useState(0);

    useEffect(() => {
        const current = monthlyTraffic * (conversionRate / 100) * averageOrderValue;
        // Assume EyE PunE can improve conversion by 50% and traffic by 30%
        const projected = (monthlyTraffic * 1.3) * ((conversionRate * 1.5) / 100) * averageOrderValue;
        
        setCurrentRev(current);
        setProjectedRev(projected);
        setUplift(projected - current);
    }, [monthlyTraffic, conversionRate, averageOrderValue]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-20 px-6">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                    <Calculator className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-red-400">Growth Calculator</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Calculate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Revenue Potential</span>
                </h2>
                <p className="text-gray-500 max-w-xl mx-auto">
                    See how a conversion-optimized strategy can transform your existing traffic into a high-performance growth engine.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Inputs */}
                <div className="space-y-10 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Monthly Website Visitors</Label>
                            <span className="text-white font-black">{monthlyTraffic.toLocaleString()}</span>
                        </div>
                        <Slider 
                            value={[monthlyTraffic]} 
                            onValueChange={([val]) => setMonthlyTraffic(val)} 
                            max={50000} 
                            step={100}
                            className="py-4"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Current Conversion Rate (%)</Label>
                            <span className="text-white font-black">{conversionRate}%</span>
                        </div>
                        <Slider 
                            value={[conversionRate]} 
                            onValueChange={([val]) => setConversionRate(val)} 
                            max={10} 
                            step={0.1}
                            className="py-4"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Average Deal/Order Value (₹)</Label>
                            <span className="text-white font-black">{formatCurrency(averageOrderValue)}</span>
                        </div>
                        <Input 
                            type="number" 
                            value={averageOrderValue}
                            onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                            className="bg-black/40 border-white/10 text-white h-12 rounded-xl"
                        />
                    </div>
                </div>

                {/* Results Card */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-500 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                    <div className="relative p-10 rounded-[3rem] bg-[#0c0c0c] border border-white/[0.08] shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <TrendingUp className="w-40 h-40" />
                        </div>
                        
                        <div className="space-y-8 relative z-10">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Current Monthly Revenue</p>
                                <p className="text-3xl font-black text-white/60 line-through decoration-red-500/50">{formatCurrency(currentRev)}</p>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <p className="text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <Zap className="w-3 h-3 animate-pulse" /> Projected Monthly Revenue
                                </p>
                                <p className="text-6xl font-black text-white tracking-tighter">{formatCurrency(projectedRev)}</p>
                                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                    <ArrowRight className="w-3 h-3 text-green-500 -rotate-45" />
                                    <span className="text-green-400 text-[10px] font-black uppercase">+{formatCurrency(uplift)} Monthly Growth</span>
                                </div>
                            </div>

                            <div className="pt-8">
                                <Link href={createPageUrl("AI_Assessment")}>
                                    <Button className="w-full bg-white text-black hover:bg-gray-100 h-14 rounded-2xl font-black text-lg shadow-xl shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Unlock This Growth <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest font-bold">
                                    Based on EyE PunE Average Performance Metrics
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
