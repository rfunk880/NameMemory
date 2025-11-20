import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Group } from '../types';
import { groupsApi } from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [ownedGroups, setOwnedGroups] = useState<Group[]>([]);
  const [sharedGroups, setSharedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await groupsApi.getAll();
      setOwnedGroups(data.owned);
      setSharedGroups(data.shared);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      await groupsApi.create(newGroupName);
      setNewGroupName('');
      setShowCreateModal(false);
      loadGroups();
    } catch (error: any) {
      console.error('Group creation error:', error);
      const errorMessage = error.message || 'Failed to create group';
      alert(`Failed to create group: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">NameMemory</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.name}</span>
            <button onClick={logout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* My Groups */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Groups</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + Create Group
            </button>
          </div>

          {ownedGroups.length === 0 ? (
            <div className="card text-center text-gray-500">
              <p>No groups yet. Create your first group to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </section>

        {/* Shared With Me */}
        {sharedGroups.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Shared With Me</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                className="input-field mb-4"
                placeholder="Group name (e.g., Team Meeting 2024)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupCard({ group }: { group: Group }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      className="card cursor-pointer hover:shadow-lg transition-shadow"
    >
      <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
      <div className="text-gray-600 text-sm space-y-1">
        <p>{group.person_count || 0} people</p>
        {group.owner_name && (
          <p className="text-xs text-gray-500">Shared by {group.owner_name}</p>
        )}
        {group.permission && (
          <span className="inline-block px-2 py-1 bg-gray-200 text-xs rounded">
            {group.permission}
          </span>
        )}
      </div>
    </div>
  );
}
