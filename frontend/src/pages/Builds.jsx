import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const DIFF_COLORS = {
  Beginner: 'bg-green-900/50 text-green-300 border-green-700',
  Intermediate: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  Advanced: 'bg-orange-900/50 text-orange-300 border-orange-700',
  Expert: 'bg-red-900/50 text-red-300 border-red-700',
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
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col gap-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
              {build.category}
            </span>
            {build.difficulty && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFF_COLORS[build.difficulty] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                {build.difficulty}
              </span>
            )}
          </div>
          <h3 className="text-white font-bold text-lg leading-snug">{build.title}</h3>
          {(build.car_make || build.car_model) && (
            <div className="text-red-400 text-sm mt-1">
              {[build.car_make, build.car_model, build.car_year_min && build.car_year_max && `${build.car_year_min}–${build.car_year_max}`].filter(Boolean).join(' ')}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm flex-1 leading-relaxed">{build.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {build.estimated_cost && (
            <span className="text-green-400 font-medium">💰 {build.estimated_cost}</span>
          )}
          {build.author && <span>by {build.author}</span>}
        </div>
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            liked
              ? 'bg-red-900/40 text-red-300 border border-red-700 cursor-default'
              : 'bg-gray-700 hover:bg-red-900/40 hover:text-red-300 text-gray-300'
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl p-6 my-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Share a Build Idea</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="e.g. Budget Civic Track Build" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              placeholder="Describe the build, parts used, goals..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500">
                {['Performance', 'Maintenance', 'Style', 'Off-Road', 'Interior', 'Custom'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500">
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Car Make (optional)</label>
              <input type="text" value={form.car_make} onChange={e => setForm({ ...form, car_make: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                placeholder="e.g. Honda" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Car Model (optional)</label>
              <input type="text" value={form.car_model} onChange={e => setForm({ ...form, car_model: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                placeholder="e.g. Civic" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Cost</label>
            <input type="text" value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="e.g. $2,000 - $5,000" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white py-3 rounded-lg font-bold">
              {loading ? 'Sharing...' : 'Share Build Idea'}
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
      setBuilds(res.data.builds);
      setTotal(res.data.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, search, make, page]);

  useEffect(() => { fetchBuilds(); }, [fetchBuilds]);

  useEffect(() => {
    api.get('/builds/categories/list').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const handleAdded = (build) => setBuilds(prev => [build, ...prev]);
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🛠️ Build Ideas</h1>
            <p className="text-gray-400">Get inspired with curated builds and community ideas</p>
          </div>
          {user && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              + Share Build
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-8 flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search builds..."
              value={search}
              onChange={e => setParam('search', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <select
            value={category}
            onChange={e => setParam('category', e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={difficulty}
            onChange={e => setParam('difficulty', e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">All Levels</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="text-gray-400 text-sm mb-4">
          {loading ? 'Loading...' : `${total} build idea${total !== 1 ? 's' : ''}`}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading build ideas...</div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400">No build ideas found. Try adjusting filters.</p>
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

      {showModal && <AddBuildModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
}
