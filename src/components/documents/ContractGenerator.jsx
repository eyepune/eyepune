import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2, Sparkles, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import { DatePicker } from "@/components/ui/date-picker";

const contractTemplates = {
    service_agreement: {
        title: "Service Agreement",
        terms: `1. SERVICES: The service provider agrees to provide the services as outlined in the Scope of Work.\n\n2. PAYMENT: Client agrees to pay the contract value according to the payment terms.\n\n3. TERM: This agreement begins on the start date and continues until completion.\n\n4. CONFIDENTIALITY: Both parties agree to maintain confidentiality of proprietary information.\n\n5. TERMINATION: Either party may terminate with 30 days written notice.\n\n6. INTELLECTUAL PROPERTY: All deliverables remain the property of EyE PunE until full payment is received.\n\n7. LIABILITY: Services are provided "as is" without warranty of any kind.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of India.`
    },
    nda: {
        title: "Non-Disclosure Agreement",
        terms: `1. DEFINITION: "Confidential Information" means any information disclosed by either party.\n\n2. OBLIGATION: Receiving party agrees not to disclose confidential information.\n\n3. EXCLUSIONS: Information that is publicly available is not confidential.\n\n4. TERM: This agreement remains in effect for 2 years from the date of signing.\n\n5. RETURN OF MATERIALS: Upon termination, all confidential materials must be returned.\n\n6. REMEDIES: Breach of this agreement may result in legal action.\n\n7. GOVERNING LAW: This agreement shall be governed by the laws of India.`
    },
    retainer: {
        title: "Retainer Agreement",
        terms: `1. RETAINER SERVICES: Client retains service provider for ongoing services.\n\n2. MONTHLY FEE: Client agrees to pay the specified monthly retainer fee.\n\n3. SCOPE: Services include those outlined in the Scope of Work section.\n\n4. TERM: This retainer is for a minimum period as specified.\n\n5. RENEWAL: Agreement auto-renews unless terminated with 30 days notice.\n\n6. ADDITIONAL WORK: Work beyond scope will be billed separately.\n\n7. PAYMENT: Monthly payments are due on the 1st of each month.\n\n8. TERMINATION: Either party may terminate with 30 days written notice.`
    },
    partnership_agreement: {
        title: "Partnership Agreement",
        terms: `1. PARTNERSHIP: Both parties agree to collaborate as outlined in this agreement.\n\n2. RESPONSIBILITIES: Each party's responsibilities are detailed in the Scope of Work.\n\n3. REVENUE SHARING: Financial arrangements are as per the payment terms section.\n\n4. TERM: This partnership is effective from the start date.\n\n5. JOINT VENTURES: Both parties will work together on mutually agreed projects.\n\n6. CONFIDENTIALITY: All business information shared remains confidential.\n\n7. TERMINATION: Either party may terminate with 60 days written notice.\n\n8. DISPUTE RESOLUTION: Any disputes shall be resolved through mediation first.\n\n9. GOVERNING LAW: This agreement shall be governed by the laws of India.`
    },
    revenue_sharing: {
        title: "Revenue Sharing Agreement",
        terms: `1. REVENUE SPLIT: Revenue will be shared as per the agreed percentages in payment terms.\n\n2. REPORTING: Monthly revenue reports will be provided to all parties.\n\n3. PAYMENT SCHEDULE: Payments will be made within 15 days of month end.\n\n4. SCOPE: Revenue sharing applies to projects/services outlined in scope of work.\n\n5. EXPENSES: Operating expenses will be shared proportionally.\n\n6. TERM: This agreement continues for the specified period.\n\n7. AUDIT RIGHTS: Each party has the right to audit financial records.\n\n8. TERMINATION: Either party may terminate with 90 days notice.\n\n9. GOVERNING LAW: This agreement shall be governed by the laws of India.`
    },
    referral_agreement: {
        title: "Referral Agreement",
        terms: `1. REFERRAL PROGRAM: Partner agrees to refer clients to EyE PunE.\n\n2. COMMISSION: Partner will receive commission as outlined in payment terms.\n\n3. QUALIFIED REFERRALS: Only paying clients qualify for commission.\n\n4. PAYMENT: Commission paid within 30 days of client payment receipt.\n\n5. TRACKING: Unique referral codes/links will be provided for tracking.\n\n6. TERM: This agreement is ongoing until terminated.\n\n7. NON-COMPETE: Partner agrees not to directly compete during active period.\n\n8. TERMINATION: Either party may terminate with 30 days notice.\n\n9. GOVERNING LAW: This agreement shall be governed by the laws of India.`
    },
    growth_sales_partnership: {
        title: "Growth & Sales Partnership Agreement",
        terms: `1. PARTNERSHIP OBJECTIVE: Both parties agree to collaborate on business growth, lead generation, sales, and market expansion initiatives.\n\n2. ROLES & RESPONSIBILITIES: Each party's specific roles are detailed in the Scope of Work section.\n\n3. REVENUE SHARING: Performance-based compensation as per the payment terms, with revenue shared according to agreed percentages.\n\n4. LEAD GENERATION: Partner will actively generate qualified leads and opportunities for mutual business growth.\n\n5. SALES SUPPORT: Partner will provide sales support, client engagement, and business development activities.\n\n6. PERFORMANCE METRICS: Success will be measured through KPIs including leads generated, conversions, and revenue generated.\n\n7. PAYMENT TERMS: Payments will be released as per the payment schedule outlined in this agreement.\n\n8. INTELLECTUAL PROPERTY: All marketing materials, branding, and IP remain the property of respective parties.\n\n9. CONFIDENTIALITY: All business information, strategies, and client data remain strictly confidential.\n\n10. TERM & TERMINATION: This is an open-ended agreement subject to termination by either party with 60 days written notice.\n\n11. NON-SOLICITATION: During the term and for 12 months after termination, neither party shall solicit the other's employees or clients.\n\n12. DISPUTE RESOLUTION: Any disputes shall be resolved through mediation, and if necessary, arbitration in accordance with Indian laws.\n\n13. GOVERNING LAW: This agreement shall be governed by the laws of India.`
    }
};

