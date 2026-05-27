import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, TrendingUp, Zap, Target, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';
import LeadMagnetForm from '@/components/seo/LeadMagnetForm';

export async function generateMetadata({ params }) {
  const rawKeyword = params.keyword;
  const keyword = rawKeyword.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${keyword} | EyE PunE Elite Solutions`,
    description: `Expert ${keyword} services by EyE PunE. We provide scalable, AI-driven solutions to help your business dominate the market.`,
    alternates: {
      canonical: `/Solutions/${rawKeyword}`,
    }
  };
}

export default function SEOKeywordPage({ params }) {
  const rawKeyword = params.keyword;
  const keyword = rawKeyword.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const keywordLower = keyword.toLowerCase();

  let dynamicFeatures = [];
  if (keywordLower.includes('web') || keywordLower.includes('design') || keywordLower.includes('app') || keywordLower.includes('site')) {
    dynamicFeatures = [
      {
        icon: <Target className="w-8 h-8 text-red-500" />,
        title: "High-Performance Architecture",
        desc: `Every ${keyword} build is optimized for lightning-fast load speeds, flawless mobile responsiveness, and technical SEO mastery.`
      },
      {
        icon: <TrendingUp className="w-8 h-8 text-red-500" />,
        title: "Conversion-Optimized UX",
        desc: "We don't just build pretty pages. We engineer user journeys designed to turn cold traffic into paying customers."
      },
      {
        icon: <Zap className="w-8 h-8 text-red-500" />,
        title: "Scalable Infrastructure",
        desc: "Built on modern, robust frameworks that can handle massive traffic spikes without breaking a sweat."
      }
    ];
  } else if (keywordLower.includes('ai') || keywordLower.includes('automation') || keywordLower.includes('bot') || keywordLower.includes('lead')) {
    dynamicFeatures = [
      {
        icon: <Target className="w-8 h-8 text-red-500" />,
        title: "Intelligent Workflows",
        desc: `Our ${keyword} systems eliminate repetitive manual tasks, saving you hundreds of hours every single month.`
      },
      {
        icon: <TrendingUp className="w-8 h-8 text-red-500" />,
        title: "24/7 Operational Scale",
        desc: "Your AI never sleeps. Capture leads, answer queries, and process data automatically around the clock."
      },
      {
        icon: <Zap className="w-8 h-8 text-red-500" />,
        title: "Custom AI Models",
        desc: "We train our AI solutions on your specific business data so it sounds, acts, and sells exactly like your best employee."
      }
    ];
  } else {
    dynamicFeatures = [
      {
        icon: <Target className="w-8 h-8 text-red-500" />,
        title: "Laser-Targeted Strategy",
        desc: `We don't do guesswork. Every ${keyword} campaign is backed by hard data and AI-driven predictive modeling.`
      },
      {
        icon: <TrendingUp className="w-8 h-8 text-red-500" />,
        title: "Hyper-Scalable Systems",
        desc: "Built to handle massive influxes of traffic and leads without breaking a sweat or increasing your overhead."
      },
      {
        icon: <CheckCircle2 className="w-8 h-8 text-red-500" />,
        title: "Guaranteed ROI Focus",
        desc: "Vanity metrics don't pay the bills. We map every action directly to revenue generation and customer acquisition."
      }
    ];
  }

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
            <Zap className="w-4 h-4" />
            <span>Premium Business Solutions</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.2] md:leading-tight tracking-tight px-2">
            Dominate With <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">{keyword}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Stop losing ground to competitors. Our elite <strong>{keyword}</strong> frameworks are designed to aggressively scale your revenue, automate your workflows, and establish absolute market authority.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/Contact">
              <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold h-14 px-8 text-lg rounded-full">
                Get Your Free Growth Audit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Value Proposition Grid (Dynamic) */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24 px-4">
          {dynamicFeatures.map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-red-950/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
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
                  The 2026 <span className="text-red-500">{keyword}</span> Growth Blueprint
                </h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                  Steal the exact framework we use to generate highly-qualified leads and scale revenues for 100+ global clients. Enter your email to get instant access.
                </p>
                <LeadMagnetForm keyword={keyword} />
              </div>
              
              <div className="md:w-2/5 flex justify-center">
                <div className="relative w-48 h-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-400" />
                  <div className="p-6 pt-10 flex flex-col items-center text-center h-full">
                    <Zap className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">EyE PunE Labs</div>
                    <div className="font-black text-white text-lg leading-tight">{keyword} Framework</div>
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
            <p className="text-gray-400">Everything you need to know about our {keyword} solutions.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: `How long does it take to see results from your ${keyword} services?`, a: `We prioritize rapid deployment. While exact timelines depend on your specific infrastructure, most of our ${keyword} clients begin seeing measurable ROI within the first 14 to 30 days of implementation.` },
              { q: `Do you provide custom ${keyword} strategies for my specific industry?`, a: `Absolutely. We never use cookie-cutter templates. We analyze your market, competitors, and unit economics to build a bespoke ${keyword} system tailored strictly to your business goals.` },
              { q: `What makes EyE PunE different from other ${keyword} agencies?`, a: `We are a high-performance growth engine, not a traditional agency. We integrate deeply with your team, leverage cutting-edge AI, and tie our ${keyword} frameworks directly to your bottom-line revenue.` },
              { q: `How do I get started with your ${keyword} solutions?`, a: `Simply click the "Claim Your Strategy Session" button below. We'll hop on a quick 15-minute discovery call to audit your current setup and determine if our ${keyword} frameworks are a fit for your business.` }
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
            Ready to scale with <span className="text-red-500 block sm:inline mt-1 sm:mt-0">{keyword}</span>?
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

        {/* SEO Internal Linking Engine */}
        <div className="max-w-6xl mx-auto border-t border-white/10 pt-16 pb-8">
          <div className="flex flex-col md:flex-row gap-12 justify-between">
            <div className="md:w-1/3">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Related Core Services
              </h3>
              <ul className="space-y-3">
                <li><Link href="/Service-AI" className="text-gray-400 hover:text-red-400 transition-colors">Global AI Business Automation</Link></li>
                <li><Link href="/Service-Funnels" className="text-gray-400 hover:text-red-400 transition-colors">Sales & System Funnels</Link></li>
                <li><Link href="/Service-PaidAds" className="text-gray-400 hover:text-red-400 transition-colors">Paid Advertising Management</Link></li>
                <li><Link href="/Service-WebDev" className="text-gray-400 hover:text-red-400 transition-colors">Website Development & Design</Link></li>
              </ul>
            </div>
            
            <div className="md:w-1/3">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                Trending Solutions
              </h3>
              <ul className="space-y-3">
                <li><Link href="/Solutions/ai-lead-generation-agency" className="text-gray-400 hover:text-red-400 transition-colors">AI Lead Generation Agency</Link></li>
                <li><Link href="/Solutions/whatsapp-automation-services" className="text-gray-400 hover:text-red-400 transition-colors">WhatsApp Automation Services</Link></li>
                <li><Link href="/Solutions/b2b-sales-funnel-design" className="text-gray-400 hover:text-red-400 transition-colors">B2B Sales Funnel Design</Link></li>
                <li><Link href="/Solutions/high-converting-landing-pages" className="text-gray-400 hover:text-red-400 transition-colors">High Converting Landing Pages</Link></li>
              </ul>
            </div>

            <div className="md:w-1/3">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-500" />
                Digital Growth
              </h3>
              <ul className="space-y-3">
                <li><Link href="/Service-SocialMedia" className="text-gray-400 hover:text-red-400 transition-colors">Social Media Management</Link></li>
                <li><Link href="/Solutions/instagram-reels-strategy" className="text-gray-400 hover:text-red-400 transition-colors">Instagram Reels Strategy</Link></li>
                <li><Link href="/Service-Branding" className="text-gray-400 hover:text-red-400 transition-colors">Premium Brand Identity</Link></li>
                <li><Link href="/Blog" className="text-gray-400 hover:text-red-400 transition-colors">Latest Digital Insights</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
