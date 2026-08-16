import { createBrowserClient } from "@supabase/ssr";
import { db } from '@/lib/supabase-entities';

// Support both Next.js (process.env) and Vite (import.meta.env)
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env?.VITE_SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env?.VITE_SUPABASE_ANON_KEY || 
  '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error('CRITICAL: Supabase credentials missing or invalid!');
  console.log('Current URL:', supabaseUrl);
  console.log('Check your .env file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
}

// Create SSR-compatible browser client
const supabaseClient = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

// ==========================================
// LEGACY ORM MOUNTING (MIGRATED FROM BASE44)
// ==========================================

// 1. Mount custom Auth methods
supabaseClient.auth.me = async function() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error || !session) throw { status: 401, message: 'Not authenticated' };
  
  const { data: userProfile } = await supabaseClient.from('users').select('*').eq('id', session.user.id).single();
  
  return {
    id: session.user.id,
    email: session.user.email,
    full_name: userProfile?.full_name || session.user.user_metadata?.full_name,
    role: userProfile?.role || 'client',
    avatar_url: userProfile?.avatar_url || session.user.user_metadata?.avatar_url,
    ...userProfile,
  };
};

supabaseClient.auth.updateMe = async function(data) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) throw { status: 401, message: 'Not authenticated' };

  const snakeData = {};
  for (const [key, value] of Object.entries(data)) {
    snakeData[key.replace(/[A-Z]/g, m => '_' + m.toLowerCase())] = value;
  }

  if (data.full_name || data.avatar_url) {
    await supabaseClient.auth.updateUser({
      data: { full_name: data.full_name, avatar_url: data.avatar_url },
    });
  }

  const { data: result, error } = await supabaseClient.from('users').update(snakeData).eq('id', session.user.id).select().single();
  if (error) throw error;
  return result;
};

// 2. Mount Entities
supabaseClient.entities = db;

// 3. Mount custom Integrations
supabaseClient.integrations = {
  Core: {
    async UploadFile({ file, bucket = 'uploads' }) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabaseClient.storage.from(bucket).upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(data.path);
      return { file_url: urlData.publicUrl };
    }
  }
};

// 4. Mount Custom Functions
const originalInvoke = supabaseClient.functions.invoke.bind(supabaseClient.functions);
supabaseClient.functions.invoke = async function(functionName, params) {
  // Sign Proposal Hook
  if (functionName === 'signProposal') {
    const { proposal_id, signature_name, client_ip } = params;
    const { data: proposal } = await supabaseClient.from('proposals').select('*').eq('id', proposal_id).single();
    await supabaseClient.from('proposals').update({ status: 'accepted', client_signature_name: signature_name, client_signed_at: new Date().toISOString(), client_signed_ip: client_ip }).eq('id', proposal_id);
    
    // Auto invoice
    const { data: invoice } = await supabaseClient.from('invoices').insert({
      client_name: proposal.client_name,
      client_email: proposal.client_email || '',
      total_amount: proposal.total_amount || proposal.pricing?.total || 0,
      status: 'pending',
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      items: proposal.pricing_items || proposal.pricing?.items || [],
      proposal_id: proposal.id
    }).select().single();
    
    if (invoice) await supabaseClient.from('proposals').update({ invoice_id: invoice.id }).eq('id', proposal_id);
    return { data: { success: true, invoice_id: invoice?.id } };
  }

  if (functionName === 'getProposalPublic') {
    const { data } = await supabaseClient.from('proposals').select('*').eq('id', params.proposal_id).single();
    return { data: { proposal: data } };
  }

  // Fallback to Edge Functions
  return await originalInvoke(functionName, { body: params });
};

// 5. Mount Agents
supabaseClient.agents = {
  async listConversations(params = {}) {
    let query = supabaseClient.from('ai_conversations').select('*');
    if (params.agent_name) query = query.eq('agent_name', params.agent_name);
    const { data: convs } = await query.order('updated_at', { ascending: false });
    return await Promise.all((convs || []).map(async (conv) => {
      const { data: messages } = await supabaseClient.from('ai_messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: false });
      return { ...conv, messages: (messages || []).reverse() };
    }));
  }
};

export const supabase = supabaseClient;
