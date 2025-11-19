import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Group, Person } from '../types';
import { groupsApi, peopleApi } from '../services/api';
import { getDisplayName } from '../utils/randomizer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [groupData, peopleData] = await Promise.all([
        groupsApi.getById(Number(id)),
        peopleApi.getByGroup(Number(id)),
      ]);
      setGroup(groupData);
      setPeople(peopleData);
    } catch (error) {
      console.error('Failed to load group:', error);
      alert('Failed to load group');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (personId: number) => {
    if (!confirm('Are you sure you want to delete this person?')) return;

    try {
      await peopleApi.delete(personId);
      loadData();
    } catch (error) {
      alert('Failed to delete person');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this entire group?')) return;

    try {
      await groupsApi.delete(Number(id));
      navigate('/');
    } catch (error) {
      alert('Failed to delete group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const canEdit = group.permission === 'edit';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate('/')} className="text-indigo-600 mb-2">
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <p className="text-gray-600">{people.length} people</p>
            </div>
            <div className="flex gap-2">
              {group.is_owner && (
                <Link to={`/groups/${id}/shares`} className="btn-secondary">
                  Share
                </Link>
              )}
              {group.is_owner && (
                <button onClick={handleDeleteGroup} className="btn-danger">
                  Delete Group
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to={`/groups/${id}/learn`}
            className="card text-center hover:shadow-lg transition-shadow cursor-pointer bg-indigo-50 border-2 border-indigo-200"
          >
            <div className="text-4xl mb-2">🎓</div>
            <h3 className="text-xl font-bold text-indigo-600">Practice Names</h3>
            <p className="text-sm text-gray-600">Learn mode with concealed names</p>
          </Link>

          <Link
            to={`/groups/${id}/quick-ref`}
            className="card text-center hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-2 border-green-200"
          >
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-xl font-bold text-green-600">Quick Reference</h3>
            <p className="text-sm text-gray-600">Fast photo & name lookup</p>
          </Link>

          {canEdit && (
            <Link
              to={`/groups/${id}/add-person`}
              className="card text-center hover:shadow-lg transition-shadow cursor-pointer bg-blue-50 border-2 border-blue-200"
            >
              <div className="text-4xl mb-2">➕</div>
              <h3 className="text-xl font-bold text-blue-600">Add Person</h3>
              <p className="text-sm text-gray-600">Add a new person to this group</p>
            </Link>
          )}
        </div>

        {/* People List */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">People</h2>

          {people.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No people in this group yet. {canEdit && 'Add your first person to get started!'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((person) => (
                <div key={person.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        person.thumbnail_url
                          ? `${API_URL}/../${person.thumbnail_url}`
                          : 'https://via.placeholder.com/150?text=No+Photo'
                      }
                      alt={getDisplayName(person)}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{getDisplayName(person)}</h3>
                      {person.description && (
                        <p className="text-sm text-gray-600">{person.description}</p>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/people/${person.id}/edit`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(person.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
