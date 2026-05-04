'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface PhotoEntry {
  id: string;
  file: File;
  preview: string;
  firstName: string;
  lastName: string;
  company: string;
}

export default function BulkAddPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newEntries: PhotoEntry[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      firstName: '',
      lastName: '',
      company: '',
    }));
    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const removeEntry = (entryId: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === entryId);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((e) => e.id !== entryId);
    });
  };

  const updateEntry = (entryId: string, field: 'firstName' | 'lastName' | 'company', value: string) => {
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, [field]: value } : e)));
  };

  const validEntries = entries.filter((e) => e.firstName.trim());

  const handleSave = async () => {
    if (validEntries.length === 0) return;
    setSaving(true);
    setError('');
    setProgress({ done: 0, total: validEntries.length });

    const fd = new FormData();
    validEntries.forEach((entry, i) => {
      fd.append(`firstName_${i}`, entry.firstName.trim());
      if (entry.lastName.trim()) fd.append(`lastName_${i}`, entry.lastName.trim());
      if (entry.company.trim()) fd.append(`company_${i}`, entry.company.trim());
      fd.append(`photo_${i}`, entry.file);
    });

    try {
      const res = await fetch(`/api/groups/${id}/people/bulk`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setProgress({ done: data.created.length, total: validEntries.length });

      if (data.failed > 0) {
        setError(`Saved ${data.created.length} people. ${data.failed} failed — check your photos and try again.`);
        setSaving(false);
      } else {
        router.push(`/groups/${id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
      setProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-indigo-600 p-2 -ml-2 text-2xl leading-none">
            ‹
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold">Bulk Add People</h1>
            {entries.length > 0 && (
              <p className="text-xs text-gray-400">{entries.length} photo{entries.length !== 1 ? 's' : ''} selected</p>
            )}
          </div>
          {entries.length > 0 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-secondary text-sm px-3 py-2"
            >
              + Add More
            </button>
          )}
        </div>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      <main className="max-w-2xl mx-auto px-4 py-5 pb-32">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {entries.length === 0 ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-indigo-300 transition cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <div className="text-5xl mb-3">📷</div>
            <p className="text-lg font-semibold text-gray-700 mb-1">Select multiple photos</p>
            <p className="text-sm text-gray-400 mb-4">Tap to browse, or drag and drop photos here</p>
            <button type="button" className="btn-primary">
              Choose Photos
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="relative">
                    <img
                      src={entry.preview}
                      alt="Preview"
                      className="w-full aspect-square object-cover"
                    />
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center hover:bg-black/70 transition"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <input
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      type="text"
                      placeholder="First name *"
                      value={entry.firstName}
                      onChange={(e) => updateEntry(entry.id, 'firstName', e.target.value)}
                      autoComplete="off"
                    />
                    <input
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      type="text"
                      placeholder="Last name"
                      value={entry.lastName}
                      onChange={(e) => updateEntry(entry.id, 'lastName', e.target.value)}
                      autoComplete="off"
                    />
                    <input
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      type="text"
                      placeholder="Company"
                      value={entry.company}
                      onChange={(e) => updateEntry(entry.id, 'company', e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {entries.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-bottom">
          <div className="max-w-2xl mx-auto space-y-2">
            {validEntries.length < entries.length && (
              <p className="text-xs text-amber-600 text-center">
                {entries.length - validEntries.length} photo{entries.length - validEntries.length !== 1 ? 's' : ''} missing a first name — they will be skipped
              </p>
            )}
            {saving && progress && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving || validEntries.length === 0}
              className="btn-primary w-full py-4 text-base"
            >
              {saving
                ? `Saving${progress ? ` ${progress.done}/${progress.total}` : ''}…`
                : `Save ${validEntries.length} ${validEntries.length === 1 ? 'Person' : 'People'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
