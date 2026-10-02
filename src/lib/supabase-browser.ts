'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client for the contact form and the /admin panel.
 * Session state is kept in localStorage (supabase-js default) — data access
 * itself is gated by row-level security, so a stale client can read only what
 * policies allow for its role.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
      { auth: { persistSession: true, autoRefreshToken: true } },
    );
  }
  return client;
}
