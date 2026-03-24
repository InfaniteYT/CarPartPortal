import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [carForm, setCarForm] = useState({ year: currentYear, make: '', model: '', trim: '', engine: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    if (!carForm.make || !carForm.model) return setError('Make and model are required.');
    setLoading(true);
    setError('');
    try {
      await api.post('/cars', carForm);
      navigate('/garage');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add car.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-gray-800/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all duration-200';
  const labelClass = 'block text-sm font-medium text-gray-400 mb-1.5';

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= s ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-gray-800 text-gray-500 border border-white/10'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 rounded-full transition-all duration-300 ${step > s ? 'bg-red-600' : 'bg-gray-700'}`}></div>}
            </div>
          ))}
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/5 p-8 shadow-2xl shadow-black/40">
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🔧</div>
                <h1 className="text-2xl font-bold text-white">Create your account</h1>
                <p className="text-gray-500 mt-1 text-sm">Start building your garage today</p>
              </div>

              {error && (
                <div className="bg-red-950/50 border border-red-500/20 text-red-400 rounded-xl p-3 mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className={labelClass}>Username</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    className={inputClass}
                    placeholder="carbuilder42"
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={inputClass}
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    className={inputClass}
                    placeholder="Repeat your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 mt-2"
                >
                  {loading ? 'Creating account…' : 'Create Account →'}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-red-400 hover:text-red-300 font-medium transition-colors">Log in</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🚗</div>
                <h1 className="text-2xl font-bold text-white">Add your first car</h1>
                <p className="text-gray-500 mt-1 text-sm">Tell us about your ride to get personalized recommendations</p>
              </div>

              {error && (
                <div className="bg-red-950/50 border border-red-500/20 text-red-400 rounded-xl p-3 mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddCar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Year *</label>
                    <select
                      value={carForm.year}
                      onChange={e => setCarForm({ ...carForm, year: parseInt(e.target.value) })}
                      className={inputClass}
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Make *</label>
                    <select
                      value={carForm.make}
                      onChange={e => setCarForm({ ...carForm, make: e.target.value })}
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
                    <label className={labelClass}>Model *</label>
                    <input
                      type="text"
                      required
                      value={carForm.model}
                      onChange={e => setCarForm({ ...carForm, model: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Civic"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Trim</label>
                    <input
                      type="text"
                      value={carForm.trim}
                      onChange={e => setCarForm({ ...carForm, trim: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Sport, GT"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Engine</label>
                  <input
                    type="text"
                    value={carForm.engine}
                    onChange={e => setCarForm({ ...carForm, engine: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 2.0L Turbo 4-Cylinder"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-600/40"
                >
                  {loading ? 'Adding car…' : '🚗 Add Car & Go to Garage'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/garage')}
                  className="w-full bg-transparent border border-white/10 hover:border-white/20 text-gray-400 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Skip for now
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
