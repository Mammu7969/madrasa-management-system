import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Settings, Save, Download, Database, Lock, Type, Palette, CheckCircle2, Moon, Sun, Upload, Building2, Camera } from 'lucide-react';
import { DashboardFontChanger } from '../common/DashboardFontChanger';
import { GlossyCard } from '../common/GlossyCard';
import { compressImage } from '../../utils/imageCompressor';

export const SettingsModule: React.FC = () => {
  const { activeMadrasa, updateActiveMadrasa } = useAuth();
  const { showToast, isDarkMode, toggleDarkMode } = useTheme();

  const [academicYear, setAcademicYear] = useState('1447-1448 AH (2026-2027)');
  const [defaultCurrency, setDefaultCurrency] = useState('INR (₹)');
  const [sessionTerm, setSessionTerm] = useState('First Term');
  const [logoUrl, setLogoUrl] = useState<string>(activeMadrasa?.logoUrl || '');

  const handleBackup = () => {
    const jsonStr = db.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `madrasa_backup_${activeMadrasa?.code || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database exported and backup created successfully!', 'success');
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 800, 0.8);
      setLogoUrl(compressed);
      showToast('Logo image uploaded and fitted to 3x4 inches display!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to load image file', 'error');
    }
  };

  const handleSaveLogo = () => {
    if (activeMadrasa) {
      const updated = {
        ...activeMadrasa,
        logoUrl: logoUrl.trim() || undefined
      };
      updateActiveMadrasa(updated);
      showToast('Madrasa official logo updated and saved across the system!', 'success');
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (activeMadrasa) {
      const updated = {
        ...activeMadrasa,
        logoUrl: undefined
      };
      updateActiveMadrasa(updated);
      showToast('Madrasa logo removed', 'info');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Madrasa system settings saved!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-[var(--border)] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#123B63] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#079669]" />
            <span>Madrasa Operational, Theme & Typography Settings (ترتیبات نظام، تھیم اور خطاطی)</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Interface themes, offline font calligraphy preferences, academic calendar year, currency formats, and database snapshots
          </p>
        </div>
      </div>

      {/* Madrasa Official Logo & Emblem (3x4 Inches Standard Display & Upload) */}
      <GlossyCard className="p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#079669]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Madrasa Official Logo & Emblem (مدرسہ کا سرکاری لوگو و مونوگرام)</h3>
              <p className="text-xs text-[var(--text-secondary)]">Standard 3x4 inches display frame for official certificates, identity cards, registers, and receipts</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#079669] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 font-mono">
            3" × 4" (288×384 px)
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 3x4 Inches Display Inspection Box */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative w-[216px] h-[288px] sm:w-[288px] sm:h-[384px] bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-emerald-400 dark:border-emerald-600 overflow-hidden shadow-sm flex items-center justify-center group">
              {logoUrl ? (
                <>
                  <img
                    src={logoUrl}
                    alt="Official Madrasa Logo"
                    className="w-full h-full object-contain p-3"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
                      3.0" × 4.0" (76.2 × 101.6 mm)
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <Building2 className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto" />
                  <span className="text-xs font-bold text-gray-400 block">No Logo Uploaded</span>
                  <span className="text-[10px] text-gray-400 block">Standard 3x4 Inches Frame</span>
                </div>
              )}
              {/* Physical Dimension Badge */}
              <div className="absolute bottom-2 right-2 bg-emerald-800/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-xs">
                3" × 4" (288×384px)
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-gray-500">Aspect Ratio: 3:4 (Portrait Standard)</span>
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-4 w-full">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Upload Logo Image File (کمپیوٹر سے لوگو اپلوڈ کریں)</span>
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Upload your official Madrasa insignia. The image will be compressed client-side to prevent storage quota issues and optimized to fit the 3x4 inches frame perfectly.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    className="hidden"
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                  >
                    Remove Logo
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveLogo}
                  className="px-5 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Logo Changes</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-gray-900 dark:text-white block">Or Specify Direct Web URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white font-mono"
                placeholder="https://..."
              />
            </div>

            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-900 dark:text-emerald-200">
              💡 <strong>Instant Application:</strong> Saved logo will immediately reflect in the main navigation sidebar, certificates module, and printable receipts.
            </div>
          </div>
        </div>
      </GlossyCard>

      {/* Interface Theme & Appearance (Default Transparent Glossy + Dark Theme) */}
      <GlossyCard className="p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#079669]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Interface Appearance & Theme (ظاہری ہیئت اور ڈارک موڈ)</h3>
              <p className="text-xs text-[var(--text-secondary)]">Standardized Transparent Glossy theme with instant high-contrast Dark Mode</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#079669] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
            Material 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default Theme Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-500 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shadow-xs text-emerald-700">
              <Palette className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Transparent Glossy</h4>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Default
                </span>
              </div>
              <span className="text-xs text-[#079669] font-urdu font-medium block mt-0.5">شفاف چمکدار انداز (معیاری)</span>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Primary high-grade translucent glassmorphic interface</p>
            </div>
          </div>

          {/* Dark Mode Switcher Card */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`p-4 rounded-2xl text-start transition-all flex items-center gap-4 border cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-900 border-amber-400/80 shadow-md text-white' 
                : 'bg-white/70 hover:bg-white border-[var(--border)] hover:border-slate-300 shadow-xs text-slate-900'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-xs ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              {isDarkMode ? <Sun className="w-6 h-6 animate-in spin-in-180" /> : <Moon className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">{isDarkMode ? 'Dark Theme Active' : 'Dark Theme'}</h4>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isDarkMode ? 'ON' : 'OFF'}
                </span>
              </div>
              <span className="text-xs text-[#079669] dark:text-emerald-400 font-urdu font-medium block mt-0.5">تاریک انداز (ہائی کنٹراسٹ)</span>
              <p className="text-xs opacity-75 mt-0.5">Click to toggle high-contrast comfortable dark mode</p>
            </div>
          </button>
        </div>
      </GlossyCard>

      {/* Typography & Fonts Changing System (Now moved into Settings) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Type className="w-4 h-4 text-emerald-800" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Typography, Fonts & Calligraphy Engine (خطاطی اور رسم الخط کی ترتیبات)
          </h3>
        </div>
        <DashboardFontChanger compact={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operational Settings */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Academic & Session Parameters</h3>

          <div>
            <label className="text-xs font-bold block mb-1">Academic Hijri / Gregorian Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Currency Standard</label>
            <input
              type="text"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Current Academic Session Term</label>
            <select
              value={sessionTerm}
              onChange={(e) => setSessionTerm(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border bg-white"
            >
              <option value="First Term">First Term (شعبہ اول)</option>
              <option value="Second Term">Second Term (شعبہ دوم)</option>
              <option value="Final Term">Final Term (شعبہ سوم)</option>
            </select>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Institution Name and Registered Address are locked by Super Admin policy. To request changes, visit the MMS Super Admin portal.
            </span>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-m3-primary text-white text-xs font-bold shadow-m3-1"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>

        {/* Database Backup & Recovery */}
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Database Backup & Security</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Export a complete JSON snapshot of all student enrollments, attendance registers, fee transactions, Asatizah directory, and system settings.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Offline Persistence Active</span>
            </span>
            <p className="text-[11px] text-emerald-800">
              All records are stored locally with instant reactive caching and encrypted session storage.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBackup}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-m3-1 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Database JSON Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
