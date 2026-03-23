import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

const CAR_MAKES = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Bentley', 'Bugatti',
  'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat',
  'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep',
  'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati',
  'Mazda', 'McLaren', 'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Porsche',
  'RAM', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

const CAR_EMOJIS = ['🚗', '🚙', '🏎️', '🚕', '🚓', '🛻'];

function CarCard({ car, onDelete }) {
  const { addToast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const emoji = CAR_EMOJIS[car.id % CAR_EMOJIS.length];

  const handleDelete = async () => {
    if (!confirm(`Delete ${car.year} ${car.make} ${car.model}?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/cars/${car.id}`);
      onDelete(car.id);
    } catch {
      addToast('Failed to delete car. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group bg-gray-900 border border-white/5 hover:border-red-500/20 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="text-3xl mb-2">{emoji}</div>
          <div className="text-xl font-bold text-white">{car.year} {car.make}</div>
          <div className="text-lg font-semibold text-gray-300">{car.model}</div>
          {car.trim && <div className="text-gray-500 text-sm mt-0.5">{car.trim}</div>}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/5 hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-all duration-200"
          title="Delete car"
        >
          🗑️
        </button>
      </div>

      {car.engine && (
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2">
          <span>⚙️</span>
          <span>{car.engine}</span>
        </div>
      )}

      {car.notes && (
        <p className="text-sm text-gray-500 italic border-t border-white/5 pt-3">{car.notes}</p>
      )}

      <div className="flex gap-2 mt-auto pt-3 border-t border-white/5">
        <Link
          to={`/parts?car=${car.id}`}
          className="flex-1 text-center bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-2.5 px-3 rounded-xl transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-red-600/30"
        >
          🔩 Find Parts
        </Link>
        <Link
          to={`/builds?make=${encodeURIComponent(car.make)}`}
          className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm font-medium py-2.5 px-3 rounded-xl transition-all duration-200"
        >
          🛠️ Build Ideas
        </Link>
      </div>
    </div>
  );
}

function AddCarModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ year: currentYear, make: '', model: '', trim: '', engine: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.make || !form.model) return setError('Make and model are required.');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/cars', form);
      onAdded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add car.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-gray-800/80 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all duration-200 text-sm';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-lg p-6 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Add a Car</h2>
            <p className="text-gray-500 text-sm">Fill in your car details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Year *</label>
              <select
                value={form.year}
                onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                className={inputClass}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Make *</label>
              <select
                value={form.make}
                onChange={e => setForm({ ...form, make: e.target.value })}
                required
                className={inputClass}
              >
                <option value="">Select make</option>
                {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Model *</label>
              <input
                type="text"
                required
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                className={inputClass}
                placeholder="e.g. Civic, Mustang"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Trim</label>
              <input
                type="text"
                value={form.trim}
                onChange={e => setForm({ ...form, trim: e.target.value })}
                className={inputClass}
                placeholder="e.g. Sport, GT, SE"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Engine</label>
            <input
              type="text"
              value={form.engine}
              onChange={e => setForm({ ...form, engine: e.target.value })}
              className={inputClass}
              placeholder="e.g. 2.0L Turbocharged 4-Cylinder"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className={inputClass + ' resize-none'}
              placeholder="Any mods, condition notes…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white py-3 rounded-xl font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white py-3 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-red-600/25"
            >
              {loading ? 'Adding…' : '🚗 Add Car'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Garage() {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/cars').then(res => setCars(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAdded = (car) => setCars(prev => [car, ...prev]);
  const handleDelete = (id) => setCars(prev => prev.filter(c => c.id !== id));

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">
              My Garage
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="text-gray-300 font-medium">{user?.username}</span>
              {cars.length > 0 && <span className="text-gray-600"> · {cars.length} car{cars.length !== 1 ? 's' : ''}</span>}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 flex items-center gap-2"
          >
            <span>+</span> Add Car
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="text-4xl mb-3 animate-pulse">🚗</div>
              <p className="text-gray-500">Loading your garage…</p>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="w-24 h-24 bg-gray-900 border border-white/5 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6">
              🏚️
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your garage is empty</h2>
            <p className="text-gray-500 mb-8">Add your first car to get personalized part recommendations and build ideas.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/25"
            >
              🚗 Add Your First Car
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cars.map(car => (
              <CarCard key={car.id} car={car} onDelete={handleDelete} />
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-white/10 hover:border-red-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-600 hover:text-red-400 transition-all duration-300 min-h-48 group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200">+</span>
              <span className="font-medium text-sm">Add Another Car</span>
            </button>
          </div>
        )}
      </div>

      {showModal && <AddCarModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
}
