// Full Holy Quran Engine & Dataset with All 30 Parts, 114 Surahs, Rukus, and Verses

export interface Ayah {
  id: number;
  text: string;
  juz: number;
  ruku: number;
  surahRuku: number;
  isRukuStart?: boolean;
  isRukuEnd?: boolean;
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  translation?: string;
  type: 'Meccan' | 'Medinan';
  totalVerses: number;
  totalRukus: number;
  verses: Ayah[];
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  translation?: string;
  type: 'Meccan' | 'Medinan';
  totalVerses: number;
  totalRukus: number;
  startJuz: number;
  endJuz: number;
}

export interface Parah {
  number: number;
  nameArabic: string;
  nameTranslit: string;
  nameUrdu: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  totalVerses: number;
  totalRukus: number;
}

export const QURAN_PARAHS: Parah[] = [
  {
    "number": 1,
    "nameArabic": "الم",
    "nameTranslit": "Alif Lam Meem",
    "nameUrdu": "الم",
    "startSurah": 1,
    "startAyah": 1,
    "endSurah": 2,
    "endAyah": 141,
    "totalVerses": 148,
    "totalRukus": 17
  },
  {
    "number": 2,
    "nameArabic": "سَيَقُولُ",
    "nameTranslit": "Sayaqool",
    "nameUrdu": "سیقول",
    "startSurah": 2,
    "startAyah": 142,
    "endSurah": 2,
    "endAyah": 252,
    "totalVerses": 111,
    "totalRukus": 16
  },
  {
    "number": 3,
    "nameArabic": "تِلْكَ الرُّسُلُ",
    "nameTranslit": "Tilkar Rusul",
    "nameUrdu": "تلک الرسل",
    "startSurah": 2,
    "startAyah": 253,
    "endSurah": 3,
    "endAyah": 92,
    "totalVerses": 126,
    "totalRukus": 17
  },
  {
    "number": 4,
    "nameArabic": "لَنْ تَنَالُوا",
    "nameTranslit": "Lan Tanaaloo",
    "nameUrdu": "لن تنالوا",
    "startSurah": 3,
    "startAyah": 93,
    "endSurah": 4,
    "endAyah": 23,
    "totalVerses": 131,
    "totalRukus": 15
  },
  {
    "number": 5,
    "nameArabic": "وَالْمُحْصَنَاتُ",
    "nameTranslit": "Wal Muhsanat",
    "nameUrdu": "والمحصنات",
    "startSurah": 4,
    "startAyah": 24,
    "endSurah": 4,
    "endAyah": 147,
    "totalVerses": 124,
    "totalRukus": 16
  },
  {
    "number": 6,
    "nameArabic": "لَا يُحِبُّ اللَّهُ",
    "nameTranslit": "La Yuhibbullah",
    "nameUrdu": "لا یحب اللہ",
    "startSurah": 4,
    "startAyah": 148,
    "endSurah": 5,
    "endAyah": 81,
    "totalVerses": 110,
    "totalRukus": 17
  },
  {
    "number": 7,
    "nameArabic": "وَإِذَا سَمِعُوا",
    "nameTranslit": "Wa Iza Sami’oo",
    "nameUrdu": "واذا سمعوا",
    "startSurah": 5,
    "startAyah": 82,
    "endSurah": 6,
    "endAyah": 110,
    "totalVerses": 149,
    "totalRukus": 19
  },
  {
    "number": 8,
    "nameArabic": "وَلَوْ أَنَّنَا",
    "nameTranslit": "Wa Law Annana",
    "nameUrdu": "ولو اننا",
    "startSurah": 6,
    "startAyah": 111,
    "endSurah": 7,
    "endAyah": 87,
    "totalVerses": 142,
    "totalRukus": 19
  },
  {
    "number": 9,
    "nameArabic": "قَالَ الْمَلَأُ",
    "nameTranslit": "Qalal Mala’o",
    "nameUrdu": "قال الملاء",
    "startSurah": 7,
    "startAyah": 88,
    "endSurah": 8,
    "endAyah": 40,
    "totalVerses": 159,
    "totalRukus": 18
  },
  {
    "number": 10,
    "nameArabic": "وَاعْلَمُوا",
    "nameTranslit": "Wa’lamoo",
    "nameUrdu": "واعلموا",
    "startSurah": 8,
    "startAyah": 41,
    "endSurah": 9,
    "endAyah": 92,
    "totalVerses": 127,
    "totalRukus": 17
  },
  {
    "number": 11,
    "nameArabic": "يَعْتَذِرُونَ",
    "nameTranslit": "Ya’taziroona",
    "nameUrdu": "یعتذرون",
    "startSurah": 9,
    "startAyah": 93,
    "endSurah": 11,
    "endAyah": 5,
    "totalVerses": 151,
    "totalRukus": 19
  },
  {
    "number": 12,
    "nameArabic": "وَمَا مِنْ دَابَّةٍ",
    "nameTranslit": "Wa Mamin Da’abbah",
    "nameUrdu": "وما من دابۃ",
    "startSurah": 11,
    "startAyah": 6,
    "endSurah": 12,
    "endAyah": 52,
    "totalVerses": 170,
    "totalRukus": 16
  },
  {
    "number": 13,
    "nameArabic": "وَمَا أُبَرِّئُ",
    "nameTranslit": "Wa Ma Ubarri’o",
    "nameUrdu": "وما ابری",
    "startSurah": 12,
    "startAyah": 53,
    "endSurah": 14,
    "endAyah": 52,
    "totalVerses": 154,
    "totalRukus": 18
  },
  {
    "number": 14,
    "nameArabic": "رُبَمَا",
    "nameTranslit": "Rubama",
    "nameUrdu": "ربما",
    "startSurah": 15,
    "startAyah": 1,
    "endSurah": 16,
    "endAyah": 128,
    "totalVerses": 227,
    "totalRukus": 22
  },
  {
    "number": 15,
    "nameArabic": "سُبْحَانَ الَّذِي",
    "nameTranslit": "Subhanallazi",
    "nameUrdu": "سبحان الذی",
    "startSurah": 17,
    "startAyah": 1,
    "endSurah": 18,
    "endAyah": 74,
    "totalVerses": 185,
    "totalRukus": 24
  },
  {
    "number": 16,
    "nameArabic": "قَالَ أَلَمْ",
    "nameTranslit": "Qala Alam",
    "nameUrdu": "قال الم",
    "startSurah": 18,
    "startAyah": 75,
    "endSurah": 20,
    "endAyah": 135,
    "totalVerses": 269,
    "totalRukus": 20
  },
  {
    "number": 17,
    "nameArabic": "اقْتَرَبَ لِلنَّاسِ",
    "nameTranslit": "Iqtaraba Linnas",
    "nameUrdu": "اقترب للناس",
    "startSurah": 21,
    "startAyah": 1,
    "endSurah": 22,
    "endAyah": 78,
    "totalVerses": 190,
    "totalRukus": 17
  },
  {
    "number": 18,
    "nameArabic": "قَدْ أَفْلَحَ",
    "nameTranslit": "Qad Aflaha",
    "nameUrdu": "قد افلح",
    "startSurah": 23,
    "startAyah": 1,
    "endSurah": 24,
    "endAyah": 64,
    "totalVerses": 202,
    "totalRukus": 15
  },
  {
    "number": 19,
    "nameArabic": "وَقَالَ الَّذِينَ",
    "nameTranslit": "Wa Qalallazeena",
    "nameUrdu": "وقال الذین",
    "startSurah": 25,
    "startAyah": 21,
    "endSurah": 27,
    "endAyah": 55,
    "totalVerses": 339,
    "totalRukus": 18
  },
  {
    "number": 20,
    "nameArabic": "أَمَّنْ خَلَقَ",
    "nameTranslit": "Amman Khalaqa",
    "nameUrdu": "امن خلق",
    "startSurah": 27,
    "startAyah": 56,
    "endSurah": 29,
    "endAyah": 45,
    "totalVerses": 171,
    "totalRukus": 17
  },
  {
    "number": 21,
    "nameArabic": "اتْلُ مَا أُوحِيَ",
    "nameTranslit": "Utlu Ma Oohiya",
    "nameUrdu": "اتل ما اوحی",
    "startSurah": 29,
    "startAyah": 46,
    "endSurah": 33,
    "endAyah": 30,
    "totalVerses": 178,
    "totalRukus": 17
  },
  {
    "number": 22,
    "nameArabic": "وَمَنْ يَقْنُتْ",
    "nameTranslit": "Wa Man Yaqnut",
    "nameUrdu": "ومن یقنت",
    "startSurah": 33,
    "startAyah": 31,
    "endSurah": 36,
    "endAyah": 27,
    "totalVerses": 169,
    "totalRukus": 17
  },
  {
    "number": 23,
    "nameArabic": "وَمَا لِيَ",
    "nameTranslit": "Wa Maliya",
    "nameUrdu": "وما لی",
    "startSurah": 36,
    "startAyah": 28,
    "endSurah": 39,
    "endAyah": 31,
    "totalVerses": 357,
    "totalRukus": 20
  },
  {
    "number": 24,
    "nameArabic": "فَمَنْ أَظْلَمُ",
    "nameTranslit": "Faman Azlamu",
    "nameUrdu": "فمن اظلم",
    "startSurah": 39,
    "startAyah": 32,
    "endSurah": 41,
    "endAyah": 46,
    "totalVerses": 175,
    "totalRukus": 17
  },
  {
    "number": 25,
    "nameArabic": "إِلَيْهِ يُرَدُّ",
    "nameTranslit": "Ilayhi Yuraddu",
    "nameUrdu": "الیہ یرد",
    "startSurah": 41,
    "startAyah": 47,
    "endSurah": 45,
    "endAyah": 37,
    "totalVerses": 246,
    "totalRukus": 20
  },
  {
    "number": 26,
    "nameArabic": "حم",
    "nameTranslit": "Ha’a Meem",
    "nameUrdu": "حم",
    "startSurah": 46,
    "startAyah": 1,
    "endSurah": 51,
    "endAyah": 30,
    "totalVerses": 195,
    "totalRukus": 18
  },
  {
    "number": 27,
    "nameArabic": "قَالَ فَمَا خَطْبُكُمْ",
    "nameTranslit": "Qala Fama Khatbukum",
    "nameUrdu": "قال فما خطبکم",
    "startSurah": 51,
    "startAyah": 31,
    "endSurah": 57,
    "endAyah": 29,
    "totalVerses": 399,
    "totalRukus": 18
  },
  {
    "number": 28,
    "nameArabic": "قَدْ سَمِعَ اللَّهُ",
    "nameTranslit": "Qad Sami’allahu",
    "nameUrdu": "قد سمع اللہ",
    "startSurah": 58,
    "startAyah": 1,
    "endSurah": 66,
    "endAyah": 12,
    "totalVerses": 137,
    "totalRukus": 21
  },
  {
    "number": 29,
    "nameArabic": "تَبَارَكَ الَّذِي",
    "nameTranslit": "Tabarakallazi",
    "nameUrdu": "تبارک الذی",
    "startSurah": 67,
    "startAyah": 1,
    "endSurah": 77,
    "endAyah": 50,
    "totalVerses": 431,
    "totalRukus": 22
  },
  {
    "number": 30,
    "nameArabic": "عَمَّ يَتَسَاءَلُونَ",
    "nameTranslit": "Amma Yatasa’aloon",
    "nameUrdu": "عم یتساءلون",
    "startSurah": 78,
    "startAyah": 1,
    "endSurah": 114,
    "endAyah": 6,
    "totalVerses": 564,
    "totalRukus": 39
  }
];

