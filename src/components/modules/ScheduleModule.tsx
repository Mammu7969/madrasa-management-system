import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { ScheduleItem, MadrasaNamazTimings, PeriodScheduleItem } from '../../types';
import { exportToExcelTable } from '../../utils/excelExport';
import { 
  Clock, Calendar, Sun, Moon, Plus, Edit3, Trash2, 
  Download, Printer, Save, Check, X, BookOpen, Layers 
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const ScheduleModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { showToast } = useTheme();

  // Active Tab: 24h Routine, Namaz Timetable, Class Periods
  const [activeTab, setActiveTab] = useState<'routine' | 'namaz' | 'periods'>('routine');

  // Schedule Items State
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => db.getSchedule());
  
  // Namaz Timings State
  const [namazTimings, setNamazTimings] = useState<MadrasaNamazTimings>(() => 
    db.getNamazTimings(activeMadrasa?.id)
  );
  const [isEditingNamaz, setIsEditingNamaz] = useState(false);
  const [tempNamaz, setTempNamaz] = useState<MadrasaNamazTimings>(namazTimings);

  // Period Schedule State
  const [periods, setPeriods] = useState<PeriodScheduleItem[]>(() => 
    db.getPeriodSchedule(activeMadrasa?.id)
  );
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Modal State for Schedule Routine Item
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineTime, setRoutineTime] = useState('');
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineTitleUrdu, setRoutineTitleUrdu] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [routineCategory, setRoutineCategory] = useState<ScheduleItem['category']>('Academic');

  // Modal State for Period Timetable Item
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [periodDay, setPeriodDay] = useState('Monday');
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [periodClassName, setPeriodClassName] = useState('Hifz-ul-Quran (Section A)');
  const [periodTime, setPeriodTime] = useState('');
  const [periodSubject, setPeriodSubject] = useState('');
  const [periodTeacher, setPeriodTeacher] = useState('');
  const [periodRoom, setPeriodRoom] = useState('Hall A');

  const refreshRoutine = () => {
    setSchedule(db.getSchedule());
  };

  const refreshPeriods = () => {
    setPeriods(db.getPeriodSchedule(activeMadrasa?.id));
  };

  // Open Routine Modal
  const handleOpenNewRoutine = () => {
    setEditingRoutineId(null);
    setRoutineTime('');
    setRoutineTitle('');
    setRoutineTitleUrdu('');
    setRoutineDescription('');
    setRoutineCategory('Academic');
    setShowRoutineModal(true);
  };

  const handleOpenEditRoutine = (item: ScheduleItem) => {
    setEditingRoutineId(item.id);
    setRoutineTime(item.time);
    setRoutineTitle(item.title);
    setRoutineTitleUrdu(item.titleUrdu || '');
    setRoutineDescription(item.description);
    setRoutineCategory(item.category);
    setShowRoutineModal(true);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineTime.trim() || !routineTitle.trim()) {
      showToast('Time and Title are required', 'error');
      return;
    }

    if (editingRoutineId) {
      db.updateScheduleItem(editingRoutineId, {
        time: routineTime.trim(),
        title: routineTitle.trim(),
        titleUrdu: routineTitleUrdu.trim(),
        description: routineDescription.trim(),
        category: routineCategory
      });
      showToast('Schedule slot updated! (اوقات نامہ اپڈیٹ ہوا)', 'success');
    } else {
      db.addScheduleItem({
        time: routineTime.trim(),
        title: routineTitle.trim(),
        titleUrdu: routineTitleUrdu.trim(),
        description: routineDescription.trim(),
        category: routineCategory,
        madrasaId: activeMadrasa?.id
      });
      showToast('New schedule slot added!', 'success');
    }

    refreshRoutine();
    setShowRoutineModal(false);
  };

  const handleDeleteRoutine = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}" from the routine schedule?`)) {
      db.deleteScheduleItem(id);
      refreshRoutine();
      showToast('Slot deleted from schedule', 'info');
    }
  };

  // Save Namaz Timings
  const handleSaveNamazTimings = () => {
    db.saveNamazTimings(tempNamaz, activeMadrasa?.id);
    setNamazTimings(tempNamaz);
    setIsEditingNamaz(false);
    showToast('Congregational Namaz timings updated! (اوقات نماز محفوظ ہو گئے)', 'success');
  };

  // Period Timetable handlers
  const handleOpenNewPeriod = () => {
    setEditingPeriodId(null);
    setPeriodDay(selectedDay);
    setPeriodNumber(periods.filter(p => p.day === selectedDay).length + 1);
    setPeriodClassName('Hifz-ul-Quran (Section A)');
    setPeriodTime('08:30 AM - 09:30 AM');
    setPeriodSubject('');
    setPeriodTeacher('');
    setPeriodRoom('Hall A');
    setShowPeriodModal(true);
  };

  const handleOpenEditPeriod = (item: PeriodScheduleItem) => {
    setEditingPeriodId(item.id);
    setPeriodDay(item.day);
    setPeriodNumber(item.periodNumber);
    setPeriodClassName(item.className);
    setPeriodTime(item.time);
    setPeriodSubject(item.subject);
    setPeriodTeacher(item.teacher);
    setPeriodRoom(item.room || 'Hall A');
    setShowPeriodModal(true);
  };

  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodSubject.trim() || !periodTeacher.trim()) {
      showToast('Subject and Teacher are required', 'error');
      return;
    }

    if (editingPeriodId) {
      db.updatePeriodScheduleItem(editingPeriodId, {
        day: periodDay,
        periodNumber: Number(periodNumber),
        className: periodClassName,
        time: periodTime.trim(),
        subject: periodSubject.trim(),
        teacher: periodTeacher.trim(),
        room: periodRoom.trim()
      });
      showToast('Class period updated! (گھنٹی اپڈیٹ ہو گئی)', 'success');
    } else {
      db.addPeriodScheduleItem({
        classId: `cls-${Date.now()}`,
        className: periodClassName,
        day: periodDay,
        periodNumber: Number(periodNumber),
        time: periodTime.trim(),
        subject: periodSubject.trim(),
        teacher: periodTeacher.trim(),
        room: periodRoom.trim(),
        madrasaId: activeMadrasa?.id
      });
      showToast('Class period added!', 'success');
    }

    refreshPeriods();
    setShowPeriodModal(false);
  };

  const handleDeletePeriod = (id: string, subject: string) => {
    if (window.confirm(`Delete period "${subject}"?`)) {
      db.deletePeriodScheduleItem(id);
      refreshPeriods();
      showToast('Period deleted', 'info');
    }
  };

  // Export Routine to Excel
  const handleExportRoutineExcel = () => {
    const columns = [
      { header: 'S.No', key: 'sNo', align: 'center' as const },
      { header: 'Time Slot (اوقات)', key: 'time', align: 'center' as const },
      { header: 'Activity Title (عنوان)', key: 'title', align: 'left' as const },
      { header: 'Urdu Title (اردو عنوان)', key: 'titleUrdu', align: 'right' as const },
      { header: 'Category (شعبہ)', key: 'category', align: 'center' as const },
      { header: 'Details / Description (تفصیل)', key: 'description', align: 'left' as const }
    ];

    const data = schedule.map((s, idx) => ({
      sNo: idx + 1,
      time: s.time,
      title: s.title,
      titleUrdu: s.titleUrdu || '-',
      category: s.category,
      description: s.description
    }));

    exportToExcelTable({
      filename: `Daily_Madrasa_Schedule_${new Date().toISOString().split('T')[0]}`,
      title: 'Daily 24-Hour Madrasa Routine & Timetable (نظام الاوقات یومیہ)',
      madrasaName: activeMadrasa ? `${activeMadrasa.name} (${activeMadrasa.nameUrdu})` : 'Madrasa Management System',
      metadata: {
        'Fajr Jamat': namazTimings.fajr.jamat,
        'Zohr Jamat': namazTimings.zohr.jamat,
        'Asar Jamat': namazTimings.asar.jamat,
        'Magrib Jamat': namazTimings.magrib.jamat,
        'Isha Jamat': namazTimings.isha.jamat
      },
      columns,
      data
    });

    showToast('Schedule exported as Excel spreadsheet!', 'success');
  };

  // Export Periods to Excel
  const handleExportPeriodsExcel = () => {
    const columns = [
      { header: 'Day (دن)', key: 'day', align: 'center' as const },
      { header: 'Period (گھنٹی نمبر)', key: 'periodNumber', align: 'center' as const },
      { header: 'Class (درجہ)', key: 'className', align: 'left' as const },
      { header: 'Time (وقت)', key: 'time', align: 'center' as const },
      { header: 'Subject (مضمون)', key: 'subject', align: 'left' as const },
      { header: 'Teacher / Ustadh (استاذ)', key: 'teacher', align: 'left' as const },
      { header: 'Room (کمرہ / ہال)', key: 'room', align: 'center' as const }
    ];

    const data = periods.map(p => ({
      day: p.day,
      periodNumber: `Period ${p.periodNumber}`,
      className: p.className,
      time: p.time,
      subject: p.subject,
      teacher: p.teacher,
      room: p.room || '-'
    }));

    exportToExcelTable({
      filename: `Class_Periods_Timetable_${new Date().toISOString().split('T')[0]}`,
      title: 'Madrasa Academic Class Periods Timetable (نظام الحصص الدراسیۃ)',
      madrasaName: activeMadrasa ? `${activeMadrasa.name} (${activeMadrasa.nameUrdu})` : 'Madrasa Management System',
      columns,
      data
    });

    showToast('Class periods timetable exported to Excel!', 'success');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const filteredPeriods = periods.filter(p => p.day === selectedDay);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs no-print">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Clock className="w-5 h-5" />
            </span>
            <span>Madrasa Schedule & Timetable Studio</span>
            <span className="text-emerald-800 font-urdu urdu-font text-base font-bold">(نظام الاوقات و اوقات نماز)</span>
          </h2>
          <p className="text-xs text-gray-500">
            Fully editable 24-hour daily timeline, congregational Namaz hours, and academic class periods timetable
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'routine' && (
            <>
              <button
                onClick={handleOpenNewRoutine}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Time Slot</span>
              </button>
              <button
                onClick={handleExportRoutineExcel}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Export Excel</span>
              </button>
            </>
          )}

          {activeTab === 'periods' && (
            <>
              <button
                onClick={handleOpenNewPeriod}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Class Period</span>
              </button>
              <button
                onClick={handleExportPeriodsExcel}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Export Excel</span>
              </button>
            </>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-gray-300" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 no-print">
        <button
          onClick={() => setActiveTab('routine')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'routine'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>24-Hour Daily Routine ({schedule.length} Slots)</span>
        </button>

        <button
          onClick={() => setActiveTab('namaz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'namaz'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Namaz Timetable (اوقاتِ باجماعت نماز)</span>
        </button>

        <button
          onClick={() => setActiveTab('periods')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'periods'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Class Periods Timetable (نظام الحصص)</span>
        </button>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-xl font-black uppercase tracking-wider">{activeMadrasa?.name || 'JAMIA DARUL HUDA ISLAMIC ACADEMY'}</h1>
        <p className="font-urdu text-lg urdu-font font-bold mt-1">{activeMadrasa?.nameUrdu || 'جامعہ دار الہدیٰ اسلامک اکیڈمی'}</p>
        <h2 className="text-sm font-bold uppercase tracking-widest mt-2 border-t border-black pt-1">
          {activeTab === 'routine' ? 'Official 24-Hour Madrasa Routine Timetable (نظام الاوقات یومیہ)' :
           activeTab === 'namaz' ? 'Congregational Prayer Timetable (اوقاتِ باجماعت نماز)' :
           `Academic Class Periods Timetable - ${selectedDay} (نظام الحصص الدراسیۃ)`}
        </h2>
        <p className="text-[11px] text-gray-600 font-mono mt-0.5">Date Printed: {new Date().toLocaleDateString('en-GB')}</p>
      </div>

      {/* TAB 1: 24-HOUR ROUTINE */}
      {activeTab === 'routine' && (
        <div className="space-y-4">
          {/* Namaz Quick Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-gray-50 p-3 rounded-2xl border border-gray-300">
            {[
              { name: 'Fajr', urdu: 'فجر', time: namazTimings.fajr },
              { name: 'Zohr', urdu: 'ظہر', time: namazTimings.zohr },
              { name: 'Asar', urdu: 'عصر', time: namazTimings.asar },
              { name: 'Magrib', urdu: 'مغرب', time: namazTimings.magrib },
              { name: 'Isha', urdu: 'عشاء', time: namazTimings.isha },
            ].map(p => (
              <div key={p.name} className="bg-white p-2.5 rounded-xl border border-gray-200 text-center shadow-xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">{p.name}</span>
                <span className="text-xs font-urdu urdu-font text-emerald-700 ml-1">({p.urdu})</span>
                <div className="text-[11px] font-mono mt-1">
                  <span className="text-gray-500">Azan: <strong>{p.time.azan}</strong></span>
                  <span className="block text-amber-900 font-bold bg-amber-50 rounded mt-0.5 py-0.5">Jamat: {p.time.jamat}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Excel-style Routine Table */}
          <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#f2f4f7] text-gray-900 border-b-2 border-gray-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-2.5 border-r border-gray-300 text-center w-12">S.No</th>
                    <th className="p-2.5 border-r border-gray-300 text-center w-40">Time Slot (اوقات)</th>
                    <th className="p-2.5 border-r border-gray-300">Activity (عنوان)</th>
                    <th className="p-2.5 border-r border-gray-300 w-44">اردو عنوان</th>
                    <th className="p-2.5 border-r border-gray-300 text-center w-28">Category</th>
                    <th className="p-2.5 border-r border-gray-300">Description & Details</th>
                    <th className="p-2.5 text-center w-20 no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-normal">
                  {schedule.map((item, idx) => (
                    <tr 
                      key={item.id}
                      className={`hover:bg-amber-50/40 transition-colors border-b border-gray-200 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'
                      }`}
                    >
                      <td className="p-2.5 border-r border-gray-200 text-center font-mono font-bold text-gray-700">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 border-r border-gray-200 text-center font-mono font-bold text-emerald-900 whitespace-nowrap bg-emerald-50/30">
                        {item.time}
                      </td>
                      <td className="p-2.5 border-r border-gray-200 font-bold text-gray-900">
                        {item.title}
                      </td>
                      <td className="p-2.5 border-r border-gray-200 font-urdu urdu-font text-emerald-900 font-bold text-sm text-right">
                        {item.titleUrdu || '-'}
                      </td>
                      <td className="p-2.5 border-r border-gray-200 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.category === 'Prayer' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                          item.category === 'Academic' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                          item.category === 'Meals' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          item.category === 'Sports' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-gray-200 text-gray-600">
                        {item.description}
                      </td>
                      <td className="p-2.5 text-center no-print whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditRoutine(item)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-emerald-700"
                            title="Edit Slot"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoutine(item.id, item.title)}
                            className="p-1 rounded hover:bg-rose-100 text-gray-400 hover:text-rose-700"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NAMAZ TIMETABLE EDITOR */}
      {activeTab === 'namaz' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-600" />
                <span>Congregational Prayer Timetable (اوقاتِ باجماعت نماز)</span>
              </h3>
              <p className="text-xs text-gray-500">
                Configure official Azan and Jamat timings for all 5 daily prayers
              </p>
            </div>

            <div className="flex items-center gap-2 no-print">
              {!isEditingNamaz ? (
                <button
                  onClick={() => {
                    setTempNamaz(namazTimings);
                    setIsEditingNamaz(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Namaz Timings</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditingNamaz(false)}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNamazTimings}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Timings</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Namaz Grid Display / Editor */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {(['fajr', 'zohr', 'asar', 'magrib', 'isha'] as const).map((prayerKey) => {
              const labels = {
                fajr: { en: 'Fajr', urdu: 'نمازِ فجر', icon: Moon },
                zohr: { en: 'Zohr', urdu: 'نمازِ ظہر', icon: Sun },
                asar: { en: 'Asar', urdu: 'نمازِ عصر', icon: Sun },
                magrib: { en: 'Magrib', urdu: 'نمازِ مغرب', icon: Moon },
                isha: { en: 'Isha', urdu: 'نمازِ عشاء', icon: Moon },
              }[prayerKey];
              const Icon = labels.icon;
              const timing = isEditingNamaz ? tempNamaz[prayerKey] : namazTimings[prayerKey];

              return (
                <div 
                  key={prayerKey}
                  className="p-5 bg-gray-50/70 rounded-2xl border-2 border-gray-300 text-center space-y-3 shadow-xs hover:border-emerald-600 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800">
                    <Icon className="w-4 h-4" />
                    <h4 className="text-sm font-black uppercase tracking-wider">{labels.en}</h4>
                  </div>
                  <p className="font-urdu urdu-font text-lg text-emerald-900 font-bold">{labels.urdu}</p>

                  {isEditingNamaz ? (
                    <div className="space-y-2 pt-2 text-xs text-left">
                      <div>
                        <label className="text-[10px] font-bold text-gray-600 uppercase block">Azan Time:</label>
                        <input
                          type="text"
                          value={timing.azan}
                          onChange={(e) => setTempNamaz({
                            ...tempNamaz,
                            [prayerKey]: { ...timing, azan: e.target.value }
                          })}
                          className="w-full p-1.5 text-xs font-mono font-bold rounded border border-gray-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-600 uppercase block">Jamat Time:</label>
                        <input
                          type="text"
                          value={timing.jamat}
                          onChange={(e) => setTempNamaz({
                            ...tempNamaz,
                            [prayerKey]: { ...timing, jamat: e.target.value }
                          })}
                          className="w-full p-1.5 text-xs font-mono font-bold rounded border border-gray-300 bg-white text-amber-900"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 text-xs font-mono space-y-1.5">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-500 block text-[10px] uppercase">Azan</span>
                        <strong className="text-sm text-gray-800">{timing.azan}</strong>
                      </div>
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                        <span className="text-amber-800 block text-[10px] uppercase font-bold">Jamat</span>
                        <strong className="text-sm text-amber-900 font-black">{timing.jamat}</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CLASS PERIODS TIMETABLE */}
      {activeTab === 'periods' && (
        <div className="space-y-4">
          {/* Day Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 rounded-2xl border border-gray-200 no-print">
            <span className="text-xs text-gray-500 font-bold mr-2">Select Day:</span>
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDay === day
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day} ({periods.filter(p => p.day === day).length})
              </button>
            ))}
          </div>

          {/* Periods Table */}
          <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#f2f4f7] text-gray-900 border-b-2 border-gray-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-2.5 border-r border-gray-300 text-center w-16">Period #</th>
                    <th className="p-2.5 border-r border-gray-300 text-center w-36">Time (وقت)</th>
                    <th className="p-2.5 border-r border-gray-300 w-44">Class / Grade (درجہ)</th>
                    <th className="p-2.5 border-r border-gray-300">Subject (مضمون)</th>
                    <th className="p-2.5 border-r border-gray-300 w-44">Teacher / Ustadh (استاذ)</th>
                    <th className="p-2.5 border-r border-gray-300 text-center w-28">Room / Hall</th>
                    <th className="p-2.5 text-center w-20 no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-normal">
                  {filteredPeriods.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No class periods scheduled for {selectedDay}. Click <strong>+ Add Class Period</strong> to schedule classes.
                      </td>
                    </tr>
                  ) : (
                    filteredPeriods.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-amber-50/40 transition-colors border-b border-gray-200 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'
                        }`}
                      >
                        <td className="p-2.5 border-r border-gray-200 text-center font-mono font-bold text-gray-700 bg-gray-50/50">
                          P-{p.periodNumber}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 text-center font-mono font-bold text-emerald-900 whitespace-nowrap">
                          {p.time}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 font-bold text-gray-900">
                          {p.className}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 font-semibold text-emerald-900">
                          {p.subject}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 text-gray-800">
                          {p.teacher}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 text-center font-mono text-gray-600">
                          {p.room || 'Hall A'}
                        </td>
                        <td className="p-2.5 text-center no-print whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditPeriod(p)}
                              className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-emerald-700"
                              title="Edit Period"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePeriod(p.id, p.subject)}
                              className="p-1 rounded hover:bg-rose-100 text-gray-400 hover:text-rose-700"
                              title="Delete Period"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ROUTINE SLOT MODAL */}
      <Modal
        isOpen={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        title={editingRoutineId ? 'Edit Schedule Slot (تدوین نظام الاوقات)' : 'Add Schedule Slot (نیا وقت نامہ)'}
      >
        <form onSubmit={handleSaveRoutine} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Time Range (اوقات) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 05:45 AM - 07:45 AM"
                value={routineTime}
                onChange={(e) => setRoutineTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Category (قسم) *</label>
              <select
                value={routineCategory}
                onChange={(e) => setRoutineCategory(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium"
              >
                <option value="Prayer">Prayer (نماز و عبادات)</option>
                <option value="Academic">Academic (تعلیمی دور و اسباق)</option>
                <option value="Meals">Meals (طعام و ناشتہ)</option>
                <option value="Rest">Rest & Qailulah (آرام و قیلولہ)</option>
                <option value="Sports">Sports (کھیل کود و ورزش)</option>
                <option value="Personal">Personal (ذاتی ضروریات)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Activity Title (عنوان - English) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Sabaq Session (Dars)"
              value={routineTitle}
              onChange={(e) => setRoutineTitle(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-300 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">اردو عنوان (عنوان - اردو)</label>
            <input
              type="text"
              placeholder="مثلاً صبح کا سبق و دوری اسباق"
              value={routineTitleUrdu}
              onChange={(e) => setRoutineTitleUrdu(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-300 font-urdu urdu-font text-right"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Description & Details (تفصیل)</label>
            <textarea
              rows={2}
              placeholder="e.g. Primary Sabaq memorization and listening with Ustadh"
              value={routineDescription}
              onChange={(e) => setRoutineDescription(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowRoutineModal(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
            >
              {editingRoutineId ? 'Update Slot' : 'Add Slot to Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PERIOD SLOT MODAL */}
      <Modal
        isOpen={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        title={editingPeriodId ? 'Edit Class Period (گھنٹی کی تدوین)' : 'Add Class Period (نئی گھنٹی شامل کریں)'}
      >
        <form onSubmit={handleSavePeriod} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Day of Week (دن) *</label>
              <select
                value={periodDay}
                onChange={(e) => setPeriodDay(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium"
              >
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Period Number (گھنٹی نمبر) *</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={periodNumber}
                onChange={(e) => setPeriodNumber(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-gray-300 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Class / Section (درجہ) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hifz-ul-Quran (Section A) / Alimiyat 1"
                value={periodClassName}
                onChange={(e) => setPeriodClassName(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Time (وقت) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 08:30 AM - 09:30 AM"
                value={periodTime}
                onChange={(e) => setPeriodTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Subject (مضمون) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tajweed & Makharij / Nahw-e-Meer"
                value={periodSubject}
                onChange={(e) => setPeriodSubject(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Teacher / Ustadh (استاذ) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Maulana Hafiz Zubair"
                value={periodTeacher}
                onChange={(e) => setPeriodTeacher(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Room / Location (کمرہ یا ہال)</label>
            <input
              type="text"
              placeholder="e.g. Room 101 / Hall A"
              value={periodRoom}
              onChange={(e) => setPeriodRoom(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowPeriodModal(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
            >
              {editingPeriodId ? 'Update Period' : 'Add Period'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
