import { useMemo, useState, useEffect } from "react";
import {
  LogOut,
  User,
  Settings,
  UserCircle2,
  X,
  RefreshCcw,
  SlidersHorizontal,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import PolicymakerDashboard from "./PolicymakerDashboard";
import StakeholderDashboard from "./StakeholderDashboard";
import PublicDashboard from "./PublicDashboard";

const DEFAULT_SETTINGS = {
  autoRefresh: true,
  refreshInterval: 30000,
  darkMode: false,
  emailAlerts: true,
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("dashboard-settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  useEffect(() => {
    localStorage.setItem("dashboard-settings", JSON.stringify(settings));

    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  const dashboardTitle = useMemo(() => {
    switch (user?.role) {
      case "policymaker":
        return "Policy Dashboard";
      case "stakeholder":
        return "Stakeholder Dashboard";
      default:
        return "Public Dashboard";
    }
  }, [user?.role]);

  const effectiveInterval = settings.autoRefresh
    ? settings.refreshInterval
    : 0;

  const dashboardProps = {
    refreshInterval: effectiveInterval,
    preferences: settings,
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case "policymaker":
        return <PolicymakerDashboard {...dashboardProps} />;
      case "stakeholder":
        return <StakeholderDashboard {...dashboardProps} />;
      default:
        return <PublicDashboard {...dashboardProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 transition-colors duration-500">

      {/* HEADER */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <img
              src="https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop"
              alt="Ministry Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-bold">Ministry of Jal Shakti</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {dashboardTitle}
              </p>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">

            <span className="text-sm flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
              <User size={16} />
              {user?.name}
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {user?.role}
              </span>
            </span>

            <button
              onClick={() => setShowProfilePanel(true)}
              className="px-3 py-1.5 text-xs rounded bg-white dark:bg-gray-800 border hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              <UserCircle2 size={14} /> Profile
            </button>

            <button
              onClick={() => setShowSettingsPanel(true)}
              className="px-3 py-1.5 text-xs rounded bg-white dark:bg-gray-800 border hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              <Settings size={14} /> Settings
            </button>

            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
            >
              <LogOut size={14} /> Logout
            </button>

          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="p-6 max-w-7xl mx-auto">{renderDashboard()}</main>

      <SettingsModal
        open={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        settings={settings}
        onChange={(u) => setSettings(u)}
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



// ---------- MODAL COMPONENT ----------
const SettingsModal = ({ open, onClose, settings, onChange }) => {
  if (!open) return null;

  const toggleSetting = (key) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
        
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <SlidersHorizontal className="text-blue-600" size={22} />
          <h2 className="text-lg font-semibold">Dashboard Settings</h2>
        </div>

        {/* SETTINGS LIST */}
        <div className="space-y-4">
          <SettingToggle label="Auto Refresh" checked={settings.autoRefresh} onChange={() => toggleSetting("autoRefresh")} />
          <SettingToggle label="Email Alerts" checked={settings.emailAlerts} onChange={() => toggleSetting("emailAlerts")} />
          <SettingToggle label="Dark Theme" checked={settings.darkMode} onChange={() => toggleSetting("darkMode")} />

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <RefreshCcw size={16} /> Refresh Interval
            </label>
            <select
              disabled={!settings.autoRefresh}
              value={settings.refreshInterval}
              onChange={(e) => onChange({ ...settings, refreshInterval: Number(e.target.value) })}
              className="mt-2 w-full border rounded-lg p-2 dark:bg-gray-700"
            >
              <option value={15000}>15s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingToggle = ({ label, checked, onChange }) => (
  <label className="flex justify-between items-center text-sm">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={onChange} />
  </label>
);



// ---------- PROFILE COMPONENT ----------
const ProfilePanel = ({ open, onClose, user, settings }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 p-6 shadow-xl relative flex flex-col">

        <button
          className="absolute top-5 right-5 text-gray-500 hover:text-black dark:hover:text-white"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="mt-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-white flex justify-center items-center text-2xl font-semibold">
            {(user?.name || "U").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-xl">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <hr className="my-6 dark:border-gray-700" />

        <div className="space-y-3">
          <ProfileCard title="Role" value={user?.role} />
          <ProfileCard title="Auto Refresh" value={settings.autoRefresh ? "Yes" : "No"} />
          <ProfileCard title="Dark Mode" value={settings.darkMode ? "Enabled" : "Disabled"} />
          <ProfileCard title="Email Alerts" value={settings.emailAlerts ? "Enabled" : "Disabled"} />
        </div>
      </div>
    </div>
  );
};

const ProfileCard = ({ title, value }) => (
  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
    <p className="text-xs uppercase text-gray-500">{title}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);
