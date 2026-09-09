import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../services/i18n';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface FontOption {
  id: string;
  name: string;
  nativeLabel: string;
  cssFamily: string;
  subtext: string;
}

export const URDU_FONT_OPTIONS: FontOption[] = [
  { id: 'Al Qalam Quran Publisher', name: 'Al Qalam Quran Publisher', nativeLabel: 'القلم قرآن پبلشر (Al Qalam Quran Publisher)', cssFamily: "'Al Qalam Quran Publisher', 'QuranFont-Original', '_PDMS_Saleem_QuranFont', 'Traditional Arabic', serif", subtext: 'Premium authentic Indopak Quranic typography for Holy Quran pages and verses' },
  { id: 'Jameel Noori Nastaleeq', name: 'Jameel Noori Nastaleeq', nativeLabel: 'جمیل نوری نستعلیق (معیاری اردو)', cssFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", subtext: 'Standard South Asian Nastaleeq script for official documents' },
  { id: 'Traditional Arabic', name: 'Traditional Arabic Bold', nativeLabel: 'روایتی عربی خط (Traditional Arabic)', cssFamily: "'Traditional Arabic', 'Amiri', serif", subtext: 'Authentic classical Arabic Naskh bold weight for clear reading' },
  { id: 'Alyamama', name: 'Alyamama Modern Arabic', nativeLabel: 'خط الیمامة (Alyamama Display)', cssFamily: "'Alyamama', 'Traditional Arabic', sans-serif", subtext: 'Modern clean geometric Arabic & Urdu typography' },
  { id: 'QuranFont-Original', name: 'QuranFont-Original', nativeLabel: 'خطِ قرآن اصلی (QuranFont-Original)', cssFamily: "'QuranFont-Original', '_PDMS_Saleem_QuranFont', 'QuranFont', 'Traditional Arabic', serif", subtext: 'Original classical Uthmani / Saleem QuranFont for sacred Quran verses' },
  { id: 'QuranFont', name: 'QuranFont-Original (Saleem)', nativeLabel: 'خطِ قرآن (QuranFont-Original)', cssFamily: "'QuranFont-Original', '_PDMS_Saleem_QuranFont', 'QuranFont', 'Traditional Arabic', serif", subtext: 'Original classical Uthmani / Saleem QuranFont for sacred Quran verses' },
  { id: 'Muhammadi Quranic', name: 'Muhammadi Quranic Font', nativeLabel: 'محمدی قرآنی فونٹ (Muhammadi Quranic)', cssFamily: "'1 MUHAMMADI QURANIC', 'Muhammadi Quranic', 'QuranFont-Original', serif", subtext: 'Authentic sacred Muhammadi Quranic calligraphy with complete diacritics and ayaat symbols' },
  { id: 'Jameel Noori Kasheeda', name: 'Jameel Noori Kasheeda', nativeLabel: 'جمیل نوری کشیدہ (خوبصورت خطاطی)', cssFamily: "'Jameel Noori Kasheeda', 'Jameel Noori Nastaleeq', serif", subtext: 'Calligraphic kashida horizontal stretch for sanad & honors' },
  { id: 'AA Sameer Sagar', name: 'AA Sameer Sagar Bold', nativeLabel: 'سمیر ساگر جلی (اعلانات و عنوانات)', cssFamily: "'AA Sameer Sagar', 'Jameel Noori Nastaleeq', serif", subtext: 'Heavy bold headline script for titles and badges' },
  { id: 'AlQalam Taj', name: 'AlQalam Taj Nastaleeq', nativeLabel: 'القلم تاج نستعلیق', cssFamily: "'AlQalam Taj', 'Jameel Noori Nastaleeq', serif", subtext: 'Traditional manuscript nuance' },
  { id: 'Faiz Lahori', name: 'Faiz Lahori Nastaleeq', nativeLabel: 'فیض لاہوری خطاطی', cssFamily: "'Faiz Lahori', 'Jameel Noori Nastaleeq', serif", subtext: 'Authentic publishing house script' }
];

export const ENGLISH_FONT_OPTIONS: FontOption[] = [
  { id: 'Inter', name: 'Inter Display', nativeLabel: 'Inter (Clean Standard)', cssFamily: "'Inter', system-ui, sans-serif", subtext: 'Modern Material-3 default' },
  { id: 'Montserrat', name: 'Montserrat', nativeLabel: 'Montserrat (Geometric)', cssFamily: "'Montserrat', sans-serif", subtext: 'Prestigious institutional typeface' },
  { id: 'Roboto', name: 'Roboto', nativeLabel: 'Roboto (Data Grid)', cssFamily: "'Roboto', sans-serif", subtext: 'Clean tabular figures and cards' },
  { id: 'Bebas Neue Pro', name: 'Bebas Neue Pro', nativeLabel: 'Bebas Neue (Bold Tall)', cssFamily: "'Bebas Neue Pro', 'Oswald', sans-serif", subtext: 'High-impact badge & number display' },
  { id: 'Oswald', name: 'Oswald', nativeLabel: 'Oswald (Condensed)', cssFamily: "'Oswald', sans-serif", subtext: 'Compact metrics & banners' }
];

export type ThemeMode = 'shiny-white' | 'transparent-glossy';

export interface ThemeDefinition {
  id: ThemeMode;
  name: string;
  nameUrdu: string;
  tagline: string;
  previewBg: string;
  previewSurface: string;
  previewBorder: string;
  dotPrimary: string;
  dotSecondary: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'shiny-white',
    name: 'Shiny White',
    nameUrdu: 'معیاری چمکدار سفید',
    tagline: 'Bright premium white workspace with subtle glossy surfaces and clean contrast',
    previewBg: '#F4F8FB',
    previewSurface: 'rgba(255, 255, 255, 0.88)',
    previewBorder: 'rgba(90, 120, 145, 0.18)',
    dotPrimary: '#079669',
    dotSecondary: '#123B63'
  },
  {
    id: 'transparent-glossy',
    name: 'Transparent Glossy',
    nameUrdu: 'شفاف گلاسی شیشہ',
    tagline: 'Glass-like translucent interface with luminous borders, soft shadows and blur',
    previewBg: '#EAF2F7',
    previewSurface: 'rgba(255, 255, 255, 0.58)',
    previewBorder: 'rgba(255, 255, 255, 0.72)',
    dotPrimary: '#079669',
    dotSecondary: '#7655D6'
  }
];

