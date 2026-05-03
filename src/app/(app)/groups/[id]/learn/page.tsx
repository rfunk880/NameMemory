'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Person {
  id: number;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  notes: string | null;
  photoPath: string | null;
}

function displayName(p: Person) {
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ');
  return p.nickname ? `${p.firstName} "${p.nickname}" ${p.lastName ?? ''}`.trim() : full;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LearnPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [deck, setDeck] = useState<Person[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [got, setGot] = useState(0);
  const [again, setAgain] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/groups/${id}/people`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          router.push(`/groups/${id}`);
          return;
        }
        setPeople(data);
        setDeck(shuffle(data));
        setLoading(false);
      });
  }, [id, router]);

  const current = deck[index];

  const next = (knewIt: boolean) => {
    if (knewIt) setGot((n) => n + 1);
    else setAgain((n) => n + 1);

    if (index + 1 < deck.length) {
      setIndex(index + 1);
      setRevealed(false);
    } else {
      // Reshuffle and restart
      setDeck(shuffle(people));
      setIndex(0);
      setRevealed(false);
    }
  };

  if (loading || !current) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-gray-900">
        <button
          onClick={() => router.push(`/groups/${id}`)}
          className="text-indigo-400 text-sm font-medium px-2 py-1"
        >
          ✕ Exit
        </button>
        <div className="text-sm text-gray-400">
          {index + 1} / {deck.length}
        </div>
        <div className="text-sm font-medium">
          <span className="text-green-400">{got}</span>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-red-400">{again}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${((index + 1) / deck.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-5 gap-6">
        {/* Photo */}
        <div className="w-full max-w-xs">
          {current.photoPath ? (
            <img
              src={`/api/uploads/${current.photoPath}`}
              alt="Who is this?"
              className="w-full aspect-square rounded-3xl object-cover shadow-2xl"
            />
          ) : (
            <div className="w-full aspect-square rounded-3xl bg-gray-800 flex items-center justify-center text-7xl">
              🤷
            </div>
          )}
        </div>

        {/* Reveal section */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="btn-primary px-10 py-4 text-lg mt-2"
          >
            Reveal name
          </button>
        ) : (
          <div className="text-center w-full max-w-xs">
            <p className="text-2xl font-bold mb-1">{displayName(current)}</p>
            {current.notes && (
              <p className="text-sm text-gray-400 mb-5">{current.notes}</p>
            )}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => next(false)}
                className="btn bg-red-900/60 text-red-300 hover:bg-red-900 py-4 text-sm font-semibold rounded-xl"
              >
                Review again
              </button>
              <button
                onClick={() => next(true)}
                className="btn bg-green-900/60 text-green-300 hover:bg-green-900 py-4 text-sm font-semibold rounded-xl"
              >
                Got it ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
