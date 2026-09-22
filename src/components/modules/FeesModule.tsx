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
  const { language, t, showToast } = useTheme();

  const isUrdu = language === 'ur';
  const loc = (en: string, ur: string): string => isUrdu ? ur : en;

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
      <div className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/15 bg-gradient-to-r from-[#111b4b] via-[#18245b] to-[#24336e]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-[#3567ff]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#3567ff] to-[#7654ff] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#3567ff]/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 font-montserrat">
              <span>{loc('Fees & Financial Accounting', 'شعبہ مالیات و فیس کا حساب')}</span>
            </h1>
            <p className="text-xs text-white/70 font-medium mt-1">
              {loc('Official counterfoil receipts, pending dues tracking, and sponsor concessions', 'رسیدات، بقایا فیس اور کفالت کے مکمل اندراجات')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white transition-colors shadow-sm backdrop-blur-md cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-[#59c7ff]" />
            <span>{loc('Export Ledger', 'ایکسپورٹ رجسٹر')}</span>
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-[#3567ff]/30 bg-gradient-to-r from-[#3567ff] to-[#7654ff] hover:from-[#2d5be6] hover:to-[#6844eb] text-white transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{loc('Collect Fee', 'فیس وصول کریں')}</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass card p-4.5 rounded-3xl shadow-sm flex items-center gap-3.5 border-t-2 border-[#16b981]">
          <div className="w-11 h-11 rounded-2xl bg-[#16b981]/10 text-[#16b981] flex items-center justify-center shrink-0 border border-[#16b981]/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#7180a6] dark:text-[#a0aec0] block">{loc('Total Collections', 'کل وصولی')}</span>
            <span className="text-lg font-black text-[#14204d] dark:text-white font-mono">
              ₹{metrics.totalCollected.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="glass card p-4.5 rounded-3xl shadow-sm flex items-center gap-3.5 border-t-2 border-[#ef476f]">
          <div className="w-11 h-11 rounded-2xl bg-[#ef476f]/10 text-[#ef476f] flex items-center justify-center shrink-0 border border-[#ef476f]/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#7180a6] dark:text-[#a0aec0] block">{loc('Pending Dues', 'بقایا واجبات')}</span>
            <span className="text-lg font-black text-[#ef476f] font-mono">
              ₹{metrics.totalDefaulterAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="glass card p-4.5 rounded-3xl shadow-sm flex items-center gap-3.5 border-t-2 border-[#f6a83b]">
          <div className="w-11 h-11 rounded-2xl bg-[#f6a83b]/10 text-[#f6a83b] flex items-center justify-center shrink-0 border border-[#f6a83b]/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#7180a6] dark:text-[#a0aec0] block">{loc('Fee Defaulters', 'نادہندگان')}</span>
            <span className="text-lg font-black text-[#f6a83b] font-mono">
              {metrics.defaulterCount} {loc('Students', 'طلبہ')}
            </span>
          </div>
        </div>

        <div className="glass card p-4.5 rounded-3xl shadow-sm flex items-center gap-3.5 border-t-2 border-[#7654ff]">
          <div className="w-11 h-11 rounded-2xl bg-[#7654ff]/10 text-[#7654ff] flex items-center justify-center shrink-0 border border-[#7654ff]/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#7180a6] dark:text-[#a0aec0] block">{loc('Sponsored / Free', 'کفالت و معافی')}</span>
            <span className="text-lg font-black text-[#7654ff] font-mono">
              {metrics.sponsoredCount} {loc('Students', 'طلبہ')}
            </span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs (Non-collapsing horizontal scroll bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-b border-stone-200/50 dark:border-white/10 no-scrollbar shrink-0 whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('receipts')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'receipts'
              ? 'bg-gradient-to-r from-[#3567ff] to-[#7654ff] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5'
          }`}
        >
          <span>{loc(`Official Receipts Ledger (${fees.length})`, `رسیدات رجسٹر (${fees.length})`)}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'defaulters'
              ? 'bg-gradient-to-r from-[#3567ff] to-[#7654ff] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5'
          }`}
        >
          <span>{loc('Pending Dues & Defaulters', 'بقایا جات و نادہندگان')}</span>
          {metrics.defaulterCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'defaulters' ? 'bg-white text-[#3567ff]' : 'bg-[#f6a83b]/20 text-[#f6a83b]'
            }`}>
              {metrics.defaulterCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sponsorships')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'sponsorships'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#FAF6EF] dark:hover:bg-[#0E1A14]'
          }`}
        >
          <span>{loc(`Sponsorships & Concessions (${sponsoredList.length})`, `کفالت و رعایت (${sponsoredList.length})`)}</span>
        </button>
      </div>

      {/* TAB 1: RECEIPTS LEDGER */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="heritage-card p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={loc('Search receipts by student name or receipt #...', 'طالب علم کے نام یا رسید نمبر سے تلاش کریں...')}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="p-2 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-semibold focus:border-[#065F46] focus:outline-none"
              >
                <option value="all">{loc('All Modes', 'تمام طریقے')}</option>
                <option value="Cash">{loc('Cash', 'نقد')}</option>
                <option value="Online">{loc('Online / UPI', 'آن لائن')}</option>
                <option value="Bank Transfer">{loc('Bank Transfer', 'بینک ٹرانسفر')}</option>
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-semibold focus:border-[#065F46] focus:outline-none"
              >
                <option value="all">{loc('All Months', 'تمام مہینے')}</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="heritage-card rounded-3xl shadow-sm overflow-hidden">
            {filteredFees.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500 space-y-2">
                <Wallet className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="font-bold text-stone-800 dark:text-stone-200">{loc('No fee transactions found matching your criteria.', 'تلاش کے مطابق کوئی رسید نہیں ملی')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gradient-to-r from-[#064E3B] via-[#065F46] to-[#044E38] text-[#FAF5EB] font-bold text-[11px] uppercase tracking-wider border-b-2 border-[#D97706]">
                    <tr>
                      <th className="p-3.5">{loc('Receipt No', 'رسید نمبر')}</th>
                      <th className="p-3.5">{loc('Student Name', 'طالب علم کا نام')}</th>
                      <th className="p-3.5">{loc('Billing Month', 'مہینہ')}</th>
                      <th className="p-3.5">{loc('Amount', 'رقم')}</th>
                      <th className="p-3.5">{loc('Payment Mode', 'طریقہ ادائیگی')}</th>
                      <th className="p-3.5">{loc('Date', 'تاریخ')}</th>
                      <th className="p-3.5">{loc('Status', 'کیفیت')}</th>
                      <th className="p-3.5 text-center">{loc('Receipt Slip', 'رسید')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D97706]/15 font-medium">
                    {filteredFees.map(f => {
                      const st = students.find(s => s.id === f.studentId);
                      return (
                        <tr key={f.id} className="hover:bg-[#064E3B]/5 dark:hover:bg-[#065F46]/15 transition-colors">
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="heritage-badge-gold font-mono font-bold text-xs">
                              {f.receiptNo}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-stone-900 dark:text-stone-100 block">{f.studentName}</span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              Adm: {st?.admissionNo || 'N/A'} &bull; {st?.class || ''}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium text-stone-800 dark:text-stone-200">
                            {f.month}
                          </td>
                          <td className="p-3.5 font-mono font-black text-[#065F46] dark:text-[#34D399] text-sm">
                            ₹{f.amount.toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5EB] dark:bg-[#0E1A14] text-[#B45309] dark:text-[#FDE68A] border border-[#D97706]/30">
                              {f.mode}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-stone-500 text-[11px]">
                            {f.date}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#065F46]/15 text-[#065F46] dark:text-[#34D399] border border-[#065F46]/30">
                              {loc('Paid', 'ادا شدہ')}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleViewReceipt(f)}
                              className="p-2 rounded-xl bg-[#FAF6EF] dark:bg-[#0E1A14] hover:bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20 transition-colors cursor-pointer"
                              title={loc('View & Print Official Receipt', 'سرکاری رسید دیکھیں و پرنٹ کریں')}
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
          <div className="p-4 rounded-2xl bg-red-500/10 dark:bg-red-950/30 border border-red-300/40 dark:border-red-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-bold text-red-900 dark:text-red-200">
                  {loc(`${defaultersList.length} Students with Pending Monthly Fees`, `${defaultersList.length} طلباء جن کی ماہانہ فیس واجب الادا ہے`)}
                </p>
                <p className="text-red-700 dark:text-red-400 text-[11px]">
                  {loc(`Total uncollected monthly dues: ₹${metrics.totalDefaulterAmount.toLocaleString()}`, `کل غیر وصول شدہ ماہانہ بقایا جات: ₹${metrics.totalDefaulterAmount.toLocaleString()}`)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast(loc('Reminders sent to all pending guardians via SMS/WhatsApp gateway!', 'تمام متعلقہ سرپرستوں کو ایس ایم ایس / واٹس ایپ کے ذریعے یاد دہانی بھیج دی گئی!'), 'info')}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loc('Broadcast Reminders', 'پیغامات روانہ کریں')}</span>
            </button>
          </div>

          <div className="heritage-card rounded-3xl border border-[#D97706]/20 shadow-sm overflow-hidden bg-card">
            {defaultersList.length === 0 ? (
              <div className="p-12 text-center text-xs text-emerald-600 dark:text-emerald-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-base">{loc('Alhamdulillah! No Outstanding Fee Defaulters', 'الحمد للہ! کوئی بقایاجات نہیں ہیں')}</p>
                <p className="text-muted-foreground">{loc('All registered students are up to date on monthly dues.', 'تمام رجسٹرڈ طلباء کی ماہانہ فیس مکمل ادا شدہ ہے۔')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gradient-to-r from-[#064E3B] via-[#065F46] to-[#044E38] text-[#FAF5EB] font-bold text-[11px] uppercase tracking-wider border-b-2 border-[#D97706]">
                    <tr>
                      <th className="p-3.5 text-[#FAF5EB]">{loc('Adm No', 'داخلہ نمبر')}</th>
                      <th className="p-3.5 text-[#FAF5EB]">{loc('Student Name', 'طالب علم کا نام')}</th>
                      <th className="p-3.5 text-[#FAF5EB]">{loc('Father / Guardian', 'والد / سرپرست')}</th>
                      <th className="p-3.5 text-[#FAF5EB]">{loc('Class', 'درجہ')}</th>
                      <th className="p-3.5 text-[#FAF5EB]">{loc('Contact No', 'رابطہ نمبر')}</th>
                      <th className="p-3.5 text-[#FAF5EB]">{loc('Monthly Fee', 'ماہانہ فیس')}</th>
                      <th className="p-3.5 text-[#FAF5EB]">{loc('Pending Dues', 'واجب الادا بقایا')}</th>
                      <th className="p-3.5 text-center text-[#FAF5EB]">{loc('Action', 'کارروائی')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {defaultersList.map(({ student: st, pendingAmount }) => (
                      <tr key={st.id} className="hover:bg-primary/5 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#065F46] dark:text-[#34D399]">{st.admissionNo}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-foreground block">{st.studentName}</span>
                          {st.studentNameUrdu && (
                            <span className="text-[10px] text-muted-foreground urdu-font">{st.studentNameUrdu}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-foreground">{st.fatherName}</td>
                        <td className="p-3.5 font-semibold text-foreground">{st.class}</td>
                        <td className="p-3.5 font-mono text-muted-foreground">{st.contactNumber}</td>
                        <td className="p-3.5 font-mono">₹{st.monthlyFees}</td>
                        <td className="p-3.5 font-mono font-black text-red-600">
                          ₹{pendingAmount}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleQuickCollectDefaulter(st)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                          >
                            {loc('Collect Now', 'فیس وصول کریں')}
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
        <div className="heritage-card rounded-3xl border border-[#D97706]/20 shadow-sm overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gradient-to-r from-[#064E3B] via-[#065F46] to-[#044E38] text-[#FAF5EB] font-bold text-[11px] uppercase tracking-wider border-b-2 border-[#D97706]">
                <tr>
                  <th className="p-3.5 text-[#FAF5EB]">{loc('Adm No', 'داخلہ نمبر')}</th>
                  <th className="p-3.5 text-[#FAF5EB]">{loc('Student Name', 'طالب علم کا نام')}</th>
                  <th className="p-3.5 text-[#FAF5EB]">{loc('Class', 'درجہ')}</th>
                  <th className="p-3.5 text-[#FAF5EB]">{loc('Sponsorship Type', 'کفالت کی قسم')}</th>
                  <th className="p-3.5 text-[#FAF5EB]">{loc('Kafeel / Sponsor Name', 'کفیل / معاون کا نام')}</th>
                  <th className="p-3.5 text-[#FAF5EB]">{loc('Institutional Fees', 'ادارہ جاتی فیس')}</th>
                  <th className="p-3.5 text-[#FAF5EB]">{loc('Category', 'زمرہ')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sponsoredList.map(st => (
                  <tr key={st.id} className="hover:bg-primary/5 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#065F46] dark:text-[#34D399]">{st.admissionNo}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-foreground block">{st.studentName}</span>
                      {st.studentNameUrdu && (
                        <span className="text-[10px] text-muted-foreground urdu-font">{st.studentNameUrdu}</span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-foreground">{st.class}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-[#B45309] dark:text-[#FCD34D] border border-amber-200/50">
                        {st.sponsorship}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      {st.kafeelName || loc('Bait-ul-Maal (Institutional Sponsor)', 'بیت المال (ادارہ جاتی کفالت)')}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{st.monthlyFees}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
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
        title={loc('Collect Monthly Fee & Issue Receipt', 'ماہانہ فیس وصولی اور رسید کا اجراء')}
        subtitle={loc('Record payment against student registry ledger', 'طالب علم کے کھاتے میں ادائیگی کا اندراج')}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setShowCollectModal(false)}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full cursor-pointer"
            >
              {loc('Cancel', 'منسوخ')}
            </button>
            <button
              type="button"
              onClick={handleCollect}
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-gradient-to-r from-[#064E3B] to-[#065F46] hover:from-[#065F46] hover:to-[#044E38] text-white rounded-full transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FDE68A]" />
              <span>{loc('Confirm & Issue Receipt', 'تصدیق اور رسید جاری کریں')}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleCollect} className="space-y-4 p-1">
          <div>
            <label className="text-xs font-bold block mb-1 text-foreground">{loc('Select Student *', 'طالب علم منتخب کریں *')}</label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                const st = students.find(s => s.id === e.target.value);
                if (st) setAmount(st.monthlyFees);
              }}
              className="w-full p-2.5 text-xs rounded-xl border border-border bg-background text-foreground font-semibold focus:ring-2 focus:ring-[#D97706]/40"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.studentName} &bull; {s.admissionNo} &bull; ({s.class}) - {loc('Monthly', 'ماہانہ')}: ₹{s.monthlyFees}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1 text-foreground">{loc('Amount Collected (₹) *', 'وصول شدہ رقم (₹) *')}</label>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-border bg-background text-foreground font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-[#D97706]/40"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-foreground">{loc('Billing Month *', 'مہینہ *')}</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. September 2026"
                className="w-full p-2.5 text-xs rounded-xl border border-border bg-background text-foreground font-semibold focus:ring-2 focus:ring-[#D97706]/40"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-foreground">{loc('Payment Mode *', 'طریقہ ادائیگی *')}</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-border bg-background text-foreground font-semibold focus:ring-2 focus:ring-[#D97706]/40"
              >
                <option value="Cash">{loc('Cash', 'نقد')}</option>
                <option value="Online">{loc('Online (UPI / QR Code)', 'آن لائن (یو پی آئی)')}</option>
                <option value="Bank Transfer">{loc('Bank Transfer / Cheque', 'بینک ٹرانسفر / چیک')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-foreground">{loc('Payment Date', 'تاریخ ادائیگی')}</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 text-xs rounded-xl border border-border bg-background text-foreground font-mono focus:ring-2 focus:ring-[#D97706]/40"
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
        title={loc('Official Fee Receipt Slip', 'سرکاری رسید فیس')}
        subtitle={`${loc('Receipt No', 'رسید نمبر')}: ${selectedReceipt?.receiptNo || ''}`}
        maxWidth="lg"
        allowPrint={true}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground">
              {loc('Valid Madrasa Management System Official Counterfoil', 'مدرسہ مینیجمنٹ سسٹم کی سرکاری و معتبر رسید')}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full cursor-pointer"
              >
                {loc('Close', 'بند کریں')}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-gradient-to-r from-[#064E3B] to-[#065F46] hover:from-[#065F46] hover:to-[#044E38] text-white rounded-full shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#FDE68A]" />
                <span>{loc('Print Official Receipt', 'رسید پرنٹ کریں')}</span>
              </button>
            </div>
          </div>
        }
      >
        {selectedReceipt && (
          <div className="p-6 bg-gradient-to-b from-[#FAF6EF]/60 to-white dark:from-[#061810]/40 dark:to-background rounded-2xl border-2 border-[#D97706]/30 space-y-5 text-foreground">
            {/* Header with Logo */}
            <div className="flex items-center justify-between border-b-2 border-[#D97706]/30 pb-4">
              <div className="flex items-center gap-3">
                {activeMadrasa?.logoUrl && (
                  <img src={activeMadrasa.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                )}
                <div>
                  <h3 className="text-base font-black text-[#064E3B] dark:text-[#FDE68A]">
                    {activeMadrasa?.name || 'JAMIA ISLAMIA ARABIA'}
                  </h3>
                  <p className="text-xs font-bold text-[#065F46] dark:text-[#34D399] urdu-font">
                    {activeMadrasa?.nameUrdu || 'جامعہ اسلامیہ عربیہ'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {activeMadrasa?.address || loc('Treasury & Accounts Department', 'شعبہ محاسبی و مالیات')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {loc('Official Receipt', 'سرکاری رسید')}
                </span>
                <span className="font-mono font-black text-[#B45309] dark:text-[#FCD34D] text-sm block">
                  {selectedReceipt.receiptNo}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {loc('Date:', 'تاریخ:')} {selectedReceipt.date}
                </span>
              </div>
            </div>

            {/* Receipt Details Body */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF5EB]/80 dark:bg-card/60 p-4 rounded-xl border border-[#D97706]/20">
              <div>
                <span className="text-[10px] text-muted-foreground block">{loc('Student Name:', 'طالب علم کا نام:')}</span>
                <span className="font-bold text-sm text-foreground">{selectedReceipt.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">{loc('Fee For Month:', 'برائے مہینہ:')}</span>
                <span className="font-bold text-sm text-foreground">{selectedReceipt.month}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">{loc('Payment Mode:', 'طریقہ ادائیگی:')}</span>
                <span className="font-bold text-foreground">{selectedReceipt.mode}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">{loc('Payment Status:', 'ادائیگی کی کیفیت:')}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{loc('PAID', 'وصول شدہ')}</span>
                </span>
              </div>
            </div>

            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#064E3B]/10 to-[#065F46]/10 dark:from-[#064E3B]/30 dark:to-[#065F46]/30 border border-[#065F46]/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#064E3B] dark:text-[#A7F3D0] font-bold block">{loc('Total Amount Received:', 'کل موصولہ رقم:')}</span>
                <span className="text-xs text-muted-foreground font-medium">{loc('Rupees in Cash / Bank Account', 'روپیہ نقد / بینک اکاؤنٹ')}</span>
              </div>
              <span className="text-2xl font-black font-mono text-[#064E3B] dark:text-[#FDE68A]">
                ₹{selectedReceipt.amount.toLocaleString()}
              </span>
            </div>

            {/* Signatures */}
            <div className="pt-6 flex items-center justify-between text-xs text-center border-t border-dashed border-border/40">
              <div>
                <div className="w-28 border-b border-border mb-1 mx-auto" />
                <span className="text-[11px] font-semibold text-muted-foreground">{loc('Depositor / Guardian', 'جمع کنندہ / سرپرست')}</span>
              </div>
              <div>
                <div className="w-28 border-b border-border mb-1 mx-auto" />
                <span className="text-[11px] font-semibold text-muted-foreground">{loc('Authorized Cashier', 'مجاز خزانچی')}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