export const QURAN_SURAHS_META: SurahMeta[] = [
  {
    "number": 1,
    "nameArabic": "الفاتحة",
    "nameEnglish": "Al-Fatihah",
    "type": "Meccan",
    "totalVerses": 7,
    "totalRukus": 1,
    "startJuz": 1,
    "endJuz": 1
  },
  {
    "number": 2,
    "nameArabic": "البقرة",
    "nameEnglish": "Al-Baqarah",
    "type": "Medinan",
    "totalVerses": 286,
    "totalRukus": 40,
    "startJuz": 1,
    "endJuz": 3
  },
  {
    "number": 3,
    "nameArabic": "آل عمران",
    "nameEnglish": "Ali 'Imran",
    "type": "Medinan",
    "totalVerses": 200,
    "totalRukus": 20,
    "startJuz": 3,
    "endJuz": 4
  },
  {
    "number": 4,
    "nameArabic": "النساء",
    "nameEnglish": "An-Nisa",
    "type": "Medinan",
    "totalVerses": 176,
    "totalRukus": 24,
    "startJuz": 4,
    "endJuz": 6
  },
  {
    "number": 5,
    "nameArabic": "المائدة",
    "nameEnglish": "Al-Ma'idah",
    "type": "Medinan",
    "totalVerses": 120,
    "totalRukus": 16,
    "startJuz": 6,
    "endJuz": 7
  },
  {
    "number": 6,
    "nameArabic": "الأنعام",
    "nameEnglish": "Al-An'am",
    "type": "Meccan",
    "totalVerses": 165,
    "totalRukus": 20,
    "startJuz": 7,
    "endJuz": 8
  },
  {
    "number": 7,
    "nameArabic": "الأعراف",
    "nameEnglish": "Al-A'raf",
    "type": "Meccan",
    "totalVerses": 206,
    "totalRukus": 24,
    "startJuz": 8,
    "endJuz": 9
  },
  {
    "number": 8,
    "nameArabic": "الأنفال",
    "nameEnglish": "Al-Anfal",
    "type": "Medinan",
    "totalVerses": 75,
    "totalRukus": 10,
    "startJuz": 9,
    "endJuz": 10
  },
  {
    "number": 9,
    "nameArabic": "التوبة",
    "nameEnglish": "At-Tawbah",
    "type": "Medinan",
    "totalVerses": 129,
    "totalRukus": 16,
    "startJuz": 10,
    "endJuz": 11
  },
  {
    "number": 10,
    "nameArabic": "يونس",
    "nameEnglish": "Yunus",
    "type": "Meccan",
    "totalVerses": 109,
    "totalRukus": 11,
    "startJuz": 11,
    "endJuz": 11
  },
  {
    "number": 11,
    "nameArabic": "هود",
    "nameEnglish": "Hud",
    "type": "Meccan",
    "totalVerses": 123,
    "totalRukus": 10,
    "startJuz": 11,
    "endJuz": 12
  },
  {
    "number": 12,
    "nameArabic": "يوسف",
    "nameEnglish": "Yusuf",
    "type": "Meccan",
    "totalVerses": 111,
    "totalRukus": 12,
    "startJuz": 12,
    "endJuz": 13
  },
  {
    "number": 13,
    "nameArabic": "الرعد",
    "nameEnglish": "Ar-Ra'd",
    "type": "Medinan",
    "totalVerses": 43,
    "totalRukus": 6,
    "startJuz": 13,
    "endJuz": 13
  },
  {
    "number": 14,
    "nameArabic": "ابراهيم",
    "nameEnglish": "Ibrahim",
    "type": "Meccan",
    "totalVerses": 52,
    "totalRukus": 7,
    "startJuz": 13,
    "endJuz": 13
  },
  {
    "number": 15,
    "nameArabic": "الحجر",
    "nameEnglish": "Al-Hijr",
    "type": "Meccan",
    "totalVerses": 99,
    "totalRukus": 6,
    "startJuz": 14,
    "endJuz": 14
  },
  {
    "number": 16,
    "nameArabic": "النحل",
    "nameEnglish": "An-Nahl",
    "type": "Meccan",
    "totalVerses": 128,
    "totalRukus": 16,
    "startJuz": 14,
    "endJuz": 14
  },
  {
    "number": 17,
    "nameArabic": "الإسراء",
    "nameEnglish": "Al-Isra",
    "type": "Meccan",
    "totalVerses": 111,
    "totalRukus": 12,
    "startJuz": 15,
    "endJuz": 15
  },
  {
    "number": 18,
    "nameArabic": "الكهف",
    "nameEnglish": "Al-Kahf",
    "type": "Meccan",
    "totalVerses": 110,
    "totalRukus": 12,
    "startJuz": 15,
    "endJuz": 16
  },
  {
    "number": 19,
    "nameArabic": "مريم",
    "nameEnglish": "Maryam",
    "type": "Meccan",
    "totalVerses": 98,
    "totalRukus": 6,
    "startJuz": 16,
    "endJuz": 16
  },
  {
    "number": 20,
    "nameArabic": "طه",
    "nameEnglish": "Taha",
    "type": "Meccan",
    "totalVerses": 135,
    "totalRukus": 8,
    "startJuz": 16,
    "endJuz": 16
  },
  {
    "number": 21,
    "nameArabic": "الأنبياء",
    "nameEnglish": "Al-Anbya",
    "type": "Meccan",
    "totalVerses": 112,
    "totalRukus": 7,
    "startJuz": 17,
    "endJuz": 17
  },
  {
    "number": 22,
    "nameArabic": "الحج",
    "nameEnglish": "Al-Hajj",
    "type": "Medinan",
    "totalVerses": 78,
    "totalRukus": 10,
    "startJuz": 17,
    "endJuz": 17
  },
  {
    "number": 23,
    "nameArabic": "المؤمنون",
    "nameEnglish": "Al-Mu'minun",
    "type": "Meccan",
    "totalVerses": 118,
    "totalRukus": 6,
    "startJuz": 18,
    "endJuz": 18
  },
  {
    "number": 24,
    "nameArabic": "النور",
    "nameEnglish": "An-Nur",
    "type": "Medinan",
    "totalVerses": 64,
    "totalRukus": 9,
    "startJuz": 18,
    "endJuz": 18
  },
  {
    "number": 25,
    "nameArabic": "الفرقان",
    "nameEnglish": "Al-Furqan",
    "type": "Meccan",
    "totalVerses": 77,
    "totalRukus": 6,
    "startJuz": 18,
    "endJuz": 19
  },
  {
    "number": 26,
    "nameArabic": "الشعراء",
    "nameEnglish": "Ash-Shu'ara",
    "type": "Meccan",
    "totalVerses": 227,
    "totalRukus": 11,
    "startJuz": 19,
    "endJuz": 19
  },
  {
    "number": 27,
    "nameArabic": "النمل",
    "nameEnglish": "An-Naml",
    "type": "Meccan",
    "totalVerses": 93,
    "totalRukus": 7,
    "startJuz": 19,
    "endJuz": 20
  },
  {
    "number": 28,
    "nameArabic": "القصص",
    "nameEnglish": "Al-Qasas",
    "type": "Meccan",
    "totalVerses": 88,
    "totalRukus": 8,
    "startJuz": 20,
    "endJuz": 20
  },
  {
    "number": 29,
    "nameArabic": "العنكبوت",
    "nameEnglish": "Al-'Ankabut",
    "type": "Meccan",
    "totalVerses": 69,
    "totalRukus": 7,
    "startJuz": 20,
    "endJuz": 21
  },
  {
    "number": 30,
    "nameArabic": "الروم",
    "nameEnglish": "Ar-Rum",
    "type": "Meccan",
    "totalVerses": 60,
    "totalRukus": 6,
    "startJuz": 21,
    "endJuz": 21
  },
  {
    "number": 31,
    "nameArabic": "لقمان",
    "nameEnglish": "Luqman",
    "type": "Meccan",
    "totalVerses": 34,
    "totalRukus": 3,
    "startJuz": 21,
    "endJuz": 21
  },
  {
    "number": 32,
    "nameArabic": "السجدة",
    "nameEnglish": "As-Sajdah",
    "type": "Meccan",
    "totalVerses": 30,
    "totalRukus": 3,
    "startJuz": 21,
    "endJuz": 21
  },
  {
    "number": 33,
    "nameArabic": "الأحزاب",
    "nameEnglish": "Al-Ahzab",
    "type": "Medinan",
    "totalVerses": 73,
    "totalRukus": 9,
    "startJuz": 21,
    "endJuz": 22
  },
  {
    "number": 34,
    "nameArabic": "سبإ",
    "nameEnglish": "Saba",
    "type": "Meccan",
    "totalVerses": 54,
    "totalRukus": 6,
    "startJuz": 22,
    "endJuz": 22
  },
  {
    "number": 35,
    "nameArabic": "فاطر",
    "nameEnglish": "Fatir",
    "type": "Meccan",
    "totalVerses": 45,
    "totalRukus": 5,
    "startJuz": 22,
    "endJuz": 22
  },
  {
    "number": 36,
    "nameArabic": "يس",
    "nameEnglish": "Ya-Sin",
    "type": "Meccan",
    "totalVerses": 83,
    "totalRukus": 5,
    "startJuz": 22,
    "endJuz": 23
  },
  {
    "number": 37,
    "nameArabic": "الصافات",
    "nameEnglish": "As-Saffat",
    "type": "Meccan",
    "totalVerses": 182,
    "totalRukus": 5,
    "startJuz": 23,
    "endJuz": 23
  },
  {
    "number": 38,
    "nameArabic": "ص",
    "nameEnglish": "Sad",
    "type": "Meccan",
    "totalVerses": 88,
    "totalRukus": 5,
    "startJuz": 23,
    "endJuz": 23
  },
  {
    "number": 39,
    "nameArabic": "الزمر",
    "nameEnglish": "Az-Zumar",
    "type": "Meccan",
    "totalVerses": 75,
    "totalRukus": 8,
    "startJuz": 23,
    "endJuz": 24
  },
  {
    "number": 40,
    "nameArabic": "غافر",
    "nameEnglish": "Ghafir",
    "type": "Meccan",
    "totalVerses": 85,
    "totalRukus": 9,
    "startJuz": 24,
    "endJuz": 24
  },
  {
    "number": 41,
    "nameArabic": "فصلت",
    "nameEnglish": "Fussilat",
    "type": "Meccan",
    "totalVerses": 54,
    "totalRukus": 6,
    "startJuz": 24,
    "endJuz": 25
  },
  {
    "number": 42,
    "nameArabic": "الشورى",
    "nameEnglish": "Ash-Shuraa",
    "type": "Meccan",
    "totalVerses": 53,
    "totalRukus": 5,
    "startJuz": 25,
    "endJuz": 25
  },
  {
    "number": 43,
    "nameArabic": "الزخرف",
    "nameEnglish": "Az-Zukhruf",
    "type": "Meccan",
    "totalVerses": 89,
    "totalRukus": 7,
    "startJuz": 25,
    "endJuz": 25
  },
  {
    "number": 44,
    "nameArabic": "الدخان",
    "nameEnglish": "Ad-Dukhan",
    "type": "Meccan",
    "totalVerses": 59,
    "totalRukus": 3,
    "startJuz": 25,
    "endJuz": 25
  },
  {
    "number": 45,
    "nameArabic": "الجاثية",
    "nameEnglish": "Al-Jathiyah",
    "type": "Meccan",
    "totalVerses": 37,
    "totalRukus": 4,
    "startJuz": 25,
    "endJuz": 25
  },
  {
    "number": 46,
    "nameArabic": "الأحقاف",
    "nameEnglish": "Al-Ahqaf",
    "type": "Meccan",
    "totalVerses": 35,
    "totalRukus": 4,
    "startJuz": 26,
    "endJuz": 26
  },
  {
    "number": 47,
    "nameArabic": "محمد",
    "nameEnglish": "Muhammad",
    "type": "Medinan",
    "totalVerses": 38,
    "totalRukus": 4,
    "startJuz": 26,
    "endJuz": 26
  },
  {
    "number": 48,
    "nameArabic": "الفتح",
    "nameEnglish": "Al-Fath",
    "type": "Medinan",
    "totalVerses": 29,
    "totalRukus": 4,
    "startJuz": 26,
    "endJuz": 26
  },
  {
    "number": 49,
    "nameArabic": "الحجرات",
    "nameEnglish": "Al-Hujurat",
    "type": "Medinan",
    "totalVerses": 18,
    "totalRukus": 2,
    "startJuz": 26,
    "endJuz": 26
  },
  {
    "number": 50,
    "nameArabic": "ق",
    "nameEnglish": "Qaf",
    "type": "Meccan",
    "totalVerses": 45,
    "totalRukus": 3,
    "startJuz": 26,
    "endJuz": 26
  },
  {
    "number": 51,
    "nameArabic": "الذاريات",
    "nameEnglish": "Adh-Dhariyat",
    "type": "Meccan",
    "totalVerses": 60,
    "totalRukus": 3,
    "startJuz": 26,
    "endJuz": 27
  },
  {
    "number": 52,
    "nameArabic": "الطور",
    "nameEnglish": "At-Tur",
    "type": "Meccan",
    "totalVerses": 49,
    "totalRukus": 2,
    "startJuz": 27,
    "endJuz": 27
  },
  {
    "number": 53,
    "nameArabic": "النجم",
    "nameEnglish": "An-Najm",
    "type": "Meccan",
    "totalVerses": 62,
    "totalRukus": 3,
    "startJuz": 27,
    "endJuz": 27
  },
  {
    "number": 54,
    "nameArabic": "القمر",
    "nameEnglish": "Al-Qamar",
    "type": "Meccan",
    "totalVerses": 55,
    "totalRukus": 3,
    "startJuz": 27,
    "endJuz": 27
  },
  {
    "number": 55,
    "nameArabic": "الرحمن",
    "nameEnglish": "Ar-Rahman",
    "type": "Medinan",
    "totalVerses": 78,
    "totalRukus": 3,
    "startJuz": 27,
    "endJuz": 27
  },
  {
    "number": 56,
    "nameArabic": "الواقعة",
    "nameEnglish": "Al-Waqi'ah",
    "type": "Meccan",
    "totalVerses": 96,
    "totalRukus": 3,
    "startJuz": 27,
    "endJuz": 27
  },
  {
    "number": 57,
    "nameArabic": "الحديد",
    "nameEnglish": "Al-Hadid",
    "type": "Medinan",
    "totalVerses": 29,
    "totalRukus": 4,
    "startJuz": 27,
    "endJuz": 27
  },
  {
    "number": 58,
    "nameArabic": "المجادلة",
    "nameEnglish": "Al-Mujadila",
    "type": "Medinan",
    "totalVerses": 22,
    "totalRukus": 3,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 59,
    "nameArabic": "الحشر",
    "nameEnglish": "Al-Hashr",
    "type": "Medinan",
    "totalVerses": 24,
    "totalRukus": 3,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 60,
    "nameArabic": "الممتحنة",
    "nameEnglish": "Al-Mumtahanah",
    "type": "Medinan",
    "totalVerses": 13,
    "totalRukus": 2,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 61,
    "nameArabic": "الصف",
    "nameEnglish": "As-Saf",
    "type": "Medinan",
    "totalVerses": 14,
    "totalRukus": 2,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 62,
    "nameArabic": "الجمعة",
    "nameEnglish": "Al-Jumu'ah",
    "type": "Medinan",
    "totalVerses": 11,
    "totalRukus": 2,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 63,
    "nameArabic": "المنافقون",
    "nameEnglish": "Al-Munafiqun",
    "type": "Medinan",
    "totalVerses": 11,
    "totalRukus": 2,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 64,
    "nameArabic": "التغابن",
    "nameEnglish": "At-Taghabun",
    "type": "Medinan",
    "totalVerses": 18,
    "totalRukus": 2,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 65,
    "nameArabic": "الطلاق",
    "nameEnglish": "At-Talaq",
    "type": "Medinan",
    "totalVerses": 12,
    "totalRukus": 2,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 66,
    "nameArabic": "التحريم",
    "nameEnglish": "At-Tahrim",
    "type": "Medinan",
    "totalVerses": 12,
    "totalRukus": 2,
    "startJuz": 28,
    "endJuz": 28
  },
  {
    "number": 67,
    "nameArabic": "الملك",
    "nameEnglish": "Al-Mulk",
    "type": "Meccan",
    "totalVerses": 30,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 68,
    "nameArabic": "القلم",
    "nameEnglish": "Al-Qalam",
    "type": "Meccan",
    "totalVerses": 52,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 69,
    "nameArabic": "الحاقة",
    "nameEnglish": "Al-Haqqah",
    "type": "Meccan",
    "totalVerses": 52,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 70,
    "nameArabic": "المعارج",
    "nameEnglish": "Al-Ma'arij",
    "type": "Meccan",
    "totalVerses": 44,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 71,
    "nameArabic": "نوح",
    "nameEnglish": "Nuh",
    "type": "Meccan",
    "totalVerses": 28,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 72,
    "nameArabic": "الجن",
    "nameEnglish": "Al-Jinn",
    "type": "Meccan",
    "totalVerses": 28,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 73,
    "nameArabic": "المزمل",
    "nameEnglish": "Al-Muzzammil",
    "type": "Meccan",
    "totalVerses": 20,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 74,
    "nameArabic": "المدثر",
    "nameEnglish": "Al-Muddaththir",
    "type": "Meccan",
    "totalVerses": 56,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 75,
    "nameArabic": "القيامة",
    "nameEnglish": "Al-Qiyamah",
    "type": "Meccan",
    "totalVerses": 40,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 76,
    "nameArabic": "الانسان",
    "nameEnglish": "Al-Insan",
    "type": "Medinan",
    "totalVerses": 31,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 77,
    "nameArabic": "المرسلات",
    "nameEnglish": "Al-Mursalat",
    "type": "Meccan",
    "totalVerses": 50,
    "totalRukus": 2,
    "startJuz": 29,
    "endJuz": 29
  },
  {
    "number": 78,
    "nameArabic": "النبإ",
    "nameEnglish": "An-Naba",
    "type": "Meccan",
    "totalVerses": 40,
    "totalRukus": 2,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 79,
    "nameArabic": "النازعات",
    "nameEnglish": "An-Nazi'at",
    "type": "Meccan",
    "totalVerses": 46,
    "totalRukus": 2,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 80,
    "nameArabic": "عبس",
    "nameEnglish": "'Abasa",
    "type": "Meccan",
    "totalVerses": 42,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 81,
    "nameArabic": "التكوير",
    "nameEnglish": "At-Takwir",
    "type": "Meccan",
    "totalVerses": 29,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 82,
    "nameArabic": "الإنفطار",
    "nameEnglish": "Al-Infitar",
    "type": "Meccan",
    "totalVerses": 19,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 83,
    "nameArabic": "المطففين",
    "nameEnglish": "Al-Mutaffifin",
    "type": "Meccan",
    "totalVerses": 36,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 84,
    "nameArabic": "الإنشقاق",
    "nameEnglish": "Al-Inshiqaq",
    "type": "Meccan",
    "totalVerses": 25,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 85,
    "nameArabic": "البروج",
    "nameEnglish": "Al-Buruj",
    "type": "Meccan",
    "totalVerses": 22,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 86,
    "nameArabic": "الطارق",
    "nameEnglish": "At-Tariq",
    "type": "Meccan",
    "totalVerses": 17,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 87,
    "nameArabic": "الأعلى",
    "nameEnglish": "Al-A'la",
    "type": "Meccan",
    "totalVerses": 19,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 88,
    "nameArabic": "الغاشية",
    "nameEnglish": "Al-Ghashiyah",
    "type": "Meccan",
    "totalVerses": 26,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 89,
    "nameArabic": "الفجر",
    "nameEnglish": "Al-Fajr",
    "type": "Meccan",
    "totalVerses": 30,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 90,
    "nameArabic": "البلد",
    "nameEnglish": "Al-Balad",
    "type": "Meccan",
    "totalVerses": 20,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 91,
    "nameArabic": "الشمس",
    "nameEnglish": "Ash-Shams",
    "type": "Meccan",
    "totalVerses": 15,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 92,
    "nameArabic": "الليل",
    "nameEnglish": "Al-Layl",
    "type": "Meccan",
    "totalVerses": 21,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 93,
    "nameArabic": "الضحى",
    "nameEnglish": "Ad-Duhaa",
    "type": "Meccan",
    "totalVerses": 11,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 94,
    "nameArabic": "الشرح",
    "nameEnglish": "Ash-Sharh",
    "type": "Meccan",
    "totalVerses": 8,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 95,
    "nameArabic": "التين",
    "nameEnglish": "At-Tin",
    "type": "Meccan",
    "totalVerses": 8,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 96,
    "nameArabic": "العلق",
    "nameEnglish": "Al-'Alaq",
    "type": "Meccan",
    "totalVerses": 19,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 97,
    "nameArabic": "القدر",
    "nameEnglish": "Al-Qadr",
    "type": "Meccan",
    "totalVerses": 5,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 98,
    "nameArabic": "البينة",
    "nameEnglish": "Al-Bayyinah",
    "type": "Medinan",
    "totalVerses": 8,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 99,
    "nameArabic": "الزلزلة",
    "nameEnglish": "Az-Zalzalah",
    "type": "Medinan",
    "totalVerses": 8,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 100,
    "nameArabic": "العاديات",
    "nameEnglish": "Al-'Adiyat",
    "type": "Meccan",
    "totalVerses": 11,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 101,
    "nameArabic": "القارعة",
    "nameEnglish": "Al-Qari'ah",
    "type": "Meccan",
    "totalVerses": 11,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 102,
    "nameArabic": "التكاثر",
    "nameEnglish": "At-Takathur",
    "type": "Meccan",
    "totalVerses": 8,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 103,
    "nameArabic": "العصر",
    "nameEnglish": "Al-'Asr",
    "type": "Meccan",
    "totalVerses": 3,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 104,
    "nameArabic": "الهمزة",
    "nameEnglish": "Al-Humazah",
    "type": "Meccan",
    "totalVerses": 9,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 105,
    "nameArabic": "الفيل",
    "nameEnglish": "Al-Fil",
    "type": "Meccan",
    "totalVerses": 5,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 106,
    "nameArabic": "قريش",
    "nameEnglish": "Quraysh",
    "type": "Meccan",
    "totalVerses": 4,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 107,
    "nameArabic": "الماعون",
    "nameEnglish": "Al-Ma'un",
    "type": "Meccan",
    "totalVerses": 7,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 108,
    "nameArabic": "الكوثر",
    "nameEnglish": "Al-Kawthar",
    "type": "Meccan",
    "totalVerses": 3,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 109,
    "nameArabic": "الكافرون",
    "nameEnglish": "Al-Kafirun",
    "type": "Meccan",
    "totalVerses": 6,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 110,
    "nameArabic": "النصر",
    "nameEnglish": "An-Nasr",
    "type": "Medinan",
    "totalVerses": 3,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 111,
    "nameArabic": "المسد",
    "nameEnglish": "Al-Masad",
    "type": "Meccan",
    "totalVerses": 5,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 112,
    "nameArabic": "الإخلاص",
    "nameEnglish": "Al-Ikhlas",
    "type": "Meccan",
    "totalVerses": 4,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 113,
    "nameArabic": "الفلق",
    "nameEnglish": "Al-Falaq",
    "type": "Meccan",
    "totalVerses": 5,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  },
  {
    "number": 114,
    "nameArabic": "الناس",
    "nameEnglish": "An-Nas",
    "type": "Meccan",
    "totalVerses": 6,
    "totalRukus": 1,
    "startJuz": 30,
    "endJuz": 30
  }
];

