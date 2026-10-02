'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase-browser';
import { AdminShell } from '@/components/admin/AdminShell';

/**
 * Auth gate and chrome for the signed-in admin pages.
 *
 * `admin/login` sits outside this group, so it renders without the shell.
 * The guard is client-side because the session lives in localStorage — RLS is
 * what actually protects the data, so a flashed page is not a leaked page.
 */
export default function AdminAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/admin/login');
      } else {
        setUser(data.user);
        setChecking(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/admin/login');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  const signOut = useCallback(() => {
    void getSupabase()
      .auth.signOut()
      .then(() => router.replace('/admin/login'));
  }, [router]);

  if (checking || !user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-surface">
        <p className="text-sm text-muted">Checking session…</p>
      </main>
    );
  }

  return (
    <AdminShell user={user} onSignOut={signOut}>
      {children}
    </AdminShell>
  );
}
