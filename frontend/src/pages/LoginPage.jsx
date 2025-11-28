import { useState } from 'react';
import { ShieldCheck, Waves } from 'lucide-react';
import Login from '../components/Login';
import Register from '../components/Register';

const LoginPage = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-100 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-teal-500 text-white flex flex-col justify-between p-10">
        <div>
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-10 h-10" />
            <div>
              <p className="text-sm uppercase tracking-wide text-blue-100">Ministry of Jal Shakti</p>
              <h1 className="text-3xl font-bold">DWLR Monitoring Suite</h1>
            </div>
          </div>
          <p className="mt-6 text-blue-50 text-lg leading-relaxed">
            Secure access for policymakers, stakeholders, and the public to real-time groundwater insights,
            actionable alerts, and nationwide DWLR station analytics.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <p className="text-4xl font-bold">540+</p>
            <p className="text-sm">Automated monitoring stations reporting live data every 15 minutes.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur flex flex-col">
            <div className="flex items-center space-x-2">
              <Waves className="w-5 h-5" />
              <p className="text-sm uppercase tracking-wide">24x7 Watch</p>
            </div>
            <p className="text-sm mt-2">
              AI-assisted anomaly detection keeps you informed about critical water level events instantly.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex-1 flex items-center justify-center p-6 sm:p-10">
        {showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </section>
    </div>
  );
};

export default LoginPage;

