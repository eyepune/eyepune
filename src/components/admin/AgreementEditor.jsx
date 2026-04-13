import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DynamicQuill from '@/components/shared/DynamicQuill';
import 'react-quill/dist/quill.snow.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const defaultAgreementTemplate = `
<div style="padding: 40px; font-family: Arial, sans-serif;">
  <div style="border-bottom: 3px solid #DC2626; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #DC2626; font-size: 32px; margin-bottom: 5px;">EyE PunE</h1>
    <p style="color: #6B7280; font-size: 14px;">Connect - Engage - Grow</p>
    <p style="color: #9CA3AF; font-size: 12px; margin-top: 10px;">
      Email: connect@eyepune.com | Phone: +91 9284712033
    </p>
  </div>

  <h2 style="text-align: center; margin-bottom: 30px;">SERVICE AGREEMENT</h2>

  <p><strong>Agreement Date:</strong> [DATE]</p>
  <p><strong>Agreement Number:</strong> [AGREEMENT_NUMBER]</p>

  <p style="margin-top: 20px;"><strong>This Agreement is entered into between:</strong></p>
  
  <p><strong>Service Provider:</strong><br/>
  EyE PunE<br/>
  Email: connect@eyepune.com<br/>
  Phone: +91 9284712033</p>

  <p><strong>Client:</strong><br/>
  [CLIENT_NAME]<br/>
  [CLIENT_EMAIL]<br/>
  [CLIENT_PHONE]</p>

  <h3 style="color: #DC2626; margin-top: 30px;">1. Services</h3>
  <p>[SERVICES_DESCRIPTION]</p>

  <h3 style="color: #DC2626; margin-top: 30px;">2. Deliverables</h3>
  <p>[DELIVERABLES]</p>

  <h3 style="color: #DC2626; margin-top: 30px;">3. Timeline</h3>
  <p>[TIMELINE]</p>

  <h3 style="color: #DC2626; margin-top: 30px;">4. Payment Terms</h3>
  <p>[PAYMENT_TERMS]</p>

  <h3 style="color: #DC2626; margin-top: 30px;">5. Intellectual Property</h3>
  <p>Upon full payment, all deliverables and intellectual property rights shall be transferred to the Client.</p>

  <h3 style="color: #DC2626; margin-top: 30px;">6. Confidentiality</h3>
  <p>Both parties agree to maintain confidentiality of all proprietary information shared during the course of this engagement.</p>

  <h3 style="color: #DC2626; margin-top: 30px;">7. Termination</h3>
  <p>Either party may terminate this agreement with 15 days written notice. Client will be responsible for payment of work completed to date.</p>

  <div style="margin-top: 60px;">
    <table style="width: 100%;">
      <tr>
        <td style="width: 45%; vertical-align: top;">
          <p><strong>Service Provider Signature:</strong></p>
          <p style="margin-top: 40px;">_________________________</p>
          <p>Date: _________________</p>
        </td>
        <td style="width: 10%;"></td>
        <td style="width: 45%; vertical-align: top;">
          <p><strong>Client Signature:</strong></p>
          <p style="margin-top: 40px;">_________________________</p>
          <p>Date: _________________</p>
        </td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 12px;">
    <p>EyE PunE | connect@eyepune.com | +91 9284712033</p>
  </div>
</div>
`;

export default function AgreementEditor({ open, onClose, project }) {
    const [agreementContent, setAgreementContent] = useState(defaultAgreementTemplate);
    const [agreementNumber, setAgreementNumber] = useState(`AGR-${Date.now()}`);
    const [isGenerating, setIsGenerating] = useState(false);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const element = document.getElementById('agreement-preview');
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

            pdf.save(`Agreement-${agreementNumber}.pdf`);
            toast.success('Agreement generated successfully!');
        } catch (error) {
            console.error('Error generating agreement:', error);
            toast.error('Failed to generate agreement');
        }
        setIsGenerating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Agreement</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Agreement Number</Label>
                        <Input
                            value={agreementNumber}
                            onChange={(e) => setAgreementNumber(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Editor */}
                        <div>
                            <Label className="mb-2 block">Edit Agreement Content</Label>
                            <DynamicQuill
                                theme="snow"
                                value={agreementContent}
                                onChange={setAgreementContent}
                                modules={modules}
                                className="h-[500px] mb-12"
                            />
                            <Button
                                onClick={generatePDF}
                                disabled={isGenerating}
                                className="w-full bg-red-600 hover:bg-red-700 mt-4"
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
                        <div>
                            <Label className="mb-2 block">Preview</Label>
                            <div className="border rounded-lg p-4 bg-white overflow-y-auto h-[500px]">
                                <div 
                                    id="agreement-preview" 
                                    className="bg-white text-black"
                                    dangerouslySetInnerHTML={{ __html: agreementContent }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm font-semibold mb-2">Available Placeholders:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <code>[DATE]</code>
                            <code>[AGREEMENT_NUMBER]</code>
                            <code>[CLIENT_NAME]</code>
                            <code>[CLIENT_EMAIL]</code>
                            <code>[CLIENT_PHONE]</code>
                            <code>[SERVICES_DESCRIPTION]</code>
                            <code>[DELIVERABLES]</code>
                            <code>[TIMELINE]</code>
                            <code>[PAYMENT_TERMS]</code>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}