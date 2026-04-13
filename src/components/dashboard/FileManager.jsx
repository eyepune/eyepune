import React, { useState } from 'react';
import { FileText, Download, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function FileManager({ files, onDelete }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    const filteredFiles = files
        .filter(file => {
            const matchesSearch = file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                file.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
            if (sortBy === 'name') return a.file_name.localeCompare(b.file_name);
            if (sortBy === 'size') return (b.file_size || 0) - (a.file_size || 0);
            return 0;
        });

    const categoryColors = {
        contract: 'bg-blue-500/10 text-blue-600',
        asset: 'bg-purple-500/10 text-purple-600',
        deliverable: 'bg-green-500/10 text-green-600',
        feedback: 'bg-yellow-500/10 text-yellow-600',
        other: 'bg-gray-500/10 text-gray-600'
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..."
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="deliverable">Deliverable</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="size">Largest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* File List */}
            {filteredFiles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No files found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredFiles.map((file) => (
                        <div key={file.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-medium truncate">{file.file_name}</h4>
                                    <Badge className={categoryColors[file.category]} variant="outline">
                                        {file.category}
                                    </Badge>
                                </div>
                                {file.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                        {file.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(file.created_date).toLocaleDateString()}
                                    </span>
                                    <span>
                                        {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                    {file.uploaded_by && (
                                        <span>By {file.uploaded_by.split('@')[0]}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </a>
                                {onDelete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(file.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}