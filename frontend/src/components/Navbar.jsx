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

  const isActive = (to) => location.pathname === to;

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? 'bg-red-600/20 text-red-400 ring-1 ring-red-500/30'
          : 'text-gray-300 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-base shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-shadow">
              🔧
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Car<span className="text-red-500">Part</span>
              <span className="text-gray-400 font-light">Portal</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/parts', '🔩 Parts')}
            {navLink('/builds', '🛠️ Build Ideas')}
            {user && navLink('/garage', '🚗 My Garage')}
            {user && navLink('/saved', '💾 Saved')}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-red-600/30 ring-1 ring-red-500/40 flex items-center justify-center text-xs text-red-400 font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-red-600/20 hover:text-red-400 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ring-1 ring-white/10 hover:ring-red-500/30"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-600/40"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-current my-1 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 flex flex-col gap-1 border-t border-white/5 mt-2">
            {navLink('/parts', '🔩 Parts')}
            {navLink('/builds', '🛠️ Build Ideas')}
            {user && navLink('/garage', '🚗 My Garage')}
            {user && navLink('/saved', '💾 Saved Parts')}
            <div className="h-px bg-white/5 my-1" />
            {user ? (
              <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 px-3 py-2 text-sm font-medium transition-colors">
                Sign Out ({user.username})
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-300 px-3 py-2 text-sm font-medium">Log In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-red-400 px-3 py-2 text-sm font-medium">Get Started →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
