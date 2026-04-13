import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2, Sparkles, Plus, X } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import jsPDF from 'jspdf';

export default function OfferLetterGenerator({ open, onOpenChange }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        candidate_name: '',
        candidate_email: '',
        position: '',
        department: '',
        employment_type: 'full_time',
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        salary: '',
        benefits: [],
        job_description: '',
        offer_expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [benefitInput, setBenefitInput] = useState('');

    const generateWithAI = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Generate a compelling job description for an offer letter:
Position: ${formData.position}
Department: ${formData.department}
Type: ${formData.employment_type}

Include:
1. Role overview
2. Key responsibilities (3-5 points)
3. Required qualifications
4. What makes this role exciting
5. Professional and engaging tone

Return as a single well-formatted string.`;

            const result = await base44.integrations.Core.InvokeLLM({ prompt });
            setFormData(prev => ({ ...prev, job_description: result }));
        } catch (error) {
            console.error('AI generation error:', error);
            alert('Failed to generate content');
        }
        setIsGenerating(false);
    };

    const createOfferMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.OfferLetter.create({
                ...data,
                offer_number: `OFFER-${Date.now()}`,
                status: 'draft'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['offer-letters']);
            onOpenChange(false);
        }
    });

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('OFFER LETTER', pageWidth / 2, y, { align: 'center' });
        y += 20;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
        y += 6;
        doc.text(`Offer Number: OFFER-${Date.now().toString().slice(-8)}`, 20, y);
        y += 15;

        doc.text(`Dear ${formData.candidate_name},`, 20, y);
        y += 10;

        const intro = `We are pleased to offer you the position of ${formData.position} in our ${formData.department} department. We believe your skills and experience will be a great addition to our team.`;
        const introLines = doc.splitTextToSize(intro, pageWidth - 40);
        introLines.forEach(line => {
            doc.text(line, 20, y);
            y += 6;
        });
        y += 10;

        const sections = [
            { title: 'POSITION DETAILS:', content: `Position: ${formData.position}\nDepartment: ${formData.department}\nEmployment Type: ${formData.employment_type.replace('_', ' ')}\nStart Date: ${new Date(formData.start_date).toLocaleDateString()}` },
            { title: 'COMPENSATION:', content: `Annual Salary: ₹${Number(formData.salary).toLocaleString()}\n\nThis salary will be paid in accordance with company payroll policies.` },
            { title: 'BENEFITS:', content: formData.benefits.map(b => `• ${b}`).join('\n') },
            { title: 'JOB DESCRIPTION:', content: formData.job_description }
        ];

        sections.forEach(section => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            doc.setFont(undefined, 'bold');
            doc.text(section.title, 20, y);
            y += 8;
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(section.content, pageWidth - 40);
            lines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y);
                y += 6;
            });
            y += 5;
        });

        if (y > 240) {
            doc.addPage();
            y = 20;
        }
        y += 10;
        const closing = `Please confirm your acceptance of this offer by ${new Date(formData.offer_expiry_date).toLocaleDateString()}. We look forward to welcoming you to EyE PunE!\n\nSincerely,\nEyE PunE Team`;
        const closingLines = doc.splitTextToSize(closing, pageWidth - 40);
        closingLines.forEach(line => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, 20, y);
            y += 6;
        });

        return doc;
    };

    const handleSaveAndDownload = () => {
        createOfferMutation.mutate(formData);
        const doc = generatePDF();
        doc.save(`offer-${formData.candidate_name.replace(/\s+/g, '-')}.pdf`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Generate Offer Letter
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Candidate Name *</Label>
                            <Input value={formData.candidate_name} onChange={(e) => setFormData(prev => ({ ...prev, candidate_name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Candidate Email *</Label>
                            <Input type="email" value={formData.candidate_email} onChange={(e) => setFormData(prev => ({ ...prev, candidate_email: e.target.value }))} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Position *</Label>
                            <Input value={formData.position} onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Department</Label>
                            <Input value={formData.department} onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <Label>Employment Type</Label>
                            <Select value={formData.employment_type} onValueChange={(v) => setFormData(prev => ({ ...prev, employment_type: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full_time">Full Time</SelectItem>
                                    <SelectItem value="part_time">Part Time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Start Date</Label>
                            <DatePicker value={formData.start_date} onChange={(val) => setFormData(prev => ({ ...prev, start_date: val }))} />
                        </div>
                        <div>
                            <Label>Annual Salary (₹)</Label>
                            <Input type="number" value={formData.salary} onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <Label>Offer Expiry Date</Label>
                        <DatePicker value={formData.offer_expiry_date} onChange={(val) => setFormData(prev => ({ ...prev, offer_expiry_date: val }))} />
                    </div>

                    <div>
                        <Label>Benefits</Label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                placeholder="Add benefit (e.g., Health Insurance)"
                                value={benefitInput}
                                onChange={(e) => setBenefitInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && benefitInput.trim()) {
                                        setFormData(prev => ({ ...prev, benefits: [...prev.benefits, benefitInput.trim()] }));
                                        setBenefitInput('');
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                size="icon"
                                onClick={() => {
                                    if (benefitInput.trim()) {
                                        setFormData(prev => ({ ...prev, benefits: [...prev.benefits, benefitInput.trim()] }));
                                        setBenefitInput('');
                                    }
                                }}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.benefits.map((benefit, idx) => (
                                <div key={idx} className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                    {benefit}
                                    <button onClick={() => setFormData(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== idx) }))}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Job Description</Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={generateWithAI}
                                disabled={isGenerating || !formData.position}
                            >
                                {isGenerating ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" /> Generate with AI</>
                                )}
                            </Button>
                        </div>
                        <Textarea
                            value={formData.job_description}
                            onChange={(e) => setFormData(prev => ({ ...prev, job_description: e.target.value }))}
                            rows={8}
                            placeholder="Role overview, responsibilities, and qualifications..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleSaveAndDownload}
                            disabled={createOfferMutation.isPending || !formData.candidate_name || !formData.position}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {createOfferMutation.isPending ? (
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