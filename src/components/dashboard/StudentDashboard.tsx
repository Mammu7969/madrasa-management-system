import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { 
  CalendarCheck, 
  BookOpen, 
  Award, 
  Bell, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Printer,
  ChevronLeft,
  ChevronRight,
  Type
} from 'lucide-react';
import { QuranModule } from '../modules/QuranModule';
import { FontShowcaseModal } from '../Fonts/FontShowcaseModal';

export const StudentDashboard: React.FC = () => {
  const { user, activeMadrasa } = useAuth();
  const { t } = useTheme();
  const [showFontModal, setShowFontModal] = useState<boolean>(false);

  // Find matching student record
  const students = db.getStudents(activeMadrasa?.id);
  const currentStudent = students.find(s => s.admissionNo === user?.username) || students[0];
  const notices = db.getNotices(activeMadrasa?.id);
  const schedule = db.getSchedule();

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'marks' | 'sabaq' | 'quran' | 'reports'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 = September
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const monthNames = [
    { en: 'January', ur: 'جنوری / رجب' },
    { en: 'February', ur: 'فروری / شعبان' },
    { en: 'March', ur: 'مارچ / رمضان المبارک' },
    { en: 'April', ur: 'اپریل / شوال المکرم' },
    { en: 'May', ur: 'مئی / ذوالقعدہ' },
    { en: 'June', ur: 'جون / ذوالحجہ' },
    { en: 'July', ur: 'جولائی / محرم الحرام' },
    { en: 'August', ur: 'اگست / صفر المظفر' },
    { en: 'September', ur: 'ستمبر / ربیع الاول' },
    { en: 'October', ur: 'اکتوبر / ربیع الثانی' },
    { en: 'November', ur: 'نومبر / جمادی الاول' },
    { en: 'December', ur: 'دسمبر / جمادی الثانی' },
  ];

  const currentMonthMeta = monthNames[selectedMonth];

  // Month days generator
  const monthDays = useMemo(() => {
    const days = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth, d);
      const weekdayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const isFriday = dateObj.getDay() === 5;
      days.push({
        dayNum: d,
        weekday: weekdayShort,
        isFriday
      });
    }
    return days;
  }, [selectedYear, selectedMonth, totalDaysInMonth]);

  const monthlyAyyamDars = useMemo(() => {
    return monthDays.filter(d => !d.isFriday).length;
  }, [monthDays]);

  const cumulativeHijriTeachingDays = 144;
  const villageName = currentStudent?.village || currentStudent?.address.split(',')[0].trim() || 'Nizamabad';

  const attendancePercentage = currentStudent
    ? Math.round((currentStudent.totalPresentsYearly / (currentStudent.totalPresentsYearly + currentStudent.totalAbsentsYearly || 1)) * 100)
    : 95;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Student Banner */}
      <div className="rounded-3xl bg-[#123B63] p-6 sm:p-8 text-white shadow-m3-3 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentStudent?.photoUrl}
              alt={currentStudent?.studentName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 uppercase tracking-wider">
                  Student & Guardian Portal &bull; طالب علم / سرپرست
                </span>
                <span className="text-xs text-emerald-300 font-urdu urdu-font">
                  {currentStudent?.studentNameUrdu}
                </span>
              </div>
              <h2 className="text-2xl font-black">{currentStudent?.studentName}</h2>
              <p className="text-xs text-emerald-200/80 font-mono mt-0.5">
                Adm No: {currentStudent?.admissionNo} &bull; Class: {currentStudent?.class} &bull; {currentStudent?.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <div>
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Attendance</span>
              <span className="text-2xl font-black text-white">{attendancePercentage}%</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Monthly Fee</span>
              <span className="text-xl font-black text-amber-300 font-mono">₹{currentStudent?.monthlyFees}</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <button
              type="button"
              onClick={() => setShowFontModal(true)}
              className="p-1 px-2 rounded-xl hover:bg-white/20 text-emerald-200 hover:text-white transition-all text-center flex flex-col items-center cursor-pointer"
              title="Typography & Fonts (خطاطی اور فونٹس)"
            >
              <Type className="w-4 h-4 text-amber-300 mb-0.5" />
              <span className="text-[9px] uppercase font-bold">Fonts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-m3-outline-variant/30 pb-3 no-print">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-m3-primary text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          Portal Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'attendance'
              ? 'bg-m3-primary text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Attendance Matrix (حاضری)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sabaq')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'sabaq'
              ? 'bg-m3-primary text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Daily Sabaq Matrix (روزنامچہ)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quran')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'quran'
              ? 'bg-m3-primary text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>القرآن الكريم (Holy Quran)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'marks'
              ? 'bg-m3-primary text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          Marks & Exam Reports
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-m3-primary text-white shadow-m3-1'
              : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          Teacher Reports & Behavior
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-m3-outline-variant/30 shadow-m3-1 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Current Sabaq Milestone
              </span>
              <h4 className="text-base font-black text-m3-primary">{currentStudent?.presentSabaqAt}</h4>
              <p className="text-xs text-gray-600">Daily memorization track under assigned Ustadh</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-m3-outline-variant/30 shadow-m3-1 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Session Attendance (Ramzan to Ramzan)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-800">{currentStudent?.totalPresentsYearly} Days</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Present</span>
              </div>
              <p className="text-xs text-rose-600 font-medium">Total Absences: {currentStudent?.totalAbsentsYearly} Days</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-m3-outline-variant/30 shadow-m3-1 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Sponsorship & Guardian
              </span>
              <h4 className="text-sm font-bold text-gray-900">{currentStudent?.guardianName} ({currentStudent?.guardianOccupation})</h4>
              <p className="text-xs text-gray-600">Category: <strong className="text-m3-primary">{currentStudent?.sponsorship}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
              <div className="flex items-center gap-2 border-b border-m3-outline-variant/20 pb-3">
                <Bell className="w-5 h-5 text-m3-primary" />
                <h3 className="text-sm font-bold text-m3-on-surface">Institutional Announcements</h3>
              </div>
              <div className="space-y-2.5">
                {notices.map((n) => (
                  <div key={n.id} className="p-3 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20">
                    <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                    <p className="text-[11px] text-gray-600 mt-1">{n.content}</p>
                    <span className="text-[10px] font-mono text-gray-400 mt-1 block">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
              <div className="flex items-center gap-2 border-b border-m3-outline-variant/20 pb-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-m3-on-surface">Madrasa Daily Timetable</h3>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {schedule.slice(0, 6).map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-m3-surface-container-low text-xs flex items-center justify-between">
                    <span className="font-mono font-bold text-m3-primary">{item.time}</span>
                    <span className="font-semibold text-gray-800">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Full Month Attendance Matrix */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Full Month Attendance Matrix &bull; ماہانہ حاضری رجسٹر
                </span>
                <span className="text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  تعلیمی سال: رمضان تا رمضان
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-m3-primary" />
                <span>Monthly & Cumulative Attendance Registry for {currentStudent?.studentName}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => setSelectedMonth(prev => prev > 0 ? prev - 1 : 11)}
                className="p-1.5 rounded-xl border hover:bg-gray-50 text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono px-2">{currentMonthMeta.en} {selectedYear}</span>
              <button
                type="button"
                onClick={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 0)}
                className="p-1.5 rounded-xl border hover:bg-gray-50 text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 px-3 rounded-xl border text-xs font-bold hover:bg-gray-50 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5 text-m3-primary" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Cumulative Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-800 font-bold block uppercase">ایام درس (ماہانہ)</span>
              <span className="text-lg font-black text-emerald-950 font-mono">{monthlyAyyamDars} Days</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-800 font-bold block uppercase">ایام حاضری (ماہانہ)</span>
              <span className="text-lg font-black text-emerald-950 font-mono">{currentStudent?.totalPresentsMonthly || 24} Days</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] text-amber-900 font-bold block uppercase">کل ایام درس (رمضان تا رمضان)</span>
              <span className="text-lg font-black text-amber-950 font-mono">{cumulativeHijriTeachingDays} Days</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] text-amber-900 font-bold block uppercase">کل حاضری (رمضان تا رمضان)</span>
              <span className="text-lg font-black text-emerald-900 font-mono">{currentStudent?.totalPresentsYearly} Days</span>
            </div>
            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-center">
              <span className="text-[10px] text-teal-900 font-bold block uppercase">فیصد حاضری</span>
              <span className="text-lg font-black text-teal-950 font-mono">{attendancePercentage}%</span>
            </div>
          </div>

          {/* Full Month Matrix Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-950 text-white text-[11px]">
                    <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold uppercase sticky left-0 bg-emerald-950 z-20">S.No</th>
                    <th className="p-3 w-24 border-r border-emerald-800 font-bold uppercase sticky left-12 bg-emerald-950 z-20">Adm No</th>
                    <th className="p-3 w-56 border-r border-emerald-800 font-bold uppercase sticky left-36 bg-emerald-950 z-20">Student Name & Village</th>
                    {monthDays.map(d => (
                      <th 
                        key={d.dayNum}
                        className={`p-1.5 text-center min-w-[34px] border-r border-emerald-800/60 font-mono ${
                          d.isFriday ? 'bg-emerald-800 text-amber-200 font-bold' : 'bg-emerald-950 text-white'
                        }`}
                      >
                        <span className="block text-xs font-bold leading-none">{d.dayNum}</span>
                        <span className="block text-[9px] uppercase tracking-tighter opacity-80 mt-0.5 leading-none">
                          {d.isFriday ? 'جمعہ' : d.weekday}
                        </span>
                      </th>
                    ))}
                    <th className="p-2 text-center w-16 border-r border-emerald-800 bg-emerald-900">ایام درس</th>
                    <th className="p-2 text-center w-16 border-r border-emerald-800 bg-emerald-900">ایام حاضری</th>
                    <th className="p-2 text-center w-20 border-r border-emerald-800 bg-amber-950 text-amber-200">رمضان تا رمضان</th>
                    <th className="p-2 text-center w-14 bg-emerald-900">فیصد</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="p-2.5 text-center font-bold font-mono text-gray-700 border-r sticky left-0 bg-white z-10">1</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-900 border-r sticky left-12 bg-white z-10 whitespace-nowrap">{currentStudent?.admissionNo}</td>
                    <td className="p-2.5 border-r sticky left-36 bg-white z-10">
                      <span className="font-bold text-gray-900 text-xs block">{currentStudent?.studentName}</span>
                      <span className="text-xs font-urdu text-emerald-800 font-bold block">{currentStudent?.studentNameUrdu}</span>
                      <span className="text-[10px] text-gray-500">گاؤں: <strong>{villageName}</strong></span>
                    </td>
                    {monthDays.map(d => {
                      const isFri = d.isFriday;
                      return (
                        <td key={d.dayNum} className={`p-1 text-center border-r ${isFri ? 'bg-slate-100' : ''}`}>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold ${
                            isFri ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white'
                          }`}>
                            {isFri ? '-' : 'ح'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-center font-mono font-bold border-r">{monthlyAyyamDars}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-800 border-r">{currentStudent?.totalPresentsMonthly || 24}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-950 border-r">{currentStudent?.totalPresentsYearly} / {cumulativeHijriTeachingDays}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-800">{attendancePercentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Marks & Exam Reports */}
      {activeTab === 'marks' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <div className="flex items-center justify-between border-b border-m3-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-m3-on-surface">Terminal Examination Results (2026)</h3>
                <span className="text-xs text-m3-on-surface-variant">Class: {currentStudent?.class}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              Overall Grade: Mumtaz (A+)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 font-bold border-b text-gray-700">
                <tr>
                  <th className="p-3">Subject / Kitab</th>
                  <th className="p-3">Maximum Marks</th>
                  <th className="p-3">Marks Obtained</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr>
                  <td className="p-3 font-bold text-gray-900">Hifz-ul-Quran (Tahfeez)</td>
                  <td className="p-3">100</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">98</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Mumtaz</span></td>
                  <td className="p-3 text-gray-600">Exceptional memorization & fluency</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-900">Tajweed & Makharij</td>
                  <td className="p-3">100</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">94</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Mumtaz</span></td>
                  <td className="p-3 text-gray-600">Accurate articulation points</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-900">Diniyat & Masnoon Duas</td>
                  <td className="p-3">100</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">90</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Jayyid Jiddan</span></td>
                  <td className="p-3 text-gray-600">Memorized all essential duas</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-900">Urdu & Islamic History</td>
                  <td className="p-3">100</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">88</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Jayyid Jiddan</span></td>
                  <td className="p-3 text-gray-600">Good comprehension and writing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Full Month Roznamchah Matrix */}
      {activeTab === 'sabaq' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Full Month Roznamchah Matrix &bull; ماہانہ روزنامچہ کارگزاری
                </span>
                <span className="text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  تعلیمی سال: رمضان تا رمضان
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-m3-primary" />
                <span>Daily Sabaq, Sabqi & Manzil Full-Month Register for {currentStudent?.studentName}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => setSelectedMonth(prev => prev > 0 ? prev - 1 : 11)}
                className="p-1.5 rounded-xl border hover:bg-gray-50 text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono px-2">{currentMonthMeta.en} {selectedYear}</span>
              <button
                type="button"
                onClick={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 0)}
                className="p-1.5 rounded-xl border hover:bg-gray-50 text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 px-3 rounded-xl border text-xs font-bold hover:bg-gray-50 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5 text-m3-primary" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* 30-Day Roznamchah Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-emerald-950 text-white font-bold text-[11px]">
                  {currentStudent?.class.toLowerCase().includes('hifz') ? (
                    // Hifz Headers:
                    // نام طالب مع وطن، مقدار سبق، پارہ سبق، اغلاط، سامع پارہ سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت
                    <tr>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800">تاریخ و دن</th>
                      <th className="p-2.5 w-16 text-center border-r border-emerald-800">حاضری</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">مقدار سبق</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">پارہ سبق</th>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800 font-urdu">اغلاط</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">سامع پارہ سبق</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">مقدارِ آموختہ</th>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800 font-urdu">اغلاط</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">سامع آموختہ</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">کیفیت و درجہ</th>
                    </tr>
                  ) : (
                    // Nazira / Qaida Headers:
                    // نام طالبِ علم مع وطن، سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت
                    <tr>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800">تاریخ و دن</th>
                      <th className="p-2.5 w-16 text-center border-r border-emerald-800">حاضری</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">سبق</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">مقدارِ آموختہ</th>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800 font-urdu">اغلاط</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">سامع آموختہ</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">کیفیت و درجہ</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthDays.map(d => {
                    const isFriday = d.isFriday;
                    const isHifz = currentStudent?.class.toLowerCase().includes('hifz');
                    const grade = isFriday ? '-' : 'Mumtaz';

                    if (isHifz) {
                      const sabaqQuantity = isFriday ? '-' : d.dayNum % 3 === 0 ? 'نصف صفحہ' : '۱ صفحہ (1 Page)';
                      const sabaqPara = isFriday ? 'تعطیل (جمعة المبارک)' : `${currentStudent?.presentSabaqAt.split('(')[0].trim() || 'Para 14'}, D-${d.dayNum}`;
                      const sabaqMistakes = isFriday ? '-' : d.dayNum % 3 === 0 ? 1 : 0;
                      const sabaqListener = isFriday ? '-' : 'قاری بلال احمد';
                      const amookhtaQuantity = isFriday ? '-' : 'نصف پارہ (1/2 Para)';
                      const amookhtaMistakes = isFriday ? '-' : d.dayNum % 2 === 0 ? 1 : 2;
                      const amookhtaListener = isFriday ? '-' : 'مولانا فاروق';
                      const kaifiyat = isFriday ? 'ہفتہ واری تعطیل' : 'روانی و تجوید درست ہے';

                      return (
                        <tr 
                          key={d.dayNum}
                          className={`hover:bg-emerald-50/30 transition-colors ${
                            isFriday ? 'bg-slate-50/80 text-gray-500' : d.dayNum % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                          }`}
                        >
                          <td className="p-2 text-center font-mono border-r">
                            <span className="block font-bold text-xs">{d.dayNum}</span>
                            <span className={`text-[10px] font-bold ${isFriday ? 'text-amber-700' : 'text-gray-500'}`}>
                              {isFriday ? 'جمعہ' : d.weekday}
                            </span>
                          </td>
                          <td className="p-2 text-center border-r">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isFriday ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isFriday ? 'تعطیل' : 'حاضر'}
                            </span>
                          </td>
                          <td className="p-2 border-r font-urdu">{sabaqQuantity}</td>
                          <td className="p-2 border-r font-bold text-emerald-950 font-urdu">{sabaqPara}</td>
                          <td className="p-2 text-center border-r font-mono font-bold">
                            {typeof sabaqMistakes === 'number' ? (
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${sabaqMistakes === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {sabaqMistakes}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="p-2 border-r text-gray-700 font-urdu">{sabaqListener}</td>
                          <td className="p-2 border-r font-urdu">{amookhtaQuantity}</td>
                          <td className="p-2 text-center border-r font-mono font-bold">
                            {typeof amookhtaMistakes === 'number' ? (
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${amookhtaMistakes <= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {amookhtaMistakes}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="p-2 border-r text-gray-700 font-urdu">{amookhtaListener}</td>
                          <td className="p-2 border-r">
                            <div className="flex items-center gap-1">
                              <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                {grade}
                              </span>
                              <span className="text-[11px] font-urdu text-gray-700">{kaifiyat}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      const sabaq = isFriday ? 'تعطیل (جمعة المبارک)' : `تختی نمبر ${(d.dayNum % 8) + 1}`;
                      const amookhtaQuantity = isFriday ? '-' : 'گزشتہ ۲ تختیاں';
                      const amookhtaMistakes = isFriday ? '-' : 0;
                      const amookhtaListener = isFriday ? '-' : 'قاری حفظ الرحمن';
                      const kaifiyat = isFriday ? 'ہفتہ واری تعطیل' : 'مخارج و تلفظ درست ہے';

                      return (
                        <tr 
                          key={d.dayNum}
                          className={`hover:bg-emerald-50/30 transition-colors ${
                            isFriday ? 'bg-slate-50/80 text-gray-500' : d.dayNum % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                          }`}
                        >
                          <td className="p-2 text-center font-mono border-r">
                            <span className="block font-bold text-xs">{d.dayNum}</span>
                            <span className={`text-[10px] font-bold ${isFriday ? 'text-amber-700' : 'text-gray-500'}`}>
                              {isFriday ? 'جمعہ' : d.weekday}
                            </span>
                          </td>
                          <td className="p-2 text-center border-r">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isFriday ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isFriday ? 'تعطیل' : 'حاضر'}
                            </span>
                          </td>
                          <td className="p-2 border-r font-bold text-emerald-950 font-urdu">{sabaq}</td>
                          <td className="p-2 border-r font-urdu">{amookhtaQuantity}</td>
                          <td className="p-2 text-center border-r font-mono font-bold">
                            {typeof amookhtaMistakes === 'number' ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                                {amookhtaMistakes}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="p-2 border-r text-gray-700 font-urdu">{amookhtaListener}</td>
                          <td className="p-2 border-r">
                            <div className="flex items-center gap-1">
                              <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                {grade}
                              </span>
                              <span className="text-[11px] font-urdu text-gray-700">{kaifiyat}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Holy Quran */}
      {activeTab === 'quran' && <QuranModule />}

      {/* Tab 6: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <h3 className="text-sm font-bold text-m3-on-surface flex items-center gap-2">
            <FileText className="w-5 h-5 text-m3-primary" />
            <span>Ustadh & Administration Remarks</span>
          </h3>

          <div className="p-4 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20 space-y-2 text-xs leading-relaxed">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">Conduct & Moral Behavior (Akhlaq)</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Exemplary</span>
            </div>
            <p className="text-gray-700">
              The student exhibits exemplary discipline in congregational prayers, maintains punctuality in Fajr and Tahajjud schedules, and treats fellow Talaba with utmost respect. Recommended for advanced Tajweed curriculum.
            </p>
          </div>
        </div>
      )}

      {/* Font & Typography Settings Modal */}
      <FontShowcaseModal
        isOpen={showFontModal}
        onClose={() => setShowFontModal(false)}
      />
    </div>
  );
};
