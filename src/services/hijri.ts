// Hijri (Islamic Lunar) Date Utility & Converter

const islamicMonthsEn = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
];

const islamicMonthsUrdu = [
  'محرم الحرام', 'صفر المظفر', 'ربیع الاول', 'ربیع الثانی',
  'جمادی الاول', 'جمادی الثانی', 'رجب المرجب', 'شعبان المعظم',
  'رمضان المبارک', 'شوال المکرم', 'ذی القعدہ', 'ذی الحجہ'
];

// Approximate astronomical lunar algorithm (Kuwaiti algorithm variant)
export function getHijriDate(date: Date = new Date()): { day: number; monthIndex: number; year: number } {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  const b1 = jd - 1948440 + 10632;
  const n = Math.floor((b1 - 1) / 10631);
  const b2 = b1 - 10631 * n + 354;
  const j = (Math.floor((10985 - b2) / 5316)) * (Math.floor((50 * b2) / 17719)) + (Math.floor(b2 / 5670)) * (Math.floor((43 * b2) / 15238));
  const b3 = b2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const mH = Math.floor((24 * b3) / 709);
  const dH = b3 - Math.floor((709 * mH) / 24);
  const yH = 30 * n + j - 30;

  const monthIdx = Math.max(0, Math.min(11, mH - 1));
  return {
    day: Math.max(1, Math.min(30, dH)),
    monthIndex: monthIdx,
    year: yH,
  };
}

export function formatHijriDate(date: Date = new Date(), lang: 'en' | 'ur' = 'en'): string {
  const { day, monthIndex, year } = getHijriDate(date);
  
  if (lang === 'ur') {
    return `${day} ${islamicMonthsUrdu[monthIndex]} ${year}ھ`;
  }
  return `${day} ${islamicMonthsEn[monthIndex]} ${year} AH`;
}
