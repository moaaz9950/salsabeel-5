import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// Complete list of Asma Al-Husna (99 Names of Allah)
const ASMA_AL_HUSNA = [
  { number: 1, name: "الرَّحْمَنُ", transliteration: "Ar-Rahman", meaning: "The Most Gracious" },
  { number: 2, name: "الرَّحِيمُ", transliteration: "Ar-Raheem", meaning: "The Most Merciful" },
  { number: 3, name: "الْمَلِكُ", transliteration: "Al-Malik", meaning: "The King, The Sovereign" },
  { number: 4, name: "الْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Most Holy" },
  { number: 5, name: "السَّلاَمُ", transliteration: "As-Salaam", meaning: "The Source of Peace" },
  { number: 6, name: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning: "The Guardian of Faith" },
  { number: 7, name: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaning: "The Protector" },
  { number: 8, name: "الْعَزِيزُ", transliteration: "Al-Azeez", meaning: "The Mighty" },
  { number: 9, name: "الْجَبَّارُ", transliteration: "Al-Jabbaar", meaning: "The Compeller" },
  { number: 10, name: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaning: "The Greatest" },
  { number: 11, name: "الْخَالِقُ", transliteration: "Al-Khaaliq", meaning: "The Creator" },
  { number: 12, name: "الْبَارِئُ", transliteration: "Al-Baari", meaning: "The Maker of Order" },
  { number: 13, name: "الْمُصَوِّرُ", transliteration: "Al-Musawwir", meaning: "The Shaper of Beauty" },
  { number: 14, name: "الْغَفَّارُ", transliteration: "Al-Ghaffaar", meaning: "The Forgiving" },
  { number: 15, name: "الْقَهَّارُ", transliteration: "Al-Qahhaar", meaning: "The Subduer" },
  { number: 16, name: "الْوَهَّابُ", transliteration: "Al-Wahhaab", meaning: "The Giver of All" },
  { number: 17, name: "الرَّزَّاقُ", transliteration: "Ar-Razzaaq", meaning: "The Sustainer" },
  { number: 18, name: "الْفَتَّاحُ", transliteration: "Al-Fattaah", meaning: "The Opener" },
  { number: 19, name: "اَلْعَلِيْمُ", transliteration: "Al-'Aleem", meaning: "The Knower of All" },
  { number: 20, name: "الْقَابِضُ", transliteration: "Al-Qaabid", meaning: "The Constrictor" },
  { number: 21, name: "الْبَاسِطُ", transliteration: "Al-Baasit", meaning: "The Reliever" },
  { number: 22, name: "الْخَافِضُ", transliteration: "Al-Khaafid", meaning: "The Abaser" },
  { number: 23, name: "الرَّافِعُ", transliteration: "Ar-Raafi'", meaning: "The Exalter" },
  { number: 24, name: "الْمُعِزُّ", transliteration: "Al-Mu'iz", meaning: "The Bestower of Honors" },
  { number: 25, name: "المُذِلُّ", transliteration: "Al-Mudhil", meaning: "The Humiliator" },
  { number: 26, name: "السَّمِيعُ", transliteration: "As-Samee'", meaning: "The Hearer of All" },
  { number: 27, name: "الْبَصِيرُ", transliteration: "Al-Baseer", meaning: "The Seer of All" },
  { number: 28, name: "الْحَكَمُ", transliteration: "Al-Hakam", meaning: "The Judge" },
  { number: 29, name: "الْعَدْلُ", transliteration: "Al-'Adl", meaning: "The Just" },
  { number: 30, name: "اللَّطِيفُ", transliteration: "Al-Lateef", meaning: "The Subtle One" },
  { number: 31, name: "الْخَبِيرُ", transliteration: "Al-Khabeer", meaning: "The All-Aware" },
  { number: 32, name: "الْحَلِيمُ", transliteration: "Al-Haleem", meaning: "The Forbearing" },
  { number: 33, name: "الْعَظِيمُ", transliteration: "Al-'Azeem", meaning: "The Magnificent" },
  { number: 34, name: "الْغَفُورُ", transliteration: "Al-Ghafoor", meaning: "The Forgiver" },
  { number: 35, name: "الشَّكُورُ", transliteration: "Ash-Shakoor", meaning: "The Rewarder of Thankfulness" },
  { number: 36, name: "الْعَلِيُّ", transliteration: "Al-'Aliyy", meaning: "The Highest" },
  { number: 37, name: "الْكَبِيرُ", transliteration: "Al-Kabeer", meaning: "The Greatest" },
  { number: 38, name: "الْحَفِيظُ", transliteration: "Al-Hafeez", meaning: "The Preserver" },
  { number: 39, name: "المُقيِت", transliteration: "Al-Muqeet", meaning: "The Nourisher" },
  { number: 40, name: "الْحسِيبُ", transliteration: "Al-Haseeb", meaning: "The Reckoner" },
  { number: 41, name: "الْجَلِيلُ", transliteration: "Al-Jaleel", meaning: "The Majestic" },
  { number: 42, name: "الْكَرِيمُ", transliteration: "Al-Kareem", meaning: "The Generous" },
  { number: 43, name: "الرَّقِيبُ", transliteration: "Ar-Raqeeb", meaning: "The Watchful One" },
  { number: 44, name: "الْمُجِيبُ", transliteration: "Al-Mujeeb", meaning: "The Responder to Prayer" },
  { number: 45, name: "الْوَاسِعُ", transliteration: "Al-Waasi'", meaning: "The All-Comprehending" },
  { number: 46, name: "الْحَكِيمُ", transliteration: "Al-Hakeem", meaning: "The Perfectly Wise" },
  { number: 47, name: "الْوَدُودُ", transliteration: "Al-Wadood", meaning: "The Loving One" },
  { number: 48, name: "الْمَجِيدُ", transliteration: "Al-Majeed", meaning: "The Most Glorious One" },
  { number: 49, name: "الْبَاعِثُ", transliteration: "Al-Baa'ith", meaning: "The Resurrector" },
  { number: 50, name: "الشَّهِيدُ", transliteration: "Ash-Shaheed", meaning: "The Witness" },
  { number: 51, name: "الْحَقُّ", transliteration: "Al-Haqq", meaning: "The Truth" },
  { number: 52, name: "الْوَكِيلُ", transliteration: "Al-Wakeel", meaning: "The Trustee" },
  { number: 53, name: "الْقَوِيُّ", transliteration: "Al-Qawiyy", meaning: "The Possessor of All Strength" },
  { number: 54, name: "الْمَتِينُ", transliteration: "Al-Mateen", meaning: "The Forceful One" },
  { number: 55, name: "الْوَلِيُّ", transliteration: "Al-Waliyy", meaning: "The Protector" },
  { number: 56, name: "الْحَمِيدُ", transliteration: "Al-Hameed", meaning: "The Praised One" },
  { number: 57, name: "الْمُحْصِي", transliteration: "Al-Muhsi", meaning: "The Appraiser" },
  { number: 58, name: "الْمُبْدِئُ", transliteration: "Al-Mubdi", meaning: "The Originator" },
  { number: 59, name: "الْمُعِيدُ", transliteration: "Al-Mu'eed", meaning: "The Restorer" },
  { number: 60, name: "الْمُحْيِي", transliteration: "Al-Muhyee", meaning: "The Giver of Life" },
  { number: 61, name: "اَلْمُمِيتُ", transliteration: "Al-Mumeet", meaning: "The Taker of Life" },
  { number: 62, name: "الْحَيُّ", transliteration: "Al-Hayy", meaning: "The Ever Living" },
  { number: 63, name: "الْقَيُّومُ", transliteration: "Al-Qayyoom", meaning: "The Self-Existing" },
  { number: 64, name: "الْوَاجِدُ", transliteration: "Al-Waajid", meaning: "The Finder" },
  { number: 65, name: "الْمَاجِدُ", transliteration: "Al-Maajid", meaning: "The Glorious" },
  { number: 66, name: "الْواحِدُ", transliteration: "Al-Waahid", meaning: "The Only One" },
  { number: 67, name: "اَلاَحَدُ", transliteration: "Al-Ahad", meaning: "The One" },
  { number: 68, name: "الصَّمَدُ", transliteration: "As-Samad", meaning: "The Supreme Provider" },
  { number: 69, name: "الْقَادِرُ", transliteration: "Al-Qaadir", meaning: "The Powerful" },
  { number: 70, name: "الْمُقْتَدِرُ", transliteration: "Al-Muqtadir", meaning: "The Creator of All Power" },
  { number: 71, name: "الْمُقَدِّمُ", transliteration: "Al-Muqaddim", meaning: "The Expediter" },
  { number: 72, name: "الْمُؤَخِّرُ", transliteration: "Al-Mu'akhkhir", meaning: "The Delayer" },
  { number: 73, name: "الأوَّلُ", transliteration: "Al-Awwal", meaning: "The First" },
  { number: 74, name: "الآخِرُ", transliteration: "Al-Aakhir", meaning: "The Last" },
  { number: 75, name: "الظَّاهِرُ", transliteration: "Az-Zaahir", meaning: "The Manifest One" },
  { number: 76, name: "الْبَاطِنُ", transliteration: "Al-Baatin", meaning: "The Hidden One" },
  { number: 77, name: "الْوَالِي", transliteration: "Al-Waali", meaning: "The Governor" },
  { number: 78, name: "الْمُتَعَالِي", transliteration: "Al-Muta'ali", meaning: "The Supreme One" },
  { number: 79, name: "الْبَرُّ", transliteration: "Al-Barr", meaning: "The Doer of Good" },
  { number: 80, name: "التَّوَابُ", transliteration: "At-Tawwaab", meaning: "The Guide to Repentance" },
  { number: 81, name: "الْمُنْتَقِمُ", transliteration: "Al-Muntaqim", meaning: "The Avenger" },
  { number: 82, name: "العَفُوُّ", transliteration: "Al-'Afuww", meaning: "The Forgiver" },
  { number: 83, name: "الرَّؤُوفُ", transliteration: "Ar-Ra'oof", meaning: "The Clement" },
  { number: 84, name: "مَالِكُ الْمُلْكِ", transliteration: "Maalik-ul-Mulk", meaning: "The Owner of All" },
  { number: 85, name: "ذُوالْجَلاَلِ وَالإكْرَامِ", transliteration: "Dhul-Jalaali wal-Ikraam", meaning: "The Lord of Majesty and Bounty" },
  { number: 86, name: "الْمُقْسِطُ", transliteration: "Al-Muqsit", meaning: "The Equitable One" },
  { number: 87, name: "الْجَامِعُ", transliteration: "Al-Jaami'", meaning: "The Gatherer" },
  { number: 88, name: "الْغَنِيُّ", transliteration: "Al-Ghaniyy", meaning: "The Rich One" },
  { number: 89, name: "الْمُغْنِي", transliteration: "Al-Mughni", meaning: "The Enricher" },
  { number: 90, name: "المانِع", transliteration: "Al-Mani'", meaning: "The Preventer of Harm" },
  { number: 91, name: "الضَّارَّ", transliteration: "Ad-Daarr", meaning: "The Creator of The Harmful" },
  { number: 92, name: "النَّافِعُ", transliteration: "An-Nafi'", meaning: "The Creator of Good" },
  { number: 93, name: "النُّورُ", transliteration: "An-Nur", meaning: "The Light" },
  { number: 94, name: "الْهَادِي", transliteration: "Al-Haadi", meaning: "The Guide" },
  { number: 95, name: "الْبَدِيعُ", transliteration: "Al-Badi'", meaning: "The Originator" },
  { number: 96, name: "اَلْبَاقِي", transliteration: "Al-Baaqi", meaning: "The Everlasting One" },
  { number: 97, name: "الْوَارِثُ", transliteration: "Al-Waarith", meaning: "The Inheritor of All" },
  { number: 98, name: "الرَّشِيدُ", transliteration: "Ar-Rasheed", meaning: "The Righteous Teacher" },
  { number: 99, name: "الصَّبُورُ", transliteration: "As-Saboor", meaning: "The Patient One" }
];

