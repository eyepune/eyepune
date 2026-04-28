import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from 'lucide-react';

export default function ProgressWidget({ project }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                        <p className="text-2xl font-bold">{project?.progressPercentage || 0}%</p>
                    </div>
                </div>
                <Progress value={project?.progressPercentage || 0} className="mt-4" />
            </CardContent>
        </Card>
    );
}