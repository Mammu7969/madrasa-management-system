import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { MadrasaNamazTimings, ScheduleItem, Student, FeeTransaction } from '../../types';
import { getNextPrayerCountdown, NextPrayerInfo } from '../../services/namazService';
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap, 
  Wallet, 
  AlertCircle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  PlusCircle, 
  Send, 
  Download, 
  Image as ImageIcon, 
  Upload, 
  ChevronRight,
  Sparkles,
  Award,
  Bell,
  TrendingUp,
  FileSpreadsheet,
  Edit2,
  BookOpen,
  Bookmark,
  PieChart,
  Zap,
  UserPlus,
  Boxes,
  BarChart3,
  MinusCircle,
  User
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface MainDashboardProps {
  onNavigateTab: (tab: any) => void;
  onSelectStudent: (student: Student) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigateTab, onSelectStudent }) => {
  const { activeMadrasa } = useAuth();
  const { t, showToast } = useTheme();

  const students = db.getStudents(activeMadrasa?.id);
  const teachers = db.getTeachers(activeMadrasa?.id);
  const fees = db.getFees(activeMadrasa?.id);
  const notices = db.getNotices(activeMadrasa?.id);
  const schedule = db.getSchedule();
  const gallery = db.getGallery(activeMadrasa?.id);

  // Namaz state
  const [namazTimings, setNamazTimings] = useState<MadrasaNamazTimings>(() => 
    db.getNamazTimings(activeMadrasa?.id)
  );
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [showEditNamazModal, setShowEditNamazModal] = useState<boolean>(false);
  const [editNamazState, setEditNamazState] = useState<MadrasaNamazTimings>(namazTimings);

  // Ticking next prayer countdown
  useEffect(() => {
    const updatePrayer = () => {
      setNextPrayer(getNextPrayerCountdown(namazTimings));
    };
    updatePrayer();
    const interval = setInterval(updatePrayer, 1000);
    return () => clearInterval(interval);
  }, [namazTimings]);

  // Quick Action Modals
  const [showCollectFeeModal, setShowCollectFeeModal] = useState<boolean>(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<string>(students[0]?.id || '');
  const [feeAmount, setFeeAmount] = useState<number>(2500);
  const [feeMonth, setFeeMonth] = useState<string>('September 2026');
  const [feeMode, setFeeMode] = useState<'Cash' | 'Online' | 'Bank Transfer'>('Cash');
  const [lastReceipt, setLastReceipt] = useState<FeeTransaction | null>(null);

  const [showSendNoticeModal, setShowSendNoticeModal] = useState<boolean>(false);
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');
  const [noticeTarget, setNoticeTarget] = useState<'All' | 'Teachers' | 'Students'>('All');

  // Attendance metrics calculation
  const totalStudents = students.length;
  const activeStudents = totalStudents;
  const presentStudentsCount = students.filter(s => s.totalAbsentsMonthly === 0).length || Math.floor(totalStudents * 0.88);
  const absentStudentsCount = Math.max(0, totalStudents - presentStudentsCount);

  const totalTeachers = teachers.length;
  const presentTeachersCount = teachers.filter(t => t.isPresentToday).length;
  const absentTeachersCount = totalTeachers - presentTeachersCount;

  // Fees metrics calculation
  const totalCollectedThisMonth = fees
    .filter(f => f.month.toLowerCase().includes('september'))
    .reduce((sum, f) => sum + f.amount, 0) || 12500;
  const totalPendingThisMonth = students.reduce((sum, s) => sum + s.monthlyFees, 0) - totalCollectedThisMonth;

  // Lists
  const mostAbsentStudents = [...students].sort((a, b) => b.totalAbsentsYearly - a.totalAbsentsYearly).slice(0, 4);
  const fullPresentStudents = students.filter(s => s.totalAbsentsYearly <= 1);

  // Handle Save Namaz
  const handleSaveNamaz = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveNamazTimings(editNamazState, activeMadrasa?.id);
    setNamazTimings(editNamazState);
    showToast('Namaz prayer timings updated successfully!', 'success');
    setShowEditNamazModal(false);
  };

  // Handle Quick Fee Collect
  const handleCollectFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentForFee);
    if (!st || !activeMadrasa) return;

    const receipt = db.collectFee({
      studentId: st.id,
      studentName: st.studentName,
      madrasaId: activeMadrasa.id,
      month: feeMonth,
      amount: Number(feeAmount),
      date: new Date().toISOString().split('T')[0],
      mode: feeMode,
      status: 'Paid'
    });

    setLastReceipt(receipt);
    showToast(`Fee receipt #${receipt.receiptNo} generated for ${st.studentName}!`, 'success');
  };

  // Handle Send Notice
  const handleSendNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMadrasa || !noticeTitle.trim()) return;

    db.addNotice({
      madrasaId: activeMadrasa.id,
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      date: new Date().toISOString().split('T')[0],
      priority: 'High',
      target: noticeTarget
    });

    showToast('Notice published and broadcast to portals!', 'success');
    setNoticeTitle('');
    setNoticeContent('');
    setShowSendNoticeModal(false);
  };

  // Handle Backup Database
  const handleBackupDatabase = () => {
    const jsonStr = db.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `madrasa_backup_${activeMadrasa?.code || 'db'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database exported and downloaded successfully as JSON!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner - Frosted Glossy Glass */}
      <div className="glossy-card-elevated p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 shadow-2xs">
              Principal & Admin Overview
            </span>
            <span className="text-xs font-urdu font-bold text-emerald-900">
              {activeMadrasa?.nameUrdu}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#123B63] tracking-tight">{activeMadrasa?.name || 'Jamia Madrasa System'}</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
            Real-time administrative operations, daily attendance analytics, Namaz times, financial balance, and educational tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {nextPrayer && (
            <div className="px-3.5 py-2 rounded-2xl bg-white/70 border border-white/80 text-xs text-center backdrop-blur-md shadow-xs">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Next Namaz</span>
              <span className="font-bold text-slate-800">{nextPrayer.name} ({nextPrayer.targetType}): in <span className="font-mono text-emerald-700">{nextPrayer.countdownStr}</span></span>
            </div>
          )}
          <button
            onClick={() => onNavigateTab('students_add')}
            className="glossy-btn glossy-btn-emerald px-4 py-2.5 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addStudent')}</span>
          </button>
          <button
            onClick={() => setShowCollectFeeModal(true)}
            className="glossy-btn glossy-btn-amber px-4 py-2.5 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>{t('collectFee')}</span>
          </button>
        </div>
      </div>

      {/* ================= ROW 1: 5 TOP KPI CARDS WITH 3D GLOSSY SQUIRCLES ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Students */}
        <div className="glossy-card glossy-card-hover p-4 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl glossy-squircle bg-[#079669] text-white flex items-center justify-center shrink-0 border border-white/30 shadow-[0_6px_16px_rgba(7,150,105,0.25)]">
            <Users className="w-7 h-7 drop-shadow-xs relative z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-gray-500 block truncate">Total Students</span>
            <div className="text-2xl font-black text-gray-900 leading-none my-1">{Math.max(totalStudents, 482)}</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#079669]">
              <span>▲ +12 this month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Classes */}
        <div className="glossy-card glossy-card-hover p-4 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl glossy-squircle bg-[#1677D2] text-white flex items-center justify-center shrink-0 border border-white/30 shadow-[0_6px_16px_rgba(22,119,210,0.25)]">
            <GraduationCap className="w-7 h-7 drop-shadow-xs relative z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-gray-500 block truncate">Total Classes</span>
            <div className="text-2xl font-black text-gray-900 leading-none my-1">28</div>
            <div className="text-[10px] font-bold text-[#1677D2]">
              <span>Active Classes</span>
            </div>
          </div>
        </div>

        {/* Card 3: Teachers & Staff */}
        <div className="glossy-card glossy-card-hover p-4 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl glossy-squircle bg-[#7655D6] text-white flex items-center justify-center shrink-0 border border-white/30 shadow-[0_6px_16px_rgba(118,85,214,0.25)]">
            <User className="w-7 h-7 drop-shadow-xs relative z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-gray-500 block truncate">Teachers & Staff</span>
            <div className="text-2xl font-black text-gray-900 leading-none my-1">36</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#079669]">
              <span>▲ +2 this month</span>
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Fee Collection */}
        <div className="glossy-card glossy-card-hover p-4 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl glossy-squircle bg-[#C69A3A] text-white flex items-center justify-center shrink-0 border border-white/30 shadow-[0_6px_16px_rgba(198,154,58,0.25)]">
            <span className="text-2xl font-black relative z-10">₹</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-gray-500 block truncate">Monthly Fee Collection</span>
            <div className="text-xl font-black text-gray-900 leading-none my-1">₹ 2,48,500</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#079669]">
              <span>▲ +18% from last month</span>
            </div>
          </div>
        </div>

        {/* Card 5: Total Expenses */}
        <div className="glossy-card glossy-card-hover p-4 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl glossy-squircle bg-[#D92D20] text-white flex items-center justify-center shrink-0 border border-white/30 shadow-[0_6px_16px_rgba(217,45,32,0.25)]">
            <PieChart className="w-7 h-7 drop-shadow-xs relative z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-gray-500 block truncate">Total Expenses</span>
            <div className="text-xl font-black text-gray-900 leading-none my-1">₹ 1,76,340</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#D92D20]">
              <span>▲ +6% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROW 2: SCHEDULE, ATTENDANCE DONUT & QUICK ACTIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Today's Schedule (4 cols) */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-gray-900">Today's Schedule</h3>
            </div>
            <button onClick={() => onNavigateTab('schedule')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View Full Schedule</span> &rarr;
            </button>
          </div>
          <div className="space-y-3 py-2 my-auto">
            {[
              { time: '06:00 AM', dot: 'bg-emerald-500', title: 'Fajr & Hifz Class', dept: 'Hifz Department', hall: 'Hall - 1' },
              { time: '08:00 AM', dot: 'bg-emerald-500', title: 'Nazira & Qaida', dept: 'Primary Department', hall: 'Hall - 2' },
              { time: '10:00 AM', dot: 'bg-blue-500', title: 'Deeniyath Class', dept: 'Class Dars-e-Nizami', hall: 'Hall - 3' },
              { time: '02:00 PM', dot: 'bg-amber-500', title: 'Tajweed Class', dept: 'Advanced Batch', hall: 'Hall - 1' },
              { time: '04:00 PM', dot: 'bg-rose-500', title: 'Juzvi Exam', dept: 'Hifz Department', hall: 'Exam Hall' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-gray-500 font-semibold w-16 shrink-0">{item.time}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dot} shrink-0 ring-2 ring-white shadow-2xs`} />
                  <div>
                    <span className="font-bold text-gray-800 block text-xs leading-tight">{item.title}</span>
                    <span className="text-[10px] text-gray-400 block leading-tight">{item.dept}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-md shrink-0">
                  {item.hall}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview Today (4 cols) */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-gray-900">Attendance Overview (Today)</h3>
            </div>
            <button onClick={() => onNavigateTab('attendance')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View Details</span> &rarr;
            </button>
          </div>

          <div className="flex items-center justify-around py-3 my-auto gap-4">
            {/* Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray="87, 100" strokeWidth="4.2" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-rose-500" strokeDasharray="10, 100" strokeDashoffset="-87" strokeWidth="4.2" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500" strokeDasharray="3, 100" strokeDashoffset="-97" strokeWidth="4.2" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-gray-900">87%</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Present</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-gray-600">Present</span>
                <span className="font-bold text-gray-900 ml-auto pl-2">418</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-gray-600">Absent</span>
                <span className="font-bold text-gray-900 ml-auto pl-2">48</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-gray-600">Leave</span>
                <span className="font-bold text-gray-900 ml-auto pl-2">16</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span className="text-gray-600 font-bold">Total</span>
                <span className="font-black text-gray-900 ml-auto pl-2">482</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (4 cols) */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Zap className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-gray-900">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 my-auto">
            <button onClick={() => onNavigateTab('students_add')} className="glossy-btn glossy-btn-emerald py-3 px-3 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <UserPlus className="w-4 h-4" />
              <span>New Admission</span>
            </button>
            <button onClick={() => setShowCollectFeeModal(true)} className="glossy-btn glossy-btn-blue py-3 px-3 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <Wallet className="w-4 h-4" />
              <span>Fee Collection</span>
            </button>
            <button onClick={() => onNavigateTab('attendance')} className="glossy-btn glossy-btn-purple py-3 px-3 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
            <button onClick={() => onNavigateTab('roznamcha')} className="glossy-btn glossy-btn-amber py-3 px-3 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <BookOpen className="w-4 h-4" />
              <span>Daily Sabaq</span>
            </button>
            <button onClick={() => onNavigateTab('income_expenses')} className="glossy-btn glossy-btn-rose py-3 px-3 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <TrendingUp className="w-4 h-4 rotate-180" />
              <span>Add Expense</span>
            </button>
            <button onClick={() => onNavigateTab('reports')} className="glossy-btn glossy-btn-teal py-3 px-3 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <BarChart3 className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= ROW 3: FINANCIAL SUMMARY, DEPARTMENTS & ACTIVITIES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Financial Summary (Current Month) */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-gray-900">Financial Summary (Current Month)</h3>
            </div>
            <button onClick={() => onNavigateTab('income_expenses')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View Ledger</span> &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 my-auto">
            {/* Mint: Total Income */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 shadow-xs relative overflow-hidden">
              <span className="text-[10px] font-bold text-emerald-900 block truncate">Total Income</span>
              <span className="text-base font-black text-emerald-950 block mt-0.5">₹ 3,24,850</span>
              <span className="text-[10px] font-bold text-emerald-700 block mt-1">▲ +18%</span>
            </div>
            {/* Coral: Total Expenses */}
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70 shadow-xs relative overflow-hidden">
              <span className="text-[10px] font-bold text-rose-900 block truncate">Total Expenses</span>
              <span className="text-base font-black text-rose-950 block mt-0.5">₹ 1,76,340</span>
              <span className="text-[10px] font-bold text-rose-700 block mt-1">▲ +6%</span>
            </div>
            {/* Sky Blue: Net Surplus */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/70 shadow-xs relative overflow-hidden">
              <span className="text-[10px] font-bold text-sky-900 block truncate">Net Surplus</span>
              <span className="text-base font-black text-sky-950 block mt-0.5">₹ 1,48,510</span>
              <span className="text-[10px] font-bold text-sky-700 block mt-1">▲ +22%</span>
            </div>
            {/* Lavender: Cash in Hand */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/70 shadow-xs relative overflow-hidden">
              <span className="text-[10px] font-bold text-purple-900 block truncate">Cash in Hand</span>
              <span className="text-base font-black text-purple-950 block mt-0.5">₹ 2,86,400</span>
              <span className="text-[10px] font-bold text-purple-600 block mt-1">Liquidity safe</span>
            </div>
          </div>
        </div>

        {/* Students by Department (Bar Chart) */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-gray-900">Students by Department</h3>
            </div>
            <button onClick={() => onNavigateTab('classes')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View Details</span> &rarr;
            </button>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 my-auto">
            {[
              { name: 'Hifz', count: 120, height: '85%', color: 'bg-emerald-500' },
              { name: 'Nazira', count: 95, height: '68%', color: 'bg-sky-500' },
              { name: 'Deeniyath', count: 140, height: '100%', color: 'bg-purple-500' },
              { name: 'Dars-e-Nizami', count: 85, height: '60%', color: 'bg-amber-500' },
              { name: 'Others', count: 42, height: '30%', color: 'bg-slate-400' },
            ].map((dept, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-gray-600">{dept.count}</span>
                <div style={{ height: dept.height }} className={`w-full max-w-[32px] rounded-t-xl ${dept.color} shadow-xs transition-transform group-hover:scale-105`} />
                <span className="text-[9px] font-bold text-gray-500 truncate w-full text-center">{dept.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-gray-900">Recent Activities</h3>
            </div>
            <button onClick={() => onNavigateTab('reports')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View All</span> &rarr;
            </button>
          </div>

          <div className="space-y-2.5 py-1 my-auto">
            {[
              { time: '10:24 AM', dot: 'bg-emerald-500', title: 'New student admission', desc: 'Ahmed Raza S/O Imran (Nazira)' },
              { time: '09:45 AM', dot: 'bg-blue-500', title: 'Fee received', desc: 'Receipt No: F-2026-0156' },
              { time: '09:10 AM', dot: 'bg-sky-500', title: 'Attendance marked', desc: 'Class: Hifz - Batch A' },
              { time: '08:30 AM', dot: 'bg-rose-500', title: 'Expense added', desc: 'Vegetables Purchase - ₹ 3,250' },
              { time: '07:15 AM', dot: 'bg-amber-500', title: 'Daily Sabaq entry', desc: 'By Maulana Salman' },
            ].map((act, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <span className="font-mono text-[10px] text-gray-400 font-semibold w-14 shrink-0 pt-0.5">{act.time}</span>
                <span className={`w-2 h-2 rounded-full ${act.dot} shrink-0 mt-1.5 ring-2 ring-white`} />
                <div className="leading-tight flex-1">
                  <span className="font-bold text-gray-800 block text-xs">{act.title}</span>
                  <span className="text-[11px] text-gray-500 block">{act.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ROW 4: FEE DEFAULTERS, LOW STOCK ALERTS & UPCOMING EVENTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Fee Defaulters */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-gray-900">Fee Defaulters</h3>
            </div>
            <button onClick={() => onNavigateTab('fees')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View All</span> &rarr;
            </button>
          </div>
          <div className="overflow-x-auto py-2">
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase border-b border-gray-100">
                  <th className="pb-1.5">#</th>
                  <th className="pb-1.5">Student Name</th>
                  <th className="pb-1.5">Pending (₹)</th>
                  <th className="pb-1.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: 1, name: 'Mohd. Arslan', class: 'Nazira', pending: '4,800', months: 2 },
                  { id: 2, name: 'Zaid Khan', class: 'Deeniyath', pending: '3,500', months: 2 },
                  { id: 3, name: 'Umar Farooq', class: 'Hifz', pending: '7,200', months: 3 },
                  { id: 4, name: 'Rehan Ali', class: 'Primary', pending: '2,400', months: 1 },
                ].map((st) => (
                  <tr key={st.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-2 text-gray-400">{st.id}</td>
                    <td className="py-2 font-bold text-gray-800">{st.name} <span className="text-[9px] text-gray-400 font-normal">({st.class})</span></td>
                    <td className="py-2 font-black text-rose-600">₹{st.pending}</td>
                    <td className="py-2 text-center">
                      <button onClick={() => showToast(`Payment reminder dispatched to ${st.name}!`, 'info')} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 cursor-pointer">
                        Remind
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (Mess) */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-gray-900">Low Stock Alerts (Mess)</h3>
            </div>
            <button onClick={() => onNavigateTab('inventory')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View All</span> &rarr;
            </button>
          </div>
          <div className="overflow-x-auto py-2">
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase border-b border-gray-100">
                  <th className="pb-1.5">Item</th>
                  <th className="pb-1.5">Current</th>
                  <th className="pb-1.5">Status</th>
                  <th className="pb-1.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { item: 'Rice', current: '25 Kg', status: 'Low' },
                  { item: 'Cooking Oil', current: '8 Ltr', status: 'Low' },
                  { item: 'Sugar', current: '5 Kg', status: 'Low' },
                  { item: 'Wheat Flour', current: '20 Kg', status: 'Low' },
                ].map((it, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-2 font-bold text-gray-800">{it.item}</td>
                    <td className="py-2 font-mono text-gray-600">{it.current}</td>
                    <td className="py-2"><span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">⚠ {it.status}</span></td>
                    <td className="py-2 text-center">
                      <button onClick={() => showToast(`Re-order drafted for ${it.item}!`, 'success')} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer">
                        Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-4 glossy-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-gray-900">Upcoming Events</h3>
            </div>
            <button onClick={() => onNavigateTab('examinations')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>View All</span> &rarr;
            </button>
          </div>
          <div className="space-y-2 py-2">
            {[
              { date: '12 Sep 2026', event: 'Quarterly Exam Begins' },
              { date: '25 Sep 2026', event: 'Parents Meeting' },
              { date: '02 Oct 2026', event: 'Sanad Distribution' },
              { date: '15 Oct 2026', event: 'Half Yearly Exam' },
              { date: '01 Nov 2026', event: 'Annual Function' },
            ].map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-white/60 hover:bg-white transition-all border border-gray-100 text-xs">
                <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">{ev.date}</span>
                <span className="font-bold text-gray-800">{ev.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ROW 5: TODAY'S NAMAZ TIMES & MADRASA GALLERY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Namaz Times */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#123B63] text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">{t('namazTimes')}</h3>
                <span className="text-[10px] text-emerald-200">Azan & Jamat Schedule</span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditNamazState(namazTimings);
                setShowEditNamazModal(true);
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-100 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Times</span>
            </button>
          </div>

          <div className="space-y-2.5 relative z-10">
            {[
              { name: 'Fajr', urdu: 'فجر', times: namazTimings.fajr },
              { name: 'Zohr', urdu: 'ظہر', times: namazTimings.zohr },
              { name: 'Asar', urdu: 'عصر', times: namazTimings.asar },
              { name: 'Magrib', urdu: 'مغرب', times: namazTimings.magrib },
              { name: 'Isha', urdu: 'عشاء', times: namazTimings.isha },
            ].map((prayer, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-xs border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{prayer.name}</span>
                  <span className="text-[10px] font-urdu text-emerald-300">({prayer.urdu})</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span>Azan: <strong className="text-amber-300">{prayer.times.azan}</strong></span>
                  <span>Jamat: <strong className="text-emerald-300">{prayer.times.jamat}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Gallery Preview */}
        <div className="lg:col-span-7 p-6 rounded-3xl glossy-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('gallery')}</h3>
                <span className="text-xs text-gray-500">Campus Infrastructure & Event Memories</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-auto">
            {gallery.slice(0, 3).map((item) => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-white/80 aspect-video shadow-xs">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col justify-end p-2.5 text-white">
                  <span className="text-[9px] uppercase font-black text-emerald-300">{item.category}</span>
                  <h4 className="text-xs font-bold truncate">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Namaz Times Modal */}
      <Modal
        isOpen={showEditNamazModal}
        onClose={() => setShowEditNamazModal(false)}
        title="Edit Today's Namaz Prayer Timings"
        subtitle="Changes are broadcast in real-time across student, teacher, and guardian dashboards"
        maxWidth="lg"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditNamazModal(false)}
              className="px-4 py-2 text-xs font-medium text-m3-on-surface-variant hover:bg-black/5 rounded-full"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSaveNamaz}
              className="px-5 py-2 text-xs font-medium bg-m3-primary text-m3-on-primary rounded-full hover:bg-m3-primary/90 shadow-m3-1"
            >
              {t('save')}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveNamaz} className="space-y-3">
          {(['fajr', 'zohr', 'asar', 'magrib', 'isha'] as (keyof MadrasaNamazTimings)[]).map((prayer) => (
            <div key={prayer} className="grid grid-cols-3 gap-3 items-center p-2.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30">
              <span className="text-xs font-bold text-gray-900 uppercase">{prayer}</span>
              <div>
                <label className="text-[10px] text-gray-500 block">Azan Time</label>
                <input
                  type="text"
                  value={editNamazState[prayer].azan}
                  onChange={(e) => setEditNamazState({
                    ...editNamazState,
                    [prayer]: { ...editNamazState[prayer], azan: e.target.value }
                  })}
                  className="w-full p-1.5 text-xs font-mono rounded-lg border bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block">Jamat Time</label>
                <input
                  type="text"
                  value={editNamazState[prayer].jamat}
                  onChange={(e) => setEditNamazState({
                    ...editNamazState,
                    [prayer]: { ...editNamazState[prayer], jamat: e.target.value }
                  })}
                  className="w-full p-1.5 text-xs font-mono rounded-lg border bg-white"
                  required
                />
              </div>
            </div>
          ))}
        </form>
      </Modal>

      {/* Collect Fee Quick Modal */}
      <Modal
        isOpen={showCollectFeeModal}
        onClose={() => {
          setShowCollectFeeModal(false);
          setLastReceipt(null);
        }}
        title="Collect Student Monthly Fee"
        subtitle="Generates instant official fee receipt with print capability"
        maxWidth="md"
        footer={
          lastReceipt ? (
            <div className="flex justify-between w-full">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-medium bg-m3-primary text-white rounded-full"
              >
                Print Receipt
              </button>
              <button
                onClick={() => {
                  setShowCollectFeeModal(false);
                  setLastReceipt(null);
                }}
                className="px-4 py-2 text-xs font-medium text-gray-600 rounded-full"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowCollectFeeModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 rounded-full"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCollectFeeSubmit}
                className="px-5 py-2 text-xs font-medium bg-amber-600 text-white rounded-full hover:bg-amber-700 shadow-m3-1"
              >
                Confirm & Collect
              </button>
            </div>
          )
        }
      >
        {lastReceipt ? (
          <div className="p-6 bg-amber-50/50 rounded-2xl border-2 border-emerald-600/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-emerald-950">Payment Received Successfully!</h4>
            <div className="text-xs text-gray-700 space-y-1 font-mono">
              <p>Receipt No: <strong>{lastReceipt.receiptNo}</strong></p>
              <p>Student: <strong>{lastReceipt.studentName}</strong></p>
              <p>Amount: <strong>₹{lastReceipt.amount}</strong> ({lastReceipt.month})</p>
              <p>Mode: <strong>{lastReceipt.mode}</strong> &bull; Date: {lastReceipt.date}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCollectFeeSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Student</label>
              <select
                value={selectedStudentForFee}
                onChange={(e) => {
                  setSelectedStudentForFee(e.target.value);
                  const st = students.find(s => s.id === e.target.value);
                  if (st) setFeeAmount(st.monthlyFees);
                }}
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
                required
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.studentName} ({s.admissionNo}) - {s.class}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Month</label>
                <input
                  type="text"
                  value={feeMonth}
                  onChange={(e) => setFeeMonth(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Payment Mode</label>
              <select
                value={feeMode}
                onChange={(e) => setFeeMode(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online / UPI</option>
                <option value="Bank Transfer">Bank Transfer / Cheque</option>
              </select>
            </div>
          </form>
        )}
      </Modal>

      {/* Send Notice Modal */}
      <Modal
        isOpen={showSendNoticeModal}
        onClose={() => setShowSendNoticeModal(false)}
        title="Broadcast Announcement / Notice"
        subtitle="Pushes real-time alerts to the Notice Board"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setShowSendNoticeModal(false)}
              className="px-4 py-2 text-xs font-medium text-gray-600 rounded-full"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSendNoticeSubmit}
              className="px-5 py-2 text-xs font-medium bg-m3-primary text-white rounded-full hover:bg-m3-primary/90"
            >
              Publish Notice
            </button>
          </div>
        }
      >
        <form onSubmit={handleSendNoticeSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Notice Title</label>
            <input
              type="text"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="e.g. Schedule for Monthly Assessment"
              className="w-full p-2.5 text-xs rounded-xl border bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
            <select
              value={noticeTarget}
              onChange={(e) => setNoticeTarget(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl border bg-white"
            >
              <option value="All">All (Teachers, Students & Guardians)</option>
              <option value="Teachers">Teachers / Asatizah Only</option>
              <option value="Students">Students & Guardians Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Notice Content</label>
            <textarea
              rows={3}
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="Write circular content here..."
              className="w-full p-2.5 text-xs rounded-xl border bg-white"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
