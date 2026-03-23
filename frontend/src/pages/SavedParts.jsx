import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function SavedParts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parts/saved/list').then(res => setParts(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (partId) => {
    try {
      await api.delete(`/parts/save/${partId}`);
      setParts(prev => prev.filter(p => p.id !== partId));
    } catch {
      alert('Failed to remove part.');
    }
  };

  const typeColor = (type) =>
    type === 'performance' ? 'bg-red-900/40 text-red-300'
    : type === 'normal' ? 'bg-blue-900/40 text-blue-300'
    : 'bg-purple-900/40 text-purple-300';

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">💾 Saved Parts</h1>
          <p className="text-gray-500">Parts you&apos;ve saved for your builds</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading saved parts…</div>
        ) : parts.length === 0 ? (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="w-24 h-24 bg-gray-900 border border-white/5 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6">
              📦
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No saved parts yet</h2>
            <p className="text-gray-500 mb-8">Browse the catalog and save parts for your builds.</p>
            <Link
              to="/parts"
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/25 inline-block"
            >
              Browse Parts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {parts.map(part => (
              <div key={part.id} className="group bg-gray-900 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-black/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${typeColor(part.type)}`}>
                      {part.type === 'performance' ? '⚡' : '🔧'} {part.type === 'both' ? 'Perf/OEM' : part.type}
                    </div>
                    <h3 className="text-white font-bold text-base">{part.name}</h3>
                    {part.brand && <div className="text-gray-500 text-sm mt-0.5">{part.brand}</div>}
                  </div>
                  <div className="text-white font-bold text-lg shrink-0">${part.price?.toFixed(2) ?? 'N/A'}</div>
                </div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{part.category}</div>
                <p className="text-gray-400 text-sm flex-1 leading-relaxed">{part.description}</p>
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <Link
                    to="/parts"
                    className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white text-sm py-2.5 px-3 rounded-xl transition-all duration-200"
                  >
                    View Catalog
                  </Link>
                  <button
                    onClick={() => handleUnsave(part.id)}
                    className="bg-white/5 hover:bg-red-900/30 border border-white/5 hover:border-red-700/30 text-gray-500 hover:text-red-400 text-sm py-2.5 px-3 rounded-xl transition-all duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
