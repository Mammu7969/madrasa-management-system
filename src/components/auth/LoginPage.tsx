import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Role } from '../../types';
import { 
  Building2, 
  UserCheck, 
  Lock, 
  User, 
  LogIn, 
  AlertTriangle, 
  PhoneCall, 
  ShieldCheck, 
  Info,
  Calendar,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { availableMadrasas, login, setActiveMadrasa } = useAuth();
  const { t, language, setLanguage } = useTheme();

  const [selectedMadrasaId, setSelectedMadrasaId] = useState<string>(availableMadrasas[0]?.id || '');
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [idOrUsername, setIdOrUsername] = useState<string>('');
  const [passwordOrDob, setPasswordOrDob] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [subscriptionWarning, setSubscriptionWarning] = useState<string>('');

  const handleRevealPasswordStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setShowPassword(true);
  };

  const handleRevealPasswordEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setShowPassword(false);
  };

  const currentSelectedMadrasa = availableMadrasas.find(m => m.id === selectedMadrasaId);

  // Check subscription whenever madrasa selection changes
  const handleMadrasaChange = (mId: string) => {
    setSelectedMadrasaId(mId);
    setErrorMessage('');
    const target = availableMadrasas.find(m => m.id === mId);
    if (target) {
      setActiveMadrasa(target);
      if (!target.isSubscriptionActive) {
        setSubscriptionWarning(`Your Madrasa ${target.name} Subscription Ended, Wait Until Your ${target.name} Get Subscription`);
      } else {
        setSubscriptionWarning('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = login(selectedMadrasaId, selectedRole, idOrUsername, passwordOrDob);
    if (!res.success) {
      if (res.subscriptionEnded) {
        setSubscriptionWarning(res.error || '');
      } else {
        setErrorMessage(res.error || 'Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Decorative ambient glowing circles - solid with blur */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-sky-200/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-indigo-200/15 blur-3xl pointer-events-none" />

      {/* Top Header Bar with Language Switcher */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 glossy-squircle bg-[#079669] text-white shadow-md border border-white/40">
            <Building2 className="w-5 h-5 relative z-10" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-slate-800">Madrasa Management System</h1>
            <p className="text-[11px] text-[#079669] font-urdu urdu-font font-medium">مدرسہ مینجمنٹ سسٹم &bull; M3 Professional Edition</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 shadow-xs text-xs text-slate-700">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${language === 'en' ? 'bg-[#079669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`px-2.5 py-0.5 rounded-full font-urdu urdu-font text-xs font-semibold transition-all ${language === 'ur' ? 'bg-[#079669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            اردو
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg mx-auto glossy-card-elevated p-6 sm:p-8 my-4 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 glossy-squircle bg-[#079669] text-white shadow-lg mb-3 border border-white/40">
            <ShieldCheck className="w-8 h-8 relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {t('appName')}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Centralized Cloud Portal for Islamic Institutions & Academies
          </p>
        </div>

        {/* Dynamic Subscription Warning Alert */}
        {subscriptionWarning && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block">Subscription Alert!</span>
              <p className="mt-0.5 leading-relaxed">{subscriptionWarning}</p>
            </div>
          </div>
        )}

        {/* Dynamic Error Notification requested by user */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block">Verification Error</span>
              <p className="mt-0.5 leading-relaxed font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropdown 1: Select Madrasa */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              1. {t('selectMadrasa')}
            </label>
            <div className="relative">
              <select
                value={selectedMadrasaId}
                onChange={(e) => handleMadrasaChange(e.target.value)}
                disabled={selectedRole === 'super_admin'}
                className="w-full p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer disabled:opacity-50 shadow-2xs"
                required
              >
                {availableMadrasas.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {!m.isSubscriptionActive ? '(Subscription Ended)' : ''}
                  </option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-emerald-700 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Dropdown 2: Select Role */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              2. {t('selectRole')}
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as Role);
                  setErrorMessage('');
                }}
                className="w-full p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer shadow-2xs"
                required
              >
                <option value="student">{t('studentOrGuardian')}</option>
                <option value="teacher">{t('teacher')}</option>
                <option value="admin">{t('adminOrPrincipal')}</option>
                <option value="super_admin">{t('superAdmin')}</option>
              </select>
              <UserCheck className="w-4 h-4 text-emerald-700 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Role-Specific Credential Inputs */}
          {/* 1. Student / Guardian */}
          {selectedRole === 'student' && (
            <div className="space-y-3 pt-1 border-t border-white/60">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('studentId')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={idOrUsername}
                    onChange={(e) => setIdOrUsername(e.target.value)}
                    placeholder="e.g. ADM-2026-001"
                    className="w-full p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                    required
                  />
                  <User className="w-4 h-4 text-emerald-700/60 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('password')} / {t('dob')} (YYYY-MM-DD)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrDob}
                    onChange={(e) => setPasswordOrDob(e.target.value)}
                    placeholder="Password or DOB (e.g. 2014-05-12)"
                    className="w-full p-3 pr-11 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={handleRevealPasswordStart}
                    onMouseUp={handleRevealPasswordEnd}
                    onMouseLeave={handleRevealPasswordEnd}
                    onTouchStart={handleRevealPasswordStart}
                    onTouchEnd={handleRevealPasswordEnd}
                    onTouchCancel={handleRevealPasswordEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="absolute right-3 top-3 p-1 rounded-xl text-slate-400 hover:text-emerald-700 active:text-emerald-800 hover:bg-emerald-50/60 transition-all cursor-pointer select-none focus:outline-none"
                    title="Hold to view password"
                    aria-label="Hold to view password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-emerald-700" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Teacher */}
          {selectedRole === 'teacher' && (
            <div className="space-y-3 pt-1 border-t border-white/60">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('teacherId')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={idOrUsername}
                    onChange={(e) => setIdOrUsername(e.target.value)}
                    placeholder="e.g. TCH-001"
                    className="w-full p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                    required
                  />
                  <User className="w-4 h-4 text-emerald-700/60 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrDob}
                    onChange={(e) => setPasswordOrDob(e.target.value)}
                    placeholder="Enter teacher password"
                    className="w-full p-3 pr-11 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={handleRevealPasswordStart}
                    onMouseUp={handleRevealPasswordEnd}
                    onMouseLeave={handleRevealPasswordEnd}
                    onTouchStart={handleRevealPasswordStart}
                    onTouchEnd={handleRevealPasswordEnd}
                    onTouchCancel={handleRevealPasswordEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="absolute right-3 top-3 p-1 rounded-xl text-slate-400 hover:text-emerald-700 active:text-emerald-800 hover:bg-emerald-50/60 transition-all cursor-pointer select-none focus:outline-none"
                    title="Hold to view password"
                    aria-label="Hold to view password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-emerald-700" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Admin / Principal */}
          {selectedRole === 'admin' && (
            <div className="space-y-3 pt-1 border-t border-white/60">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('principalId')} / {t('username')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={idOrUsername}
                    onChange={(e) => setIdOrUsername(e.target.value)}
                    placeholder="e.g. principal.jdh"
                    className="w-full p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                    required
                  />
                  <User className="w-4 h-4 text-emerald-700/60 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrDob}
                    onChange={(e) => setPasswordOrDob(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full p-3 pr-11 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={handleRevealPasswordStart}
                    onMouseUp={handleRevealPasswordEnd}
                    onMouseLeave={handleRevealPasswordEnd}
                    onTouchStart={handleRevealPasswordStart}
                    onTouchEnd={handleRevealPasswordEnd}
                    onTouchCancel={handleRevealPasswordEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="absolute right-3 top-3 p-1 rounded-xl text-slate-400 hover:text-emerald-700 active:text-emerald-800 hover:bg-emerald-50/60 transition-all cursor-pointer select-none focus:outline-none"
                    title="Hold to view password"
                    aria-label="Hold to view password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-emerald-700" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Super Admin */}
          {selectedRole === 'super_admin' && (
            <div className="space-y-3 pt-1 border-t border-white/60">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Super Admin {t('username')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={idOrUsername}
                    onChange={(e) => setIdOrUsername(e.target.value)}
                    placeholder="Enter super admin username"
                    className="w-full p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-2xs"
                    required
                  />
                  <ShieldCheck className="w-4 h-4 text-amber-600 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrDob}
                    onChange={(e) => setPasswordOrDob(e.target.value)}
                    placeholder="Enter super admin password"
                    className="w-full p-3 pr-11 rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={handleRevealPasswordStart}
                    onMouseUp={handleRevealPasswordEnd}
                    onMouseLeave={handleRevealPasswordEnd}
                    onTouchStart={handleRevealPasswordStart}
                    onTouchEnd={handleRevealPasswordEnd}
                    onTouchCancel={handleRevealPasswordEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="absolute right-3 top-3 p-1 rounded-xl text-slate-400 hover:text-amber-700 active:text-amber-800 hover:bg-amber-50/60 transition-all cursor-pointer select-none focus:outline-none"
                    title="Hold to view password"
                    aria-label="Hold to view password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl glossy-btn glossy-btn-emerald text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(7,150,105,0.3)] transition-all active:scale-[0.99] mt-3"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('login')}</span>
          </button>
        </form>

        {/* Dynamic Bottom Notification with Principal Contact Number & Subscription Status */}
        <div className="mt-6 pt-4 border-t border-m3-outline-variant/30 text-center space-y-2">
          <p className="text-xs text-m3-on-surface-variant leading-relaxed">
            {t('forgotPasswordHint')}
          </p>

          {/* When Selected Any Madrasa from List Show that Specific Madrasa Admin/Principal's Contact Number */}
          {currentSelectedMadrasa && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold shadow-xs">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              <span>
                {currentSelectedMadrasa.name}: Contact Principal at <strong className="text-emerald-800">{currentSelectedMadrasa.contactNumber}</strong> ({currentSelectedMadrasa.principalName})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full text-center text-xs text-emerald-200/80 py-2">
        Madrasa Management System &bull; Secure Role-Based Multi-Tenancy Architecture
      </div>
    </div>
  );
};
