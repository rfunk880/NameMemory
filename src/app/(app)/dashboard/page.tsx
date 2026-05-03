'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Group {
  id: number;
  name: string;
  _count: { people: number };
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/groups').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([groupsData, meData]) => {
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setUserName(meData.user?.name ?? '');
      setLoading(false);
    });
  }, []);

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      const group = await res.json();
      setGroups((prev) => [group, ...prev]);
      setNewName('');
      setShowCreate(false);
    }
    setCreating(false);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-600">NameMemory</h1>
            {userName && <p className="text-xs text-gray-400">Hi, {userName}</p>}
          </div>
          <button onClick={logout} className="btn-ghost text-sm px-3 py-2">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">My Groups</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary px-4 py-2 text-sm">
            + New Group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-500 mb-2">No groups yet</p>
            <p className="text-sm text-gray-400">Create a group to start adding people</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-5">
              Create your first group
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="card flex items-center gap-4 hover:shadow-md transition-shadow active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                  👥
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{group.name}</p>
                  <p className="text-sm text-gray-400">
                    {group._count.people} {group._count.people === 1 ? 'person' : 'people'}
                  </p>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">New Group</h3>
            <form onSubmit={createGroup} className="space-y-4">
              <input
                className="input"
                type="text"
                placeholder="e.g. Church group, Work team…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setNewName('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating || !newName.trim()} className="btn-primary flex-1">
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
