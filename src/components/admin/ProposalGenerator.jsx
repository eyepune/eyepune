import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2 } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ProposalGenerator({ open, onClose, project }) {
    const [formData, setFormData] = useState({
        proposal_number: `PROP-${Date.now()}`,
        client_name: project?.client_name || '',
        client_email: project?.client_email || '',
        date: new Date().toISOString().split('T')[0],
        valid_until: '',
        project_title: project?.project_name || '',
        executive_summary: '',
        scope_of_work: '',
        deliverables: '',
        timeline: '',
        investment: '',
        terms_conditions: 'Payment Terms: 50% advance, 50% on completion\nValidity: 30 days from proposal date\nRevisions: 2 rounds of revisions included'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const element = document.getElementById('proposal-preview');
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Proposal-${formData.proposal_number}.pdf`);
            toast.success('Proposal generated successfully!');
            onClose();
        } catch (error) {
            console.error('Error generating proposal:', error);
            toast.error('Failed to generate proposal');
        }
        setIsGenerating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Generate Proposal</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Proposal Number</Label>
                                <Input
                                    value={formData.proposal_number}
                                    onChange={(e) => setFormData({ ...formData, proposal_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Date</Label>
                                <DatePicker
                                    value={formData.date}
                                    onChange={(val) => setFormData({ ...formData, date: val })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Valid Until</Label>
                            <DatePicker
                                value={formData.valid_until}
                                onChange={(val) => setFormData({ ...formData, valid_until: val })}
                            />
                        </div>

                        <div>
                            <Label>Client Name</Label>
                            <Input
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Project Title</Label>
                            <Input
                                value={formData.project_title}
                                onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Executive Summary</Label>
                            <Textarea
                                value={formData.executive_summary}
                                onChange={(e) => setFormData({ ...formData, executive_summary: e.target.value })}
                                placeholder="Brief overview of the project and value proposition..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <div>
                            <Label>Scope of Work</Label>
                            <Textarea
                                value={formData.scope_of_work}
                                onChange={(e) => setFormData({ ...formData, scope_of_work: e.target.value })}
                                placeholder="Detailed description of services to be provided..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div>
                            <Label>Deliverables</Label>
                            <Textarea
                                value={formData.deliverables}
                                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                                placeholder="List of deliverables (one per line)..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <div>
                            <Label>Timeline</Label>
                            <Textarea
                                value={formData.timeline}
                                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                placeholder="Project timeline and milestones..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <div>
                            <Label>Investment</Label>
                            <Input
                                value={formData.investment}
                                onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                                placeholder="e.g., ₹50,000 - ₹75,000"
                            />
                        </div>

                        <div>
                            <Label>Terms & Conditions</Label>
                            <Textarea
                                value={formData.terms_conditions}
                                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                                className="min-h-[100px]"
                            />
                        </div>

                        <Button
                            onClick={generatePDF}
                            disabled={isGenerating}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Generate & Download PDF
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Preview */}
                    <div className="border rounded-lg p-4 bg-white overflow-y-auto max-h-[calc(90vh-100px)]">
                        <div id="proposal-preview" className="p-8 bg-white text-black">
                            {/* Letterhead */}
                            <div className="border-b-2 border-red-600 pb-4 mb-8">
                                <h1 className="text-4xl font-bold text-red-600">EyE PunE</h1>
                                <p className="text-sm text-gray-600 mt-1">Connect - Engage - Grow</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Email: connect@eyepune.com | Phone: +91 9284712033
                                </p>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-3xl font-bold mb-3">PROPOSAL</h2>
                                <div className="text-sm space-y-1">
                                    <p><strong>Proposal #:</strong> {formData.proposal_number}</p>
                                    <p><strong>Date:</strong> {formData.date}</p>
                                    <p><strong>Valid Until:</strong> {formData.valid_until}</p>
                                    <p className="mt-3"><strong>Prepared For:</strong> {formData.client_name}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-red-600 mb-2">{formData.project_title}</h3>
                            </div>

                            {formData.executive_summary && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-1">Executive Summary</h4>
                                    <p className="text-sm whitespace-pre-line text-gray-700">{formData.executive_summary}</p>
                                </div>
                            )}

                            {formData.scope_of_work && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-1">Scope of Work</h4>
                                    <p className="text-sm whitespace-pre-line text-gray-700">{formData.scope_of_work}</p>
                                </div>
                            )}

                            {formData.deliverables && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-1">Deliverables</h4>
                                    <ul className="text-sm space-y-1 ml-4">
                                        {formData.deliverables.split('\n').filter(d => d.trim()).map((item, i) => (
                                            <li key={i} className="text-gray-700">• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {formData.timeline && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-1">Timeline</h4>
                                    <p className="text-sm whitespace-pre-line text-gray-700">{formData.timeline}</p>
                                </div>
                            )}

                            {formData.investment && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-1">Investment</h4>
                                    <p className="text-2xl font-bold text-red-600">{formData.investment}</p>
                                </div>
                            )}

                            {formData.terms_conditions && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-1">Terms & Conditions</h4>
                                    <p className="text-sm whitespace-pre-line text-gray-700">{formData.terms_conditions}</p>
                                </div>
                            )}

                            <div className="mt-12 pt-6 border-t-2 border-red-600">
                                <p className="text-sm text-center text-gray-600">
                                    We look forward to working with you!
                                </p>
                                <p className="text-sm text-center text-gray-500 mt-2">
                                    For questions, contact us at connect@eyepune.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}