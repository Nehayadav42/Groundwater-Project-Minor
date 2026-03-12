import { ShieldCheck, Droplets, MapPin, BarChart2 } from 'lucide-react';
import LoginPage from './LoginPage';
import { useState } from 'react';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-100 flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-blue-100 bg-white/80 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Ministry of Jal Shakti
              </p>
              <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">
                Digital Groundwater Mission
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAuth(true)}
              className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              Login
            </button>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-full text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow hover:from-blue-700 hover:to-teal-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">
                Live DWLR water level monitoring
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              See India&apos;s groundwater
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                {' '}in real time.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 max-w-xl">
              A unified dashboard for policymakers, stakeholders, and citizens to track
              groundwater levels, station health, and risk hotspots across India.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow hover:from-blue-700 hover:to-teal-700"
              >
                Launch Dashboard
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-blue-700 bg-white/80 border border-blue-100 hover:bg-blue-50"
              >
                Register as new user
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/80 rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Stations
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">50+</p>
                <p className="text-xs text-gray-500">
                  DWLR monitoring points seeded for demo.
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Coverage
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">Pan‑India</p>
                <p className="text-xs text-gray-500">
                  Major river basins and urban centers.
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart2 className="w-4 h-4 text-teal-500" />
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Insights
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">Trends</p>
                <p className="text-xs text-gray-500">
                  Real‑time simulation and risk evaluation.
                </p>
              </div>
            </div>
          </div>

          {/* Right side illustration: simple card mock */}
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-200/60 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-4 w-40 h-40 bg-teal-200/60 rounded-full blur-3xl" />

            <div className="relative bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Sample overview
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    National DWLR Snapshot
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  Demo data
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Stations</p>
                  <p className="text-xl font-bold text-blue-700">50</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Normal</p>
                  <p className="text-xl font-bold text-emerald-700">32</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Alert / Warning</p>
                  <p className="text-xl font-bold text-amber-700">18</p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Log in to access the full interactive dashboard, detailed station trends,
                and policy insights.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-blue-100 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Ministry of Jal Shakti · Groundwater Monitoring Prototype</p>
          <p>Demo environment · Data simulated for academic use</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

