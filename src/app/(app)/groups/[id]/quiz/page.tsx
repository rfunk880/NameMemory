'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Person {
  id: number;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  photoPath: string | null;
  active: boolean;
}

interface Question {
  person: Person;
  choices: Person[];
  correctIdx: number;
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

function buildQuestions(people: Person[]): Question[] {
  return shuffle(people).map((person) => {
    const others = shuffle(people.filter((p) => p.id !== person.id));
    const numChoices = Math.min(4, people.length);
    const wrong = others.slice(0, numChoices - 1);
    const choices = shuffle([person, ...wrong]);
    return { person, choices, correctIdx: choices.findIndex((c) => c.id === person.id) };
  });
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/groups/${id}/people`)
      .then((r) => r.json())
      .then((data) => {
        const activePeople = Array.isArray(data) ? data.filter((p: Person) => p.active) : [];
        if (activePeople.length < 2) {
          alert('Need at least 2 active people for the quiz');
          router.push(`/groups/${id}`);
          return;
        }
        setPeople(activePeople);
        setQuestions(buildQuestions(activePeople));
        setLoading(false);
      });
  }, [id, router]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[qIndex].correctIdx) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setQuestions(buildQuestions(people));
    setQIndex(0);
    setSelected(null);
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
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚';
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold mb-2">Quiz complete!</h2>
        <p className="text-5xl font-bold text-indigo-400 my-4">
          {score}/{questions.length}
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

  const q = questions[qIndex];

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
          {qIndex + 1} / {questions.length}
        </div>
        <div className="text-sm font-medium text-indigo-300">Score: {score}</div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-purple-500 transition-all"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center p-5 gap-5 overflow-y-auto">
        {/* Photo */}
        <div className="w-full max-w-xs mt-2">
          {q.person.photoPath ? (
            <img
              src={`/api/uploads/${q.person.photoPath}`}
              alt="Who is this?"
              className="w-full aspect-square rounded-3xl object-cover shadow-2xl"
            />
          ) : (
            <div className="w-full aspect-square rounded-3xl bg-gray-800 flex items-center justify-center text-7xl">
              🤷
            </div>
          )}
        </div>

        <p className="text-gray-400 text-sm">Who is this?</p>

        {/* Choices */}
        <div className="w-full max-w-xs space-y-3 pb-6">
          {q.choices.map((choice, i) => {
            const isSelected = selected === i;
            const isCorrect = i === q.correctIdx;
            const answered = selected !== null;

            let cls =
              'w-full py-4 px-5 rounded-2xl text-left font-semibold text-base transition-all ';
            if (!answered) {
              cls += 'bg-gray-800 hover:bg-gray-700 active:scale-95';
            } else if (isCorrect) {
              cls += 'bg-green-700 text-white';
            } else if (isSelected) {
              cls += 'bg-red-700 text-white';
            } else {
              cls += 'bg-gray-900 text-gray-600';
            }

            return (
              <button key={choice.id} className={cls} onClick={() => handleSelect(i)}>
                {displayName(choice)}
              </button>
            );
          })}
        </div>

        {/* Feedback + next */}
        {selected !== null && (
          <div className="w-full max-w-xs text-center pb-6">
            <p
              className={`text-xl font-bold mb-3 ${selected === q.correctIdx ? 'text-green-400' : 'text-red-400'}`}
            >
              {selected === q.correctIdx ? 'Correct!' : `That's ${displayName(q.person)}`}
            </p>
            <button onClick={handleNext} className="btn-primary w-full py-4 text-base">
              {qIndex + 1 < questions.length ? 'Next →' : 'See results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
