import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  Sparkles,
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

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, activeMadrasa, updateActiveMadrasa } = useAuth();
  const { language, t, showToast } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);
  const [logoInputUrl, setLogoInputUrl] = useState<string>(activeMadrasa?.logoUrl || '');

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

  const menuItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quran' as NavigationTab, label: 'Holy Quran', icon: BookOpen },
    { id: 'students' as NavigationTab, label: 'Students', icon: Users },
    { id: 'teachers' as NavigationTab, label: 'Teachers', icon: GraduationCap },
    { id: 'classes' as NavigationTab, label: 'Classes & Subjects', icon: Layers },
    { id: 'staff' as NavigationTab, label: 'Staff', icon: UserCheck },
    { id: 'attendance' as NavigationTab, label: 'Attendance', icon: CalendarCheck },
    { id: 'roznamcha' as NavigationTab, label: 'Daily Roznamcha', icon: BookMarked },
    { id: 'fees' as NavigationTab, label: 'Fees Management', icon: Receipt },
    { id: 'examinations' as NavigationTab, label: 'Examinations', icon: FileText },
    { id: 'inventory' as NavigationTab, label: 'Madrasa Inventory', icon: Package },
    { id: 'schedule' as NavigationTab, label: 'Madrasa Schedule', icon: Clock },
    { id: 'income_expenses' as NavigationTab, label: 'Income & Expenses', icon: TrendingUp },
    { id: 'certificates' as NavigationTab, label: 'Certificates & ID Cards', icon: Award },
    { id: 'reports' as NavigationTab, label: 'Reports', icon: BarChart3 },
    { id: 'notices' as NavigationTab, label: 'Notice Board', icon: Bell },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(18,59,99,0.06)] rounded-3xl m-2.5 flex flex-col h-[calc(100vh-1.25rem)] sticky top-2.5 select-none shrink-0 transition-all duration-300 no-print overflow-hidden`}
      >
        {/* Top Header: Mosque Emblem / Madrasa Logo + Enterprise Suite */}
        <div className="p-3.5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              onClick={() => {
                setLogoInputUrl(activeMadrasa?.logoUrl || '');
                setShowLogoModal(true);
              }}
              className="w-10 h-10 rounded-2xl bg-[#079669] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(7,150,105,0.3)] border border-white/30 shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              title="Click to view/change Madrasa Logo (3x4 inches)"
            >
              {activeMadrasa?.logoUrl ? (
                <img src={activeMadrasa.logoUrl} alt="Madrasa Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-xs font-black text-slate-900 truncate">
                  {activeMadrasa?.name || 'Jamia Darul Huda Islamic ...'}
                </h2>
                <span className="text-[10px] font-extrabold text-[#079669] tracking-wider uppercase block">
                  ENTERPRISE SUITE
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors shadow-2xs cursor-pointer"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Institution Switcher Card */}
        {!isCollapsed && (
          <div className="mx-3 my-1.5 p-3 rounded-2xl bg-white/60 border border-white/80 shadow-2xs relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  onClick={() => {
                    setLogoInputUrl(activeMadrasa?.logoUrl || '');
                    setShowLogoModal(true);
                  }}
                  className="w-9 h-9 rounded-xl bg-emerald-50 text-[#079669] flex items-center justify-center border border-emerald-200/60 shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  title="Click to view/change Madrasa Logo (3x4 inches)"
                >
                  {activeMadrasa?.logoUrl ? (
                    <img src={activeMadrasa.logoUrl} alt="Madrasa Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                    {activeMadrasa?.name || 'Jamia Darul Huda Islamic ...'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    {activeMadrasa?.code || 'JDH-01'} • {activeMadrasa?.address?.split(',')[0] || 'Mehdipatnam'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setLogoInputUrl(activeMadrasa?.logoUrl || '');
                  setShowLogoModal(true);
                }}
                title="View & Edit Madrasa Logo (3x4 inches)"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors shrink-0 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            </div>
          </div>
        )}

        {/* 17 Menu Items Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-2xl text-xs transition-all relative overflow-hidden group ${
                  isActive
                    ? 'bg-[#079669] text-white font-bold shadow-[0_6px_20px_rgba(7,150,105,0.35)] border border-white/25'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#079669]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-white/90 shrink-0" />}
              </button>
            );
          })}

          {/* Super Admin ONLY */}
          {user?.role === 'super_admin' && (
            <button
              onClick={() => onSelectTab('mms_settings')}
              title="MMS Settings"
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                currentTab === 'mms_settings'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-amber-50/70 text-amber-900 border-amber-200/60 hover:bg-amber-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">MMS Settings</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-800 text-white uppercase font-black">
                  Super
                </span>
              )}
            </button>
          )}
        </div>

        {/* Footer User Profile Capsule */}
        <div className="p-3 border-t border-white/60 bg-white/40">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} p-2 rounded-2xl bg-white/70 border border-white/80 shadow-2xs`}>
            <div className="w-8 h-8 rounded-full bg-[#079669] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 border border-white/20">
              {user?.name?.[0] || 'M'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden leading-tight flex-1">
                <span className="text-xs font-black text-slate-900 block truncate">
                  {user?.name || 'Maulana Abdul Qadeer Qas...'}
                </span>
                <span className="text-[10px] text-slate-500 capitalize block truncate">
                  {user?.role === 'admin' ? 'Admin' : user?.role || 'Principal'}
                </span>
              </div>
            )}
            {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </div>
        </div>
      </aside>

      {/* Madrasa Logo Modal: 3x4 Inches Inspection & Upload */}
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
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                >
                  Remove Logo
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
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
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            {/* 3x4 Inches Display Inspection Frame (Exact 3:4 aspect ratio / 288x384px) */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-[216px] h-[288px] sm:w-[288px] sm:h-[384px] bg-white rounded-2xl border-2 border-dashed border-emerald-400 overflow-hidden shadow-md flex items-center justify-center group">
                {logoInputUrl ? (
                  <>
                    <img
                      src={logoInputUrl}
                      alt="Madrasa Logo 3x4 Inches Preview"
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
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
                    <span className="text-xs font-bold text-gray-400 block">No Logo Uploaded</span>
                    <span className="text-[10px] text-gray-400 block">Standard 3x4 Inches Frame</span>
                  </div>
                )}
                {/* Physical Dimension Badge */}
                <div className="absolute bottom-2 right-2 bg-emerald-800/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-xs">
                  3" × 4" (288×384px)
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-500">Aspect Ratio: 3:4 (Portrait)</span>
            </div>

            {/* Upload Controls & URL */}
            <div className="flex-1 space-y-4 w-full">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Upload Logo Image File (تصویر اپلوڈ کریں)</span>
                </h4>
                <p className="text-[11px] text-gray-500">
                  Select your Madrasa emblem or logo. The image is automatically compressed and fitted into the official 3x4 inches frame.
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

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <label className="text-xs font-bold text-gray-900 block">Or Paste Web Logo URL</label>
                <input
                  type="url"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-mono"
                  placeholder="https://example.com/madrasa-logo.png"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900">
                💡 <strong>Notice:</strong> This logo will appear across official Certificates, Student ID Cards, Examination Admit Cards, Receipts, and the main Sidebar.
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
