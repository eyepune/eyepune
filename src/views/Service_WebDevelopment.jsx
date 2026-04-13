import ServiceLanding from "@/components/services/ServiceLanding";
import { Globe, Smartphone, Zap, Shield, Code, Search, ShoppingCart, BarChart2 } from 'lucide-react';

const config = {
    title: "Website Development<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400'>Pune</span>",
    subtitle: "Web & App Development Experts",
    Icon: Globe,
    seo: {
        title: "Website Development Pune | Custom Web & App Development – EyE PunE",
        description: "Professional website and web app development in Pune. Custom websites, e-commerce, landing pages and mobile apps. Fast, SEO-optimised and conversion-focused. Free consultation.",
        keywords: "website development pune, web development company pune, website design pune, custom web app pune, ecommerce website pune, landing page development pune, mobile app development pune",
        canonical: "https://eyepune.com/website-development-pune"
    },
    hero: {
        description: "High-performance websites and web apps built for speed, SEO and conversions. From landing pages to full e-commerce platforms — we build digital assets that grow your business.",
        stats: [
            { val: '50+', label: 'Websites Built' },
            { val: '<2s', label: 'Load Time' },
            { val: '100', label: 'PageSpeed Score' },
            { val: '3x', label: 'Avg Conversion Lift' },
        ]
    },
    features: [
        { icon: Globe, title: 'Custom Websites', description: 'Bespoke designed websites that reflect your brand, engage visitors and convert them into customers.' },
        { icon: ShoppingCart, title: 'E-Commerce Development', description: 'Full-featured online stores with Razorpay, payment gateways, inventory and order management.' },
        { icon: Smartphone, title: 'Mobile-First Design', description: 'Every website we build is fully responsive and optimised for mobile — where 70%+ of your visitors come from.' },
        { icon: Zap, title: 'Performance Optimisation', description: 'Lightning-fast load times with Core Web Vitals optimisation for better rankings and user experience.' },
        { icon: Search, title: 'Technical SEO', description: 'Built-in SEO architecture: schema markup, sitemaps, canonical tags and structured data from day one.' },
        { icon: Shield, title: 'Security & Maintenance', description: 'SSL certificates, regular backups, security monitoring and ongoing maintenance packages available.' },
    ],
    process: [
        { title: 'Discovery & Wireframing', description: 'We understand your business goals, target audience and competitors, then create detailed wireframes for your approval.' },
        { title: 'Design & Prototype', description: 'Our designers create pixel-perfect mockups aligned with your brand identity for your review and feedback.' },
        { title: 'Development & Testing', description: 'Developers build your site with clean code, then rigorously test across devices, browsers and performance benchmarks.' },
        { title: 'Launch & Handover', description: 'We deploy your site, submit it to Google Search Console and provide full training and documentation.' },
    ],
    faqs: [
        { q: 'How much does website development cost in Pune?', a: 'Basic business websites start from ₹25,000. E-commerce sites start from ₹60,000. Custom web apps are quoted based on requirements. All prices include hosting setup and 3 months of support.' },
        { q: 'How long does it take to build a website?', a: 'A standard business website takes 2-3 weeks. E-commerce sites take 4-6 weeks. Complex web applications are scoped during discovery.' },
        { q: 'Do you provide website maintenance after launch?', a: 'Yes, we offer monthly maintenance packages from ₹5,000/month covering updates, backups, security monitoring and content changes.' },
        { q: 'Will my website rank on Google?', a: 'Every website we build includes technical SEO foundations. We also offer ongoing SEO services to help you rank for high-intent local keywords.' },
        { q: 'Can you redesign my existing website?', a: 'Absolutely. We specialise in website redesigns that improve performance, design and SEO while preserving your existing content and rankings.' },
    ]
};

export default function Service_WebDevelopment() {
    return <ServiceLanding config={config} />;
}