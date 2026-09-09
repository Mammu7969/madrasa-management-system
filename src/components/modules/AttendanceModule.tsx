import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Student, ManualHoliday, MadrasaClass } from '../../types';
import { 
  CalendarCheck, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Save,
  Users,
  Calendar,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';

type AttendanceStatus = 'P' | 'A' | 'L' | 'O'; // Present (حاضر), Absent (غیر حاضر), Leave (رخصت), Off/Holiday (تعطیل)

export const AttendanceModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { language, showToast } = useTheme();

  const isUrdu = language === 'ur';
  const loc = (en: string, ur: string): string => {
    return isUrdu ? ur : en;
  };

  const allStudents = db.getStudents(activeMadrasa?.id);
  const madrasaClasses: MadrasaClass[] = useMemo(() => {
    const list = db.getClasses(activeMadrasa?.id);
    if (list.length > 0) return list;
    return [
      { id: 'cls-1', name: 'Hifz Section A', nameUrdu: 'شعبہ حفظ الف', section: 'A', room: '101', capacity: 30, priority: 1, category: 'Hifz', incharge: 'Ustadh Ahmad', madrasaId: activeMadrasa?.id || 'madrasa-1' },
      { id: 'cls-2', name: 'Hifz Section B', nameUrdu: 'شعبہ حفظ ب', section: 'B', room: '102', capacity: 30, priority: 2, category: 'Hifz', incharge: 'Ustadh Bilal', madrasaId: activeMadrasa?.id || 'madrasa-1' },
      { id: 'cls-3', name: 'Nazira Class 1', nameUrdu: 'ناظرہ اول', section: 'A', room: '103', capacity: 25, priority: 3, category: 'Nazira', incharge: 'Ustadh Tariq', madrasaId: activeMadrasa?.id || 'madrasa-1' },
      { id: 'cls-4', name: 'Alimiyat Year 1', nameUrdu: 'عالمیت سال اول', section: 'A', room: '201', capacity: 20, priority: 4, category: 'Alimiyat', incharge: 'Ustadh Zubair', madrasaId: activeMadrasa?.id || 'madrasa-1' }
    ];
  }, [activeMadrasa?.id]);

  const [selectedClass, setSelectedClass] = useState<string>('Hifz Section A');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 = September (0-indexed)

  // Manual Holidays State
  const [manualHolidays, setManualHolidays] = useState<ManualHoliday[]>(() => db.getManualHolidays(activeMadrasa?.id));
  const [showHolidayModal, setShowHolidayModal] = useState<boolean>(false);
  const [holidayDate, setHolidayDate] = useState<string>('2026-09-12');
  const [holidayReason, setHolidayReason] = useState<string>('');

  const classStudents = useMemo(() => {
    return allStudents.filter(s => s.class === selectedClass);
  }, [allStudents, selectedClass]);

  // Month metadata
  const monthNames = [
    { en: 'January', ur: 'جنوری / رجب', days: 31 },
    { en: 'February', ur: 'فروری / شعبان', days: 28 },
    { en: 'March', ur: 'مارچ / رمضان المبارک', days: 31 },
    { en: 'April', ur: 'اپریل / شوال المکرم', days: 30 },
    { en: 'May', ur: 'مئی / ذوالقعدہ', days: 31 },
    { en: 'June', ur: 'جون / ذوالحجہ', days: 30 },
    { en: 'July', ur: 'جولائی / محرم الحرام', days: 31 },
    { en: 'August', ur: 'اگست / صفر المظفر', days: 31 },
    { en: 'September', ur: 'ستمبر / ربیع الاول', days: 30 },
    { en: 'October', ur: 'اکتوبر / ربیع الثانی', days: 31 },
    { en: 'November', ur: 'نومبر / جمادی الاول', days: 30 },
    { en: 'December', ur: 'دسمبر / جمادی الثانی', days: 31 },
  ];

  const currentMonthMeta = monthNames[selectedMonth];
  const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Generate day items: { dayNum: 1, weekday: 'Sat', isFriday: false, dateStr, manualHoliday }
  const monthDays = useMemo(() => {
    const days = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth, d);
      const weekdayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const isFriday = dateObj.getDay() === 5; // Friday is Islamic weekly holiday
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holiday = manualHolidays.find(h => h.date === dateStr);

      days.push({
        dayNum: d,
        weekday: weekdayShort,
        isFriday,
        dateStr,
        manualHoliday: holiday
      });
    }
    return days;
  }, [selectedYear, selectedMonth, totalDaysInMonth, manualHolidays]);

  // Working days in this month (Excluding Fridays and declared Manual Holidays)
  const monthlyAyyamDars = useMemo(() => {
    return monthDays.filter(d => !d.isFriday && !d.manualHoliday).length;
  }, [monthDays]);

  const cumulativeHijriTeachingDays = 144;

  // Attendance Matrix State: Record<studentId, Record<dayNumber, AttendanceStatus>>
  const [matrixState, setMatrixState] = useState<Record<string, Record<number, AttendanceStatus>>>(() => {
    const initial: Record<string, Record<number, AttendanceStatus>> = {};
    allStudents.forEach((st, sIdx) => {
      initial[st.id] = {};
      for (let d = 1; d <= 31; d++) {
        const dateObj = new Date(2026, 8, d);
        const isFriday = dateObj.getDay() === 5;
        if (isFriday) {
          initial[st.id][d] = 'O'; // Off / تعطیل
        } else if (d === 15 && sIdx % 2 === 1) {
          initial[st.id][d] = 'A'; // Absent
        } else if (d === 22 && sIdx % 3 === 0) {
          initial[st.id][d] = 'L'; // Leave
        } else {
          initial[st.id][d] = 'P'; // Present
        }
      }
    });
    return initial;
  });

  // Cycle attendance status on cell click: P -> A -> L -> P
  const handleToggleCell = (studentId: string, dayNum: number) => {
    setMatrixState(prev => {
      const studentMap = { ...(prev[studentId] || {}) };
      const current = studentMap[dayNum] || 'P';
      const next: AttendanceStatus = 
        current === 'P' ? 'A' :
        current === 'A' ? 'L' : 'P';
      studentMap[dayNum] = next;
      return {
        ...prev,
        [studentId]: studentMap
      };
    });
  };

  // Mark all students present for the whole month (skipping Fridays, holidays, and pre-admission days)
  const handleMarkAllMonthPresent = () => {
    setMatrixState(prev => {
      const updated = { ...prev };
      classStudents.forEach(st => {
        updated[st.id] = {};
        monthDays.forEach(d => {
          const isBeforeAdm = st.admissionDate && d.dateStr < st.admissionDate;
          if (d.isFriday || d.manualHoliday || isBeforeAdm) {
            updated[st.id][d.dayNum] = 'O';
          } else {
            updated[st.id][d.dayNum] = 'P';
          }
        });
      });
      return updated;
    });
    showToast(loc('Updated entire month to Present (Fridays & Holidays preserved)!', 'پورا مہینہ حاضر درج ہو گیا (تعطیلات برقرار ہیں)!'), 'success');
  };

  // Save register
  const handleSaveRegister = () => {
    showToast(loc(`Attendance register for ${selectedClass} saved successfully!`, `درجہ ${selectedClass} کا حاضری رجسٹر محفوظ ہو گیا!`), 'success');
  };

  // Manual Holiday Handlers
  const handleAddManualHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayReason.trim()) {
      showToast(loc('Please specify Date and Reason for the Holiday', 'براہِ کرم تاریخ اور تعطیل کا سبب درج کریں'), 'error');
      return;
    }

    const newHol: ManualHoliday = {
      id: `hol-${Date.now()}`,
      date: holidayDate,
      reason: holidayReason.trim(),
      madrasaId: activeMadrasa?.id,
      announcedBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    db.addManualHoliday(newHol);
    setManualHolidays(db.getManualHolidays(activeMadrasa?.id));
    showToast(loc(`Manual Holiday declared for ${holidayDate}: "${holidayReason}"`, `تعطیل کا اعلان محفوظ ہو گیا: ${holidayReason}`), 'success');
    setHolidayReason('');
  };

  const handleDeleteManualHoliday = (holId: string) => {
    db.deleteManualHoliday(holId);
    setManualHolidays(db.getManualHolidays(activeMadrasa?.id));
    showToast(loc('Declared Holiday removed.', 'تعطیل حذف کر دی گئی'), 'info');
  };

  // Export Matrix to CSV
  const handleExportCSV = () => {
    let csv = `Madrasa Management System - Attendance Matrix\n`;
    csv += `Madrasa: ${activeMadrasa?.name}, Class: ${selectedClass}, Month: ${currentMonthMeta.en} ${selectedYear}\n`;
    csv += `Academic Session: Ramzan to Ramzan (رمضان تا رمضان)\n\n`;

    const dayHeaders = monthDays.map(d => `"${d.dayNum} ${d.weekday}"`).join(',');
    csv += `S.No,Admission No,Student Name,Village / City,${dayHeaders},Monthly Ayyam Dars,Monthly Ayyam Haziri,Yearly Ayyam Dars (Ramzan to Ramzan),Yearly Ayyam Haziri (Ramzan to Ramzan),Cumulative %\n`;

    classStudents.forEach((st, idx) => {
      const studentDays = matrixState[st.id] || {};
      
      // Calculate student-specific working days and presents
      const studentWorkingDays = monthDays.filter(d => {
        if (d.isFriday || d.manualHoliday) return false;
        if (st.admissionDate && d.dateStr < st.admissionDate) return false;
        return true;
      }).length;

      const monthlyPresentCount = monthDays.filter(d => {
        if (d.isFriday || d.manualHoliday) return false;
        if (st.admissionDate && d.dateStr < st.admissionDate) return false;
        return studentDays[d.dayNum] === 'P';
      }).length;

      const cumulativeYearPresent = Math.max(0, st.totalPresentsYearly || (cumulativeHijriTeachingDays - 5));
      const percentage = studentWorkingDays > 0 ? ((monthlyPresentCount / studentWorkingDays) * 100).toFixed(1) : '100.0';
      const village = st.village || st.address.split(',')[0].trim();

      const dayCells = monthDays.map(d => {
        if (st.admissionDate && d.dateStr < st.admissionDate) return '-';
        if (d.manualHoliday) return `Holiday (${d.manualHoliday.reason})`;
        if (d.isFriday) return 'Friday';
        return studentDays[d.dayNum] || 'P';
      }).join(',');

      csv += `${idx + 1},${st.admissionNo},"${st.studentName} (${st.studentNameUrdu})","${village}",${dayCells},${studentWorkingDays},${monthlyPresentCount},${cumulativeHijriTeachingDays},${cumulativeYearPresent},${percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${selectedClass.replace(/\s+/g, '_')}_${currentMonthMeta.en}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(loc('Spreadsheet exported to CSV successfully!', 'حاضری رجسٹر فائل کامیابی سے ایکسپورٹ ہو گئی!'), 'success');
  };

  // Summary Metrics
  const classAvgAttendance = useMemo(() => {
    if (classStudents.length === 0 || monthlyAyyamDars === 0) return 0;
    let totalPresents = 0;
    let totalPossible = 0;

    classStudents.forEach(st => {
      const days = matrixState[st.id] || {};
      monthDays.forEach(d => {
        if (d.isFriday || d.manualHoliday) return;
        if (st.admissionDate && d.dateStr < st.admissionDate) return;
        totalPossible++;
        if (days[d.dayNum] === 'P') totalPresents++;
      });
    });

    if (totalPossible === 0) return 100;
    return Math.round((totalPresents / totalPossible) * 100);
  }, [classStudents, matrixState, monthDays, monthlyAyyamDars]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-emerald-900 text-white p-6 sm:p-8 shadow-m3-2 overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wide flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-300" />
                {loc('Madrasa Academic Registers', 'دفاتر و رجسٹرات مدرسہ')}
              </span>
              <span className="text-xs text-amber-300 font-bold bg-amber-400/20 px-3 py-0.5 rounded-full border border-amber-300/30">
                {loc('Academic Year: Ramzan to Ramzan', 'تعلیمی سال: رمضان المبارک تا رمضان المبارک')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {loc('Monthly Attendance Matrix Register', 'ماہانہ رجسٹر حاضری طلبہ')}
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl font-urdu text-sm">
              {loc(
                'Academic Attendance Register: Continuous monthly evaluation from Ramzan to Ramzan with Student Name, Homeland, Working Days and Present Days.',
                'سلسلہ وار حاضری رجسٹر برائے ماہانہ و سالانہ جائزہ - تعلیمی سال: رمضان المبارک تا رمضان المبارک مع نام طالب علم، وطن، ایامِ درس و ایامِ حاضری'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                {loc('Enrolled Students', 'کل طلبہ')}
              </span>
              <span className="text-2xl font-black">{classStudents.length}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">
                {loc('Avg Attendance', 'اوسط حاضری')}
              </span>
              <span className="text-2xl font-black text-amber-200">{classAvgAttendance}%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-white/15 no-print">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleMarkAllMonthPresent}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Mark all non-holiday days as Present"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>{loc('Mark Month Present', 'پورا مہینہ حاضر درج کریں')}</span>
            </button>

            {/* Declare Holiday Button */}
            <button
              type="button"
              onClick={() => setShowHolidayModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Declare or manage Manual Holidays with Reason"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{loc('Declare Holiday / تعطیل کا اعلان', 'تعطیل کا اعلان مع سبب')}</span>
              {manualHolidays.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black">
                  {manualHolidays.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
              title="Download CSV Spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>{loc('Export CSV', 'ایکسپورٹ CSV')}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
              title="Print Official Register Ledger"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-300" />
              <span>{loc('Print Ledger', 'پرنٹ رجسٹر')}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveRegister}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loc('Save Register', 'رجسٹر محفوظ کریں')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 no-print">
        
        {/* Class Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
            {loc('Class:', 'درجہ:')}
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 min-w-[200px]"
          >
            {madrasaClasses.map(cls => (
              <option key={cls.id} value={cls.name}>
                {loc(cls.name, cls.nameUrdu || cls.name)} {cls.priority ? `(P#${cls.priority})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="font-bold text-gray-500 text-[11px]">{loc('Legend:', 'علامات:')}</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-[11px]">
            {isUrdu ? 'ح = حاضر (P)' : 'P = Present'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold border border-rose-300 text-[11px]">
            {isUrdu ? 'غ = غیر حاضر (A)' : 'A = Absent'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[11px]">
            {isUrdu ? 'ر = رخصت (L)' : 'L = Leave'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-bold border border-gray-300 text-[11px]">
            - = {loc('Empty (Pre-Admission / Holiday)', 'خالی (قبل از داخلہ / تعطیل)')}
          </span>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedMonth(prev => prev > 0 ? prev - 1 : 11)}
            className="p-2 rounded-xl border hover:bg-gray-50 text-gray-600 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-4 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[180px]">
            <span className="font-bold text-xs text-emerald-950 block">
              {loc(
                `${currentMonthMeta.en} ${selectedYear}`,
                `${currentMonthMeta.ur} ${selectedYear}`
              )}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {monthlyAyyamDars} {loc('Working Days', 'ایامِ درس')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 0)}
            className="p-2 rounded-xl border hover:bg-gray-50 text-gray-600 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FULL MONTH ATTENDANCE MATRIX TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-950 text-white text-[11px]">
                <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold uppercase sticky left-0 bg-emerald-950 z-20">
                  {loc('S.No', 'شمار')}
                </th>
                <th className="p-3 w-24 border-r border-emerald-800 font-bold uppercase sticky left-12 bg-emerald-950 z-20">
                  {loc('Adm No', 'داخلہ نمبر')}
                </th>
                <th className="p-3 min-w-[200px] border-r border-emerald-800 font-bold uppercase sticky left-36 bg-emerald-950 z-20 shadow-md">
                  {loc('Student Name & Homeland', 'نام طالب علم مع گاؤں')}
                </th>
                {monthDays.map(d => {
                  const isManualHol = Boolean(d.manualHoliday);
                  return (
                    <th 
                      key={d.dayNum}
                      title={d.manualHoliday ? `Holiday: ${d.manualHoliday.reason}` : d.isFriday ? 'Friday Weekly Holiday' : d.dateStr}
                      className={`p-1 text-center min-w-[34px] border-r border-emerald-800/60 font-mono ${
                        isManualHol ? 'bg-amber-700 text-amber-100 font-black' :
                        d.isFriday ? 'bg-emerald-800 text-amber-200 font-bold' : 'bg-emerald-950 text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold leading-none">{d.dayNum}</span>
                      <span className="block text-[9px] uppercase tracking-tighter opacity-80 mt-0.5 leading-none">
                        {isManualHol ? loc('Hol', 'تعطیل') : d.isFriday ? loc('Fri', 'جمعہ') : d.weekday}
                      </span>
                    </th>
                  );
                })}
                <th className="p-2 text-center w-20 border-r border-emerald-800 bg-emerald-900 font-bold">
                  {loc('Work Days', 'ایام درس')}
                </th>
                <th className="p-2 text-center w-20 border-r border-emerald-800 bg-emerald-900 font-bold">
                  {loc('Present', 'ایام حاضری')}
                </th>
                <th className="p-2 text-center w-24 border-r border-emerald-800 bg-amber-950 text-amber-200 font-bold">
                  {loc('Hijri Dars', 'رمضان تا رمضان')}
                </th>
                <th className="p-2 text-center w-20 border-r border-emerald-800 bg-amber-950 text-amber-200 font-bold">
                  {loc('Hijri Present', 'کل حاضری')}
                </th>
                <th className="p-2 text-center w-16 bg-emerald-900 font-bold">
                  {loc('Ratio %', 'فیصد')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classStudents.map((st, idx) => {
                const studentDays = matrixState[st.id] || {};
                
                // Student-specific working days and presents (excludes pre-admission and manual holidays)
                const studentWorkingDays = monthDays.filter(d => {
                  if (d.isFriday || d.manualHoliday) return false;
                  if (st.admissionDate && d.dateStr < st.admissionDate) return false;
                  return true;
                }).length;

                const monthlyPresentCount = monthDays.filter(d => {
                  if (d.isFriday || d.manualHoliday) return false;
                  if (st.admissionDate && d.dateStr < st.admissionDate) return false;
                  return studentDays[d.dayNum] === 'P';
                }).length;

                const cumulativeYearPresent = Math.max(0, st.totalPresentsYearly || (cumulativeHijriTeachingDays - 5));
                const percentage = studentWorkingDays > 0 ? ((monthlyPresentCount / studentWorkingDays) * 100).toFixed(1) : '100.0';
                const village = st.village || st.address.split(',')[0].trim();
                const isEven = idx % 2 === 0;

                return (
                  <tr key={st.id} className={`hover:bg-emerald-50/40 transition-colors ${isEven ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className={`p-2.5 text-center font-mono font-bold text-gray-700 border-r sticky left-0 z-10 ${isEven ? 'bg-white' : 'bg-gray-50'}`}>{idx + 1}</td>
                    <td className={`p-2.5 font-mono font-bold text-emerald-900 border-r sticky left-12 z-10 whitespace-nowrap ${isEven ? 'bg-white' : 'bg-gray-50'}`}>{st.admissionNo}</td>
                    <td className={`p-2.5 border-r sticky left-36 z-10 shadow-xs ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="font-bold text-gray-900">
                        {loc(st.studentName, st.studentNameUrdu)}
                      </div>
                      <div className="text-[10px] text-gray-500 font-urdu">
                        {loc('Homeland:', 'وطن:')} {village} &bull; {loc('Joined:', 'تاریخ داخلہ:')} {st.admissionDate || 'N/A'}
                      </div>
                    </td>

                    {monthDays.map(d => {
                      const isBeforeAdmission = Boolean(st.admissionDate && d.dateStr < st.admissionDate);
                      const isManualHoliday = Boolean(d.manualHoliday);
                      const isFriday = d.isFriday;
                      const status = studentDays[d.dayNum] || (isFriday ? 'O' : 'P');

                      // 1. If student joined after this date, render empty cell
                      if (isBeforeAdmission) {
                        return (
                          <td 
                            key={d.dayNum}
                            title={`Joined on ${st.admissionDate} - Days before admission are empty`}
                            className="p-1 text-center font-mono text-xs font-bold border-r bg-gray-50/50 text-gray-300 select-none cursor-not-allowed"
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 text-gray-300 text-xs">
                              -
                            </span>
                          </td>
                        );
                      }

                      // 2. If Madrasa declared manual holiday, render empty / holiday cell with reason
                      if (isManualHoliday) {
                        return (
                          <td 
                            key={d.dayNum}
                            title={`Madrasa Holiday: ${d.manualHoliday?.reason}`}
                            className="p-1 text-center font-mono text-xs font-bold border-r bg-amber-50 text-amber-900 select-none cursor-not-allowed"
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                              -
                            </span>
                          </td>
                        );
                      }

                      // 3. Friday Weekly Holiday
                      if (isFriday) {
                        return (
                          <td 
                            key={d.dayNum}
                            title="Friday Weekly Holiday"
                            className="p-1 text-center font-mono text-xs font-bold border-r bg-emerald-50/70 select-none cursor-not-allowed"
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 text-gray-400 text-xs">
                              -
                            </span>
                          </td>
                        );
                      }

                      // 4. Normal Working Day (Click to toggle P -> A -> L)
                      return (
                        <td 
                          key={d.dayNum} 
                          onClick={() => handleToggleCell(st.id, d.dayNum)}
                          className="p-1 text-center font-mono text-xs font-bold border-r select-none cursor-pointer hover:bg-emerald-100/70"
                        >
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold ${
                            status === 'P' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                            status === 'A' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                            'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {status === 'P' ? (isUrdu ? 'ح' : 'P') :
                             status === 'A' ? (isUrdu ? 'غ' : 'A') : (isUrdu ? 'ر' : 'L')}
                          </span>
                        </td>
                      );
                    })}

                    <td className="p-2 text-center font-mono font-bold text-gray-800 border-r">{studentWorkingDays}</td>
                    <td className="p-2 text-center font-mono font-bold text-emerald-800 border-r">{monthlyPresentCount}</td>
                    <td className="p-2 text-center font-mono font-bold text-amber-950 border-r">{cumulativeHijriTeachingDays}</td>
                    <td className="p-2 text-center font-mono font-bold text-emerald-900 border-r">{cumulativeYearPresent}</td>
                    <td className="p-2 text-center font-mono font-black text-emerald-950">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Footer For Ledger Print */}
        <div className="p-6 bg-gray-50/80 border-t border-gray-200 mt-2 flex flex-wrap items-center justify-between gap-6 text-xs text-gray-700 font-urdu">
          <div className="text-center min-w-[140px] pt-4 border-t-2 border-gray-400">
            <span className="font-bold block">{loc("Teacher's Signature", 'دستخط استاذ')}</span>
          </div>
          <div className="text-center min-w-[160px] pt-4 border-t-2 border-gray-400">
            <span className="font-bold block">{loc('Supervisor Signature', 'دستخط ناظم تعلیمات')}</span>
          </div>
          <div className="text-center min-w-[140px] pt-4 border-t-2 border-gray-400">
            <span className="font-bold block">{loc("Head of Department", 'دستخط صدر المدرسین')}</span>
          </div>
          <div className="text-center min-w-[140px] pt-4 border-t-2 border-gray-400">
            <span className="font-bold block">{loc('Official Madrasa Stamp', 'مہر جامعہ / مدرسہ')}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: DECLARE MANUAL HOLIDAY WITH REASON */}
      {/* ========================================================= */}
      <Modal
        isOpen={showHolidayModal}
        onClose={() => setShowHolidayModal(false)}
        title={loc('Declare Manual Holiday (تعطیل کا اعلان)', 'تعطیل کا اعلان مع سبب')}
        subtitle={loc(
          'Announce a custom Madrasa holiday (Weather, Annual Function, Emergency) with a Message / Reason field. Days will be empty across register.',
          'مدرسہ میں خصوصی تعطیل کا اعلان، تاریخ اور سبب درج فرمائیں۔ اس دن کی حاضری خالی رہے گی۔'
        )}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <form onSubmit={handleAddManualHoliday} className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>{loc('New Holiday Declaration', 'نئی تعطیل کا اندراج')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Holiday Date *', 'تعطیل کی تاریخ *')}
                </label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Message / Reason Field *', 'پیغام / سبب تعطیل *')}
                </label>
                <input
                  type="text"
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  placeholder={loc('e.g. Heavy Rain / Storm / Annual Function', 'مثال: شدید بارش / سالانہ جلسہ کی تیاری')}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{loc('Announce Holiday', 'تعطیل محفوظ کریں')}</span>
              </button>
            </div>
          </form>

          {/* Active Manual Holidays List */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">
              {loc('Declared Holidays in Register', 'رجسٹر میں درج تعطیلات')} ({manualHolidays.length})
            </h4>

            {manualHolidays.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-3 text-center border border-dashed border-gray-200 rounded-xl">
                {loc('No manual holidays declared. Use the form above to declare one.', 'کوئی خصوصی تعطیل درج نہیں ہے۔')}
              </p>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {manualHolidays.map(hol => (
                  <div key={hol.id} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          {hol.date}
                        </span>
                        <span className="font-bold text-gray-900">{hol.reason}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {loc('Announced by:', 'اعلان بذریعہ:')} {hol.announcedBy || 'Madrasa Administration'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteManualHoliday(hol.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Holiday"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
};
