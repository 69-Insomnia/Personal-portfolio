'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSupabase()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) {
          router.replace('/admin');
        } else {
          setChecking(false);
        }
      });
  }, [router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await getSupabase().auth.signInWithPassword({ email, password });
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Wrong email or password.'
          : err.message,
      );
      setBusy(false);
      return;
    }
    router.replace('/admin');
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <LockKeyhole size={18} aria-hidden />
          </span>
          <div>
            <p className="text-label font-medium uppercase text-muted">Admin</p>
            <h1 className="text-xl font-medium tracking-tight">Sign in</h1>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <div>
            <label htmlFor="admin-email" className="text-label font-medium uppercase text-muted">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full border border-line-strong bg-paper px-4 py-3 text-base transition-colors focus:border-accent focus:ring-4 focus:ring-accent-soft"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="text-label font-medium uppercase text-muted">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full border border-line-strong bg-paper px-4 py-3 text-base transition-colors focus:border-accent focus:ring-4 focus:ring-accent-soft"
            />
          </div>

          {error ? (
            <p role="alert" className="border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || checking}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {busy ? <LoaderCircle size={15} className="animate-spin" aria-hidden /> : null}
            {checking ? 'Checking session…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Access is limited to the site owner. Sessions are issued by Supabase Auth and every
          query is checked by row-level security.
        </p>
      </div>
    </main>
  );
}
