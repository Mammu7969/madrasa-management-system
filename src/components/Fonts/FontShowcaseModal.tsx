import React, { useState } from 'react';
import { 
  Type, 
  BookOpen, 
  Sparkles, 
  Languages, 
  Check, 
  Copy, 
  Download, 
  Sliders, 
  Eye, 
  RefreshCw,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FontShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FontCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  fonts: {
    name: string;
    fontFamily: string;
    className: string;
    sampleText: string;
    category: 'urdu' | 'quran' | 'english';
    subtext: string;
    recommendedFor: string;
  }[];
}

export const FontShowcaseModal: React.FC<FontShowcaseModalProps> = ({ isOpen, onClose }) => {
  const { setUrduFont, setEnglishFont, showToast } = useTheme();
  const [activeTab, setActiveTab] = useState<'urdu' | 'quran' | 'english'>('urdu');
  const [customText, setCustomText] = useState('');
  const [fontSize, setFontSize] = useState<number>(24);
  const [copiedFont, setCopiedFont] = useState<string | null>(null);

  // Active preferences stored in localStorage
  const [selectedUrduFont, setSelectedUrduFont] = useState(() => 
    localStorage.getItem('mms_pref_urdu_font') || 'Jameel Noori Nastaleeq'
  );
  const [selectedQuranFont, setSelectedQuranFont] = useState(() => 
    localStorage.getItem('mms_pref_quran_font') || 'QuranFont-Original'
  );

  const categories: FontCategory[] = [
    {
      id: 'urdu',
      name: 'Urdu & Arabic',
      description: 'Authentic local Nastaliq & classical Arabic typefaces for Urdu notices, Roznamchah, and student reports',
      icon: Languages,
      fonts: [
        {
          name: 'Jameel Noori Nastaleeq',
          fontFamily: "'Jameel Noori Nastaleeq', serif",
          className: 'font-jameel',
          sampleText: 'مدرسہ مینیجمنٹ سسٹم: علم و حکمت، بہترین تعلیم اور باوقار تربیت کا جدید نظام',
          category: 'urdu',
          subtext: 'The gold standard in South Asian Nastaliq calligraphy with unmatched ligature flow.',
          recommendedFor: 'Official Announcements, Student Dossier, Roznamchah'
        },
        {
          name: 'Traditional Arabic',
          fontFamily: "'Traditional Arabic', serif",
          className: 'font-trad-arabic',
          sampleText: 'مدرسہ مینیجمنٹ سسٹم: دینی تعلیم، حفظِ قرآن اور تربیت کا مستند نظام',
          category: 'urdu',
          subtext: 'Classic Arabic Naskh script bold weight applied cleanly to Urdu text and reports.',
          recommendedFor: 'Clear Urdu & Arabic Documents, Registers, Notices'
        },
        {
          name: 'Alyamama',
          fontFamily: "'Alyamama', sans-serif",
          className: 'font-alyamama font-bold',
          sampleText: 'جامعہ و مدرسہ مینیجمنٹ سسٹم - جدید خطاطی و ریکارڈ',
          category: 'urdu',
          subtext: 'Modern geometric contemporary Arabic display typeface applied to Urdu headers.',
          recommendedFor: 'Modern Dashboard Badges, Navigation Labels, Reports'
        },
        {
          name: 'QuranFont-Original',
          fontFamily: "'QuranFont-Original', '_PDMS_Saleem_QuranFont', 'QuranFont', serif",
          className: 'font-quran',
          sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • روزنامچہ برائے طلبہ حفظ و ناظرہ',
          category: 'urdu',
          subtext: 'Original classical Uthmani / Saleem QuranFont for sacred verses and Sabaq.',
          recommendedFor: 'Holy Quran, Hifz Tracker, Sabaq Registers, Islamic Quotes'
        },
        {
          name: 'Jameel Noori Kasheeda',
          fontFamily: "'Jameel Noori Kasheeda', serif",
          className: 'font-kasheeda',
          sampleText: 'طالبِ علم کا تعلیمی ریکارڈ اور روزنامچہ برائے حفظِ قرآنِ مجید',
          category: 'urdu',
          subtext: 'Features graceful elongated horizontal letter extensions (Kashida).',
          recommendedFor: 'Certificates, Sanad, Honors & Awards'
        },
        {
          name: 'AA Sameer Sagar Nastaleeq',
          fontFamily: "'AA Sameer Sagar', serif",
          className: 'font-sameer',
          sampleText: 'جامعہ کی اہم ہدایات برائے سالانہ امتحانات و داخلہ جات',
          category: 'urdu',
          subtext: 'Heavy bold strokes designed specifically for high-visibility headlines and banners.',
          recommendedFor: 'Banners, Notice Board Headings, ID Card Titles'
        },
        {
          name: 'AlQalam Taj Nastaleeq',
          fontFamily: "'AlQalam Taj', serif",
          className: 'font-alqalam',
          sampleText: 'طلباء کی روزانہ حاضری، فیس کی رسید اور کردار و اخلاق کی رپورٹ',
          category: 'urdu',
          subtext: 'Traditional manuscript-grade Nastaleeq styling with fine stroke nuances.',
          recommendedFor: 'Syllabus, Detailed Reports, Marksheets'
        },
        {
          name: 'Faiz Lahori Nastaleeq',
          fontFamily: "'Faiz Lahori', serif",
          className: 'font-faiz',
          sampleText: 'علم نافع، حسنِ اخلاق اور سنتِ نبوی کے مطابق دینی و اخلاقی تربیت',
          category: 'urdu',
          subtext: 'Authentic Lahori Nastaliq script celebrated across prominent Islamic publishers.',
          recommendedFor: 'Character Certificates, Library Catalogs'
        }
      ]
    },
    {
      id: 'quran',
      name: 'Quranic & Arabic',
      description: 'Reverent Uthmani calligraphy & modern Arabic display fonts for Sabaq, Ayahs, and Hadith',
      icon: BookOpen,
      fonts: [
        {
          name: 'QuranFont-Original (خطِ قرآن اصلی)',
          fontFamily: "'QuranFont-Original', '_PDMS_Saleem_QuranFont', 'QuranFont', serif",
          className: 'font-quran',
          sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ۝',
          category: 'quran',
          subtext: 'Original classical Saleem QuranFont (QuranFont-Original) for authentic Quranic verses, Sabaq, and Tilawat.',
          recommendedFor: 'Holy Quran Reading, Hifz Tracker, Sabaq, Sabqi, Manzil, Hadith'
        },
        {
          name: 'Alyamama Modern Arabic',
          fontFamily: "'Alyamama', sans-serif",
          className: 'font-alyamama font-bold',
          sampleText: 'نظام إدارة المدرسة الإسلامية - متابعة الحفظ والتعليم اليومي',
          category: 'quran',
          subtext: 'Clean, geometric contemporary Arabic typeface for dashboard metrics and modern UI.',
          recommendedFor: 'Arabic Headers, Navigation Labels, Modern Reports'
        },
        {
          name: 'Traditional Arabic Bold',
          fontFamily: "'Traditional Arabic', serif",
          className: 'font-trad-arabic',
          sampleText: 'قال رسول الله ﷺ: «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»',
          category: 'quran',
          subtext: 'Authoritative classical Arabic bold weight used across Islamic jurisprudence and jurisprudence texts.',
          recommendedFor: 'Hadith Quotations, Sanad Text, Formal Declarations'
        }
      ]
    },
    {
      id: 'english',
      name: 'Modern & Display',
      description: 'Crisp, high-impact Latin typefaces for student IDs, certificate borders, and dashboard stats',
      icon: Award,
      fonts: [
        {
          name: 'Bebas Neue Pro',
          fontFamily: "'Bebas Neue Pro', sans-serif",
          className: 'font-bebas font-bold',
          sampleText: 'ADMISSION NO: MDS-2024-8921 • ROLL NO: 14 • HIFZ SECTION A',
          category: 'english',
          subtext: 'Tall condensed headline font commanding attention on official cards and counters.',
          recommendedFor: 'Smart ID Card Badges, Roll Numbers, Live Namaz Timers'
        },
        {
          name: 'Oswald',
          fontFamily: "'Oswald', sans-serif",
          className: 'font-oswald font-semibold',
          sampleText: 'MADRASA MANAGEMENT SYSTEM • ENTERPRISE EDITION 2025',
          category: 'english',
          subtext: 'Balanced narrow grotesque font engineered for clean tabular figures and banners.',
          recommendedFor: 'Header Navigation, Statistical Metrics, Voucher Codes'
        },
        {
          name: 'Montserrat',
          fontFamily: "'Montserrat', sans-serif",
          className: 'font-montserrat font-semibold',
          sampleText: 'Certificate of Excellence in Tahfeez-ul-Quran & Islamic Studies',
          category: 'english',
          subtext: 'Premium geometric typeface lending prestige to formal institutional documents.',
          recommendedFor: 'Certificates of Completion, Sanad Headings, Formal Letters'
        },
        {
          name: 'Roboto',
          fontFamily: "'Roboto', sans-serif",
          className: 'font-roboto',
          sampleText: 'Clean and readable UI typography for tables, data grids, and form inputs.',
          category: 'english',
          subtext: 'Neutral neo-grotesque standard ensuring maximum clarity for dense data.',
          recommendedFor: 'Form Fields, Data Tables, System Dialogs'
        }
      ]
    }
  ];

  const currentCategory = categories.find(c => c.id === activeTab)!;

  const handleApplyFont = (font: any) => {
    if (font.category === 'urdu') {
      setSelectedUrduFont(font.name);
      setUrduFont(font.name);
      localStorage.setItem('mms_pref_urdu_font', font.name);
      document.documentElement.style.setProperty('--font-pref-urdu', font.fontFamily);
      showToast(`Urdu & Arabic script updated to ${font.name}`, 'success');
    } else if (font.category === 'quran') {
      setSelectedQuranFont(font.name);
      setUrduFont(font.name); // Also update Urdu when selecting Quranic Arabic font
      localStorage.setItem('mms_pref_quran_font', font.name);
      localStorage.setItem('mms_pref_urdu_font', font.name);
      document.documentElement.style.setProperty('--font-pref-quran', font.fontFamily);
      showToast(`Sacred Quranic typography updated to ${font.name}`, 'success');
    } else if (font.category === 'english') {
      setEnglishFont(font.name);
      showToast(`English & Display font updated to ${font.name}`, 'success');
    }
  };

  const copyFontName = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedFont(name);
    setTimeout(() => setCopiedFont(null), 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-m3-surface-container-lowest border border-m3-outline-variant rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-m3-outline-variant flex items-center justify-between bg-m3-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-m3-primary/10 flex items-center justify-center text-m3-primary shadow-sm">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-m3-on-surface">Offline Typography Suite</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-m3-primary-container text-m3-on-primary-container">
                  170+ Local Font Files Active
                </span>
              </div>
              <p className="text-xs text-m3-on-surface-variant">
                Integrated from <code className="bg-m3-surface-container px-1 py-0.5 rounded text-[11px] font-mono">src/components/Fonts</code> for offline high-fidelity Urdu Nastaliq, Quran & Display rendering.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-m3-surface-container-high flex items-center justify-center text-m3-on-surface-variant transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 pb-2 border-b border-m3-outline-variant bg-m3-surface-container-lowest flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-m3-primary text-m3-on-primary shadow-sm'
                      : 'text-m3-on-surface-variant hover:bg-m3-surface-container'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Font Controls */}
          <div className="flex items-center gap-4 text-xs text-m3-on-surface-variant">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Preview Size: {fontSize}px</span>
              <input 
                type="range" 
                min="16" 
                max="42" 
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-24 accent-m3-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Custom Input Field */}
        <div className="px-6 py-3 bg-m3-surface-container-low border-b border-m3-outline-variant flex items-center gap-3">
          <span className="text-xs font-semibold text-m3-on-surface-variant whitespace-nowrap">Test Custom Text:</span>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={
              activeTab === 'urdu' ? 'یہاں اپنا اردو متن لکھ کر تمام خطاطی فونٹ کا جائزہ لیں...' :
              activeTab === 'quran' ? 'اكتب هنا آية كريمة أو حديثاً شريفاً للمعاينة...' :
              'Type custom text here to preview in Bebas, Oswald, Montserrat...'
            }
            dir={activeTab === 'urdu' || activeTab === 'quran' ? 'rtl' : 'ltr'}
            className="flex-1 px-4 py-1.5 rounded-lg border border-m3-outline-variant bg-m3-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-m3-primary"
          />
          {customText && (
            <button 
              onClick={() => setCustomText('')}
              className="text-xs text-m3-on-surface-variant hover:text-m3-primary px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Font List Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-m3-on-surface">{currentCategory.name} Typography</h3>
            <p className="text-xs text-m3-on-surface-variant">{currentCategory.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentCategory.fonts.map((font, idx) => {
              const isSelectedDefault = 
                (font.category === 'urdu' && selectedUrduFont === font.name) ||
                (font.category === 'quran' && selectedQuranFont === font.name);

              return (
                <div 
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelectedDefault 
                      ? 'border-m3-primary bg-m3-primary/[0.03] shadow-md ring-1 ring-m3-primary/30' 
                      : 'border-m3-outline-variant bg-m3-surface-container-lowest hover:border-m3-outline'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-m3-on-surface">{font.name}</h4>
                        {isSelectedDefault && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-m3-primary bg-m3-primary/10 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Active Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-m3-on-surface-variant mt-0.5">{font.subtext}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyFontName(font.name)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-m3-outline-variant hover:bg-m3-surface-container text-m3-on-surface-variant flex items-center gap-1 transition-colors"
                        title="Copy font name"
                      >
                        {copiedFont === font.name ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedFont === font.name ? 'Copied' : 'CSS Name'}</span>
                      </button>

                      <button
                        onClick={() => handleApplyFont(font)}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                          isSelectedDefault
                            ? 'bg-m3-primary text-m3-on-primary'
                            : 'bg-m3-surface-container-high text-m3-on-surface hover:bg-m3-primary hover:text-m3-on-primary'
                        }`}
                      >
                        {isSelectedDefault ? 'Primary' : 'Set as Primary'}
                      </button>
                    </div>
                  </div>

                  {/* Rendered Text Preview */}
                  <div 
                    className={`p-4 rounded-xl bg-m3-surface-container-low/50 border border-m3-outline-variant/60 overflow-x-auto ${font.className}`}
                    style={{ 
                      fontSize: `${fontSize}px`,
                      fontFamily: font.fontFamily,
                      direction: font.category === 'urdu' || font.category === 'quran' ? 'rtl' : 'ltr',
                      textAlign: font.category === 'urdu' || font.category === 'quran' ? 'right' : 'left'
                    }}
                  >
                    {customText || font.sampleText}
                  </div>

                  {/* Recommended For pill */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-m3-on-surface-variant">
                    <span><strong>Ideal for:</strong> {font.recommendedFor}</span>
                    <span className="font-mono text-[10px] opacity-75">font-family: {font.fontFamily}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-m3-outline-variant bg-m3-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-m3-on-surface-variant">
            <Sparkles className="w-4 h-4 text-m3-primary" />
            <span>Local fonts are bundled with zero external internet dependencies for 100% offline uptime.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-m3-primary text-m3-on-primary text-sm font-medium rounded-xl hover:bg-opacity-90 shadow-sm transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
