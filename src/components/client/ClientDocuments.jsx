import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Eye, PenTool, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";

export default function ClientDocuments({ userEmail, projectId = null }) {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [signingDoc, setSigningDoc] = useState(null);
    const [signature, setSignature] = useState('');
    const queryClient = useQueryClient();

    // Fetch contracts
    const { data: contracts = [] } = useQuery({
        queryKey: ['client-contracts', userEmail],
        queryFn: async () => {
            const query = { party_email: userEmail };
            if (projectId) query.project_id = projectId;
            return await base44.entities.Contract.filter(query, '-created_date');
        }
    });

    // Fetch proposals
    const { data: proposals = [] } = useQuery({
        queryKey: ['client-proposals', userEmail],
        queryFn: async () => {
            const query = { client_email: userEmail };
            return await base44.entities.Proposal.filter(query, '-created_date');
        }
    });

    // Fetch invoices
    const { data: invoices = [] } = useQuery({
        queryKey: ['client-invoices', userEmail],
        queryFn: async () => {
            const query = { client_email: userEmail };
            if (projectId) query.project_id = projectId;
            return await base44.entities.Invoice.filter(query, '-created_date');
        }
    });

    // Sign contract mutation
    const signContractMutation = useMutation({
        mutationFn: async ({ contractId, signatureData }) => {
            const contract = contracts.find(c => c.id === contractId);
            return await base44.entities.Contract.update(contractId, {
                status: 'signed',
                signed_date: new Date().toISOString(),
                signature_data: {
                    ...contract.signature_data,
                    party_signature: signatureData,
                    party_signed_at: new Date().toISOString(),
                    party_ip_address: 'client'
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['client-contracts']);
            setSigningDoc(null);
            setSignature('');
        }
    });

    const getStatusBadge = (status) => {
        const variants = {
            draft: { variant: "secondary", icon: Clock, text: "Draft" },
            sent: { variant: "outline", icon: Clock, text: "Sent" },
            signed: { variant: "default", icon: CheckCircle2, text: "Signed" },
            active: { variant: "default", icon: CheckCircle2, text: "Active" },
            completed: { variant: "secondary", icon: CheckCircle2, text: "Completed" },
            paid: { variant: "default", icon: CheckCircle2, text: "Paid" },
            pending: { variant: "outline", icon: Clock, text: "Pending" },
            overdue: { variant: "destructive", icon: AlertCircle, text: "Overdue" },
            accepted: { variant: "default", icon: CheckCircle2, text: "Accepted" },
            rejected: { variant: "destructive", icon: AlertCircle, text: "Rejected" },
            viewed: { variant: "outline", icon: Eye, text: "Viewed" }
        };
        
        const config = variants[status] || { variant: "secondary", icon: Clock, text: status };
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="w-3 h-3" />
                {config.text}
            </Badge>
        );
    };

    const handleSign = () => {
        if (!signature.trim()) return;
        signContractMutation.mutate({
            contractId: signingDoc.id,
            signatureData: signature
        });
    };

    const DocumentCard = ({ doc, type, onView, onSign }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <CardTitle className="text-base">
                                {type === 'contract' && `Contract #${doc.contract_number}`}
                                {type === 'proposal' && doc.project_title}
                                {type === 'invoice' && `Invoice #${doc.invoice_number}`}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {moment(doc.created_date).format('MMM DD, YYYY')}
                            </p>
                        </div>
                    </div>
                    {getStatusBadge(doc.status)}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-4">
                    {type === 'contract' && (
                        <>
                            <p className="text-sm"><span className="font-medium">Type:</span> {doc.contract_type.replace(/_/g, ' ')}</p>
                            <p className="text-sm"><span className="font-medium">Value:</span> ₹{doc.contract_value?.toLocaleString()}</p>
                            {doc.start_date && <p className="text-sm"><span className="font-medium">Duration:</span> {moment(doc.start_date).format('MMM DD, YYYY')} - {moment(doc.end_date).format('MMM DD, YYYY')}</p>}
                        </>
                    )}
                    {type === 'proposal' && (
                        <>
                            <p className="text-sm"><span className="font-medium">Project:</span> {doc.project_type.replace(/_/g, ' ')}</p>
                            <p className="text-sm"><span className="font-medium">Value:</span> ₹{doc.pricing?.total?.toLocaleString()}</p>
                            {doc.valid_until && <p className="text-sm"><span className="font-medium">Valid Until:</span> {moment(doc.valid_until).format('MMM DD, YYYY')}</p>}
                        </>
                    )}
                    {type === 'invoice' && (
                        <>
                            <p className="text-sm"><span className="font-medium">Amount:</span> ₹{doc.total_amount?.toLocaleString()}</p>
                            <p className="text-sm"><span className="font-medium">Due Date:</span> {moment(doc.due_date).format('MMM DD, YYYY')}</p>
                        </>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView(doc)} className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                    </Button>
                    {type === 'contract' && doc.status === 'sent' && (
                        <Button size="sm" onClick={() => onSign(doc)} className="flex-1 bg-red-600 hover:bg-red-700">
                            <PenTool className="w-4 h-4 mr-2" />
                            Sign
                        </Button>
                    )}
                    {doc.document_url && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={doc.document_url} download>
                                <Download className="w-4 h-4" />
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All ({contracts.length + proposals.length + invoices.length})</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts ({contracts.length})</TabsTrigger>
                    <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                    {[...contracts, ...proposals, ...invoices].length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No documents available yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {contracts.map(doc => (
                                <DocumentCard 
                                    key={`contract-${doc.id}`}
                                    doc={doc} 
                                    type="contract"
                                    onView={setSelectedDoc}
                                    onSign={setSigningDoc}
                                />
                            ))}
                            {proposals.map(doc => (
                                <DocumentCard 
                                    key={`proposal-${doc.id}`}
                                    doc={doc} 
                                    type="proposal"
                                    onView={setSelectedDoc}
                                />
                            ))}
                            {invoices.map(doc => (
                                <DocumentCard 
                                    key={`invoice-${doc.id}`}
                                    doc={doc} 
                                    type="invoice"
                                    onView={setSelectedDoc}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="contracts" className="space-y-4 mt-6">
                    {contracts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No contracts available</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {contracts.map(doc => (
                                <DocumentCard 
                                    key={doc.id}
                                    doc={doc} 
                                    type="contract"
                                    onView={setSelectedDoc}
                                    onSign={setSigningDoc}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="proposals" className="space-y-4 mt-6">
                    {proposals.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No proposals available</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {proposals.map(doc => (
                                <DocumentCard 
                                    key={doc.id}
                                    doc={doc} 
                                    type="proposal"
                                    onView={setSelectedDoc}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4 mt-6">
                    {invoices.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No invoices available</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {invoices.map(doc => (
                                <DocumentCard 
                                    key={doc.id}
                                    doc={doc} 
                                    type="invoice"
                                    onView={setSelectedDoc}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* View Document Dialog */}
            <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {selectedDoc && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Document Details
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {selectedDoc.contract_number && (
                                    <>
                                        <div>
                                            <Label>Contract Number</Label>
                                            <p className="text-sm mt-1">{selectedDoc.contract_number}</p>
                                        </div>
                                        <div>
                                            <Label>Type</Label>
                                            <p className="text-sm mt-1">{selectedDoc.contract_type?.replace(/_/g, ' ')}</p>
                                        </div>
                                        <div>
                                            <Label>Value</Label>
                                            <p className="text-sm mt-1">₹{selectedDoc.contract_value?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <Label>Scope of Work</Label>
                                            <p className="text-sm mt-1 whitespace-pre-wrap">{selectedDoc.scope_of_work}</p>
                                        </div>
                                        {selectedDoc.deliverables?.length > 0 && (
                                            <div>
                                                <Label>Deliverables</Label>
                                                <ul className="list-disc list-inside text-sm mt-1">
                                                    {selectedDoc.deliverables.map((d, i) => (
                                                        <li key={i}>{d}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                                {selectedDoc.project_title && (
                                    <>
                                        <div>
                                            <Label>Project Title</Label>
                                            <p className="text-sm mt-1">{selectedDoc.project_title}</p>
                                        </div>
                                        <div>
                                            <Label>Executive Summary</Label>
                                            <p className="text-sm mt-1 whitespace-pre-wrap">{selectedDoc.executive_summary}</p>
                                        </div>
                                        <div>
                                            <Label>Proposed Solution</Label>
                                            <p className="text-sm mt-1 whitespace-pre-wrap">{selectedDoc.proposed_solution}</p>
                                        </div>
                                        {selectedDoc.pricing && (
                                            <div>
                                                <Label>Pricing</Label>
                                                <p className="text-sm mt-1">Total: ₹{selectedDoc.pricing.total?.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {selectedDoc.invoice_number && (
                                    <>
                                        <div>
                                            <Label>Invoice Number</Label>
                                            <p className="text-sm mt-1">{selectedDoc.invoice_number}</p>
                                        </div>
                                        <div>
                                            <Label>Amount</Label>
                                            <p className="text-sm mt-1">₹{selectedDoc.total_amount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <Label>Due Date</Label>
                                            <p className="text-sm mt-1">{moment(selectedDoc.due_date).format('MMM DD, YYYY')}</p>
                                        </div>
                                    </>
                                )}
                                <div className="pt-4 border-t flex gap-2">
                                    {selectedDoc.document_url && (
                                        <Button asChild className="flex-1">
                                            <a href={selectedDoc.document_url} download>
                                                <Download className="w-4 h-4 mr-2" />
                                                Download PDF
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Sign Contract Dialog */}
            <Dialog open={!!signingDoc} onOpenChange={() => { setSigningDoc(null); setSignature(''); }}>
                <DialogContent className="max-w-md">
                    {signingDoc && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <PenTool className="w-5 h-5" />
                                    Sign Contract
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Contract</Label>
                                    <p className="text-sm mt-1">{signingDoc.contract_number}</p>
                                </div>
                                <div>
                                    <Label>Your Full Name</Label>
                                    <Input
                                        value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                        placeholder="Type your full name to sign"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        By typing your name, you agree to the terms and conditions of this contract.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={handleSign}
                                        disabled={!signature.trim() || signContractMutation.isPending}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        {signContractMutation.isPending ? 'Signing...' : 'Sign Contract'}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => { setSigningDoc(null); setSignature(''); }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}