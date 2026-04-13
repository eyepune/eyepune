import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, FileText, Loader2, PenTool } from 'lucide-react';

export default function SignContract() {
    const urlParams = new URLSearchParams(window.location.search);
    const contractId = urlParams.get('id');
    const [name, setName] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [signature, setSignature] = useState('');
    const canvasRef = useRef(null);
    const [signed, setSigned] = useState(false);

    const { data: contract, isLoading } = useQuery({
        queryKey: ['contract', contractId],
        queryFn: () => base44.entities.Contract.filter({ id: contractId }),
        enabled: !!contractId,
        select: (data) => data[0]
    });

    useEffect(() => {
        if (contract?.party_name) {
            setName(contract.party_name);
        }
    }, [contract]);

    const signContractMutation = useMutation({
        mutationFn: async () => {
            const canvas = canvasRef.current;
            const signatureImage = canvas.toDataURL();

            await base44.entities.Contract.update(contractId, {
                status: 'signed',
                signed_date: new Date().toISOString(),
                signature_data: {
                    ...contract.signature_data,
                    party_signature: signatureImage,
                    party_signed_at: new Date().toISOString(),
                    party_ip_address: 'Browser'
                }
            });
        },
        onSuccess: () => {
            setSigned(true);
        }
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        let drawing = false;
        let lastX = 0;
        let lastY = 0;

        const startDrawing = (e) => {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = (e.clientX || e.touches[0].clientX) - rect.left;
            lastY = (e.clientY || e.touches[0].clientY) - rect.top;
            setIsDrawing(true);
        };

        const draw = (e) => {
            if (!drawing) return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();

            lastX = x;
            lastY = y;
        };

        const stopDrawing = () => {
            drawing = false;
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, []);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsDrawing(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">Contract not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (contract.status === 'signed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Already Signed</h2>
                        <p className="text-muted-foreground">This contract has already been signed.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (signed) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Contract Signed Successfully!</h2>
                        <p className="text-muted-foreground mb-4">
                            Thank you for signing. A copy has been saved to our records.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Signed on: {new Date().toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-6 h-6" />
                            Sign Contract
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                            <AlertDescription>
                                Please review the contract details below and provide your electronic signature to proceed.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <div>
                                <p className="text-sm text-muted-foreground">Contract Number</p>
                                <p className="font-semibold">{contract.contract_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Contract Type</p>
                                <p className="font-semibold capitalize">{contract.contract_type.replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Party Name</p>
                                <p className="font-semibold">{contract.party_name}</p>
                            </div>
                            {contract.contract_value && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Contract Value</p>
                                    <p className="font-semibold">₹{Number(contract.contract_value).toLocaleString()}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground">Scope of Work</p>
                                <p className="text-sm whitespace-pre-wrap">{contract.scope_of_work}</p>
                            </div>
                            {contract.deliverables?.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Deliverables</p>
                                    <ul className="text-sm space-y-1">
                                        {contract.deliverables.map((d, i) => (
                                            <li key={i}>• {d}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Terms & Conditions</p>
                                <div className="text-xs whitespace-pre-wrap bg-background p-3 rounded border max-h-64 overflow-y-auto">
                                    {contract.terms_and_conditions}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Your Full Name *</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="flex items-center gap-2">
                                        <PenTool className="w-4 h-4" />
                                        Your Signature *
                                    </Label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={clearSignature}
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <canvas
                                    ref={canvasRef}
                                    width={600}
                                    height={200}
                                    className="border rounded-lg w-full bg-white cursor-crosshair"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Draw your signature above using your mouse or finger
                                </p>
                            </div>

                            <Alert>
                                <AlertDescription className="text-xs">
                                    By signing this document electronically, you agree that your electronic signature is the legal equivalent of your manual signature on this contract. You consent to be legally bound by this contract's terms and conditions.
                                </AlertDescription>
                            </Alert>

                            <Button
                                onClick={() => signContractMutation.mutate()}
                                disabled={!name || !isDrawing || signContractMutation.isPending}
                                className="w-full bg-red-600 hover:bg-red-700"
                                size="lg"
                            >
                                {signContractMutation.isPending ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Signing...</>
                                ) : (
                                    <><CheckCircle className="w-5 h-5 mr-2" /> Sign Contract</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}