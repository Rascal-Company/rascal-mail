import { createBrowserClient } from '@supabase/ssr';

// Auth client - points to Rascal AI Supabase for authentication
export function createAuthClient() {
  const url = process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing auth Supabase environment variables (NEXT_PUBLIC_AUTH_SUPABASE_URL, NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY)');
  }

  return createBrowserClient(url, anonKey);
}

// Data client - points to Rascal Mail Supabase for app data
export function createDataClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing data Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }

  return createBrowserClient(url, anonKey);
}

// Backwards-compatible alias
export const createClient = createDataClient;
