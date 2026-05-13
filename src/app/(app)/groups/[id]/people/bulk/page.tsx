'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

function parseNames(raw: string): string[] {
  return raw
    .split(',')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);
}

export default function BulkAddPeoplePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const preview = parseNames(text);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (preview.length === 0) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/groups/${id}/people/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/groups/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-indigo-600 p-2 -ml-2 text-2xl leading-none">
            ‹
          </button>
          <h1 className="text-lg font-bold">Bulk Add People</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Names <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Enter names separated by commas. Include a last name after a space (e.g. "John Smith, Jane, Bob Jones").
              </p>
              <textarea
                className="input min-h-[140px] resize-y"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="John Smith, Jane Doe, Bob, Alice Johnson…"
                autoFocus
              />
            </div>
          </div>

          {preview.length > 0 && (
            <div className="card">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Preview — {preview.length} {preview.length === 1 ? 'person' : 'people'}
              </p>
              <ul className="space-y-1.5">
                {preview.map((name, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
                      {name[0].toUpperCase()}
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || preview.length === 0}
            className="btn-primary w-full py-4 text-base"
          >
            {saving ? 'Saving…' : `Add ${preview.length > 0 ? preview.length : ''} ${preview.length === 1 ? 'Person' : 'People'}`}
          </button>
        </form>
      </main>
    </div>
  );
}
