"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Wand2, ArrowRight, Loader2, Save, Download, Link as LinkIcon, Check, History, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';

const contractSchema = {
    nda: [
        { id: 'purpose', label: 'Purpose of NDA', placeholder: 'e.g., Software Evaluation' },
        { id: 'duration', label: 'Duration of Confidentiality', placeholder: 'e.g., 3 Years' }
    ],
    employment: [
        { id: 'role', label: 'Job Title / Role', placeholder: 'e.g., Senior Developer' },
        { id: 'salary', label: 'Annual Compensation', placeholder: 'e.g., INR 12,00,000' },
        { id: 'probation', label: 'Probation Period', placeholder: 'e.g., 6 Months' },
        { id: 'notice', label: 'Notice Period', placeholder: 'e.g., 60 Days' }
    ],
    service: [
        { id: 'scope', label: 'Scope of Services', placeholder: 'e.g., Marketing and SEO' },
        { id: 'paymentTerms', label: 'Payment Terms', placeholder: 'e.g., Net 30' }
    ],
    freelance: [
        { id: 'deliverables', label: 'Specific Deliverables', placeholder: 'e.g., 5 articles per month' },
        { id: 'fee', label: 'Consulting Fee', placeholder: 'e.g., INR 50,000 / month' }
    ],
    consulting: [
        { id: 'services', label: 'Consulting Services', placeholder: 'e.g., Financial Auditing' },
        { id: 'retainer', label: 'Retainer Amount', placeholder: 'e.g., INR 1,00,000 / month' }
    ],
    founders: [
        { id: 'equity', label: 'Equity Split (%)', placeholder: 'e.g., 50/50' },
        { id: 'vesting', label: 'Vesting Schedule', placeholder: 'e.g., 4 years with 1 year cliff' },
        { id: 'roles', label: 'Founder Roles', placeholder: 'e.g., CEO and CTO' }
    ],
    shareholders: [
        { id: 'boardSeats', label: 'Board Seats Allocation', placeholder: 'e.g., 2 for Investors, 3 for Founders' },
        { id: 'lockIn', label: 'Founder Lock-in Period', placeholder: 'e.g., 3 Years' }
    ],
    partnership: [
        { id: 'capital', label: 'Capital Contribution', placeholder: 'e.g., INR 5 Lakhs each' },
        { id: 'profitShare', label: 'Profit/Loss Sharing Ratio', placeholder: 'e.g., 60:40' }
    ],
    joint_venture: [
        { id: 'jvPurpose', label: 'Purpose of Joint Venture', placeholder: 'e.g., Real Estate Development' },
        { id: 'ownership', label: 'Ownership Structure', placeholder: 'e.g., 51% Party A, 49% Party B' }
    ],
    mou: [
        { id: 'intention', label: 'Primary Intention', placeholder: 'e.g., Explore Merger Opportunities' },
        { id: 'validity', label: 'MoU Validity Period', placeholder: 'e.g., 6 Months' }
    ],
    saas: [
        { id: 'subscription', label: 'Subscription Plan / Tier', placeholder: 'e.g., Enterprise Tier' },
        { id: 'users', label: 'Number of Permitted Users', placeholder: 'e.g., Up to 50' },
        { id: 'uptime', label: 'SLA Uptime Guarantee', placeholder: 'e.g., 99.9%' }
    ],
    terms: [
        { id: 'websiteURL', label: 'Website/App URL', placeholder: 'e.g., https://eyepune.com' },
        { id: 'userType', label: 'Target Audience', placeholder: 'e.g., B2B Businesses' }
    ],
    lease: [
        { id: 'property', label: 'Property Address', placeholder: 'e.g., 101 Tech Park, Pune' },
        { id: 'rent', label: 'Monthly Rent', placeholder: 'e.g., INR 1,50,000' },
        { id: 'deposit', label: 'Security Deposit', placeholder: 'e.g., 6 Months Rent' },
        { id: 'lockInLease', label: 'Lock-in Period', placeholder: 'e.g., 3 Years' }
    ],
    rent: [
        { id: 'propertyRent', label: 'Property Address', placeholder: 'e.g., Flat 202, ABC Tower' },
        { id: 'rentAmount', label: 'Monthly Rent', placeholder: 'e.g., INR 25,000' },
        { id: 'depositAmount', label: 'Security Deposit', placeholder: 'e.g., INR 1,00,000' }
    ],
    vendor: [
        { id: 'goods', label: 'Goods/Services Provided', placeholder: 'e.g., Office Supplies' },
        { id: 'delivery', label: 'Delivery Terms', placeholder: 'e.g., Within 7 days of PO' }
    ],
    franchise: [
        { id: 'territory', label: 'Exclusive Territory', placeholder: 'e.g., Pune District' },
        { id: 'royalty', label: 'Royalty Fee (%)', placeholder: 'e.g., 5% of Gross Sales' }
    ]
};

