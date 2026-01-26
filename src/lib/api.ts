import { getTafsir, saveTafsir } from './storage';

// Import tafsir data
import arMuyassarData from '../components/tafsir/ar.muyassar.json';
import arJalalaynData from '../components/tafsir/ar.jalalayn.json';
import arQurtubiData from '../components/tafsir/ar.qurtubi.json';
import arMiqbasData from '../components/tafsir/ar.miqbas.json';
import arWaseetData from '../components/tafsir/ar.waseet.json';
import arBaghawiData from '../components/tafsir/ar.baghawi.json';
import idJalalaynData from '../components/tafsir/id.jalalayn.json';

// Import Quran editions data
import douriData from '../components/quran edition/DouriData_v2-0.json';
import hafsData from '../components/quran edition/hafsData_v2-0.json';
import qalounData from '../components/quran edition/QalounData_v2-1.json';
import shubaData from '../components/quran edition/shubaData_v2-0.json';
import sousiData from '../components/quran edition/SousiData_v2-0.json';
import warshData from '../components/quran edition/warshData_v2-1.json';

// API Base URLs
const QURAN_API_BASE = 'https://api.quran.com/api/v4';
const PRAYER_API_BASE = 'https://api.aladhan.com/v1';
const MP3_QURAN_API = 'https://mp3quran.net/api/v3';
const TAFSIR_API_BASE = 'https://api.quran.com/api/v4';

// Local Quran data mapping
const QURAN_DATA = {
  douri: douriData,
  hafs: hafsData,
  qaloun: qalounData,
  shuba: shubaData,
  sousi: sousiData,
  warsh: warshData
};

// Quran editions mapping
export const QURAN_EDITIONS = {
  hafs: {
    id: 'hafs',
    name: 'Hafs',
    arabicName: 'حفص',
    type: 'text',
    direction: 'rtl'
  },
  warsh: {
    id: 'warsh',
    name: 'Warsh',
    arabicName: 'ورش',
    type: 'text',
    direction: 'rtl'
  },
  douri: {
    id: 'douri',
    name: 'Ad-Douri',
    arabicName: 'الدوري',
    type: 'text',
    direction: 'rtl'
  },
  qaloun: {
    id: 'qaloun',
    name: 'Qaloun',
    arabicName: 'قالون',
    type: 'text',
    direction: 'rtl'
  },
  shuba: {
    id: 'shuba',
    name: 'Shuba',
    arabicName: 'شعبة',
    type: 'text',
    direction: 'rtl'
  },
  sousi: {
    id: 'sousi',
    name: 'As-Sousi',
    arabicName: 'السوسي',
    type: 'text',
    direction: 'rtl'
  }
};

// Add local tafsir data mapping
const LOCAL_TAFSIR_DATA = {
  'ar.muyassar': arMuyassarData,
  'ar.jalalayn': arJalalaynData,
  'ar.qurtubi': arQurtubiData,
  'ar.miqbas': arMiqbasData,
  'ar.waseet': arWaseetData,
  'ar.baghawi': arBaghawiData,
  'id.jalalayn': idJalalaynData
};

