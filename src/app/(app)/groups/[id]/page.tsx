'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Person {
  id: number;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  company: string | null;
  notes: string | null;
  thumbPath: string | null;
}

interface Group {
  id: number;
  name: string;
  _count: { people: number };
}

function displayName(p: Person) {
  const base = [p.firstName, p.lastName].filter(Boolean).join(' ');
  return p.nickname ? `${p.firstName} "${p.nickname}" ${p.lastName ?? ''}`.trim() : base;
}

function PhotoAvatar({ thumbPath, name }: { thumbPath: string | null; name: string }) {
  if (thumbPath) {
    return (
      <img
        src={`/api/uploads/${thumbPath}`}
        alt={name}
        className="w-14 h-14 rounded-full object-cover bg-gray-100"
      />
    );
  }
  return (
    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-500">
      {name[0].toUpperCase()}
    </div>
  );
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/groups/${id}`).then((r) => {
        if (!r.ok) throw new Error(`Group not found (${r.status})`);
        return r.json();
      }),
      fetch(`/api/groups/${id}/people`).then((r) => {
        if (!r.ok) throw new Error(`Could not load people (${r.status})`);
        return r.json();
      }),
    ])
      .then(([groupData, peopleData]) => {
        setGroup(groupData);
        setNewGroupName(groupData.name ?? '');
        setPeople(Array.isArray(peopleData) ? peopleData : []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load group');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const renameGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const res = await fetch(`/api/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGroupName.trim() }),
    });
    if (res.ok) {
      setGroup((g) => (g ? { ...g, name: newGroupName.trim() } : g));
      setEditingName(false);
    }
  };

  const deleteGroup = async () => {
    if (!confirm(`Delete "${group?.name}" and all its people? This cannot be undone.`)) return;
    await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    router.push('/dashboard');
  };

  const deletePerson = async (personId: number, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    await fetch(`/api/people/${personId}`, { method: 'DELETE' });
    setPeople((prev) => prev.filter((p) => p.id !== personId));
    setGroup((g) => (g ? { ...g, _count: { people: g._count.people - 1 } } : g));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading…</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error ?? 'Group not found'}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const count = people.length;
  const canQuiz = count >= 2;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-indigo-600 p-2 -ml-2">
            ‹
          </button>
          {editingName ? (
            <form onSubmit={renameGroup} className="flex-1 flex gap-2">
              <input
                className="input py-2 flex-1"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary text-sm px-3 py-2">
                Save
              </button>
              <button type="button" onClick={() => setEditingName(false)} className="btn-secondary text-sm px-3 py-2">
                Cancel
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">{group.name}</h1>
                <p className="text-xs text-gray-400">{count} {count === 1 ? 'person' : 'people'}</p>
              </div>
              <button onClick={() => setEditingName(true)} className="text-sm text-gray-400 px-2 py-1">
                Rename
              </button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-24">
        {/* Activity Buttons */}
        {count > 0 && (
          <>
            <Link
              href={`/groups/${id}/lookup`}
              className="flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition rounded-2xl px-5 py-4 mb-3 shadow-sm"
            >
              <div>
                <p className="text-white font-bold text-base leading-tight">Quick Find</p>
                <p className="text-indigo-200 text-xs mt-0.5">Tap a face → see name &amp; company</p>
              </div>
              <div className="text-3xl">🔍</div>
            </Link>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Link
                href={`/groups/${id}/learn`}
                className="card text-center py-4 hover:shadow-md transition active:scale-95"
              >
                <div className="text-2xl mb-1">🃏</div>
                <div className="text-xs font-semibold text-indigo-600">Flashcards</div>
              </Link>
              <Link
                href={canQuiz ? `/groups/${id}/quiz` : '#'}
                onClick={!canQuiz ? (e) => { e.preventDefault(); alert('Need at least 2 people for quiz'); } : undefined}
                className={`card text-center py-4 transition active:scale-95 ${canQuiz ? 'hover:shadow-md' : 'opacity-50'}`}
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-semibold text-purple-600">Quiz</div>
              </Link>
              <Link
                href={`/groups/${id}/test`}
                className="card text-center py-4 hover:shadow-md transition active:scale-95"
              >
                <div className="text-2xl mb-1">✏️</div>
                <div className="text-xs font-semibold text-green-600">Test</div>
              </Link>
            </div>
          </>
        )}

        {/* Add Person Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">People</h2>
          <div className="flex gap-2">
            <Link href={`/groups/${id}/people/bulk`} className="btn-secondary text-sm px-3 py-2">
              Bulk Upload
            </Link>
            <Link href={`/groups/${id}/people/new`} className="btn-primary text-sm px-4 py-2">
              + Add Person
            </Link>
          </div>
        </div>

        {/* People List */}
        {people.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🤷</div>
            <p className="text-gray-400 mb-4">No people yet</p>
            <div className="flex flex-col gap-3 items-center">
              <Link href={`/groups/${id}/people/new`} className="btn-primary">
                Add first person
              </Link>
              <Link href={`/groups/${id}/people/bulk`} className="btn-secondary">
                Bulk upload photos
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {people.map((person) => {
              const name = displayName(person);
              return (
                <div key={person.id} className="card flex items-center gap-3 py-3">
                  <PhotoAvatar thumbPath={person.thumbPath} name={person.firstName} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    {person.company && <p className="text-sm text-indigo-500 truncate">{person.company}</p>}
                    {person.notes && <p className="text-sm text-gray-400 truncate">{person.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/groups/${id}/people/${person.id}/edit`} className="text-sm text-indigo-500 py-1 px-2">
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePerson(person.id, name)}
                      className="text-sm text-red-400 py-1 px-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <button onClick={deleteGroup} className="btn-danger w-full">
            Delete this group
          </button>
        </div>
      </main>
    </div>
  );
}
