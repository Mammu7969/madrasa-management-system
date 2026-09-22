import React, { useState, useEffect, useMemo } from 'react';
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
  const schedule = db.getSchedule(activeMadrasa?.id);
  const gallery = db.getGallery(activeMadrasa?.id);
  const classes = db.getClasses(activeMadrasa?.id);
  const subjects = db.getSubjects(activeMadrasa?.id);
  const staff = db.getStaff(activeMadrasa?.id);
  const transactions = db.getFinanceTransactions(activeMadrasa?.id);
  const examinations = useMemo(() => db.getExaminations(activeMadrasa?.id), [activeMadrasa?.id]);
  const inventory = useMemo(() => db.getInventory(activeMadrasa?.id), [activeMadrasa?.id]);
  const roznamchah = useMemo(() => db.getRoznamchah(undefined, activeMadrasa?.id), [activeMadrasa?.id]);

  // Live real fee defaulters
  const liveFeeDefaulters = useMemo(() => {
    return students
      .filter(s => (s.monthlyFees || 0) > 0)
      .map(s => {
        const studentPaid = fees
          .filter(f => f.studentId === s.id && f.status === 'Paid')
          .reduce((sum, f) => sum + f.amount, 0);
        const expectedDue = (s.monthlyFees || 0) * 2;
        const pendingAmount = Math.max(0, expectedDue - studentPaid);
        const pendingMonths = Math.max(1, Math.ceil(pendingAmount / (s.monthlyFees || 1)));
        return {
          id: s.id,
          name: s.studentName,
          nameUrdu: s.studentNameUrdu,
          class: s.class,
          pending: pendingAmount,
          months: pendingMonths,
          contact: s.contactNumber
        };
      })
      .filter(d => d.pending > 0)
      .slice(0, 5);
  }, [students, fees]);

  // Live low stock inventory alerts
  const lowStockInventory = useMemo(() => {
    return inventory
      .filter(i => (i.quantity || 0) <= (i.minThreshold || 20))
      .slice(0, 5);
  }, [inventory]);

  // Live upcoming events from exams & notices
  const dynamicUpcomingEvents = useMemo(() => {
    const list: { date: string; title: string; category: string }[] = [];
    examinations.forEach(e => {
      list.push({ date: e.startDate, title: e.title, category: 'Exam' });
    });
    notices.slice(0, 3).forEach(n => {
      list.push({ date: n.date, title: n.title, category: 'Notice' });
    });
    if (list.length === 0) {
      list.push(
        { date: '15 Sep 2026', title: 'Quarterly Tajweed & Hifz Assessment', category: 'Exam' },
        { date: '01 Oct 2026', title: 'Parent-Teacher Council Consultation', category: 'Notice' }
      );
    }
    return list.slice(0, 5);
  }, [examinations, notices]);

  // Setup Detection Tabs (if no subjects, no classes, no schedule, no teachers)
  const noSubjects = subjects.length === 0;
  const noClasses = classes.length === 0;
  const noSchedule = schedule.length === 0;
  const noTeachers = teachers.length === 0;
  const hasSetupPending = noSubjects || noClasses || noSchedule || noTeachers;

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
  const presentStudentsCount = students.filter(s => s.totalAbsentsMonthly === 0).length;
  const absentStudentsCount = Math.max(0, totalStudents - presentStudentsCount);
  const attendanceRate = totalStudents > 0 ? Math.round((presentStudentsCount / totalStudents) * 100) : 100;

  const totalTeachers = teachers.length;
  const presentTeachersCount = teachers.filter(t => t.isPresentToday).length;
  const absentTeachersCount = Math.max(0, totalTeachers - presentTeachersCount);

  // Fees & Finance metrics calculation
  const totalCollectedThisMonth = fees
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalPendingThisMonth = Math.max(0, students.reduce((sum, s) => sum + (s.monthlyFees || 0), 0) - totalCollectedThisMonth);

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + (t.incomeAmount || 0), 0) + totalCollectedThisMonth;
  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + (t.expenseAmount || 0), 0);
  const netSurplus = totalIncome - totalExpenses;
  const cashInHand = Math.max(0, netSurplus);

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
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ================= HERO & EXECUTIVE WELCOME BANNER ================= */}
      {/* ================= PROTOTYPE HERO & EXECUTIVE BANNER ================= */}
      <div className="hero">
        <div className="text-[11px] font-bold text-[#b9c6ff] tracking-wide mb-1 flex items-center gap-2">
          <span>{activeMadrasa?.nameUrdu ? `السَّلَامُ عَلَيْكُمْ • ${activeMadrasa.nameUrdu}` : 'Assalamu Alaikum'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#59c7ff] animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Good Morning, {activeMadrasa?.name || 'Admin'}
            </h1>
            <p className="text-xs sm:text-sm text-[#cbd4ff] mt-1 font-medium max-w-xl">
              Knowledge • Character • Brighter Future &nbsp;•&nbsp; <span className="font-mono text-white/90 font-bold bg-white/10 px-2 py-0.5 rounded-md">{activeMadrasa?.code || 'JDH-01'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('students')}
              className="btn primary shadow-md cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Open Students</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="btn text-white bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => setShowCollectFeeModal(true)}
              className="btn text-white bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Collect Fee</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= TODAY'S PROTOTYPE BENTO STATS ================= */}
      <div className="space-y-2.5">
        <div className="sectionhead">
          <h2>Today</h2>
          <button onClick={() => onNavigateTab('schedule')} className="hover:underline">Full Schedule →</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stat 1: Total Students */}
          <div 
            onClick={() => onNavigateTab('students')}
            className="stat cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="n">{totalStudents}</div>
            <div className="l">Total Students</div>
          </div>

          {/* Stat 2: Present Today */}
          <div 
            onClick={() => onNavigateTab('attendance')}
            className="stat cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="n text-[#16b981]">{presentStudentsCount}</div>
            <div className="l">Present Today ({attendanceRate}%)</div>
          </div>

          {/* Stat 3: Teachers */}
          <div 
            onClick={() => onNavigateTab('teachers')}
            className="stat cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="n text-[#3567ff]">{totalTeachers}</div>
            <div className="l">Teachers Active</div>
          </div>

          {/* Stat 4: Fees This Month */}
          <div 
            onClick={() => onNavigateTab('fees')}
            className="stat cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="n font-mono text-[#f6a83b]">₹{totalCollectedThisMonth.toLocaleString()}</div>
            <div className="l">Fees This Month</div>
          </div>
        </div>
      </div>

      {/* ================= PROTOTYPE QUICK ACTIONS MENU GRID ================= */}
      <div className="space-y-2.5">
        <div className="sectionhead">
          <h2>Quick Actions</h2>
        </div>
        <div className="menuGrid">
          <button className="menuCard" onClick={() => onNavigateTab('students_add')}>
            <div className="mi">👨‍🎓</div>
            <span>Add Student</span>
          </button>
          <button className="menuCard" onClick={() => setShowCollectFeeModal(true)}>
            <div className="mi">₹</div>
            <span>Collect Fee</span>
          </button>
          <button className="menuCard" onClick={() => onNavigateTab('attendance')}>
            <div className="mi">✓</div>
            <span>Attendance</span>
          </button>
          <button className="menuCard" onClick={() => onNavigateTab('roznamcha')}>
            <div className="mi">📖</div>
            <span>Daily Sabaq</span>
          </button>
          <button className="menuCard" onClick={() => onNavigateTab('inventory')}>
            <div className="mi">📦</div>
            <span>Inventory</span>
          </button>
          <button className="menuCard" onClick={() => onNavigateTab('reports')}>
            <div className="mi">📊</div>
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* ================= ROW 2: PRAYER TIMELINE & QUICK ACTIONS HUB ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Interactive 5-Prayer Timeline Bar (8 Cols) */}
        <div className="lg:col-span-8 heritage-card p-5 sm:p-6 flex flex-col justify-between border border-[#6679b4]/16 dark:border-white/10">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#6679b4]/12 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#3567ff] dark:text-[#59c7ff]" />
              <h3 className="text-xs font-black text-[#14204d] dark:text-white uppercase tracking-wider">Madrasa Namaz Timings</h3>
              <span className="text-[11px] font-urdu font-bold text-[#3567ff] dark:text-[#59c7ff]">اوقاتِ پنجگانہ نماز</span>
            </div>
            <div className="flex items-center gap-2">
              {nextPrayer && (
                <span className="hidden sm:inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#eef2ff] dark:bg-[#3567ff]/20 text-[#3567ff] dark:text-[#59c7ff] border border-[#3567ff]/30 shadow-2xs">
                  Next: {nextPrayer.name} in {nextPrayer.countdownStr}
                </span>
              )}
              <button
                onClick={() => {
                  setEditNamazState(namazTimings);
                  setShowEditNamazModal(true);
                }}
                className="text-[11px] font-bold text-[#3567ff] dark:text-[#59c7ff] hover:text-[#7654ff] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>Adjust</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2.5 py-4">
            {(['fajr', 'zohr', 'asar', 'magrib', 'isha'] as const).map((pName) => {
              const pData = namazTimings[pName];
              const isNext = nextPrayer?.name.toLowerCase() === pName.toLowerCase();
              const titleMap: Record<string, { en: string; ur: string }> = {
                fajr: { en: 'Fajr', ur: 'فجر' },
                zohr: { en: 'Zohr', ur: 'ظہر' },
                asar: { en: 'Asr', ur: 'عصر' },
                magrib: { en: 'Maghrib', ur: 'مغرب' },
                isha: { en: 'Isha', ur: 'عشاء' }
              };

              return (
                <div
                  key={pName}
                  className={`p-3 rounded-2xl text-center transition-all shadow-xs ${
                    isNext
                      ? 'bg-gradient-to-br from-[#3567ff] to-[#8752ff] text-white shadow-md ring-2 ring-[#59c7ff] scale-102'
                      : 'bg-white/80 dark:bg-white/5 border border-[#6679b4]/16 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  <span className={`text-xs font-black block ${isNext ? 'text-white' : 'text-[#14204d] dark:text-white'}`}>
                    {titleMap[pName].en}
                  </span>
                  <span className={`text-[10px] font-urdu block ${isNext ? 'text-[#cbd4ff]' : 'text-slate-500'}`}>
                    {titleMap[pName].ur}
                  </span>
                  <div className="mt-2 pt-1.5 border-t border-black/10 dark:border-white/10 font-mono text-[10px] leading-tight">
                    <span className="block opacity-80">Azan: {pData.azan.split(' ')[0]}</span>
                    <span className={`block font-black ${isNext ? 'text-white' : 'text-[#3567ff] dark:text-[#59c7ff]'}`}>Jamat: {pData.jamat}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#6679b4]/12 dark:border-white/10 flex items-center justify-between text-[11px] text-[#7180a6] dark:text-slate-400">
            <span>Automated Daily Adhan & Jama'at schedule synchronized with institutional clocks.</span>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="font-bold text-[#3567ff] dark:text-[#59c7ff] hover:underline cursor-pointer transition-colors"
            >
              Full Daily Timetable &rarr;
            </button>
          </div>
        </div>

        {/* Quick Actions Hub (4 Cols) */}
        <div className="lg:col-span-4 heritage-card p-5 sm:p-6 flex flex-col justify-between border border-[#065F46]/15 dark:border-[#10B981]/20">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#065F46]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Quick Operations</h3>
            </div>
            <span className="heritage-badge-gold text-[9px]">Fast Lane</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 py-3 my-auto">
            <button
              onClick={() => onNavigateTab('students_add')}
              className="p-3 rounded-2xl bg-[#FAF5EB]/60 hover:bg-white dark:bg-white/5 dark:hover:bg-[#14221B] border border-[#065F46]/15 hover:border-[#D97706]/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[#065F46] dark:hover:text-[#34D399] transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#065F46] dark:text-[#34D399] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="truncate">New Admission</span>
            </button>

            <button
              onClick={() => setShowCollectFeeModal(true)}
              className="p-3 rounded-2xl bg-[#FAF5EB]/60 hover:bg-white dark:bg-white/5 dark:hover:bg-[#14221B] border border-[#065F46]/15 hover:border-[#D97706]/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[#D97706] dark:hover:text-amber-300 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="truncate">Collect Fee</span>
            </button>

            <button
              onClick={() => onNavigateTab('attendance')}
              className="p-3 rounded-2xl bg-[#FAF5EB]/60 hover:bg-white dark:bg-white/5 dark:hover:bg-[#14221B] border border-[#065F46]/15 hover:border-[#D97706]/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="truncate">Attendance</span>
            </button>

            <button
              onClick={() => onNavigateTab('roznamcha')}
              className="p-3 rounded-2xl bg-[#FAF5EB]/60 hover:bg-white dark:bg-white/5 dark:hover:bg-[#14221B] border border-[#065F46]/15 hover:border-[#D97706]/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="truncate">Daily Sabaq</span>
            </button>

            <button
              onClick={() => onNavigateTab('income_expenses')}
              className="p-3 rounded-2xl bg-[#FAF5EB]/60 hover:bg-white dark:bg-white/5 dark:hover:bg-[#14221B] border border-[#065F46]/15 hover:border-[#D97706]/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4 text-rose-600 rotate-180" />
              </div>
              <span className="truncate">Add Expense</span>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="p-3 rounded-2xl bg-[#FAF5EB]/60 hover:bg-white dark:bg-white/5 dark:hover:bg-[#14221B] border border-[#065F46]/15 hover:border-[#D97706]/50 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="truncate">Reports</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#065F46]/10 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>Global Shortcuts: Press <kbd className="px-1.5 py-0.5 rounded bg-[#FAF5EB] dark:bg-white/10 font-mono text-amber-800 dark:text-amber-300 border border-[#065F46]/20">⌘K</kbd> anywhere</span>
          </div>
        </div>
      </div>

      {/* ================= ROW 3: OPERATIONAL INSIGHTS BENTO ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Col 1: Fee Defaulters Summary (4 Cols) */}
        <div className="lg:col-span-4 heritage-card p-5 sm:p-6 flex flex-col justify-between border border-[#065F46]/15 dark:border-[#10B981]/20">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#065F46]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Fee Defaulters & Dues</h3>
            </div>
            <button onClick={() => onNavigateTab('fees')} className="text-[10px] font-bold text-[#065F46] dark:text-[#34D399] hover:underline cursor-pointer">
              View All &rarr;
            </button>
          </div>

          <div className="overflow-x-auto py-2 my-auto">
            {liveFeeDefaulters.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-800 dark:text-white">No Outstanding Dues</p>
                <p className="text-[10px] text-slate-500 font-urdu mt-0.5">تمام طلبہ کی فیس مکمل وصول ہے (الحمد للہ)</p>
              </div>
            ) : (
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase border-b border-[#065F46]/10 dark:border-white/10">
                    <th className="pb-1.5">Student</th>
                    <th className="pb-1.5 text-right">Pending</th>
                    <th className="pb-1.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {liveFeeDefaulters.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                        {st.name} <span className="text-[9px] text-slate-400 font-normal">({st.class})</span>
                      </td>
                      <td className="py-2 text-right font-black text-rose-600 dark:text-rose-400 font-mono">
                        ₹{st.pending.toLocaleString()}
                      </td>
                      <td className="py-2 text-center">
                        <button 
                          onClick={() => showToast(`Reminder dispatched to ${st.name}!`, 'info')} 
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 cursor-pointer"
                        >
                          Remind
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pt-2 border-t border-[#065F46]/10 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Outstanding fee recovery tracker</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{liveFeeDefaulters.length} accounts overdue</span>
          </div>
        </div>

        {/* Col 2: Students Distribution / Department Roster (4 Cols) */}
        <div className="lg:col-span-4 heritage-card p-5 sm:p-6 flex flex-col justify-between border border-[#065F46]/15 dark:border-[#10B981]/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Enrollment by Department</h3>
            </div>
            <button onClick={() => onNavigateTab('classes')} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
              Roster &rarr;
            </button>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-8 my-auto text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No students registered yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5 py-2 my-auto">
              {(() => {
                const groups: Record<string, number> = {};
                students.forEach(s => {
                  const cls = s.class || 'General';
                  groups[cls] = (groups[cls] || 0) + 1;
                });
                const entries = Object.entries(groups).slice(0, 4);
                const max = Math.max(...entries.map(e => e[1]), 1);

                return entries.map(([cName, count], idx) => {
                  const pct = Math.round((count / max) * 100);
                  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-amber-500'];
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="truncate max-w-[180px]">{cName}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{count} talaba</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${colors[idx % colors.length]}`} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Classroom capacity & division metrics</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{classes.length} active halqas</span>
          </div>
        </div>

        {/* Col 3: Low Stock & Asset Watch (4 Cols) */}
        <div className="lg:col-span-4 heritage-card p-5 sm:p-6 flex flex-col justify-between border border-[#065F46]/15 dark:border-[#10B981]/20">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#065F46]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Assets & Low Stock Alerts</h3>
            </div>
            <button onClick={() => onNavigateTab('inventory')} className="text-[10px] font-bold text-[#065F46] dark:text-[#34D399] hover:underline cursor-pointer">
              Inventory &rarr;
            </button>
          </div>

          <div className="overflow-x-auto py-2 my-auto">
            {lowStockInventory.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-800 dark:text-white">Optimal Inventory Levels</p>
                <p className="text-[10px] text-slate-400 mt-0.5">All ration and library supplies within safety buffer.</p>
              </div>
            ) : (
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase border-b border-[#065F46]/10 dark:border-white/10">
                    <th className="pb-1.5">Asset / Ration</th>
                    <th className="pb-1.5">Level</th>
                    <th className="pb-1.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {lowStockInventory.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                        {it.item}
                      </td>
                      <td className="py-2 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {it.quantity} {it.unit || ''}
                      </td>
                      <td className="py-2 text-center">
                        <button 
                          onClick={() => showToast(`Requisition order submitted for ${it.item}!`, 'success')} 
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 hover:bg-amber-200 border border-amber-300 dark:border-amber-700 cursor-pointer shadow-2xs"
                        >
                          Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pt-2 border-t border-[#065F46]/10 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Kitchen & Library buffer threshold</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{inventory.length} items logged</span>
          </div>
        </div>
      </div>

      {/* ================= ROW 4: ACADEMIC CALENDAR & CAMPUS GALLERY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Upcoming Events & Examinations (5 Cols) */}
        <div className="lg:col-span-5 heritage-card p-5 sm:p-6 flex flex-col justify-between border border-[#065F46]/15 dark:border-[#10B981]/20">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#065F46]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#065F46] dark:text-[#34D399]" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Upcoming Events & Exams</h3>
            </div>
            <button onClick={() => onNavigateTab('examinations')} className="text-[10px] font-bold text-[#065F46] dark:text-[#34D399] hover:underline cursor-pointer">
              View Calendar &rarr;
            </button>
          </div>
          <div className="space-y-2 py-3 my-auto">
            {dynamicUpcomingEvents.map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-[#FAF5EB]/60 hover:bg-white dark:bg-white/5 dark:hover:bg-[#14221B] transition-all border border-[#065F46]/15 dark:border-white/10 text-xs shadow-2xs">
                <span className="font-mono text-[10px] text-[#064E3B] dark:text-[#A7F3D0] font-bold bg-[#065F46]/10 dark:bg-[#10B981]/15 border border-[#065F46]/20 px-2 py-0.5 rounded-md">
                  {ev.date}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate ml-2">
                  {ev.title}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-[#065F46]/10 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Academic schedule & holidays</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{dynamicUpcomingEvents.length} events logged</span>
          </div>
        </div>

        {/* Campus Gallery & Highlights (7 Cols) */}
        <div className="lg:col-span-7 heritage-card p-5 sm:p-6 flex flex-col justify-between border border-[#065F46]/15 dark:border-[#10B981]/20">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#065F46]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#D97706]" />
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('gallery')} & Highlights</h3>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#065F46]/10 hover:bg-[#065F46]/20 text-[10px] font-bold text-[#064E3B] dark:text-[#34D399] border border-[#065F46]/20 transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3 h-3" />
              <span>Upload Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto py-2">
            {gallery.slice(0, 3).map((item) => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-[#D97706]/30 aspect-video shadow-xs">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-2.5 text-white">
                  <span className="text-[8px] uppercase font-black text-amber-300">{item.category}</span>
                  <h4 className="text-[11px] font-bold truncate">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#065F46]/10 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Visual records & campus archives</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{gallery.length} photos</span>
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
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSaveNamaz}
              className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-sm cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveNamaz} className="space-y-3">
          {(['fajr', 'zohr', 'asar', 'magrib', 'isha'] as (keyof MadrasaNamazTimings)[]).map((prayer) => (
            <div key={prayer} className="grid grid-cols-3 gap-3 items-center p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{prayer}</span>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Azan Time</label>
                <input
                  type="text"
                  value={editNamazState[prayer].azan}
                  onChange={(e) => setEditNamazState({
                    ...editNamazState,
                    [prayer]: { ...editNamazState[prayer], azan: e.target.value }
                  })}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Jamat Time</label>
                <input
                  type="text"
                  value={editNamazState[prayer].jamat}
                  onChange={(e) => setEditNamazState({
                    ...editNamazState,
                    [prayer]: { ...editNamazState[prayer], jamat: e.target.value }
                  })}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-full cursor-pointer"
              >
                Print Receipt
              </button>
              <button
                onClick={() => {
                  setShowCollectFeeModal(false);
                  setLastReceipt(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-full cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowCollectFeeModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-full cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCollectFeeSubmit}
                className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-sm cursor-pointer"
              >
                Confirm & Collect
              </button>
            </div>
          )
        }
      >
        {lastReceipt ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-600/40 dark:border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">Payment Received Successfully!</h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 font-mono">
              <p>Receipt No: <strong>{lastReceipt.receiptNo}</strong></p>
              <p>Student: <strong>{lastReceipt.studentName}</strong></p>
              <p>Amount: <strong>₹{lastReceipt.amount}</strong> ({lastReceipt.month})</p>
              <p>Mode: <strong>{lastReceipt.mode}</strong> &bull; Date: {lastReceipt.date}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCollectFeeSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
              <select
                value={selectedStudentForFee}
                onChange={(e) => {
                  setSelectedStudentForFee(e.target.value);
                  const st = students.find(s => s.id === e.target.value);
                  if (st) setFeeAmount(st.monthlyFees);
                }}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Month</label>
                <input
                  type="text"
                  value={feeMonth}
                  onChange={(e) => setFeeMonth(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Mode</label>
              <select
                value={feeMode}
                onChange={(e) => setFeeMode(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-full cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSendNoticeSubmit}
              className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-full cursor-pointer"
            >
              Publish Notice
            </button>
          </div>
        }
      >
        <form onSubmit={handleSendNoticeSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
            <input
              type="text"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="e.g. Schedule for Monthly Assessment"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
            <select
              value={noticeTarget}
              onChange={(e) => setNoticeTarget(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All (Teachers, Students & Guardians)</option>
              <option value="Teachers">Teachers / Asatizah Only</option>
              <option value="Students">Students & Guardians Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Content</label>
            <textarea
              rows={3}
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="Write circular content here..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
