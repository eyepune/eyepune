import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, DollarSign, Sparkles, Loader2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function InvoiceManager({ project }) {
    const [generatingInvoice, setGeneratingInvoice] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const queryClient = useQueryClient();

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices', project.id],
        queryFn: async () => {
            const allInvoices = await base44.entities.Invoice.list();
            return allInvoices.filter(inv => inv.project_id === project.id);
        },
    });

    const { data: timeLogs = [] } = useQuery({
        queryKey: ['time-logs', project.id],
        queryFn: async () => {
            const allLogs = await base44.entities.TimeLog.list();
            return allLogs.filter(log => log.project_id === project.id && log.billable);
        },
    });

    const generateInvoiceMutation = useMutation({
        mutationFn: async () => {
            setGeneratingInvoice(true);
            const response = await base44.functions.invoke('invoiceManager', {
                action: 'generateInvoice',
                project_id: project.id
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setGeneratingInvoice(false);
        },
        onError: () => setGeneratingInvoice(false)
    });

    const sendInvoiceMutation = useMutation({
        mutationFn: async (invoiceId) => {
            const response = await base44.functions.invoke('invoiceManager', {
                action: 'sendInvoice',
                invoice_id: invoiceId
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setSelectedInvoice(null);
        },
    });

    const invoicedLogIds = invoices.flatMap(inv => 
        inv.line_items?.map(item => item.log_id).filter(Boolean) || []
    );
    const uninvoicedLogs = timeLogs.filter(log => !invoicedLogIds.includes(log.id));
    const uninvoicedHours = uninvoicedLogs.reduce((sum, log) => sum + log.hours, 0);

    const statusColors = {
        draft: 'secondary',
        sent: 'default',
        paid: 'outline',
        overdue: 'destructive'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Invoices & Billing
                    </h3>
                    {uninvoicedHours > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {uninvoicedHours} uninvoiced billable hours
                        </p>
                    )}
                </div>
                <Button 
                    onClick={() => generateInvoiceMutation.mutate()}
                    disabled={generatingInvoice || uninvoicedHours === 0}
                    className="bg-red-600 hover:bg-red-700"
                >
                    {generatingInvoice ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Generate Invoice
                        </>
                    )}
                </Button>
            </div>

            {uninvoicedHours > 0 && (
                <Card className="border-blue-500/30 bg-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium">Ready to Invoice</p>
                                <p className="text-sm text-muted-foreground">
                                    {uninvoicedHours} hours logged • {uninvoicedLogs.length} time entries
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
                </div>
            ) : invoices.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No invoices yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {invoices.map(invoice => (
                        <Card key={invoice.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            {invoice.invoice_number}
                                            <Badge variant={statusColors[invoice.status]}>
                                                {invoice.status}
                                            </Badge>
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Due: {new Date(invoice.due_date).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-red-600">₹{invoice.total}</div>
                                        <p className="text-xs text-muted-foreground">{invoice.line_items?.length || 0} items</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setSelectedInvoice(invoice)}
                                    >
                                        View Details
                                    </Button>
                                    {invoice.status === 'draft' && (
                                        <Button 
                                            size="sm"
                                            onClick={() => sendInvoiceMutation.mutate(invoice.id)}
                                            disabled={sendInvoiceMutation.isPending}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Send to Client
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Invoice Details Dialog */}
            {selectedInvoice && (
                <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>Invoice {selectedInvoice.invoice_number}</span>
                                <Badge variant={statusColors[selectedInvoice.status]}>
                                    {selectedInvoice.status}
                                </Badge>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Invoice Date</p>
                                    <p className="font-medium">
                                        {new Date(selectedInvoice.invoice_date).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Due Date</p>
                                    <p className="font-medium">
                                        {new Date(selectedInvoice.due_date).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Line Items</p>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left p-2">Description</th>
                                                <th className="text-center p-2">Hours</th>
                                                <th className="text-right p-2">Rate</th>
                                                <th className="text-right p-2">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedInvoice.line_items?.map((item, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="p-2">{item.description}</td>
                                                    <td className="text-center p-2">{item.hours}</td>
                                                    <td className="text-right p-2">₹{item.rate}</td>
                                                    <td className="text-right p-2">₹{item.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{selectedInvoice.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax ({selectedInvoice.tax_percentage}%)</span>
                                    <span>₹{(selectedInvoice.total - selectedInvoice.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span className="text-red-600">₹{selectedInvoice.total}</span>
                                </div>
                            </div>

                            {selectedInvoice.notes && (
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="text-sm font-semibold mb-1">Notes</p>
                                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}