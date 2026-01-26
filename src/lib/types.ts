import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface QuranVerse {
  number: number;
  text: string;
  translation?: string;
  transliteration?: string;
  audio?: string;
  arabicTafsir?: {
    jalalayn: string;
    tabari: string;
    qurtubi: string;
    baghawi: string;
  };
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation?: string;
  revelationType: "Meccan" | "Medinan";
  type?: "Meccan" | "Medinan";
  narration?: {
    arabic: string;
    english: string;
  };
  verses: QuranVerse[];
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  rewaya?: string;
  moshaf: Array<{
    id: number;
    name: string;
    server: string;
    surah_total: number;
    surah_list?: string;
    description?: string;
    quality?: string;
    count?: number;
  }>;
}

export interface RadioStation {
  id: string;
  name: string;
  arabicName?: string;
  url: string;
  language: string;
}

export interface AsmaAlHusna {
  number: number;
  name: string;
  transliteration: string;
  meaning: string;
}

export interface Dhikr {
  id: string;
  arabic: string;
  translation: string;
  transliteration: string;
  count: number;
  reference?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'ramadan';
  fontSize: number;
  language: 'en' | 'ar';
  reciter: string;
  prayerMethod: number;
  adhanNotifications: boolean;
  downloadedSurahs: number[];
}

export interface AppLanguage {
  code: 'en' | 'ar';
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

declare global {
  interface Window {
    azkarData: {
      [key: string]: Array<{
        category: string;
        count: string;
        description: string;
        reference: string;
        content: string;
      }>;
    };
  }
}