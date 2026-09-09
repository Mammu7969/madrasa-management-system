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
  PanelLeftOpen
} from 'lucide-react';
import { Modal } from '../common/Modal';

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

  const handleSaveLogo = (e: React.FormEvent) => {
    e.preventDefault();
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
        {/* Top Header: Mosque Emblem + Enterprise Suite */}
        <div className="p-3.5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#079669] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(7,150,105,0.3)] border border-white/30 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
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
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors shadow-2xs"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Institution Switcher Card */}
        {!isCollapsed && (
          <div className="mx-3 my-1.5 p-3 rounded-2xl bg-white/60 border border-white/80 shadow-2xs relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#079669] flex items-center justify-center border border-emerald-200/60 shrink-0">
                  <Building2 className="w-5 h-5" />
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
                onClick={() => setShowLogoModal(true)}
                title="Edit Details"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors shrink-0"
              >
                <PanelLeftOpen className="w-3.5 h-3.5" />
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

      {/* Logo Modal */}
      <Modal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        title="Edit Madrasa Logo"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setShowLogoModal(false)} className="px-4 py-2 text-xs text-gray-600">Cancel</button>
            <button onClick={handleSaveLogo} className="px-5 py-2 text-xs font-bold bg-m3-primary text-white rounded-full">Save</button>
          </div>
        }
      >
        <form onSubmit={handleSaveLogo} className="space-y-3">
          <label className="text-xs font-bold block mb-1">Logo URL</label>
          <input
            type="url"
            value={logoInputUrl}
            onChange={(e) => setLogoInputUrl(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border bg-white"
            placeholder="https://..."
          />
        </form>
      </Modal>
    </>
  );
};
