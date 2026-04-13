import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign } from 'lucide-react';

export default function BudgetWidget({ project, timeLogs = [] }) {
    const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
    const estimatedCost = totalHours * 1000; // ₹1000/hour default rate
    const budget = project?.budget || estimatedCost;
    const spent = estimatedCost;
    const percentSpent = budget > 0 ? (spent / budget) * 100 : 0;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Budget Utilization</p>
                        <p className="text-2xl font-bold">₹{spent.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">of ₹{budget.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <Progress value={Math.min(percentSpent, 100)} className="mb-2" />
                <p className="text-xs text-muted-foreground">{totalHours} hours logged</p>
            </CardContent>
        </Card>
    );
}