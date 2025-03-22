import React, { useState } from 'react';
import Card from './Card';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  PaintBucket, 
  CreditCard,
  CheckCircle,
  Moon,
  ArrowRight,
  Link,
  RefreshCw,
  Save,
  HelpCircle
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'api' | 'display' | 'subscription'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-theme-text-primary">Settings</h2>
            <p className="text-sm text-theme-accent">Customize your experience</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-56 flex flex-col">
            <div className="bg-theme-accent/10 rounded-lg p-2">
              <button
                className={`flex items-center w-full text-left px-3 py-2 rounded-md mb-1 ${
                  activeTab === 'profile' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'hover:bg-theme-accent/10 text-theme-text-primary'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={16} className="mr-2" />
                <span className="text-sm">Profile</span>
              </button>

              <button
                className={`flex items-center w-full text-left px-3 py-2 rounded-md mb-1 ${
                  activeTab === 'preferences' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'hover:bg-theme-accent/10 text-theme-text-primary'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                <Bell size={16} className="mr-2" />
                <span className="text-sm">Preferences</span>
              </button>

              <button
                className={`flex items-center w-full text-left px-3 py-2 rounded-md mb-1 ${
                  activeTab === 'security' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'hover:bg-theme-accent/10 text-theme-text-primary'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Shield size={16} className="mr-2" />
                <span className="text-sm">Security</span>
              </button>

              <button
                className={`flex items-center w-full text-left px-3 py-2 rounded-md mb-1 ${
                  activeTab === 'display' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'hover:bg-theme-accent/10 text-theme-text-primary'
                }`}
                onClick={() => setActiveTab('display')}
              >
                <PaintBucket size={16} className="mr-2" />
                <span className="text-sm">Display</span>
              </button>

              <button
                className={`flex items-center w-full text-left px-3 py-2 rounded-md mb-1 ${
                  activeTab === 'api' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'hover:bg-theme-accent/10 text-theme-text-primary'
                }`}
                onClick={() => setActiveTab('api')}
              >
                <Globe size={16} className="mr-2" />
                <span className="text-sm">API Access</span>
              </button>

              <button
                className={`flex items-center w-full text-left px-3 py-2 rounded-md ${
                  activeTab === 'subscription' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'hover:bg-theme-accent/10 text-theme-text-primary'
                }`}
                onClick={() => setActiveTab('subscription')}
              >
                <CreditCard size={16} className="mr-2" />
                <span className="text-sm">Subscription</span>
              </button>
            </div>

            <div className="mt-6 p-3 bg-theme-accent/10 rounded-lg text-center">
              <p className="text-xs text-theme-text-primary mb-2">Need help with settings?</p>
              <button className="text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1 rounded-full">
                Contact Support
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-theme-bg rounded-lg p-4 border border-theme-border">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium text-theme-text-primary mb-4">Profile Settings</h3>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-theme-text-primary mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-text-primary mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full p-2 bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-text-primary mb-1">
                      Timezone
                    </label>
                    <select
                      className="w-full p-2 bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text-primary"
                    >
                      <option>Eastern Time (ET)</option>
                      <option>Pacific Time (PT)</option>
                      <option>UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-text-primary mb-1">
                      Default Currency
                    </label>
                    <select
                      className="w-full p-2 bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text-primary"
                    >
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>BTC (₿)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-theme-accent hover:bg-theme-accent-dark text-theme-bg rounded transition-colors"
                  >
                    {isSaving ? (
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                    ) : saveSuccess ? (
                      <CheckCircle size={16} className="mr-2" />
                    ) : (
                      <Save size={16} className="mr-2" />
                    )}
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;