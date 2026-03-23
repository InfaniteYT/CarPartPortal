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

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💾 Saved Parts</h1>
          <p className="text-gray-400">Parts you&apos;ve saved for your builds</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading saved parts...</div>
        ) : parts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-400 text-lg mb-6">You haven&apos;t saved any parts yet.</p>
            <Link to="/parts" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-colors inline-block">
              Browse Parts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {parts.map(part => (
              <div key={part.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
                      part.type === 'performance' ? 'bg-red-900/50 text-red-300' :
                      part.type === 'normal' ? 'bg-blue-900/50 text-blue-300' :
                      'bg-purple-900/50 text-purple-300'
                    }`}>
                      {part.type === 'performance' ? '⚡' : '🔧'} {part.type === 'both' ? 'Perf/OEM' : part.type}
                    </div>
                    <h3 className="text-white font-bold text-lg">{part.name}</h3>
                    {part.brand && <div className="text-gray-400 text-sm">{part.brand}</div>}
                  </div>
                  <div className="text-white font-bold">${part.price?.toFixed(2) || 'N/A'}</div>
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{part.category}</div>
                <p className="text-gray-400 text-sm flex-1">{part.description}</p>
                <div className="flex gap-2 pt-2 border-t border-gray-700">
                  <Link to="/parts" className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg transition-colors">
                    View in Catalog
                  </Link>
                  <button
                    onClick={() => handleUnsave(part.id)}
                    className="bg-gray-700 hover:bg-red-900/50 text-gray-400 hover:text-red-300 text-sm py-2 px-3 rounded-lg transition-colors"
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
