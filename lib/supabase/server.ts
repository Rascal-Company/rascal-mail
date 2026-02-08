import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side auth client - Rascal AI Supabase (authentication)
export function createAuthServerClient() {
  const url = process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing auth Supabase environment variables');
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Ignore - this is for server components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Ignore
        }
      },
    },
  });
}

// Server-side data client - Rascal Mail Supabase (app data, user-scoped via RLS)
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing data Supabase environment variables');
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Ignore
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Ignore
        }
      },
    },
  });
}

// Admin data client - Rascal Mail Supabase with service role (bypasses RLS)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  return createServerClient(url, serviceRoleKey, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });
}
