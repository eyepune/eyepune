/**
 * Stub for @base44/sdk/dist/utils/axios-client
 * 
 * This was used by the old AuthContext for creating HTTP clients.
 * With Supabase Auth, this is no longer needed but we provide
 * a stub to prevent import errors.
 */

export function createAxiosClient() {
  console.warn('[Deprecation] createAxiosClient is deprecated. Use Supabase client directly.');
  return {
    get: () => Promise.reject(new Error('Use Supabase client instead')),
    post: () => Promise.reject(new Error('Use Supabase client instead')),
    put: () => Promise.reject(new Error('Use Supabase client instead')),
    delete: () => Promise.reject(new Error('Use Supabase client instead')),
  };
}
