'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Person {
  id: number;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  notes: string | null;
  photoPath: string | null;
  active: boolean;
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

function isMatch(answer: string, person: Person): boolean {
  const a = answer.trim().toLowerCase();
  if (!a) return false;
  const checks = [
    person.firstName,
    person.lastName,
    person.nickname,
    [person.firstName, person.lastName].filter(Boolean).join(' '),
    displayName(person),
  ]
    .filter((x): x is string => Boolean(x))
    .map((x) => x.toLowerCase());
  return checks.includes(a);
}

export default function TestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [deck, setDeck] = useState<Person[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/groups/${id}/people`)
      .then((r) => r.json())
      .then((data) => {
        const activePeople = Array.isArray(data) ? data.filter((p: Person) => p.active) : [];
        if (activePeople.length === 0) {
          router.push(`/groups/${id}`);
          return;
        }
        setPeople(activePeople);
        setDeck(shuffle(activePeople));
        setLoading(false);
      });
  }, [id, router]);

  useEffect(() => {
    if (!loading && !done && result === null) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [index, loading, done, result]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || result !== null) return;
    const correct = isMatch(answer, deck[index]);
    if (correct) setScore((s) => s + 1);
    setResult(correct ? 'correct' : 'wrong');
  };

  const handleNext = () => {
    if (index + 1 < deck.length) {
      setIndex(index + 1);
      setAnswer('');
      setResult(null);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setDeck(shuffle(people));
    setIndex(0);
    setAnswer('');
    setResult(null);
    setScore(0);
    setDone(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / deck.length) * 100);
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚';
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold mb-2">Test complete!</h2>
        <p className="text-5xl font-bold text-indigo-400 my-4">
          {score}/{deck.length}
        </p>
        <p className="text-lg text-gray-400 mb-8">{pct}% correct</p>
        <div className="flex gap-4">
          <button onClick={restart} className="btn-primary px-6 py-3">
            Try again
          </button>
          <button
            onClick={() => router.push(`/groups/${id}`)}
            className="btn bg-gray-800 text-gray-200 hover:bg-gray-700 px-6 py-3"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const current = deck[index];

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
        <div className="text-sm font-medium text-indigo-300">Score: {score}</div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${((index + 1) / deck.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center p-5 gap-5 overflow-y-auto">
        {/* Photo */}
        <div className="w-full max-w-xs mt-2">
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

        <p className="text-gray-400 text-sm">Type their name</p>

        {/* Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={result !== null}
            placeholder="First name, last name, or nickname…"
            autoCapitalize="words"
            autoCorrect="off"
            className="w-full px-5 py-4 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white text-base placeholder-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
          />
          {result === null && (
            <button
              type="submit"
              disabled={!answer.trim()}
              className="btn-primary w-full mt-3 py-4 text-base disabled:opacity-40"
            >
              Submit
            </button>
          )}
        </form>

        {/* Feedback */}
        {result !== null && (
          <div className="w-full max-w-xs text-center pb-6">
            {result === 'correct' ? (
              <p className="text-xl font-bold text-green-400 mb-3">Correct!</p>
            ) : (
              <>
                <p className="text-xl font-bold text-red-400 mb-1">Not quite</p>
                <p className="text-gray-300 mb-4">
                  The answer was{' '}
                  <span className="font-bold text-white">{displayName(current)}</span>
                </p>
                {current.notes && (
                  <p className="text-sm text-gray-500 mb-3">{current.notes}</p>
                )}
              </>
            )}
            <button onClick={handleNext} className="btn-primary w-full py-4 text-base">
              {index + 1 < deck.length ? 'Next →' : 'See results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
