import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsHistory({ project }) {
    const [generatingReport, setGeneratingReport] = React.useState(false);

    const generateOnDemandReport = async () => {
        setGeneratingReport(true);
        try {
            const response = await base44.functions.invoke('clientReportGenerator', {
                action: 'generateReport',
                project_id: project.id,
                custom_sections: ['progress', 'achievements', 'milestones', 'risks', 'time_logs']
            });
            
            if (response.data.success) {
                const { report } = response.data;
                
                // Create a downloadable HTML file
                const blob = new Blob([`
<!DOCTYPE html>
<html>
<head>
    <title>Project Report - ${project.project_name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #DC2626; }
        .section { margin: 30px 0; padding: 20px; background: #f9fafb; border-left: 4px solid #DC2626; }
    </style>
</head>
<body>
    <h1>${report.subject}</h1>
    <div class="section">
        <h2>Executive Summary</h2>
        <p>${report.executive_summary}</p>
    </div>
    <div class="section">
        <h2>Progress Overview</h2>
        <p>${report.progress_section}</p>
    </div>
    <div class="section">
        <h2>Key Achievements</h2>
        <p>${report.achievements_section}</p>
    </div>
    <div class="section">
        <h2>Upcoming Milestones</h2>
        <p>${report.milestones_section}</p>
    </div>
    ${report.risks_section ? `
    <div class="section">
        <h2>Risks & Blockers</h2>
        <p>${report.risks_section}</p>
    </div>
    ` : ''}
    <div class="section">
        <h2>Next Steps</h2>
        <p>${report.next_steps}</p>
    </div>
</body>
</html>
                `], { type: 'text/html' });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `project-report-${new Date().toISOString().split('T')[0]}.html`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                a.remove();
            }
        } catch (error) {
            console.error('Report generation error:', error);
            alert('Failed to generate report');
        }
        setGeneratingReport(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Project Reports
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg border border-red-200 dark:border-red-800">
                        <Sparkles className="w-6 h-6 text-red-600" />
                        <div className="flex-1">
                            <p className="font-semibold">AI-Generated Reports</p>
                            <p className="text-sm text-muted-foreground">
                                Get instant insights on your project progress
                            </p>
                        </div>
                        <Button 
                            onClick={generateOnDemandReport}
                            disabled={generatingReport}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {generatingReport ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Generate Report
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                        <p className="mb-2">Your AI-generated report will include:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Executive summary with key highlights</li>
                            <li>Current progress and completion status</li>
                            <li>Recent achievements and milestones</li>
                            <li>Upcoming deliverables and deadlines</li>
                            <li>Team activity and time investment</li>
                            <li>Any risks or blockers identified</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}