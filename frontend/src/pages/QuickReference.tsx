import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Person } from '../types';
import { peopleApi } from '../services/api';
import { getDisplayName } from '../utils/randomizer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

export default function QuickReference() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeople();
  }, [id]);

  const loadPeople = async () => {
    try {
      const data = await peopleApi.getByGroup(Number(id));
      setPeople(data);
    } catch (error) {
      console.error('Failed to load people:', error);
      alert('Failed to load people');
      navigate(`/groups/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = people.filter((person) => {
    const name = getDisplayName(person).toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || person.description?.toLowerCase().includes(search);
  });

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
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => navigate(`/groups/${id}`)} className="text-indigo-600 mb-2">
            ← Back
          </button>
          <h1 className="text-2xl font-bold mb-4">Quick Reference</h1>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* People List */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredPeople.length === 0 ? (
          <div className="card text-center text-gray-500">
            {people.length === 0 ? 'No people in this group yet' : 'No results found'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <img
                  src={
                    person.thumbnail_url
                      ? `${API_URL}/../${person.thumbnail_url}`
                      : 'https://via.placeholder.com/80?text=No+Photo'
                  }
                  alt={getDisplayName(person)}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{getDisplayName(person)}</h3>
                  {person.description && (
                    <p className="text-gray-600 text-sm">{person.description}</p>
                  )}
                  {person.notes && (
                    <p className="text-gray-500 text-xs mt-1">{person.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-gray-500 text-sm">
          Showing {filteredPeople.length} of {people.length} people
        </div>
      </main>
    </div>
  );
}