export type ThemePaletteId = 'emerald' | 'sapphire' | 'amethyst' | 'amber' | 'ruby';

export interface ThemePalette {
  id: ThemePaletteId;
  name: string;
  nameUrdu: string;
  primary: string;
  glow: string;
  dotColor: string;
  badgeClass: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'emerald',
    name: 'Emerald Pearl Glass',
    nameUrdu: 'زمردی درخشاں شیشہ',
    primary: '#059669',
    glow: 'rgba(16, 185, 129, 0.35)',
    dotColor: '#10b981',
    badgeClass: 'bg-emerald-600 text-white'
  },
  {
    id: 'sapphire',
    name: 'Sapphire Diamond Glass',
    nameUrdu: 'الماسی نیلم شیشہ',
    primary: '#0284c7',
    glow: 'rgba(14, 165, 233, 0.35)',
    dotColor: '#0284c7',
    badgeClass: 'bg-sky-600 text-white'
  },
  {
    id: 'amethyst',
    name: 'Amethyst Royale Glass',
    nameUrdu: 'شاہی یاقوت شیشہ',
    primary: '#7c3aed',
    glow: 'rgba(124, 58, 237, 0.35)',
    dotColor: '#8b5cf6',
    badgeClass: 'bg-purple-600 text-white'
  },
  {
    id: 'amber',
    name: 'Amber Topaz Gold Glass',
    nameUrdu: 'عنبری زریں شیشہ',
    primary: '#d97706',
    glow: 'rgba(245, 158, 11, 0.35)',
    dotColor: '#f59e0b',
    badgeClass: 'bg-amber-600 text-white'
  },
  {
    id: 'ruby',
    name: 'Ruby Rose Quartz Glass',
    nameUrdu: 'یاقوتی احمر شیشہ',
    primary: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.35)',
    dotColor: '#f43f5e',
    badgeClass: 'bg-rose-600 text-white'
  }
];

