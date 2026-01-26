// استيراد ملفات JSON مباشرة - هذه الطريقة تعمل مع Vite
const hadithData = {
  bukhari: () => import('./sahih_bukhari.json').then(m => m.default),
  muslim: () => import('./sahih_muslim.json').then(m => m.default),
  abuDawud: () => import('./sunan_abi_dawud.json').then(m => m.default),
  tirmidhi: () => import('./jami_at_tirmidhi.json').then(m => m.default),
  nasai: () => import('./sunan_an_nasai.json').then(m => m.default),
  ibnMajah: () => import('./sunan_ibn_majah.json').then(m => m.default),
};

export const COLLECTION_CONFIGS = [
  { 
    id: 'bukhari', 
    name: 'Sahih al-Bukhari', 
    arabicName: 'صحيح البخاري',
    loadData: hadithData.bukhari
  },
  { 
    id: 'muslim', 
    name: 'Sahih Muslim', 
    arabicName: 'صحيح مسلم',
    loadData: hadithData.muslim
  },
  { 
    id: 'abu-dawud', 
    name: 'Sunan Abi Dawud', 
    arabicName: 'سنن أبي داود',
    loadData: hadithData.abuDawud
  },
  { 
    id: 'tirmidhi', 
    name: "Jami' at-Tirmidhi", 
    arabicName: 'جامع الترمذي',
    loadData: hadithData.tirmidhi
  },
  { 
    id: 'nasai', 
    name: 'Sunan an-Nasai', 
    arabicName: 'سنن النسائي',
    loadData: hadithData.nasai
  },
  { 
    id: 'ibn-majah', 
    name: 'Sunan Ibn Majah', 
    arabicName: 'سنن ابن ماجه',
    loadData: hadithData.ibnMajah
  }
];