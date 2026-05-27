import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, TrendingUp, Zap, Target, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';
import LeadMagnetForm from '@/components/seo/LeadMagnetForm';

export async function generateMetadata({ params }) {
  const rawCity = params.city;
  const city = rawCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `Elite AI Marketing & Web Development Agency in ${city} | EyE PunE`,
    description: `Looking for the top digital marketing and AI automation agency in ${city}? EyE PunE provides bespoke Next.js web development and high-converting sales systems for local businesses.`,
    alternates: {
      canonical: `/Locations/${rawCity}`,
    }
  };
}

export default function SEOLocationPage({ params }) {
  const rawCity = params.city;
  const city = rawCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <main className="min-h-screen pt-32 pb-20 relative">
      {/* Background Gradients & Effects */}
      <div className="absolute top-0 left-0 w-full h-[100vh] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2" />
        <HeroFloatingIcons />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/30 border border-red-500/30 text-red-500 text-sm font-semibold mb-6">
            <MapPin className="w-4 h-4" />
            <span>Serving {city} Businesses</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.2] md:leading-tight tracking-tight px-2">
            The Premier AI & Digital Agency For <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">{city}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Stop losing ground to local competitors in <strong>{city}</strong>. We build world-class AI automation systems, high-ticket sales funnels, and blazing-fast web applications designed to dominate your market.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/Contact">
              <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold h-14 px-8 text-lg rounded-full">
                Get Your {city} Growth Audit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Value Proposition Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24 px-4">
            <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-red-950/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hyper-Local Domination</h3>
              <p className="text-gray-400 leading-relaxed">We engineer SEO and Paid Ad campaigns tailored specifically to capture high-intent leads within {city} and surrounding areas.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-red-950/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global AI Tech Stacks</h3>
              <p className="text-gray-400 leading-relaxed">Bring Silicon Valley tech to {city}. We integrate cutting-edge AI chatbots and automated CRM workflows that save you hundreds of hours.</p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-red-950/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Revenue-First Funnels</h3>
              <p className="text-gray-400 leading-relaxed">We don't just build pretty websites. We build conversion machines designed to turn {city} traffic into loyal, paying customers.</p>
            </div>
        </div>

        {/* Dynamic SEO Lead Magnet */}
        <div className="max-w-4xl mx-auto mb-24 px-4">
          <div className="rounded-3xl bg-gradient-to-r from-red-950/50 to-black border border-red-500/30 p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-3/5 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-4 uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" /> Free PDF Download
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                  The {city} Digital Growth Blueprint
                </h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                  Steal the exact framework we use to scale businesses locally and globally. Enter your email to get instant access to our playbook.
                </p>
                <LeadMagnetForm keyword={city} />
              </div>
              
              <div className="md:w-2/5 flex justify-center">
                <div className="relative w-48 h-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-400" />
                  <div className="p-6 pt-10 flex flex-col items-center text-center h-full">
                    <MapPin className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">EyE PunE Strategy</div>
                    <div className="font-black text-white text-lg leading-tight">{city} Market Domination</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic SEO FAQ Section */}
        <div className="max-w-4xl mx-auto mb-24 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about working with us in {city}.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: `Do you provide in-person meetings in ${city}?`, a: `While our headquarters is in Pune, we operate as a global digital agency. We conduct seamless high-fidelity strategy sessions via Zoom/Meet, ensuring you get world-class service regardless of your physical location in ${city}.` },
              { q: `How well do you understand the ${city} market?`, a: `Our AI-driven research frameworks allow us to analyze local consumer behavior, search trends, and competitor gaps specifically in the ${city} region before we launch any campaign.` },
              { q: `What industries do you work with in ${city}?`, a: `We partner with high-ticket B2B service providers, tech startups, real estate firms, and e-commerce brands looking to scale their operations through AI and advanced marketing.` },
              { q: `How do I get started with your solutions?`, a: `Simply click the "Claim Your Strategy Session" button below. We'll hop on a quick 15-minute discovery call to audit your current digital infrastructure.` }
            ].map((faq, i) => (
              <details key={i} className="group rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.04] transition-colors outline-none">
                  <h3 className="text-lg font-semibold pr-4">{faq.q}</h3>
                  <div className="text-gray-400 transition-transform duration-300 group-open:rotate-180">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </summary>
                <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/[0.05] bg-white/[0.01]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-red-950/40 to-black border border-red-900/30 relative overflow-hidden mb-24">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 md:mb-6 relative z-10 px-2 leading-tight">
            Ready to dominate the <span className="text-red-500 block sm:inline mt-1 sm:mt-0">{city}</span> market?
          </h2>
          <p className="text-base md:text-xl text-gray-400 mb-8 relative z-10 px-4 leading-relaxed">
            Book a 15-minute discovery call and we'll map out a custom blueprint for you.
          </p>
          <div className="flex justify-center w-full relative z-10 mt-8">
            <Link href="/Contact" className="w-full sm:w-auto">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold h-auto min-h-[56px] py-3 px-4 sm:px-8 text-base sm:text-lg rounded-[28px] w-full sm:w-auto shadow-2xl hover:scale-105 transition-all whitespace-normal text-center leading-tight">
                Claim Your Strategy Session Now
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
