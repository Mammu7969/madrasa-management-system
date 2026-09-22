import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Receipt, 
  CalendarCheck,
  Award,
  Layers,
  TrendingUp,
  Package,
  Clock,
  Megaphone,
  BarChart3,
  FileBadge,
  HelpCircle,
  Settings,
  Plus,
  Check,
  UserPlus,
  DollarSign
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAllModules: () => void;
  isDrawerOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAllModules,
  isDrawerOpen = false
}) => {
  const { language } = useTheme();
  const isUrdu = language === 'ur';

  const [showQuickSheet, setShowQuickSheet] = useState<boolean>(false);

  const navItems: { id: NavigationTab; label: string; labelUrdu: string; icon: any }[] = [
    { id: 'dashboard', label: 'Home', labelUrdu: 'ہوم', icon: LayoutDashboard },
    { id: 'students', label: 'Students', labelUrdu: 'طلباء', icon: Users },
    { id: 'classes', label: 'Classes', labelUrdu: 'کلاسیں', icon: Layers },
    { id: 'attendance', label: 'Attendance', labelUrdu: 'حاضری', icon: CalendarCheck },
    { id: 'quran', label: 'Sabaq', labelUrdu: 'سبق', icon: BookOpen },
    { id: 'examinations', label: 'Exams', labelUrdu: 'امتحانات', icon: Award },
    { id: 'fees', label: 'Fees', labelUrdu: 'فیس', icon: Receipt },
    { id: 'income_expenses', label: 'Finance', labelUrdu: 'مالیات', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', labelUrdu: 'اسٹاک', icon: Package },
    { id: 'schedule', label: 'Schedule', labelUrdu: 'اوقات', icon: Clock },
    { id: 'notices', label: 'Notice', labelUrdu: 'اعلانات', icon: Megaphone },
    { id: 'reports', label: 'Reports', labelUrdu: 'رپورٹس', icon: BarChart3 },
    { id: 'certificates', label: 'Cards', labelUrdu: 'اسناد', icon: FileBadge },
    { id: 'support', label: 'Support', labelUrdu: 'مدد', icon: HelpCircle },
  ];

  return (
    <>
      {/* Floating Center FAB Button */}
      <button
        type="button"
        onClick={() => setShowQuickSheet(true)}
        aria-label="Quick Actions"
        className="fixed bottom-[86px] left-1/2 -translate-x-1/2 w-[52px] h-[52px] rounded-[18px] bg-gradient-to-tr from-[#3564ff] to-[#8752ff] text-white text-2xl font-black shadow-[0_14px_28px_rgba(76,67,224,0.38)] z-50 flex items-center justify-center border-[3px] border-white/90 dark:border-[#111b4b] active:scale-90 transition-transform lg:hidden cursor-pointer"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Floating Prototype Bottom Dock */}
      <nav 
        className="fixed bottom-3 left-3 right-3 h-[68px] rounded-[24px] bg-white/92 dark:bg-[#111b4b]/92 backdrop-blur-2xl shadow-[0_15px_35px_rgba(52,65,125,0.18)] border border-white/90 dark:border-white/10 z-40 flex items-center overflow-hidden lg:hidden select-none"
        data-purpose="mobile-nav"
      >
        {/* Scrollable Navigation Items */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1 px-2 py-1 no-scrollbar hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`min-w-[58px] h-[52px] rounded-[16px] flex flex-col items-center justify-center gap-1 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#315cf0] dark:text-[#59c7ff] bg-[#eef1ff] dark:bg-[#4f7eff]/20 font-bold shadow-xs'
                    : 'text-[#7480a4] hover:text-[#14204d] dark:text-slate-400 dark:hover:text-white font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] tracking-tight whitespace-nowrap">
                  {isUrdu ? item.labelUrdu : item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fixed Settings Button on the Right */}
        <div className="w-[62px] h-full flex-none border-l border-[#e4e8f6] dark:border-white/10 flex items-center justify-center bg-white/60 dark:bg-white/5">
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`min-w-[54px] h-[52px] rounded-[16px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'text-[#315cf0] dark:text-[#59c7ff] bg-[#eef1ff] dark:bg-[#4f7eff]/20 font-bold shadow-xs'
                : 'text-[#7480a4] hover:text-[#14204d] dark:text-slate-400 dark:hover:text-white font-semibold'
            }`}
          >
            <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'scale-110' : ''}`} />
            <span className="text-[9px] tracking-tight whitespace-nowrap">
              {isUrdu ? 'سیٹنگز' : 'Settings'}
            </span>
          </button>
        </div>
      </nav>

      {/* Quick Action Bottom Sheet (Triggered by FAB) */}
      {showQuickSheet && (
        <div 
          className="fixed inset-0 z-50 bg-[#0f1841]/50 backdrop-blur-xs flex items-end justify-center lg:hidden"
          onClick={() => setShowQuickSheet(false)}
        >
          <div 
            className="w-full bg-[#f7f8ff] dark:bg-[#111b4b] rounded-t-[32px] p-5 shadow-[0_-20px_50px_rgba(12,20,59,0.25)] border-t border-white/60 dark:border-white/10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1 rounded-full bg-[#cbd2e9] dark:bg-white/20 mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#14204d] dark:text-white">
                {isUrdu ? 'فوری کارروائیاں' : 'Quick Actions'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowQuickSheet(false)}
                className="w-7 h-7 rounded-full bg-white dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-300 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => { setShowQuickSheet(false); onSelectTab('students'); }}
                className="menuCard"
              >
                <div className="mi">👨‍🎓</div>
                <span>{isUrdu ? 'نیا داخلہ' : 'Add Student'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowQuickSheet(false); onSelectTab('fees'); }}
                className="menuCard"
              >
                <div className="mi">₹</div>
                <span>{isUrdu ? 'فیس وصولی' : 'Collect Fee'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowQuickSheet(false); onSelectTab('attendance'); }}
                className="menuCard"
              >
                <div className="mi">✓</div>
                <span>{isUrdu ? 'حاضری' : 'Attendance'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowQuickSheet(false); onSelectTab('quran'); }}
                className="menuCard"
              >
                <div className="mi">📖</div>
                <span>{isUrdu ? 'روزانہ سبق' : 'Daily Sabaq'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowQuickSheet(false); onSelectTab('inventory'); }}
                className="menuCard"
              >
                <div className="mi">📦</div>
                <span>{isUrdu ? 'اسٹاک' : 'Inventory'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowQuickSheet(false); onSelectTab('reports'); }}
                className="menuCard"
              >
                <div className="mi">📊</div>
                <span>{isUrdu ? 'رپورٹس' : 'Reports'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

