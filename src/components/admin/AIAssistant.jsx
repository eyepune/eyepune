import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Copy, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant({ open, onClose, action, context, title, onUseResult }) {
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateResponse = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('adminAIAssistant', {
                action,
                context
            });

            if (response.data.success) {
                setResult(response.data.result);
            } else {
                toast.error('Failed to generate response');
            }
        } catch (error) {
            console.error('AI error:', error);
            toast.error('Failed to generate response');
        }
        setIsLoading(false);
    };

    const copyToClipboard = () => {
        const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const handleUse = () => {
        if (onUseResult) {
            onUseResult(result);
        }
        onClose();
    };

    React.useEffect(() => {
        if (open && !result) {
            generateResponse();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                        <p className="text-muted-foreground">AI is thinking...</p>
                    </div>
                ) : result ? (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                {typeof result === 'string' ? (
                                    <ReactMarkdown className="prose prose-sm max-w-none">
                                        {result}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="space-y-4">
                                        {result.recommended_template && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Recommended Template:</h4>
                                                <p className="text-sm bg-purple-50 dark:bg-purple-950 p-3 rounded">
                                                    {result.recommended_template}
                                                </p>
                                            </div>
                                        )}
                                        {result.reasoning && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Reasoning:</h4>
                                                <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                                            </div>
                                        )}
                                        {result.proposal_highlights && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Proposal Highlights:</h4>
                                                <ul className="text-sm space-y-1 list-disc list-inside">
                                                    {result.proposal_highlights.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.suggested_services && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Suggested Services:</h4>
                                                <ul className="text-sm space-y-1 list-disc list-inside">
                                                    {result.suggested_services.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.estimated_timeline && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Estimated Timeline:</h4>
                                                <p className="text-sm text-muted-foreground">{result.estimated_timeline}</p>
                                            </div>
                                        )}
                                        {result.agreement_clauses && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Agreement Clauses:</h4>
                                                <ul className="text-sm space-y-1 list-disc list-inside">
                                                    {result.agreement_clauses.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.tasks && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Generated Tasks:</h4>
                                                <div className="space-y-2">
                                                    {result.tasks.map((task, i) => (
                                                        <div key={i} className="border rounded p-3">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h5 className="font-medium text-sm">{task.task_name}</h5>
                                                                <span className="text-xs px-2 py-1 rounded bg-muted">
                                                                    {task.priority}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                {task.description}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Est. {task.estimated_hours} hours
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex gap-2">
                            <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </Button>
                            <Button onClick={generateResponse} variant="outline" className="flex-1">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Regenerate
                            </Button>
                            {onUseResult && (
                                <Button onClick={handleUse} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Use This
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}