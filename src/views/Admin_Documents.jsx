'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, FilePlus, Download, Eye, Send, CheckCircle2, FileSignature, Receipt, FileUser, Briefcase, Sparkles } from 'lucide-react';
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import ContractGenerator from "@/components/documents/ContractGenerator";
import ProposalGenerator from "@/components/documents/ProposalGenerator";
import InvoiceGenerator from "@/components/documents/InvoiceGenerator";
import EmployeeAgreementGenerator from "@/components/documents/EmployeeAgreementGenerator";
import OfferLetterGenerator from "@/components/documents/OfferLetterGenerator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        signed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-gray-300">Document Management</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Legal & Financial</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Generate, track, and manage contracts, proposals, invoices, and employee agreements.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="contracts" className="relative z-10">
                <TabsList className="bg-[#111] border border-white/10 p-1 rounded-xl flex-wrap h-auto mb-6">
                    <TabsTrigger value="contracts" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <FileSignature className="w-4 h-4 mr-2" /> Contracts
                    </TabsTrigger>
                    <TabsTrigger value="proposals" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <FileText className="w-4 h-4 mr-2" /> Proposals
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <Receipt className="w-4 h-4 mr-2" /> Invoices
                    </TabsTrigger>
                    <TabsTrigger value="agreements" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <Briefcase className="w-4 h-4 mr-2" /> Employee Agreements
                    </TabsTrigger>
                    <TabsTrigger value="offers" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        <FileUser className="w-4 h-4 mr-2" /> Offer Letters
                    </TabsTrigger>
                </TabsList>

                {/* Contracts Tab */}
                <TabsContent value="contracts" className="space-y-6 focus:outline-none">
                    <div className="flex justify-between items-center bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileSignature className="w-5 h-5 text-blue-500" /> Client Contracts
                        </h2>
                        <Button 
                            onClick={() => setShowContractDialog(true)} 
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border-0"
                        >
                            <FilePlus className="w-4 h-4 mr-2" /> New Contract
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contracts.map(contract => (
                            <motion.div key={contract.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 h-full relative overflow-hidden hover:border-blue-500/30 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                                                    {contract.party_name || contract.client_name}
                                                </CardTitle>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span className="font-mono">{contract.contract_number}</span> 
                                                    <span className="w-1 h-1 rounded-full bg-gray-600" /> 
                                                    <span className="capitalize">{contract.contract_type.replace(/_/g, ' ')}</span>
                                                </p>
                                            </div>
                                            <Badge className={cn("border px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold", statusColors[contract.status])}>
                                                {contract.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Contract Value</p>
                                                <p className="text-white font-medium">₹{Number(contract.contract_value).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Start Date</p>
                                                <p className="text-white font-medium">{new Date(contract.start_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        
                                        {contract.status === 'signed' && contract.signature_data?.party_signed_at && (
                                            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg mb-4 font-medium">
                                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                <span>Signed: {new Date(contract.signature_data.party_signed_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        
                                        {contract.status === 'draft' && (
                                            <Button
                                                variant="outline"
                                                onClick={() => sendContractMutation.mutate(contract.id)}
                                                disabled={sendContractMutation.isPending}
                                                className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                            >
                                                {sendContractMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                                Send for Signature
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                        {contracts.length === 0 && (
                            <div className="col-span-full">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 py-16">
                                    <CardContent className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                            <FileSignature className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white">No contracts created yet</h3>
                                        <p className="text-gray-500 text-sm mt-1 mb-6">Start by creating a new contract for your clients.</p>
                                        <Button onClick={() => setShowContractDialog(true)} className="bg-white/10 text-white hover:bg-white/20">
                                            Create First Contract
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Proposals Tab */}
                <TabsContent value="proposals" className="space-y-6 focus:outline-none">
                    <div className="flex justify-between items-center bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-500" /> Project Proposals
                        </h2>
                        <Button 
                            onClick={() => setShowProposalDialog(true)} 
                            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20 border-0"
                        >
                            <FilePlus className="w-4 h-4 mr-2" /> New Proposal
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {proposals.map(proposal => (
                            <motion.div key={proposal.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 h-full relative overflow-hidden hover:border-purple-500/30 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
                                                    {proposal.project_title}
                                                </CardTitle>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span className="font-mono">{proposal.proposal_number}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600" /> 
                                                    <span>{proposal.client_name}</span>
                                                </p>
                                            </div>
                                            <Badge className={cn("border px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold", statusColors[proposal.status])}>
                                                {proposal.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Total Pricing</p>
                                                <p className="text-white font-medium">₹{Number(proposal.pricing?.total || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Valid Until</p>
                                                <p className="text-white font-medium">{new Date(proposal.valid_until).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                        {proposals.length === 0 && (
                            <div className="col-span-full">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 py-16">
                                    <CardContent className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                            <FileText className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white">No proposals created yet</h3>
                                        <Button onClick={() => setShowProposalDialog(true)} className="mt-4 bg-white/10 text-white hover:bg-white/20">
                                            Create First Proposal
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices" className="space-y-6 focus:outline-none">
                    <div className="flex justify-between items-center bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-emerald-500" /> Client Invoices
                        </h2>
                        <Button 
                            onClick={() => setShowInvoiceDialog(true)} 
                            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 border-0"
                        >
                            <FilePlus className="w-4 h-4 mr-2" /> New Invoice
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {invoices.map(invoice => (
                            <motion.div key={invoice.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 h-full relative overflow-hidden hover:border-emerald-500/30 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg text-white group-hover:text-emerald-400 transition-colors">{invoice.client_name}</CardTitle>
                                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                                    {invoice.invoice_number}
                                                </p>
                                            </div>
                                            <Badge className={cn("border px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold", statusColors[invoice.status])}>
                                                {invoice.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Invoice Total</p>
                                                <p className="text-white font-medium text-lg">₹{Number(invoice.total_amount).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Due Date</p>
                                                <p className={cn("font-medium", new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' ? "text-red-400" : "text-white")}>
                                                    {new Date(invoice.due_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                        {invoices.length === 0 && (
                            <div className="col-span-full">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 py-16">
                                    <CardContent className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                            <Receipt className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white">No invoices created yet</h3>
                                        <Button onClick={() => setShowInvoiceDialog(true)} className="mt-4 bg-white/10 text-white hover:bg-white/20">
                                            Create First Invoice
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Employee Agreements Tab */}
                <TabsContent value="agreements" className="space-y-6 focus:outline-none">
                    <div className="flex justify-between items-center bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-amber-500" /> Employee Agreements
                        </h2>
                        <Button 
                            onClick={() => setShowEmployeeAgreementDialog(true)} 
                            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/20 border-0"
                        >
                            <FilePlus className="w-4 h-4 mr-2" /> New Agreement
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {employeeAgreements.map(agreement => (
                            <motion.div key={agreement.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 h-full relative overflow-hidden hover:border-amber-500/30 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg text-white group-hover:text-amber-400 transition-colors">{agreement.employee_name}</CardTitle>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span className="font-mono">{agreement.agreement_number}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                    <span>{agreement.position}</span>
                                                </p>
                                            </div>
                                            <Badge className={cn("border px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold", statusColors[agreement.status])}>
                                                {agreement.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Salary / Pay</p>
                                                <p className="text-white font-medium">₹{Number(agreement.salary).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Type & Start</p>
                                                <p className="text-white font-medium text-xs">
                                                    <span className="capitalize">{agreement.agreement_type.replace('_', ' ')}</span> <br/>
                                                    {new Date(agreement.start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                        {employeeAgreements.length === 0 && (
                            <div className="col-span-full">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 py-16">
                                    <CardContent className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                            <Briefcase className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white">No employee agreements</h3>
                                        <Button onClick={() => setShowEmployeeAgreementDialog(true)} className="mt-4 bg-white/10 text-white hover:bg-white/20">
                                            Create First Agreement
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Offer Letters Tab */}
                <TabsContent value="offers" className="space-y-6 focus:outline-none">
                    <div className="flex justify-between items-center bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileUser className="w-5 h-5 text-cyan-500" /> Candidate Offer Letters
                        </h2>
                        <Button 
                            onClick={() => setShowOfferLetterDialog(true)} 
                            className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 border-0"
                        >
                            <FilePlus className="w-4 h-4 mr-2" /> New Offer Letter
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offerLetters.map(offer => (
                            <motion.div key={offer.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 h-full relative overflow-hidden hover:border-cyan-500/30 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg text-white group-hover:text-cyan-400 transition-colors">{offer.candidate_name}</CardTitle>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span className="font-mono">{offer.offer_number}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                    <span>{offer.position}</span>
                                                </p>
                                            </div>
                                            <Badge className={cn("border px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold", statusColors[offer.status])}>
                                                {offer.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Offered Salary</p>
                                                <p className="text-white font-medium">₹{Number(offer.salary).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Start & Expiry</p>
                                                <p className="text-white font-medium text-xs">
                                                    Start: {new Date(offer.start_date).toLocaleDateString()} <br/>
                                                    Exp: {new Date(offer.offer_expiry_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                        {offerLetters.length === 0 && (
                            <div className="col-span-full">
                                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 py-16">
                                    <CardContent className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                            <FileUser className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white">No offer letters generated</h3>
                                        <Button onClick={() => setShowOfferLetterDialog(true)} className="mt-4 bg-white/10 text-white hover:bg-white/20">
                                            Create First Offer
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
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
    );
}

export default function AdminDocumentsPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Documents />
            </AdminLayout>
        </AdminGuard>
    );
}