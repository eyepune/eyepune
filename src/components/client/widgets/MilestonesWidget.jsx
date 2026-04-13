import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from 'lucide-react';

export default function MilestonesWidget({ milestones = [] }) {
    const completed = milestones.filter(m => m.status === 'completed').length;
    
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Milestones</p>
                        <p className="text-2xl font-bold">{completed}/{milestones.length}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}