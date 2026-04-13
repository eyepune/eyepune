import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Loader2, Plus, Trash2 } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import jsPDF from 'jspdf';

export default function InvoiceGenerator({ open, onOpenChange, project }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        client_name: project?.client_name || '',
        client_email: project?.client_email || '',
        company_name: '',
        billing_address: '',
        invoice_items: [{ description: '', quantity: 1, rate: 0 }],
        tax_percentage: 18,
        notes: 'Thank you for your business!',
        payment_terms: 'Payment due within 30 days',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const createInvoiceMutation = useMutation({
        mutationFn: async (data) => {
            const subtotal = data.invoice_items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
            const tax = subtotal * (data.tax_percentage / 100);
            const total = subtotal + tax;

            const invoice = await base44.entities.Invoice.create({
                project_id: project?.id,
                client_email: data.client_email,
                client_name: data.client_name,
                invoice_number: `INV-${Date.now()}`,
                invoice_date: new Date().toISOString().split('T')[0],
                due_date: data.due_date,
                items: data.invoice_items,
                subtotal,
                tax_amount: tax,
                total_amount: total,
                status: 'pending',
                notes: data.notes
            });
            return invoice;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            onOpenChange(false);
        }
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const items = [...prev.invoice_items];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, invoice_items: items };
        });
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            invoice_items: [...prev.invoice_items, { description: '', quantity: 1, rate: 0 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            invoice_items: prev.invoice_items.filter((_, i) => i !== index)
        }));
    };

    const subtotal = formData.invoice_items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    const tax = subtotal * (Number(formData.tax_percentage) / 100);
    const total = subtotal + tax;

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        // Header
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('INVOICE', 20, y);
        y += 15;

        // Company Info
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('EyE PunE', 20, y);
        y += 5;
        doc.setFont(undefined, 'normal');
        doc.text('Email: connect@eyepune.com', 20, y);
        y += 5;
        doc.text('Phone: +91 9284712033', 20, y);
        y += 15;

        // Invoice Details
        doc.setFont(undefined, 'bold');
        doc.text(`Invoice #: INV-${Date.now().toString().slice(-8)}`, pageWidth - 80, 20);
        doc.setFont(undefined, 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 80, 27);
        doc.text(`Due Date: ${new Date(formData.due_date).toLocaleDateString()}`, pageWidth - 80, 34);

        // Bill To
        doc.setFont(undefined, 'bold');
        doc.text('BILL TO:', 20, y);
        y += 7;
        doc.setFont(undefined, 'normal');
        doc.text(formData.client_name, 20, y);
        y += 5;
        if (formData.company_name) {
            doc.text(formData.company_name, 20, y);
            y += 5;
        }
        doc.text(formData.client_email, 20, y);
        y += 5;
        if (formData.billing_address) {
            const addressLines = doc.splitTextToSize(formData.billing_address, 80);
            addressLines.forEach(line => {
                doc.text(line, 20, y);
                y += 5;
            });
        }
        y += 10;

        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, y, pageWidth - 40, 8, 'F');
        doc.setFont(undefined, 'bold');
        doc.text('Description', 22, y + 5);
        doc.text('Qty', pageWidth - 90, y + 5);
        doc.text('Rate', pageWidth - 65, y + 5);
        doc.text('Amount', pageWidth - 35, y + 5, { align: 'right' });
        y += 12;

        // Items
        doc.setFont(undefined, 'normal');
        formData.invoice_items.forEach(item => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            const desc = doc.splitTextToSize(item.description, 100);
            desc.forEach((line, i) => {
                doc.text(line, 22, y + (i * 5));
            });
            doc.text(item.quantity.toString(), pageWidth - 90, y);
            doc.text(`₹${Number(item.rate).toLocaleString()}`, pageWidth - 65, y);
            doc.text(`₹${(item.quantity * item.rate).toLocaleString()}`, pageWidth - 22, y, { align: 'right' });
            y += Math.max(desc.length * 5, 5) + 5;
        });

        y += 5;
        doc.line(20, y, pageWidth - 20, y);
        y += 10;

        // Totals
        doc.setFont(undefined, 'normal');
        doc.text('Subtotal:', pageWidth - 80, y);
        doc.text(`₹${subtotal.toLocaleString()}`, pageWidth - 22, y, { align: 'right' });
        y += 7;
        doc.text(`Tax (${formData.tax_percentage}%):`, pageWidth - 80, y);
        doc.text(`₹${tax.toLocaleString()}`, pageWidth - 22, y, { align: 'right' });
        y += 7;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Total:', pageWidth - 80, y);
        doc.text(`₹${total.toLocaleString()}`, pageWidth - 22, y, { align: 'right' });

        y += 15;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        if (formData.notes) {
            const noteLines = doc.splitTextToSize(formData.notes, pageWidth - 40);
            noteLines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y);
                y += 5;
            });
        }
        y += 5;
        doc.setFont(undefined, 'italic');
        doc.text(formData.payment_terms, 20, y);

        return doc;
    };

    const handleSaveAndDownload = () => {
        createInvoiceMutation.mutate(formData);
        const doc = generatePDF();
        doc.save(`invoice-${formData.client_name.replace(/\s+/g, '-')}.pdf`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Generate Invoice
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
                            <Label>Due Date</Label>
                            <DatePicker value={formData.due_date} onChange={(val) => handleChange('due_date', val)} />
                        </div>
                    </div>

                    <div>
                        <Label>Billing Address</Label>
                        <Textarea value={formData.billing_address} onChange={(e) => handleChange('billing_address', e.target.value)} rows={2} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Line Items</Label>
                            <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                <Plus className="w-4 h-4 mr-1" /> Add Item
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {formData.invoice_items.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        className="w-20"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Rate"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                        className="w-28"
                                    />
                                    <div className="w-28 flex items-center justify-end px-3 py-2 border rounded-md bg-muted">
                                        ₹{(item.quantity * item.rate).toLocaleString()}
                                    </div>
                                    {formData.invoice_items.length > 1 && (
                                        <Button type="button" size="icon" variant="outline" onClick={() => removeItem(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <div className="space-y-1 pt-2 border-t">
                                <div className="flex justify-end gap-4">
                                    <span>Subtotal:</span>
                                    <span className="w-28 text-right">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-end gap-4 items-center">
                                    <span>Tax:</span>
                                    <Input
                                        type="number"
                                        value={formData.tax_percentage}
                                        onChange={(e) => handleChange('tax_percentage', e.target.value)}
                                        className="w-16 h-8 text-center"
                                    />
                                    <span>%</span>
                                    <span className="w-28 text-right">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-end gap-4 text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="w-28 text-right">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Notes</Label>
                        <Textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} />
                    </div>

                    <div>
                        <Label>Payment Terms</Label>
                        <Input value={formData.payment_terms} onChange={(e) => handleChange('payment_terms', e.target.value)} />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleSaveAndDownload}
                            disabled={createInvoiceMutation.isPending || !formData.client_name}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {createInvoiceMutation.isPending ? (
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