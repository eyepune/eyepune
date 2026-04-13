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

const defaultTerms = `1. EMPLOYMENT: Employee is hired as [Position] in the [Department] department.

2. COMPENSATION: Employee will receive an annual salary of ₹[Salary] payable in accordance with company policy.

3. BENEFITS: Employee is entitled to benefits as outlined in the company policy.

4. WORKING HOURS: Standard working hours are [Hours] per week.

5. LEAVE: Employee is entitled to leave as per company policy.

6. CONFIDENTIALITY: Employee agrees to maintain confidentiality of company information.

7. TERMINATION: Either party may terminate employment with [Notice Period] notice.

8. INTELLECTUAL PROPERTY: All work product belongs to the company.

9. NON-COMPETE: Employee agrees not to engage in competing business for [Duration] after termination.

10. GOVERNING LAW: This agreement is governed by the laws of India.`;

export default function EmployeeAgreementGenerator({ open, onOpenChange }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        employee_name: '',
        employee_email: '',
        position: '',
        department: '',
        agreement_type: 'full_time',
        start_date: new Date().toISOString().split('T')[0],
        salary: '',
        benefits: [],
        responsibilities: '',
        terms_and_conditions: defaultTerms
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [benefitInput, setBenefitInput] = useState('');

    const generateWithAI = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Generate a professional employee agreement with detailed responsibilities and terms for:
Position: ${formData.position}
Department: ${formData.department}
Type: ${formData.agreement_type}
Salary: ₹${formData.salary}

Include:
1. Detailed job responsibilities specific to this role
2. Comprehensive terms and conditions
3. Professional and legally appropriate language
4. India-specific employment laws

Return JSON with: { responsibilities: string, terms_and_conditions: string }`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        responsibilities: { type: "string" },
                        terms_and_conditions: { type: "string" }
                    }
                }
            });

            setFormData(prev => ({
                ...prev,
                responsibilities: result.responsibilities,
                terms_and_conditions: result.terms_and_conditions
            }));
        } catch (error) {
            console.error('AI generation error:', error);
            alert('Failed to generate content');
        }
        setIsGenerating(false);
    };

    const createAgreementMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.EmployeeAgreement.create({
                ...data,
                agreement_number: `EMP-${Date.now()}`,
                status: 'draft'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employee-agreements']);
            onOpenChange(false);
        }
    });

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('EMPLOYMENT AGREEMENT', pageWidth / 2, y, { align: 'center' });
        y += 20;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Agreement Number: EMP-${Date.now().toString().slice(-8)}`, 20, y);
        y += 6;
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
        y += 15;

        const details = [
            `Employee Name: ${formData.employee_name}`,
            `Email: ${formData.employee_email}`,
            `Position: ${formData.position}`,
            `Department: ${formData.department}`,
            `Employment Type: ${formData.agreement_type.replace('_', ' ')}`,
            `Start Date: ${new Date(formData.start_date).toLocaleDateString()}`,
            `Annual Salary: ₹${Number(formData.salary).toLocaleString()}`,
            ``,
            `BENEFITS:`,
            ...formData.benefits.map(b => `• ${b}`),
            ``,
            `RESPONSIBILITIES:`,
            formData.responsibilities,
            ``,
            `TERMS AND CONDITIONS:`,
            formData.terms_and_conditions
        ];

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

        if (y > 240) {
            doc.addPage();
            y = 20;
        }
        y += 20;
        doc.line(20, y, 90, y);
        doc.text('Employee Signature', 20, y + 7);
        doc.text(`Date: _____________`, 20, y + 14);

        doc.line(120, y, 190, y);
        doc.text('Company Representative', 120, y + 7);
        doc.text(`Date: _____________`, 120, y + 14);

        return doc;
    };

    const handleSaveAndDownload = () => {
        createAgreementMutation.mutate(formData);
        const doc = generatePDF();
        doc.save(`agreement-${formData.employee_name.replace(/\s+/g, '-')}.pdf`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Generate Employee Agreement
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Employee Name *</Label>
                            <Input value={formData.employee_name} onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Employee Email *</Label>
                            <Input type="email" value={formData.employee_email} onChange={(e) => setFormData(prev => ({ ...prev, employee_email: e.target.value }))} />
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
                            <Select value={formData.agreement_type} onValueChange={(v) => setFormData(prev => ({ ...prev, agreement_type: v }))}>
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
                            <Label>Responsibilities</Label>
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
                            value={formData.responsibilities}
                            onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                            rows={6}
                            placeholder="Job responsibilities and duties..."
                        />
                    </div>

                    <div>
                        <Label>Terms & Conditions</Label>
                        <Textarea
                            value={formData.terms_and_conditions}
                            onChange={(e) => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
                            rows={8}
                            className="font-mono text-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleSaveAndDownload}
                            disabled={createAgreementMutation.isPending || !formData.employee_name || !formData.position}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {createAgreementMutation.isPending ? (
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