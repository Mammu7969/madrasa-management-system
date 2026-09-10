import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Receipt, 
  Grid 
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

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
  const isDashboardActive = currentTab === 'dashboard';
  const isStudentsActive = currentTab === 'students' || currentTab === 'students_add' || currentTab === 'students_profile';
  const isSabaqActive = currentTab === 'quran' || currentTab === 'roznamcha';
  const isFinanceActive = currentTab === 'fees' || currentTab === 'income_expenses';

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#10131a]/95 dark:bg-[#10131a]/95 backdrop-blur-md border-t border-[#2d3340] px-3 py-1.5 pb-safe flex items-center justify-around shadow-2xl lg:hidden select-none"
      data-purpose="mobile-nav"
    >
      {/* Tab 1: Dashboard */}
      <button
        type="button"
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
          isDashboardActive 
            ? 'text-[#1978e5]' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 transition-transform ${isDashboardActive ? 'scale-110' : ''}`} />
        <span className={`text-[10px] mt-0.5 ${isDashboardActive ? 'font-bold text-[#1978e5]' : 'font-medium'}`}>
          Dashboard
        </span>
      </button>

      {/* Tab 2: Students */}
      <button
        type="button"
        onClick={() => onSelectTab('students')}
        className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
          isStudentsActive 
            ? 'text-[#1978e5]' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Users className={`w-5 h-5 transition-transform ${isStudentsActive ? 'scale-110' : ''}`} />
        <span className={`text-[10px] mt-0.5 ${isStudentsActive ? 'font-bold text-[#1978e5]' : 'font-medium'}`}>
          Students
        </span>
      </button>

      {/* Tab 3: Sabaq & Quran */}
      <button
        type="button"
        onClick={() => onSelectTab('quran')}
        className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
          isSabaqActive 
            ? 'text-[#1978e5]' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className={`w-5 h-5 transition-transform ${isSabaqActive ? 'scale-110' : ''}`} />
        <span className={`text-[10px] mt-0.5 ${isSabaqActive ? 'font-bold text-[#1978e5]' : 'font-medium'}`}>
          Sabaq
        </span>
      </button>

      {/* Tab 4: Finance & Fees */}
      <button
        type="button"
        onClick={() => onSelectTab('fees')}
        className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
          isFinanceActive 
            ? 'text-[#1978e5]' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Receipt className={`w-5 h-5 transition-transform ${isFinanceActive ? 'scale-110' : ''}`} />
        <span className={`text-[10px] mt-0.5 ${isFinanceActive ? 'font-bold text-[#1978e5]' : 'font-medium'}`}>
          Finance
        </span>
      </button>

      {/* Tab 5: All Menu Trigger */}
      <button
        type="button"
        onClick={onOpenAllModules}
        className={`flex flex-col items-center justify-center w-14 py-1 relative cursor-pointer transition-all ${
          isDrawerOpen ? 'text-[#1978e5]' : 'text-slate-300 hover:text-[#1978e5]'
        }`}
      >
        <div className="relative">
          <Grid className="w-5 h-5" />
          <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-amber-400 rounded-full border-2 border-[#10131a]" />
        </div>
        <span className="text-[10px] font-bold mt-0.5 text-slate-200">
          مینیو All
        </span>
      </button>
    </nav>
  );
};
