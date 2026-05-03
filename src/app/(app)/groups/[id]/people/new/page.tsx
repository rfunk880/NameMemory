'use client';

import { useState, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AddPersonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (file: File) => {
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
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

    try {
      const res = await fetch(`/api/groups/${id}/people`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/groups/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-indigo-600 p-2 -ml-2 text-2xl leading-none">
            ‹
          </button>
          <h1 className="text-lg font-bold">Add Person</h1>
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
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-40 rounded-2xl object-cover mx-auto mb-3"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  Change photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition"
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
                autoComplete="off"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
              <input
                className="input"
                type="text"
                autoComplete="off"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nickname / goes by</label>
              <input
                className="input"
                type="text"
                autoComplete="off"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes to help you remember them…"
              />
            </div>
          </div>

          <button type="submit" disabled={saving || !firstName.trim()} className="btn-primary w-full py-4 text-base">
            {saving ? 'Saving…' : 'Save Person'}
          </button>
        </form>
      </main>
    </div>
  );
}
