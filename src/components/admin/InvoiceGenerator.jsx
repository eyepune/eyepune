import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, X, Download, Loader2 } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function InvoiceGenerator({ open, onClose, project }) {
    const [formData, setFormData] = useState({
        invoice_number: `INV-${Date.now()}`,
        client_email: project?.client_email || '',
        client_name: project?.client_name || '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        line_items: [{ description: '', hours: 0, rate: 0, amount: 0 }],
        subtotal: 0,
        tax_percentage: 18,
        total: 0,
        notes: 'Payment due within 15 days.\nBank Details: [Add your bank details]'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const addLineItem = () => {
        setFormData({
            ...formData,
            line_items: [...formData.line_items, { description: '', hours: 0, rate: 0, amount: 0 }]
        });
    };

    const updateLineItem = (index, field, value) => {
        const items = [...formData.line_items];
        items[index][field] = value;
        
        if (field === 'hours' || field === 'rate') {
            items[index].amount = items[index].hours * items[index].rate;
        }
        
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const total = subtotal + (subtotal * formData.tax_percentage / 100);
        
        setFormData({ ...formData, line_items: items, subtotal, total });
    };

    const removeLineItem = (index) => {
        const items = formData.line_items.filter((_, i) => i !== index);
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const total = subtotal + (subtotal * formData.tax_percentage / 100);
        setFormData({ ...formData, line_items: items, subtotal, total });
    };

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            // Create invoice in database
            await base44.entities.Invoice.create({
                project_id: project?.id,
                invoice_number: formData.invoice_number,
                client_email: formData.client_email,
                invoice_date: formData.invoice_date,
                due_date: formData.due_date,
                status: 'sent',
                line_items: formData.line_items,
                subtotal: formData.subtotal,
                tax_percentage: formData.tax_percentage,
                total: formData.total,
                notes: formData.notes
            });

            // Generate PDF
            const element = document.getElementById('invoice-preview');
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Invoice-${formData.invoice_number}.pdf`);

            toast.success('Invoice generated successfully!');
            onClose();
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast.error('Failed to generate invoice');
        }
        setIsGenerating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Generate Invoice</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Invoice Number</Label>
                                <Input
                                    value={formData.invoice_number}
                                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Invoice Date</Label>
                                <DatePicker
                                    value={formData.invoice_date}
                                    onChange={(val) => setFormData({ ...formData, invoice_date: val })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Due Date</Label>
                            <DatePicker
                                value={formData.due_date}
                                onChange={(val) => setFormData({ ...formData, due_date: val })}
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
                            <Label>Client Email</Label>
                            <Input
                                type="email"
                                value={formData.client_email}
                                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Label>Line Items</Label>
                                <Button size="sm" variant="outline" onClick={addLineItem}>
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Item
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {formData.line_items.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <Input
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                                className="flex-1 mr-2"
                                            />
                                            {formData.line_items.length > 1 && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeLineItem(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Hours"
                                                value={item.hours}
                                                onChange={(e) => updateLineItem(index, 'hours', parseFloat(e.target.value) || 0)}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Rate"
                                                value={item.rate}
                                                onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Amount"
                                                value={item.amount.toFixed(2)}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Tax (%)</Label>
                            <Input
                                type="number"
                                value={formData.tax_percentage}
                                onChange={(e) => {
                                    const tax = parseFloat(e.target.value) || 0;
                                    const total = formData.subtotal + (formData.subtotal * tax / 100);
                                    setFormData({ ...formData, tax_percentage: tax, total });
                                }}
                            />
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="min-h-[80px]"
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
                    <div className="border rounded-lg p-4 bg-white">
                        <div id="invoice-preview" className="p-8 bg-white text-black">
                            {/* Letterhead */}
                            <div className="border-b-2 border-red-600 pb-4 mb-6">
                                <h1 className="text-3xl font-bold text-red-600">EyE PunE</h1>
                                <p className="text-sm text-gray-600">Connect - Engage - Grow</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Email: connect@eyepune.com | Phone: +91 9284712033
                                </p>
                            </div>

                            <div className="flex justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
                                    <p className="text-sm"><strong>Invoice #:</strong> {formData.invoice_number}</p>
                                    <p className="text-sm"><strong>Date:</strong> {formData.invoice_date}</p>
                                    <p className="text-sm"><strong>Due Date:</strong> {formData.due_date}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-semibold">Bill To:</h3>
                                    <p className="text-sm">{formData.client_name}</p>
                                    <p className="text-sm">{formData.client_email}</p>
                                </div>
                            </div>

                            <table className="w-full mb-6 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left p-2">Description</th>
                                        <th className="text-right p-2">Hours</th>
                                        <th className="text-right p-2">Rate</th>
                                        <th className="text-right p-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.line_items.map((item, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">{item.description}</td>
                                            <td className="text-right p-2">{item.hours}</td>
                                            <td className="text-right p-2">₹{item.rate.toFixed(2)}</td>
                                            <td className="text-right p-2">₹{item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mb-6">
                                <div className="w-64">
                                    <div className="flex justify-between py-1">
                                        <span>Subtotal:</span>
                                        <span>₹{formData.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>Tax ({formData.tax_percentage}%):</span>
                                        <span>₹{(formData.subtotal * formData.tax_percentage / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-t-2 border-red-600 font-bold text-lg">
                                        <span>Total:</span>
                                        <span>₹{formData.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-600 whitespace-pre-line">
                                {formData.notes}
                            </div>

                            <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
                                <p>Thank you for your business!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}