export const TAFSIR_SOURCES = [
  {
    id: 'ar.muyassar',
    name: 'تفسير المیسر',
    englishName: 'Tafsir Al-Muyassar',
    description: 'تفسير ميسر للقرآن الكريم',
    language: 'ar',
    data: LOCAL_TAFSIR_DATA['ar.muyassar']
  },
  {
    id: 'ar.jalalayn',
    name: 'تفسير الجلالين',
    englishName: 'Tafsir Al-Jalalayn',
    description: 'تفسير موجز للقرآن الكريم كتبه جلال الدين المحلي وجلال الدين السيوطي',
    language: 'ar',
    data: LOCAL_TAFSIR_DATA['ar.jalalayn']
  },
  {
    id: 'ar.qurtubi',
    name: 'تفسير القرطبي',
    englishName: 'Tafsir Al-Qurtubi',
    description: 'مشهور بتركيزه على الأحكام الفقهية المستنبطة من القرآن',
    language: 'ar',
    data: LOCAL_TAFSIR_DATA['ar.qurtubi']
  },
  {
    id: 'ar.miqbas',
    name: 'تنوير المقباس من تفسير بن عباس',
    englishName: 'Tanwir al-Miqbas',
    description: 'تفسير منسوب إلى عبد الله بن عباس رضي الله عنهما',
    language: 'ar',
    data: LOCAL_TAFSIR_DATA['ar.miqbas']
  },
  {
    id: 'ar.waseet',
    name: 'الـتـفـسـيـر الـوسـيـط',
    englishName: 'Tafsir Al-Waseet',
    description: 'تفسير وسط بين المختصر والمطول',
    language: 'ar',
    data: LOCAL_TAFSIR_DATA['ar.waseet']
  },
  {
    id: 'ar.baghawi',
    name: 'تفسير البغوي',
    englishName: 'Tafsir Al-Baghawi',
    description: 'معالم التنزيل في تفسير القرآن للإمام البغوي',
    language: 'ar',
    data: LOCAL_TAFSIR_DATA['ar.baghawi']
  },
  {
    id: 'id.jalalayn',
    name: 'Tafsir Jalalayn',
    englishName: 'Tafsir Jalalayn (Indonesian)',
    description: 'Terjemahan Tafsir Jalalayn dalam Bahasa Indonesia',
    language: 'id',
    data: LOCAL_TAFSIR_DATA['id.jalalayn']
  }
];

export async function fetchSurah(surahNumber: number, edition = 'hafs') {
  try {
    // Get the local data for the selected edition
    const editionData = QURAN_DATA[edition as keyof typeof QURAN_DATA];
    if (!editionData) {
      throw new Error('Invalid Quran edition');
    }

    // Filter verses for the requested surah
    const verses = editionData.filter(verse => verse.sura_no === surahNumber);
    
    if (verses.length === 0) {
      throw new Error('Surah not found');
    }

    // Transform the data to match the expected format
    const surah = {
      number: surahNumber,
      name: verses[0].sura_name_ar,
      englishName: verses[0].sura_name_en,
      revelationType: "Meccan", // This should be determined based on actual data
      verses: verses.map(verse => ({
        number: verse.aya_no,
        text: verse.aya_text,
        numberInSurah: verse.aya_no,
        juz: verse.jozz,
        page: parseInt(verse.page)
      }))
    };

    return {
      code: 200,
      status: "OK",
      data: surah
    };
  } catch (error) {
    console.error('Error fetching surah:', error);
    throw error;
  }
}

export async function fetchTafsir(surah: number, verse: number, source = 'ar.muyassar') {
  try {
    // First try to get from local storage
    const storedTafsir = await getTafsir(surah, verse, source);
    if (storedTafsir && storedTafsir.content && storedTafsir.content.text) {
      return storedTafsir.content;
    }

    // Get the tafsir source configuration
    const tafsirSource = TAFSIR_SOURCES.find(t => t.id === source);
    if (!tafsirSource) {
      throw new Error('Invalid tafsir source');
    }

    // Try to load from local data
    if (tafsirSource.data) {
      const surahData = tafsirSource.data.data.surahs.find((s: any) => s.number === surah);
      if (surahData) {
        const verseData = surahData.ayahs.find((a: any) => a.numberInSurah === verse);
        if (verseData) {
          const tafsirData = {
            text: verseData.text,
            source: source
          };
          
          // Save to local storage
          await saveTafsir(surah, verse, source, tafsirData);
          
          return tafsirData;
        }
      }
    }

    // If no data found, return null instead of empty object
    console.log(`No tafsir found for surah ${surah}, verse ${verse}, source ${source}`);
    return {
      text: '',
      source: source
    };
  } catch (error) {
    console.error('Error fetching Tafsir:', error);
    return {
      text: '',
      source: source
    };
  }
}

