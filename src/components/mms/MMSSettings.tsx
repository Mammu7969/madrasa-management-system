import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Madrasa, MadrasaAdmin } from '../../types';
import { 
  ShieldAlert, 
  Users, 
  Key, 
  Calendar, 
  CloudOff, 
  Cloud, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Eye, 
  Clock, 
  FileText,
  Lock,
  Edit3
} from 'lucide-react';
import { AdminProfilesManager } from './AdminProfilesManager';

export const MMSSettings: React.FC = () => {
  const { activeMadrasa, availableMadrasas, updateActiveMadrasa, refreshMadrasas } = useAuth();
  const { t, showToast } = useTheme();

  const [activeSubMenu, setActiveSubMenu] = useState<'logs' | 'admins' | 'profile' | 'subscription'>('admins');
  const [selectedMadrasaId, setSelectedMadrasaId] = useState<string>(activeMadrasa?.id || availableMadrasas[0]?.id || '');

  const currentMadrasa = availableMadrasas.find(m => m.id === selectedMadrasaId) || activeMadrasa;

  // Admin credentials state (Admin-1 to Admin-5)
  const [adminsState, setAdminsState] = useState<MadrasaAdmin[]>(() => {
    return currentMadrasa?.admins || [
      { id: 'adm-1', slot: 'Admin-1', username: 'admin1', password: 'password123', isActive: true },
      { id: 'adm-2', slot: 'Admin-2', username: 'admin2', password: 'password123', isActive: false },
      { id: 'adm-3', slot: 'Admin-3', username: 'admin3', password: 'password123', isActive: false },
      { id: 'adm-4', slot: 'Admin-4', username: 'admin4', password: 'password123', isActive: false },
      { id: 'adm-5', slot: 'Admin-5', username: 'admin5', password: 'password123', isActive: false },
    ];
  });

  // Madrasa Profile state
  const [profileName, setProfileName] = useState<string>(currentMadrasa?.name || '');
  const [profileUrdu, setProfileUrdu] = useState<string>(currentMadrasa?.nameUrdu || '');
  const [profileAddress, setProfileAddress] = useState<string>(currentMadrasa?.address || '');
  const [profilePrincipal, setProfilePrincipal] = useState<string>(currentMadrasa?.principalName || '');
  const [profileContact, setProfileContact] = useState<string>(currentMadrasa?.contactNumber || '');

  // Subscription state
  const [subStartDate, setSubStartDate] = useState<string>(currentMadrasa?.subscriptionStart || '2026-01-01');
  const [subEndDate, setSubEndDate] = useState<string>(currentMadrasa?.subscriptionEnd || '2027-01-01');
  const [isSubActive, setIsSubActive] = useState<boolean>(currentMadrasa?.isSubscriptionActive ?? true);
  const [cloudSync, setCloudSync] = useState<boolean>(currentMadrasa?.cloudSyncEnabled ?? true);

  // User Logs
  const userLogs = db.getUserLogs();

  // Handle switching madrasa within MMS
  const handleSwitchMadrasa = (mId: string) => {
    setSelectedMadrasaId(mId);
    const found = availableMadrasas.find(m => m.id === mId);
    if (found) {
      setAdminsState(found.admins);
      setProfileName(found.name);
      setProfileUrdu(found.nameUrdu);
      setProfileAddress(found.address);
      setProfilePrincipal(found.principalName);
      setProfileContact(found.contactNumber);
      setSubStartDate(found.subscriptionStart);
      setSubEndDate(found.subscriptionEnd);
      setIsSubActive(found.isSubscriptionActive);
      setCloudSync(found.cloudSyncEnabled);
    }
  };

  // Save single admin slot
  const handleSaveAdminSlot = (slotIndex: number) => {
    if (!currentMadrasa) return;
    const updatedAdmins = [...adminsState];
    const targetAdmin = updatedAdmins[slotIndex];

    const updatedMadrasa: Madrasa = {
      ...currentMadrasa,
      admins: updatedAdmins
    };

    updateActiveMadrasa(updatedMadrasa);
    showToast(`${targetAdmin.slot} credentials for "${currentMadrasa.name}" saved successfully!`, 'success');
  };

  // Save Madrasa Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMadrasa) return;

    const updatedMadrasa: Madrasa = {
      ...currentMadrasa,
      name: profileName.trim(),
      nameUrdu: profileUrdu.trim(),
      address: profileAddress.trim(),
      principalName: profilePrincipal.trim(),
      contactNumber: profileContact.trim(),
    };

    updateActiveMadrasa(updatedMadrasa);
    showToast(`Madrasa Profile for "${updatedMadrasa.name}" updated by Super Admin!`, 'success');
  };

  // Save Subscription & Cloud Sync
  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMadrasa) return;

    const updatedMadrasa: Madrasa = {
      ...currentMadrasa,
      subscriptionStart: subStartDate,
      subscriptionEnd: subEndDate,
      isSubscriptionActive: isSubActive,
      cloudSyncEnabled: isSubActive ? cloudSync : false // Stopped if subscription ended
    };

    updateActiveMadrasa(updatedMadrasa);
    if (!isSubActive) {
      showToast(`Subscription ended for "${currentMadrasa.name}". Cloud sync has been halted!`, 'warning');
    } else {
      showToast(`Subscription period updated for "${currentMadrasa.name}"!`, 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-amber-950 text-white p-6 shadow-m3-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-amber-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-amber-950 uppercase tracking-widest">
              Super Admin Exclusive Menu
            </span>
            <span className="text-xs text-amber-200">
              Central Institutional Architecture
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{t('menuMMS')}</h2>
          <p className="text-xs text-amber-200/80 mt-1 max-w-xl">
            Configure Admin-1 to Admin-5 logins, oversee user audit logs, manage subscription validity periods, and govern Madrasa master identities.
          </p>
        </div>

        {/* Selected Madrasa Target */}
        <div className="bg-amber-900/60 p-3 rounded-2xl border border-amber-700/50 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <label className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">
              Target Madrasa
            </label>
            <select
              value={selectedMadrasaId}
              onChange={(e) => handleSwitchMadrasa(e.target.value)}
              className="bg-black/40 text-xs font-bold text-white rounded-lg p-1 border border-amber-600/50 focus:outline-none"
            >
              {availableMadrasas.map(m => (
                <option key={m.id} value={m.id} className="bg-gray-900 text-white">
                  {m.name} {!m.isSubscriptionActive ? '(Expired)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sub Menu Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-m3-outline-variant/30 pb-3">
        <button
          onClick={() => setActiveSubMenu('admins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeSubMenu === 'admins'
              ? 'bg-amber-600 text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Admin-1 to Admin-5 Credentials</span>
        </button>

        <button
          onClick={() => setActiveSubMenu('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeSubMenu === 'logs'
              ? 'bg-amber-600 text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>User System Logs ({userLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubMenu('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeSubMenu === 'profile'
              ? 'bg-amber-600 text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Madrasa Profile & Names</span>
        </button>

        <button
          onClick={() => setActiveSubMenu('subscription')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeSubMenu === 'subscription'
              ? 'bg-amber-600 text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Subscription & Cloud Sync Control</span>
        </button>
      </div>

      {/* Sub Menu 1: Admin Profiles & Credentials (Admin-1 to Admin-5) */}
      {activeSubMenu === 'admins' && currentMadrasa && (
        <div className="bg-white dark:bg-[#181c22] p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-[#2d3340] shadow-xs">
          <AdminProfilesManager
            madrasa={currentMadrasa}
            onUpdateMadrasa={(updated) => {
              setAdminsState(updated.admins);
              updateActiveMadrasa(updated);
            }}
          />
        </div>
      )}

      {/* Sub Menu 2: User Logs */}
      {activeSubMenu === 'logs' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface flex items-center gap-2">
              <Clock className="w-4 h-4 text-m3-primary" />
              <span>User System Audit Logs</span>
            </h3>
            <p className="text-xs text-m3-on-surface-variant mt-1">
              Tracks Usernames, Roles, Viewed Data, Submitted Data, Date & Time, and Reports & Feedback
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-m3-outline-variant/30">
            <table className="w-full text-left text-xs">
              <thead className="bg-m3-surface-container-low text-m3-on-surface font-bold border-b border-m3-outline-variant/30">
                <tr>
                  <th className="p-3">Username</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Viewed Data</th>
                  <th className="p-3">Submitted Data</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Reports & Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {userLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-m3-primary">{log.username}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                        {log.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 max-w-xs truncate">{log.viewedData}</td>
                    <td className="p-3 text-emerald-800 font-semibold max-w-xs truncate">{log.submittedData}</td>
                    <td className="p-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">{log.dateTime}</td>
                    <td className="p-3 text-gray-600 max-w-xs truncate">{log.reportsAndFeedback || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Menu 3: Madrasa Profile & Names */}
      {activeSubMenu === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-m3-primary" />
              <span>Madrasa Identity Governance</span>
            </h3>
            <p className="text-xs text-m3-on-surface-variant mt-1">
              Any Admin/Principal cannot change their Madrasa Name and Address without permission of Super Admin. You control master identity attributes here.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Official Madrasa Name (English)
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border bg-white font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Official Madrasa Name in Urdu (اردو)
              </label>
              <input
                type="text"
                value={profileUrdu}
                onChange={(e) => setProfileUrdu(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border bg-white font-semibold urdu-font text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Permanent Campus Address
              </label>
              <textarea
                rows={2}
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Designated Principal / Nazim
                </label>
                <input
                  type="text"
                  value={profilePrincipal}
                  onChange={(e) => setProfilePrincipal(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Institutional Contact Number
                </label>
                <input
                  type="text"
                  value={profileContact}
                  onChange={(e) => setProfileContact(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 text-white text-xs font-bold shadow-m3-1 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Update Madrasa Profile</span>
            </button>
          </form>
        </div>
      )}

      {/* Sub Menu 4: Subscription & Cloud Sync Control */}
      {activeSubMenu === 'subscription' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Madrasa Subscription & Cloud Sync Control</span>
            </h3>
            <p className="text-xs text-m3-on-surface-variant mt-1">
              Super Admin can control Madrasa's subscriptions, manually select the validity period, and stop cloud sync for any subscription-ended madrasa.
            </p>
          </div>

          <form onSubmit={handleSaveSubscription} className="space-y-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <span className="text-xs font-bold text-amber-900 block">
                Subscription Validity Period for "{currentMadrasa?.name}"
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-600 block mb-1">From Date</label>
                  <input
                    type="date"
                    value={subStartDate}
                    onChange={(e) => setSubStartDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-600 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={subEndDate}
                    onChange={(e) => setSubEndDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status Switches */}
            <div className="space-y-3 p-4 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Subscription Status</span>
                  <span className="text-[11px] text-gray-500">
                    If ended, users will see the mandatory subscription expiration warning at login.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubActive(!isSubActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isSubActive ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isSubActive ? 'Active' : 'Ended'}
                </button>
              </div>

              <div className="h-px bg-gray-200 my-2" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                    {cloudSync ? <Cloud className="w-4 h-4 text-blue-600" /> : <CloudOff className="w-4 h-4 text-gray-400" />}
                    Cloud Synchronization
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Stop cloud sync of this specific subscription-ended Madrasa.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!isSubActive}
                  onClick={() => setCloudSync(!cloudSync)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-40 ${
                    cloudSync && isSubActive ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                  }`}
                >
                  {cloudSync && isSubActive ? 'Sync Active' : 'Sync Stopped'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-m3-1 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Apply Subscription Settings</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