export default function LexProDrafting() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState('');
    const [dynamicAnswers, setDynamicAnswers] = useState({});
    const [savedContractId, setSavedContractId] = useState(null);
    const [auditTrails, setAuditTrails] = useState([]);
    const [isSigning, setIsSigning] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [versions, setVersions] = useState([]);
    const [showVersions, setShowVersions] = useState(false);

    const searchParams = useSearchParams();
    const contractIdParam = searchParams.get('id');

    useEffect(() => {
        if (contractIdParam) {
            const fetchContract = async () => {
                try {
                    const response = await fetch(`/api/lex-pro/contracts/${contractIdParam}`);
                    const data = await response.json();
                    if (data.success) {
                        setGeneratedDraft(data.contract.content);
                        setSavedContractId(data.contract.id);
                        setAuditTrails(data.auditTrails || []);
                        setFormData(prev => ({ 
                            ...prev, 
                            contractType: data.contract.contract_type,
                            signatureType: 'Digital Audit Trail' // Default to this if loading to view signatures
                        }));
                        setShowCanvas(true);
                    }
                } catch (err) {
                    console.error("Failed to load contract", err);
                }
            };
            fetchContract();
        }
    }, [contractIdParam]);

    const [formData, setFormData] = useState({
        contractType: 'nda',
        partyA: '',
        partyAType: 'Private Limited Company',
        partyAAddress: '',
        partyASignatory: '',
        partyAIdentifier: '',
        partyB: '',
        partyBType: 'Individual',
        partyBAddress: '',
        partyBSignatory: '',
        partyBIdentifier: '',
        partyAEmail: '',
        partyBEmail: '',
        effectiveDate: '',
        signatureType: 'E-Signature',
        printFormat: 'Standard A4',
        jurisdiction: 'Maharashtra',
        governingLaw: 'Indian Contract Act, 1872',
        additionalTerms: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'contractType') {
            setDynamicAnswers({}); // Reset dynamic answers when type changes
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDynamicChange = (id, value) => {
        setDynamicAnswers(prev => ({ ...prev, [id]: value }));
    };

    const generateDraft = async () => {
        setIsGenerating(true);
        setShowCanvas(true);
        try {
            // Combine dynamic answers with form data
            const dynamicFields = contractSchema[formData.contractType] || [];
            const formattedDynamicAnswers = dynamicFields.map(field => `${field.label}: ${dynamicAnswers[field.id] || 'Not specified'}`).join('\n');
            
            const partyInfo = `
Party A (${formData.partyAType}): ${formData.partyA}
Address: ${formData.partyAAddress || 'Not specified'}
Authorized Signatory: ${formData.partyASignatory || 'N/A'}
ID/CIN/GSTIN: ${formData.partyAIdentifier || 'N/A'}

Party B (${formData.partyBType}): ${formData.partyB}
Address: ${formData.partyBAddress || 'Not specified'}
Authorized Signatory: ${formData.partyBSignatory || 'N/A'}
ID/CIN/GSTIN: ${formData.partyBIdentifier || 'N/A'}

Effective Date: ${formData.effectiveDate || 'Upon Execution'}
Signature Method: ${formData.signatureType}
`;
            
            const payload = {
                ...formData,
                additionalTerms: `${formData.additionalTerms}\n\nSpecific Details:\n${formattedDynamicAnswers}\n\nContract Parties & Execution Info:\n${partyInfo}`
            };

            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/lex-pro/draft', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            if (response.status === 401) {
                setGeneratedDraft('Error: Session expired or unauthorized. Please log in again.');
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                setGeneratedDraft(data.draft);
            } else {
                setGeneratedDraft(`Error generating draft: ${data.error}`);
            }
        } catch (error) {
            setGeneratedDraft(`Failed to reach AI service: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!generatedDraft) return;
        setIsSaving(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/lex-pro/save-draft', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({
                    title: `${formData.contractType.toUpperCase()} - ${formData.partyA || 'Party A'} & ${formData.partyB || 'Party B'}`,
                    contractType: formData.contractType,
                    content: generatedDraft
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setSavedContractId(data.contract.id);
                alert('Draft saved successfully to your organization workspace!');
            } else {
                alert(`Error saving draft: ${data.error}`);
            }
        } catch (error) {
            alert(`Network error saving draft: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSnapshot = () => {
        const newVersion = {
            id: `v${versions.length + 1}`,
            timestamp: new Date().toLocaleString(),
            content: generatedDraft
        };
        setVersions(prev => [newVersion, ...prev]);
        alert(`Snapshot ${newVersion.id} saved to history!`);
    };

    const handleRestoreVersion = (content) => {
        if(confirm("Are you sure you want to restore this version? Unsaved changes will be lost.")) {
            setGeneratedDraft(content);
            setShowVersions(false);
        }
    };

    const handleSignDocument = async (partyName) => {
        if (!savedContractId) {
            alert("Please save the draft first before signing.");
            return;
        }
        setIsSigning(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/lex-pro/sign', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({
                    contractId: savedContractId,
                    partyName: partyName,
                    documentText: generatedDraft
                })
            });
            const data = await response.json();
            if (data.success) {
                setAuditTrails(prev => [...prev, data.auditTrail]);
                alert(`Successfully signed as ${partyName}!`);
            } else {
                alert(`Error signing: ${data.error}`);
            }
        } catch (err) {
            alert(`Network error: ${err.message}`);
        } finally {
            setIsSigning(false);
        }
    };

    const handleRouteForSignature = async (partyName, email) => {
        if (!savedContractId) {
            alert("Please save the draft first before routing for signature.");
            return;
        }
        if (!email) {
            alert(`Please provide an email address for ${partyName} in the form details.`);
            return;
        }
        
        setIsSigning(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/lex-pro/route-signature', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({
                    contractId: savedContractId,
                    partyName: partyName,
                    email: email
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(`Sequential Routing Initiated!\nAn execution link has been securely emailed to ${partyName} at ${email}.`);
            } else {
                alert(`Error routing for signature: ${data.error}`);
            }
        } catch (err) {
            alert(`Network error: ${err.message}`);
        } finally {
            setIsSigning(false);
        }
    };

    const handleExportPDF = () => {
        if (!generatedDraft) return;
        const doc = new jsPDF();
        
        doc.setFont("times", "normal");
        
        let y = 20;
        
        if (formData.printFormat === 'Standard A4') {
            doc.setFontSize(16);
            doc.setFont("times", "bold");
            doc.text(`EyE PunE Legal - ${formData.contractType.toUpperCase()} Draft`, 105, 20, null, null, "center");
            y = 35;
        } else if (formData.printFormat === 'Company Letterhead') {
            y = 50; // 50mm top margin for branding
        } else if (formData.printFormat === 'Indian Stamp Paper') {
            y = 120; // 120mm top margin for physical stamp
        }
        
        doc.setFontSize(12);
        doc.setFont("times", "normal");
        
        // Split text to fit page width (approx 170mm out of 210mm A4)
        const lines = doc.splitTextToSize(generatedDraft, 170);
        
        let bottomMarginLimit = formData.printFormat === 'Company Letterhead' ? 245 : 280;
        let defaultTopMargin = formData.printFormat === 'Company Letterhead' ? 50 : 20;
        
        for (let i = 0; i < lines.length; i++) {
            if (y > bottomMarginLimit) { 
                doc.addPage();
                y = defaultTopMargin; 
            }
            doc.text(lines[i], 20, y);
            y += 7; // line spacing
        }
        
        if (auditTrails.length > 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.setFont("times", "bold");
            doc.text(`DIGITAL AUDIT TRAIL CERTIFICATE`, 105, 30, null, null, "center");
            
            doc.setFontSize(11);
            doc.setFont("times", "normal");
            let ay = 50;
            
            auditTrails.forEach((trail, index) => {
                doc.text(`Signature ${index + 1}: ${trail.party_name}`, 20, ay);
                doc.text(`IP Address: ${trail.ip_address}`, 20, ay + 7);
                doc.text(`Timestamp: ${new Date(trail.signed_at).toLocaleString()}`, 20, ay + 14);
                doc.text(`Document Hash (SHA-256): ${trail.document_hash.substring(0, 40)}...`, 20, ay + 21);
                doc.text(`User Agent: ${trail.user_agent.substring(0, 70)}...`, 20, ay + 28);
                ay += 45;
            });
        }
        
        doc.save(`LexPro_${formData.contractType}_Draft.pdf`);
    };

    const handleCopyShareLink = () => {
        if (!savedContractId) return;
        const url = `${window.location.origin}/lex-pro/sign/${savedContractId}`;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
            
            {!showCanvas ? (
            <div className="w-full max-w-3xl mx-auto flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
                <div className="p-6 border-b border-white/10 bg-black/20">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-blue-400" />
                        AI Contract Drafter
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Configure parameters to generate an India-compliant draft.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Contract Type</label>
                        <select 
                            name="contractType" 
                            value={formData.contractType} 
                            onChange={handleInputChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                        >
                            <option value="nda">Non-Disclosure Agreement (NDA)</option>
                            <option value="employment">Employment Agreement</option>
                            <option value="service">Master Service Agreement (MSA)</option>
                            <option value="freelance">Independent Contractor / Freelance Agreement</option>
                            <option value="consulting">Consulting Agreement</option>
                            <option value="founders">Founders / Co-Founders Agreement</option>
                            <option value="shareholders">Shareholder Agreement (SHA)</option>
                            <option value="partnership">Partnership Deed</option>
                            <option value="joint_venture">Joint Venture Agreement</option>
                            <option value="mou">Memorandum of Understanding (MoU)</option>
                            <option value="saas">Software as a Service (SaaS) Agreement</option>
                            <option value="terms">Terms of Service & Privacy Policy</option>
                            <option value="lease">Commercial Lease Agreement</option>
                            <option value="rent">Residential Rent Agreement</option>
                            <option value="vendor">Vendor Agreement</option>
                            <option value="franchise">Franchise Agreement</option>
                        </select>
                    </div>

                    <div className="space-y-4 p-5 bg-white/[0.02] border border-white/10 rounded-xl">
                        <h3 className="text-sm font-bold text-blue-400">Party A Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Entity Name</label>
                                <input type="text" name="partyA" value={formData.partyA} onChange={handleInputChange} placeholder="e.g. EyE PunE Vision" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Entity Type</label>
                                <select name="partyAType" value={formData.partyAType} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 appearance-none text-sm">
                                    <option value="Private Limited Company">Private Limited Company</option>
                                    <option value="Public Limited Company">Public Limited Company</option>
                                    <option value="Limited Liability Partnership (LLP)">LLP</option>
                                    <option value="Partnership Firm">Partnership Firm</option>
                                    <option value="Proprietorship">Proprietorship</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Trust/Society">Trust/Society</option>
                                </select>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-medium text-gray-400">Registered Address</label>
                                <textarea name="partyAAddress" value={formData.partyAAddress} onChange={handleInputChange} placeholder="Full registered address..." rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 resize-none text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Authorized Signatory (if applicable)</label>
                                <input type="text" name="partyASignatory" value={formData.partyASignatory} onChange={handleInputChange} placeholder="e.g. Jane Doe, Director" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">CIN / PAN / GSTIN</label>
                                <input type="text" name="partyAIdentifier" value={formData.partyAIdentifier} onChange={handleInputChange} placeholder="Registration number..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Email Address (For Routing)</label>
                                <input type="email" name="partyAEmail" value={formData.partyAEmail} onChange={handleInputChange} placeholder="partyA@example.com" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-5 bg-white/[0.02] border border-white/10 rounded-xl">
                        <h3 className="text-sm font-bold text-blue-400">Party B Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Entity Name</label>
                                <input type="text" name="partyB" value={formData.partyB} onChange={handleInputChange} placeholder="e.g. John Doe" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Entity Type</label>
                                <select name="partyBType" value={formData.partyBType} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 appearance-none text-sm">
                                    <option value="Individual">Individual</option>
                                    <option value="Private Limited Company">Private Limited Company</option>
                                    <option value="Public Limited Company">Public Limited Company</option>
                                    <option value="Limited Liability Partnership (LLP)">LLP</option>
                                    <option value="Partnership Firm">Partnership Firm</option>
                                    <option value="Proprietorship">Proprietorship</option>
                                    <option value="Trust/Society">Trust/Society</option>
                                </select>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-medium text-gray-400">Registered Address</label>
                                <textarea name="partyBAddress" value={formData.partyBAddress} onChange={handleInputChange} placeholder="Full registered address..." rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 resize-none text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Authorized Signatory (if applicable)</label>
                                <input type="text" name="partyBSignatory" value={formData.partyBSignatory} onChange={handleInputChange} placeholder="e.g. John Smith, CEO" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">CIN / PAN / Aadhaar</label>
                                <input type="text" name="partyBIdentifier" value={formData.partyBIdentifier} onChange={handleInputChange} placeholder="Identification number..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Email Address (For Routing)</label>
                                <input type="email" name="partyBEmail" value={formData.partyBEmail} onChange={handleInputChange} placeholder="partyB@example.com" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Effective Date</label>
                            <input 
                                type="date" 
                                name="effectiveDate" 
                                value={formData.effectiveDate} 
                                onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Execution Method</label>
                            <select 
                                name="signatureType" 
                                value={formData.signatureType} 
                                onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                            >
                                <option value="E-Signature">E-Signature (IP & Geo-Tag)</option>
                                <option value="Wet Signature">Manual Wet Signature</option>
                                <option value="Digital Audit Trail">Digital Audit Trail (Clickwrap)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Print Layout Format</label>
                        <select 
                            name="printFormat" 
                            value={formData.printFormat} 
                            onChange={handleInputChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                        >
                            <option value="Standard A4">Standard A4 (Default Margins)</option>
                            <option value="Company Letterhead">Company Letterhead (Large Header/Footer Margins)</option>
                            <option value="Indian Stamp Paper">Indian Stamp Paper (Massive First Page Margin)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Jurisdiction</label>
                            <input 
                                type="text" 
                                name="jurisdiction" 
                                value={formData.jurisdiction} 
                                onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Governing Law</label>
                            <input 
                                type="text" 
                                name="governingLaw" 
                                value={formData.governingLaw} 
                                onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm"
                            />
                        </div>
                    </div>

                    {/* Dynamic Contract-Specific Fields */}
                    {contractSchema[formData.contractType] && (
                        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-4">
                            <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Specific Contract Details
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {contractSchema[formData.contractType].map((field) => (
                                    <div key={field.id} className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-300">{field.label}</label>
                                        <input 
                                            type="text" 
                                            value={dynamicAnswers[field.id] || ''} 
                                            onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500/50 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Specific Clauses or Context (Optional)</label>
                        <textarea 
                            name="additionalTerms" 
                            value={formData.additionalTerms} 
                            onChange={handleInputChange}
                            placeholder="Any specific terms to include..."
                            className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20">
                    <Button 
                        onClick={generateDraft}
                        disabled={isGenerating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] h-12"
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Draft...</>
                        ) : (
                            <><Wand2 className="w-5 h-5 mr-2" /> Generate Contract</>
                        )}
                    </Button>
                </div>
            </div>
            ) : (
            <div className="w-full flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl relative animate-in fade-in zoom-in-95 duration-300">
                
                {/* Editor Toolbar */}
                <div className="h-16 border-b border-white/10 bg-black/20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowCanvas(false)}
                            className="text-gray-400 hover:text-white mr-4 hover:bg-white/5"
                        >
                            ← Back
                        </Button>
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-200">
                            {generatedDraft ? 'Generated Draft - ' + (formData.contractType === 'nda' ? 'NDA' : formData.contractType) : 'Editor Canvas'}
                        </span>
                    </div>
                    
                    {generatedDraft && (
                        <div className="flex items-center gap-2">
                                <Button 
                                    onClick={handleSaveDraft} 
                                    disabled={isSaving}
                                    variant="outline" 
                                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                >
                                    {isSaving ? 'Saving...' : 'Save Draft'}
                                </Button>
                                {formData.signatureType === 'Digital Audit Trail' && savedContractId && (
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={handleCopyShareLink}
                                            variant="outline"
                                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                        >
                                            {isCopied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                                            {isCopied ? 'Copied!' : 'Copy Share Link'}
                                        </Button>
                                        <Button 
                                            onClick={() => handleRouteForSignature(formData.partyA || 'Party A', formData.partyAEmail)} 
                                            disabled={isSigning || auditTrails.some(t => t.party_name === (formData.partyA || 'Party A'))} 
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            {auditTrails.some(t => t.party_name === (formData.partyA || 'Party A')) ? 'Party A Signed ✓' : 'Route to Party A'}
                                        </Button>
                                        <Button 
                                            onClick={() => handleRouteForSignature(formData.partyB || 'Party B', formData.partyBEmail)} 
                                            disabled={isSigning || auditTrails.some(t => t.party_name === (formData.partyB || 'Party B'))} 
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            {auditTrails.some(t => t.party_name === (formData.partyB || 'Party B')) ? 'Party B Signed ✓' : 'Route to Party B'}
                                        </Button>
                                    </div>
                                )}
                                
                                {generatedDraft && (
                                    <Button 
                                        onClick={() => setShowVersions(!showVersions)}
                                        variant="outline"
                                        className="border-white/10 bg-white/5 text-gray-300 hover:text-white"
                                    >
                                        <History className="w-4 h-4 mr-2" /> History
                                    </Button>
                                )}
                                <Button 
                                    onClick={handleExportPDF} 
                                    className="bg-gradient-to-r from-blue-600 to-slate-600 text-white border-0 hover:from-blue-700 hover:to-slate-700"
                                >
                                    Export PDF
                                </Button>
                        </div>
                    )}
                </div>

                {/* Main Editor + Version History Wrapper */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
                        {!generatedDraft && !isGenerating && (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-50">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Draft</h3>
                            <p className="text-gray-400">Fill out the parameters on the left and click "Generate Contract" to see the AI drafted document here.</p>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full mb-6"
                            />
                            <h3 className="text-xl font-bold text-white mb-2">AI is Drafting...</h3>
                            <p className="text-blue-400 animate-pulse">Aligning with Indian Contract Act guidelines</p>
                        </div>
                    )}

                    {generatedDraft && !isGenerating && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-3xl mx-auto shadow-2xl"
                        >
                            <textarea 
                                className="w-full h-full min-h-[500px] bg-transparent text-gray-300 font-serif leading-relaxed focus:outline-none resize-none"
                                value={generatedDraft}
                                onChange={(e) => setGeneratedDraft(e.target.value)}
                            />
                        </motion.div>
                    )}
                </div>
                    
                    {/* Version History Sidebar */}
                    {showVersions && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            className="border-l border-white/10 bg-black/40 overflow-y-auto shrink-0 flex flex-col"
                        >
                            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center sticky top-0">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <History className="w-4 h-4 text-blue-400" /> Version History
                                </h3>
                                <Button size="sm" onClick={handleSaveSnapshot} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2">
                                    + Snapshot
                                </Button>
                            </div>
                            <div className="p-4 space-y-3">
                                {versions.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-center py-4">No snapshots saved yet.</p>
                                ) : (
                                    versions.map(v => (
                                        <div key={v.id} className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/30 transition-colors group">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-sm text-white">{v.id}</span>
                                                <span className="text-[10px] text-gray-500">{v.timestamp}</span>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleRestoreVersion(v.content)}
                                                className="w-full h-7 text-xs border-white/10 bg-black hover:bg-blue-500/20 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Restore Version
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
            )}
            
        </div>
    );
}
