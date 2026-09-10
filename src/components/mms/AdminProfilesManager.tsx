import React, { useState, useEffect } from 'react';
import { Madrasa, MadrasaAdmin } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { compressImage } from '../../utils/imageCompressor';
import { Modal } from '../common/Modal';
import { 
  Key, 
  User, 
  Phone, 
  Camera, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Award, 
  UserCheck, 
  AlertCircle,
  Building2,
  RefreshCw
} from 'lucide-react';

interface AdminProfilesManagerProps {
  madrasa: Madrasa;
  onUpdateMadrasa?: (updated: Madrasa) => void;
  title?: string;
  subtitle?: string;
}

const DEFAULT_SLOTS: Array<'Admin-1' | 'Admin-2' | 'Admin-3' | 'Admin-4' | 'Admin-5'> = [
  'Admin-1', 'Admin-2', 'Admin-3', 'Admin-4', 'Admin-5'
];

export const AdminProfilesManager: React.FC<AdminProfilesManagerProps> = ({
  madrasa,
  onUpdateMadrasa,
  title,
  subtitle
}) => {
  const { updateActiveMadrasa, refreshMadrasas } = useAuth();
  const { showToast } = useTheme();

  const [admins, setAdmins] = useState<MadrasaAdmin[]>(() => madrasa.admins || []);

  // Synchronize when madrasa prop changes
  useEffect(() => {
    if (madrasa?.admins) {
      setAdmins(madrasa.admins);
    }
  }, [madrasa]);

  // Edit Modal State
  const [editingAdmin, setEditingAdmin] = useState<MadrasaAdmin | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Edit Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formNameUrdu, setFormNameUrdu] = useState<string>('');
  const [formSubTitle, setFormSubTitle] = useState<string>('Admin');
  const [formCustomSubTitle, setFormCustomSubTitle] = useState<string>('');
  const [formMobile, setFormMobile] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  // Quick visibility toggles for passwords in card list
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const togglePasswordReveal = (slot: string) => {
    setRevealedPasswords(prev => ({ ...prev, [slot]: !prev[slot] }));
  };

  const handleCopyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open Edit Modal for a given slot
  const handleOpenEdit = (admin: MadrasaAdmin) => {
    setEditingAdmin(admin);
    setFormName(admin.name || '');
    setFormNameUrdu(admin.nameUrdu || '');
    const presetSubTitles = ['Principal', 'Admin', 'Supervisor'];
    if (presetSubTitles.includes(admin.subTitle || '')) {
      setFormSubTitle(admin.subTitle || 'Admin');
      setFormCustomSubTitle('');
    } else {
      setFormSubTitle('Other');
      setFormCustomSubTitle(admin.subTitle || '');
    }
    setFormMobile(admin.mobileNumber || madrasa.contactNumber || '');
    setFormUsername(admin.username || '');
    setFormPassword(admin.password || '');
    setFormPhotoUrl(admin.profilePicUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80');
    setFormIsActive(admin.isActive ?? true);
    setShowFormPassword(false);
    setShowEditModal(true);
  };

  // Handle Photo Upload with Client-Side Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const compressed = await compressImage(file, 400, 400, 0.75);
      setFormPhotoUrl(compressed);
      showToast('Profile photo compressed and updated successfully!', 'success');
    } catch (err) {
      console.error('Photo upload failed:', err);
      showToast('Could not process the photo. Please try a different image.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Generate strong random password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Mms@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '#' + Math.floor(10 + Math.random() * 90);
    setFormPassword(pass);
    setShowFormPassword(true);
    showToast('New password generated!', 'success');
  };

  // Save changes to current admin
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    if (!formName.trim()) {
      showToast('Please enter Admin Name', 'warning');
      return;
    }
    if (!formUsername.trim()) {
      showToast('Please enter Username', 'warning');
      return;
    }
    if (!formPassword.trim()) {
      showToast('Please enter Password', 'warning');
      return;
    }

    const effectiveSubTitle = formSubTitle === 'Other' ? (formCustomSubTitle.trim() || 'Admin') : formSubTitle;

    const updatedAdmins = admins.map(a => {
      if (a.slot === editingAdmin.slot) {
        return {
          ...a,
          name: formName.trim(),
          nameUrdu: formNameUrdu.trim(),
          subTitle: effectiveSubTitle,
          mobileNumber: formMobile.trim(),
          username: formUsername.trim().toLowerCase(),
          password: formPassword.trim(),
          profilePicUrl: formPhotoUrl,
          isActive: formIsActive
        };
      }
      return a;
    });

    const updatedMadrasa: Madrasa = {
      ...madrasa,
      admins: updatedAdmins,
      // If Admin-1 was edited and designated Principal, sync madrasa.principalName
      principalName: editingAdmin.slot === 'Admin-1' && formName.trim() ? formName.trim() : madrasa.principalName
    };

    setAdmins(updatedAdmins);
    updateActiveMadrasa(updatedMadrasa);
    if (onUpdateMadrasa) {
      onUpdateMadrasa(updatedMadrasa);
    }
    refreshMadrasas();

    db.addUserLog({
      username: formUsername.trim(),
      role: 'Super Admin',
      madrasaId: madrasa.id,
      viewedData: `Admin Profiles (${madrasa.name})`,
      submittedData: `Saved profile details for ${editingAdmin.slot} (${formName.trim()} - ${effectiveSubTitle})`,
      dateTime: new Date().toLocaleString()
    });

    showToast(`Profile & credentials for ${editingAdmin.slot} (${formName.trim()}) saved successfully!`, 'success');
    setShowEditModal(false);
  };

  // Toggle active status directly from card
  const handleToggleActiveQuick = (slot: string, checked: boolean) => {
    const updatedAdmins = admins.map(a => {
      if (a.slot === slot) {
        return { ...a, isActive: checked };
      }
      return a;
    });

    const updatedMadrasa: Madrasa = {
      ...madrasa,
      admins: updatedAdmins
    };

    setAdmins(updatedAdmins);
    updateActiveMadrasa(updatedMadrasa);
    if (onUpdateMadrasa) {
      onUpdateMadrasa(updatedMadrasa);
    }
    refreshMadrasas();
    showToast(`${slot} status set to ${checked ? 'Active' : 'Inactive'}`, 'info');
  };

  const getSubTitleBadge = (subTitle?: string) => {
    switch (subTitle) {
      case 'Principal':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          icon: ShieldCheck,
          label: 'Principal / پرنسپل'
        };
      case 'Supervisor':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: Award,
          label: 'Supervisor / نگران'
        };
      case 'Admin':
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          icon: Key,
          label: subTitle || 'Admin / ایڈمن'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#2d3340] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 uppercase tracking-widest border border-blue-200 dark:border-blue-800">
              Admin Governance &bull; 5 Slots
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {madrasa.name} ({madrasa.code})
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{title || 'Admin-1 to Admin-5 Profiles & Logins'}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {subtitle || 'Manage names, designations (Admin, Principal, Supervisor), profile photos, mobile numbers, and login credentials for all 5 administrative tiers.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#1e232b] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-[#2d3340]">
            {admins.filter(a => a.isActive).length} Active of 5 Slots
          </span>
        </div>
      </div>

      {/* Grid of 5 Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {DEFAULT_SLOTS.map((slotName, idx) => {
          const admin = admins.find(a => a.slot === slotName) || {
            id: `adm-${madrasa.id}-${idx + 1}`,
            slot: slotName,
            name: idx === 0 ? (madrasa.principalName || 'Principal') : `${slotName} Officer`,
            subTitle: idx === 0 ? 'Principal' : idx === 1 ? 'Admin' : 'Supervisor',
            profilePicUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
            mobileNumber: madrasa.contactNumber || '+91 98480 00000',
            username: `admin${idx + 1}.${madrasa.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            password: 'password123',
            isActive: idx < 2
          };

          const badgeInfo = getSubTitleBadge(admin.subTitle);
          const BadgeIcon = badgeInfo.icon;
          const isPassRevealed = !!revealedPasswords[admin.slot];

          return (
            <div
              key={admin.slot}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                admin.isActive
                  ? 'bg-white dark:bg-[#181c22] border-slate-200/90 dark:border-[#2d3340] hover:border-blue-400 dark:hover:border-blue-500'
                  : 'bg-slate-50/70 dark:bg-[#10131a] border-dashed border-slate-200 dark:border-[#2d3340] opacity-85'
              }`}
            >
              {/* Card Header: Avatar, Slot & Status */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={admin.profilePicUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                        alt={admin.name || admin.slot}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-xs"
                      />
                      <span 
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-[#181c22] ${
                          admin.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} 
                        title={admin.isActive ? 'Active Account' : 'Inactive Account'}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-600 text-white shadow-2xs">
                          {admin.slot}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeInfo.bg}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{admin.subTitle || 'Admin'}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 line-clamp-1 leading-tight">
                        {admin.name || 'Unnamed Admin'}
                      </h4>
                      {admin.nameUrdu && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu urdu-font line-clamp-1">
                          {admin.nameUrdu}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <label 
                    className="flex flex-col items-center cursor-pointer shrink-0" 
                    title={admin.isActive ? 'Deactivate Login' : 'Activate Login'}
                  >
                    <input
                      type="checkbox"
                      checked={admin.isActive}
                      onChange={(e) => handleToggleActiveQuick(admin.slot, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600 relative"></div>
                    <span className="text-[9px] font-bold mt-1 text-slate-400">
                      {admin.isActive ? 'ACTIVE' : 'OFF'}
                    </span>
                  </label>
                </div>

                {/* Details Section */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2d3340] space-y-2.5">
                  {/* Mobile Number */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-400 text-[11px] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span>Mobile:</span>
                    </span>
                    <a 
                      href={`tel:${admin.mobileNumber}`} 
                      className="font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {admin.mobileNumber || 'Not specified'}
                    </a>
                  </div>

                  {/* Username */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#1e232b] px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-[#2d3340]">
                    <span className="text-slate-400 dark:text-slate-400 text-[11px] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Username:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {admin.username}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(admin.username, `${admin.slot}-user`, 'Username')}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Copy Username"
                      >
                        {copiedKey === `${admin.slot}-user` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#1e232b] px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-[#2d3340]">
                    <span className="text-slate-400 dark:text-slate-400 text-[11px] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Password:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {isPassRevealed ? admin.password : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordReveal(admin.slot)}
                        className="p-1 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                        title={isPassRevealed ? 'Hide Password' : 'Show Password'}
                      >
                        {isPassRevealed ? <EyeOff className="w-3 h-3 text-amber-500" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(admin.password, `${admin.slot}-pass`, 'Password')}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedKey === `${admin.slot}-pass` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2d3340] flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold ${admin.isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {admin.isActive ? '● Login Permitted' : '○ Login Disabled'}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(admin)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-800 transition-all cursor-pointer active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${editingAdmin?.slot} Profile & Credentials`}
        subtitle={`Update profile details and authentication keys for ${editingAdmin?.slot} at ${madrasa.name}`}
        maxWidth="lg"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-[#22262e] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAdmin}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save {editingAdmin?.slot}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdmin} className="space-y-4">
          
          {/* Top Banner: Profile Pic Upload + Names */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1e232b] border border-slate-200/80 dark:border-[#2d3340] flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={formPhotoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-md"
              />
              <label 
                className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                {editingAdmin?.slot} Profile Setup
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Upload a passport photo or picture of the officer. Photos are automatically compressed for lightweight cloud sync.
              </p>
              <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                <label className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>{isUploadingPhoto ? 'Compressing...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setFormPhotoUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80')}
                  className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
            </div>
          </div>

          {/* Sub Title / Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Sub Title (Designation / عہدہ) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Principal', label: 'Principal (پرنسپل)', icon: ShieldCheck },
                { id: 'Admin', label: 'Admin (ایڈمن)', icon: Key },
                { id: 'Supervisor', label: 'Supervisor (نگران)', icon: Award },
                { id: 'Other', label: 'Custom Title...', icon: Sparkles },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormSubTitle(opt.id)}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    formSubTitle === opt.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-[#1e232b] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#2d3340] hover:bg-slate-50 dark:hover:bg-[#22262e]'
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {formSubTitle === 'Other' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={formCustomSubTitle}
                  onChange={(e) => setFormCustomSubTitle(e.target.value)}
                  placeholder="e.g. Nazim-e-Taleemat, Accountant, Clerk, PRO"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-[#2d3340] bg-white dark:bg-[#181c22] text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
          </div>

          {/* Full Names (English & Urdu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Admin Full Name (English) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Maulana Abdul Qadeer Qasmi"
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 dark:border-[#2d3340] bg-white dark:bg-[#181c22] text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Admin Name (Urdu - اختیاری)
              </label>
              <input
                type="text"
                dir="rtl"
                value={formNameUrdu}
                onChange={(e) => setFormNameUrdu(e.target.value)}
                placeholder="مثلاً: مولانا عبد القدیر قاسمی"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2d3340] bg-white dark:bg-[#181c22] text-slate-900 dark:text-white text-xs font-urdu urdu-font focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Mobile Number (رابطہ نمبر) *
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formMobile}
                onChange={(e) => setFormMobile(e.target.value)}
                placeholder="e.g. +91 98480 22334"
                className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 dark:border-[#2d3340] bg-white dark:bg-[#181c22] text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Username (لاگ ان یوزرنیم) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. principal.jdh"
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 dark:border-[#2d3340] bg-white dark:bg-[#181c22] text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Password (پاس ورڈ) *
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showFormPassword ? 'text' : 'password'}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-[#2d3340] bg-white dark:bg-[#181c22] text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowFormPassword(!showFormPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showFormPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showFormPassword ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Active Account Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1e232b] border border-slate-200/70 dark:border-[#2d3340] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Account Status
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Enable or disable login access for {editingAdmin?.slot}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
              />
              <span className={`text-xs font-bold ${formIsActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {formIsActive ? 'Active (Can Login)' : 'Inactive'}
              </span>
            </label>
          </div>

        </form>
      </Modal>
    </div>
  );
};
