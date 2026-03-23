import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === to
          ? 'bg-red-700 text-white'
          : 'text-gray-200 hover:bg-red-700 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-gray-900 border-b border-red-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              <span className="text-white font-bold text-xl tracking-tight">
                Car<span className="text-red-500">Part</span>Portal
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/parts', '🔩 Parts')}
            {navLink('/builds', '🛠️ Build Ideas')}
            {user && navLink('/garage', '🚗 My Garage')}
            {user && navLink('/saved', '💾 Saved Parts')}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-gray-400 text-sm">Hi, <span className="text-white font-medium">{user.username}</span></span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-200 hover:text-white px-3 py-2 text-sm font-medium">Login</Link>
                <Link to="/signup" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current"></div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 flex flex-col gap-1">
            {navLink('/parts', '🔩 Parts')}
            {navLink('/builds', '🛠️ Build Ideas')}
            {user && navLink('/garage', '🚗 My Garage')}
            {user && navLink('/saved', '💾 Saved Parts')}
            {user ? (
              <button onClick={handleLogout} className="text-left text-red-400 px-3 py-2 text-sm font-medium">
                Logout ({user.username})
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-200 px-3 py-2 text-sm font-medium">Login</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-red-400 px-3 py-2 text-sm font-medium">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
