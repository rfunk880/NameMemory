'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Person {
  id: number;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  notes: string | null;
  photoPath: string | null;
  thumbPath: string | null;
}

export default function EditPersonPage() {
  const { id: groupId, personId } = useParams<{ id: string; personId: string }>();
  const router = useRouter();

  const [person, setPerson] = useState<Person | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/people/${personId}`)
      .then((r) => r.json())
      .then((data: Person) => {
        setPerson(data);
        setFirstName(data.firstName);
        setLastName(data.lastName ?? '');
        setNickname(data.nickname ?? '');
        setNotes(data.notes ?? '');
      });
  }, [personId]);

  const handlePhoto = (file: File) => {
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    setSaving(true);
    setError('');

    const fd = new FormData();
    fd.append('firstName', firstName.trim());
    if (lastName.trim()) fd.append('lastName', lastName.trim());
    if (nickname.trim()) fd.append('nickname', nickname.trim());
    if (notes.trim()) fd.append('notes', notes.trim());
    if (photo) fd.append('photo', photo);
    if (removePhoto) fd.append('removePhoto', 'true');

    try {
      const res = await fetch(`/api/people/${personId}`, { method: 'PUT', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/groups/${groupId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  const currentPhotoUrl = person.photoPath ? `/api/uploads/${person.photoPath}` : null;
  const showPhoto = removePhoto ? null : preview ?? currentPhotoUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-indigo-600 p-2 -ml-2 text-2xl leading-none">
            ‹
          </button>
          <h1 className="text-lg font-bold">Edit Person</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div className="card text-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
            />
            {showPhoto ? (
              <div>
                <img
                  src={showPhoto}
                  alt="Preview"
                  className="w-40 h-40 rounded-2xl object-cover mx-auto mb-3"
                />
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="btn-secondary text-sm"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRemovePhoto(true);
                      setPhoto(null);
                      setPreview(null);
                    }}
                    className="btn-ghost text-sm text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-indigo-300 transition"
              >
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm font-medium">Tap to add photo</div>
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                className="input"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
              <input
                className="input"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nickname / goes by</label>
              <input
                className="input"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={saving || !firstName.trim()} className="btn-primary w-full py-4 text-base">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}