const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => arabicNumerals[parseInt(d, 10)]);
}

export function toVerseSymbol(num: number): string {
  return ' ۝' + toArabicDigits(num) + ' ';
}

let quranCache: Surah[] | null = null;
let quranFetchPromise: Promise<Surah[]> | null = null;

export async function getFullQuran(): Promise<Surah[]> {
  if (quranCache && quranCache.length > 0) return quranCache;
  if (quranFetchPromise) return quranFetchPromise;

  quranFetchPromise = (async () => {
    // Generate intelligent URL candidates supporting root domain, repository subpath, and base url
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const directoryPath = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    const absoluteDirectoryUrl = origin && directoryPath ? `${origin}${directoryPath}` : '';

    const candidates = [
      absoluteDirectoryUrl ? `${absoluteDirectoryUrl}data/quran.json` : null,
      './data/quran.json',
      'data/quran.json',
      `${import.meta.env.BASE_URL || ''}data/quran.json`.replace(/\/\//g, '/'),
      '/madrasa-management-system/data/quran.json',
      '/data/quran.json'
    ].filter(Boolean) as string[];

    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            continue; // Skip HTML 404 response pages
          }
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            quranCache = data;
            console.log(`[Quran] Successfully loaded ${data.length} Surahs from: ${url}`);
            return data;
          }
        }
      } catch {
        // Continue to next candidate
      }
    }

    console.error('[Quran] Failed to load Holy Quran JSON from all candidate URLs');
    return [];
  })();

  try {
    const result = await quranFetchPromise;
    return result;
  } finally {
    quranFetchPromise = null;
  }
}

