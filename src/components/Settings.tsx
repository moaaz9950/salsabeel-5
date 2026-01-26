import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Volume2 } from 'lucide-react';
import { UserPreferences } from '../lib/types';

export default function Settings() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    fontSize: 16,
    language: 'en',
    reciter: 'mishary',
    prayerMethod: 3,
    adhanNotifications: true,
    downloadedSurahs: [],
  });

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: value };
      localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Theme</h3>
          <div className="flex gap-4">
            <button
              onClick={() => updatePreference('theme', 'light')}
              className={`p-2 rounded-lg flex items-center gap-2 ${
                preferences.theme === 'light' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => updatePreference('theme', 'dark')}
              className={`p-2 rounded-lg flex items-center gap-2 ${
                preferences.theme === 'dark' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Font Size</h3>
          <input
            type="range"
            min="14"
            max="24"
            value={preferences.fontSize}
            onChange={(e) => updatePreference('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Language</h3>
          <select
            value={preferences.language}
            onChange={(e) => updatePreference('language', e.target.value as 'en' | 'ar')}
            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Prayer Time Calculation Method</h3>
          <select
            value={preferences.prayerMethod}
            onChange={(e) => updatePreference('prayerMethod', parseInt(e.target.value))}
            className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            <option value="1">Muslim World League</option>
            <option value="2">Islamic Society of North America</option>
            <option value="3">Egyptian General Authority of Survey</option>
            <option value="4">Umm al-Qura, Makkah</option>
            <option value="5">University of Islamic Sciences, Karachi</option>
          </select>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Notifications</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.adhanNotifications}
              onChange={(e) => updatePreference('adhanNotifications', e.target.checked)}
              className="rounded"
            />
            Enable Adhan notifications
          </label>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Audio Settings</h3>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <select
              value={preferences.reciter}
              onChange={(e) => updatePreference('reciter', e.target.value)}
              className="flex-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
            >
              <option value="mishary">Mishary Rashid Alafasy</option>
              <option value="sudais">Abdur-Rahman As-Sudais</option>
              <option value="ghamdi">Saad Al-Ghamdi</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
}