interface ThemeContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  // Core Theme Mode (Shiny White / Transparent Glossy)
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  themes: ThemeDefinition[];
  // Theme Color Palette
  themePalette: ThemePaletteId;
  setThemePalette: (palette: ThemePaletteId) => void;
  // Dynamic Font Preferences
  urduFont: string;
  setUrduFont: (fontId: string) => void;
  englishFont: string;
  setEnglishFont: (fontId: string) => void;
  resetFonts: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mms_language') as Language) || 'en';
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('mms_erp_theme') as ThemeMode) || 'transparent-glossy';
  });

  const [themePalette, setThemePaletteState] = useState<ThemePaletteId>(() => {
    return (localStorage.getItem('mms_pref_theme_palette') as ThemePaletteId) || 'emerald';
  });
  
  // Font preferences
  const [urduFont, setUrduFontState] = useState<string>(() => {
    return localStorage.getItem('mms_pref_urdu_font') || 'Jameel Noori Nastaleeq';
  });
  const [englishFont, setEnglishFontState] = useState<string>(() => {
    return localStorage.getItem('mms_pref_english_font') || 'Inter';
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem('mms_language', language);
    const htmlEl = document.documentElement;
    if (language === 'ur') {
      htmlEl.setAttribute('dir', 'rtl');
      htmlEl.setAttribute('lang', 'ur');
      document.body.classList.add('urdu-font');
    } else {
      htmlEl.setAttribute('dir', 'ltr');
      htmlEl.setAttribute('lang', 'en');
      document.body.classList.remove('urdu-font');
    }
  }, [language]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: keyof typeof translations.en): string => {
    const langDict = translations[language] || translations.en;
    // @ts-ignore
    return langDict[key] || translations.en[key] || key;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Apply Core Theme Mode (Shiny White / Transparent Glossy)
  useEffect(() => {
    localStorage.setItem('mms_erp_theme', themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  // Apply Theme Palette CSS Variables
  useEffect(() => {
    localStorage.setItem('mms_pref_theme_palette', themePalette);
    const pal = THEME_PALETTES.find(p => p.id === themePalette) || THEME_PALETTES[0];
    document.documentElement.style.setProperty('--theme-primary', pal.primary);
  }, [themePalette]);

  const setThemePalette = (palette: ThemePaletteId) => {
    setThemePaletteState(palette);
  };

  // Apply Font CSS Variables
  useEffect(() => {
    localStorage.setItem('mms_pref_urdu_font', urduFont);
    const found = URDU_FONT_OPTIONS.find(f => f.id === urduFont) || URDU_FONT_OPTIONS[0];
    document.documentElement.style.setProperty('--font-urdu-family', found.cssFamily);
  }, [urduFont]);

  useEffect(() => {
    localStorage.setItem('mms_pref_english_font', englishFont);
    const found = ENGLISH_FONT_OPTIONS.find(f => f.id === englishFont) || ENGLISH_FONT_OPTIONS[0];
    document.documentElement.style.setProperty('--font-english-family', found.cssFamily);
  }, [englishFont]);

  const setUrduFont = (fontId: string) => {
    setUrduFontState(fontId);
  };

  const setEnglishFont = (fontId: string) => {
    setEnglishFontState(fontId);
  };

  const resetFonts = () => {
    setUrduFontState('Jameel Noori Nastaleeq');
    setEnglishFontState('Inter');
  };

  return (
    <ThemeContext.Provider value={{
      language,
      setLanguage,
      t,
      isFullscreen,
      toggleFullscreen,
      toasts,
      showToast,
      removeToast,
      themeMode,
      setThemeMode,
      themes: THEMES,
      themePalette,
      setThemePalette,
      urduFont,
      setUrduFont,
      englishFont,
      setEnglishFont,
      resetFonts,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
