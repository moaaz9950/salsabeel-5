import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'IslamicApp',
  storeName: 'quran_data'
});

// Create separate instances for different types of data
const reciterStore = localforage.createInstance({
  name: "IslamicApp",
  storeName: "reciters"
});

const audioStore = localforage.createInstance({
  name: "IslamicApp",
  storeName: "audio_files"
});

const tafsirStore = localforage.createInstance({
  name: "IslamicApp",
  storeName: "tafsir"
});

const surahStore = localforage.createInstance({
  name: "IslamicApp",
  storeName: "surahs"
});

export async function saveSurah(surah: any) {
  try {
    await surahStore.setItem(`surah_${surah.number}`, {
      data: surah,
      downloadedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving surah:', error);
    return false;
  }
}

export async function getSurah(surahNumber: number) {
  try {
    return await surahStore.getItem(`surah_${surahNumber}`);
  } catch (error) {
    console.error('Error getting surah:', error);
    return null;
  }
}

export async function saveRecitation(surahNumber: number, reciterId: number, audioUrl: string) {
  const key = `recitation_${reciterId}_${surahNumber}`;
  try {
    await audioStore.setItem(key, {
      audioUrl,
      downloadedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving recitation:', error);
    return false;
  }
}

export async function getRecitation(surahNumber: number, reciterId: number) {
  const key = `recitation_${reciterId}_${surahNumber}`;
  try {
    return await audioStore.getItem(key);
  } catch (error) {
    console.error('Error getting recitation:', error);
    return null;
  }
}

export async function saveReciter(reciterId: number, surahNumber: number, audioUrl: string) {
  const key = `reciter_${reciterId}_surah_${surahNumber}`;
  try {
    // First try to download the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error('Failed to download audio');
    
    const audioBlob = await response.blob();
    
    // Save the audio blob
    await audioStore.setItem(key, audioBlob);
    
    // Save metadata
    await reciterStore.setItem(key, {
      reciterId,
      surahNumber,
      originalUrl: audioUrl,
      downloadedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error saving reciter audio:', error);
    return false;
  }
}

export async function getReciterAudio(reciterId: number, surahNumber: number) {
  const key = `reciter_${reciterId}_surah_${surahNumber}`;
  try {
    const audioBlob = await audioStore.getItem(key);
    const metadata = await reciterStore.getItem(key);
    
    if (!audioBlob || !metadata) return null;
    
    return {
      blob: audioBlob,
      url: URL.createObjectURL(audioBlob),
      metadata
    };
  } catch (error) {
    console.error('Error getting reciter audio:', error);
    return null;
  }
}

export async function saveTafsir(surah: number, verse: number, source: string, content: any) {
  const key = `tafsir_${surah}_${verse}_${source}`;
  try {
    await tafsirStore.setItem(key, {
      content,
      downloadedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving tafsir:', error);
    return false;
  }
}

export async function getTafsir(surah: number, verse: number, source: string) {
  const key = `tafsir_${surah}_${verse}_${source}`;
  try {
    return await tafsirStore.getItem(key);
  } catch (error) {
    console.error('Error getting tafsir:', error);
    return null;
  }
}

export async function removeReciterAudio(reciterId: number, surahNumber: number) {
  const key = `reciter_${reciterId}_surah_${surahNumber}`;
  try {
    await audioStore.removeItem(key);
    await reciterStore.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing reciter audio:', error);
    return false;
  }
}

export async function getDownloadedReciters() {
  try {
    const keys = await reciterStore.keys();
    const downloads = await Promise.all(
      keys.map(async (key) => {
        const metadata = await reciterStore.getItem(key);
        return metadata;
      })
    );
    return downloads.filter(Boolean);
  } catch (error) {
    console.error('Error getting downloaded reciters:', error);
    return [];
  }
}

export async function isReciterDownloaded(reciterId: number, surahNumber: number) {
  const key = `reciter_${reciterId}_surah_${surahNumber}`;
  try {
    const metadata = await reciterStore.getItem(key);
    return !!metadata;
  } catch (error) {
    console.error('Error checking reciter download status:', error);
    return false;
  }
}

export async function clearAllData() {
  try {
    await Promise.all([
      reciterStore.clear(),
      audioStore.clear(),
      tafsirStore.clear(),
      surahStore.clear()
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}

export async function getStorageInfo() {
  try {
    const [reciterKeys, audioKeys, tafsirKeys, surahKeys] = await Promise.all([
      reciterStore.keys(),
      audioStore.keys(),
      tafsirStore.keys(),
      surahStore.keys()
    ]);
    
    return {
      reciters: reciterKeys.length,
      audio: audioKeys.length,
      tafsir: tafsirKeys.length,
      surahs: surahKeys.length
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}