import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { FeeTransaction } from '../../types';
import { Wallet, Plus, Printer, CheckCircle2, Search, Filter } from 'lucide-react';
import { Modal } from '../common/Modal';

export const FeesModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { t, showToast } = useTheme();

  const students = db.getStudents(activeMadrasa?.id);
  const [fees, setFees] = useState<FeeTransaction[]>(() => db.getFees(activeMadrasa?.id));
  const [showCollectModal, setShowCollectModal] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [amount, setAmount] = useState<number>(2500);
  const [month, setMonth] = useState<string>('September 2026');
  const [mode, setMode] = useState<'Cash' | 'Online' | 'Bank Transfer'>('Cash');
  const [search, setSearch] = useState<string>('');

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    if (!st || !activeMadrasa) return;

    const receipt = db.collectFee({
      studentId: st.id,
      studentName: st.studentName,
      madrasaId: activeMadrasa.id,
      month,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      mode,
      status: 'Paid'
    });

    setFees(db.getFees(activeMadrasa.id));
    showToast(`Receipt #${receipt.receiptNo} created for ${st.studentName}!`, 'success');
    setShowCollectModal(false);
  };

  const filtered = fees.filter(f => 
    f.studentName.toLowerCase().includes(search.toLowerCase()) ||
    f.receiptNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = fees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1">
        <div>
          <h2 className="text-lg font-bold text-m3-on-surface flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-600" />
            <span>Fees Management & Collection (فیس کا نظام)</span>
          </h2>
          <p className="text-xs text-m3-on-surface-variant">
            Official receipt ledger, monthly fee records, and collection reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
            <span className="text-gray-500">Total Collected:</span>
            <strong className="text-amber-900 ml-1 font-mono text-sm">₹{totalCollected.toLocaleString()}</strong>
          </div>
          <button
            onClick={() => setShowCollectModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-m3-1"
          >
            <Plus className="w-4 h-4" />
            <span>Collect Fee</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name or receipt number..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-m3-surface-container-low border-b font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-4">Receipt No</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Fee Month</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Mode</th>
              <th className="p-4">Payment Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Print</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filtered.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-m3-primary">{f.receiptNo}</td>
                <td className="p-4 font-bold text-gray-900">{f.studentName}</td>
                <td className="p-4">{f.month}</td>
                <td className="p-4 font-mono font-bold text-emerald-800">₹{f.amount}</td>
                <td className="p-4">{f.mode}</td>
                <td className="p-4 font-mono text-gray-500">{f.date}</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {f.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4 text-m3-primary" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collect Modal */}
      <Modal
        isOpen={showCollectModal}
        onClose={() => setShowCollectModal(false)}
        title="Collect Fee & Issue Receipt"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setShowCollectModal(false)} className="px-4 py-2 text-xs text-gray-600">
              Cancel
            </button>
            <button onClick={handleCollect} className="px-5 py-2 text-xs font-bold bg-amber-600 text-white rounded-full">
              Confirm Collection
            </button>
          </div>
        }
      >
        <form onSubmit={handleCollect} className="space-y-3">
          <div>
            <label className="text-xs font-bold block mb-1">Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                const st = students.find(s => s.id === e.target.value);
                if (st) setAmount(st.monthlyFees);
              }}
              className="w-full p-2.5 text-xs rounded-xl border bg-white"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.studentName} ({s.admissionNo})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border bg-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Fee Month</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Payment Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl border bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online (UPI / QR)</option>
              <option value="Bank Transfer">Bank Transfer / Cheque</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
