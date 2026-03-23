import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const DIFF_COLORS = {
  Beginner: 'bg-green-900/40 text-green-300 border-green-700/50',
  Intermediate: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  Advanced: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  Expert: 'bg-red-900/40 text-red-300 border-red-700/50',
};

function BuildCard({ build, onLike }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(build.likes || 0);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liked || liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/builds/${build.id}/like`);
      setLikeCount(res.data.likes);
      setLiked(true);
      onLike && onLike(build.id, res.data.likes);
    } catch {
      // ignore
    } finally {
      setLiking(false);
    }
  };

  return (
    <div className="group bg-gray-900 border border-white/5 hover:border-white/10 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
      <div className="flex flex-wrap gap-2 mb-1">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
          {build.category}
        </span>
        {build.difficulty && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${DIFF_COLORS[build.difficulty] || 'bg-gray-800 text-gray-400 border-white/10'}`}>
            {build.difficulty}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-white font-bold text-lg leading-snug">{build.title}</h3>
        {(build.car_make || build.car_model) && (
          <div className="text-red-400 text-sm mt-1 font-medium">
            {[build.car_make, build.car_model, build.car_year_min && build.car_year_max && `(${build.car_year_min}–${build.car_year_max})`].filter(Boolean).join(' ')}
          </div>
        )}
      </div>

      <p className="text-gray-500 text-sm flex-1 leading-relaxed">{build.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-3 text-sm">
          {build.estimated_cost && (
            <span className="text-green-400 font-semibold">💰 {build.estimated_cost}</span>
          )}
          {build.author && <span className="text-gray-600 text-xs">by {build.author}</span>}
        </div>
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            liked
              ? 'bg-red-900/30 text-red-300 border border-red-700/40 cursor-default'
              : 'bg-white/5 border border-white/10 hover:bg-red-900/20 hover:text-red-300 hover:border-red-700/30 text-gray-500'
          }`}
        >
          ❤️ {likeCount}
        </button>
      </div>
    </div>
  );
}

function AddBuildModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Performance', difficulty: 'Intermediate',
    car_make: '', car_model: '', car_year_min: '', car_year_max: '', estimated_cost: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/builds', {
        ...form,
        car_year_min: form.car_year_min ? parseInt(form.car_year_min) : undefined,
        car_year_max: form.car_year_max ? parseInt(form.car_year_max) : undefined,
      });
      onAdded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create build idea.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-gray-800/80 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all duration-200 text-sm';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl p-6 my-4 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Share a Build Idea</h2>
            <p className="text-gray-500 text-sm">Inspire the community with your build</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {error && <div className="bg-red-950/50 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className={inputClass} placeholder="e.g. Budget Civic Track Build" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description *</label>
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4} className={inputClass + ' resize-none'}
              placeholder="Describe the build, parts used, goals…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className={inputClass}>
                {['Performance', 'Maintenance', 'Style', 'Off-Road', 'Interior', 'Custom'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                className={inputClass}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Car Make (optional)</label>
              <input type="text" value={form.car_make} onChange={e => setForm({ ...form, car_make: e.target.value })}
                className={inputClass} placeholder="e.g. Honda" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Car Model (optional)</label>
              <input type="text" value={form.car_model} onChange={e => setForm({ ...form, car_model: e.target.value })}
                className={inputClass} placeholder="e.g. Civic" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Estimated Cost</label>
            <input type="text" value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: e.target.value })}
              className={inputClass} placeholder="e.g. $2,000 - $5,000" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white py-3 rounded-xl font-medium transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white py-3 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-red-600/25">
              {loading ? 'Sharing…' : '🛠️ Share Build Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Builds() {
  const [builds, setBuilds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const category = searchParams.get('category') || 'all';
  const difficulty = searchParams.get('difficulty') || 'all';
  const search = searchParams.get('search') || '';
  const make = searchParams.get('make') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== '') next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const fetchBuilds = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (category !== 'all') params.category = category;
      if (difficulty !== 'all') params.difficulty = difficulty;
      if (search) params.search = search;
      if (make !== 'all') params.make = make;
      const res = await api.get('/builds', { params });
      setBuilds(res.data.builds ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, search, make, page]);

  useEffect(() => { fetchBuilds(); }, [fetchBuilds]);

  useEffect(() => {
    api.get('/builds/categories/list').then(res => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  const handleAdded = (build) => setBuilds(prev => [build, ...prev]);
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">🛠️ Build Ideas</h1>
            <p className="text-gray-500">Get inspired with curated builds and community ideas</p>
          </div>
          {user && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 flex items-center gap-2"
            >
              + Share Build
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-gray-900/80 rounded-2xl border border-white/5 p-4 mb-8 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search builds…"
              value={search}
              onChange={e => setParam('search', e.target.value)}
              className="w-full bg-gray-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all duration-200 text-sm"
            />
          </div>
          <select
            value={category}
            onChange={e => setParam('category', e.target.value)}
            className="bg-gray-800/80 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 focus:outline-none focus:border-red-500/60 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={difficulty}
            onChange={e => setParam('difficulty', e.target.value)}
            className="bg-gray-800/80 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 focus:outline-none focus:border-red-500/60 text-sm"
          >
            <option value="all">All Levels</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="text-gray-500 text-sm mb-5">
          {loading ? 'Loading…' : `${total} build idea${total !== 1 ? 's' : ''}`}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading build ideas…</div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500">No build ideas found. Try adjusting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {builds.map(build => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        )}

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

      {showModal && <AddBuildModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
}
