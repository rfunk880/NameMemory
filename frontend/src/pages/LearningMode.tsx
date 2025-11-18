import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Person } from '../types';
import { peopleApi } from '../services/api';
import { getRandomizedPeople, getDisplayName } from '../utils/randomizer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

export default function LearningMode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeople();
  }, [id]);

  const loadPeople = async () => {
    try {
      const data = await peopleApi.getByGroup(Number(id));
      if (data.length === 0) {
        alert('No people in this group yet');
        navigate(`/groups/${id}`);
        return;
      }
      setPeople(getRandomizedPeople(data));
    } catch (error) {
      console.error('Failed to load people:', error);
      alert('Failed to load people');
      navigate(`/groups/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < people.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    } else {
      // Reached end, reshuffle and start over
      setPeople(getRandomizedPeople(people));
      setCurrentIndex(0);
      setIsRevealed(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsRevealed(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (people.length === 0) {
    return null;
  }

  const currentPerson = people[currentIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-gray-800">
        <button onClick={() => navigate(`/groups/${id}`)} className="text-indigo-400 hover:text-indigo-300">
          ← Exit
        </button>
        <div className="text-sm">
          {currentIndex + 1} / {people.length}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Photo */}
        <div className="mb-8">
          <img
            src={
              currentPerson.photo_url
                ? `${API_URL}/../${currentPerson.photo_url}`
                : 'https://via.placeholder.com/400?text=No+Photo'
            }
            alt="Person"
            className="max-w-full max-h-[50vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
          />
        </div>

        {/* Name (Concealed/Revealed) */}
        <div className="mb-8 min-h-[120px] flex items-center">
          {isRevealed ? (
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{getDisplayName(currentPerson)}</div>
              {currentPerson.description && (
                <div className="text-xl text-gray-400">{currentPerson.description}</div>
              )}
              {currentPerson.notes && (
                <div className="text-sm text-gray-500 mt-2 max-w-md">{currentPerson.notes}</div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsRevealed(true)}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xl font-semibold transition-colors"
            >
              Reveal Name
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            {currentIndex < people.length - 1 ? 'Next →' : 'Reshuffle & Restart'}
          </button>
        </div>
      </div>
    </div>
  );
}
