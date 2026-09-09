import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { 
  QURAN_PARAHS, 
  QURAN_SURAHS_META, 
  getFullQuran, 
  toArabicDigits, 
  toVerseSymbol,
  Ayah, 
  Surah, 
  SurahMeta, 
  Parah 
} from '../../services/quran';
import { getPageForJuz, getPageForSurah } from '../../services/quranPagesMap';
import { 
  BookOpen, 
  Layers,
  Bookmark, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  PieChart, 
  Clock, 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle, 
  MessageSquare, 
  Award, 
  Calendar, 
  Compass, 
  List, 
  LayoutGrid, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Edit3, 
  Filter
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Indopak15LinesMushaf } from '../quran/Indopak15LinesMushaf';

export const QuranModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { showToast } = useTheme();

  // Navigation tabs: 'juz' (30 Parahs Dashboard), 'surahs' (114 Surahs), 'mushaf' (Mushaf Flow), 'cards' (Verse Cards)
  const [activeNavTab, setActiveNavTab] = useState<'juz' | 'surahs' | 'mushaf' | 'cards'>('juz');
  const [selectedJuzNumber, setSelectedJuzNumber] = useState<number>(1);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);

  // Appearance & Reader Controls
  const [fontSize, setFontSize] = useState<number>(28);
  const [themeMode, setThemeMode] = useState<'cream' | 'parchment' | 'night'>('cream');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Quran Data State
  const [allSurahs, setAllSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);

  // Audio Playback State
  const [playingAyah, setPlayingAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Sabaq Assignment Modal State
  const [showAssignSabaqModal, setShowAssignSabaqModal] = useState<boolean>(false);
  const [targetSabaqString, setTargetSabaqString] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const madrasaStudents = db.getStudents(activeMadrasa?.id);

  // Exact page calculation for Indopak 15-Line Mushaf using authoritative page mappings
  const initialMushafPage = useMemo(() => {
    if (activeNavTab === 'surahs' || selectedSurahNumber > 1) {
      return getPageForSurah(selectedSurahNumber);
    }
    return getPageForJuz(selectedJuzNumber);
  }, [selectedSurahNumber, selectedJuzNumber, activeNavTab]);

  // Load Holy Quran JSON on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getFullQuran()
      .then((data) => {
        if (isMounted) {
          setAllSurahs(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load Quran data:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Active Parah
  const activeParah = useMemo(() => {
    return QURAN_PARAHS.find(p => p.number === selectedJuzNumber) || QURAN_PARAHS[0];
  }, [selectedJuzNumber]);

  // Active Surah
  const activeSurah = useMemo(() => {
    return allSurahs.find(s => s.number === selectedSurahNumber) || allSurahs[0];
  }, [allSurahs, selectedSurahNumber]);

  // Surahs in the selected Juz (matching curriculum and Parah span)
  // Para 29 correctly ends at Surah Al-Mursalat 77, Para 30 correctly starts at Surah An-Naba 78
  const surahsInActiveJuz = useMemo(() => {
    const p = activeParah;
    if (!p) return [];

    return QURAN_SURAHS_META.filter(
      s => (s.number >= p.startSurah && s.number <= p.endSurah) ||
           (s.startJuz <= p.number && s.endJuz >= p.number)
    );
  }, [activeParah]);

  // Filtered Surahs list for the 114 Surahs view
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return QURAN_SURAHS_META;
    const q = searchQuery.toLowerCase().trim();
    return QURAN_SURAHS_META.filter(s => 
      s.nameEnglish.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      (s.translation && s.translation.toLowerCase().includes(q)) ||
      String(s.number) === q
    );
  }, [searchQuery]);

  // Verses to display in the reading mode (Mushaf or Cards)
  const displayedReaderContent = useMemo(() => {
    if (!allSurahs.length) return [];

    if (activeNavTab === 'surahs') {
      if (!activeSurah) return [];
      const meta = QURAN_SURAHS_META.find(m => m.number === activeSurah.number)!;
      return [{
        surah: meta,
        verses: activeSurah.verses
      }];
    } else {
      // Juz Mode: gather all verses in selectedJuzNumber across Surahs
      const sections: { surah: SurahMeta; verses: Ayah[] }[] = [];
      allSurahs.forEach(surah => {
        const jVerses = surah.verses.filter(v => v.juz === selectedJuzNumber);
        if (jVerses.length > 0) {
          const meta = QURAN_SURAHS_META.find(m => m.number === surah.number)!;
          sections.push({
            surah: meta,
            verses: jVerses
          });
        }
      });
      return sections;
    }
  }, [allSurahs, activeNavTab, activeSurah, selectedJuzNumber]);

  // Carousel navigation
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 260;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Copy Ayah Text
  const handleCopyAyah = (surahNum: number, ayahNum: number, text: string) => {
    const fullText = `${text} ${toVerseSymbol(ayahNum)} (سورة ${QURAN_SURAHS_META[surahNum - 1]?.nameArabic}: ${ayahNum})`;
    navigator.clipboard.writeText(fullText);
    setCopiedAyahKey(`${surahNum}_${ayahNum}`);
    showToast(`Ayah ${ayahNum} of Surah ${QURAN_SURAHS_META[surahNum - 1]?.nameEnglish} copied!`, 'success');
    setTimeout(() => setCopiedAyahKey(null), 2500);
  };

  // Play audio recitation for verse (Sheikh Mishary Rashid Alafasy)
  const handlePlayAudio = (surahNum: number, ayahNum: number) => {
    if (playingAyah?.surah === surahNum && playingAyah?.ayah === ayahNum) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAyah(null);
      }
      return;
    }

    let globalIndex = 0;
    for (let s = 1; s < surahNum; s++) {
      globalIndex += QURAN_SURAHS_META[s - 1].totalVerses;
    }
    globalIndex += ayahNum;

    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalIndex}.mp3`;
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {
        showToast('Audio recitation streaming unavailable offline', 'info');
        setPlayingAyah(null);
      });
      setPlayingAyah({ surah: surahNum, ayah: ayahNum });
      audioRef.current.onended = () => setPlayingAyah(null);
    }
  };

  // Open Assign Sabaq Modal
  const handleOpenAssignSabaq = (surahName: string, ayahNum: number, juzNum: number) => {
    const sabaqStr = `Para ${juzNum} (${surahName}, Ayat ${ayahNum})`;
    setTargetSabaqString(sabaqStr);
    setSelectedStudentId(madrasaStudents[0]?.id || '');
    setShowAssignSabaqModal(true);
  };

  // Save Sabaq Milestone to Student
  const handleSaveStudentSabaq = (e: React.FormEvent) => {
    e.preventDefault();
    const st = madrasaStudents.find(s => s.id === selectedStudentId);
    if (!st) return;

    st.presentSabaqAt = targetSabaqString;
    db.updateStudent(st);
    showToast(`Updated present Sabaq for ${st.studentName} to: ${targetSabaqString}`, 'success');
    setShowAssignSabaqModal(false);
  };

  // Switch to Reader Mode for a specific Surah
  const handleReadSurah = (surahNumber: number) => {
    setSelectedSurahNumber(surahNumber);
    setActiveNavTab('mushaf');
  };

  // Switch to Reader Mode for selected Parah
  const handleOpenFullParah = () => {
    setActiveNavTab('mushaf');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <audio ref={audioRef} className="hidden" />

      {/* =========================================================================
          1. TOP BANNER: Quranic Learning & Sabaq Management
          ========================================================================= */}
      <div className="rounded-3xl bg-white/95 backdrop-blur-md p-6 sm:p-7 border border-gray-200/80 shadow-xs relative overflow-hidden">
        {/* Subtle Decorative Mosque Silhouette in background */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-no-repeat bg-right bg-contain hidden md:block"
          style={{ backgroundImage: "url('/quran-banner-mosque.png')" }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left Side: Quran on Rehal Artwork + Title */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="shrink-0 w-20 sm:w-24 md:w-28 rounded-2xl overflow-hidden shadow-xs border border-emerald-900/10 bg-emerald-50/50">
              <img 
                src="/quran-banner-art.png" 
                alt="Holy Quran Rehal" 
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  HOLY QURAN DIGITAL MUSHAF
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight">
                Quranic Learning &amp; Sabaq Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl leading-relaxed">
                Complete 30 Parts (Juz), 114 Surahs, 556 Rukus, and 6,236 Verses, optimized for daily Sabaq evaluation and Madrasa Tahfeez.
              </p>
            </div>
          </div>

          {/* Right Side: 4 Glossy Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
            {/* 30 Juz */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs flex items-center gap-3 min-w-[125px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-gray-900 block leading-tight">30</span>
                <span className="text-[11px] font-semibold text-gray-500">Juz (Parahs)</span>
              </div>
            </div>

            {/* 114 Surahs */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs flex items-center gap-3 min-w-[125px]">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-gray-900 block leading-tight">114</span>
                <span className="text-[11px] font-semibold text-gray-500">Surahs</span>
              </div>
            </div>

            {/* 556 Rukus */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs flex items-center gap-3 min-w-[125px]">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-gray-900 block leading-tight">556</span>
                <span className="text-[11px] font-semibold text-gray-500">Rukus</span>
              </div>
            </div>

            {/* 6,236 Verses */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs flex items-center gap-3 min-w-[125px]">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-gray-900 block leading-tight">6,236</span>
                <span className="text-[11px] font-semibold text-gray-500">Verses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. NAVIGATION & CONTROLS TOOLBAR STRIP
          ========================================================================= */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 no-print">
        {/* Left: 4 Primary Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: 30 Parahs (Juz) */}
          <button
            type="button"
            onClick={() => setActiveNavTab('juz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeNavTab === 'juz'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>30 Parahs (Juz)</span>
          </button>

          {/* Tab 2: 114 Surahs */}
          <button
            type="button"
            onClick={() => setActiveNavTab('surahs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeNavTab === 'surahs'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>114 Surahs</span>
          </button>

          {/* Tab 3: Indopak 15 Lines - Qudratullah Layout */}
          <button
            type="button"
            onClick={() => setActiveNavTab('mushaf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeNavTab === 'mushaf'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>15-Line Mushaf (Qudratullah)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono uppercase font-bold ${
              activeNavTab === 'mushaf' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Indopak
            </span>
          </button>

          {/* Tab 4: Verse Cards (Ayaat) */}
          <button
            type="button"
            onClick={() => setActiveNavTab('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeNavTab === 'cards'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Verse Cards (Ayaat)</span>
          </button>
        </div>

        {/* Right: Search, Font Size, Layout Toggles & Print */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Surah, Juz or Ayah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all"
            />
          </div>

          {/* Font Size Dropdown */}
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Size:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-emerald-950"
            >
              <option value={24}>24px</option>
              <option value={28}>28px</option>
              <option value={32}>32px</option>
              <option value={36}>36px</option>
              <option value={40}>40px</option>
            </select>
          </div>

          {/* View Mode: Grid / List */}
          <div className="flex items-center bg-gray-50 p-0.5 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Reading Mode Background Toggle */}
          <div className="flex items-center bg-gray-50 p-0.5 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setThemeMode(themeMode === 'night' ? 'cream' : 'night')}
              className="p-1.5 rounded-lg text-gray-600 hover:text-emerald-800 transition-all"
              title="Toggle Night/Day Reading Mode"
            >
              {themeMode === 'night' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all"
            title="Print Reading Ledger"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: JUZ / PARAH DASHBOARD (EXACT SCREEN FROM USER IMAGE)
          ========================================================================= */}
      {activeNavTab === 'juz' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* CAROUSEL: Select Juz / Parah */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Select Juz / Parah</h3>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600">
                Parah {selectedJuzNumber} of 30 &bull; <strong className="text-emerald-900 font-quran text-base sm:text-lg font-bold">{activeParah.nameTranslit} ( {activeParah.nameArabic} )</strong>
              </div>
            </div>

            {/* Slider Track with Left/Right Arrows */}
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center shrink-0 shadow-xs transition-all cursor-pointer"
                title="Scroll Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div 
                ref={carouselRef}
                className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 flex-1"
              >
                {QURAN_PARAHS.map((juz) => {
                  const isSelected = selectedJuzNumber === juz.number;
                  return (
                    <div
                      key={juz.number}
                      onClick={() => setSelectedJuzNumber(juz.number)}
                      className={`min-w-[105px] sm:min-w-[115px] p-3.5 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none shrink-0 ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-md border border-emerald-600 transform scale-102'
                          : 'bg-white hover:bg-emerald-50/40 text-gray-800 border border-gray-200/90 hover:border-emerald-300 shadow-xs'
                      }`}
                    >
                      <span className={`text-[10px] tracking-wider uppercase font-bold block ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                        JUZ {juz.number}
                      </span>
                      <span className={`text-lg sm:text-xl font-bold font-quran leading-loose my-1.5 ${isSelected ? 'text-white' : 'text-emerald-950'}`}>
                        {juz.nameArabic}
                      </span>
                      <span className={`text-[10px] font-semibold flex items-center gap-1.5 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                        {juz.totalVerses} Verses
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center shrink-0 shadow-xs transition-all cursor-pointer"
                title="Scroll Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LOWER SECTION: Header Bar & 3-Column Grid */}
          <div className="space-y-4">
            {/* Header Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Juz / Parah {selectedJuzNumber} &mdash; <span className="text-emerald-900 font-quran font-bold text-lg sm:text-xl">{activeParah.nameTranslit} ( {activeParah.nameArabic} )</span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xs text-gray-600 font-semibold">
                  Total: <strong className="text-gray-900">{activeParah.totalVerses} Verses</strong> | <strong className="text-gray-900">{surahsInActiveJuz.length} Surahs</strong> | <strong className="text-gray-900">{activeParah.totalRukus} Rukus</strong>
                </span>
                <button
                  type="button"
                  onClick={handleOpenFullParah}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-900 text-xs font-bold transition-all shadow-xs"
                >
                  <span>Open Full Parah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3 Columns Layout: Surahs Table (5 cols) | Progress Overview (4 cols) | Recent Activity (3 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* COLUMN 1: Surahs in Juz (5 Columns width) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-gray-900 text-sm">Surahs in Juz {selectedJuzNumber}</h4>
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">{surahsInActiveJuz.length} Surahs</span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-gray-500 font-bold border-b border-gray-100">
                        <th className="pb-2 px-2">#</th>
                        <th className="pb-2 px-2">Surah Name</th>
                        <th className="pb-2 px-2 text-right font-quran text-sm">Arabic Name</th>
                        <th className="pb-2 px-2 text-center">Verses</th>
                        <th className="pb-2 px-2 text-center">Rukus</th>
                        <th className="pb-2 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {surahsInActiveJuz.map((s, idx) => (
                        <tr key={s.number} className="hover:bg-emerald-50/40 transition-colors group">
                          <td className="py-3 px-2 font-mono font-bold text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-2 font-semibold text-gray-900">
                            <div>{s.nameEnglish}</div>
                            <div className="text-[10px] text-gray-400 font-normal">{s.type} &bull; Surah {s.number}</div>
                          </td>
                          <td className="py-3 px-2 text-right font-quran text-base font-bold text-emerald-950">
                            {s.nameArabic}
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-semibold text-gray-700">
                            {s.totalVerses}
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-semibold text-gray-700">
                            {s.totalRukus}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleReadSurah(s.number)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-900 border border-emerald-300 text-[11px] font-bold transition-all"
                              title={`Read Surah ${s.nameEnglish}`}
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Read</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* COLUMN 2: Progress Overview (4 Columns width) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-gray-900 text-sm">Progress Overview</h4>
                  </div>
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Juz {selectedJuzNumber}
                  </span>
                </div>

                {/* Donut Meter & Legend */}
                <div className="flex items-center justify-center gap-6 py-2">
                  {/* SVG Donut */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#E2E8F0"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#059669"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset="251.2"
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-gray-900 leading-none">0%</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Completed</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        Completed
                      </span>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        In Progress
                      </span>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                        Remaining
                      </span>
                      <span className="font-bold text-gray-900">{activeParah.totalVerses}</span>
                    </div>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-200/80 text-center">
                    <BookOpen className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                    <span className="text-lg font-black text-gray-900 block leading-tight">0</span>
                    <span className="text-[10px] font-semibold text-gray-600">Verses Read</span>
                  </div>

                  <div className="bg-blue-50/60 rounded-2xl p-3 border border-blue-200/80 text-center">
                    <Calendar className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                    <span className="text-lg font-black text-gray-900 block leading-tight">0</span>
                    <span className="text-[10px] font-semibold text-gray-600">Days Active</span>
                  </div>

                  <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200/80 text-center">
                    <Compass className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                    <span className="text-lg font-black text-gray-900 block leading-tight">0</span>
                    <span className="text-[10px] font-semibold text-gray-600">Avg. Daily</span>
                  </div>
                </div>

                {/* CTA: Mark Sabaq / Update Progress Button */}
                <button
                  type="button"
                  onClick={() => handleOpenAssignSabaq(activeParah.nameTranslit, 1, selectedJuzNumber)}
                  className="w-full py-2.5 rounded-xl border border-emerald-500 bg-emerald-50/80 hover:bg-emerald-600 hover:text-white text-emerald-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Mark Sabaq / Update Progress</span>
                </button>
              </div>

              {/* COLUMN 3: Recent Activity (3 Columns width) */}
              <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-gray-900 text-sm">Recent Activity</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveNavTab('cards')}
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-gray-200">
                  
                  {/* Event 1 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border-2 border-white shadow-xs z-10">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs leading-tight">
                      <h5 className="font-bold text-gray-900">Viewed Surah Al-Fatihah</h5>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Today, 10:24 AM</span>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border-2 border-white shadow-xs z-10">
                      <Bookmark className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs leading-tight">
                      <h5 className="font-bold text-gray-900">Marked Sabaq - Al-Baqarah (Verses 1-10)</h5>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Yesterday, 04:15 PM</span>
                    </div>
                  </div>

                  {/* Event 3 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 border-2 border-white shadow-xs z-10">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs leading-tight">
                      <h5 className="font-bold text-gray-900">Completed Revision - Juz 30</h5>
                      <span className="text-[10px] text-gray-400 block mt-0.5">5 Sept 2026, 11:30 AM</span>
                    </div>
                  </div>

                  {/* Event 4 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border-2 border-white shadow-xs z-10">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs leading-tight">
                      <h5 className="font-bold text-gray-900">Added Teacher Remark</h5>
                      <span className="text-[10px] text-gray-400 block mt-0.5">4 Sept 2026, 09:20 AM</span>
                    </div>
                  </div>

                  {/* Event 5 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 border-2 border-white shadow-xs z-10">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs leading-tight">
                      <h5 className="font-bold text-gray-900">New Sabaq Assigned - An-Nisa (1-20)</h5>
                      <span className="text-[10px] text-gray-400 block mt-0.5">3 Sept 2026, 02:10 PM</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: 114 SURAHS CATALOG
          ========================================================================= */}
      {activeNavTab === 'surahs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Holy Quran &mdash; All 114 Surahs (فهرست سُوَر القرآن الكريم)</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveNavTab('juz')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Juz Dashboard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredSurahs.map((s) => (
              <div
                key={s.number}
                onClick={() => handleReadSurah(s.number)}
                className="bg-white hover:bg-emerald-50/40 p-4 rounded-2xl border border-gray-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-emerald-700 group-hover:text-white text-gray-700 flex items-center justify-center font-bold text-xs font-mono transition-colors">
                    {s.number}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm group-hover:text-emerald-900 transition-colors">{s.nameEnglish}</h5>
                    <span className="text-[11px] text-gray-500 block">
                      {s.type} &bull; {s.totalVerses} Verses
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-quran text-lg font-bold text-emerald-950 block leading-tight">
                    {s.nameArabic}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Read &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: INDOPAK 15 LINES - QUDRATULLAH LAYOUT (PAGE 1 - 610)
          Adopted directly from QUL Tarteel (https://qul.tarteel.ai/mushaf_layouts/6)
          Strictly rendered in "QuranFont-Original" with Zero CSS Gradients
          ========================================================================= */}
      {activeNavTab === 'mushaf' && (
        <Indopak15LinesMushaf
          initialPage={initialMushafPage}
          allSurahs={allSurahs}
          onAssignSabaq={handleOpenAssignSabaq}
          onPlayAyahAudio={handlePlayAudio}
        />
      )}

      {/* =========================================================================
          VIEW 4: VERSE CARDS READING CANVAS
          Strictly rendered in "QuranFont-Original"
          ========================================================================= */}
      {activeNavTab === 'cards' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Reader Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs no-print">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveNavTab('juz')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Juz Dashboard</span>
              </button>

              <div className="w-px h-6 bg-gray-200" />

              <span className="text-xs font-bold text-gray-800">
                Displaying: <strong className="text-emerald-900 font-bold">'Verse Cards Mode (بطاقات الآيات)'</strong>
              </span>
            </div>

            {/* Font Indicator Badge */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs font-medium">Font:</span>
              <span className="font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 font-mono text-[11px]">
                Al Qalam Quran Publisher &bull; خط القلم قرآن پبلشر
              </span>
            </div>
          </div>

          {/* QURAN READING CANVAS */}
          <div 
            className={`rounded-3xl border shadow-xs p-6 sm:p-10 transition-all duration-300 ${
              themeMode === 'cream'
                ? 'bg-[#FDFBF7] text-[#0B3A2C] border-[#E8DFC8]'
                : themeMode === 'parchment'
                  ? 'bg-[#F5EFEB] text-[#2C2416] border-[#DDD3C1]'
                  : 'bg-[#121B17] text-[#E0EAE5] border-[#1F332B]'
            }`}
          >
            {isLoading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-quran text-xl text-emerald-900">جاري تحميل القرآن الكريم بخط القلم قرآن پبلشر...</p>
                <span className="text-xs text-gray-500 font-mono">Loading 6,236 authentic Quranic verses in Al Qalam Quran Publisher</span>
              </div>
            ) : displayedReaderContent.length === 0 ? (
              <div className="py-20 text-center text-gray-500 space-y-2">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="font-quran text-lg">لم يتم العثور على نتائج</p>
                <span className="text-xs">Try selecting another Surah or Parah from the tabs.</span>
              </div>
            ) : (
              <div className="space-y-12">
                {displayedReaderContent.map((section) => {
                  const surahMeta = section.surah;
                  return (
                    <div key={surahMeta.number} className="space-y-8">
                      
                      {/* SURAH TITLE HEADER BANNER */}
                      <div className="text-center space-y-2 border-b pb-6 border-emerald-900/20">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100/70 text-emerald-900 text-xs font-bold">
                          <span>{surahMeta.number}. سورة {surahMeta.nameArabic}</span>
                          <span>&bull;</span>
                          <span>{surahMeta.nameEnglish}</span>
                          <span>&bull;</span>
                          <span>{surahMeta.totalVerses} آیات</span>
                          <span>&bull;</span>
                          <span>{surahMeta.type === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                        </div>
                        
                        <h2 className="font-quran font-bold text-3xl sm:text-4xl text-emerald-950">
                          سُورَةُ {surahMeta.nameArabic}
                        </h2>

                        {/* BISMILLAH (Except Surah At-Tawbah #9) */}
                        {surahMeta.number !== 9 && (
                          <div className="pt-3">
                            <p className="font-quran text-center font-bold text-emerald-950 select-none text-xl sm:text-2xl">
                              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                          {section.verses.map((ayah) => {
                            const isPlaying = playingAyah?.surah === surahMeta.number && playingAyah?.ayah === ayah.id;
                            const isCopied = copiedAyahKey === `${surahMeta.number}_${ayah.id}`;

                            return (
                              <div
                                key={ayah.id}
                                className="p-4 sm:p-6 rounded-2xl bg-white/70 border border-emerald-900/15 hover:border-emerald-600/40 transition-all space-y-3"
                              >
                                <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold font-mono text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                                      {surahMeta.number}:{ayah.id}
                                    </span>
                                    <span>Juz {ayah.juz} &bull; Ruku {ayah.ruku}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handlePlayAudio(surahMeta.number, ayah.id)}
                                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                                        isPlaying ? 'bg-amber-600 text-white border-amber-600' : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                      }`}
                                      title="Listen to verse recitation"
                                    >
                                      {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                      <span>{isPlaying ? 'Stop' : 'Play'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleCopyAyah(surahMeta.number, ayah.id, ayah.text)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-bold"
                                      title="Copy verse text"
                                    >
                                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenAssignSabaq(surahMeta.nameEnglish, ayah.id, ayah.juz)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold"
                                      title="Assign as student Sabaq"
                                    >
                                      <Bookmark className="w-3 h-3 text-emerald-700" />
                                      <span>Set as Sabaq</span>
                                    </button>
                                  </div>
                                </div>

                                <div 
                                  dir="rtl"
                                  className="font-quran font-bold leading-loose text-emerald-950 select-text w-full"
                                  style={{ 
                                    fontSize: `${fontSize}px`,
                                    textAlign: 'justify',
                                    textJustify: 'inter-word'
                                  }}
                                >
                                  {ayah.text}
                                  <span className="inline-block text-amber-700 font-quran mr-2 select-none">
                                    {toVerseSymbol(ayah.id)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SABAQ ASSIGNMENT MODAL
          ========================================================================= */}
      {showAssignSabaqModal && (
        <Modal
          isOpen={showAssignSabaqModal}
          onClose={() => setShowAssignSabaqModal(false)}
          title="Assign Current Quran Sabaq to Student (طالب علم کے لیے نیا سبق مقرر کریں)"
        >
          <form onSubmit={handleSaveStudentSabaq} className="space-y-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
              <span className="text-gray-500 font-bold block uppercase tracking-wider text-[10px]">Selected Quran Milestone</span>
              <strong className="text-base text-emerald-950 font-quran">{targetSabaqString}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Student (طالب علم منتخب کریں) *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              >
                {madrasaStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.studentName} ({s.studentNameUrdu || s.admissionNo}) &bull; Class: {s.class}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignSabaqModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
              >
                Confirm &amp; Update Student Record
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
