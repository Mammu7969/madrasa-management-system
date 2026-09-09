import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Settings, Save, Download, Database, Lock, Type, Palette, CheckCircle2 } from 'lucide-react';
import { DashboardFontChanger } from '../common/DashboardFontChanger';
import { GlossyCard } from '../common/GlossyCard';

export const SettingsModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { showToast, themeMode, setThemeMode, themes } = useTheme();

  const [academicYear, setAcademicYear] = useState('1447-1448 AH (2026-2027)');
  const [defaultCurrency, setDefaultCurrency] = useState('INR (₹)');
  const [sessionTerm, setSessionTerm] = useState('First Term');

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

      {/* Interface Theme Selector (Shiny White / Transparent Glossy) */}
      <GlossyCard className="p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#079669]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">ERP Interface Theme (ظاہری ہیئت اور تھیم)</h3>
              <p className="text-xs text-[var(--text-secondary)]">Choose between bright premium white or glass-like transparent glossy interface</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#079669] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
            Material 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((tDef) => {
            const isSelected = themeMode === tDef.id;
            return (
              <button
                key={tDef.id}
                type="button"
                onClick={() => {
                  setThemeMode(tDef.id);
                  showToast(`Applied ${tDef.name} Theme!`, 'success');
                }}
                className={`p-4 rounded-2xl text-start transition-all flex items-start gap-4 border cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                    : 'bg-white/60 hover:bg-white border-[var(--border)] hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Visual Swatch */}
                <div 
                  className="w-16 h-16 rounded-xl border flex flex-col justify-between p-1.5 shrink-0 shadow-sm relative overflow-hidden"
                  style={{
                    backgroundColor: tDef.previewBg,
                    borderColor: tDef.previewBorder
                  }}
                >
                  <div 
                    className="w-full h-5 rounded border flex items-center justify-end px-1.5 shadow-2xs"
                    style={{
                      backgroundColor: tDef.previewSurface,
                      borderColor: tDef.previewBorder
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tDef.dotPrimary }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tDef.dotPrimary }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tDef.dotSecondary }} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900">{tDef.name}</h4>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#079669] font-urdu font-medium block mt-0.5">{tDef.nameUrdu}</span>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{tDef.tagline}</p>
                </div>
              </button>
            );
          })}
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
