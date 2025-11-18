import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GroupShare } from '../types';
import { sharingApi } from '../services/api';

export default function SharesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shares, setShares] = useState<GroupShare[]>([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadShares();
  }, [id]);

  const loadShares = async () => {
    try {
      const data = await sharingApi.getShares(Number(id));
      setShares(data);
    } catch (error) {
      console.error('Failed to load shares:', error);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sharingApi.share(Number(id), email, permission);
      setEmail('');
      setPermission('view');
      loadShares();
      alert('Group shared successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to share group');
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async (userId: number) => {
    if (!confirm('Remove this user\'s access?')) return;

    try {
      await sharingApi.unshare(Number(id), userId);
      loadShares();
    } catch (error) {
      alert('Failed to remove access');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-6">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button onClick={() => navigate(`/groups/${id}`)} className="text-indigo-600 mb-2">
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Share Group</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-8 space-y-6">
        {/* Share Form */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Share with someone</h2>
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permission
              </label>
              <select
                className="input-field"
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
              >
                <option value="view">View Only</option>
                <option value="edit">Can Edit</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Sharing...' : 'Share Group'}
            </button>
          </form>
        </div>

        {/* Current Shares */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Shared With</h2>

          {shares.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Not shared with anyone yet</p>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{share.name}</div>
                    <div className="text-sm text-gray-600">{share.email}</div>
                    <div className="text-xs text-gray-500">
                      {share.permission === 'edit' ? 'Can edit' : 'View only'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnshare(share.shared_with_user_id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
