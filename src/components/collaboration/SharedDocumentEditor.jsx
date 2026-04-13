import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DynamicQuill from '@/components/shared/DynamicQuill';
import 'react-quill/dist/quill.snow.css';
import { FileText, Plus, Save, Lock, Unlock } from 'lucide-react';

export default function SharedDocumentEditor({ project, user }) {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [content, setContent] = useState('');
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocType, setNewDocType] = useState('notes');
    const queryClient = useQueryClient();

    const { data: documents = [] } = useQuery({
        queryKey: ['shared-documents', project.id],
        queryFn: async () => {
            const all = await base44.entities.SharedDocument.list('-updated_date', 100);
            return all.filter(d => d.project_id === project.id);
        },
    });

    // Real-time subscription for document updates
    useEffect(() => {
        const unsubscribe = base44.entities.SharedDocument.subscribe((event) => {
            queryClient.invalidateQueries(['shared-documents']);
        });
        return unsubscribe;
    }, [queryClient]);

    const saveMutation = useMutation({
        mutationFn: (data) => base44.entities.SharedDocument.update(selectedDoc.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['shared-documents']);
        },
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.SharedDocument.create(data),
        onSuccess: (newDoc) => {
            queryClient.invalidateQueries(['shared-documents']);
            setSelectedDoc(newDoc);
            setShowNewDialog(false);
            setNewDocTitle('');
        },
    });

    useEffect(() => {
        if (selectedDoc) {
            const current = documents.find(d => d.id === selectedDoc.id);
            if (current && current.document_content !== content) {
                setContent(current.document_content || '');
            }
        }
    }, [documents, selectedDoc]);

    const handleSave = () => {
        if (selectedDoc) {
            saveMutation.mutate({
                document_content: content,
                last_edited_by: user.email
            });
        }
    };

    const handleCreate = () => {
        createMutation.mutate({
            project_id: project.id,
            document_title: newDocTitle,
            document_type: newDocType,
            document_content: '',
            last_edited_by: user.email
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Shared Documents
                </h3>
                <Button onClick={() => setShowNewDialog(true)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Document
                </Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-1">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            {documents.map(doc => (
                                <button
                                    key={doc.id}
                                    onClick={() => {
                                        setSelectedDoc(doc);
                                        setContent(doc.document_content || '');
                                    }}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                        selectedDoc?.id === doc.id 
                                            ? 'bg-red-50 border-red-500' 
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    <p className="font-medium text-sm mb-1">{doc.document_title}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {doc.document_type.replace('_', ' ')}
                                        </Badge>
                                        {doc.is_locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                                    </div>
                                </button>
                            ))}
                            {documents.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No documents yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    {selectedDoc ? (
                        <>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{selectedDoc.document_title}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Last edited by {selectedDoc.last_edited_by}
                                        </p>
                                    </div>
                                    <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-red-600 hover:bg-red-700">
                                        <Save className="w-4 h-4 mr-2" />
                                        {saveMutation.isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2 p-2 bg-muted/50 rounded flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        Real-time collaboration enabled • Auto-syncing changes
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {documents.filter(d => d.id === selectedDoc.id)[0]?.last_edited_by?.split('@')[0] || 'No edits yet'}
                                    </Badge>
                                </div>
                                <DynamicQuill
                                    value={content}
                                    onChange={setContent}
                                    theme="snow"
                                    className="min-h-[400px]"
                                />
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex items-center justify-center h-[500px]">
                            <div className="text-center">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">Select a document to edit</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Document Title</label>
                            <Input
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                                placeholder="e.g., Project Brief"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Document Type</label>
                            <Select value={newDocType} onValueChange={setNewDocType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="project_brief">Project Brief</SelectItem>
                                    <SelectItem value="specification">Specification</SelectItem>
                                    <SelectItem value="requirements">Requirements</SelectItem>
                                    <SelectItem value="notes">Notes</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCreate}
                                disabled={!newDocTitle.trim() || createMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 flex-1"
                            >
                                Create
                            </Button>
                            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}