export default function AsmaAlHusna() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favoriteNames');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const itemsPerPage = 10;
  
  // Filter names based on search and favorites
  const filteredNames = ASMA_AL_HUSNA.filter(name => {
    const matchesSearch = 
      name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFavorites = !showFavoritesOnly || favorites.includes(name.number);
    
    return matchesSearch && matchesFavorites;
  });
  
  const totalPages = Math.ceil(filteredNames.length / itemsPerPage);
  const currentNames = filteredNames.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );
  
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const toggleFavorite = (number: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number];
      
      localStorage.setItem('favoriteNames', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Asma Al-Husna (99 Names of Allah)</h2>
      
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or meaning..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0); // Reset to first page on search
            }}
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-none"
          />
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setCurrentPage(0); // Reset to first page when toggling favorites
            }}
            className="rounded text-emerald-500"
          />
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'text-red-500 fill-red-500' : ''}`} />
          <span className="text-sm">Favorites only</span>
        </label>
      </div>
      
      {currentNames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No names found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          {currentNames.map((name) => (
            <div 
              key={name.number}
              className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {name.number}
                  </span>
                  <h3 className="font-arabic text-xl">{name.name}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{name.transliteration}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{name.meaning}</p>
              </div>
              <button
                onClick={() => toggleFavorite(name.number)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                <Heart 
                  className={`w-5 h-5 ${
                    favorites.includes(name.number) 
                      ? 'text-red-500 fill-red-500' 
                      : ''
                  }`} 
                />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {filteredNames.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
              currentPage === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
              currentPage >= totalPages - 1 
                ? 'opacity-50 cursor-not-allowed' 
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}