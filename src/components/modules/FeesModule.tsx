import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { FeeTransaction, Student } from '../../types';
import { 
  Wallet, 
  Plus, 
  Printer, 
  CheckCircle2, 
  Search, 
  Filter, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Download, 
  Send, 
  Clock, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  ArrowUpRight,
  Eye,
  Calendar
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const FeesModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { t, showToast } = useTheme();

  const [activeTab, setActiveTab] = useState<'receipts' | 'defaulters' | 'sponsorships'>('receipts');
  const [fees, setFees] = useState<FeeTransaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Modals
  const [showCollectModal, setShowCollectModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeTransaction | null>(null);

  // Form State for Fee Collection
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [amount, setAmount] = useState<number>(2500);
  const [month, setMonth] = useState<string>('September 2026');
  const [mode, setMode] = useState<'Cash' | 'Online' | 'Bank Transfer'>('Cash');
  const [notes, setNotes] = useState<string>('');

  const loadData = () => {
    const sts = db.getStudents(activeMadrasa?.id);
    const fs = db.getFees(activeMadrasa?.id);
    setStudents(sts);
    setFees(fs);
    if (sts.length > 0 && !selectedStudentId) {
      setSelectedStudentId(sts[0].id);
      setAmount(sts[0].monthlyFees || 2500);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeMadrasa?.id]);

  // Months List for Filter
  const availableMonths = useMemo(() => {
    const mSet = new Set(fees.map(f => f.month).filter(Boolean));
    return Array.from(mSet);
  }, [fees]);

  // Filtered Fee Transactions
  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      const matchSearch = !search.trim() || 
        f.studentName.toLowerCase().includes(search.toLowerCase()) ||
        f.receiptNo.toLowerCase().includes(search.toLowerCase());
      const matchMode = selectedMode === 'all' || f.mode === selectedMode;
      const matchMonth = selectedMonth === 'all' || f.month === selectedMonth;
      return matchSearch && matchMode && matchMonth;
    });
  }, [fees, search, selectedMode, selectedMonth]);

  // Defaulters calculation: Students who haven't paid fees for the current cycle or owe fees
  const defaultersList = useMemo(() => {
    const currentMonthStr = 'September 2026';
    return students
      .filter(s => s.sponsorship === 'Self-Sponsored' || s.sponsorship === 'Discounted')
      .map(s => {
        const studentFees = fees.filter(f => f.studentId === s.id);
        const hasPaidCurrentMonth = studentFees.some(f => f.month.toLowerCase().includes('september') || f.month.toLowerCase().includes('09/2026'));
        const pendingAmount = hasPaidCurrentMonth ? 0 : s.monthlyFees;
        return {
          student: s,
          hasPaidCurrentMonth,
          pendingAmount,
          lastPaymentDate: studentFees[0]?.date || 'No recent payment'
        };
      })
      .filter(d => d.pendingAmount > 0);
  }, [students, fees]);

  // Sponsored Students List
  const sponsoredList = useMemo(() => {
    return students.filter(s => s.sponsorship !== 'Self-Sponsored');
  }, [students]);

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalCollected = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalDefaulterAmount = defaultersList.reduce((sum, d) => sum + d.pendingAmount, 0);
    const totalCash = fees.filter(f => f.mode === 'Cash').reduce((sum, f) => sum + f.amount, 0);
    const totalOnline = fees.filter(f => f.mode === 'Online' || f.mode === 'Bank Transfer').reduce((sum, f) => sum + f.amount, 0);
    return {
      totalCollected,
      totalDefaulterAmount,
      defaulterCount: defaultersList.length,
      sponsoredCount: sponsoredList.length,
      totalCash,
      totalOnline
    };
  }, [fees, defaultersList, sponsoredList]);

  // Handle Fee Collection Submit
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

    loadData();
    showToast(`Official Receipt #${receipt.receiptNo} created for ${st.studentName}!`, 'success');
    setShowCollectModal(false);
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  // Open Receipt Print View
  const handleViewReceipt = (receipt: FeeTransaction) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  // Export Fees CSV
  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Student Name', 'Admission No', 'Month', 'Amount', 'Mode', 'Payment Date', 'Status'];
    const rows = filteredFees.map(f => {
      const st = students.find(s => s.id === f.studentId);
      return [
        `"${f.receiptNo}"`,
        `"${f.studentName}"`,
        `"${st?.admissionNo || 'N/A'}"`,
        `"${f.month}"`,
        f.amount,
        `"${f.mode}"`,
        `"${f.date}"`,
        `"${f.status}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fees_ledger_${activeMadrasa?.code || 'mms'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredFees.length} fee transactions to CSV!`, 'success');
  };

  // Quick Collect for a specific Defaulter
  const handleQuickCollectDefaulter = (st: Student) => {
    setSelectedStudentId(st.id);
    setAmount(st.monthlyFees || 2500);
    setMonth('September 2026');
    setShowCollectModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-m3-on-surface flex items-center gap-2">
              <span>Fees & Financial Accounting</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                شعبہ مالیات و فیس
              </span>
            </h1>
            <p className="text-xs text-m3-on-surface-variant mt-0.5">
              Official counterfoil receipts, pending dues tracking, and sponsor concessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-m3-outline-variant/30 text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container dark:hover:bg-m3-surface-container-high transition-colors"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Export Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (students.length > 0) {
                setSelectedStudentId(students[0].id);
                setAmount(students[0].monthlyFees || 2500);
              }
              setShowCollectModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-m3-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Collect Fee (فیس وصولی)</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-m3-surface-container p-4.5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant block">Total Collections</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{metrics.totalCollected.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-m3-surface-container p-4.5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant block">Pending Dues</span>
            <span className="text-lg font-black text-red-600 dark:text-red-400 font-mono">
              ₹{metrics.totalDefaulterAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-m3-surface-container p-4.5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant block">Fee Defaulters</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              {metrics.defaulterCount} Talaba
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-m3-surface-container p-4.5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant block">Sponsored / Free</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
              {metrics.sponsoredCount} Students
            </span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-m3-outline-variant/20 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('receipts')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all ${
            activeTab === 'receipts'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-m3-on-surface-variant hover:bg-m3-surface-container dark:hover:bg-m3-surface-container-high'
          }`}
        >
          <span>Official Receipts Ledger ({fees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'defaulters'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-m3-on-surface-variant hover:bg-m3-surface-container dark:hover:bg-m3-surface-container-high'
          }`}
        >
          <span>Pending Dues / Defaulters</span>
          {metrics.defaulterCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'defaulters' ? 'bg-white text-red-600' : 'bg-red-100 dark:bg-red-950/40 text-red-600'
            }`}>
              {metrics.defaulterCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sponsorships')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all ${
            activeTab === 'sponsorships'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-m3-on-surface-variant hover:bg-m3-surface-container dark:hover:bg-m3-surface-container-high'
          }`}
        >
          <span>Sponsorships & Concessions ({sponsoredList.length})</span>
        </button>
      </div>

      {/* TAB 1: RECEIPTS LEDGER */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-m3-surface-container p-4 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search receipts by student name or receipt #..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="p-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
              >
                <option value="all">All Modes</option>
                <option value="Cash">Cash (نقد)</option>
                <option value="Online">Online / UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
              >
                <option value="all">All Months</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-white dark:bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 overflow-hidden">
            {filteredFees.length === 0 ? (
              <div className="p-12 text-center text-xs text-m3-on-surface-variant space-y-2">
                <Wallet className="w-10 h-10 text-m3-on-surface-variant/40 mx-auto" />
                <p className="font-bold text-m3-on-surface">No fee transactions found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-m3-surface-container-high text-m3-on-surface font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Receipt No</th>
                      <th className="p-3.5">Student / Talib-e-Ilm</th>
                      <th className="p-3.5">Billing Month</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Payment Mode</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-center">Receipt Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-m3-outline-variant/10">
                    {filteredFees.map(f => {
                      const st = students.find(s => s.id === f.studentId);
                      return (
                        <tr key={f.id} className="hover:bg-m3-surface-container-low dark:hover:bg-m3-surface-container-high/30 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-amber-700 dark:text-amber-400">
                            {f.receiptNo}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-m3-on-surface block">{f.studentName}</span>
                            <span className="text-[10px] text-m3-on-surface-variant font-mono">
                              Adm: {st?.admissionNo || 'N/A'} &bull; {st?.class || ''}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium text-m3-on-surface">
                            {f.month}
                          </td>
                          <td className="p-3.5 font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                            ₹{f.amount.toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-m3-surface-container-high text-m3-on-surface">
                              {f.mode}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-m3-on-surface-variant text-[11px]">
                            {f.date}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                              {f.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleViewReceipt(f)}
                              className="p-1.5 rounded-xl hover:bg-m3-surface-container-high text-amber-700 dark:text-amber-400 transition-colors"
                              title="View & Print Official Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEFAULTERS & PENDING DUES */}
      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-red-500/10 dark:bg-red-950/30 border border-red-300/40 dark:border-red-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-bold text-red-900 dark:text-red-200">
                  {defaultersList.length} Students with Pending September Fees
                </p>
                <p className="text-red-700 dark:text-red-400 text-[11px]">
                  Total uncollected monthly dues: ₹{metrics.totalDefaulterAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Reminders sent to all pending guardians via SMS/WhatsApp gateway!', 'info')}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Reminders</span>
            </button>
          </div>

          <div className="bg-white dark:bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 overflow-hidden">
            {defaultersList.length === 0 ? (
              <div className="p-12 text-center text-xs text-emerald-600 dark:text-emerald-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-base">Alhamdulillah! No Outstanding Fee Defaulters</p>
                <p className="text-m3-on-surface-variant">All registered students are up to date on monthly dues.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-m3-surface-container-high text-m3-on-surface font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Adm No</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Father / Guardian</th>
                      <th className="p-3.5">Class</th>
                      <th className="p-3.5">Contact No</th>
                      <th className="p-3.5">Monthly Fee</th>
                      <th className="p-3.5">Pending Dues</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-m3-outline-variant/10">
                    {defaultersList.map(({ student: st, pendingAmount, lastPaymentDate }) => (
                      <tr key={st.id} className="hover:bg-m3-surface-container-low transition-colors">
                        <td className="p-3.5 font-mono font-bold text-m3-primary">{st.admissionNo}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-m3-on-surface block">{st.studentName}</span>
                          {st.studentNameUrdu && (
                            <span className="text-[10px] text-m3-on-surface-variant urdu-font">{st.studentNameUrdu}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-m3-on-surface">{st.fatherName}</td>
                        <td className="p-3.5 font-semibold text-m3-on-surface">{st.class}</td>
                        <td className="p-3.5 font-mono text-m3-on-surface-variant">{st.contactNumber}</td>
                        <td className="p-3.5 font-mono">₹{st.monthlyFees}</td>
                        <td className="p-3.5 font-mono font-black text-red-600">
                          ₹{pendingAmount}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleQuickCollectDefaulter(st)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition-all"
                          >
                            Collect Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SPONSORSHIPS & CONCESSIONS */}
      {activeTab === 'sponsorships' && (
        <div className="bg-white dark:bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-m3-surface-container-high text-m3-on-surface font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Adm No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Sponsorship Type</th>
                  <th className="p-3.5">Kafeel / Sponsor Name</th>
                  <th className="p-3.5">Institutional Fees</th>
                  <th className="p-3.5">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-m3-outline-variant/10">
                {sponsoredList.map(st => (
                  <tr key={st.id} className="hover:bg-m3-surface-container-low transition-colors">
                    <td className="p-3.5 font-mono font-bold text-m3-primary">{st.admissionNo}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-m3-on-surface block">{st.studentName}</span>
                      {st.studentNameUrdu && (
                        <span className="text-[10px] text-m3-on-surface-variant urdu-font">{st.studentNameUrdu}</span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-m3-on-surface">{st.class}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300">
                        {st.sponsorship}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-m3-on-surface">
                      {st.kafeelName || 'Bait-ul-Maal (Institutional Sponsor)'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{st.monthlyFees}
                    </td>
                    <td className="p-3.5 text-m3-on-surface-variant">
                      {st.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: COLLECT FEE & ISSUE RECEIPT
          ========================================================================= */}
      <Modal
        isOpen={showCollectModal}
        onClose={() => setShowCollectModal(false)}
        title="Collect Monthly Fee & Issue Receipt"
        subtitle="Record payment against student registry ledger"
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setShowCollectModal(false)}
              className="px-4 py-2 text-xs font-bold text-m3-on-surface-variant hover:bg-black/5 rounded-full"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCollect}
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-all shadow-m3-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Issue Receipt</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleCollect} className="space-y-4 p-1">
          <div>
            <label className="text-xs font-bold block mb-1 text-m3-on-surface">Select Student (طالب علم) *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                const st = students.find(s => s.id === e.target.value);
                if (st) setAmount(st.monthlyFees);
              }}
              className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.studentName} &bull; {s.admissionNo} &bull; ({s.class}) - Monthly: ₹{s.monthlyFees}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1 text-m3-on-surface">Amount Collected (₹) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono font-bold text-emerald-700 dark:text-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-m3-on-surface">Billing Month *</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. September 2026"
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-m3-on-surface">Payment Mode *</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
              >
                <option value="Cash">Cash (نقد)</option>
                <option value="Online">Online (UPI / QR Code)</option>
                <option value="Bank Transfer">Bank Transfer / Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-m3-on-surface">Payment Date</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: OFFICIAL COUNTERFOIL RECEIPT SLIP & PRINT
          ========================================================================= */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Official Fee Receipt Slip"
        subtitle={`Receipt No: ${selectedReceipt?.receiptNo || ''}`}
        maxWidth="lg"
        allowPrint={true}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-m3-on-surface-variant">
              Valid Madrasa Management System Official Counterfoil
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 text-xs font-bold text-m3-on-surface-variant hover:bg-black/5 rounded-full"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-m3-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        }
      >
        {selectedReceipt && (
          <div className="p-6 bg-white dark:bg-m3-surface-container rounded-2xl border border-m3-outline-variant/30 space-y-5 text-m3-on-surface">
            {/* Header with Logo */}
            <div className="flex items-center justify-between border-b-2 border-amber-600/30 pb-4">
              <div className="flex items-center gap-3">
                {activeMadrasa?.logoUrl && (
                  <img src={activeMadrasa.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                )}
                <div>
                  <h3 className="text-base font-black text-amber-900 dark:text-amber-300">
                    {activeMadrasa?.name || 'JAMIA ISLAMIA ARABIA'}
                  </h3>
                  <p className="text-xs font-bold text-m3-primary urdu-font">
                    {activeMadrasa?.nameUrdu || 'جامعہ اسلامیہ عربیہ'}
                  </p>
                  <p className="text-[10px] text-m3-on-surface-variant">
                    {activeMadrasa?.address || 'Treasury & Accounts Department'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-m3-on-surface-variant uppercase tracking-wider block">Official Receipt</span>
                <span className="font-mono font-black text-amber-700 dark:text-amber-400 text-sm block">
                  {selectedReceipt.receiptNo}
                </span>
                <span className="text-[10px] text-m3-on-surface-variant font-mono">
                  Date: {selectedReceipt.date}
                </span>
              </div>
            </div>

            {/* Receipt Details Body */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
              <div>
                <span className="text-[10px] text-m3-on-surface-variant block">Talib-e-Ilm / Student:</span>
                <span className="font-bold text-sm text-m3-on-surface">{selectedReceipt.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-m3-on-surface-variant block">Fee For Month:</span>
                <span className="font-bold text-sm text-m3-on-surface">{selectedReceipt.month}</span>
              </div>
              <div>
                <span className="text-[10px] text-m3-on-surface-variant block">Payment Mode:</span>
                <span className="font-bold text-m3-on-surface">{selectedReceipt.mode}</span>
              </div>
              <div>
                <span className="text-[10px] text-m3-on-surface-variant block">Payment Status:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PAID (وصول شدہ)</span>
                </span>
              </div>
            </div>

            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-900 dark:text-emerald-300 font-bold block">Total Amount Received:</span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Rupees in Cash / Bank Account</span>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                ₹{selectedReceipt.amount.toLocaleString()}
              </span>
            </div>

            {/* Signatures */}
            <div className="pt-6 flex items-center justify-between text-xs text-center border-t border-dashed border-m3-outline-variant/30">
              <div>
                <div className="w-28 border-b border-m3-on-surface-variant/40 mb-1 mx-auto" />
                <span className="text-[11px] font-semibold text-m3-on-surface-variant">Depositor / Guardian</span>
              </div>
              <div>
                <div className="w-28 border-b border-m3-on-surface-variant/40 mb-1 mx-auto" />
                <span className="text-[11px] font-semibold text-m3-on-surface-variant">Authorized Cashier (خزانچی)</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
