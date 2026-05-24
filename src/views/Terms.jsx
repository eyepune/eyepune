import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function Terms() {
    const { data: page, isLoading } = useQuery({
        queryKey: ['cms-page', 'terms-and-conditions'],
        queryFn: async () => {
            const pages = await base44.entities.CMS_Page.filter({ slug: 'terms-and-conditions' });
            return pages.length > 0 ? pages[0] : null;
        },
        retry: 2,
    });

    useEffect(() => {
        if (page?.meta_title) {
            document.title = page.meta_title;
        }
    }, [page]);

    const hasDynamicContent = page && page.content;

    return (
        <div className="min-h-screen py-32 px-6 bg-transparent">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                    {page?.title || 'Terms & Conditions'}
                </h1>
                
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-full bg-white/5" />
                        <Skeleton className="h-6 w-full bg-white/5" />
                        <Skeleton className="h-6 w-3/4 bg-white/5" />
                    </div>
                ) : hasDynamicContent ? (
                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-300">
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => <h1 className="text-3xl font-black text-white mt-10 mb-4 font-sans tracking-tight">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-sans tracking-tight">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-6 mb-3 font-sans tracking-tight">{children}</h3>,
                                p: ({ children }) => <p className="mb-6 text-gray-300 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-300">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-4">
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {page.content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    // ── HARDCODED FALLBACK ──
                    <div className="prose prose-lg prose-invert max-w-none text-gray-300">
                        <p className="text-xl text-gray-400 mb-8">Last Updated: 22nd Nov 2022</p>
                        
                        <p className="mb-6 leading-relaxed">Welcome to EyE PunE. By accessing our website, engaging our services, or interacting with our digital platforms, you agree to comply with the following Terms & Conditions.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Services</h2>
                        <p className="mb-4 leading-relaxed">EyE PunE provides digital services including but not limited to:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6 mb-6 text-gray-300">
                            <li>• Social Media Marketing</li>
                            <li>• Meta Ads Management</li>
                            <li>• Google Ads Management</li>
                            <li>• SEO Services</li>
                            <li>• Website Design & Development</li>
                            <li>• Branding & Creative Services</li>
                            <li>• AI & Automation Solutions</li>
                            <li>• Content Creation & Video Production</li>
                            <li>• Consulting & Strategy Services</li>
                        </ul>
                        <p className="mb-6 leading-relaxed">The scope of services will be defined in individual proposals, invoices, agreements, or written communication.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. Payments & Billing</h2>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>All retainers, milestone payments, and project fees are payable in advance unless otherwise agreed in writing.</li>
                            <li>Delayed payments may result in temporary suspension or termination of services.</li>
                            <li>GST is applicable on all invoices as per Indian tax regulations.</li>
                            <li>Advertising budgets are billed separately and paid directly to platforms such as Meta, Google, LinkedIn, or other advertising networks.</li>
                            <li>EyE PunE reserves the right to revise pricing at any time with prior notice.</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Late Payments</h2>
                        <p className="mb-4 leading-relaxed">All invoices must be cleared within the agreed payment due date. A grace period of up to 7 calendar days from the invoice due date shall be provided.</p>
                        <p className="mb-4 leading-relaxed">If payment remains unpaid after the grace period, EyE PunE reserves the right to charge a late payment penalty of 5% per day on the outstanding pending amount until full payment is received. EyE PunE further reserves the right to:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-1">
                            <li>Suspend ongoing services</li>
                            <li>Pause advertising campaigns</li>
                            <li>Withhold deliverables</li>
                            <li>Revoke access to files or systems</li>
                            <li>Terminate the engagement</li>
                            <li>Initiate legal recovery proceedings if necessary</li>
                        </ul>
                        <p className="mb-6 leading-relaxed font-semibold">Any legal, recovery, collection, or enforcement costs arising due to delayed payments shall be borne entirely by the client.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Refund Policy</h2>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Payments made are non-refundable once work has commenced.</li>
                            <li>No refunds are applicable for completed deliverables, consultations, campaigns, or approved creative work.</li>
                            <li>Advertising spend paid to third-party platforms is non-refundable.</li>
                            <li>Any disputes regarding billing must be raised within 7 days of invoice issuance.</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Client Responsibilities</h2>
                        <p className="mb-4 leading-relaxed font-semibold">Clients agree to:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Provide timely approvals and feedback</li>
                            <li>Share required access credentials and assets</li>
                            <li>Ensure legal ownership of submitted materials</li>
                            <li>Respond within agreed timelines</li>
                            <li>Review deliverables before publishing</li>
                        </ul>
                        <p className="mb-6 leading-relaxed">Delays in communication or approvals may affect project timelines and outcomes.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">6. Intellectual Property</h2>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Final approved deliverables become the property of the client upon full payment.</li>
                            <li>EyE PunE retains the right to showcase completed work in portfolios, case studies, social media, presentations, and marketing materials unless otherwise agreed in writing.</li>
                            <li>Raw files, editable source files, proprietary systems, frameworks, automation workflows, and internal processes remain the intellectual property of EyE PunE unless explicitly transferred.</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">7. Revisions</h2>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Revision limits depend on the selected package or proposal scope.</li>
                            <li>Additional revisions outside the agreed scope may incur additional charges.</li>
                            <li>Major changes requested after approval may require revised timelines and pricing.</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">8. Performance Disclaimer</h2>
                        <p className="mb-4 leading-relaxed font-semibold">EyE PunE does not guarantee:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6 mb-4">
                            <li>• Specific search engine rankings</li>
                            <li>• Guaranteed ROAS or conversion rates</li>
                            <li>• Viral social media performance</li>
                            <li>• Revenue outcomes</li>
                            <li>• Lead volume</li>
                            <li>• Platform approvals</li>
                        </ul>
                        <p className="mb-6 leading-relaxed">Results depend on multiple external variables including market conditions, algorithms, competition, audience behavior, and platform policies.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">9. Platform Liability</h2>
                        <p className="mb-4 leading-relaxed font-semibold">EyE PunE shall not be held liable for:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Ad account bans or suspensions</li>
                            <li>Platform policy violations</li>
                            <li>Algorithm changes</li>
                            <li>Third-party service disruptions</li>
                            <li>Hosting failures</li>
                            <li>API outages</li>
                            <li>Cybersecurity incidents beyond reasonable control</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">10. Limitation of Liability</h2>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>EyE PunE’s total liability under any circumstance shall not exceed the amount paid by the client for the specific service giving rise to the claim.</li>
                            <li>EyE PunE shall not be liable for indirect, incidental, consequential, or business losses including loss of revenue, profit, or data.</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">11. Confidentiality</h2>
                        <p className="mb-6 leading-relaxed">Both parties agree to maintain confidentiality regarding sensitive business, operational, financial, and strategic information shared during the engagement.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">12. Force Majeure</h2>
                        <p className="mb-4 leading-relaxed">EyE PunE shall not be held liable for delays or failure in performance resulting from causes beyond reasonable control, including but not limited to: Internet outages, platform disruptions, government restrictions, natural disasters, cyber incidents, third-party failures, labor shortages, or technical infrastructure failures.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">13. Termination</h2>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Either party may terminate services with written notice as per agreed contractual terms.</li>
                            <li>Outstanding invoices and completed work remain payable upon termination.</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">14. Governing Law & Jurisdiction</h2>
                        <p className="mb-4 leading-relaxed">These Terms & Conditions shall be governed and interpreted in accordance with the laws of India.</p>
                        <p className="mb-4 leading-relaxed">Any dispute, claim, or controversy arising out of or relating to EyE PunE’s services, website, agreements, deliverables, payments, or business interactions shall first be attempted to be resolved amicably through mutual discussion.</p>
                        <p className="mb-6 leading-relaxed font-semibold text-white">If unresolved, such disputes shall be subject exclusively to the jurisdiction of the competent courts located in Pune, Maharashtra, India. By using this website or engaging EyE PunE’s services, the client/user expressly agrees to submit to the exclusive jurisdiction of the courts of Pune, Maharashtra.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
