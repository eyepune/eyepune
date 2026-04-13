import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, FilePlus, Download, Eye, Send, CheckCircle2 } from 'lucide-react';
import AdminGuard from "@/components/admin/AdminGuard";
import ContractGenerator from "@/components/documents/ContractGenerator";
import ProposalGenerator from "@/components/documents/ProposalGenerator";
import InvoiceGenerator from "@/components/documents/InvoiceGenerator";
import EmployeeAgreementGenerator from "@/components/documents/EmployeeAgreementGenerator";
import OfferLetterGenerator from "@/components/documents/OfferLetterGenerator";

function Admin_Documents() {
    const queryClient = useQueryClient();
    const [showContractDialog, setShowContractDialog] = useState(false);
    const [showProposalDialog, setShowProposalDialog] = useState(false);
    const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
    const [showEmployeeAgreementDialog, setShowEmployeeAgreementDialog] = useState(false);
    const [showOfferLetterDialog, setShowOfferLetterDialog] = useState(false);

    const { data: contracts = [] } = useQuery({
        queryKey: ['contracts'],
        queryFn: () => base44.entities.Contract.list('-created_date', 50),
    });

    const { data: proposals = [] } = useQuery({
        queryKey: ['proposals'],
        queryFn: () => base44.entities.Proposal.list('-created_date', 50),
    });

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => base44.entities.Invoice.list('-created_date', 50),
    });

    const { data: employeeAgreements = [] } = useQuery({
        queryKey: ['employee-agreements'],
        queryFn: () => base44.entities.EmployeeAgreement.list('-created_date', 50),
    });

    const { data: offerLetters = [] } = useQuery({
        queryKey: ['offer-letters'],
        queryFn: () => base44.entities.OfferLetter.list('-created_date', 50),
    });

    const statusColors = {
        draft: 'bg-gray-500',
        sent: 'bg-blue-500',
        signed: 'bg-green-500',
        active: 'bg-emerald-500',
        completed: 'bg-purple-500',
        pending: 'bg-yellow-500',
        paid: 'bg-green-500',
        accepted: 'bg-green-500',
        rejected: 'bg-red-500'
    };

    const sendContractMutation = useMutation({
        mutationFn: async (contractId) => {
            return await base44.functions.invoke('sendContractForSignature', { 
                contract_id: contractId 
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['contracts']);
        }
    });

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Documents</h1>
                        <p className="text-muted-foreground">Manage contracts, proposals, and invoices</p>
                    </div>
                </div>

                <Tabs defaultValue="contracts" className="space-y-6">
                    <TabsList className="flex-wrap h-auto">
                        <TabsTrigger value="contracts">Contracts</TabsTrigger>
                        <TabsTrigger value="proposals">Proposals</TabsTrigger>
                        <TabsTrigger value="invoices">Invoices</TabsTrigger>
                        <TabsTrigger value="agreements">Employee Agreements</TabsTrigger>
                        <TabsTrigger value="offers">Offer Letters</TabsTrigger>
                    </TabsList>

                    <TabsContent value="contracts" className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setShowContractDialog(true)} className="bg-red-600 hover:bg-red-700">
                                <FilePlus className="w-4 h-4 mr-2" />
                                New Contract
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {contracts.map(contract => (
                                <Card key={contract.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {contract.party_name || contract.client_name}
                                                    {contract.contract_category === 'partnership' && (
                                                        <Badge variant="outline" className="ml-2 text-xs">Partnership</Badge>
                                                    )}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {contract.contract_number} • {contract.contract_type.replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                            <Badge className={statusColors[contract.status]}>
                                                {contract.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                                            <div>
                                                <span className="text-muted-foreground">Value:</span>
                                                <div className="font-medium">₹{Number(contract.contract_value).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Start Date:</span>
                                                <div className="font-medium">{new Date(contract.start_date).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created:</span>
                                                <div className="font-medium">{new Date(contract.created_date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        {contract.status === 'signed' && contract.signature_data?.party_signed_at && (
                                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Signed on {new Date(contract.signature_data.party_signed_at).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {contract.status === 'draft' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => sendContractMutation.mutate(contract.id)}
                                                disabled={sendContractMutation.isPending}
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                Send for Signature
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {contracts.length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        No contracts yet. Create your first contract!
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="proposals" className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setShowProposalDialog(true)} className="bg-red-600 hover:bg-red-700">
                                <FilePlus className="w-4 h-4 mr-2" />
                                New Proposal
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {proposals.map(proposal => (
                                <Card key={proposal.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{proposal.project_title}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {proposal.proposal_number} • {proposal.client_name}
                                                </p>
                                            </div>
                                            <Badge className={statusColors[proposal.status]}>
                                                {proposal.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Total:</span>
                                                <div className="font-medium">₹{Number(proposal.pricing?.total || 0).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Valid Until:</span>
                                                <div className="font-medium">{new Date(proposal.valid_until).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created:</span>
                                                <div className="font-medium">{new Date(proposal.created_date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {proposals.length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        No proposals yet. Create your first proposal!
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="invoices" className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setShowInvoiceDialog(true)} className="bg-red-600 hover:bg-red-700">
                                <FilePlus className="w-4 h-4 mr-2" />
                                New Invoice
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {invoices.map(invoice => (
                                <Card key={invoice.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{invoice.client_name}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {invoice.invoice_number}
                                                </p>
                                            </div>
                                            <Badge className={statusColors[invoice.status]}>
                                                {invoice.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Total:</span>
                                                <div className="font-medium">₹{Number(invoice.total_amount).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Due Date:</span>
                                                <div className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created:</span>
                                                <div className="font-medium">{new Date(invoice.created_date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {invoices.length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        No invoices yet. Create your first invoice!
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="agreements" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowEmployeeAgreementDialog(true)} className="bg-red-600 hover:bg-red-700">
                            <FilePlus className="w-4 h-4 mr-2" />
                            New Employee Agreement
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {employeeAgreements.map(agreement => (
                            <Card key={agreement.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{agreement.employee_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {agreement.agreement_number} • {agreement.position}
                                            </p>
                                        </div>
                                        <Badge className={statusColors[agreement.status]}>
                                            {agreement.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Salary:</span>
                                            <div className="font-medium">₹{Number(agreement.salary).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Type:</span>
                                            <div className="font-medium capitalize">{agreement.agreement_type.replace('_', ' ')}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Start Date:</span>
                                            <div className="font-medium">{new Date(agreement.start_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {employeeAgreements.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No employee agreements yet. Create your first one!
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="offers" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowOfferLetterDialog(true)} className="bg-red-600 hover:bg-red-700">
                            <FilePlus className="w-4 h-4 mr-2" />
                            New Offer Letter
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {offerLetters.map(offer => (
                            <Card key={offer.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{offer.candidate_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {offer.offer_number} • {offer.position}
                                            </p>
                                        </div>
                                        <Badge className={statusColors[offer.status]}>
                                            {offer.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Salary:</span>
                                            <div className="font-medium">₹{Number(offer.salary).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Start Date:</span>
                                            <div className="font-medium">{new Date(offer.start_date).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Expires:</span>
                                            <div className="font-medium">{new Date(offer.offer_expiry_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {offerLetters.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No offer letters yet. Create your first one!
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
                </Tabs>

                <ContractGenerator open={showContractDialog} onOpenChange={setShowContractDialog} />
                <ProposalGenerator open={showProposalDialog} onOpenChange={setShowProposalDialog} />
                <InvoiceGenerator open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog} />
                <EmployeeAgreementGenerator open={showEmployeeAgreementDialog} onOpenChange={setShowEmployeeAgreementDialog} />
                <OfferLetterGenerator open={showOfferLetterDialog} onOpenChange={setShowOfferLetterDialog} />
            </div>
        </div>
    );
}

export default function AdminDocumentsPage() {
    return (
        <AdminGuard>
            <Admin_Documents />
        </AdminGuard>
    );
}