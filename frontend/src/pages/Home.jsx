import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Find the perfect parts for your build
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Your Ultimate<br />
            <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
              Car Parts
            </span>{' '}Portal
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Add your car to your garage and get personalized part recommendations,
            performance upgrades, and expert build ideas — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/garage"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-100"
                >
                  🚗 My Garage
                </Link>
                <Link
                  to="/parts"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 active:scale-100"
                >
                  🔩 Browse Parts
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-100"
                >
                  Get Started Free →
                </Link>
                <Link
                  to="/parts"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 active:scale-100"
                >
                  Browse Parts
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From daily drivers to track builds — we have the parts and inspiration to take your car further.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: '🚗',
                title: 'My Garage',
                desc: 'Add your cars and track your fleet. Year, make, model, engine — all saved for personalized recommendations.',
                link: user ? '/garage' : '/signup',
                cta: user ? 'Open Garage' : 'Get Started',
                color: 'from-red-600/10 to-transparent',
                border: 'hover:border-red-500/40',
              },
              {
                icon: '⚡',
                title: 'Performance Parts',
                desc: 'Turbos, intakes, exhausts, coilovers — unlock your car\'s full potential with premium upgrades.',
                link: '/parts?type=performance',
                cta: 'Shop Performance',
                color: 'from-orange-600/10 to-transparent',
                border: 'hover:border-orange-500/40',
              },
              {
                icon: '🔧',
                title: 'OEM / Normal Parts',
                desc: 'Brake pads, filters, belts, sensors — quality replacement parts to keep your car running perfectly.',
                link: '/parts?type=normal',
                cta: 'Shop Parts',
                color: 'from-blue-600/10 to-transparent',
                border: 'hover:border-blue-500/40',
              },
              {
                icon: '🛠️',
                title: 'Build Ideas',
                desc: 'Curated build guides from beginner to expert. Get inspired and plan your next project.',
                link: '/builds',
                cta: 'Get Inspired',
                color: 'from-purple-600/10 to-transparent',
                border: 'hover:border-purple-500/40',
              },
            ].map((feature) => (
              <Link
                key={feature.title}
                to={feature.link}
                className={`group relative bg-gray-900 border border-white/5 ${feature.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{feature.desc}</p>
                  <span className="text-red-400 text-sm font-medium group-hover:text-red-300 transition-colors">
                    {feature.cta} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '28+', label: 'Parts in Catalog' },
            { value: '14+', label: 'Build Ideas' },
            { value: '100%', label: 'Free to Use' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900 border border-red-500/20 rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none"></div>
              <div className="relative">
                <div className="text-5xl mb-4">🏎️</div>
                <h2 className="text-3xl font-bold text-white mb-3">Ready to Build?</h2>
                <p className="text-gray-400 mb-8">Create your free account, add your cars, and start discovering the perfect parts for your builds.</p>
                <Link
                  to="/signup"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-100 inline-block"
                >
                  Create Free Account →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        <p>🔧 CarPartPortal — Find the right parts for your build</p>
      </footer>
    </div>
  );
}
