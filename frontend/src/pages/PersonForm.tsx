import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Person, PersonFormData } from '../types';
import { peopleApi } from '../services/api';

export default function PersonForm() {
  const { groupId, personId } = useParams<{ groupId: string; personId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<PersonFormData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    nickname: '',
    description: '',
    notes: '',
    photo: null,
  });

  const isEdit = !!personId;

  useEffect(() => {
    if (personId) {
      loadPerson();
    }
  }, [personId]);

  const loadPerson = async () => {
    try {
      const person = await peopleApi.getById(Number(personId));
      setFormData({
        first_name: person.first_name,
        middle_name: person.middle_name || '',
        last_name: person.last_name || '',
        suffix: person.suffix || '',
        nickname: person.nickname || '',
        description: person.description || '',
        notes: person.notes || '',
        photo: null,
      });
      if (person.photo_url) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';
        setPhotoPreview(`${API_URL}/../${person.photo_url}`);
      }
    } catch (error) {
      alert('Failed to load person');
      navigate(`/groups/${groupId}`);
    }
  };

  const handleInputChange = (field: keyof PersonFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await peopleApi.update(Number(personId), formData);
      } else {
        await peopleApi.create(Number(groupId), formData);
      }
      navigate(`/groups/${groupId || formData.first_name}`);
    } catch (error) {
      alert(`Failed to ${isEdit ? 'update' : 'create'} person`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-6">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="text-indigo-600 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Person' : 'Add Person'}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-8">
        <form onSubmit={handleSubmit} className="card">
          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.middle_name}
                onChange={(e) => handleInputChange('middle_name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suffix
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Jr., Sr., III"
                value={formData.suffix}
                onChange={(e) => handleInputChange('suffix', e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nickname
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Title, role, or brief description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Additional notes about this person"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/groups/${groupId}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Person'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
