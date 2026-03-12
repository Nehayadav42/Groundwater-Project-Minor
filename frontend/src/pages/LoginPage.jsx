import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import Login from '../components/Login';
import Register from '../components/Register';

const LoginPage = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-100 flex items-center justify-center px-4">
      {/* Water waves background */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -bottom-32 -left-16 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/60 to-teal-300/40 rounded-[50%] blur-3xl"></div>
        <div className="absolute -bottom-40 right-0 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-300/50 to-blue-500/40 rounded-[55%] blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Simple left introduction */}
        <div className="space-y-4 text-gray-800">
          <div className="inline-flex items-center space-x-3 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium tracking-wide text-blue-700 uppercase">
              Groundwater Monitoring Portal
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Sign in to your account
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-md">
            Access groundwater information, station locations, and alerts from a single, easy-to-use dashboard.
          </p>
        </div>

        {/* Auth card */}
        <section className="flex justify-center">
          {showRegister ? (
            <Register onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <Login onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </section>
      </div>
    </div>
  );
};

export default LoginPage;

