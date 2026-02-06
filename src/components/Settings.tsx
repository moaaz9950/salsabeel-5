import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Volume2, Bell, Globe, BookOpen, Download, Trash2, AlertCircle } from 'lucide-react';
import { UserPreferences } from '../lib/types';
import { prayerNotificationManager } from '../utils/prayerNotifications';

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

  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    athanSource: 'makkah',
    volume: 0.7,
    notifyBefore: 5,
    hasPermission: false
  });

  // Initialize notification settings
  useEffect(() => {
    // Load user preferences
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences(parsedPrefs);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }

    // Load notification settings
    setNotificationSettings({
      enabled: prayerNotificationManager.isEnabled(),
      athanSource: prayerNotificationManager.getAthanSource(),
      volume: prayerNotificationManager.getVolume(),
      notifyBefore: prayerNotificationManager.getNotifyBefore(),
      hasPermission: Notification.permission === 'granted'
    });

    // Check notification permission
    if ('Notification' in window) {
      setNotificationSettings(prev => ({
        ...prev,
        hasPermission: Notification.permission === 'granted'
      }));
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
  };

  const updateNotificationSetting = <K extends keyof typeof notificationSettings>(
    key: K,
    value: typeof notificationSettings[K]
  ) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
  };

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in your browser');
      return;
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
      updateNotificationSetting('hasPermission', permission === 'granted');
    }

    if (permission === 'granted') {
      const newEnabledState = !notificationSettings.enabled;
      updateNotificationSetting('enabled', newEnabledState);
      prayerNotificationManager.setEnabled(newEnabledState);
      
      // Update user preferences
      updatePreference('adhanNotifications', newEnabledState);
    } else {
      alert('Notification permission denied. Please enable it in browser settings.');
    }
  };

  const handleAthanSourceChange = (source: string) => {
    updateNotificationSetting('athanSource', source);
    prayerNotificationManager.setAthanSource(source as any);
  };

  const handleVolumeChange = (volume: number) => {
    updateNotificationSetting('volume', volume);
    prayerNotificationManager.setVolume(volume);
  };

  const handleNotifyBeforeChange = (minutes: number) => {
    updateNotificationSetting('notifyBefore', minutes);
    prayerNotificationManager.setNotifyBefore(minutes);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in your browser');
      return;
    }

    const permission = await Notification.requestPermission();
    updateNotificationSetting('hasPermission', permission === 'granted');
    
    if (permission === 'granted' && notificationSettings.enabled) {
      // Re-enable notifications if they were enabled
      prayerNotificationManager.setEnabled(true);
    }
  };

  const stopAthan = () => {
    prayerNotificationManager.stopAthan();
  };

  const testAthan = () => {
    prayerNotificationManager.stopAthan();
    setTimeout(() => {
      // Simulate a prayer notification
      const testAthanSource = prayerNotificationManager.getAvailableAthanSources()[notificationSettings.athanSource];
      if (testAthanSource) {
        const audio = new Audio(testAthanSource.source);
        audio.volume = notificationSettings.volume;
        audio.play().catch(err => {
          console.error('Error playing test athan:', err);
          alert('Error playing athan. Please check if audio file exists.');
        });
      }
    }, 100);
  };

  const athanSources = prayerNotificationManager.getAvailableAthanSources();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Theme</h3>
          <div className="flex gap-3">
            <button
              onClick={() => updatePreference('theme', 'light')}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
                preferences.theme === 'light' 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Sun className="w-5 h-5" /> 
              <span className="font-medium">Light</span>
            </button>
            <button
              onClick={() => updatePreference('theme', 'dark')}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
                preferences.theme === 'dark' 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Moon className="w-5 h-5" /> 
              <span className="font-medium">Dark</span>
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Font Size</h3>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{preferences.fontSize}px</span>
          </div>
          <input
            type="range"
            min="14"
            max="24"
            value={preferences.fontSize}
            onChange={(e) => updatePreference('fontSize', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
          />
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span>Small</span>
            <span>Medium</span>
            <span>Large</span>
          </div>
        </div>

        {/* Language */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Language</h3>
          <div className="flex gap-3">
            <button
              onClick={() => updatePreference('language', 'en')}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
                preferences.language === 'en' 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Globe className="w-5 h-5" /> 
              <span className="font-medium">English</span>
            </button>
            <button
              onClick={() => updatePreference('language', 'ar')}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
                preferences.language === 'ar' 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <span className="text-lg">ع</span> 
              <span className="font-medium">العربية</span>
            </button>
          </div>
        </div>

        {/* Prayer Settings Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="font-semibold mb-4 text-lg">Prayer Settings</h3>
          
          {/* Prayer Time Calculation Method */}
          <div className="mb-6">
            <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-300">Calculation Method</h4>
            <select
              value={preferences.prayerMethod}
              onChange={(e) => updatePreference('prayerMethod', parseInt(e.target.value))}
              className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="1">Muslim World League</option>
              <option value="2">Islamic Society of North America</option>
              <option value="3">Egyptian General Authority of Survey</option>
              <option value="4">Umm al-Qura, Makkah</option>
              <option value="5">University of Islamic Sciences, Karachi</option>
            </select>
          </div>

          {/* Adhan Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300">Adhan Notifications</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Get notified before prayer times
                </p>
              </div>
              <button
                onClick={toggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Notification Settings (only show if enabled) */}
            {notificationSettings.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-emerald-200 dark:border-emerald-700">
                {/* Permission Warning */}
                {!notificationSettings.hasPermission && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Notification Permission Required</p>
                        <button
                          onClick={requestNotificationPermission}
                          className="mt-1 text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
                        >
                          Click here to allow notifications
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Athan Source Selection */}
                <div>
                  <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-300">Athan Sound</h4>
                  <select
                    value={notificationSettings.athanSource}
                    onChange={(e) => handleAthanSourceChange(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {Object.entries(athanSources).map(([key, source]) => (
                      <option key={key} value={key}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Volume Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">Volume</h4>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {Math.round(notificationSettings.volume * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-slate-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={notificationSettings.volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                    />
                  </div>
                </div>

                {/* Notify Before */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">Notify Before Prayer</h4>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {notificationSettings.notifyBefore} minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={notificationSettings.notifyBefore}
                    onChange={(e) => handleNotifyBeforeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                  />
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span>1 min</span>
                    <span>5 min</span>
                    <span>10 min</span>
                    <span>15 min</span>
                    <span>30 min</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={testAthan}
                    className="flex-1 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium transition-colors"
                  >
                    Test Athan
                  </button>
                  <button
                    onClick={stopAthan}
                    className="flex-1 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors"
                  >
                    Stop Athan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audio Settings */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="font-semibold mb-4 text-lg">Audio Settings</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-300">Reciter</h4>
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-slate-400" />
                <select
                  value={preferences.reciter}
                  onChange={(e) => updatePreference('reciter', e.target.value)}
                  className="flex-1 p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="mishary">Mishary Rashid Alafasy</option>
                  <option value="sudais">Abdur-Rahman As-Sudais</option>
                  <option value="ghamdi">Saad Al-Ghamdi</option>
                  <option value="husary">Mahmoud Khalil Al-Husary</option>
                  <option value="minshawi">Mohamed Siddiq Al-Minshawi</option>
                </select>
              </div>
            </div>

            {/* Audio Quality */}
            <div>
              <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-300">Audio Quality</h4>
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-center">
                  <div className="text-sm font-medium">Low</div>
                  <div className="text-xs text-slate-500">64 kbps</div>
                </button>
                <button className="p-3 bg-emerald-500 text-white rounded-lg text-center">
                  <div className="text-sm font-medium">Medium</div>
                  <div className="text-xs text-emerald-100">128 kbps</div>
                </button>
                <button className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-center">
                  <div className="text-sm font-medium">High</div>
                  <div className="text-xs text-slate-500">320 kbps</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Downloaded Content */}
        {preferences.downloadedSurahs && preferences.downloadedSurahs.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Downloaded Content</h3>
              <button
                onClick={() => {
                  if (window.confirm('Clear all downloaded content?')) {
                    updatePreference('downloadedSurahs', []);
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Clear all downloads"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {preferences.downloadedSurahs.map((surah, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Surah {surah}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const newSurahs = preferences.downloadedSurahs.filter(s => s !== surah);
                        updatePreference('downloadedSurahs', newSurahs);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}