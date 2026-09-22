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
  GraduationCap,
  BookOpen,
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

  const roleOptions: { role: Role; label: string; icon: any }[] = [
    { role: 'student', label: t('studentOrGuardian'), icon: GraduationCap },
    { role: 'teacher', label: t('teacher'), icon: BookOpen },
    { role: 'admin', label: t('adminOrPrincipal'), icon: UserCheck },
    { role: 'super_admin', label: t('superAdmin'), icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Decorative ambient glowing circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* Top Header Bar with Language Switcher */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md flex items-center justify-center border border-white/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">Madrasa Management System</h1>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-urdu urdu-font font-medium">مدرسہ مینجمنٹ سسٹم &bull; M3 Professional Edition</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 shadow-xs text-xs text-slate-700 dark:text-slate-300">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${language === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`px-2.5 py-0.5 rounded-full font-urdu urdu-font text-xs font-semibold transition-all cursor-pointer ${language === 'ur' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            اردو
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg mx-auto glossy-card p-6 sm:p-8 my-4 relative z-10 animate-in fade-in zoom-in-95 duration-300 border border-slate-200/80 dark:border-white/10 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg mb-3 border border-white/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('appName')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Centralized Cloud Portal for Islamic Institutions & Academies
          </p>
        </div>

        {/* Dynamic Subscription Warning Alert */}
        {subscriptionWarning && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block">Subscription Alert!</span>
              <p className="mt-0.5 leading-relaxed">{subscriptionWarning}</p>
            </div>
          </div>
        )}

        {/* Dynamic Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block">Verification Error</span>
              <p className="mt-0.5 leading-relaxed font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1: Select Madrasa */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              1. {t('selectMadrasa')}
            </label>
            <div className="relative">
              <select
                value={selectedMadrasaId}
                onChange={(e) => handleMadrasaChange(e.target.value)}
                disabled={selectedRole === 'super_admin'}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer disabled:opacity-50"
                required
              >
                {availableMadrasas.map(m => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {m.name} {!m.isSubscriptionActive ? '(Subscription Ended)' : ''}
                  </option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* 2: Segmented Role Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              2. {t('selectRole')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const active = selectedRole === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(opt.role);
                      setErrorMessage('');
                    }}
                    className={`p-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-600 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                    <span className="text-[10px] truncate max-w-[80px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role-Specific Credential Inputs */}
          {/* 1. Student / Guardian */}
          {selectedRole === 'student' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {t('studentId')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={idOrUsername}
                    onChange={(e) => setIdOrUsername(e.target.value)}
                    placeholder="e.g. ADM-2026-001"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <User className="w-4 h-4 text-emerald-600/70 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {t('password')} / {t('dob')} (YYYY-MM-DD)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrDob}
                    onChange={(e) => setPasswordOrDob(e.target.value)}
                    placeholder="Password or DOB (e.g. 2014-05-12)"
                    className="w-full p-3 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-emerald-600 active:text-emerald-700 transition-all cursor-pointer select-none focus:outline-none"
                    title="Hold to view password"
                    aria-label="Hold to view password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Teacher */}
          {selectedRole === 'teacher' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {t('teacherId')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={idOrUsername}
                    onChange={(e) => setIdOrUsername(e.target.value)}
                    placeholder="e.g. TCH-001"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <User className="w-4 h-4 text-emerald-600/70 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrDob}
                    onChange={(e) => setPasswordOrDob(e.target.value)}
                    placeholder="Enter teacher password"
                    className="w-full p-3 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-emerald-600 active:text-emerald-700 transition-all cursor-pointer select-none focus:outline-none"
                    title="Hold to view password"
                    aria-label="Hold to view password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Admin / Principal */}
          {selectedRole === 'admin' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {t('principalId')} / {t('username')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={idOrUsername}
                    onChange={(e) => setIdOrUsername(e.target.value)}
                    placeholder="e.g. principal.jdh"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <User className="w-4 h-4 text-emerald-600/70 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrDob}
                    onChange={(e) => setPasswordOrDob(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full p-3 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-emerald-600 active:text-emerald-700 transition-all cursor-pointer select-none focus:outline-none"
                    title="Hold to view password"
                    aria-label="Hold to view password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Super Admin */}
          {selectedRole === 'super_admin' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Super Admin {t('username')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={idOrUsername}
                    onChange={(e) => setIdOrUsername(e.target.value)}
                    placeholder="Enter super admin username"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <ShieldCheck className="w-4 h-4 text-amber-600 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrDob}
                    onChange={(e) => setPasswordOrDob(e.target.value)}
                    placeholder="Enter super admin password"
                    className="w-full p-3 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-amber-600 active:text-amber-700 transition-all cursor-pointer select-none focus:outline-none"
                    title="Hold to view password"
                    aria-label="Hold to view password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-700/20 transition-all mt-3"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('login')}</span>
          </button>
        </form>

        {/* Dynamic Bottom Notification with Principal Contact Number */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('forgotPasswordHint')}
          </p>

          {currentSelectedMadrasa && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {currentSelectedMadrasa.name}: Contact Principal at <strong className="text-emerald-700 dark:text-emerald-300 font-mono">{currentSelectedMadrasa.contactNumber}</strong> ({currentSelectedMadrasa.principalName})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full text-center text-xs text-slate-400 dark:text-slate-500 py-2">
        Madrasa Management System &bull; Secure Role-Based Multi-Tenancy Architecture
      </div>
    </div>
  );
};
