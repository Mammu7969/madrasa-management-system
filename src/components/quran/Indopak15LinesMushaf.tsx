import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Printer, 
  Award, 
  Sparkles, 
  Compass, 
  List, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  SlidersHorizontal,
  Type
} from 'lucide-react';
import { 
  QURAN_PARAHS, 
  QURAN_SURAHS_META, 
  toArabicDigits, 
  toVerseSymbol, 
  Ayah, 
  Surah,
  getFullQuran
} from '../../services/quran';
import { 
  QURAN_15_LINES_PAGES_MAP, 
  getJuzForPage, 
  getPageForJuz 
} from '../../services/quranPagesMap';

// Authentic Ornate Page 1 of Indopak 15 Lines (Surah Al-Fatihah 1-7 with Lauh Medallion)
const PAGE_1_LINES = [
  { line: 1, type: 'header' as const, content: 'سُوْرَةُ الْفَاتِحَةِ مَكِّيَّةٌ - اٰيَاتُهَا ٧ - رُكُوْعُهَا ١' },
  { line: 2, type: 'text' as const, content: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ ۝١' },
  { line: 3, type: 'text' as const, content: 'اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِیْنَ ۝٢' },
  { line: 4, type: 'text' as const, content: 'الرَّحْمٰنِ الرَّحِیْمِ ۝٣ مٰلِكِ یَوْمِ الدِّیْنِ ۝٤' },
  { line: 5, type: 'text' as const, content: 'اِیَّاكَ نَعْبُدُ وَاِیَّاكَ نَسْتَعِیْنُ ۝٥' },
  { line: 6, type: 'text' as const, content: 'اِهْدِنَا الصِّرَاطَ الْمُسْتَقِیْمَ ۝٦' },
  { line: 7, type: 'text' as const, content: 'صِرَاطَ الَّذِیْنَ اَنْعَمْتَ عَلَیْهِمْ غَیْرِ' },
  { line: 8, type: 'text' as const, content: 'الْمَغْضُوْبِ عَلَیْهِمْ وَلَا الضَّآلِّیْنَ ۝٧' },
  { line: 9, type: 'tazheeb' as const, content: '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖' },
  { line: 10, type: 'tazheeb' as const, content: '۞  لوح مذهب قرآني شريف  ۞' },
  { line: 11, type: 'tazheeb' as const, content: '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖' },
  { line: 12, type: 'tazheeb' as const, content: '✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦' },
  { line: 13, type: 'tazheeb' as const, content: '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖' },
  { line: 14, type: 'tazheeb' as const, content: '۞  وقف لازم ووصل تام  ۞' },
  { line: 15, type: 'tazheeb' as const, content: '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖' }
];

// Authentic Ornate Page 2 of Indopak 15 Lines (Surah Al-Baqarah 1-4 Frontispiece)
const PAGE_2_LINES = [
  { line: 1, type: 'header' as const, content: 'سُوْرَةُ الْبَقَرَةِ مَدَنِيَّةٌ - اٰيَاتُهَا ٢٨٦ - رُكُوْعُهَا ٤٠' },
  { line: 2, type: 'bismillah' as const, content: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ' },
  { line: 3, type: 'text' as const, content: 'الٓمّٓ ۝١' },
  { line: 4, type: 'text' as const, content: 'ذٰلِكَ الْكِتٰبُ لَا رَیْبَ ۛ فِيْهِ ۛ هُدًى لِّلْمُتَّقِیْنَ ۝٢' },
  { line: 5, type: 'text' as const, content: 'الَّذِیْنَ یُؤْمِنُوْنَ بِالْغَیْبِ وَیُقِیْمُوْنَ الصَّلٰوةَ وَمِمَّا' },
  { line: 6, type: 'text' as const, content: 'رَزَقْنٰهُمْ یُنْفِقُوْنَ ۝٣' },
  { line: 7, type: 'text' as const, content: 'وَالَّذِیْنَ یُؤْمِنُوْنَ بِمَاۤ اُنْزِلَ اِلَیْكَ وَمَاۤ اُنْزِلَ مِنْ' },
  { line: 8, type: 'text' as const, content: 'قَبْلِكَ ۚ وَبِالْاٰخِرَةِ هُمْ یُوْقِنُوْنَ ۝٤' },
  { line: 9, type: 'tazheeb' as const, content: '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖' },
  { line: 10, type: 'tazheeb' as const, content: '۞  لوح مذهب قرآني شريف  ۞' },
  { line: 11, type: 'tazheeb' as const, content: '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖' },
  { line: 12, type: 'tazheeb' as const, content: '✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦' },
  { line: 13, type: 'tazheeb' as const, content: '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖' },
  { line: 14, type: 'tazheeb' as const, content: '۞  نصف الحزب الأول  ۞' },
  { line: 15, type: 'tazheeb' as const, content: '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖' }
];

interface Indopak15LinesMushafProps {
  initialPage?: number;
  allSurahs: Surah[];
  onAssignSabaq?: (surahName: string, ayahNum: number, juzNum: number) => void;
  onPlayAyahAudio?: (surahNum: number, ayahNum: number) => void;
}

export const Indopak15LinesMushaf: React.FC<Indopak15LinesMushafProps> = ({
  initialPage = 1,
  allSurahs: initialAllSurahs,
  onAssignSabaq,
  onPlayAyahAudio
}) => {
  const [internalQuran, setInternalQuran] = useState<Surah[]>(initialAllSurahs);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [fontSize, setFontSize] = useState<number>(27);
  const [selectedFont, setSelectedFont] = useState<string>('Al Qalam Quran Publisher');
  const [paperTheme, setPaperTheme] = useState<'cream' | 'parchment' | 'night'>('cream');
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [focusedLineNumber, setFocusedLineNumber] = useState<number | null>(null);
  const [hifzTestingMode, setHifzTestingMode] = useState<boolean>(false);
  const [revealedLines, setRevealedLines] = useState<Record<number, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // Fallback load if allSurahs prop is empty
  useEffect(() => {
    if (initialAllSurahs && initialAllSurahs.length > 0) {
      setInternalQuran(initialAllSurahs);
    } else {
      getFullQuran().then(data => {
        if (data && data.length > 0) {
          setInternalQuran(data);
        }
      });
    }
  }, [initialAllSurahs]);

  // Sync initial page
  useEffect(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 610) {
      setCurrentPage(initialPage);
      setJumpPageInput(String(initialPage));
    }
  }, [initialPage]);

  // Reset focus and testing mode on page change
  useEffect(() => {
    setFocusedLineNumber(null);
    setRevealedLines({});
    setJumpPageInput(String(currentPage));
  }, [currentPage]);

  // Determine Juz / Parah for current page using authoritative Mushaf boundaries
  const currentJuzNumber = useMemo(() => {
    return getJuzForPage(currentPage);
  }, [currentPage]);

  const activeJuz = useMemo(() => {
    return QURAN_PARAHS.find(p => p.number === currentJuzNumber) || QURAN_PARAHS[0];
  }, [currentJuzNumber]);

  // Generate authentic lines for the current page from QURAN_15_LINES_PAGES_MAP and internalQuran
  const { activeSurahMeta, ayahRangeText, linesData } = useMemo(() => {
    const range = QURAN_15_LINES_PAGES_MAP[currentPage] || '1:1 - 1:7';

        if (currentPage === 1) {
      return {
        activeSurahMeta: QURAN_SURAHS_META[0],
        ayahRangeText: '1:1 - 1:7',
        linesData: PAGE_1_LINES
      };
    }

    if (currentPage === 2) {
      return {
        activeSurahMeta: QURAN_SURAHS_META[1],
        ayahRangeText: '2:1 - 2:4',
        linesData: PAGE_2_LINES
      };
    }

    // Parse start and end surah & ayah
    const [startPart, endPart] = range.split(' - ');
    const [startSurahNum, startAyahNum] = (startPart || '2:1').split(':').map(Number);
    const [endSurahNum, endAyahNum] = (endPart || '2:4').split(':').map(Number);

    const primarySurahMeta = QURAN_SURAHS_META.find(s => s.number === startSurahNum) || QURAN_SURAHS_META[1];

    if (!internalQuran || internalQuran.length === 0) {
      return {
        activeSurahMeta: primarySurahMeta,
        ayahRangeText: range,
        linesData: []
      };
    }

    // Extract exact verses for this page range
    interface PageVerse {
      surahNumber: number;
      surahNameArabic: string;
      surahType: 'Meccan' | 'Medinan';
      totalVerses: number;
      totalRukus: number;
      isFirstAyahInSurah: boolean;
      ayahNumber: number;
      text: string;
      juz: number;
    }

    const pageVerses: PageVerse[] = [];
    for (let sNum = startSurahNum; sNum <= endSurahNum; sNum++) {
      const surah = internalQuran[sNum - 1];
      if (!surah) continue;
      const sAyah = (sNum === startSurahNum) ? startAyahNum : 1;
      const eAyah = (sNum === endSurahNum) ? endAyahNum : surah.verses.length;

      for (let aNum = sAyah; aNum <= eAyah; aNum++) {
        const v = surah.verses.find(x => x.id === aNum);
        if (v) {
          pageVerses.push({
            surahNumber: surah.number,
            surahNameArabic: surah.nameArabic,
            surahType: surah.type,
            totalVerses: surah.totalVerses,
            totalRukus: surah.totalRukus,
            isFirstAyahInSurah: (aNum === 1),
            ayahNumber: aNum,
            text: v.text,
            juz: v.juz
          });
        }
      }
    }

    const lines: { line: number; type: 'header' | 'bismillah' | 'text' | 'tazheeb'; content: string }[] = [];

    // Check if a surah starts on this page
    const firstVerse = pageVerses[0];
    if (firstVerse && firstVerse.isFirstAyahInSurah) {
      lines.push({
        line: lines.length + 1,
        type: 'header',
        content: `سُوْرَةُ ${firstVerse.surahNameArabic} ${firstVerse.surahType === 'Meccan' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'} - اٰيَاتُهَا ${toArabicDigits(firstVerse.totalVerses)} - رُكُوْعُهَا ${toArabicDigits(firstVerse.totalRukus)}`
      });
      if (firstVerse.surahNumber !== 9) {
        lines.push({
          line: lines.length + 1,
          type: 'bismillah',
          content: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ'
        });
      }
    }

    // Tokenize all text cleanly with authentic ayah end symbols
        const tokens: string[] = [];
    pageVerses.forEach(v => {
      if (v.isFirstAyahInSurah && v.surahNumber !== firstVerse?.surahNumber) {
        tokens.push(`__SURAH_START__:${v.surahNumber}`);
      }
      const words = v.text.trim().split(/\s+/);
      if (words.length > 0) {
        const lastWord = words.pop();
        words.forEach(w => tokens.push(w));
        tokens.push(`${lastWord} ${toVerseSymbol(v.ayahNumber)}`);
      }
    });

    const targetLines = 15;
    const availableTextLines = Math.max(1, targetLines - lines.length);

    let tokenCursor = 0;
    for (let l = 1; l <= availableTextLines; l++) {
      const remainingLines = availableTextLines - l + 1;
      const remainingTokens = tokens.length - tokenCursor;
      const count = Math.ceil(remainingTokens / remainingLines);
      const lineTokens = tokens.slice(tokenCursor, tokenCursor + count);
      tokenCursor += count;

      // Detect embedded mid-page surah header
      const surahToken = lineTokens.find(t => t.startsWith('__SURAH_START__:'));
      if (surahToken) {
        const sNum = parseInt(surahToken.split(':')[1], 10);
        const sObj = internalQuran[sNum - 1];
        if (sObj) {
          lines.push({
            line: lines.length + 1,
            type: 'header',
            content: `سُوْرَةُ ${sObj.nameArabic} - اٰيَاتُهَا ${toArabicDigits(sObj.totalVerses)}`
          });
        }
        const filtered = lineTokens.filter(t => !t.startsWith('__SURAH_START__:'));
        if (filtered.length > 0) {
          lines.push({
            line: lines.length + 1,
            type: 'text',
            content: filtered.join(' ')
          });
        }
      } else {
        lines.push({
          line: lines.length + 1,
          type: 'text',
          content: lineTokens.join(' ')
        });
      }
    }

    while (lines.length < 15) {
      lines.push({
        line: lines.length + 1,
        type: 'text',
        content: ''
      });
    }

    return {
      activeSurahMeta: primarySurahMeta,
      ayahRangeText: range,
      linesData: lines
    };
  }, [currentPage, internalQuran]);

  // Page Navigation Handlers
  const handleNextPage = () => {
    if (currentPage < 610) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= 610) {
      setCurrentPage(p);
    }
  };

  const handleJumpToJuz = (juzNum: number) => {
    const targetPage = getPageForJuz(juzNum);
    setCurrentPage(Math.min(610, Math.max(1, targetPage)));
  };

  // Keyboard navigation (Arrow Left / Right for pages, Up / Down for line ruler)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        handlePrevPage();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedLineNumber(prev => prev === null ? 1 : Math.min(15, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedLineNumber(prev => prev === null ? 1 : Math.max(1, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Audio Recitation Player
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      if (onPlayAyahAudio) {
        const startAyah = parseInt(ayahRangeText.split(' - ')[0]?.split(':')[1] || '1', 10);
        onPlayAyahAudio(activeSurahMeta.number, startAyah);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. MUSHAF TOP CONTROL BAR (Zero CSS Gradients - Clean Glass) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        {/* Left: Page Info & Juz Metadata */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="font-bold text-gray-900 text-sm">
              Indopak 15 Lines Mushaf &mdash; Qudratullah Layout
            </span>
          </div>

          <span className="text-gray-300">|</span>

          {/* Parah / Juz Pill */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-bold">
            <span>{activeJuz.nameArabic}</span>
            <span className="text-[10px] text-emerald-700">({activeJuz.nameTranslit})</span>
            <span className="text-[11px] font-mono text-emerald-800 font-bold ml-1">Juz {currentJuzNumber}</span>
          </div>

          {/* Surah & Ayah Range Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold font-mono">
            <span>سورة {activeSurahMeta.nameArabic}</span>
            <span className="text-[11px] text-amber-800">[{ayahRangeText}]</span>
          </div>

          {/* Active Font Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 text-gray-800 border border-gray-200/80 text-xs font-bold">
            <Type className="w-3.5 h-3.5 text-emerald-700" />
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="bg-transparent border-0 font-bold text-gray-900 text-xs focus:ring-0 cursor-pointer p-0"
              title="Change Quran Typography"
            >
              <option value="Al Qalam Quran Publisher">Al Qalam Quran Publisher (القرآن الأصلي)</option>
              <option value="QuranFont-Original">QuranFont-Original (Saleem)</option>
              <option value="1 MUHAMMADI QURANIC">Muhammadi Quranic (محمدی)</option>
            </select>
          </div>
        </div>

        {/* Right: Controls (Page Jump, Audio, Ruler, Zoom, Theme) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Recitation Button */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isPlayingAudio 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
            title="Listen to Mishary Alafasy Recitation"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isPlayingAudio ? 'Pause' : 'Audio'}</span>
          </button>

          {/* Focus Ruler Toggle */}
          <button
            type="button"
            onClick={() => setShowRulers(prev => !prev)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showRulers 
                ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300' 
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
            title="Toggle Sabaq Ruler"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Ruler</span>
          </button>

          {/* Hifz Testing Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setHifzTestingMode(prev => !prev);
              setRevealedLines({});
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              hifzTestingMode 
                ? 'bg-amber-500 text-amber-950 font-black shadow-xs' 
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
            title="Memorization Testing Mode (Hide lines and click to reveal)"
          >
            {hifzTestingMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
            <span>Hifz Test</span>
          </button>

          {/* Font Size Zoom Controls */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.max(20, prev - 2))}
              className="p-1.5 hover:bg-gray-100 text-gray-600 border-r border-gray-200"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-gray-700">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.min(38, prev + 2))}
              className="p-1.5 hover:bg-gray-100 text-gray-600"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Paper Theme Switcher */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setPaperTheme('cream')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${paperTheme === 'cream' ? 'bg-[#FDFBF7] text-[#0B3A2C] shadow-xs' : 'text-gray-500'}`}
              title="Madani Cream Paper"
            >
              Cream
            </button>
            <button
              type="button"
              onClick={() => setPaperTheme('parchment')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${paperTheme === 'parchment' ? 'bg-[#F5EFEB] text-[#2C2416] shadow-xs' : 'text-gray-500'}`}
              title="Antique Parchment"
            >
              Gold
            </button>
            <button
              type="button"
              onClick={() => setPaperTheme('night')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${paperTheme === 'night' ? 'bg-[#121B17] text-[#E0EAE5] shadow-xs' : 'text-gray-500'}`}
              title="Night Reading"
            >
              Night
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
            title="Print Authentic Page"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. JUZ QUICK STRIP JUMPER */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-gray-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto no-print">
        <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap px-2">Juz Jump:</span>
        {QURAN_PARAHS.map((p) => (
          <button
            key={p.number}
            type="button"
            onClick={() => handleJumpToJuz(p.number)}
            className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentJuzNumber === p.number 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 border border-gray-200/60'
            }`}
            title={`Juz ${p.number}: ${p.nameArabic}`}
          >
            {p.number}. {p.nameArabic}
          </button>
        ))}
      </div>

      {/* 3. AUTHENTIC 15-LINE MUSHAF PAGE CONTAINER */}
      <div className="flex flex-col items-center">
        {/* Page Container */}
        <div 
          className={`w-full max-w-4xl rounded-3xl transition-all duration-300 p-6 sm:p-10 shadow-sm border ${
            paperTheme === 'cream'
              ? 'bg-[#FFFDF8] text-[#0C3524] border-[#E8DFC8]'
              : paperTheme === 'parchment'
                ? 'bg-[#F9F5EC] text-[#2C2416] border-[#DFD3BA]'
                : 'bg-[#0E1713] text-[#E0EAE5] border-[#1C3026]'
          }`}
          style={{ fontFamily: `'${selectedFont}', 'QuranFont-Original', serif` }}
        >
          {/* ORNATE CALLIGRAPHIC TOP BORDER / HEADER FRAME */}
          <div className={`border-b-2 pb-2 mb-4 flex items-center justify-between text-xs sm:text-sm font-bold ${
            paperTheme === 'night' ? 'border-emerald-800/80 text-emerald-400' : 'border-[#0C3524]/60 text-[#0C3524]'
          }`}>
            {/* Right: Juz / Parah Info */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold font-quran">
                {activeJuz.nameArabic}
              </span>
              <span className="font-mono text-xs opacity-75">
                (الجزء {toArabicDigits(currentJuzNumber)})
              </span>
            </div>

            {/* Center: Ornate Page Medallion */}
            <div className="flex items-center gap-2">
              <span className="text-amber-600 select-none">۞</span>
              <span className="text-base sm:text-lg font-bold font-quran px-3 py-0.5 rounded-lg border border-amber-500/40 bg-amber-500/10">
                صفحہ {toArabicDigits(currentPage)}
              </span>
              <span className="text-amber-600 select-none">۞</span>
            </div>

            {/* Left: Surah Title */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs opacity-75">
                (سورة {toArabicDigits(activeSurahMeta.number)})
              </span>
              <span className="text-sm sm:text-base font-bold font-quran">
                سُوْرَةُ {activeSurahMeta.nameArabic}
              </span>
            </div>
          </div>

          {/* 15-LINE GRID AREA */}
          <div className="relative border-2 border-[#0C3524]/30 rounded-2xl p-4 sm:p-6 bg-white/40 backdrop-blur-[2px]">
            {/* Ornate Corner Rosettes */}
            <div className="absolute top-1.5 right-1.5 text-amber-700/60 select-none text-xs">✦</div>
            <div className="absolute top-1.5 left-1.5 text-amber-700/60 select-none text-xs">✦</div>
            <div className="absolute bottom-1.5 right-1.5 text-amber-700/60 select-none text-xs">✦</div>
            <div className="absolute bottom-1.5 left-1.5 text-amber-700/60 select-none text-xs">✦</div>

            {/* Render 15 Lines */}
            <div className="space-y-1">
              {linesData.map((lineObj) => {
                const isFocused = focusedLineNumber === lineObj.line;
                const isRevealed = revealedLines[lineObj.line];
                const isVeiled = hifzTestingMode && !isRevealed;

                return (
                  <div
                    key={lineObj.line}
                    onClick={() => {
                      if (hifzTestingMode) {
                        setRevealedLines(prev => ({ ...prev, [lineObj.line]: true }));
                      } else {
                        setFocusedLineNumber(prev => prev === lineObj.line ? null : lineObj.line);
                      }
                    }}
                    className={`relative flex items-center transition-all cursor-pointer rounded-xl px-2 py-0.5 group ${
                      isFocused && showRulers
                        ? 'bg-emerald-100/70 border border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'hover:bg-amber-50/50'
                    }`}
                    style={{ minHeight: `${fontSize * 1.85}px` }}
                  >
                    {/* Line Number Indicator on Side (1 to 15) */}
                    {showLineNumbers && (
                      <div className="w-7 shrink-0 text-left select-none text-[10px] font-mono font-bold text-gray-400 group-hover:text-emerald-800">
                        {toArabicDigits(lineObj.line)}
                      </div>
                    )}

                    {/* Line Content */}
                    <div className="flex-1 text-center w-full">
                      {isVeiled ? (
                        /* Hifz Testing Veil */
                        <div className="py-2.5 rounded-lg bg-amber-100/80 border border-dashed border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 select-none">
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Line {lineObj.line} hidden &bull; Tap to reveal</span>
                        </div>
                      ) : lineObj.type === 'header' ? (
                        /* Surah Title Frame */
                        <div className="my-1 py-2 px-4 rounded-xl border-2 border-[#0C3524] bg-emerald-50/90 text-center font-bold text-[#0C3524] shadow-xs">
                          <span className="text-sm sm:text-base tracking-wide font-quran" style={{ fontSize: `${fontSize * 0.72}px` }}>
                            {lineObj.content}
                          </span>
                        </div>
                      ) : lineObj.type === 'bismillah' ? (
                        /* Bismillah Line */
                        <div className="py-1 text-center font-bold text-[#0C3524] font-quran" style={{ fontSize: `${fontSize * 0.9}px` }}>
                          <span>{lineObj.content}</span>
                        </div>
                      ) : lineObj.type === 'tazheeb' ? (
                        /* Illuminated Lauh Medallion for Page 1 Bottom */
                        <div className="h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center my-0.5 select-none">
                          <span className="text-amber-700/60 text-xs tracking-widest">❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖</span>
                        </div>
                      ) : (
                        /* Standard Arabic Quran Verse Text Line - Full Width Justified */
                        <div 
                          dir="rtl"
                          className="font-bold select-text leading-loose font-quran w-full px-1"
                          style={{ 
                            fontSize: `${fontSize}px`,
                            wordSpacing: '1px',
                            textAlign: 'justify',
                            textJustify: 'inter-word',
                            textAlignLast: (lineObj.content.trim().split(/\s+/).length <= 3) ? 'center' : 'justify'
                          }}
                        >
                          <span>{lineObj.content}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Sabaq Assign Trigger on Hover */}
                    {onAssignSabaq && !isVeiled && lineObj.type === 'text' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const startAyah = parseInt(ayahRangeText.split(' - ')[0]?.split(':')[1] || '1', 10);
                          onAssignSabaq(activeSurahMeta.nameArabic, startAyah, currentJuzNumber);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 px-2 py-0.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold shadow-xs whitespace-nowrap no-print"
                        title="Assign Sabaq from this line"
                      >
                        + Sabaq
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ORNATE FOOTER */}
          <div className={`mt-4 pt-2 border-t flex items-center justify-between text-xs font-bold ${
            paperTheme === 'night' ? 'border-emerald-800/80 text-emerald-400' : 'border-[#0C3524]/40 text-[#0C3524]'
          }`}>
            <span className="font-quran">منزل {toArabicDigits(Math.min(7, Math.ceil(currentJuzNumber / 4.3)))}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-500">Page {currentPage} of 610</span>
              <span className="text-gray-300">&bull;</span>
              <span className="font-mono text-emerald-800">{activeSurahMeta.type}</span>
            </div>
            <span className="font-quran">ركوع {toArabicDigits(activeSurahMeta.totalRukus)}</span>
          </div>
        </div>

        {/* 4. BOTTOM PAGINATION BAR */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 no-print">
          {/* Previous Page (RTL: Quran next page is to the left) */}
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200/80 shadow-xs transition-all disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4 text-emerald-700" />
            <span>Previous Page ({currentPage > 1 ? currentPage - 1 : 1})</span>
          </button>

          {/* Jump to Page Form */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-600">Page:</span>
            <input
              type="number"
              min={1}
              max={610}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              className="w-16 px-2 py-1.5 text-xs text-center font-bold font-mono rounded-xl border border-gray-300 bg-white"
            />
            <span className="text-xs font-bold text-gray-400">/ 610</span>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Go
            </button>
          </form>

          {/* Next Page */}
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= 610}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200/80 shadow-xs transition-all disabled:opacity-40"
          >
            <span>Next Page ({currentPage < 610 ? currentPage + 1 : 610})</span>
            <ChevronLeft className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Indopak15LinesMushaf;
