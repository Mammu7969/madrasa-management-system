import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatHijriDate } from '../../services/hijri';
import { getNextPrayerCountdown, NextPrayerInfo } from '../../services/namazService';
import { db } from '../../services/db';
import { 
  Bell, 
  Megaphone, 
  AlertCircle, 
  Maximize, 
  Minimize, 
  Globe, 
  User, 
  LogOut, 
  Edit3, 
  ChevronDown,
  Building2,
  Clock,
  Calendar,
  CheckCircle2,
  Search,
  Moon,
  Sun,
  Menu,
  Sparkles,
  Type,
  Palette,
  Cloud
} from 'lucide-react';
import { THEME_PALETTES } from '../../context/ThemeContext';
import { Modal } from '../common/Modal';
import { FontShowcaseModal } from '../Fonts/FontShowcaseModal';

interface TopAppBarProps {
  onNavigateHome: () => void;
  onOpenCommandPalette: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ 
  onNavigateHome,
  onOpenCommandPalette 
}) => {
  const { user, activeMadrasa, logout } = useAuth();
  const { language, setLanguage, t, isFullscreen, toggleFullscreen, showToast, themeMode, setThemeMode, themes } = useTheme();

  // Time & Dates
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [hijriDateStr, setHijriDateStr] = useState<string>('');
  const [nextPrayerInfo, setNextPrayerInfo] = useState<NextPrayerInfo | null>(null);

  // Dropdown states
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
  const [showRemindersModal, setShowRemindersModal] = useState<boolean>(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState<boolean>(false);
  const [showIssueReportModal, setShowIssueReportModal] = useState<boolean>(false);
  const [showProfileChangesModal, setShowProfileChangesModal] = useState<boolean>(false);
  const [showFontModal, setShowFontModal] = useState<boolean>(false);

  // Form states
  const [profileChangesText, setProfileChangesText] = useState<string>('');
  const [issueText, setIssueText] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }));
      setHijriDateStr(formatHijriDate(now, language));

      // Calculate Next Namaz Countdown
      const namazTimings = db.getNamazTimings(activeMadrasa?.id);
      const nextP = getNextPrayerCountdown(namazTimings, now);
      setNextPrayerInfo(nextP);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [language, activeMadrasa]);

  const handleSubmitProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileChangesText.trim()) return;

    if (user && activeMadrasa) {
      db.addProfileRequest({
        userId: user.id,
        username: user.username,
        role: user.role,
        madrasaId: activeMadrasa.id,
        changeDetails: profileChangesText.trim(),
        date: new Date().toLocaleString(),
        status: 'Pending'
      });

      db.addNotice({
        madrasaId: activeMadrasa.id,
        title: `Profile Change Request from ${user.name} (${user.role})`,
        content: profileChangesText.trim(),
        date: new Date().toISOString().split('T')[0],
        priority: 'High',
        target: 'Teachers'
      });

      showToast('Profile change request submitted successfully to Admin / Principal!', 'success');
      setProfileChangesText('');
      setShowProfileChangesModal(false);
      setShowProfileMenu(false);
    }
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    if (activeMadrasa && user) {
      db.addFeedback({
        madrasaId: activeMadrasa.id,
        madrasaName: activeMadrasa.name,
        senderName: user.name,
        role: user.role,
        message: issueText.trim(),
        date: new Date().toISOString().split('T')[0],
        status: 'Unread'
      });

      showToast('Issue report logged and sent to System Administration.', 'info');
      setIssueText('');
      setShowIssueReportModal(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white/70 backdrop-blur-2xl border-b border-white/80 sticky top-0 z-30 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3 shadow-[0_4px_20px_-2px_rgba(18,59,99,0.05)] no-print select-none transition-colors duration-200">
        
        {/* ================= LEFT SECTION: MENU & SEARCH ================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Menu / Hamburger Button */}
          <button
            onClick={onOpenCommandPalette}
            title="Global Navigation (Ctrl + K)"
            className="p-2 rounded-2xl bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 border border-white/90 shadow-2xs transition-all active:scale-95"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Search Box */}
          <div className="w-56 sm:w-72 md:w-80">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-2xl bg-white/60 hover:bg-white/90 border border-slate-200/70 text-xs text-slate-400 hover:text-slate-700 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#079669] transition-colors shrink-0" />
                <span className="truncate text-[11px] text-slate-500">Search students, staff, receipts, etc...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white/90 rounded border border-slate-200/80 shadow-2xs">
                Ctrl + K
              </kbd>
            </button>
          </div>
        </div>

        {/* ================= RIGHT SECTION: TEMPORAL CAPSULES, UTILITIES & USER ================= */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Gregorian + Hijri Date */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/65 border border-white/80 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] text-slate-800 font-bold whitespace-nowrap">{currentDateStr}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-900 font-urdu urdu-font whitespace-nowrap">{hijriDateStr}</span>
          </div>

          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/65 border border-white/80 font-mono text-xs font-bold text-slate-800 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{currentTime}</span>
          </div>

          {/* Next Namaz Countdown */}
          {nextPrayerInfo && (
            <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/70 text-xs font-bold text-emerald-900 shadow-2xs whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{nextPrayerInfo.name}</span>
              <span className="font-normal text-emerald-700 text-[10px]">({nextPrayerInfo.timeStr})</span>
              <span className="font-mono text-emerald-950 font-black bg-white/95 px-1.5 py-0.5 rounded-full border border-emerald-200/60 text-[10px]">
                {nextPrayerInfo.countdownStr}
              </span>
            </div>
          )}

          {/* Supabase Cloud Status & Manual Sync */}
          <button
            onClick={async () => {
              showToast('Syncing with Supabase Cloud...', 'info');
              const ok = await db.syncFromSupabase();
              if (ok) {
                showToast('Cloud data synchronized successfully!', 'success');
              } else {
                showToast('Cloud sync failed. Running on local cache.', 'warning');
              }
            }}
            title="Supabase Cloud Database Status (Click to Sync)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs transition-all active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline text-[11px]">Cloud Synced</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setShowAnnouncementsModal(true)}
            title="Notifications"
            className="relative p-2 rounded-2xl bg-white/65 hover:bg-white text-slate-600 hover:text-slate-900 border border-white/80 shadow-2xs transition-all active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-black bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
              2
            </span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => {
              const next = themeMode === 'transparent-glossy' ? 'shiny-white' : 'transparent-glossy';
              setThemeMode(next);
              showToast(`Theme changed to ${next === 'transparent-glossy' ? 'Transparent Glossy' : 'Shiny White'}!`, 'info');
            }}
            title="Toggle Interface Mode"
            className="p-2 rounded-2xl bg-white/65 hover:bg-white text-slate-600 hover:text-amber-500 border border-white/80 shadow-2xs transition-all active:scale-95"
          >
            {themeMode === 'transparent-glossy' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/65 hover:bg-white border border-white/80 text-xs font-bold text-slate-700 shadow-2xs transition-all"
            >
              <span className="uppercase text-[11px] font-bold tracking-wider">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div 
                className="absolute ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto mt-2 w-36 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95"
                onClick={() => setShowLangMenu(false)}
              >
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-full px-3.5 py-2 text-start text-xs font-semibold flex items-center justify-between hover:bg-emerald-50 transition-colors ${language === 'en' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'}`}
                >
                  <span>English</span>
                  {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  onClick={() => setLanguage('ur')}
                  className={`w-full px-3.5 py-2 text-start text-xs font-semibold flex items-center justify-between hover:bg-emerald-50 transition-colors ${language === 'ur' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'}`}
                >
                  <span className="urdu-font text-sm">اردو (Urdu)</span>
                  {language === 'ur' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Selector Pill (Transparent Glossy v) */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Interface Theme"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/65 hover:bg-white border border-white/80 text-xs font-bold text-slate-700 shadow-2xs transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-xs shrink-0" />
              <span className="text-[11px] font-bold hidden sm:inline">
                {themeMode === 'transparent-glossy' ? 'Transparent Glossy' : 'Shiny White'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showThemeMenu && (
              <div 
                className="absolute ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto mt-2 w-72 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 select-none"
              >
                <div className="px-2.5 py-1.5 mb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Interface Theme</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">Material 3</span>
                </div>
                
                <div className="space-y-2">
                  {themes.map((tDef) => {
                    const isSelected = themeMode === tDef.id;
                    return (
                      <button
                        key={tDef.id}
                        onClick={() => {
                          setThemeMode(tDef.id);
                          setShowThemeMenu(false);
                          showToast(`Activated ${tDef.name} Theme!`, 'success');
                        }}
                        className={`w-full p-2.5 rounded-2xl text-start text-xs transition-all flex items-start gap-3 border ${
                          isSelected 
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20' 
                            : 'bg-white/60 hover:bg-white border-slate-200/70 hover:border-slate-300'
                        }`}
                      >
                        <div 
                          className="w-11 h-11 rounded-xl border flex flex-col justify-between p-1 shrink-0 shadow-2xs relative overflow-hidden"
                          style={{
                            backgroundColor: tDef.previewBg,
                            borderColor: tDef.previewBorder
                          }}
                        >
                          <div 
                            className="w-full h-4 rounded-sm border flex items-center justify-end px-1"
                            style={{
                              backgroundColor: tDef.previewSurface,
                              borderColor: tDef.previewBorder
                            }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tDef.dotPrimary }} />
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tDef.dotPrimary }} />
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tDef.dotSecondary }} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 block truncate">{tDef.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </div>
                          <span className="text-[10px] text-emerald-800 font-urdu block leading-tight font-medium">{tDef.nameUrdu}</span>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">{tDef.tagline}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-white/65 hover:bg-white border border-white/80 shadow-2xs transition-all group"
              title={user?.name || 'User Profile'}
            >
              <div className="relative shrink-0">
                <img
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>

              <div className="text-start hidden lg:block leading-tight max-w-[110px]">
                <span className="text-xs font-black text-slate-900 block truncate group-hover:text-emerald-700 transition-colors">
                  {user?.name || 'Maulana Abdul...'}
                </span>
                <span className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider block truncate">
                  {user?.role === 'super_admin' ? 'SUPER ADMIN' : user?.role === 'admin' ? 'PRINCIPAL' : user?.role === 'teacher' ? 'TEACHER' : 'STUDENT'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors hidden sm:block shrink-0" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div 
                className="absolute ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-3xl bg-[var(--surface-strong)] border border-[var(--border)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95"
                onClick={() => setShowProfileMenu(false)}
              >
                {/* Header User Card */}
                <div className="p-3 bg-white/80 rounded-2xl border border-[var(--border)] mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#079669] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="text-xs font-black text-gray-900 truncate">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">{user?.username}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-100 text-emerald-900 uppercase tracking-wider">
                        {user?.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Action Links */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowProfileChangesModal(true);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('applyForProfileChanges')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowFontModal(true);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors"
                  >
                    <Type className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Typography & Calligraphy Studio</span>
                  </button>
                </div>

                <div className="h-px bg-gray-100 my-1.5" />

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full text-start px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Profile Changes Modal */}
      <Modal
        isOpen={showProfileChangesModal}
        onClose={() => setShowProfileChangesModal(false)}
        title={t('applyForProfileChanges')}
        subtitle="Your request will directly appear in Admin / Principal Notifications"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setShowProfileChangesModal(false)}
              className="px-4 py-2 text-xs font-medium text-gray-600 rounded-full"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmitProfileChanges}
              className="px-5 py-2 text-xs font-medium bg-m3-primary text-white rounded-full hover:bg-m3-primary/90"
            >
              {t('submit')}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitProfileChanges} className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">
            {t('writeChangesHere')}
          </label>
          <textarea
            rows={4}
            value={profileChangesText}
            onChange={(e) => setProfileChangesText(e.target.value)}
            placeholder="e.g. Please update contact phone number to +91 9988776655, or address change to..."
            className="w-full p-3 text-sm rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-m3-primary"
            required
          />
        </form>
      </Modal>

      {/* Reminders Modal */}
      <Modal
        isOpen={showRemindersModal}
        onClose={() => setShowRemindersModal(false)}
        title={t('reminders')}
        maxWidth="md"
      >
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold block">1. Monthly Fees Settlement</span>
            <p className="mt-0.5">Generate pending fee notices for students in hostel before 10th of this month.</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
            <span className="font-bold block">2. Asar Prayer Jamat</span>
            <p className="mt-0.5">Congregational prayer scheduled at 05:10 PM in Main Masjid.</p>
          </div>
        </div>
      </Modal>

      {/* Announcements Modal */}
      <Modal
        isOpen={showAnnouncementsModal}
        onClose={() => setShowAnnouncementsModal(false)}
        title={t('announcements')}
        maxWidth="lg"
      >
        <div className="space-y-3">
          {db.getNotices(activeMadrasa?.id).map(notice => (
            <div key={notice.id} className="p-4 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900">{notice.title}</h4>
                <span className="text-[10px] font-semibold text-m3-primary bg-m3-primary-container px-2 py-0.5 rounded-full">
                  {notice.date}
                </span>
              </div>
              <p className="text-xs text-gray-600">{notice.content}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Issue Reports Modal */}
      <Modal
        isOpen={showIssueReportModal}
        onClose={() => setShowIssueReportModal(false)}
        title={t('issueReports')}
        subtitle="Submit technical issues or operational feedback to Support Center"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setShowIssueReportModal(false)}
              className="px-4 py-2 text-xs font-medium text-gray-600 rounded-full"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmitIssue}
              className="px-5 py-2 text-xs font-medium bg-rose-600 text-white rounded-full hover:bg-rose-700"
            >
              {t('submit')}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitIssue} className="space-y-3">
          <textarea
            rows={4}
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            placeholder="Describe the issue, bug, or facility assistance needed in detail..."
            className="w-full p-3 text-sm rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
        </form>
      </Modal>

      {/* Local Offline Typography Suite Modal */}
      <FontShowcaseModal 
        isOpen={showFontModal} 
        onClose={() => setShowFontModal(false)} 
      />
    </>
  );
};
