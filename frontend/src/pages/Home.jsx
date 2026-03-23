import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-red-950 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🏎️</div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Your Ultimate<br />
            <span className="text-red-500">Car Parts</span> Portal
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Sign up, add your car, and discover performance parts, OEM replacements,
            and expert build ideas — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/garage"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
                >
                  🚗 My Garage
                </Link>
                <Link
                  to="/parts"
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
                >
                  🔩 Browse Parts
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/parts"
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
                >
                  Browse Parts
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🚗', title: 'My Garage', desc: 'Add your cars and keep track of your fleet. Year, make, model, engine — all saved.', link: user ? '/garage' : '/signup', cta: user ? 'Open Garage' : 'Get Started' },
              { icon: '⚡', title: 'Performance Parts', desc: 'Turbos, intakes, exhausts, suspension upgrades — find parts to unlock your car\'s potential.', link: '/parts?type=performance', cta: 'Shop Performance' },
              { icon: '🔧', title: 'Normal Parts', desc: 'Brake pads, filters, belts, sensors — find quality OEM-spec replacement parts.', link: '/parts?type=normal', cta: 'Shop Parts' },
              { icon: '🛠️', title: 'Build Ideas', desc: 'Get inspired with curated build guides from beginner to expert level.', link: '/builds', cta: 'Get Inspired' },
            ].map((feature) => (
              <Link key={feature.title} to={feature.link} className="group bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-red-600 rounded-2xl p-6 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.desc}</p>
                <span className="text-red-400 text-sm font-medium group-hover:text-red-300">{feature.cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-gray-950">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '28+', label: 'Parts in Catalog' },
            { value: '14+', label: 'Build Ideas' },
            { value: '100%', label: 'Free to Use' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-extrabold text-red-500 mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-16 px-4 bg-gradient-to-r from-red-900 to-red-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
            <p className="text-red-200 mb-8">Join thousands of car enthusiasts finding the perfect parts for their builds.</p>
            <Link
              to="/signup"
              className="bg-white text-red-700 font-bold py-4 px-10 rounded-xl text-lg hover:bg-red-50 transition-all inline-block"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      <footer className="bg-gray-900 border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>🔧 CarPartPortal — Find the right parts for your build</p>
      </footer>
    </div>
  );
}
