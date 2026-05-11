/**
 * EyE PunE AI Sales Strategist
 * Intelligence layer for lead scoring and daily outreach roadmaps.
 */

import { supabase } from '@/integrations/supabase/client';

export const scoreLead = async (lead) => {
    // Basic scoring based on profile completeness
    let score = 20; 
    if (lead.email) score += 20;
    if (lead.phone) score += 20;
    if (lead.company) score += 10;
    
    // AI Analysis for "Heat Level"
    // In a full implementation, we'd call LLM here to analyze lead.notes or lead.message
    const intentWords = ['urgent', 'start', 'pricing', 'enterprise', 'automation', 'quote'];
    const notes = (lead.notes || '').toLowerCase();
    
    intentWords.forEach(word => {
        if (notes.includes(word)) score += 10;
    });

    return Math.min(score, 100);
};

export const generateDailyOutreachRoadmap = async () => {
    const { data: recentLeads, error } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('score', { ascending: false });

    if (error) throw error;
    if (!recentLeads || recentLeads.length === 0) return null;

    const hotLeads = recentLeads.filter(l => (l.score || 0) >= 70);
    const warmLeads = recentLeads.filter(l => (l.score || 0) < 70 && (l.score || 0) >= 40);

    return {
        summary: `You have ${recentLeads.length} new leads from the last 24h. ${hotLeads.length} are HOT.`,
        hotLeads: hotLeads.map(l => ({
            name: l.full_name,
            email: l.email,
            company: l.company,
            strategy: `Focus on their ${l.source === 'assessment' ? 'AI Assessment results' : 'specific project notes'}.`
        })),
        warmLeads: warmLeads.length
    };
};
