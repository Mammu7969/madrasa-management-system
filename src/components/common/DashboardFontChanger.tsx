import React, { useState } from 'react';
import { 
  Type, 
  Sparkles, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { 
  useTheme, 
  URDU_FONT_OPTIONS, 
  ENGLISH_FONT_OPTIONS 
} from '../../context/ThemeContext';
import { FontShowcaseModal } from '../Fonts/FontShowcaseModal';

interface DashboardFontChangerProps {
  compact?: boolean;
}

export const DashboardFontChanger: React.FC<DashboardFontChangerProps> = ({ compact = false }) => {
  const { 
    urduFont, 
    setUrduFont, 
    englishFont, 
    setEnglishFont, 
    resetFonts,
    showToast 
  } = useTheme();

  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);
  const [showFullModal, setShowFullModal] = useState<boolean>(false);

  const activeUrdu = URDU_FONT_OPTIONS.find(f => f.id === urduFont) || URDU_FONT_OPTIONS[0];
  const activeEnglish = ENGLISH_FONT_OPTIONS.find(f => f.id === englishFont) || ENGLISH_FONT_OPTIONS[0];

  const handleReset = () => {
    resetFonts();
    showToast('Typography restored to default standard fonts!', 'info');
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-m3-outline-variant/40 shadow-m3-1 overflow-hidden transition-all duration-300">
        
        {/* Header Strip */}
        <div className="px-5 py-3.5 bg-emerald-50/60 border-b border-m3-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-m3-primary/10 flex items-center justify-center text-m3-primary shadow-2xs">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-m3-on-surface uppercase tracking-wider">
                  Script & Fonts Changer (خطاطی اور رسم الخط تبدیل کریں)
                </h4>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Live Dynamic Engine
                </span>
              </div>
              <p className="text-[11px] text-m3-on-surface-variant">
                Instantly transforms all headings, student records, and cards for Urdu & English
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Badges of Active Fonts */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px]">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-semibold shadow-2xs">
                Urdu: <strong className="font-urdu">{activeUrdu.name}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-amber-900 font-semibold shadow-2xs">
                English: <strong>{activeEnglish.name}</strong>
              </span>
            </div>

            <button
              onClick={() => setShowFullModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-m3-primary/10 hover:bg-m3-primary text-m3-primary hover:text-white text-xs font-bold transition-colors"
              title="Open Advanced Font Studio & Testing"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Advanced Studio</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl hover:bg-m3-surface-container text-gray-500 hover:text-gray-900 transition-colors"
              title="Reset All Fonts to Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-1.5 rounded-xl hover:bg-m3-surface-container text-gray-500 hover:text-gray-900 transition-colors"
              title={isExpanded ? "Collapse Controls" : "Expand Controls"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Selector Body */}
        {isExpanded && (
          <div className="p-5 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Urdu Nastaliq Dropdown */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Urdu & Arabic Script (اردو و عربی رسم الخط)</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    {URDU_FONT_OPTIONS.length} Styles (نستعلیق و عربی)
                  </span>
                </div>

                <select
                  value={urduFont}
                  onChange={(e) => {
                    setUrduFont(e.target.value);
                    showToast(`Urdu font changed to ${e.target.value}`, 'success');
                  }}
                  className="w-full p-2 text-xs rounded-xl border border-emerald-300 bg-white font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {URDU_FONT_OPTIONS.map(font => (
                    <option key={font.id} value={font.id}>
                      {font.name} — {font.nativeLabel}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-emerald-800/80 italic">
                  {activeUrdu.subtext}
                </p>
              </div>

              {/* 2. English & Numbers Dropdown */}
              <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span>English & Numerals (Display)</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    5 Styles
                  </span>
                </div>

                <select
                  value={englishFont}
                  onChange={(e) => {
                    setEnglishFont(e.target.value);
                    showToast(`English font changed to ${e.target.value}`, 'success');
                  }}
                  className="w-full p-2 text-xs rounded-xl border border-amber-300 bg-white font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {ENGLISH_FONT_OPTIONS.map(font => (
                    <option key={font.id} value={font.id}>
                      {font.name} — {font.nativeLabel}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-800/80 italic">
                  {activeEnglish.subtext}
                </p>
              </div>

            </div>

            {/* Live Synchronized Render Strip */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-500 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-m3-primary" />
                <span className="font-bold text-[11px] uppercase tracking-wide">Live Preview:</span>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-center md:text-left">
                {/* Urdu Preview */}
                <div 
                  className="p-2 rounded-xl bg-white border text-emerald-950 font-bold"
                  style={{ fontFamily: activeUrdu.cssFamily, direction: 'rtl' }}
                >
                  <span className="text-[10px] text-gray-400 block" style={{ direction: 'ltr' }}>Urdu [{activeUrdu.name}]:</span>
                  جامعہ دارالعلوم و مدرسہ مینیجمنٹ سسٹم
                </div>

                {/* English Preview */}
                <div 
                  className="p-2 rounded-xl bg-white border text-amber-950 font-bold"
                  style={{ fontFamily: activeEnglish.cssFamily }}
                >
                  <span className="text-[10px] text-gray-400 block">English [{activeEnglish.name}]:</span>
                  STUDENT ID: MDS-2026 • ADM NO: 8921
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Full Modal */}
      <FontShowcaseModal 
        isOpen={showFullModal} 
        onClose={() => setShowFullModal(false)} 
      />
    </>
  );
};