export async function getSurah(surahNumber: number): Promise<Surah | null> {
  const full = await getFullQuran();
  return full.find(s => s.number === surahNumber) || null;
}

export async function getParahVerses(juzNumber: number): Promise<{ surah: SurahMeta; verses: Ayah[] }[]> {
  const full = await getFullQuran();
  const result: { surah: SurahMeta; verses: Ayah[] }[] = [];

  full.forEach(surah => {
    const juzVerses = surah.verses.filter(v => v.juz === juzNumber);
    if (juzVerses.length > 0) {
      const meta = QURAN_SURAHS_META.find(m => m.number === surah.number) || {
        number: surah.number,
        nameArabic: surah.nameArabic,
        nameEnglish: surah.nameEnglish,
        translation: surah.translation,
        type: surah.type,
        totalVerses: surah.totalVerses,
        totalRukus: surah.totalRukus,
        startJuz: juzNumber,
        endJuz: juzNumber
      };
      result.push({
        surah: meta,
        verses: juzVerses
      });
    }
  });

  return result;
}

export function parseSabaqProgress(sabaqStr: string): { completedParas: number; percentage: number } {
  const match = sabaqStr.match(/Para\s*(\d+)/i);
  if (match && match[1]) {
    const pNum = parseInt(match[1], 10);
    const completed = Math.min(30, Math.max(1, pNum));
    const percentage = Math.round((completed / 30) * 100);
    return { completedParas: completed, percentage };
  }
  return { completedParas: 1, percentage: 3 };
}
