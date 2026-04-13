import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2, Plus, Trash2 } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import jsPDF from 'jspdf';

export default function ProposalGenerator({ open, onOpenChange, lead }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        client_name: lead?.full_name || '',
        client_email: lead?.email || '',
        company_name: lead?.company || '',
        project_title: '',
        project_type: 'web_app',
        executive_summary: '',
        problem_statement: '',
        proposed_solution: '',
        scope_of_work: '',
        timeline: '4-6 weeks',
        pricing_items: [{ description: '', amount: 0 }],
        payment_schedule: '50% upfront, 50% on completion',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const createProposalMutation = useMutation({
        mutationFn: async (data) => {
            const total = data.pricing_items.reduce((sum, item) => sum + Number(item.amount), 0);
            const proposal = await base44.entities.Proposal.create({
                ...data,
                proposal_number: `PROP-${Date.now()}`,
                pricing: {
                    items: data.pricing_items,
                    total
                },
                status: 'draft'
            });
            return proposal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['proposals']);
            onOpenChange(false);
        }
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePricingChange = (index, field, value) => {
        setFormData(prev => {
            const items = [...prev.pricing_items];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, pricing_items: items };
        });
    };

    const addPricingItem = () => {
        setFormData(prev => ({
            ...prev,
            pricing_items: [...prev.pricing_items, { description: '', amount: 0 }]
        }));
    };

    const removePricingItem = (index) => {
        setFormData(prev => ({
            ...prev,
            pricing_items: prev.pricing_items.filter((_, i) => i !== index)
        }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        const addSection = (title, content) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(title, 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(content, pageWidth - 40);
            lines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y);
                y += 6;
            });
            y += 5;
        };

        // Header
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('PROJECT PROPOSAL', pageWidth / 2, y, { align: 'center' });
        y += 15;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Proposal #: ${formData.proposal_title || 'PROP-NEW'}`, 20, y);
        y += 6;
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
        y += 6;
        doc.text(`Valid Until: ${new Date(formData.valid_until).toLocaleDateString()}`, 20, y);
        y += 15;

        // Client Info
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('PREPARED FOR:', 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(formData.client_name, 20, y);
        y += 6;
        if (formData.company_name) {
            doc.text(formData.company_name, 20, y);
            y += 6;
        }
        doc.text(formData.client_email, 20, y);
        y += 15;

        // Sections
        addSection('PROJECT OVERVIEW', formData.project_title);
        addSection('EXECUTIVE SUMMARY', formData.executive_summary);
        addSection('PROBLEM STATEMENT', formData.problem_statement);
        addSection('PROPOSED SOLUTION', formData.proposed_solution);
        addSection('SCOPE OF WORK', formData.scope_of_work);
        addSection('TIMELINE', formData.timeline);

        // Pricing
        if (y > 200) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('PRICING', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        formData.pricing_items.forEach(item => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(item.description, 20, y);
            doc.text(`₹${Number(item.amount).toLocaleString()}`, pageWidth - 60, y);
            y += 8;
        });
        
        y += 5;
        doc.setFont(undefined, 'bold');
        const total = formData.pricing_items.reduce((sum, item) => sum + Number(item.amount), 0);
        doc.text('TOTAL:', 20, y);
        doc.text(`₹${total.toLocaleString()}`, pageWidth - 60, y);
        y += 10;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Payment Schedule: ${formData.payment_schedule}`, 20, y);

        return doc;
    };

    const handleSaveAndDownload = () => {
        createProposalMutation.mutate(formData);
        const doc = generatePDF();
        doc.save(`proposal-${formData.client_name.replace(/\s+/g, '-')}.pdf`);
    };

    const total = formData.pricing_items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Generate Proposal
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Client Name *</Label>
                            <Input value={formData.client_name} onChange={(e) => handleChange('client_name', e.target.value)} />
                        </div>
                        <div>
                            <Label>Client Email *</Label>
                            <Input type="email" value={formData.client_email} onChange={(e) => handleChange('client_email', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Company Name</Label>
                            <Input value={formData.company_name} onChange={(e) => handleChange('company_name', e.target.value)} />
                        </div>
                        <div>
                            <Label>Project Type</Label>
                            <Select value={formData.project_type} onValueChange={(v) => handleChange('project_type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="social_media">Social Media Marketing</SelectItem>
                                    <SelectItem value="web_app">Web/App Development</SelectItem>
                                    <SelectItem value="ai_automation">AI Automation</SelectItem>
                                    <SelectItem value="branding">Branding</SelectItem>
                                    <SelectItem value="full_service">Full Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Project Title *</Label>
                        <Input value={formData.project_title} onChange={(e) => handleChange('project_title', e.target.value)} placeholder="e.g., E-commerce Website Development" />
                    </div>

                    <div>
                        <Label>Executive Summary</Label>
                        <Textarea value={formData.executive_summary} onChange={(e) => handleChange('executive_summary', e.target.value)} placeholder="Brief overview of the proposal..." rows={3} />
                    </div>

                    <div>
                        <Label>Problem Statement</Label>
                        <Textarea value={formData.problem_statement} onChange={(e) => handleChange('problem_statement', e.target.value)} placeholder="What challenges is the client facing?" rows={3} />
                    </div>

                    <div>
                        <Label>Proposed Solution</Label>
                        <Textarea value={formData.proposed_solution} onChange={(e) => handleChange('proposed_solution', e.target.value)} placeholder="How will you solve their problem?" rows={4} />
                    </div>

                    <div>
                        <Label>Scope of Work</Label>
                        <Textarea value={formData.scope_of_work} onChange={(e) => handleChange('scope_of_work', e.target.value)} placeholder="Detailed list of deliverables..." rows={4} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Timeline</Label>
                            <Input value={formData.timeline} onChange={(e) => handleChange('timeline', e.target.value)} placeholder="e.g., 4-6 weeks" />
                        </div>
                        <div>
                            <Label>Valid Until</Label>
                            <DatePicker value={formData.valid_until} onChange={(val) => handleChange('valid_until', val)} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Pricing Breakdown</Label>
                            <Button type="button" size="sm" variant="outline" onClick={addPricingItem}>
                                <Plus className="w-4 h-4 mr-1" /> Add Item
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {formData.pricing_items.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => handlePricingChange(index, 'description', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={item.amount}
                                        onChange={(e) => handlePricingChange(index, 'amount', e.target.value)}
                                        className="w-32"
                                    />
                                    {formData.pricing_items.length > 1 && (
                                        <Button type="button" size="icon" variant="outline" onClick={() => removePricingItem(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-end pt-2 border-t">
                                <div className="text-lg font-bold">Total: ₹{total.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Payment Schedule</Label>
                        <Input value={formData.payment_schedule} onChange={(e) => handleChange('payment_schedule', e.target.value)} />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleSaveAndDownload}
                            disabled={createProposalMutation.isPending || !formData.client_name || !formData.project_title}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {createProposalMutation.isPending ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <><Download className="w-4 h-4 mr-2" /> Save & Download PDF</>
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}