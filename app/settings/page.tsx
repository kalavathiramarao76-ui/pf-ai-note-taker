use client;

import { useState } from 'react';
import { useTheme } from '../context/theme';
import { useSettings } from '../context/settings';
import { localStorage } from '../utils/localStorage';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [newSettings, setNewSettings] = useState(settings);

  const handleSettingChange = (key: string, value: any) => {
    setNewSettings({ ...newSettings, [key]: value });
  };

  const handleSaveSettings = () => {
    updateSettings(newSettings);
    localStorage.set('settings', newSettings);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">General</h2>
          <div className="flex items-center mb-4">
            <label className="mr-2">Dark Mode</label>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={() => toggleTheme()}
            />
          </div>
          <div className="flex items-center mb-4">
            <label className="mr-2">Note Organization</label>
            <select
              value={newSettings.noteOrganization}
              onChange={(e) =>
                handleSettingChange('noteOrganization', e.target.value)
              }
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">AI Settings</h2>
          <div className="flex items-center mb-4">
            <label className="mr-2">AI Model</label>
            <select
              value={newSettings.aiModel}
              onChange={(e) =>
                handleSettingChange('aiModel', e.target.value)
              }
            >
              <option value="default">Default</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="flex items-center mb-4">
            <label className="mr-2">Summarization Length</label>
            <input
              type="number"
              value={newSettings.summarizationLength}
              onChange={(e) =>
                handleSettingChange('summarizationLength', e.target.value)
              }
            />
          </div>
        </div>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSaveSettings}
      >
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPage;