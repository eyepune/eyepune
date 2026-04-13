import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, project_id, subscription_id, custom_sections } = await req.json();

        if (action === 'generateReport') {
            const project = await base44.asServiceRole.entities.ClientProject.filter({ id: project_id });
            if (!project || project.length === 0) {
                throw new Error('Project not found');
            }

            const [tasks, milestones, timeLogs, comments] = await Promise.all([
                base44.asServiceRole.entities.ProjectTask.filter({ project_id }),
                base44.asServiceRole.entities.ClientMilestone.filter({ project_id }),
                base44.asServiceRole.entities.TimeLog.filter({ project_id }),
                base44.asServiceRole.entities.TaskComment.filter({ project_id })
            ]);

            const completedTasks = tasks.filter(t => t.status === 'completed');
            const recentlyCompletedTasks = completedTasks.filter(t => {
                const completedDate = new Date(t.completed_date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return completedDate >= weekAgo;
            });

            const upcomingMilestones = milestones.filter(m => 
                m.status !== 'completed' && new Date(m.due_date) > new Date()
            ).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 3);

            const overdueTasks = tasks.filter(t => 
                t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()
            );

            const blockedTasks = tasks.filter(t => t.status === 'blocked');

            const weekHours = timeLogs.filter(log => {
                const logDate = new Date(log.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return logDate >= weekAgo;
            }).reduce((sum, log) => sum + log.hours, 0);

            const reportData = {
                project_name: project[0].project_name,
                progress: project[0].progress_percentage,
                status: project[0].status,
                total_tasks: tasks.length,
                completed_tasks: completedTasks.length,
                recent_completions: recentlyCompletedTasks.map(t => t.task_name),
                upcoming_milestones: upcomingMilestones.map(m => ({
                    title: m.title,
                    due_date: m.due_date
                })),
                hours_this_week: weekHours,
                risks: [...overdueTasks.map(t => `Task overdue: ${t.task_name}`), 
                        ...blockedTasks.map(t => `Blocked task: ${t.task_name}`)],
                recent_activity: comments.slice(-5).map(c => ({
                    user: c.created_by,
                    text: c.comment_text,
                    date: c.created_date
                }))
            };

            const includeSections = custom_sections || ['progress', 'achievements', 'milestones', 'risks'];

            const report = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Generate a professional client progress report for this project:

${JSON.stringify(reportData, null, 2)}

Include these sections: ${includeSections.join(', ')}

Create a comprehensive, professional report with:
- Executive summary highlighting key points
- Progress overview with percentage and status
- Key achievements this period
- Upcoming milestones with dates
- Any risks or blockers
- Team activity summary
- Next steps

Use a positive, professional tone. Format as HTML for email.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        subject: { type: "string" },
                        executive_summary: { type: "string" },
                        progress_section: { type: "string" },
                        achievements_section: { type: "string" },
                        milestones_section: { type: "string" },
                        risks_section: { type: "string" },
                        next_steps: { type: "string" }
                    }
                }
            });

            return Response.json({ success: true, report, data: reportData });
        }

        if (action === 'sendScheduledReports') {
            const subscriptions = await base44.asServiceRole.entities.ClientReportSubscription.filter({
                active: true
            });

            const today = new Date();
            const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const todayStr = today.toISOString().split('T')[0];

            const sentReports = [];

            for (const subscription of subscriptions) {
                // Check if report should be sent today
                const shouldSend = 
                    (subscription.frequency === 'weekly' && subscription.delivery_day === dayOfWeek) ||
                    (subscription.frequency === 'biweekly' && subscription.delivery_day === dayOfWeek && 
                     (!subscription.last_sent_date || 
                      (new Date() - new Date(subscription.last_sent_date)) >= 13 * 24 * 60 * 60 * 1000)) ||
                    (subscription.frequency === 'monthly' && 
                     (!subscription.last_sent_date || 
                      new Date().getMonth() !== new Date(subscription.last_sent_date).getMonth()));

                if (!shouldSend) continue;

                const reportResponse = await base44.asServiceRole.functions.invoke('clientReportGenerator', {
                    action: 'generateReport',
                    project_id: subscription.project_id,
                    custom_sections: subscription.include_sections
                });

                const { report, data } = reportResponse.data;

                const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 40px 20px; text-align: center; }
        .section { margin: 30px 0; padding: 20px; background: #f9fafb; border-left: 4px solid #DC2626; }
        .section h2 { color: #DC2626; margin-top: 0; }
        .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { background: linear-gradient(90deg, #DC2626, #EF4444); height: 100%; transition: width 0.3s; }
        .milestone { padding: 10px; margin: 10px 0; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 30px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Project Progress Report</h1>
        <p>${data.project_name}</p>
        <p>${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
    </div>

    <div style="padding: 20px;">
        <div class="section">
            <h2>📊 Executive Summary</h2>
            <p>${report.executive_summary}</p>
        </div>

        ${subscription.include_sections.includes('progress') ? `
        <div class="section">
            <h2>🎯 Progress Overview</h2>
            <p>${report.progress_section}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.progress}%"></div>
            </div>
            <p style="text-align: center; font-weight: bold; color: #DC2626;">${data.progress}% Complete</p>
        </div>
        ` : ''}

        ${subscription.include_sections.includes('achievements') ? `
        <div class="section">
            <h2>🏆 Key Achievements</h2>
            <p>${report.achievements_section}</p>
        </div>
        ` : ''}

        ${subscription.include_sections.includes('milestones') ? `
        <div class="section">
            <h2>🎯 Upcoming Milestones</h2>
            <p>${report.milestones_section}</p>
            ${data.upcoming_milestones.map(m => `
                <div class="milestone">
                    <strong>${m.title}</strong><br>
                    <span style="color: #6b7280;">Due: ${new Date(m.due_date).toLocaleDateString('en-IN')}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${subscription.include_sections.includes('risks') && data.risks.length > 0 ? `
        <div class="section" style="border-left-color: #EF4444; background: #FEF2F2;">
            <h2>⚠️ Risks & Blockers</h2>
            <p>${report.risks_section}</p>
        </div>
        ` : ''}

        ${subscription.include_sections.includes('time_logs') ? `
        <div class="section">
            <h2>⏱️ Time Investment</h2>
            <p>${data.hours_this_week} hours logged this week</p>
        </div>
        ` : ''}

        <div class="section">
            <h2>🚀 Next Steps</h2>
            <p>${report.next_steps}</p>
        </div>
    </div>

    <div class="footer">
        <p>This is an automated progress report from EyE PunE</p>
        <p>Questions? Reply to this email or contact us at connect@eyepune.com</p>
    </div>
</body>
</html>
                `.trim();

                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: subscription.client_email,
                    subject: report.subject,
                    body: htmlReport
                });

                await base44.asServiceRole.entities.ClientReportSubscription.update(subscription.id, {
                    last_sent_date: todayStr
                });

                sentReports.push({
                    project_id: subscription.project_id,
                    client_email: subscription.client_email
                });
            }

            return Response.json({ 
                success: true, 
                message: `Sent ${sentReports.length} reports`,
                sent: sentReports 
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Client report generator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});