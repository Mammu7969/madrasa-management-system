import React from 'react';
import { 
  X, 
  Building2, 
  BookOpen, 
  BookMarked, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  Receipt, 
  TrendingUp, 
  UserCheck, 
  FileText, 
  Award, 
  BarChart3, 
  Bell, 
  Package, 
  Clock, 
  Settings, 
  HelpCircle,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavigationTab } from './Sidebar';

interface AllModulesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onSelectTab: (tab: NavigationTab | 'students_add') => void;
}

export const AllModulesDrawer: React.FC<AllModulesDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab
}) => {
  const { activeMadrasa } = useAuth();

  if (!isOpen) return null;

  const handleItemClick = (tab: NavigationTab | 'students_add') => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Up Drawer Content */}
      <div 
        className="relative z-10 w-full max-h-[88vh] bg-[#10131a] border-t border-[#2d3340] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in slide-in-from-bottom duration-300"
      >
        {/* Top Grabber Handle */}
        <div className="w-full pt-3 pb-1 flex items-center justify-center">
          <div className="w-12 h-1 rounded-full bg-[#2d3340]" />
        </div>

        {/* Drawer Header */}
        <div className="p-4 pt-1 flex items-center justify-between border-b border-[#2d3340]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 border border-emerald-600/40 flex items-center justify-center overflow-hidden shrink-0">
              {activeMadrasa?.logoUrl ? (
                <img src={activeMadrasa.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {activeMadrasa?.name || 'Jamia Management ERP'}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                All Institutional Modules (فہرست تمام شعبہ جات)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#181c22] hover:bg-[#22262e] text-slate-400 hover:text-white border border-[#2d3340] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          
          {/* Group 1: Academics & Quran */}
          <div className="bg-[#181c22] rounded-2xl p-3 border border-[#2d3340]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d3340]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1. Academics & Quran
              </span>
              <span className="text-xs font-bold text-amber-400 font-urdu">
                شعبہ تعلیمات و قرآن
              </span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleItemClick('quran')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'quran' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Holy Quran Digital Mushaf</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">مصحفِ شریف (15 سطری)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('roznamcha')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'roznamcha' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookMarked className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Daily Sabaq & Roznamcha</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">روزنامچہ و سبق سبقی</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('classes')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'classes' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Classes & Jamats</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">درجات و کلاسیں</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('teachers')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'teachers' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Asatizah-e-Kiram</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">اساتذہ کرام و نگران</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('schedule')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'schedule' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Schedule & Namaz Timings</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">اوقات نماز و نظام الاوقات</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Group 2: Students & Admissions */}
          <div className="bg-[#181c22] rounded-2xl p-3 border border-[#2d3340]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d3340]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                2. Students & Admissions
              </span>
              <span className="text-xs font-bold text-emerald-400 font-urdu">
                شعبہ طلبہ و داخلہ
              </span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleItemClick('students')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'students' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Students Directory</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">فہرست طلبہ</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('students_add')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'students_add' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-[#1978e5]" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">New Student Admission</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">داخلہ نیا طالب علم</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold px-1.5 py-0.5 rounded">
                  8-Step
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('attendance')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'attendance' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Two-Shift Attendance</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">حاضری صبح و شام</span>
                  </div>
                </div>
                <span className="text-[10px] bg-[#22262e] text-slate-300 border border-[#2d3340] font-bold px-1.5 py-0.5 rounded">
                  2x Daily
                </span>
              </button>
            </div>
          </div>

          {/* Group 3: Finance & Accounts */}
          <div className="bg-[#181c22] rounded-2xl p-3 border border-[#2d3340]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d3340]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                3. Finance & Accounts
              </span>
              <span className="text-xs font-bold text-amber-400 font-urdu">
                مالیات و بیت المال
              </span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleItemClick('fees')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'fees' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Fees & Collections</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">وصولی فیس و چالان</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('income_expenses')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'income_expenses' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Cashbook & Expenses</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">روزنامچہ خرچ و آمدن</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('staff')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'staff' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Staff Management</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">ملازمین و عملہ</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Group 4: Records & Studio */}
          <div className="bg-[#181c22] rounded-2xl p-3 border border-[#2d3340]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d3340]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                4. Records & Studio
              </span>
              <span className="text-xs font-bold text-purple-400 font-urdu">
                امتحانات و اسناد
              </span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleItemClick('examinations')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'examinations' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Examinations & Results</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">امتحانات و نتائج گزٹ</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('certificates')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'certificates' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Certificates & ID Studio</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">اسناد و شناختی کارڈز</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('reports')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'reports' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Comprehensive Reports</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">جامع رپورٹس و گوشوارے</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Group 5: Campus & System */}
          <div className="bg-[#181c22] rounded-2xl p-3 border border-[#2d3340]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d3340]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                5. Campus & System
              </span>
              <span className="text-xs font-bold text-slate-400 font-urdu">
                کیمپس و ترتیبات
              </span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleItemClick('notices')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'notices' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Notice Board</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">اطلاع نامہ و اعلانات</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('inventory')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'inventory' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Inventory & Gallery</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">سامان مدرسہ و تصاویر</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('settings')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'settings' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Madrasa Settings</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">سیٹنگز و ترتیبات</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleItemClick('support')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  currentTab === 'support' ? 'bg-[#1978e5] text-white' : 'hover:bg-[#22262e] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Support & Guidance</span>
                    <span className="text-[10px] text-slate-400 font-urdu block">مدد و رہنمائی</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
