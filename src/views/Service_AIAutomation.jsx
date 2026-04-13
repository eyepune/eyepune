import ServiceLanding from "@/components/services/ServiceLanding";
import { Bot, Zap, RefreshCw, MessageSquare, BarChart2, Cpu, Mail, Users } from 'lucide-react';

const config = {
    title: "AI Automation<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400'>for Business</span>",
    subtitle: "AI & Automation Specialists",
    Icon: Bot,
    seo: {
        title: "AI Automation Pune | Business Automation & AI Solutions – EyE PunE",
        description: "AI-powered business automation in Pune. Automate sales, marketing, customer support and operations with custom AI workflows. Cut costs, save time and scale faster.",
        keywords: "AI automation pune, business automation pune, AI solutions pune, chatbot development pune, marketing automation pune, sales automation pune, AI agency pune india",
        canonical: "https://eyepune.com/ai-automation-pune"
    },
    hero: {
        description: "Automate repetitive tasks, qualify leads 24/7 and personalise customer experiences with AI — so your team can focus on what only humans can do.",
        stats: [
            { val: '60%', label: 'Time Saved' },
            { val: '3x', label: 'Lead Response Speed' },
            { val: '24/7', label: 'AI Coverage' },
            { val: '40%', label: 'Cost Reduction' },
        ]
    },
    features: [
        { icon: MessageSquare, title: 'AI Chatbots', description: 'WhatsApp and website chatbots that qualify leads, answer FAQs and book appointments automatically — round the clock.' },
        { icon: Mail, title: 'Email Automation', description: 'Intelligent drip sequences that send the right message at the right time to nurture leads into customers.' },
        { icon: Users, title: 'CRM Automation', description: 'Auto-assign leads, trigger follow-ups, score prospects and update pipelines without manual input.' },
        { icon: RefreshCw, title: 'Workflow Automation', description: 'Connect your apps and automate complex multi-step workflows across tools like Zoho, HubSpot, WhatsApp and more.' },
        { icon: BarChart2, title: 'AI Analytics', description: 'Real-time dashboards with AI-powered insights to spot opportunities and problems before they impact revenue.' },
        { icon: Cpu, title: 'Custom AI Solutions', description: 'Bespoke AI tools built for your specific business — from document processing to AI-powered customer service agents.' },
    ],
    process: [
        { title: 'Automation Audit', description: 'We map your current workflows, identify high-impact automation opportunities and calculate potential ROI.' },
        { title: 'Solution Design', description: 'Our team designs the automation architecture and AI workflows tailored to your business processes and tools.' },
        { title: 'Build & Integrate', description: 'We build, test and integrate the automations with your existing software stack with minimal disruption.' },
        { title: 'Train & Optimise', description: 'We train your team, monitor performance and continuously optimise the AI models for better results.' },
    ],
    faqs: [
        { q: 'How much does AI automation cost for a Pune business?', a: 'AI automation projects start from ₹40,000 for a single workflow implementation. Full business automation suites are custom-quoted. ROI is typically achieved within 2-3 months.' },
        { q: 'Do I need technical knowledge to use AI automations?', a: 'No. We build user-friendly automations that your team can manage through simple dashboards. We also provide full training and ongoing support.' },
        { q: 'Which tools and platforms do you integrate with?', a: 'We work with WhatsApp Business API, Zoho CRM, HubSpot, Google Workspace, Razorpay, Shopify, WordPress and 200+ other tools.' },
        { q: 'Can AI really replace my customer support team?', a: 'AI chatbots handle 60-80% of routine queries automatically, freeing your team to handle complex, high-value interactions. It augments your team, not replaces them.' },
        { q: 'How long does implementation take?', a: 'Simple chatbot or email automation: 1-2 weeks. Full CRM + marketing automation: 4-8 weeks. Complex custom AI builds: quoted individually.' },
    ]
};

export default function Service_AIAutomation() {
    return <ServiceLanding config={config} />;
}