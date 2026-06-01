import React from 'react';
import GlowCard from '@/components/shared/GlowCard';

export default function Resources() {
  const tools = [
    {
      name: 'Vercel',
      category: 'Hosting & Infrastructure',
      description: 'The premium frontend platform we use to deploy EyE PunE. Lightning-fast edge networks and Next.js native support.',
      link: 'https://vercel.com/contact/partners',
      buttonText: 'Deploy on Vercel',
      icon: '▲',
      color: 'from-gray-700 to-black',
      instruction: 'To get your referral link, sign up for Vercel Partners or their affiliate program through PartnerStack.'
    },
    {
      name: 'Hostinger',
      category: 'Web Hosting',
      description: 'Affordable and reliable hosting for small to medium-sized business websites. Great for WordPress or standard PHP apps.',
      link: 'https://www.hostinger.com/affiliates',
      buttonText: 'Get Hostinger',
      icon: '☁️',
      color: 'from-purple-600 to-indigo-800',
      instruction: 'Hostinger has a massive affiliate program paying up to 60%. Join their program directly on their site.'
    },
    {
      name: 'Zoho Workspace',
      category: 'Business Operations',
      description: 'The unified suite for email, CRM, and documents that powers EyE PunE’s internal communication operations.',
      link: 'https://www.zoho.com/partners/',
      buttonText: 'Try Zoho',
      icon: '💼',
      color: 'from-green-500 to-emerald-700',
      instruction: 'Join the Zoho Partner Program to get unique affiliate links for Zoho Mail, CRM, and Books.'
    },
    {
      name: 'Razorpay',
      category: 'Payment Gateway',
      description: 'The leading payment infrastructure we use to seamlessly process global transactions for our Client Portal.',
      link: 'https://rzp.io/rzp/1rSpeFFL',
      buttonText: 'Start with Razorpay',
      icon: '💳',
      color: 'from-blue-600 to-sky-800',
      instruction: 'Join Razorpay Partners. You will get a unique link and earn 0.1% commission on all merchant transactions.'
    },
    {
      name: 'SEMrush',
      category: 'Marketing & SEO',
      description: 'Our go-to platform for keyword research, competitor analysis, and maintaining our programmatic SEO engine.',
      link: 'https://www.semrush.com/partner/',
      buttonText: 'Boost SEO with SEMrush',
      icon: '📈',
      color: 'from-orange-500 to-red-600',
      instruction: 'The SEMrush affiliate program (via Impact Radius) pays up to $200 per new subscription sale.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Our Recommended <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Tech Stack</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The exact tools, infrastructure, and software we use to build, scale, and automate EyE PunE. We only recommend platforms we trust and use daily in production.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, idx) => (
            <div key={idx} className="h-full flex flex-col">
              <GlowCard className="h-full flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-10 rounded-bl-full transform translate-x-8 -translate-y-8 transition-transform group-hover:scale-110`} />
                
                <div className="text-4xl mb-4">
                  {tool.icon}
                </div>
                
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                  {tool.category}
                </span>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {tool.name}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow">
                  {tool.description}
                </p>
                
                {/* Affiliate Link (Placeholder for now until user puts real link) */}
                <a 
                  href={tool.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors mt-auto"
                >
                  {tool.buttonText}
                </a>

                {/* Internal Admin Note - Invisible to regular users, but helpful for the user setting this up */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-bold block mb-1">Affiliate Setup Note:</span>
                  {tool.instruction}
                </div>
              </GlowCard>
            </div>
          ))}
        </div>

        {/* Call to Action for Services */}
        <div className="mt-20 text-center p-8 bg-blue-600 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">
            Need help integrating these tools?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">
            Our agency specializes in connecting these exact platforms into automated workflows for B2B enterprises. Let's build your infrastructure.
          </p>
          <a href="/Contact" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors relative z-10">
            Book a Consultation
          </a>
        </div>

      </div>
    </div>
  );
}