export async function fetchAllTafsir(surah: number, verse: number) {
  const results: Record<string, any> = {};
  
  try {
    // Use Promise.allSettled to handle multiple requests gracefully
    const promises = TAFSIR_SOURCES.map(async (source) => {
      try {
        const tafsir = await fetchTafsir(surah, verse, source.id);
        return { sourceId: source.id, tafsir };
      } catch (error) {
        console.error(`Error fetching tafsir for ${source.id}:`, error);
        return { sourceId: source.id, tafsir: { text: '', source: source.id } };
      }
    });

    const settledResults = await Promise.allSettled(promises);
    
    settledResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results[result.value.sourceId] = result.value.tafsir;
      }
    });
  } catch (error) {
    console.error('Error in fetchAllTafsir:', error);
  }
  
  return results;
}

export async function fetchPrayerTimes(latitude: number, longitude: number, method = 3, date?: string) {
  try {
    const formattedDate = date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-');
    const response = await fetch(
      `${PRAYER_API_BASE}/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=${method}&shafaq=general`
    );
    if (!response.ok) throw new Error('Failed to fetch prayer times');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
}

export async function fetchPrayerTimesByAddress(address: string, method = 3, date?: string) {
  try {
    const formattedDate = date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-');
    const response = await fetch(
      `${PRAYER_API_BASE}/timingsByAddress/${formattedDate}?address=${encodeURIComponent(address)}&method=${method}&shafaq=general`
    );
    if (!response.ok) throw new Error('Failed to fetch prayer times');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching prayer times by address:', error);
    throw error;
  }
}

export async function fetchRadioStations() {
  try {
    const response = await fetch('https://islamic-radio.vercel.app/islamic-radio.json');
    if (!response.ok) throw new Error('Failed to fetch radio stations');
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching radio stations:', error);
    throw error;
  }
}

export async function fetchReciters() {
  try {
    const response = await fetch('https://reciter-alpha.vercel.app/islamic_reciter.json');
    if (!response.ok) throw new Error('Failed to fetch reciters');
    const data = await response.json();
    
    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else if (data && Array.isArray(data.reciters)) {
      return data.reciters;
    } else {
      console.warn('Unexpected reciters API response structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching reciters:', error);
    return [];
  }
}

// Filter reciters based on the selected Quran edition
export function filterRecitersByEdition(reciters: any[], edition: string) {
  if (!reciters || reciters.length === 0) return [];
  
  return reciters.filter(reciter => {
    // Check if reciter has moshaf data
    if (!reciter.moshaf || !Array.isArray(reciter.moshaf)) {
      return false;
    }
    
    // Check if any moshaf supports the selected edition
    return reciter.moshaf.some((moshaf: any) => {
      const moshafName = (moshaf.name || '').toLowerCase();
      const editionLower = edition.toLowerCase();
      
      // Map edition names to possible moshaf names
      switch (editionLower) {
        case 'hafs':
          return moshafName.includes('hafs') || 
                 moshafName.includes('حفص') ||
                 moshafName.includes('عاصم');
        case 'warsh':
          return moshafName.includes('warsh') || 
                 moshafName.includes('ورش') ||
                 moshafName.includes('نافع');
        case 'qaloun':
          return moshafName.includes('qaloun') || 
                 moshafName.includes('قالون') ||
                 moshafName.includes('نافع');
        case 'douri':
          return moshafName.includes('douri') || 
                 moshafName.includes('الدوري') ||
                 moshafName.includes('أبو عمرو');
        case 'shuba':
          return moshafName.includes('shuba') || 
                 moshafName.includes('شعبة') ||
                 moshafName.includes('عاصم');
        case 'sousi':
          return moshafName.includes('sousi') || 
                 moshafName.includes('السوسي') ||
                 moshafName.includes('أبو عمرو');
        default:
          return true; // If edition not recognized, show all reciters
      }
    });
  });
}

// Get the appropriate moshaf for a reciter based on edition
export function getReciterMoshafForEdition(reciter: any, edition: string) {
  if (!reciter.moshaf || !Array.isArray(reciter.moshaf)) {
    return reciter.moshaf?.[0] || null;
  }
  
  const editionLower = edition.toLowerCase();
  
  // Find the best matching moshaf for the edition
  const matchingMoshaf = reciter.moshaf.find((moshaf: any) => {
    const moshafName = (moshaf.name || '').toLowerCase();
    
    switch (editionLower) {
      case 'hafs':
        return moshafName.includes('hafs') || 
               moshafName.includes('حفص') ||
               moshafName.includes('عاصم');
      case 'warsh':
        return moshafName.includes('warsh') || 
               moshafName.includes('ورش') ||
               moshafName.includes('نافع');
      case 'qaloun':
        return moshafName.includes('qaloun') || 
               moshafName.includes('قالون') ||
               moshafName.includes('نافع');
      case 'douri':
        return moshafName.includes('douri') || 
               moshafName.includes('الدوري') ||
               moshafName.includes('أبو عمرو');
      case 'shuba':
        return moshafName.includes('shuba') || 
               moshafName.includes('شعبة') ||
               moshafName.includes('عاصم');
      case 'sousi':
        return moshafName.includes('sousi') || 
               moshafName.includes('السوسي') ||
               moshafName.includes('أبو عمرو');
      default:
        return false;
    }
  });
  
  // Return the matching moshaf or the first one as fallback
  return matchingMoshaf || reciter.moshaf[0];
}

export async function fetchReciterSurah(reciterId: number, surahNumber: number) {
  try {
    // Get reciter info from API
    const response = await fetch('https://reciter-alpha.vercel.app/islamic_reciter.json');
    if (!response.ok) throw new Error('Failed to fetch reciter info');
    
    const data = await response.json();
    
    // Handle different response structures for finding reciter
    let reciters = [];
    if (Array.isArray(data)) {
      reciters = data;
    } else if (data && Array.isArray(data.data)) {
      reciters = data.data;
    } else if (data && Array.isArray(data.reciters)) {
      reciters = data.reciters;
    } else {
      throw new Error('Invalid reciters data structure');
    }
    
    const reciter = reciters.find((r: any) => r.id === reciterId);
    
    if (!reciter) throw new Error('Reciter not found');
    
    // Get the first available moshaf (we'll improve this with edition filtering)
    const moshaf = reciter.moshaf?.[0];
    if (!moshaf) throw new Error('No moshaf available for this reciter');
    
    // Construct the audio URL based on moshaf server and surah number
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const audioUrl = `${moshaf.server}/${paddedSurah}.mp3`;
    
    return {
      audio_files: [{
        verse_key: `${surahNumber}:1`,
        audio_url: audioUrl,
        segments: [],
        duration: 0,
        format: 'mp3',
        moshaf_info: {
          id: moshaf.id,
          name: moshaf.name,
          server: moshaf.server
        }
      }]
    };
  } catch (error) {
    console.error('Error fetching recitation:', error);
    throw error;
  }
}

// Enhanced version that takes edition into account
export async function fetchReciterSurahForEdition(reciterId: number, surahNumber: number, edition: string = 'hafs') {
  try {
    // Get reciter info from API
    const response = await fetch('https://reciter-alpha.vercel.app/islamic_reciter.json');
    if (!response.ok) throw new Error('Failed to fetch reciter info');
    
    const data = await response.json();
    
    // Handle different response structures for finding reciter
    let reciters = [];
    if (Array.isArray(data)) {
      reciters = data;
    } else if (data && Array.isArray(data.data)) {
      reciters = data.data;
    } else if (data && Array.isArray(data.reciters)) {
      reciters = data.reciters;
    } else {
      throw new Error('Invalid reciters data structure');
    }
    
    const reciter = reciters.find((r: any) => r.id === reciterId);
    
    if (!reciter) throw new Error('Reciter not found');
    
    // Get the appropriate moshaf for the selected edition
    const moshaf = getReciterMoshafForEdition(reciter, edition);
    if (!moshaf) throw new Error(`No moshaf available for ${edition} edition`);
    
    // Construct the audio URL based on moshaf server and surah number
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const audioUrl = `${moshaf.server}/${paddedSurah}.mp3`;
    
    return {
      audio_files: [{
        verse_key: `${surahNumber}:1`,
        audio_url: audioUrl,
        segments: [],
        duration: 0,
        format: 'mp3',
        moshaf_info: {
          id: moshaf.id,
          name: moshaf.name,
          server: moshaf.server,
          edition: edition
        }
      }]
    };
  } catch (error) {
    console.error('Error fetching recitation for edition:', error);
    throw error;
  }
}