import { useEffect, useMemo, useState } from 'react';
import { LogOut, User, Settings, UserCircle2, X, RefreshCcw, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PolicymakerDashboard from './PolicymakerDashboard';
import StakeholderDashboard from './StakeholderDashboard';
import PublicDashboard from './PublicDashboard';

const DEFAULT_SETTINGS = {
  autoRefresh: true,
  refreshInterval: 30000,
  darkMode: false,
  emailAlerts: true,
};

const SETTINGS_STORAGE_KEY = 'dashboard_settings';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  // Persist settings and apply dark mode to the document root when toggled
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const dashboardTitle = useMemo(() => {
    switch (user?.role) {
      case 'policymaker':
        return 'Policy Dashboard';
      case 'stakeholder':
        return 'Stakeholder Dashboard';
      default:
        return 'Public Dashboard';
    }
  }, [user?.role]);

  const effectiveInterval = settings.autoRefresh ? settings.refreshInterval : 0;

  const dashboardProps = {
    refreshInterval: effectiveInterval,
    preferences: settings,
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'policymaker':
        return <PolicymakerDashboard {...dashboardProps} />;
      case 'stakeholder':
        return <StakeholderDashboard {...dashboardProps} />;
      default:
        return <PublicDashboard {...dashboardProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Ministry Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src="https://plus.unsplash.com/premium_photo-1679607697878-ce838322c122?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHNhdmUlMjB3YXRlcnxlbnwwfHwwfHx8MA%3D%3D" 
                  alt="Ministry of Jal Shakti"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Ministry of Jal Shakti
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{dashboardTitle}</p>
                </div>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-100">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {user?.role}
                </span>
              </div>

              <button
                onClick={() => setShowProfilePanel(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-xs font-medium rounded text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserCircle2 className="w-3.5 h-3.5 mr-1" />
                Profile
              </button>
              
              <button
                onClick={() => setShowSettingsPanel(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </button>
              
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hide dashboards (and maps) while settings or profile overlays are open */}
        {!showSettingsPanel && !showProfilePanel && renderDashboard()}
      </main>

      <SettingsModal
        open={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        settings={settings}
        onChange={(updatedSettings) => setSettings(updatedSettings)}
      />

      <ProfilePanel
        open={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
        user={user}
        settings={settings}
      />
    </div>
  );
};

export default Dashboard;

const SettingsModal = ({ open, onClose, settings, onChange }) => {
  if (!open) return null;

  const handleToggle = (key) => {
    onChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleIntervalChange = (event) => {
    onChange({
      ...settings,
      refreshInterval: Number(event.target.value),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-6">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Dashboard Settings</h2>
            <p className="text-sm text-gray-500">Personalize how your data dashboard behaves.</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto refresh data</p>
              <p className="text-xs text-gray-500">Pull latest readings automatically.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={() => handleToggle('autoRefresh')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <div>
            <label className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <RefreshCcw className="w-4 h-4 text-blue-600" />
              <span>Refresh interval</span>
            </label>
            <select
              value={settings.refreshInterval}
              onChange={handleIntervalChange}
              disabled={!settings.autoRefresh}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value={15000}>Every 15 seconds</option>
              <option value={30000}>Every 30 seconds</option>
              <option value={60000}>Every minute</option>
            </select>
          </div>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email alerts</p>
              <p className="text-xs text-gray-500">Get notified when stations go critical.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={() => handleToggle('emailAlerts')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Dark theme</p>
            </div>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

const ProfilePanel = ({ open, onClose, user, settings }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm h-full bg-white shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mt-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white flex items-center justify-center text-xl font-semibold">
              {(user?.name || 'User').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Role</p>
              <p className="text-sm font-medium text-gray-900">{user?.role}</p>
            </div>

            {user?.department && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Department</p>
                <p className="text-sm font-medium text-gray-900">{user.department}</p>
              </div>
            )}

            {user?.organization && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Organization</p>
                <p className="text-sm font-medium text-gray-900">{user.organization}</p>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Preferences</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Auto refresh: {settings.autoRefresh ? 'Enabled' : 'Disabled'}</li>
                <li>Refresh interval: {settings.refreshInterval / 1000}s</li>
                <li>Email alerts: {settings.emailAlerts ? 'Enabled' : 'Disabled'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};