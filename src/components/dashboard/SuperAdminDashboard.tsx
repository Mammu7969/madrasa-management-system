import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Madrasa } from '../../types';
import { 
  Building2, 
  ShieldAlert, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Settings, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
  Trash2
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface SuperAdminDashboardProps {
  onOpenMadrasaDashboard: (m: Madrasa) => void;
  onOpenMMSSettings: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onOpenMadrasaDashboard,
  onOpenMMSSettings
}) => {
  const { availableMadrasas, refreshMadrasas, setActiveMadrasa, activeMadrasa, deleteMadrasa } = useAuth();
  const { t, showToast } = useTheme();

  const [showAddMadrasaModal, setShowAddMadrasaModal] = useState<boolean>(false);
  const [madrasaToDelete, setMadrasaToDelete] = useState<Madrasa | null>(null);
  const [newMadrasaName, setNewMadrasaName] = useState<string>('');
  const [newMadrasaUrdu, setNewMadrasaUrdu] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newPrincipal, setNewPrincipal] = useState<string>('');
  const [newContact, setNewContact] = useState<string>('');
  const [subscriptionStart, setSubscriptionStart] = useState<string>('2026-09-01');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string>('2027-09-01');

  const feedbacks = db.getFeedbacks();

  const handleMadrasaSelect = (mId: string) => {
    const target = availableMadrasas.find(m => m.id === mId);
    if (target) {
      setActiveMadrasa(target);
      onOpenMadrasaDashboard(target);
    }
  };

  const handleAddMadrasaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMadrasaName.trim()) return;

    const code = `MMS-${Math.floor(10 + Math.random() * 90)}`;
    const newMadrasa: Madrasa = {
      id: `madrasa-${Date.now()}`,
      name: newMadrasaName.trim(),
      nameUrdu: newMadrasaUrdu.trim() || newMadrasaName.trim(),
      code,
      address: newAddress.trim() || 'Telangana, India',
      principalName: newPrincipal.trim() || 'Principal / Nazim',
      contactNumber: newContact.trim() || '+91 98480 00000',
      subscriptionStart,
      subscriptionEnd,
      isSubscriptionActive: new Date(subscriptionEnd) > new Date(),
      cloudSyncEnabled: true,
      admins: [
        { id: `adm-${Date.now()}-1`, slot: 'Admin-1', username: `admin.${code.toLowerCase()}`, password: 'password123', isActive: true },
        { id: `adm-${Date.now()}-2`, slot: 'Admin-2', username: `staff.${code.toLowerCase()}`, password: 'password123', isActive: false },
        { id: `adm-${Date.now()}-3`, slot: 'Admin-3', username: `accountant.${code.toLowerCase()}`, password: 'password123', isActive: false },
        { id: `adm-${Date.now()}-4`, slot: 'Admin-4', username: `clerk.${code.toLowerCase()}`, password: 'password123', isActive: false },
        { id: `adm-${Date.now()}-5`, slot: 'Admin-5', username: `support.${code.toLowerCase()}`, password: 'password123', isActive: false },
      ]
    };

    db.addMadrasa(newMadrasa);
    refreshMadrasas();
    showToast(`New Madrasa "${newMadrasa.name}" registered successfully with allotted database!`, 'success');

    setNewMadrasaName('');
    setNewMadrasaUrdu('');
    setNewAddress('');
    setNewPrincipal('');
    setNewContact('');
    setShowAddMadrasaModal(false);
  };

  const handleConfirmDeleteMadrasa = () => {
    if (!madrasaToDelete) return;
    const name = madrasaToDelete.name;
    deleteMadrasa(madrasaToDelete.id);
    showToast(`Madrasa "${name}" removed successfully!`, 'success');
    setMadrasaToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Super Admin Hero Header */}
      <div className="rounded-3xl bg-[#123B63] p-6 sm:p-8 text-white shadow-m3-3 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-amber-950 uppercase tracking-wider shadow-xs">
                Super Admin Master Control
              </span>
              <span className="text-xs text-amber-200">
                Multi-Tenancy Cloud Infrastructure
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Madrasa Management System &bull; Headquarters
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
              Control subscriptions, allocate isolated databases, configure Admin credentials (Admin-1 to Admin-5), monitor cross-madrasa user audit logs, and manage institutional profiles.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowAddMadrasaModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black shadow-m3-2 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addMadrasa')}</span>
            </button>
            <button
              onClick={onOpenMMSSettings}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
            >
              <Settings className="w-4 h-4" />
              <span>MMS Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Select Madrasa Dropdown & Quick Switch Grid */}
      <div className="p-6 rounded-3xl bg-white border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-m3-outline-variant/20 pb-3">
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-m3-primary" />
              <span>Select Madrasa to Open Dashboard</span>
            </h3>
            <p className="text-xs text-m3-on-surface-variant">
              When clicked, opens that specific Madrasa's Dashboard including its Madrasa Management System Settings
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
            {availableMadrasas.length} Enrolled Madrasas
          </span>
        </div>

        {/* Dropdown Selector */}
        <div className="max-w-md">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Switch Active Madrasa (Dropdown List):
          </label>
          <div className="relative">
            <select
              value={activeMadrasa?.id || ''}
              onChange={(e) => handleMadrasaSelect(e.target.value)}
              className="w-full p-3 text-xs font-semibold rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-m3-primary appearance-none cursor-pointer"
            >
              {availableMadrasas.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {!m.isSubscriptionActive ? '(Subscription Ended)' : '(Active)'} - {m.principalName}
                </option>
              ))}
            </select>
            <ChevronRight className="w-4 h-4 text-gray-500 absolute right-3.5 top-3.5 pointer-events-none rotate-90" />
          </div>
        </div>

        {/* Madrasa Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {availableMadrasas.map((madrasa) => {
            const isCurrentActive = activeMadrasa?.id === madrasa.id;
            return (
              <div
                key={madrasa.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrentActive 
                    ? 'border-m3-primary bg-emerald-50/40 shadow-m3-1' 
                    : 'border-m3-outline-variant/30 hover:border-m3-outline bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-m3-primary bg-m3-primary-container px-2 py-0.5 rounded-full">
                      {madrasa.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      madrasa.isSubscriptionActive 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {madrasa.isSubscriptionActive ? 'Active Subscription' : 'Subscription Ended'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-gray-900 mt-2 line-clamp-1">
                    {madrasa.name}
                  </h4>
                  <p className="text-xs text-gray-600 font-urdu urdu-font line-clamp-1">
                    {madrasa.nameUrdu}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-gray-600">
                    <p>Principal: <strong>{madrasa.principalName}</strong></p>
                    <p>Contact: <strong className="font-mono text-emerald-800">{madrasa.contactNumber}</strong></p>
                    <p>Valid: <span className="font-mono text-[11px]">{madrasa.subscriptionStart} to {madrasa.subscriptionEnd}</span></p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMadrasaToDelete(madrasa);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl border border-rose-200 transition-all cursor-pointer"
                    title={`Remove ${madrasa.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Remove</span>
                  </button>
                  <button
                    onClick={() => handleMadrasaSelect(madrasa.id)}
                    className="flex items-center gap-1 text-xs font-bold text-m3-primary hover:text-m3-primary/80 transition-colors cursor-pointer"
                  >
                    <span>Open Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedbacks from All Madrasas Section */}
      <div className="p-6 rounded-3xl bg-white border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
        <div className="flex items-center justify-between border-b border-m3-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-m3-primary" />
            <div>
              <h3 className="text-sm font-bold text-m3-on-surface">Feedbacks from All Madrasas</h3>
              <p className="text-xs text-m3-on-surface-variant">Incoming remarks, support tickets, and suggestions</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-500">
            Total {feedbacks.length} Feedbacks
          </span>
        </div>

        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="p-4 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900">{fb.madrasaName}</span>
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                    {fb.senderName} ({fb.role})
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 font-mono">{fb.date}</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-gray-100">
                "{fb.message}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Madrasa Modal */}
      <Modal
        isOpen={showAddMadrasaModal}
        onClose={() => setShowAddMadrasaModal(false)}
        title="Add New Madrasa & Allot Database"
        subtitle="Registers a new Madrasa institution and allocates isolated data structures"
        maxWidth="lg"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddMadrasaModal(false)}
              className="px-4 py-2 text-xs font-medium text-gray-600 rounded-full"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleAddMadrasaSubmit}
              className="px-5 py-2 text-xs font-medium bg-m3-primary text-white rounded-full hover:bg-m3-primary/90 shadow-m3-1"
            >
              Submit & Allot Data
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddMadrasaSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Madrasa Name (English) *
              </label>
              <input
                type="text"
                value={newMadrasaName}
                onChange={(e) => setNewMadrasaName(e.target.value)}
                placeholder="e.g. Madrasa Sabeel-ur-Rashad"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Madrasa Name in Urdu (اردو)
              </label>
              <input
                type="text"
                value={newMadrasaUrdu}
                onChange={(e) => setNewMadrasaUrdu(e.target.value)}
                placeholder="مدرسہ سبیل الرشاد"
                className="w-full p-2.5 text-xs rounded-xl border bg-white urdu-font text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Principal / Nazim Name *
              </label>
              <input
                type="text"
                value={newPrincipal}
                onChange={(e) => setNewPrincipal(e.target.value)}
                placeholder="Maulana ..."
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Phone Number *
              </label>
              <input
                type="text"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="+91 98480 ..."
                className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Full Address
            </label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="City, State, Postal Code"
              className="w-full p-2.5 text-xs rounded-xl border bg-white"
            />
          </div>

          {/* Subscription Due Dates */}
          <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
            <span className="text-xs font-bold text-amber-900 block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              Subscription Due Period (From Date to End Date)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-600 block">From Date</label>
                <input
                  type="date"
                  value={subscriptionStart}
                  onChange={(e) => setSubscriptionStart(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border bg-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-600 block">End Date</label>
                <input
                  type="date"
                  value={subscriptionEnd}
                  onChange={(e) => setSubscriptionEnd(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border bg-white font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Remove Madrasa Confirmation Modal */}
      {madrasaToDelete && (
        <Modal
          isOpen={Boolean(madrasaToDelete)}
          onClose={() => setMadrasaToDelete(null)}
          title="Remove Madrasa Account (مدرسہ اکاؤنٹ حذف کریں)"
          subtitle="Super Admin Master Administrative Action"
          maxWidth="sm"
          footer={
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setMadrasaToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMadrasa}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Remove Account</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs text-gray-700">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-950">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Warning: Permanent Deletion</strong>
                <p className="mt-1 leading-relaxed text-rose-900">
                  Are you sure you want to remove <strong>{madrasaToDelete.name}</strong> ({madrasaToDelete.code})? This will delete this demo/institutional account from the system.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