export default function ContractGenerator({ open, onOpenChange, lead }) {
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    
    const { data: templates = [] } = useQuery({
        queryKey: ['templates', 'contract'],
        queryFn: () => base44.entities.DocumentTemplate.filter({ document_type: 'contract', is_active: true })
    });

    const [formData, setFormData] = useState({
        contract_category: 'client',
        party_name: lead?.full_name || '',
        party_email: lead?.email || '',
        company_name: lead?.company || '',
        contract_type: 'service_agreement',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        contract_value: '',
        payment_terms: 'Net 30',
        scope_of_work: '',
        deliverables: '',
        terms_and_conditions: contractTemplates.service_agreement.terms
    });
    const [aiLoading, setAiLoading] = useState('');
    const [legalReview, setLegalReview] = useState(null);
    const [suggestedClauses, setSuggestedClauses] = useState([]);

    const createContractMutation = useMutation({
        mutationFn: async ({ formData, shouldSendForSignature }) => {
            const contract = await base44.entities.Contract.create({
                ...formData,
                contract_number: `CONT-${Date.now()}`,
                deliverables: formData.deliverables.split('\n').filter(d => d.trim()),
                status: 'draft'
            });
            
            if (shouldSendForSignature) {
                await base44.functions.invoke('sendContractForSignature', { 
                    contract_id: contract.id 
                });
            }
            
            return { contract, wasSent: shouldSendForSignature };
        },
        onSuccess: ({ contract, wasSent }) => {
            queryClient.invalidateQueries(['contracts']);
            if (wasSent) {
                alert('Contract saved and sent for signature!');
            }
            onOpenChange(false);
        }
    });

    const handleChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'contract_type') {
                updated.terms_and_conditions = contractTemplates[value]?.terms || '';
            }
            return updated;
        });
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        // Header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text(contractTemplates[formData.contract_type].title, pageWidth / 2, y, { align: 'center' });
        
        y += 20;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        // Contract Details
        const partyLabel = formData.contract_category === 'partnership' ? 'Partner' : 'Client';
        const details = [
            `Date: ${new Date().toLocaleDateString()}`,
            ``,
            `${partyLabel}: ${formData.party_name}`,
            `Company: ${formData.company_name || 'N/A'}`,
            `Email: ${formData.party_email}`,
            ``,
            `Contract Value: ${isNaN(Number(formData.contract_value)) ? formData.contract_value : '₹' + Number(formData.contract_value).toLocaleString()}`,
            `Start Date: ${formData.start_date}`,
            `End Date: ${formData.end_date || 'Open-ended'}`,
            `Payment Terms: ${formData.payment_terms}`,
            ``,
            `SCOPE OF WORK:`,
            formData.scope_of_work,
            ``,
            `DELIVERABLES:`,
            ...formData.deliverables.split('\n').map(d => `• ${d}`),
            ``,
            `TERMS AND CONDITIONS:`,
            formData.terms_and_conditions
        ];

        doc.setFontSize(10);
        details.forEach(line => {
            const lines = doc.splitTextToSize(line, pageWidth - 40);
            lines.forEach(splitLine => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(splitLine, 20, y);
                y += 6;
            });
        });

        // Signature section
        if (y > 240) {
            doc.addPage();
            y = 20;
        }
        y += 20;
        const signatureLabel = formData.contract_category === 'partnership' ? 'Partner Signature' : 'Client Signature';
        doc.line(20, y, 90, y);
        doc.text(signatureLabel, 20, y + 7);
        doc.text(`Date: _____________`, 20, y + 14);

        doc.line(120, y, 190, y);
        doc.text('EyE PunE Representative', 120, y + 7);
        doc.text(`Date: _____________`, 120, y + 14);

        return doc;
    };

    const [sendForSignature, setSendForSignature] = useState(false);

    const handleSaveAndDownload = () => {
        createContractMutation.mutate(
            { formData, shouldSendForSignature: sendForSignature },
            {
                onSuccess: ({ contract, wasSent }) => {
                    if (!wasSent) {
                        const doc = generatePDF();
                        doc.save(`contract-${formData.party_name.replace(/\s+/g, '-')}.pdf`);
                    }
                }
            }
        );
    };

    const generateScopeWithAI = async () => {
        if (!formData.contract_type || !formData.contract_category) return;
        setAiLoading('scope');
        try {
            const prompt = `Generate a detailed Scope of Work for a ${formData.contract_type.replace(/_/g, ' ')} in the ${formData.contract_category} category.
Contract details:
- Party: ${formData.party_name || 'Client/Partner'}
- Company: ${formData.company_name || 'N/A'}
- Contract Value: ₹${formData.contract_value || 'TBD'}
- Type: ${formData.contract_category === 'partnership' ? 'Partnership' : 'Client Services'}

Include specific, actionable items and clear responsibilities. Be professional and comprehensive.`;

            const result = await base44.integrations.Core.InvokeLLM({ prompt });
            handleChange('scope_of_work', result);
        } catch (error) {
            alert('Failed to generate scope');
        }
        setAiLoading('');
    };

    const generateDeliverablesWithAI = async () => {
        if (!formData.scope_of_work) {
            alert('Please add Scope of Work first');
            return;
        }
        setAiLoading('deliverables');
        try {
            const prompt = `Based on this Scope of Work, generate a detailed list of deliverables (one per line):

${formData.scope_of_work}

Contract type: ${formData.contract_type.replace(/_/g, ' ')}
Category: ${formData.contract_category}

Return only the deliverable items, one per line, without numbering.`;

            const result = await base44.integrations.Core.InvokeLLM({ prompt });
            handleChange('deliverables', result);
        } catch (error) {
            alert('Failed to generate deliverables');
        }
        setAiLoading('');
    };

    const getSuggestedClauses = async () => {
        setAiLoading('clauses');
        try {
            const prompt = `Suggest 3-5 additional important clauses for a ${formData.contract_type.replace(/_/g, ' ')} in the ${formData.contract_category} category.

Current contract details:
- Value: ₹${formData.contract_value || 'TBD'}
- Payment Terms: ${formData.payment_terms}
- Scope: ${formData.scope_of_work || 'Not specified'}

Return as JSON array of objects with 'title' and 'description' fields.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        clauses: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setSuggestedClauses(result.clauses || []);
        } catch (error) {
            alert('Failed to get clause suggestions');
        }
        setAiLoading('');
    };

    const performLegalReview = async () => {
        if (!formData.terms_and_conditions) {
            alert('Please add terms and conditions first');
            return;
        }
        setAiLoading('review');
        try {
            const prompt = `Perform a legal review of these contract terms for a ${formData.contract_type.replace(/_/g, ' ')} in India.

Terms:
${formData.terms_and_conditions}

Contract context:
- Category: ${formData.contract_category}
- Value: ₹${formData.contract_value || 'TBD'}
- Scope: ${formData.scope_of_work?.substring(0, 200) || 'Not specified'}

Provide:
1. Overall assessment (strong/moderate/weak)
2. 2-3 key strengths
3. 2-3 areas of concern or missing clauses
4. Specific recommendations

Return as JSON.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        assessment: { type: "string" },
                        strengths: { type: "array", items: { type: "string" } },
                        concerns: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } }
                    }
                }
            });
            setLegalReview(result);
        } catch (error) {
            alert('Failed to perform legal review');
        }
        setAiLoading('');
    };

    const addClauseToTerms = (clause) => {
        const currentTerms = formData.terms_and_conditions;
        const newClause = `\n\n${clause.title.toUpperCase()}: ${clause.description}`;
        handleChange('terms_and_conditions', currentTerms + newClause);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Generate Contract
                    </DialogTitle>
                </DialogHeader>

                {templates.length > 0 && (
                    <div>
                        <Label>Load from Template (Optional)</Label>
                        <Select
                            value={selectedTemplate?.id || ''}
                            onValueChange={(val) => {
                                const template = templates.find(t => t.id === val);
                                if (template) {
                                    setSelectedTemplate(template);
                                    setFormData({
                                        ...formData,
                                        contract_category: template.template_data.contract_category || 'client',
                                        contract_type: template.template_data.contract_type || 'service_agreement',
                                        payment_terms: template.template_data.default_payment_terms || '',
                                        scope_of_work: template.template_data.default_scope || '',
                                        deliverables: template.template_data.default_deliverables || '',
                                        terms_and_conditions: template.template_data.default_terms || ''
                                    });
                                    base44.entities.DocumentTemplate.update(val, {
                                        usage_count: (template.usage_count || 0) + 1
                                    });
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        <div className="flex items-center gap-2">
                                            {template.template_name}
                                            {template.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedTemplate && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedTemplate.template_description}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <Label>Contract Category *</Label>
                        <Select value={formData.contract_category} onValueChange={(v) => handleChange('contract_category', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="client">Client Contract</SelectItem>
                                <SelectItem value="partnership">Partnership Contract</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>{formData.contract_category === 'partnership' ? 'Partner Name' : 'Client Name'} *</Label>
                            <Input
                                value={formData.party_name}
                                onChange={(e) => handleChange('party_name', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>{formData.contract_category === 'partnership' ? 'Partner Email' : 'Client Email'} *</Label>
                            <Input
                                type="email"
                                value={formData.party_email}
                                onChange={(e) => handleChange('party_email', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Company Name</Label>
                            <Input
                                value={formData.company_name}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Contract Type *</Label>
                            <Select value={formData.contract_type} onValueChange={(v) => handleChange('contract_type', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {formData.contract_category === 'client' ? (
                                        <>
                                            <SelectItem value="service_agreement">Service Agreement</SelectItem>
                                            <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                                            <SelectItem value="retainer">Retainer Agreement</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="growth_sales_partnership">Growth & Sales Partnership Agreement</SelectItem>
                                            <SelectItem value="partnership_agreement">Partnership Agreement</SelectItem>
                                            <SelectItem value="revenue_sharing">Revenue Sharing Agreement</SelectItem>
                                            <SelectItem value="referral_agreement">Referral Agreement</SelectItem>
                                            <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <Label>Start Date *</Label>
                            <DatePicker
                                value={formData.start_date}
                                onChange={(val) => handleChange('start_date', val)}
                            />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <DatePicker
                                value={formData.end_date}
                                onChange={(val) => handleChange('end_date', val)}
                                placeholder="Leave empty for open-ended"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Leave empty for open-ended contracts</p>
                        </div>
                        <div>
                            <Label>Contract Value (₹)</Label>
                            <Input
                                type="text"
                                value={formData.contract_value}
                                onChange={(e) => handleChange('contract_value', e.target.value)}
                                placeholder="e.g., 50000 or Performance-based"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Enter amount or text like "Performance-based"</p>
                        </div>
                    </div>

                    <div>
                        <Label>Payment Terms</Label>
                        <Textarea
                            value={formData.payment_terms}
                            onChange={(e) => handleChange('payment_terms', e.target.value)}
                            placeholder="e.g., Net 30, 50% upfront + 50% on completion, or Net 30 (Payments released within 15 days of revenue realization)"
                            rows={2}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Scope of Work *</Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={generateScopeWithAI}
                                disabled={aiLoading === 'scope'}
                            >
                                {aiLoading === 'scope' ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" /> AI Draft</>
                                )}
                            </Button>
                        </div>
                        <Textarea
                            value={formData.scope_of_work}
                            onChange={(e) => handleChange('scope_of_work', e.target.value)}
                            placeholder="Describe the services to be provided..."
                            rows={4}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Deliverables (one per line) *</Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={generateDeliverablesWithAI}
                                disabled={aiLoading === 'deliverables' || !formData.scope_of_work}
                            >
                                {aiLoading === 'deliverables' ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" /> AI Generate</>
                                )}
                            </Button>
                        </div>
                        <Textarea
                            value={formData.deliverables}
                            onChange={(e) => handleChange('deliverables', e.target.value)}
                            placeholder="Website design&#10;Mobile app development&#10;SEO optimization"
                            rows={4}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Terms & Conditions</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={getSuggestedClauses}
                                    disabled={aiLoading === 'clauses'}
                                >
                                    {aiLoading === 'clauses' ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" /> Suggest Clauses</>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={performLegalReview}
                                    disabled={aiLoading === 'review'}
                                >
                                    {aiLoading === 'review' ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reviewing...</>
                                    ) : (
                                        <><AlertCircle className="w-4 h-4 mr-2" /> Legal Review</>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            value={formData.terms_and_conditions}
                            onChange={(e) => handleChange('terms_and_conditions', e.target.value)}
                            rows={8}
                            className="font-mono text-xs"
                        />
                        
                        {suggestedClauses.length > 0 && (
                            <div className="mt-3 p-3 border rounded-lg bg-muted/30">
                                <p className="text-sm font-medium mb-2">💡 Suggested Clauses:</p>
                                <div className="space-y-2">
                                    {suggestedClauses.map((clause, idx) => (
                                        <div key={idx} className="flex items-start justify-between gap-2 text-sm p-2 bg-background rounded border">
                                            <div>
                                                <p className="font-semibold">{clause.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{clause.description}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => addClauseToTerms(clause)}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {legalReview && (
                            <Alert className="mt-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-semibold mb-1">
                                                Assessment: <span className={legalReview.assessment === 'strong' ? 'text-green-600' : legalReview.assessment === 'weak' ? 'text-red-600' : 'text-yellow-600'}>
                                                    {legalReview.assessment}
                                                </span>
                                            </p>
                                        </div>
                                        
                                        {legalReview.strengths?.length > 0 && (
                                            <div>
                                                <p className="font-semibold text-sm flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3 text-green-600" /> Strengths:
                                                </p>
                                                <ul className="text-xs ml-4 mt-1 space-y-1">
                                                    {legalReview.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {legalReview.concerns?.length > 0 && (
                                            <div>
                                                <p className="font-semibold text-sm flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3 text-yellow-600" /> Concerns:
                                                </p>
                                                <ul className="text-xs ml-4 mt-1 space-y-1">
                                                    {legalReview.concerns.map((c, i) => <li key={i}>• {c}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {legalReview.recommendations?.length > 0 && (
                                            <div>
                                                <p className="font-semibold text-sm">Recommendations:</p>
                                                <ul className="text-xs ml-4 mt-1 space-y-1">
                                                    {legalReview.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <Checkbox 
                                id="sendForSignature" 
                                checked={sendForSignature}
                                onCheckedChange={setSendForSignature}
                            />
                            <label
                                htmlFor="sendForSignature"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                Send for e-signature via email (party will receive signing link)
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSaveAndDownload}
                                disabled={createContractMutation.isPending || !formData.party_name || !formData.party_email}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {createContractMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                ) : sendForSignature ? (
                                    <><Send className="w-4 h-4 mr-2" /> Save & Send for Signature</>
                                ) : (
                                    <><Download className="w-4 h-4 mr-2" /> Save & Download PDF</>
                                )}
                            </Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}