import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, Sun, Languages, Star } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

interface HijriDate {
  date: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
    days: number;
  };
  year: string;
  holidays: string[];
}

interface GregorianDate {
  date: string;
  day: string;
  weekday: {
    en: string;
  };
  month: {
    number: number;
    en: string;
  };
  year: string;
}

interface CalendarData {
  hijri: HijriDate;
  gregorian: GregorianDate;
}

// Arabic weekday names
const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ENGLISH_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Arabic month names
const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export default function Calendar() {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [monthData, setMonthData] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'gregorian' | 'hijri'>('hijri');
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');

  useEffect(() => {
    fetchCalendarData();
    fetchMonthData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const formattedDate = format(currentDate, 'dd-MM-yyyy');
      const response = await fetch(`https://api.aladhan.com/v1/gToH/${formattedDate}`);
      const data = await response.json();
      
      if (data.code === 200) {
        setCalendarData(data.data);
        setError(null);
      } else {
        setError('Failed to fetch calendar data');
      }
    } catch (err) {
      setError('Error fetching calendar data');
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthData = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await fetch(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`);
      const data = await response.json();
      
      if (data.code === 200) {
        setMonthData(data.data);
      }
    } catch (err) {
      console.error('Month data fetch error:', err);
    }
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = getDay(start);
    const emptyDays = Array(firstDayOfWeek).fill(null);
    
    return [...emptyDays, ...days];
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getHijriDateForDay = (date: Date | null) => {
    if (!date) return null;
    const dayData = monthData.find(day => {
      const gregorianDate = new Date(day.gregorian.date);
      return gregorianDate.getDate() === date.getDate();
    });
    return dayData?.hijri;
  };

  const getMonthName = () => {
    if (view === 'hijri' && calendarData) {
      return language === 'ar' 
        ? calendarData.hijri.month.ar
        : calendarData.hijri.month.en;
    }
    return format(currentDate, 'MMMM');
  };

  const getYear = () => {
    if (view === 'hijri' && calendarData) {
      return language === 'ar'
        ? calendarData.hijri.year + ' هـ'
        : calendarData.hijri.year + ' AH';
    }
    return format(currentDate, 'yyyy');
  };

  const isHolyDay = (hijriDate: any) => {
    return hijriDate?.holidays && hijriDate.holidays.length > 0;
  };

  const isFriday = (date: Date | null) => {
    return date && date.getDay() === 5;
  };

  return (
    <div className={cn(
      "bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 rounded-2xl shadow-2xl overflow-hidden",
      theme === 'ramadan' ? 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900 dark:via-orange-900 dark:to-yellow-900' : ''
    )}>
      {/* Header with Islamic Pattern */}
      <div className={cn(
        "relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-800 p-6",
        theme === 'ramadan' ? 'from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-800 dark:via-orange-800 dark:to-yellow-800' : ''
      )}>
        {/* Islamic Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <polygon points="10,0 20,10 10,20 0,10" fill="currentColor" />
                <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
          </svg>
        </div>

        <div className="relative flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? 'التقويم الإسلامي' : 'Islamic Calendar'}
              </h2>
              <p className="text-white/80 text-sm">
                {language === 'ar' ? 'التقويم الهجري والميلادي' : 'Hijri & Gregorian Calendar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(lang => lang === 'en' ? 'ar' : 'en')}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
              title="Toggle Language"
            >
              <Languages className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('gregorian')}
              className={cn(
                "p-2 rounded-lg flex items-center gap-1 transition-colors backdrop-blur-sm",
                view === 'gregorian' 
                  ? 'bg-white/30 text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              )}
            >
              <Sun className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">
                {language === 'ar' ? 'ميلادي' : 'Gregorian'}
              </span>
            </button>
            <button
              onClick={() => setView('hijri')}
              className={cn(
                "p-2 rounded-lg flex items-center gap-1 transition-colors backdrop-blur-sm",
                view === 'hijri' 
                  ? 'bg-white/30 text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              )}
            >
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">
                {language === 'ar' ? 'هجري' : 'Hijri'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        </div>
      ) : (
        <div className="p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={previousMonth}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className={cn(
                "text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
                language === 'ar' && "font-arabic"
              )}>
                {getMonthName()} {getYear()}
              </div>
              <div className={cn(
                "text-sm text-slate-500 dark:text-slate-400 mt-1",
                language === 'ar' && "font-arabic"
              )}>
                {view === 'gregorian'
                  ? `${calendarData?.hijri.month.ar || calendarData?.hijri.month.en} ${calendarData?.hijri.year} ${language === 'ar' ? 'هـ' : 'AH'}`
                  : format(currentDate, 'MMMM yyyy')}
              </div>
            </div>

            <button
              onClick={nextMonth}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
              {(language === 'ar' ? ARABIC_WEEKDAYS : ENGLISH_WEEKDAYS).map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    "text-center py-4 font-semibold text-emerald-700 dark:text-emerald-300 border-r border-emerald-200 dark:border-emerald-700 last:border-r-0",
                    language === 'ar' && "font-arabic",
                    index === 5 && "bg-emerald-200 dark:bg-emerald-800/50" // Highlight Friday
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {getDaysInMonth().map((date, index) => {
                const hijriDate = getHijriDateForDay(date);
                const isCurrentDay = isToday(date);
                const isHoly = isHolyDay(hijriDate);
                const isFridayDay = isFriday(date);
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center p-2 border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/50",
                      !date && "bg-slate-50 dark:bg-slate-800/50",
                      isCurrentDay && "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105 z-10 relative",
                      isFridayDay && !isCurrentDay && "bg-emerald-50 dark:bg-emerald-900/20",
                      isHoly && "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30"
                    )}
                  >
                    {date && (
                      <>
                        {/* Gregorian Date */}
                        <div className={cn(
                          "text-lg font-bold",
                          isCurrentDay ? "text-white" : "text-slate-700 dark:text-slate-300",
                          language === 'ar' && "font-arabic"
                        )}>
                          {language === 'ar' ? date.getDate().toLocaleString('ar-SA') : date.getDate()}
                        </div>
                        
                        {/* Hijri Date */}
                        {hijriDate && (
                          <div className={cn(
                            "text-xs",
                            isCurrentDay ? "text-white/90" : "text-slate-500 dark:text-slate-400",
                            language === 'ar' && "font-arabic"
                          )}>
                            {language === 'ar' ? hijriDate.day.toLocaleString('ar-SA') : hijriDate.day}
                          </div>
                        )}
                        
                        {/* Holy Day Indicator */}
                        {isHoly && (
                          <Star className={cn(
                            "w-3 h-3 mt-1",
                            isCurrentDay ? "text-white" : "text-amber-500"
                          )} />
                        )}
                        
                        {/* Friday Indicator */}
                        {isFridayDay && !isCurrentDay && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Information */}
          {calendarData && (
            <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700">
              <div className="text-center space-y-2">
                <h3 className={cn(
                  "text-xl font-bold text-emerald-700 dark:text-emerald-300",
                  language === 'ar' && "font-arabic"
                )}>
                  {language === 'ar' ? 'اليوم' : 'Today'}
                </h3>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow",
                    language === 'ar' && "font-arabic"
                  )}>
                    <CalendarIcon className="w-4 h-4 text-emerald-500" />
                    <span>
                      {language === 'ar' 
                        ? `${calendarData.gregorian.day} ${format(new Date(), 'MMMM yyyy')}`
                        : format(new Date(), 'MMMM d, yyyy')
                      }
                    </span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow",
                    language === 'ar' && "font-arabic"
                  )}>
                    <Moon className="w-4 h-4 text-emerald-500" />
                    <span>
                      {language === 'ar'
                        ? `${calendarData.hijri.day} ${calendarData.hijri.month.ar} ${calendarData.hijri.year} هـ`
                        : `${calendarData.hijri.day} ${calendarData.hijri.month.en} ${calendarData.hijri.year} AH`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Holidays */}
          {calendarData?.hijri.holidays && calendarData.hijri.holidays.length > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-700">
              <h3 className={cn(
                "font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2",
                language === 'ar' && "font-arabic"
              )}>
                <Star className="w-5 h-5" />
                {language === 'ar' ? 'المناسبات الإسلامية' : 'Islamic Holidays'}
              </h3>
              <ul className="space-y-2">
                {calendarData.hijri.holidays.map((holiday, index) => (
                  <li key={index} className={cn(
                    "flex items-center gap-2 text-amber-600 dark:text-amber-400",
                    language === 'ar' && "font-arabic text-right"
                  )}>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    {holiday}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}