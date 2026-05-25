import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, TrendingUp, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <main className="min-h-screen pt-32 pb-20 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/30 border border-red-500/30 text-red-500 text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            <span>Premium Business Solutions</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Dominate With <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
              {keyword}
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop losing ground to competitors. Our elite {keyword} frameworks are designed to aggressively scale your revenue, automate your workflows, and establish absolute market authority.
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

        {/* Value Proposition Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {[
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
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-red-950/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-red-950/40 to-black border border-red-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
            Ready to implement {keyword} in your business?
          </h2>
          <p className="text-xl text-gray-400 mb-8 relative z-10">
            Book a 15-minute discovery call and we'll map out a custom blueprint for you.
          </p>
          <Link href="/Contact">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold h-14 px-8 text-lg rounded-full relative z-10">
              Claim Your Strategy Session Now
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
