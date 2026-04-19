/**
 * Base44 SDK Compatibility Layer — Supabase-backed
 * 
 * This module replaces the original `@base44/sdk` client with a Supabase-backed
 * implementation that provides the same API surface (`base44.entities`, `base44.auth`,
 * `base44.integrations`). This allows all existing component imports of
 * `import { base44 } from '@/api/base44Client'` to continue working without changes.
 * 
 * Migration path: Components can gradually migrate to direct Supabase imports.
 */

import { supabase } from '@/integrations/supabase/client';
import { db, SupabaseEntity, ENTITY_TABLE_MAP } from '@/lib/supabase-entities';

// ── Auth API ────────────────────────────────────────────────────────────
const auth = {
  /**
   * Get the currently authenticated user
   */
  async me() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw { status: 401, message: 'Not authenticated' };
    }
    
    // Fetch the user profile from the users table for role info
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      // Return basic user info from auth if profile not found
      return {
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        role: 'client',
        avatar_url: session.user.user_metadata?.avatar_url || null,
      };
    }
    
    return {
      id: session.user.id,
      email: session.user.email,
      full_name: userProfile.full_name || session.user.user_metadata?.full_name,
      role: userProfile.role || 'client',
      avatar_url: userProfile.avatar_url || session.user.user_metadata?.avatar_url,
      ...userProfile,
    };
  },

  /**
   * Update the current user's profile
   */
  async updateMe(data) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw { status: 401, message: 'Not authenticated' };

    const snakeData = {};
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      snakeData[snakeKey] = value;
    }

    // Update user metadata in Supabase Auth
    if (data.full_name || data.avatar_url) {
      await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          avatar_url: data.avatar_url,
        },
      });
    }

    // Update the users table
    const { data: result, error } = await supabase
      .from('users')
      .update(snakeData)
      .eq('id', session.user.id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  /**
   * Logout the current user
   */
  async logout(returnUrl) {
    await supabase.auth.signOut();
    if (returnUrl && typeof window !== 'undefined') {
      // Redirect to login page after sign out
      window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`;
    }
  },

  /**
   * Redirect to login page
   */
  redirectToLogin(returnUrl) {
    if (typeof window !== 'undefined') {
      const loginUrl = returnUrl 
        ? `/login?redirect=${encodeURIComponent(returnUrl)}`
        : '/login';
      window.location.href = loginUrl;
    }
  },
};

// ── Integrations API ────────────────────────────────────────────────────
const integrations = {
  Core: {
    /**
     * Invoke LLM — proxies through our secure API route
     */
    async InvokeLLM({ prompt, model }) {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'LLM request failed' }));
        throw new Error(error.error || 'LLM request failed');
      }

      const data = await response.json();
      return data.content;
    },

    /**
     * Upload a file to Supabase Storage
     */
    async UploadFile({ file, bucket = 'uploads' }) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      return { file_url: urlData.publicUrl };
    },

    /**
     * Generate an image via the LLM proxy
     */
    async GenerateImage({ prompt }) {
      const response = await fetch('/api/llm/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Image generation failed' }));
        throw new Error(error.error || 'Image generation failed');
      }

      const data = await response.json();
      return data;
    },

    /**
     * Send a transactional email via the /api/email route (Resend-backed)
     */
    async SendEmail({ to, subject, html, text, from, replyTo }) {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, text, from, replyTo }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Email sending failed' }));
        throw new Error(error.error || 'Email sending failed');
      }

      const data = await response.json();
      return data;
    },
  },
};

// ── Functions API ───────────────────────────────────────────────────────
const functions = {
  /**
   * Invoke various business logic functions
   */
  async invoke(functionName, params) {
    console.log(`[base44.functions] Invoking ${functionName}`, params);

    // 1. Sign Proposal Logic
    if (functionName === 'signProposal') {
      const { proposal_id, signature_name, client_ip } = params;
      
      const { data: proposal, error: fetchErr } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposal_id)
        .single();
        
      if (fetchErr) throw fetchErr;

      const { error: signErr } = await supabase
        .from('proposals')
        .update({
          status: 'accepted',
          client_signature_name: signature_name,
          client_signed_at: new Date().toISOString(),
          client_signed_ip: client_ip
        })
        .eq('id', proposal_id);
        
      if (signErr) throw signErr;

      // AUTOMATIC INVOICE GENERATION
      // satisfy USER requirement: "once signed an invoice automatically is generated"
      const invoiceData = {
        client_name: proposal.client_name,
        client_email: proposal.client_email || '',
        total_amount: proposal.total_amount || proposal.pricing?.total || 0,
        status: 'pending',
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        items: proposal.pricing_items || proposal.pricing?.items || [],
        proposal_id: proposal.id
      };

      const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invErr) {
        console.error('Invoice auto-generation failed', invErr);
      } else {
        await supabase.from('proposals').update({ invoice_id: invoice.id }).eq('id', proposal_id);
      }

      return { data: { success: true, invoice_id: invoice?.id } };
    }

    if (functionName === 'getProposalPublic') {
      const { data, error } = await supabase.from('proposals').select('*').eq('id', params.proposal_id).single();
      if (error) throw error;
      return { data: { proposal: data } };
    }

    // Default: try Supabase Edge Functions
    const { data, error } = await supabase.functions.invoke(functionName, { body: params });
    if (error) throw error;
    return { data };
  }
};

// ── Build the base44-compatible export ──────────────────────────────────
export const base44 = {
  entities: db,
  auth,
  integrations,
  functions,
};
