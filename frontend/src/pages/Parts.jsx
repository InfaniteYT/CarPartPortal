import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const TYPE_LABELS = {
  all: 'All Parts',
  performance: '⚡ Performance',
  normal: '🔧 Normal / OEM',
};

function PartCard({ part, savedIds, onSaveToggle }) {
  const { user } = useAuth();
  const isSaved = savedIds.has(part.id);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return alert('Please log in to save parts.');
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/parts/save/${part.id}`);
      } else {
        await api.post('/parts/save', { partId: part.id });
      }
      onSaveToggle(part.id, !isSaved);
    } catch {
      alert('Failed to update saved parts.');
    } finally {
      setSaving(false);
    }
  };

  const typeColor = part.type === 'performance' ? 'bg-red-900/50 text-red-300 border-red-700' :
    part.type === 'normal' ? 'bg-blue-900/50 text-blue-300 border-blue-700' :
    'bg-purple-900/50 text-purple-300 border-purple-700';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mb-2 ${typeColor}`}>
            {part.type === 'performance' ? '⚡' : part.type === 'normal' ? '🔧' : '🔩'} {part.type === 'both' ? 'Performance / OEM' : part.type}
          </div>
          <h3 className="text-white font-bold text-lg leading-snug">{part.name}</h3>
          {part.brand && <div className="text-gray-400 text-sm">{part.brand}</div>}
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-lg">${part.price?.toFixed(2) || 'N/A'}</div>
        </div>
      </div>

      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{part.category}</div>

      <p className="text-gray-400 text-sm flex-1">{part.description}</p>

      {part.compatibility && (
        <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
          <span className="text-gray-600">Fits: </span>{part.compatibility}
        </div>
      )}

      {user && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isSaved
              ? 'bg-red-900/40 border border-red-700 text-red-300 hover:bg-red-900/60'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {isSaved ? '💾 Saved' : '+ Save Part'}
        </button>
      )}
    </div>
  );
}

export default function Parts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const { user } = useAuth();

  const type = searchParams.get('type') || 'all';
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== '') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 18 };
      if (type && type !== 'all') params.type = type;
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await api.get('/parts', { params });
      setParts(res.data.parts);
      setTotal(res.data.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [type, category, search, page]);

  useEffect(() => { fetchParts(); }, [fetchParts]);

  useEffect(() => {
    api.get('/parts/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/parts/saved/list').then(res => setSavedIds(new Set(res.data.map(p => p.id)))).catch(() => {});
  }, [user]);

  const onSaveToggle = (partId, isSaved) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.add(partId); else next.delete(partId);
      return next;
    });
  };

  const totalPages = Math.ceil(total / 18);

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔩 Parts Catalog</h1>
          <p className="text-gray-400">Browse performance and OEM replacement parts for your build</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-8 flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search parts..."
              value={search}
              onChange={e => setParam('search', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-2">
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setParam('type', val)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  type === val
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={e => setParam('category', e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Results count */}
        <div className="text-gray-400 text-sm mb-4">
          {loading ? 'Loading...' : `${total} part${total !== 1 ? 's' : ''} found`}
        </div>

        {/* Parts grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading parts...</div>
        ) : parts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400">No parts found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {parts.map(part => (
              <PartCard key={part.id} part={part} savedIds={savedIds} onSaveToggle={onSaveToggle} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setParam('page', p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === p ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
