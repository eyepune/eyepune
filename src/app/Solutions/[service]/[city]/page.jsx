import React from 'react';
import Link from 'next/link';
import { ArrowRight, Target, Zap, ShieldCheck, CheckCircle2, ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadMagnetForm from '@/components/seo/LeadMagnetForm';
import { pingGoogleIndexing } from '@/lib/google-indexing';

export async function generateMetadata({ params }) {
  const rawCity = params.city;
  const rawService = params.service;
  
  const city = rawCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const service = rawService.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Asynchronous ping to Google Indexing to auto-index this programmatic page when crawled/generated
  pingGoogleIndexing(`https://www.eyepune.com/Solutions/${rawService}/${rawCity}`);

  return {
    title: `Top ${service} Agency in ${city} | EyE PunE`,
    description: `Looking for the best ${service} experts in ${city}? EyE PunE engineers high-converting ${service} solutions to dominate your local market.`,
    alternates: {
      canonical: `/Solutions/${rawService}/${rawCity}`,
    }
  };
}

export default function SEOServiceLocationPage({ params }) {
  const rawCity = params.city;
  const rawService = params.service;
  
  const city = rawCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const service = rawService.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <main className="min-h-screen pt-32 pb-20 relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/30 border border-red-500/30 text-red-500 text-sm font-semibold mb-6">
            <Target className="w-4 h-4" />
            <span>Premium {service} in {city}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.2] tracking-tight">
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">{service}</span> Partner For <span className="text-white">{city}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop losing ground to local competitors in <strong>{city}</strong>. We build world-class <strong>{service}</strong> systems designed to completely dominate your market and capture every lead.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/Contact">
              <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold h-14 px-8 text-lg rounded-full">
                Get Your {city} Strategy Audit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-red-950/30 flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Local {city} Expertise</h3>
              <p className="text-gray-400 leading-relaxed">We optimize your {service} architecture specifically for the consumer behaviors in {city}.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-red-950/30 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise-Grade Tech</h3>
              <p className="text-gray-400 leading-relaxed">Leverage Silicon Valley technology infrastructure to power your {service} operations.</p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-red-950/30 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">ROI-Obsessed Execution</h3>
              <p className="text-gray-400 leading-relaxed">Our {service} campaigns are built purely to generate scalable revenue.</p>
            </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-red-950/40 to-black border border-red-900/30 relative overflow-hidden mb-24">
          <h2 className="text-2xl sm:text-4xl font-black mb-4 relative z-10 leading-tight">
            Ready to upgrade your <span className="text-red-500">{service}</span> in {city}?
          </h2>
          <p className="text-base md:text-xl text-gray-400 mb-8 relative z-10">
            Book a 15-minute discovery call and we'll map out a custom blueprint for you.
          </p>
          <Link href="/Booking">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold h-14 px-8 text-lg rounded-full shadow-2xl hover:scale-105 transition-all">
              Book Your Free Consultation Now
            </Button>
          </Link>
        </div>

      </div>
    </main>
  );
}
