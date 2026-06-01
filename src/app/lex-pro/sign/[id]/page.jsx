"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileText, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecureSignPortal() {
    const params = useParams();
    const contractId = params?.id;
    
    const [contract, setContract] = useState(null);
    const [auditTrails, setAuditTrails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [partyName, setPartyName] = useState('');
    const [isSigning, setIsSigning] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);

    useEffect(() => {
        if (!contractId) return;

        const fetchContract = async () => {
            try {
                const response = await fetch(`/api/lex-pro/contracts/${contractId}`);
                const data = await response.json();
                
                if (data.success) {
                    setContract(data.contract);
                    setAuditTrails(data.auditTrails || []);
                } else {
                    setError(data.error || 'Contract not found');
                }
            } catch (err) {
                setError('Network error connecting to the secure server.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContract();
    }, [contractId]);

    const handleSign = async () => {
        if (!partyName.trim()) {
            alert('Please enter your full legal name to sign.');
            return;
        }

        setIsSigning(true);
        try {
            // No auth token passed because this is the public counterparty
            const response = await fetch('/api/lex-pro/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractId: contractId,
                    partyName: partyName,
                    documentText: contract.content
                })
            });
            const data = await response.json();
            
            if (data.success) {
                setHasSigned(true);
                setAuditTrails(prev => [...prev, data.auditTrail]);
            } else {
                alert(`Error capturing signature: ${data.error}`);
            }
        } catch (err) {
            alert(`Network error: ${err.message}`);
        } finally {
            setIsSigning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Loading Secure Legal Document...</p>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-red-950/20 border border-red-500/20 p-8 rounded-2xl text-center">
                    <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-gray-400">{error || 'This secure link is invalid or has expired.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-orange-500/30">
            {/* Header */}
            <header className="h-20 border-b border-orange-500/20 bg-black/50 backdrop-blur-md flex items-center justify-center px-8 sticky top-0 z-50 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                        <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                        Lex Pro Secure Sign
                    </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Document View */}
                <div className="md:col-span-2 space-y-4 print:col-span-3 print:space-y-0" id="contract-content-container">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl print:bg-white print:border-none print:shadow-none print:text-black">
                        <h1 className="text-2xl font-bold text-white print:text-black mb-8 border-b border-white/10 print:border-gray-300 pb-4 text-center">
                            {contract.title}
                        </h1>
                        <div className="prose prose-invert print:prose-p:text-black max-w-none text-gray-300 print:text-black whitespace-pre-wrap font-serif leading-relaxed text-sm">
                            {contract.content}
                        </div>
                        
                        {/* Print-only audit trail appended to the end of the document */}
                        <div className="hidden print:block mt-12 pt-8 border-t border-gray-300">
                            <h3 className="text-lg font-bold text-black mb-4">Digital Execution Audit Trail</h3>
                            {auditTrails.map((trail, idx) => (
                                <div key={idx} className="mb-4 text-sm text-gray-800">
                                    <p><strong>Signed By:</strong> {trail.party_name}</p>
                                    <p><strong>Date:</strong> {new Date(trail.signed_at).toLocaleString()}</p>
                                    <p><strong>IP Address:</strong> {trail.ip_address}</p>
                                    <p><strong>Document Hash (SHA-256):</strong> {trail.document_hash}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Signing Panel */}
                <div className="md:col-span-1 sticky top-28 space-y-6 print:hidden">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                        
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                            Digital Execution
                        </h2>
                        <p className="text-xs text-gray-400 mb-6">
                            By signing, your IP Address and a cryptographic hash of this document will be recorded for legal validity.
                        </p>

                        {hasSigned ? (
                            <div className="space-y-4">
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                                    <h3 className="text-green-400 font-bold mb-1">Successfully Signed</h3>
                                    <p className="text-green-400/80 text-xs">Your cryptographic signature has been securely recorded.</p>
                                </div>
                                <Button 
                                    onClick={() => window.print()}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium h-10 border border-white/10"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download as PDF
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Full Legal Name</label>
                                    <input 
                                        type="text" 
                                        value={partyName}
                                        onChange={(e) => setPartyName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                                    />
                                </div>
                                <Button 
                                    onClick={handleSign}
                                    disabled={isSigning || !partyName.trim()}
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold h-12"
                                >
                                    {isSigning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    I Agree & Sign Document
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Existing Signatures */}
                    {auditTrails.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Audit Trail</h3>
                            <div className="space-y-4">
                                {auditTrails.map((trail, idx) => (
                                    <div key={idx} className="border-l-2 border-orange-500 pl-4 py-2 space-y-1">
                                        <div className="text-sm font-bold text-white flex items-center justify-between">
                                            {trail.party_name}
                                            <ShieldCheck className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div className="text-xs text-gray-400 flex justify-between">
                                            <span>IP Address:</span> 
                                            <span className="font-mono text-gray-300">{trail.ip_address}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 flex justify-between">
                                            <span>SHA-256 Hash:</span> 
                                            <span className="font-mono text-gray-300">{trail.document_hash?.substring(0, 12)}...</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 border-t border-white/10 pt-1">
                                            {new Date(trail.signed_at).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
