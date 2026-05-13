'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResetUrl(null);
    setCopied(false);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate reset link');

      setSubmitted(true);
      setResetUrl(data.resetUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!resetUrl) return;
    try {
      await navigator.clipboard.writeText(resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-indigo-50 to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-3xl font-bold text-indigo-600">NameMemory</h1>
          <p className="text-gray-500 mt-1">Remember every face, every name</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-2 text-center">Reset your password</h2>
          <p className="text-sm text-gray-500 text-center mb-5">
            Enter your account email to generate a reset link.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              {resetUrl ? (
                <>
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                    Reset link generated. It expires in 30 minutes.
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Your reset link
                    </label>
                    <div className="break-all bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-700">
                      {resetUrl}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleCopy} className="btn-secondary flex-1">
                      {copied ? 'Copied!' : 'Copy link'}
                    </button>
                    <Link href={resetUrl} className="btn-primary flex-1 text-center">
                      Open
                    </Link>
                  </div>
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
                  If an account exists for that email, a reset link has been generated.
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Generating…' : 'Generate reset link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Remembered it?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
