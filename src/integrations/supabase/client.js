import { createBrowserClient } from "@supabase/ssr";

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
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));
