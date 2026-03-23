import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

const TYPE_LABELS = {
  all: 'All Parts',
  performance: '⚡ Performance',
  normal: '🔧 Normal / OEM',
};

function PartCard({ part, savedIds, onSaveToggle, highlighted }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isSaved = savedIds.has(part.id);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return addToast('Please log in to save parts.', 'info');
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/parts/save/${part.id}`);
      } else {
        await api.post('/parts/save', { partId: part.id });
      }
      onSaveToggle(part.id, !isSaved);
    } catch {
      addToast('Failed to update saved parts.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const typeColor = part.type === 'performance'
    ? 'bg-red-900/40 text-red-300 border-red-700/50'
    : part.type === 'normal'
    ? 'bg-blue-900/40 text-blue-300 border-blue-700/50'
    : 'bg-purple-900/40 text-purple-300 border-purple-700/50';

  return (
    <div className={`group bg-gray-900 border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
      highlighted
        ? 'border-red-500/30 hover:border-red-500/50 hover:shadow-red-900/20'
        : 'border-white/5 hover:border-white/10 hover:shadow-black/30'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mb-2 ${typeColor}`}>
            {part.type === 'performance' ? '⚡' : part.type === 'normal' ? '🔧' : '🔩'}{' '}
            {part.type === 'both' ? 'Performance / OEM' : part.type}
          </div>
          <h3 className="text-white font-bold text-base leading-snug">{part.name}</h3>
          {part.brand && <div className="text-gray-500 text-sm mt-0.5">{part.brand}</div>}
        </div>
        <div className="text-right shrink-0">
          <div className="text-white font-bold text-lg">${part.price?.toFixed(2) ?? 'N/A'}</div>
        </div>
      </div>

      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{part.category}</div>

      <p className="text-gray-400 text-sm flex-1 leading-relaxed">{part.description}</p>

      {part.compatibility && (
        <div className="text-xs text-gray-600 border-t border-white/5 pt-2">
          <span className="text-gray-700">Fits: </span>{part.compatibility}
        </div>
      )}

      {user && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
            isSaved
              ? 'bg-red-900/30 border border-red-700/40 text-red-300 hover:bg-red-900/50'
              : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
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
  const [contextCar, setContextCar] = useState(null);
  const { user } = useAuth();

  const type = searchParams.get('type') || 'all';
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const carId = searchParams.get('car');

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

  // Fetch the context car if ?car= is set
  useEffect(() => {
    if (!carId) { setContextCar(null); return; }
    api.get(`/cars/${carId}`).then(res => setContextCar(res.data)).catch(() => setContextCar(null));
  }, [carId]);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 18 };
      if (type && type !== 'all') params.type = type;
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await api.get('/parts', { params });
      setParts(res.data.parts ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [type, category, search, page]);

  useEffect(() => { fetchParts(); }, [fetchParts]);

  useEffect(() => {
    api.get('/parts/categories').then(res => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/parts/saved/list').then(res => setSavedIds(new Set(Array.isArray(res.data) ? res.data.map(p => p.id) : []))).catch(() => {});
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
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Car context banner */}
        {contextCar && (
          <div className="bg-gradient-to-r from-red-900/20 to-transparent border border-red-500/20 rounded-2xl p-4 mb-8 flex items-center gap-4">
            <div className="text-3xl">🚗</div>
            <div className="flex-1">
              <div className="text-white font-bold">
                Parts for: {contextCar.year} {contextCar.make} {contextCar.model}
                {contextCar.trim && <span className="text-gray-400 font-normal text-sm ml-2">{contextCar.trim}</span>}
              </div>
              {contextCar.engine && (
                <div className="text-gray-400 text-sm mt-0.5">⚙️ {contextCar.engine}</div>
              )}
              <div className="text-gray-500 text-xs mt-1">
                The top results are recommended for your car. Check part compatibility before purchasing.
              </div>
            </div>
            <Link
              to="/garage"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors shrink-0"
            >
              ← Back to Garage
            </Link>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            {contextCar ? `🔩 Parts for Your ${contextCar.make}` : '🔩 Parts Catalog'}
          </h1>
          <p className="text-gray-500">
            {contextCar
              ? `Browse performance and OEM replacement parts for your ${contextCar.year} ${contextCar.make} ${contextCar.model}`
              : 'Browse performance and OEM replacement parts for your build'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/80 rounded-2xl border border-white/5 p-4 mb-8 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search parts…"
              value={search}
              onChange={e => setParam('search', e.target.value)}
              className="w-full bg-gray-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all duration-200 text-sm"
            />
          </div>

          <div className="flex gap-2">
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setParam('type', val)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  type === val
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'bg-gray-800/80 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={category}
            onChange={e => setParam('category', e.target.value)}
            className="bg-gray-800/80 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 focus:outline-none focus:border-red-500/60 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Results count */}
        <div className="text-gray-500 text-sm mb-5">
          {loading ? 'Loading…' : `${total} part${total !== 1 ? 's' : ''} found`}
        </div>

        {/* Recommended section (when car is selected) */}
        {contextCar && !loading && parts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-white">⭐ Recommended for Your Car</h2>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {parts.slice(0, 6).map(part => (
                <PartCard key={part.id} part={part} savedIds={savedIds} onSaveToggle={onSaveToggle} highlighted />
              ))}
            </div>
            {parts.length > 6 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-white">🔩 Full Catalog</h2>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {parts.slice(6).map(part => (
                    <PartCard key={part.id} part={part} savedIds={savedIds} onSaveToggle={onSaveToggle} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Default parts grid (no car selected) */}
        {!contextCar && (
          <>
            {loading ? (
              <div className="text-center text-gray-500 py-20">Loading parts…</div>
            ) : parts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">No parts found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {parts.map(part => (
                  <PartCard key={part.id} part={part} savedIds={savedIds} onSaveToggle={onSaveToggle} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Loading state for car context */}
        {contextCar && loading && (
          <div className="text-center text-gray-500 py-20">Loading parts…</div>
        )}

        {/* No results for car context */}
        {contextCar && !loading && parts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500">No parts found. Try adjusting your filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setParam('page', p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  page === p
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'bg-gray-800/80 border border-white/10 text-gray-400 hover:text-white'
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
