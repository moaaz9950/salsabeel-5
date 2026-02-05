import React, { useState, useEffect } from 'react';
import { Clock, Moon, Sun, Heart, BookOpen, DollarSign, Sparkles, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';
import {
  getCurrentRamadanState,
  isInLastThirdOfNight,
  getRamadanNightName,
} from '../lib/ramadanService';

const RamadanPage = () => {
  const { theme } = useTheme();
  const [ramadanState, setRamadanState] = useState(getCurrentRamadanState());
  const [fastingState, setFastingState] = useState<'suhoor' | 'fasting' | 'iftar' | 'night'>('fasting');
  const [countdownTime, setCountdownTime] = useState('');
  const [checklist, setChecklist] = useState({
    fasting: false,
    quran: false,
    taraweeh: false,
    dua: false,
    charity: false,
  });
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isLaylatAlQadr, setIsLaylatAlQadr] = useState(false);

  useEffect(() => {
    setRamadanState(getCurrentRamadanState());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      if (hour < 5) {
        setFastingState('suhoor');
      } else if (hour < 17) {
        setFastingState('fasting');
      } else if (hour < 19) {
        setFastingState('iftar');
      } else {
        setFastingState('night');
      }

      const ramadanState = getCurrentRamadanState();
      setIsLaylatAlQadr(ramadanState.isRamadan && ramadanState.currentDay >= 21 && ramadanState.currentDay <= 30);

      if (hour === 4 && minute === 45) {
        setReminderMessage('Suhoor will end in 15 minutes');
        setShowReminder(true);
      } else if (hour === 18 && minute === 45) {
        setReminderMessage('Iftar time in 15 minutes');
        setShowReminder(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showReminder) {
      const timer = setTimeout(() => setShowReminder(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showReminder]);

  const toggleChecklist = (item: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  if (!ramadanState.isRamadan) {
    return (
      <div className={cn(
        "rounded-lg shadow-lg p-8 text-center",
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      )}>
        <Moon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">Ramadan Not Active</h2>
        <p className="text-gray-500">Ramadan features will appear during the Islamic month of Ramadan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showReminder && (
        <div className="fixed top-4 right-4 bg-amber-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse z-50">
          {reminderMessage}
        </div>
      )}

      <div className={cn(
        "rounded-lg shadow-lg overflow-hidden",
        theme === 'dark' ? 'bg-slate-800' : 'bg-amber-50'
      )}>
        <div className={cn(
          "p-6 border-b",
          theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-amber-200 to-orange-200 border-amber-300'
        )}>
          <h1 className="text-3xl font-bold font-arabic">رمضان المبارك</h1>
          <p className="text-lg mt-2">Day {ramadanState.currentDay} of {ramadanState.totalDays}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={cn(
              "p-4 rounded-lg text-center",
              fastingState === 'suhoor' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
            )}>
              <Sun className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Suhoor Time</p>
            </div>
            <div className={cn(
              "p-4 rounded-lg text-center",
              fastingState === 'fasting' ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-100'
            )}>
              <Zap className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Fasting</p>
            </div>
            <div className={cn(
              "p-4 rounded-lg text-center",
              fastingState === 'iftar' ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-100'
            )}>
              <Moon className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Iftar Time</p>
            </div>
            <div className={cn(
              "p-4 rounded-lg text-center",
              fastingState === 'night' ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-100'
            )}>
              <Sparkles className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Night Prayer</p>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(
        "rounded-lg shadow-lg p-6",
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      )}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Daily Worship Checklist
        </h2>
        <div className="space-y-3">
          {[
            { id: 'fasting', label: 'Fasting', icon: Zap },
            { id: 'quran', label: 'Quran Reading', icon: BookOpen },
            { id: 'taraweeh', label: 'Taraweeh Prayer', icon: Moon },
            { id: 'dua', label: 'Du\'a & Dhikr', icon: Heart },
            { id: 'charity', label: 'Charity', icon: DollarSign },
          ].map(({ id, label, icon: Icon }) => (
            <label key={id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition">
              <input
                type="checkbox"
                checked={checklist[id as keyof typeof checklist]}
                onChange={() => toggleChecklist(id as keyof typeof checklist)}
                className="w-5 h-5 rounded"
              />
              <Icon className="w-5 h-5 text-amber-600" />
              <span className="font-medium">{label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 p-4 bg-amber-100 rounded-lg">
          <p className="text-sm text-amber-800">
            Progress: {Object.values(checklist).filter(Boolean).length} / 5 completed
          </p>
          <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
            <div
              className="bg-amber-600 h-2 rounded-full transition-all"
              style={{
                width: `${(Object.values(checklist).filter(Boolean).length / 5) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {isLaylatAlQadr && (
        <div className={cn(
          "rounded-lg shadow-lg p-6 border-2 border-yellow-400",
          theme === 'dark' ? 'bg-slate-800' : 'bg-yellow-50'
        )}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            Laylat al-Qadr (Night of Power)
          </h2>
          <p className="text-lg mb-4">{getRamadanNightName(ramadanState.currentDay)}</p>
          <div className="bg-yellow-100 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">Recommended Du\'as:</p>
            <p className="text-sm italic">
              "Allahumma innaka afuwwun tuhibbul afwa fa'fu anna"
            </p>
            <p className="text-xs mt-2 text-gray-600">
              "O Allah, You are Most Forgiving, and You love forgiveness, so forgive me"
            </p>
          </div>
          <button className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition">
            Enter Distraction-Free Mode
          </button>
        </div>
      )}

      <div className={cn(
        "rounded-lg shadow-lg p-6",
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      )}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6" />
          Reminders
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-red-100 rounded-lg border-l-4 border-red-500">
            <p className="font-semibold text-red-900">Zakat al-Fitr</p>
            <p className="text-sm text-red-800">Remember to give Zakat al-Fitr before Eid prayer</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg border-l-4 border-green-500">
            <p className="font-semibold text-green-900">Charity</p>
            <p className="text-sm text-green-800">Ramadan is the month of giving - give generously</p>
          </div>
          <div className="p-4 bg-blue-100 rounded-lg border-l-4 border-blue-500">
            <p className="font-semibold text-blue-900">Night Prayers</p>
            <p className="text-sm text-blue-800">Strive in Qiyam al-Layl (night prayers) especially in the last 10 nights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RamadanPage;
