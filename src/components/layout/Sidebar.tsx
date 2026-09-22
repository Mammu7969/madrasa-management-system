import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BookMarked,
  UserCheck, 
  CalendarCheck, 
  Receipt,
  FileText, 
  Package, 
  Clock, 
  TrendingUp, 
  Award, 
  BarChart3, 
  Bell, 
  Settings, 
  ShieldAlert, 
  HelpCircle,
  Camera,
  Upload,
  ChevronRight,
  ChevronDown,
  Building2,
  LayoutDashboard,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { compressImage } from '../../utils/imageCompressor';

export type NavigationTab = 
  | 'dashboard'
  | 'quran'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'staff'
  | 'attendance'
  | 'roznamcha'
  | 'fees'
  | 'examinations'
  | 'inventory'
  | 'schedule'
  | 'income_expenses'
  | 'certificates'
  | 'reports'
  | 'notices'
  | 'settings'
  | 'mms_settings'
  | 'support';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  labelUrdu: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface NavGroup {
  id: string;
  groupName: string;
  groupNameUrdu: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, activeMadrasa, updateActiveMadrasa } = useAuth();
  const { language, t, showToast } = useTheme();

  const isUrdu = language === 'ur';

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);
  const [logoInputUrl, setLogoInputUrl] = useState<string>(activeMadrasa?.logoUrl || '');

  // Live entity counts for badges
  const studentsCount = useMemo(() => db.getStudents(activeMadrasa?.id).length, [activeMadrasa?.id]);
  const teachersCount = useMemo(() => db.getTeachers(activeMadrasa?.id).length, [activeMadrasa?.id]);
  const classesCount = useMemo(() => db.getClasses(activeMadrasa?.id).length, [activeMadrasa?.id]);
  const staffCount = useMemo(() => db.getStaff(activeMadrasa?.id).length, [activeMadrasa?.id]);

  const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 800, 0.8);
      setLogoInputUrl(compressed);
      showToast('Logo uploaded and optimized for 3x4 inches frame!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to load image file', 'error');
    }
  };

  const handleSaveLogo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeMadrasa) {
      const updated = {
        ...activeMadrasa,
        logoUrl: logoInputUrl.trim() || undefined
      };
      updateActiveMadrasa(updated);
      showToast('Madrasa logo updated successfully!', 'success');
      setShowLogoModal(false);
    }
  };

  // Grouped Navigation Structure for Commercial Enterprise ERP
  const navGroups: NavGroup[] = [
    {
      id: 'core',
      groupName: 'Core & Overview',
      groupNameUrdu: 'مرکزی و جائزہ',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', labelUrdu: 'مرکزی ڈیش بورڈ', icon: LayoutDashboard },
        { id: 'quran', label: 'Holy Quran Mushaf', labelUrdu: 'قرآن کریم مصحف', icon: BookOpen },
        { id: 'schedule', label: 'Madrasa Schedule & Namaz', labelUrdu: 'اوقات نماز و نظام الاوقات', icon: Clock },
      ]
    },
    {
      id: 'academics',
      groupName: 'Academic Operations',
      groupNameUrdu: 'تعلیمی و تدریسی شعبہ',
      items: [
        { id: 'classes', label: 'Classes & Syllabus', labelUrdu: 'درجات و کتب نصاب', icon: Layers, badge: classesCount },
        { id: 'teachers', label: 'Teachers Directory', labelUrdu: 'اساتذہ و مدرسین', icon: GraduationCap, badge: teachersCount },
        { id: 'roznamcha', label: 'Daily Roznamcha (Sabaq)', labelUrdu: 'روزنامچہ تدریس و سبق', icon: BookMarked },
        { id: 'attendance', label: 'Dual-Session Attendance', labelUrdu: 'حاضری رجسٹر (صبح و شام)', icon: CalendarCheck },
      ]
    },
    {
      id: 'students',
      groupName: 'Student Affairs',
      groupNameUrdu: 'شعبہ طلبہ و داخلہ',
      items: [
        { id: 'students', label: 'Students Roster', labelUrdu: 'رجسٹر طلبہ و کوائف', icon: Users, badge: studentsCount },
      ]
    },
    {
      id: 'finance',
      groupName: 'Finance & Accounts',
      groupNameUrdu: 'مالیات و عملہ',
      items: [
        { id: 'fees', label: 'Fees & Collections', labelUrdu: 'فیس وصولی و بقایا جات', icon: Receipt },
        { id: 'income_expenses', label: 'Cashbook & Expenses', labelUrdu: 'آمدنی و اخراجات کیش بک', icon: TrendingUp },
        { id: 'staff', label: 'Staff Management', labelUrdu: 'ملازمین و عملہ', icon: UserCheck, badge: staffCount },
      ]
    },
    {
      id: 'evaluations',
      groupName: 'Records & Studio',
      groupNameUrdu: 'امتحانات و اسناد',
      items: [
        { id: 'examinations', label: 'Examinations & Results', labelUrdu: 'امتحانات و نتائج گزٹ', icon: FileText },
        { id: 'certificates', label: 'Certificates & ID Studio', labelUrdu: 'اسناد و شناختی کارڈز', icon: Award },
        { id: 'reports', label: 'Comprehensive Reports', labelUrdu: 'جامع رپورٹس و گوشوارے', icon: BarChart3 },
      ]
    },
    {
      id: 'campus',
      groupName: 'Campus & System',
      groupNameUrdu: 'کیمپس و ترتیبات',
      items: [
        { id: 'notices', label: 'Notice Board', labelUrdu: 'اطلاع نامہ و اعلانات', icon: Bell },
        { id: 'inventory', label: 'Inventory & Gallery', labelUrdu: 'سامان مدرسہ و تصاویر', icon: Package },
        { id: 'settings', label: 'Madrasa Settings', labelUrdu: 'سیٹنگز و ترتیبات', icon: Settings },
        { id: 'support', label: 'Support & Guidance', labelUrdu: 'مدد و رہنمائی', icon: HelpCircle },
      ]
    }
  ];

  return (
    <>
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white/85 dark:bg-[#111b4b]/85 backdrop-blur-2xl border border-[#6679b4]/16 dark:border-white/10 shadow-[0_18px_45px_rgba(47,61,126,0.1)] rounded-3xl m-2.5 hidden lg:flex flex-col h-[calc(100vh-1.25rem)] sticky top-2.5 select-none shrink-0 transition-all duration-300 no-print overflow-hidden z-20`}
      >
        {/* Top Header: Prototype Crescent Logo & Title */}
        <div className="p-3.5 pb-3 flex items-center justify-between border-b border-[#6679b4]/14 dark:border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              onClick={() => {
                setLogoInputUrl(activeMadrasa?.logoUrl || '');
                setShowLogoModal(true);
              }}
              className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-white to-[#dbe5ff] dark:from-[#1e2a5e] dark:to-[#111b4b] flex items-center justify-center shadow-[0_7px_18px_rgba(63,86,171,0.18)] text-xl font-bold text-[#3567ff] dark:text-[#59c7ff] select-none border border-white/80 dark:border-white/10 shrink-0 cursor-pointer hover:scale-105 transition-transform"
              title="Click to view/change Madrasa Logo (3x4 inches)"
            >
              {activeMadrasa?.logoUrl ? (
                <img src={activeMadrasa.logoUrl} alt="Madrasa Logo" className="w-full h-full object-cover rounded-[14px]" />
              ) : (
                '☾'
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-xs font-black text-[#14204d] dark:text-white truncate">
                  {activeMadrasa?.name || 'Madrasa Management'}
                </h2>
                <span className="text-[10px] font-black text-[#3567ff] dark:text-[#59c7ff] tracking-wider uppercase block">
                  JAMIA ERP SYSTEM
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#3567ff] dark:hover:text-[#59c7ff] hover:bg-[#eef2ff] dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Institution Badge Card */}
        {!isCollapsed && (
          <div className="mx-2.5 my-2 p-2.5 rounded-2xl bg-gradient-to-br from-[#eef2ff] to-[#f4f7ff] dark:from-[#18245b]/70 dark:to-[#111b4b] border border-[#6679b4]/16 dark:border-white/10 flex items-center justify-between shadow-2xs">
            <div className="min-w-0">
              <span className="text-[10px] font-black text-white bg-gradient-to-r from-[#3567ff] to-[#7654ff] px-2 py-0.5 rounded-md inline-block font-mono shadow-xs">
                {activeMadrasa?.code || 'JAMIA-01'}
              </span>
              <p className="text-[11px] font-semibold text-[#14204d] dark:text-slate-300 truncate mt-1">
                {activeMadrasa?.address?.split(',')[0] || 'Central Campus'}
              </p>
            </div>
            <button
              onClick={() => {
                setLogoInputUrl(activeMadrasa?.logoUrl || '');
                setShowLogoModal(true);
              }}
              title="Official 3x4 Logo"
              className="p-1.5 rounded-xl text-[#3567ff] dark:text-[#59c7ff] hover:bg-white dark:hover:bg-white/10 border border-[#6679b4]/20 transition-all cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Grouped Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-3 no-scrollbar hide-scrollbar">
          {navGroups.map((group) => (
            <div key={group.id} className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2.5 pt-1.5 pb-1 flex items-center justify-between text-[10px] font-black text-[#7180a6] dark:text-slate-400 uppercase tracking-wider">
                  <span>{isUrdu ? group.groupNameUrdu : group.groupName}</span>
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const label = isUrdu ? item.labelUrdu : item.label;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={`${label} (${group.groupName})`}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs transition-all relative group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#3567ff] to-[#8752ff] text-white font-bold shadow-[0_10px_22px_rgba(71,78,238,0.25)]'
                        : 'text-[#55658f] dark:text-slate-300 hover:bg-[#eef2ff] dark:hover:bg-white/10 hover:text-[#14204d] dark:hover:text-white font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#7480a4] group-hover:text-[#3567ff] dark:group-hover:text-[#59c7ff]'}`} />
                      {!isCollapsed && <span className="truncate">{label}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.badge !== undefined && typeof item.badge === 'number' && item.badge > 0 && (
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            isActive 
                              ? 'bg-[#D97706] text-white' 
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/40 dark:border-amber-500/20'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-200 shrink-0" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Super Admin MMS Settings Link */}
          {user?.role === 'super_admin' && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onSelectTab('mms_settings')}
                title="MMS Settings (Super Admin)"
                className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  currentTab === 'mms_settings'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>MMS Multi-Tenant</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-800 text-white uppercase font-black">
                    Super
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer User Capsule */}
        <div className="p-2.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/5">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 shadow-2xs`}>
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden leading-tight flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize block truncate">
                  {user?.role === 'admin' ? 'Principal / Nazim' : user?.role || 'Staff'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Madrasa Logo Modal: Standard 3x4 Inches Inspection & Upload */}
      <Modal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        title="Official Madrasa Logo & Emblem (3x4 Inches Standard)"
        maxWidth="lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <div>
              {logoInputUrl && (
                <button
                  type="button"
                  onClick={() => setLogoInputUrl('')}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                >
                  Remove Logo
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveLogo()}
                className="px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Logo
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* 3x4 Inches Display Frame */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-[216px] h-[288px] sm:w-[288px] sm:h-[384px] bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-emerald-400 overflow-hidden shadow-sm flex items-center justify-center group">
                {logoInputUrl ? (
                  <>
                    <img
                      src={logoInputUrl}
                      alt="Madrasa Logo 3x4 Preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
                        3.0" × 4.0" (76 × 102 mm)
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4 space-y-2">
                    <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                    <span className="text-xs font-bold text-slate-400 block">No Logo Uploaded</span>
                    <span className="text-[10px] text-slate-400 block">Official 3x4 Inches Ratio</span>
                  </div>
                )}
                {/* Physical Dimension Badge */}
                <div className="absolute bottom-2 right-2 bg-emerald-800/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-xs">
                  3" × 4" (288×384px)
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500">Aspect Ratio: 3:4 (Portrait)</span>
            </div>

            {/* Upload Controls & URL */}
            <div className="flex-1 space-y-4 w-full">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Upload Logo Image File (تصویر اپلوڈ کریں)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select your Madrasa emblem or logo. The image is compressed and optimized for official print documents.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogoFile}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Or Paste Web Logo URL</label>
                <input
                  type="url"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
                  placeholder="https://example.com/madrasa-logo.png"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-300">
                💡 <strong>Commercial ERP Notice:</strong> This emblem renders across official Certificates, Student ID Cards, Examination Admit Cards, Receipts, and Reports.
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
