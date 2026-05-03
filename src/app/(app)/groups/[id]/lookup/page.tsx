'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Person {
  id: number;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  company: string | null;
  thumbPath: string | null;
  photoPath: string | null;
}

function displayName(p: Person) {
  const base = [p.firstName, p.lastName].filter(Boolean).join(' ');
  return p.nickname ? `${p.firstName} "${p.nickname}" ${p.lastName ?? ''}`.trim() : base;
}

function Avatar({ person, size = 'sm' }: { person: Person; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-48 h-48' : 'w-full aspect-square';
  const text = size === 'lg' ? 'text-6xl' : 'text-2xl';

  if (person.thumbPath) {
    return (
      <img
        src={`/api/uploads/${person.thumbPath}`}
        alt={person.firstName}
        className={`${dim} object-cover rounded-2xl bg-gray-100`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-2xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-500 ${text}`}>
      {person.firstName[0].toUpperCase()}
    </div>
  );
}

export default function LookupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Person | null>(null);

  useEffect(() => {
    fetch(`/api/groups/${id}/people`)
      .then((r) => r.json())
      .then((data) => {
        setPeople(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [id]);

  const dismiss = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismiss]);

  const filtered = query.trim()
    ? people.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.firstName.toLowerCase().includes(q) ||
          (p.lastName ?? '').toLowerCase().includes(q) ||
          (p.nickname ?? '').toLowerCase().includes(q) ||
          (p.company ?? '').toLowerCase().includes(q)
        );
      })
    : people;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 p-2 -ml-2 text-2xl leading-none hover:text-white transition"
          >
            ‹
          </button>
          <input
            type="search"
            placeholder="Search by name or company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 py-4 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <div className="text-5xl mb-3">🤷</div>
            <p>{query ? 'No match' : 'No people yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filtered.map((person) => (
              <button
                key={person.id}
                onClick={() => setSelected(person)}
                className="group flex flex-col items-center gap-1.5 p-1 rounded-2xl active:scale-95 transition hover:bg-white/5"
              >
                <Avatar person={person} size="sm" />
                <span className="text-xs text-gray-300 text-center leading-tight truncate w-full px-1 group-hover:text-white transition">
                  {person.firstName}
                  {person.lastName ? ` ${person.lastName[0]}.` : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Popup overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={dismiss}
        >
          <div
            className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar person={selected} size="lg" />

            <div className="text-center">
              <p className="text-4xl font-bold text-white leading-tight mb-1">
                {displayName(selected)}
              </p>
              {selected.company && (
                <p className="text-xl text-indigo-400 font-medium">{selected.company}</p>
              )}
            </div>

            <button
              onClick={dismiss}
              className="mt-1 text-gray-500 text-sm hover:text-gray-300 transition"
            >
              Tap anywhere to close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
