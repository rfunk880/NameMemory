'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Row {
  key: string;
  firstName: string;
  lastName: string;
  nickname: string;
  company: string;
  notes: string;
  photo: File | null;
  preview: string | null;
}

let counter = 0;
function newRow(): Row {
  return {
    key: String(++counter),
    firstName: '',
    lastName: '',
    nickname: '',
    company: '',
    notes: '',
    photo: null,
    preview: null,
  };
}

export default function BulkAddPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => [newRow(), newRow(), newRow()]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = (key: string, field: keyof Row, value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const setPhoto = (key: string, file: File) => {
    const preview = URL.createObjectURL(file);
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, photo: file, preview } : r)));
  };

  const clearPhoto = (key: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, photo: null, preview: null } : r)));
  };

  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const addRow = () => setRows((prev) => [...prev, newRow()]);

  const validRows = rows.filter((r) => r.firstName.trim());
  const emptyFirstName = (r: Row) => submitted && !r.firstName.trim();

  const handleSubmit = async () => {
    setSubmitted(true);
    if (validRows.length === 0) return;
    setSaving(true);
    setError('');

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setProgress(`Adding ${i + 1} of ${validRows.length}…`);

      const fd = new FormData();
      fd.append('firstName', row.firstName.trim());
      if (row.lastName.trim()) fd.append('lastName', row.lastName.trim());
      if (row.nickname.trim()) fd.append('nickname', row.nickname.trim());
      if (row.company.trim()) fd.append('company', row.company.trim());
      if (row.notes.trim()) fd.append('notes', row.notes.trim());
      if (row.photo) fd.append('photo', row.photo);

      const res = await fetch(`/api/groups/${id}/people`, { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(`Failed on "${row.firstName}": ${data.error ?? 'Unknown error'}`);
        setSaving(false);
        setProgress('');
        return;
      }
    }

    router.push(`/groups/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-indigo-600 p-2 -ml-2 text-2xl leading-none">
            ‹
          </button>
          <h1 className="text-lg font-bold">Bulk Add People</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 pb-32">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-200 bg-white">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">
                  Photo
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  First Name <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Last Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nickname
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Notes
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.key}
                  className={`border-b border-gray-100 last:border-0 ${
                    idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                  }`}
                >
                  {/* Photo */}
                  <td className="px-3 py-2">
                    <input
                      ref={(el) => { fileInputs.current[row.key] = el; }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && setPhoto(row.key, e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputs.current[row.key]?.click()}
                      className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center shrink-0 relative"
                      title="Add photo"
                    >
                      {row.preview ? (
                        <>
                          <img src={row.preview} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); clearPhoto(row.key); }}
                            className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl text-[10px] leading-none flex items-center justify-center"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <span className="text-lg text-gray-400">📷</span>
                      )}
                    </button>
                  </td>

                  {/* First Name */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.firstName}
                      onChange={(e) => update(row.key, 'firstName', e.target.value)}
                      placeholder="First name"
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                        emptyFirstName(row)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    />
                    {emptyFirstName(row) && (
                      <p className="text-[10px] text-red-400 mt-0.5">Required</p>
                    )}
                  </td>

                  {/* Last Name */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.lastName}
                      onChange={(e) => update(row.key, 'lastName', e.target.value)}
                      placeholder="Last name"
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </td>

                  {/* Nickname */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.nickname}
                      onChange={(e) => update(row.key, 'nickname', e.target.value)}
                      placeholder="Nickname"
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </td>

                  {/* Company */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.company}
                      onChange={(e) => update(row.key, 'company', e.target.value)}
                      placeholder="Company"
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </td>

                  {/* Notes */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => update(row.key, 'notes', e.target.value)}
                      placeholder="Notes"
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </td>

                  {/* Remove */}
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      disabled={rows.length === 1}
                      className="text-gray-300 hover:text-red-400 transition text-lg leading-none disabled:opacity-30"
                      title="Remove row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row */}
        <button
          type="button"
          onClick={addRow}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium px-1"
        >
          + Add row
        </button>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <p className="text-sm text-gray-400 flex-1">
            {validRows.length > 0
              ? `${validRows.length} ${validRows.length === 1 ? 'person' : 'people'} to add`
              : 'Fill in at least one first name to continue'}
          </p>
          {progress && (
            <span className="text-sm text-indigo-500 font-medium">{progress}</span>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || validRows.length === 0}
            className="btn-primary px-6 py-3 text-base disabled:opacity-50"
          >
            {saving ? 'Adding…' : `Add ${validRows.length > 0 ? validRows.length + ' ' : ''}${validRows.length === 1 ? 'Person' : 'People'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
