export interface RamadanState {
  isRamadan: boolean;
  currentDay: number;
  totalDays: number;
  hijriMonth: number;
  hijriYear: number;
}

export interface FastingTime {
  suhoorEnd: Date;
  iftarTime: Date;
  fastingStartsAt: Date;
  nextPrayer: string;
  nextPrayerTime: Date;
}

export function getCurrentRamadanState(): RamadanState {
  const now = new Date();
  const hijri = gregorianToHijri(now);

  const isRamadan = hijri.month === 9;

  return {
    isRamadan,
    currentDay: isRamadan ? hijri.day : 0,
    totalDays: 30,
    hijriMonth: hijri.month,
    hijriYear: hijri.year,
  };
}

export function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor((date.getTime() / 86400000) + 2440588);
  const l = jd + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l2 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l2 + 1)) / 1461001);
  const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l3) / 2447);
  const day = l3 - Math.floor((2447 * j) / 80);
  const l4 = Math.floor(j / 11);
  const month = j + 2 - 12 * l4;
  const year = 100 * (n - 49) + i + l4;

  return { year, month, day };
}

export function hijriToGregorian(year: number, month: number, day: number): Date {
  const n = day + 30 * (month - 1) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) - Math.floor((month - 1) / 11);
  const q = Math.floor(n / 10631);
  const r = n % 10631;
  const a = Math.floor((r + 1) / 325.2425);
  const w = 365 * a + Math.floor(a / 4) - Math.floor(a / 100) + Math.floor(a / 400);
  const q2 = Math.floor((r + 1 - w) / 30.6001);
  const d = Math.floor(r + 1 - w - Math.floor(30.6001 * q2));
  const m = q2 === 14 || q2 === 15 ? q2 - 13 : q2 - 1;
  const y = 400 * q + 100 * a - Math.floor(a / 3) + (m === 1 || m === 2 ? 1 : 0);

  return new Date(y, m - 1, d);
}

export function getIslamicMonthName(month: number): string {
  const months = [
    'Muharram',
    'Safar',
    'Rabi al-awwal',
    'Rabi al-thani',
    'Jumada al-awwal',
    'Jumada al-thani',
    'Rajab',
    "Sha'ban",
    'Ramadan',
    'Shawwal',
    'Dhu al-Qi\'dah',
    'Dhu al-Hijjah'
  ];
  return months[month - 1] || '';
}

export function getLastThirdOfNightStart(fajrTime: Date): Date {
  const midnight = new Date(fajrTime);
  midnight.setHours(0, 0, 0, 0);

  const nextMidnight = new Date(midnight);
  nextMidnight.setDate(nextMidnight.getDate() + 1);

  const nightDuration = nextMidnight.getTime() - midnight.getTime();
  const twoThirdsTime = midnight.getTime() + (nightDuration * 2) / 3;

  return new Date(twoThirdsTime);
}

export function isInLastThirdOfNight(fajrTime: Date): boolean {
  const now = new Date();
  const lastThirdStart = getLastThirdOfNightStart(fajrTime);

  const isBeforeFajr = now < fajrTime;
  const isAfterLastThird = now >= lastThirdStart;

  return isBeforeFajr && isAfterLastThird;
}

export function getRamadanNightName(day: number): string {
  if (day >= 21 && day <= 30) {
    return `Night ${day} (Possible Laylat al-Qadr)`;
  }
  return `Night ${day}`;
}

export function getDaysUntilRamadan(): number {
  const now = new Date();
  const currentHijri = gregorianToHijri(now);

  let nextRamadanHijri = { year: currentHijri.year, month: 9, day: 1 };
  if (currentHijri.month > 9 || (currentHijri.month === 9 && currentHijri.day > 1)) {
    nextRamadanHijri.year += 1;
  }

  const nextRamadanGregorian = hijriToGregorian(nextRamadanHijri.year, nextRamadanHijri.month, nextRamadanHijri.day);
  const daysUntil = Math.ceil((nextRamadanGregorian.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return Math.max(0, daysUntil);
}
