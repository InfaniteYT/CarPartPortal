import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

function CarCard({ car, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete ${car.year} ${car.make} ${car.model}?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/cars/${car.id}`);
      onDelete(car.id);
    } catch {
      alert('Failed to delete car.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-2xl font-bold text-white">{car.year} {car.make} {car.model}</div>
          {car.trim && <div className="text-gray-400 text-sm mt-0.5">{car.trim}</div>}
        </div>
        <div className="text-3xl">🚗</div>
      </div>
      {car.engine && (
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>⚙️</span> <span>{car.engine}</span>
        </div>
      )}
      {car.notes && (
        <div className="text-sm text-gray-400 italic border-t border-gray-700 pt-3">{car.notes}</div>
      )}
      <div className="flex gap-2 mt-auto pt-3 border-t border-gray-700">
        <Link
          to={`/parts?car=${car.id}`}
          className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
        >
          Find Parts
        </Link>
        <Link
          to={`/builds?make=${encodeURIComponent(car.make)}`}
          className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
        >
          Build Ideas
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-gray-700 hover:bg-red-800 text-gray-400 hover:text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
        >
          🗑️
        </button>
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add a Car</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Year *</label>
              <select
                value={form.year}
                onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Make *</label>
              <select
                value={form.make}
                onChange={e => setForm({ ...form, make: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="">Select make</option>
                {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Model *</label>
              <input
                type="text"
                required
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                placeholder="e.g. Civic, Mustang"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Trim</label>
              <input
                type="text"
                value={form.trim}
                onChange={e => setForm({ ...form, trim: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                placeholder="e.g. Sport, GT, SE"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Engine</label>
            <input
              type="text"
              value={form.engine}
              onChange={e => setForm({ ...form, engine: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="e.g. 2.0L Turbocharged 4-Cylinder"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              placeholder="Any mods, condition notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white py-3 rounded-lg font-bold transition-colors">
              {loading ? 'Adding...' : 'Add Car'}
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
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🚗 My Garage</h1>
            <p className="text-gray-400 mt-1">Welcome back, <span className="text-white">{user?.username}</span></p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            + Add Car
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading your garage...</div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏚️</div>
            <p className="text-gray-400 text-lg mb-6">Your garage is empty. Add your first car!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Add Your First Car
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => (
              <CarCard key={car.id} car={car} onDelete={handleDelete} />
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-gray-700 hover:border-red-600 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-red-400 transition-colors min-h-48"
            >
              <span className="text-4xl">+</span>
              <span className="font-medium">Add Another Car</span>
            </button>
          </div>
        )}
      </div>

      {showModal && <AddCarModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
}
