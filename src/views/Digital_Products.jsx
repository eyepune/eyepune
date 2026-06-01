'use client';

import React, { useState, useEffect } from 'react';
import GlowCard from '@/components/shared/GlowCard';
import Link from 'next/link';
import SEOHead from '@/components/seo/SEOHead';

export default function Digital_Products() {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch('https://ipapi.co/currency/');
        const curr = await response.text();
        const supported = ['USD', 'INR', 'EUR', 'GBP'];
        if (supported.includes(curr.trim())) {
          setCurrency(curr.trim());
        }
      } catch (error) {
        // Fallback to timezone heuristic if adblocker blocks API
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz.includes('Kolkata') || tz.includes('Calcutta')) setCurrency('INR');
          else if (tz.includes('London')) setCurrency('GBP');
          else if (tz.includes('Europe')) setCurrency('EUR');
        } catch (e) {}
      }
    };
    fetchCurrency();
  }, []);

  const getPrice = (prices) => {
    return prices[currency] || prices['USD'];
  };

  const products = [
    {
      id: 'prod_agency_os',
      name: 'Agency Operating System',
      category: 'Notion Template',
      description: 'The exact Notion workspace we use to run EyE PunE. Includes project management, client portals, and CRM.',
      prices: {
        USD: { symbol: '$', amount: 49 },
        INR: { symbol: '₹', amount: 3999 },
        EUR: { symbol: '€', amount: 45 },
        GBP: { symbol: '£', amount: 39 }
      },
      link: '#', // Razorpay Payment Link will go here
      icon: '🧠',
      color: 'from-purple-600 to-indigo-900',
    },
    {
      id: 'prod_email_templates',
      name: 'B2B Cold Email Playbook',
      category: 'Sales Assets',
      description: 'Our highest-converting cold email sequences that generated over $100k in pipeline for our B2B clients.',
      prices: {
        USD: { symbol: '$', amount: 29 },
        INR: { symbol: '₹', amount: 2499 },
        EUR: { symbol: '€', amount: 27 },
        GBP: { symbol: '£', amount: 24 }
      },
      link: '#', // Razorpay Payment Link will go here
      icon: '✉️',
      color: 'from-blue-500 to-sky-700',
    },
    {
      id: 'prod_seo_blueprint',
      name: 'Programmatic SEO Blueprint',
      category: 'Growth Strategy',
      description: 'A step-by-step technical guide to setting up automated, AI-driven programmatic SEO for global scale.',
      prices: {
        USD: { symbol: '$', amount: 99 },
        INR: { symbol: '₹', amount: 7999 },
        EUR: { symbol: '€', amount: 92 },
        GBP: { symbol: '£', amount: 79 }
      },
      link: '#', // Razorpay Payment Link will go here
      icon: '🚀',
      color: 'from-emerald-500 to-green-700',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-24 pb-16">
      <SEOHead 
        title="Premium B2B Digital Assets & Templates"
        description="Download EyE PunE's proprietary digital assets. Get instant access to our Agency OS, B2B Cold Email Playbooks, and Programmatic SEO Blueprints."
        keywords="B2B digital products, cold email templates, programmatic SEO blueprint, Notion agency OS, business growth assets"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm mb-4 block">Digital Assets</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Templates & Playbooks</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Skip the trial and error. Instantly download the exact systems, templates, and strategies we use to scale our global B2B clients.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const currentPrice = getPrice(product.prices);
            return (
              <div key={product.id} className="h-full flex flex-col">
                <GlowCard className="h-full flex flex-col p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 shadow-xl relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${product.color} opacity-10 rounded-bl-full transform translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125`} />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="text-5xl bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                      {product.icon}
                    </div>
                    <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white">{currentPrice.symbol}{currentPrice.amount}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase">{currency}</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mb-6 flex-grow">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 block">
                      {product.category}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {product.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">What&apos;s included:</p>
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                          <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <a 
                      href={product.link}
                      className="w-full inline-flex items-center justify-center px-6 py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                    >
                      Get Instant Access
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </a>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4 flex items-center justify-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                      Secure payment via Razorpay
                    </p>
                  </div>
                </GlowCard>
              </div>
            );
          })}
        </div>

        {/* Custom Solution CTA */}
        <div className="mt-24 p-1 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          <div className="bg-white dark:bg-slate-900 rounded-[23px] p-8 md:p-12 text-center relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                 Need a Custom Digital Asset?
               </h2>
               <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                 We can build bespoke Notion workspaces, automated CRM pipelines, and custom playbooks tailored exactly to your business model.
               </p>
               <Link href="/Contact" className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                 Let&apos;s Talk Custom Solutions
               </Link>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
