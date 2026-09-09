import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import { 
  BookOpen, 
  CalendarCheck, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Save,
  Edit3,
  Calendar,
  User,
  Users,
  Home,
  Check,
  X,
  Layers
} from 'lucide-react';
import { Modal } from '../common/Modal';

type AttendanceStatus = 'P' | 'A' | 'L' | 'O'; // Present, Absent, Leave, Off
export type SabaqTickStatus = 'none' | 'correct' | 'wrong';

interface RoznamchahDayData {
  department: 'hifz' | 'nazira_qaida';
  sabaqQuantity?: string;
  sabaqPara?: string;
  sabaqMistakes?: number;
  sabaqListener?: string;
  sabaq?: string;
  amookhtaQuantity?: string;
  amookhtaMistakes?: number;
  amookhtaListener?: string;
  kaifiyat?: string;
  grade: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Hasan' | 'Maqbool' | 'Daeef';
  remarks?: string;
}

export const RoznamchaModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { language, showToast } = useTheme();

  const isUrdu = language === 'ur';
  const loc = (en: string, ur: string): string => {
    return isUrdu ? ur : en;
  };

  const allStudents = db.getStudents(activeMadrasa?.id);
  const madrasaClasses = useMemo(() => {
    const list = db.getClasses(activeMadrasa?.id);
    if (list.length > 0) return list;
    return [
      { id: 'cls-1', name: 'Hifz Section A', nameUrdu: 'شعبہ حفظ الف' },
      { id: 'cls-2', name: 'Hifz Section B', nameUrdu: 'شعبہ حفظ ب' },
      { id: 'cls-3', name: 'Nazira Class 1', nameUrdu: 'ناظرہ اول' },
      { id: 'cls-4', name: 'Alimiyat Year 1', nameUrdu: 'عالمیت سال اول' }
    ];
  }, [activeMadrasa?.id]);

  const [selectedClass, setSelectedClass] = useState<string>('Hifz Section A');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-2');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 = September (0-indexed)
  const [activeView, setActiveView] = useState<'roznamchah' | 'roznamchah_daily'>('roznamchah');
  const [selectedDailyDay, setSelectedDailyDay] = useState<number>(4);

  // Department Template Override: 'auto' | 'hifz' | 'nazira_qaida'
  const [departmentOverride, setDepartmentOverride] = useState<'auto' | 'hifz' | 'nazira_qaida'>('auto');

  const isAutoHifz = useMemo(() => selectedClass.toLowerCase().includes('hifz'), [selectedClass]);
  const activeDepartment: 'hifz' | 'nazira_qaida' = useMemo(() => {
    if (departmentOverride !== 'auto') return departmentOverride;
    return isAutoHifz ? 'hifz' : 'nazira_qaida';
  }, [departmentOverride, isAutoHifz]);

  const classStudents = useMemo(() => {
    return allStudents.filter(s => s.class === selectedClass);
  }, [allStudents, selectedClass]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId || selectedStudentId === 'all') return null;
    return classStudents.find(s => s.id === selectedStudentId) || classStudents[0] || null;
  }, [classStudents, selectedStudentId]);

  const currentStudentIndex = useMemo(() => {
    if (!selectedStudent) return -1;
    return classStudents.findIndex(s => s.id === selectedStudent.id);
  }, [classStudents, selectedStudent]);

  const handlePrevStudent = () => {
    if (classStudents.length === 0) return;
    const newIndex = currentStudentIndex > 0 ? currentStudentIndex - 1 : classStudents.length - 1;
    setSelectedStudentId(classStudents[newIndex].id);
  };

  const handleNextStudent = () => {
    if (classStudents.length === 0) return;
    const newIndex = currentStudentIndex < classStudents.length - 1 ? currentStudentIndex + 1 : 0;
    setSelectedStudentId(classStudents[newIndex].id);
  };

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
    { en: 'December', ur: 'دسمبر / جمادی الثانی', days: 31 }
  ];

  const currentMonthMeta = monthNames[selectedMonth];
  const totalDaysInMonth = currentMonthMeta.days;

  const monthDays = useMemo(() => {
    const days = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth, d);
      const weekdayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const isFriday = dateObj.getDay() === 5;
      days.push({
        dayNum: d,
        weekday: weekdayShort,
        isFriday,
        dateStr: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      });
    }
    return days;
  }, [selectedYear, selectedMonth, totalDaysInMonth]);

  const monthlyAyyamDars = useMemo(() => {
    return monthDays.filter(d => !d.isFriday).length;
  }, [monthDays]);

  // Attendance Matrix State
  const [matrixState, setMatrixState] = useState<Record<string, Record<number, AttendanceStatus>>>(() => {
    const initial: Record<string, Record<number, AttendanceStatus>> = {};
    allStudents.forEach((st) => {
      initial[st.id] = {};
      for (let d = 1; d <= 31; d++) {
        const dateObj = new Date(2026, 8, d);
        const isFriday = dateObj.getDay() === 5;
        if (isFriday) {
          initial[st.id][d] = 'O'; // Off / تعطیل
        } else if (d === 15 && st.id === 'std-2') {
          initial[st.id][d] = 'A'; // 1 absent day -> 25 present days out of 26
        } else {
          initial[st.id][d] = 'P'; // Present
        }
      }
    });
    return initial;
  });

  // Roznamchah Matrix State
  const [roznamchahState, setRoznamchahState] = useState<Record<string, Record<number, RoznamchahDayData>>>(() => {
    const init: Record<string, Record<number, RoznamchahDayData>> = {};
    
    // Explicit high-fidelity data matching the user reference image
    const customDaysStd2: Record<number, Partial<RoznamchahDayData>> = {
      1: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (4 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 1, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      2: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (4 رکوع)', sabaqMistakes: 1, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Mumtaz' },
      3: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (5 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 0, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      4: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (5 رکوع)', sabaqMistakes: 2, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 1, amookhtaListener: 'Maulana Rashid', grade: 'Hasan' },
      5: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (6 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 1, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      6: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (6 رکوع)', sabaqMistakes: 1, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Mumtaz' },
      7: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (7 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 1, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      8: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (7 رکوع)', sabaqMistakes: 1, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Mumtaz' },
      9: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (8 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 1, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      10: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (8 رکوع)', sabaqMistakes: 1, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Hasan' },
      12: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (9 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 1, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      13: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (9 رکوع)', sabaqMistakes: 1, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Mumtaz' },
      14: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (10 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 1, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      15: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (10 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 0, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      16: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (11 رکوع)', sabaqMistakes: 1, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Mumtaz' },
      17: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (11 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      19: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (12 رکوع)', sabaqMistakes: 1, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Mumtaz' },
      20: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (12 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      21: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (13 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      22: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (13 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      23: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (14 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      24: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (14 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      26: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (15 رکوع)', sabaqMistakes: 1, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Mumtaz' },
      27: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (15 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      28: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (16 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Imran', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      29: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (16 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
      30: { sabaqQuantity: '1 Page', sabaqPara: 'Para 11 (16 رکوع)', sabaqMistakes: 0, sabaqListener: 'Qari Saleem', amookhtaQuantity: '2 Para', amookhtaMistakes: 2, amookhtaListener: 'Maulana Rashid', grade: 'Jayyid' },
    };

    allStudents.forEach((st, sIdx) => {
      init[st.id] = {};
      const isHifz = st.class.toLowerCase().includes('hifz');
      for (let d = 1; d <= 31; d++) {
        if (st.id === 'std-2' && customDaysStd2[d]) {
          const c = customDaysStd2[d];
          init[st.id][d] = {
            department: 'hifz',
            sabaqQuantity: c.sabaqQuantity || '1 Page',
            sabaqPara: c.sabaqPara || 'Para 11',
            sabaqMistakes: c.sabaqMistakes ?? 0,
            sabaqListener: c.sabaqListener || 'Qari Saleem',
            amookhtaQuantity: c.amookhtaQuantity || '2 Para',
            amookhtaMistakes: c.amookhtaMistakes ?? 1,
            amookhtaListener: c.amookhtaListener || 'Maulana Rashid',
            kaifiyat: c.grade === 'Mumtaz' ? 'روانی و تجوید درست ہے' : 'حفظ درست ہے',
            grade: (c.grade as any) || 'Jayyid',
            sabaq: `${c.sabaqPara} (${c.sabaqQuantity})`
          };
          continue;
        }

        const dateObj = new Date(2026, 8, d);
        const isFriday = dateObj.getDay() === 5;
        if (!isFriday) {
          const grades: ('Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Hasan')[] = ['Jayyid', 'Mumtaz', 'Jayyid', 'Hasan'];
          const grade = grades[(sIdx + d) % grades.length];
          const listeners = ['Qari Saleem', 'Qari Imran', 'Maulana Rashid'];
          const listener = listeners[(sIdx + d) % listeners.length];

          if (isHifz) {
            init[st.id][d] = {
              department: 'hifz',
              sabaqQuantity: '1 Page',
              sabaqPara: `Para 11 (${((d % 10) + 1)} رکوع)`,
              sabaqMistakes: (sIdx + d) % 3 === 0 ? 1 : 0,
              sabaqListener: listener,
              amookhtaQuantity: '2 Para',
              amookhtaMistakes: (sIdx + d) % 2 === 0 ? 1 : 2,
              amookhtaListener: 'Maulana Rashid',
              kaifiyat: 'روانی و تجوید درست ہے',
              grade,
              sabaq: `Para 11, Ruku ${((d % 10) + 1)}`
            };
          } else {
            init[st.id][d] = {
              department: 'nazira_qaida',
              sabaq: 'تختی نمبر ۶ (تنوین و حرکات)',
              amookhtaQuantity: 'گزشتہ ۲ تختیاں',
              amookhtaMistakes: (sIdx + d) % 4 === 0 ? 1 : 0,
              amookhtaListener: listener,
              kaifiyat: 'مخارج و تلفظ درست',
              grade: 'Mumtaz'
            };
          }
        }
      }
    });
    return init;
  });

  // Modal State for Roznamchah editing
  const [selectedStudentForSabaq, setSelectedStudentForSabaq] = useState<Student | null>(null);
  const [selectedDayForSabaq, setSelectedDayForSabaq] = useState<number>(4);

  // Form Fields - Hifz
  const [modalSabaqQuantity, setModalSabaqQuantity] = useState<string>('1 Page');
  const [modalSabaqPara, setModalSabaqPara] = useState<string>('Para 11 (Surah Yunus, Ruku 4)');
  const [modalSabaqMistakes, setModalSabaqMistakes] = useState<number>(0);
  const [modalSabaqListener, setModalSabaqListener] = useState<string>('Qari Saleem');

  // Form Fields - Nazira / Qaida & Common Amookhta
  const [modalSabaq, setModalSabaq] = useState<string>('تختی نمبر ۶: تنوین');
  const [modalAmookhtaQuantity, setModalAmookhtaQuantity] = useState<string>('2 Para');
  const [modalAmookhtaMistakes, setModalAmookhtaMistakes] = useState<number>(1);
  const [modalAmookhtaListener, setModalAmookhtaListener] = useState<string>('Maulana Rashid');
  const [modalKaifiyat, setModalKaifiyat] = useState<string>('روانی و تجوید درست ہے');
  const [modalGrade, setModalGrade] = useState<'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Hasan' | 'Maqbool' | 'Daeef'>('Jayyid');
  const [modalRemarks, setModalRemarks] = useState<string>('Recited accurately with Tajweed');

  const [showSabaqModal, setShowSabaqModal] = useState<boolean>(false);

  // Cycle attendance status on cell click: P -> A -> L -> O -> P
  const handleToggleCell = (studentId: string, dayNum: number) => {
    setMatrixState(prev => {
      const studentMap = { ...(prev[studentId] || {}) };
      const current = studentMap[dayNum] || 'P';
      const next: AttendanceStatus = 
        current === 'P' ? 'A' :
        current === 'A' ? 'L' :
        current === 'L' ? 'O' : 'P';
      studentMap[dayNum] = next;
      return {
        ...prev,
        [studentId]: studentMap
      };
    });
  };

  // Sabaq Column Click State
  const [sabaqTicks, setSabaqTicks] = useState<Record<string, Record<number, SabaqTickStatus>>>(() => {
    const init: Record<string, Record<number, SabaqTickStatus>> = {};
    allStudents.forEach((st) => {
      init[st.id] = {};
      for (let d = 1; d <= 31; d++) {
        init[st.id][d] = 'correct'; // all ticked by default as in screenshot
      }
    });
    return init;
  });

  const handleToggleSabaqTick = (studentId: string, dayNum: number) => {
    setSabaqTicks(prev => {
      const studentDays = prev[studentId] || {};
      const current = studentDays[dayNum] || 'none';
      let next: SabaqTickStatus = 'correct';
      if (current === 'none') next = 'correct';
      else if (current === 'correct') next = 'wrong';
      else next = 'none';

      return {
        ...prev,
        [studentId]: {
          ...studentDays,
          [dayNum]: next
        }
      };
    });
  };

  const renderSabaqTickButton = (studentId: string, dayNum: number) => {
    const status = sabaqTicks[studentId]?.[dayNum] || 'correct';

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleSabaqTick(studentId, dayNum);
        }}
        className="w-6 h-6 rounded-full border border-emerald-500 text-emerald-600 hover:scale-110 flex items-center justify-center mx-auto transition-transform cursor-pointer bg-white"
        title="Toggle Sabaq Tick"
      >
        {status === 'correct' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        {status === 'wrong' && <X className="w-3.5 h-3.5 stroke-[2.5] text-rose-500" />}
        {status === 'none' && <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
      </button>
    );
  };

  // Open modal
  const handleOpenRoznamchahModal = (student: Student, dayNum: number) => {
    setSelectedStudentForSabaq(student);
    setSelectedDayForSabaq(dayNum);

    const existing = roznamchahState[student.id]?.[dayNum];
    if (activeDepartment === 'hifz') {
      setModalSabaqQuantity(existing?.sabaqQuantity || '1 Page');
      setModalSabaqPara(existing?.sabaqPara || 'Para 11 (Surah Yunus, Ruku 4)');
      setModalSabaqMistakes(existing?.sabaqMistakes ?? 0);
      setModalSabaqListener(existing?.sabaqListener || 'Qari Saleem');
      setModalAmookhtaQuantity(existing?.amookhtaQuantity || '2 Para');
      setModalAmookhtaMistakes(existing?.amookhtaMistakes ?? 1);
      setModalAmookhtaListener(existing?.amookhtaListener || 'Maulana Rashid');
      setModalKaifiyat(existing?.kaifiyat || 'روانی و تجوید درست ہے');
      setModalGrade(existing?.grade || 'Jayyid');
      setModalRemarks(existing?.remarks || 'Recited accurately');
    } else {
      setModalSabaq(existing?.sabaq || 'تختی نمبر ۶: تنوین');
      setModalAmookhtaQuantity(existing?.amookhtaQuantity || 'گزشتہ ۲ تختیاں');
      setModalAmookhtaMistakes(existing?.amookhtaMistakes ?? 0);
      setModalAmookhtaListener(existing?.amookhtaListener || 'قاری حفظ الرحمن');
      setModalKaifiyat(existing?.kaifiyat || 'ممتاز - مخارج و تلفظ درست ہے');
      setModalGrade(existing?.grade || 'Mumtaz');
      setModalRemarks(existing?.remarks || 'تلفظ درست ہے');
    }

    setShowSabaqModal(true);
  };

  // Save Roznamchah Modal Entry
  const handleSaveRoznamchahEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForSabaq) return;

    setRoznamchahState(prev => {
      const studentMap = { ...(prev[selectedStudentForSabaq.id] || {}) };
      
      if (activeDepartment === 'hifz') {
        studentMap[selectedDayForSabaq] = {
          department: 'hifz',
          sabaqQuantity: modalSabaqQuantity,
          sabaqPara: modalSabaqPara,
          sabaqMistakes: Number(modalSabaqMistakes),
          sabaqListener: modalSabaqListener,
          amookhtaQuantity: modalAmookhtaQuantity,
          amookhtaMistakes: Number(modalAmookhtaMistakes),
          amookhtaListener: modalAmookhtaListener,
          kaifiyat: modalKaifiyat,
          grade: modalGrade,
          remarks: modalRemarks,
          sabaq: `${modalSabaqPara} (${modalSabaqQuantity})`
        };
      } else {
        studentMap[selectedDayForSabaq] = {
          department: 'nazira_qaida',
          sabaq: modalSabaq,
          amookhtaQuantity: modalAmookhtaQuantity,
          amookhtaMistakes: Number(modalAmookhtaMistakes),
          amookhtaListener: modalAmookhtaListener,
          kaifiyat: modalKaifiyat,
          grade: modalGrade,
          remarks: modalRemarks
        };
      }

      return {
        ...prev,
        [selectedStudentForSabaq.id]: studentMap
      };
    });

    db.saveRoznamchahRecord({
      studentId: selectedStudentForSabaq.id,
      madrasaId: activeMadrasa?.id || 'madrasa-1',
      date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDayForSabaq).padStart(2, '0')}`,
      department: activeDepartment,
      sabaqQuantity: activeDepartment === 'hifz' ? modalSabaqQuantity : undefined,
      sabaqPara: activeDepartment === 'hifz' ? modalSabaqPara : undefined,
      sabaqMistakes: activeDepartment === 'hifz' ? Number(modalSabaqMistakes) : undefined,
      sabaqListener: activeDepartment === 'hifz' ? modalSabaqListener : undefined,
      sabaq: activeDepartment === 'hifz' ? `${modalSabaqPara} (${modalSabaqQuantity})` : modalSabaq,
      amookhtaQuantity: modalAmookhtaQuantity,
      amookhtaMistakes: Number(modalAmookhtaMistakes),
      amookhtaListener: modalAmookhtaListener,
      kaifiyat: modalKaifiyat,
      remarks: modalRemarks,
      grade: modalGrade
    });

    const newMilestone = activeDepartment === 'hifz' ? `${modalSabaqPara} (${modalSabaqQuantity})` : modalSabaq;
    const updated = { ...selectedStudentForSabaq, presentSabaqAt: newMilestone };
    db.updateStudent(updated);

    showToast(loc(`Roznamcha entry saved for ${selectedStudentForSabaq.studentName} on Day ${selectedDayForSabaq}!`, `طالب علم ${selectedStudentForSabaq.studentNameUrdu} کا روزنامچہ تاریخ ${selectedDayForSabaq} کو محفوظ ہو گیا!`), 'success');
    setShowSabaqModal(false);
  };

  const handleSaveRegister = () => {
    showToast(loc(`Roznamcha register for ${selectedClass} saved successfully!`, `درجہ ${selectedClass} کا روزنامچہ کامیابی سے محفوظ ہو گیا!`), 'success');
  };

  const handleExportCSV = () => {
    let csv = `Madrasa Management System - ${activeDepartment === 'hifz' ? 'Hifz Roznamchah' : 'Nazira & Qaida Roznamchah'}\n`;
    csv += `Madrasa: ${activeMadrasa?.name}, Class: ${selectedClass}, Month: ${currentMonthMeta.en} ${selectedYear}\n\n`;

    const dayHeaders = monthDays.map(d => `"${d.dayNum} ${d.weekday}"`).join(',');
    csv += `S.No,Admission No,Student Name,Village / City,Present Sabaq,${dayHeaders},Monthly Ayyam Dars,Monthly Ayyam Haziri\n`;

    classStudents.forEach((st, idx) => {
      const studentDays = matrixState[st.id] || {};
      const studentRoz = roznamchahState[st.id] || {};
      const monthlyPresentCount = monthDays.filter(d => !d.isFriday && studentDays[d.dayNum] === 'P').length;
      const village = st.village || st.address.split(',')[0].trim();

      const dayCells = monthDays.map(d => {
        if (d.isFriday) return 'Off';
        return studentRoz[d.dayNum]?.grade || 'Jayyid';
      }).join(',');
      csv += `${idx + 1},${st.admissionNo},"${st.studentName} (${st.studentNameUrdu})","${village}","${st.presentSabaqAt || 'Para 11'}",${dayCells},${monthlyAyyamDars},${monthlyPresentCount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Roznamcha_${selectedClass.replace(/\s+/g, '_')}_${currentMonthMeta.en}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(loc('Roznamcha CSV exported successfully!', 'روزنامچہ فائل کامیابی سے ایکسپورٹ ہو گئی!'), 'success');
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER BANNER (Glossy White Card with Emerald Squircle) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <BookOpen className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {activeDepartment === 'hifz' 
                ? loc('Roznamchah for Hifz Students', 'روزنامچہ برائے طلبہ شعبہ حفظِ قرآن مجید') 
                : loc('Roznamchah for Nazira & Qaida', 'روزنامچہ برائے طلبہ شعبہ ناظرہ و قاعدہ')}
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-2xl">
              {activeDepartment === 'hifz'
                ? loc(
                    'Hifz daily & monthly roznamchah with sabaq, sabaq parah, errors, sabaq listener, amookhta and evaluation.',
                    'روزنامچہ برائے طلبہ حفظِ قرآن مجید: نام طالب مع وطن، مقدار سبق، پارہ سبق، اغلاط، سامع پارہ سبق، مقدارِ آموختہ، کیفیت'
                  )
                : loc(
                    'Nazira & Qaida daily roznamchah with sabaq, amookhta, errors, listener, and student evaluations.',
                    'روزنامچہ برائے طلبہ ناظرہ و قاعدہ: نام طالبِ علم مع وطن، سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت'
                  )
              }
            </p>
          </div>
        </div>

        {/* 2 Top Right Stat Cards */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-gray-50/80 rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 min-w-[150px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-500 block">
                {loc('Enrolled Students', 'کل طلبہ')}
              </span>
              <span className="text-xl font-bold text-gray-900 leading-none">
                {classStudents.length}
              </span>
            </div>
          </div>

          <div className="bg-gray-50/80 rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 min-w-[150px]">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-500 block">
                {loc('Department', 'شعبہ')}
              </span>
              <span className="text-base font-bold text-gray-900 leading-tight">
                {activeDepartment === 'hifz' ? loc('Hifz', 'حفظ') : loc('Nazira', 'ناظرہ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB STRIP & QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab 1: Monthly Roznamchah */}
          <button
            type="button"
            onClick={() => setActiveView('roznamchah')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'roznamchah'
                ? 'bg-[#047857] text-white shadow-xs'
                : 'bg-white/90 hover:bg-gray-100 text-gray-600 border border-gray-200/80 shadow-xs'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{loc('Monthly Roznamchah Register', 'ماہانہ روزنامچہ رجسٹر')}</span>
          </button>

          {/* Tab 2: Daily Class Register */}
          <button
            type="button"
            onClick={() => setActiveView('roznamchah_daily')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'roznamchah_daily'
                ? 'bg-[#047857] text-white shadow-xs'
                : 'bg-white/90 hover:bg-gray-100 text-gray-600 border border-gray-200/80 shadow-xs'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{loc('Daily Class Register', 'روزانہ تفصیلی کلاس رجسٹر')}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/90 hover:bg-gray-100 text-gray-700 border border-gray-200/80 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{loc('Export CSV', 'ایکسپورٹ CSV')}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/90 hover:bg-gray-100 text-gray-700 border border-gray-200/80 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>{loc('Print Ledger', 'پرنٹ رجسٹر')}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveRegister}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#047857] hover:bg-[#065f46] text-white shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{loc('Save Register', 'رجسٹر محفوظ کریں')}</span>
          </button>
        </div>
      </div>

      {/* 3. FILTER & SELECTOR BAR */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-4">
          {/* Class Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
              {loc('Class:', 'درجہ:')}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudentId('');
              }}
              className="px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-600 min-w-[160px]"
            >
              {madrasaClasses.map(cls => (
                <option key={cls.id} value={cls.name}>
                  {loc(cls.name, cls.nameUrdu || cls.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-700 whitespace-nowrap flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>{loc('Student:', 'طالب علم:')}</span>
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-2xl border border-amber-300 bg-amber-50/20 font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500 min-w-[260px]"
            >
              <option value="">
                {loc('-- Select Student --', '-- طالب علم منتخب کریں --')}
              </option>
              <option value="all">
                {loc('All Students Summary Matrix', 'تمام طلبہ کا خلاصہ میٹرکس')}
              </option>
              {classStudents.map((st, i) => (
                <option key={st.id} value={st.id}>
                  {i + 1}. {loc(st.studentName, st.studentNameUrdu)} ({st.admissionNo})
                </option>
              ))}
            </select>
          </div>

          {/* Template Override Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
              {loc('Template:', 'سانچہ:')}
            </span>
            <div className="bg-gray-100/80 rounded-xl p-1 flex items-center gap-1">
              {(['auto', 'hifz', 'nazira_qaida'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDepartmentOverride(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    departmentOverride === mode
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {mode === 'auto' ? loc('Auto', 'خودکار') : mode === 'hifz' ? loc('Hifz', 'حفظ') : loc('Nazira & Qaida', 'ناظرہ و قاعدہ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedMonth(prev => prev > 0 ? prev - 1 : 11)}
            className="p-2.5 rounded-2xl border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-2xl px-4 py-2 flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-xs font-bold text-gray-900">
                {currentMonthMeta.en} {selectedYear}
              </div>
              <div className="text-[10px] text-gray-500 font-medium">
                {monthlyAyyamDars} {loc('Working Days', 'ایام درس')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 0)}
            className="p-2.5 rounded-2xl border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. ACTIVE STUDENT CONTEXT BAR */}
      {selectedStudent && (
        <div className="bg-[#ebfbf3] border border-[#a7f3d0]/60 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-gray-600 font-medium">{loc('Active Class:', 'درجہ:')}</span>
              <span className="bg-white/90 text-[#065f46] font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border border-emerald-200/60">
                {selectedClass}
              </span>
            </div>

            <span className="text-gray-300">|</span>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">{loc('Selected Student:', 'طالب علم:')}</span>
              <span className="bg-amber-100/80 text-amber-900 border border-amber-300/70 font-semibold text-xs px-3 py-0.5 rounded-xl">
                {loc(selectedStudent.studentName, selectedStudent.studentNameUrdu)} ({selectedStudent.admissionNo})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevStudent}
              className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{loc('Previous Student', 'پچھلا طالب علم')}</span>
            </button>

            <span className="text-xs font-semibold text-gray-500 px-1">
              {currentStudentIndex + 1} / {classStudents.length}
            </span>

            <button
              type="button"
              onClick={handleNextStudent}
              className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <span>{loc('Next Student', 'اگلا طالب علم')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. MAIN CONTENT AREA */}
      {activeView === 'roznamchah' && (
        <div className="space-y-4">
          {selectedStudent ? (
            <div className="space-y-4">
              {/* STUDENT DOSSIER HERO CARD & 4 STAT CARDS */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#a7f3d0]/60 text-[#065f46] flex items-center justify-center font-bold text-2xl shrink-0">
                    {selectedStudent.studentName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono font-bold text-[11px] px-2.5 py-0.5 rounded-lg">
                        {selectedStudent.admissionNo}
                      </span>
                      <span className="bg-emerald-100/70 text-emerald-800 font-bold text-[11px] px-2.5 py-0.5 rounded-lg">
                        {selectedClass}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                      {loc(selectedStudent.studentName, selectedStudent.studentNameUrdu)}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1.5 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-600" />
                        <strong className="text-gray-700 font-bold">{loc('Homeland:', 'وطن:')}</strong> {selectedStudent.village || selectedStudent.address.split(',')[0]}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <strong className="text-gray-700 font-bold">{loc('Current Sabaq:', 'جاری سبق:')}</strong> {selectedStudent.presentSabaqAt || 'Para 11 (Surah Yunus, Ruku 4)'}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <strong className="text-gray-700 font-bold">{loc('Month:', 'ماہ:')}</strong> {currentMonthMeta.en} {selectedYear}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 KPI STAT CARDS */}
                {(() => {
                  const studentDays = matrixState[selectedStudent.id] || {};
                  const studentRoz = roznamchahState[selectedStudent.id] || {};
                  const monthlyPresentCount = monthDays.filter(d => !d.isFriday && studentDays[d.dayNum] === 'P').length;
                  let totalSabaqErr = 0;
                  let totalAmookhtaErr = 0;

                  monthDays.forEach(d => {
                    if (!d.isFriday && studentRoz[d.dayNum]) {
                      totalSabaqErr += (studentRoz[d.dayNum].sabaqMistakes || 0);
                      totalAmookhtaErr += (studentRoz[d.dayNum].amookhtaMistakes || 0);
                    }
                  });

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Card 1: Working Days */}
                      <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3 flex items-center gap-3 min-w-[130px]">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-gray-500 block">
                            {loc('Working Days', 'ایام درس')}
                          </span>
                          <span className="text-xl font-bold text-gray-900 leading-none">
                            {monthlyAyyamDars}
                          </span>
                        </div>
                      </div>

                      {/* Card 2: Present Days */}
                      <div className="bg-sky-50/40 border border-sky-100 rounded-2xl p-3 flex items-center gap-3 min-w-[130px]">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-gray-500 block">
                            {loc('Present Days', 'ایام حاضری')}
                          </span>
                          <span className="text-xl font-bold text-gray-900 leading-none">
                            {monthlyPresentCount}
                          </span>
                        </div>
                      </div>

                      {/* Card 3: Sabaq Errors */}
                      <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-3 flex items-center gap-3 min-w-[130px]">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                          <XCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-gray-500 block">
                            {loc('Sabaq Errors', 'اغلاط سبق')}
                          </span>
                          <span className="text-xl font-bold text-gray-900 leading-none">
                            {totalSabaqErr}
                          </span>
                        </div>
                      </div>

                      {/* Card 4: Amookhta Errors */}
                      <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-3 flex items-center gap-3 min-w-[130px]">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-gray-500 block">
                            {loc('Amookhta Errors', 'اغلاط آموختہ')}
                          </span>
                          <span className="text-xl font-bold text-gray-900 leading-none">
                            {totalAmookhtaErr}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* DAILY ROZNAMCHA LOGBOOK TABLE (Exact Columns Matching Image) */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#ebfbf3] text-[#065f46] text-[11px] font-bold tracking-wider">
                        <th className="p-3 text-center w-12 border-b border-gray-200/80">
                          {loc('S.NO', 'شمار')}
                        </th>
                        <th className="p-3 min-w-[110px] border-b border-gray-200/80">
                          {loc('DAY & DATE', 'تاریخ و دن')}
                        </th>
                        <th className="p-3 text-center w-16 border-b border-gray-200/80">
                          {loc('SABAQ', 'سبق')}
                        </th>
                        <th className="p-3 min-w-[130px] border-b border-gray-200/80">
                          {loc('SABAQ QUANTITY', 'مقدار سبق')}
                        </th>
                        <th className="p-3 min-w-[140px] border-b border-gray-200/80">
                          {loc('SABAQ PARAH', 'پارہ سبق')}
                        </th>
                        <th className="p-3 text-center w-20 border-b border-gray-200/80">
                          {loc('MISTAKES', 'اغلاط')}
                        </th>
                        <th className="p-3 min-w-[130px] border-b border-gray-200/80">
                          {loc('SABAQ LISTENER', 'سامع پارہ سبق')}
                        </th>
                        <th className="p-3 min-w-[140px] border-b border-gray-200/80">
                          {loc('AMOOKHTA QUANTITY', 'مقدارِ آموختہ')}
                        </th>
                        <th className="p-3 text-center w-20 border-b border-gray-200/80">
                          {loc('MISTAKES', 'اغلاط')}
                        </th>
                        <th className="p-3 min-w-[140px] border-b border-gray-200/80">
                          {loc('AMOOKHTA LISTENER', 'سامع آموختہ')}
                        </th>
                        <th className="p-3 min-w-[140px] text-center border-b border-gray-200/80">
                          {loc('KAIFIYAT & GRADE', 'کیفیت و درجہ')}
                        </th>
                        <th className="p-3 text-center w-16 border-b border-gray-200/80 no-print">
                          {loc('ACTIONS', 'کارروائی')}
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {monthDays.map((d, rowIdx) => {
                        const dayRecord = roznamchahState[selectedStudent.id]?.[d.dayNum];
                        const sabaqMistakes = dayRecord?.sabaqMistakes ?? 0;
                        const amookhtaMistakes = dayRecord?.amookhtaMistakes ?? 1;
                        const isEven = rowIdx % 2 === 0;

                        return (
                          <tr 
                            key={d.dayNum} 
                            className={`transition-colors hover:bg-emerald-50/20 ${isEven ? 'bg-white' : 'bg-gray-50/40'}`}
                          >
                            {/* 1. S.NO */}
                            <td className="p-3 text-center font-semibold text-gray-500 text-xs">
                              {rowIdx + 1}
                            </td>

                            {/* 2. DAY & DATE */}
                            <td className="p-3">
                              <div className="font-bold text-gray-800 text-xs">{d.weekday}</div>
                              <div className="text-[11px] text-gray-400 font-mono">{d.dateStr}</div>
                            </td>

                            {/* 3. SABAQ TICK BUTTON */}
                            <td className="p-3 text-center">
                              {renderSabaqTickButton(selectedStudent.id, d.dayNum)}
                            </td>

                            {/* 4. SABAQ QUANTITY */}
                            <td className="p-3 font-medium text-gray-700">
                              {dayRecord?.sabaqQuantity || '1 Page'}
                            </td>

                            {/* 5. SABAQ PARAH */}
                            <td className="p-3 font-medium text-gray-800 font-urdu">
                              {dayRecord?.sabaqPara || `Para 11 (${((d.dayNum % 10) + 1)} رکوع)`}
                            </td>

                            {/* 6. SABAQ MISTAKES BADGE */}
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                sabaqMistakes === 0 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {sabaqMistakes}
                              </span>
                            </td>

                            {/* 7. SABAQ LISTENER */}
                            <td className="p-3 text-gray-700 font-medium">
                              {dayRecord?.sabaqListener || 'Qari Saleem'}
                            </td>

                            {/* 8. AMOOKHTA QUANTITY */}
                            <td className="p-3 font-medium text-gray-700">
                              {dayRecord?.amookhtaQuantity || '2 Para'}
                            </td>

                            {/* 9. AMOOKHTA MISTAKES BADGE */}
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                amookhtaMistakes === 0 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {amookhtaMistakes}
                              </span>
                            </td>

                            {/* 10. AMOOKHTA LISTENER */}
                            <td className="p-3 text-gray-700 font-medium">
                              {dayRecord?.amookhtaListener || 'Maulana Rashid'}
                            </td>

                            {/* 11. KAIFIYAT & GRADE */}
                            <td className="p-3 text-center">
                              <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
                                dayRecord?.grade === 'Mumtaz' 
                                  ? 'bg-sky-100 text-sky-800' 
                                  : dayRecord?.grade === 'Hasan'
                                  ? 'bg-amber-100 text-amber-800'
                                  : dayRecord?.grade === 'Jayyid Jiddan'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {dayRecord?.grade || 'Jayyid'}
                              </span>
                            </td>

                            {/* 12. ACTIONS */}
                            <td className="p-3 text-center no-print">
                              <button
                                type="button"
                                onClick={() => handleOpenRoznamchahModal(selectedStudent, d.dayNum)}
                                className="w-8 h-8 rounded-xl border border-gray-200 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-center transition-colors mx-auto"
                                title="Edit Day Entry"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ALL STUDENTS MATRIX / SELECTOR CARDS */
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xs p-8 text-center">
              <div className="max-w-md mx-auto mb-8">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {loc('Select a Student to View Monthly Roznamchah', 'ماہانہ روزنامچہ دیکھنے کے لیے طالب علم منتخب کریں')}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {loc(
                    `Selected Class: ${selectedClass}. Click any student card below to open their full monthly ledger.`,
                    `منتخب درجہ: ${selectedClass}۔ ۳۰ روزہ روزنامچہ دیکھنے کے لیے کسی بھی طالب علم پر کلک کریں۔`
                  )}
                </p>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-left">
                {classStudents.map((st, i) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:shadow-md bg-white hover:bg-emerald-50/20 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-sm truncate">
                          {loc(st.studentName, st.studentNameUrdu)}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-emerald-700">
                          {st.admissionNo}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-600 flex items-center justify-between">
                      <span>{loc('Homeland:', 'وطن:')} {st.village || st.address.split(',')[0]}</span>
                      <span className="font-bold text-emerald-800">{st.presentSabaqAt || 'Para 11'}</span>
                    </div>
                    <button
                      type="button"
                      className="w-full mt-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs group-hover:bg-emerald-700 group-hover:text-white transition-colors text-center"
                    >
                      {loc('Open Monthly Roznamchah', 'ماہانہ روزنامچہ کھولیں')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 2: DAILY CLASS REGISTER VIEW */}
      {activeView === 'roznamchah_daily' && (
        <div className="space-y-4">
          {/* Day Selector Pill Strip */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">
                {loc('Select Working Day:', 'دن منتخب کریں:')}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {monthDays.map(d => (
                  <button
                    key={d.dayNum}
                    type="button"
                    onClick={() => setSelectedDailyDay(d.dayNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      selectedDailyDay === d.dayNum
                        ? 'bg-[#047857] text-white shadow-xs'
                        : d.isFriday
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    {d.dayNum}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-bold text-gray-600">
              {loc(`Day ${selectedDailyDay} • ${currentMonthMeta.en} ${selectedYear}`, `تاریخ ${selectedDailyDay} • ${currentMonthMeta.ur} ${selectedYear}`)}
            </div>
          </div>

          {/* Daily Students Roster Table */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#ebfbf3] text-[#065f46] text-[11px] font-bold tracking-wider">
                    <th className="p-3 text-center w-12">{loc('S.No', 'شمار')}</th>
                    <th className="p-3 w-28">{loc('Adm No', 'داخلہ نمبر')}</th>
                    <th className="p-3 min-w-[200px]">{loc('Student Name & Homeland', 'نام طالب مع وطن')}</th>
                    <th className="p-3 text-center w-24">{loc('Attendance', 'حاضری')}</th>
                    <th className="p-3 text-center w-16">{loc('Sabaq', 'سبق')}</th>
                    <th className="p-3 min-w-[130px]">{loc('Sabaq Quantity', 'مقدار سبق')}</th>
                    <th className="p-3 min-w-[140px]">{loc('Sabaq Parah', 'پارہ سبق')}</th>
                    <th className="p-3 text-center w-20">{loc('Mistakes', 'اغلاط')}</th>
                    <th className="p-3 min-w-[130px]">{loc('Sabaq Listener', 'سامع پارہ')}</th>
                    <th className="p-3 min-w-[140px]">{loc('Amookhta Quantity', 'مقدارِ آموختہ')}</th>
                    <th className="p-3 text-center w-20">{loc('Mistakes', 'اغلاط')}</th>
                    <th className="p-3 min-w-[130px]">{loc('Amookhta Listener', 'سامع آموختہ')}</th>
                    <th className="p-3 text-center min-w-[130px]">{loc('Grade', 'درجہ')}</th>
                    <th className="p-3 text-center w-16 no-print">{loc('Edit', 'عمل')}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {classStudents.map((st, idx) => {
                    const entry = roznamchahState[st.id]?.[selectedDailyDay];
                    const village = st.village || st.address.split(',')[0].trim();
                    const isEven = idx % 2 === 0;

                    return (
                      <tr 
                        key={st.id} 
                        className={`transition-colors hover:bg-emerald-50/20 ${isEven ? 'bg-white' : 'bg-gray-50/40'}`}
                      >
                        <td className="p-3 text-center font-bold text-gray-500">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-emerald-800">{st.admissionNo}</td>
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{loc(st.studentName, st.studentNameUrdu)}</div>
                          <div className="text-[11px] text-gray-500">{village}</div>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCell(st.id, selectedDailyDay)}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-transform hover:scale-105 ${
                              (matrixState[st.id]?.[selectedDailyDay] || 'P') === 'P' ? 'bg-emerald-100 text-emerald-800' :
                              (matrixState[st.id]?.[selectedDailyDay] || 'P') === 'A' ? 'bg-rose-100 text-rose-800' :
                              (matrixState[st.id]?.[selectedDailyDay] || 'P') === 'L' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {(matrixState[st.id]?.[selectedDailyDay] || 'P') === 'P' ? loc('Present', 'حاضر') :
                             (matrixState[st.id]?.[selectedDailyDay] || 'P') === 'A' ? loc('Absent', 'غیر حاضر') :
                             (matrixState[st.id]?.[selectedDailyDay] || 'P') === 'L' ? loc('Leave', 'رخصت') : '-'}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          {renderSabaqTickButton(st.id, selectedDailyDay)}
                        </td>
                        <td className="p-3 text-gray-700">{entry?.sabaqQuantity || '1 Page'}</td>
                        <td className="p-3 text-gray-800 font-urdu">{entry?.sabaqPara || 'Para 11'}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            (entry?.sabaqMistakes || 0) === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {entry?.sabaqMistakes ?? 0}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">{entry?.sabaqListener || 'Qari Saleem'}</td>
                        <td className="p-3 text-gray-700">{entry?.amookhtaQuantity || '2 Para'}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            (entry?.amookhtaMistakes || 0) === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {entry?.amookhtaMistakes ?? 1}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">{entry?.amookhtaListener || 'Maulana Rashid'}</td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                            {entry?.grade || 'Jayyid'}
                          </span>
                        </td>
                        <td className="p-3 text-center no-print">
                          <button
                            type="button"
                            onClick={() => handleOpenRoznamchahModal(st, selectedDailyDay)}
                            className="w-8 h-8 rounded-xl border border-gray-200 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center mx-auto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. ROZNAMCHA ENTRY EDIT MODAL */}
      <Modal
        isOpen={showSabaqModal}
        onClose={() => setShowSabaqModal(false)}
        title={activeDepartment === 'hifz' ? loc('Roznamchah for Hifz Students', 'روزنامچہ برائے طلبہ حفظِ قرآن مجید') : loc('Roznamchah for Nazira & Qaida', 'روزنامچہ برائے طلبہ ناظرہ و قاعدہ')}
        subtitle={`Student: ${selectedStudentForSabaq?.studentName} (${selectedStudentForSabaq?.admissionNo}) • Day ${selectedDayForSabaq}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRoznamchahEntry} className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">{loc('Student Name & Homeland', 'نام طالب مع وطن')}</span>
              <strong className="text-sm font-bold text-gray-900 block mt-0.5">
                {selectedStudentForSabaq?.studentName} ({selectedStudentForSabaq?.studentNameUrdu})
              </strong>
              <span className="text-gray-600 block text-xs mt-0.5">
                {loc('Homeland / Village:', 'وطن / گاؤں:')} <strong>{selectedStudentForSabaq?.village || selectedStudentForSabaq?.address}</strong>
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">{loc('Session Date', 'تاریخ')}</span>
              <strong className="text-gray-900 block mt-0.5">{loc(`Day ${selectedDayForSabaq} • ${currentMonthMeta.en} ${selectedYear}`, `بتاریخ ${selectedDayForSabaq} • ${currentMonthMeta.ur} ${selectedYear}`)}</strong>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
              <span className="text-xs font-bold text-gray-800 block">
                {loc('1. Daily Sabaq Details', '۱. جدید سبق کی تفصیل')}
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {loc('Sabaq Quantity', 'مقدار سبق')}
                  </label>
                  <input
                    type="text"
                    value={modalSabaqQuantity}
                    onChange={(e) => setModalSabaqQuantity(e.target.value)}
                    placeholder={loc('e.g. 1 Page', 'مثلاً ۱ صفحہ')}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {loc('Sabaq Parah / Surah', 'پارہ سبق')}
                  </label>
                  <input
                    type="text"
                    value={modalSabaqPara}
                    onChange={(e) => setModalSabaqPara(e.target.value)}
                    placeholder={loc('e.g. Para 11', 'مثلاً پارہ ۱۱')}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {loc('Sabaq Mistakes', 'اغلاط سبق')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={modalSabaqMistakes}
                    onChange={(e) => setModalSabaqMistakes(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {loc('Sabaq Listener', 'سامع پارہ سبق')}
                  </label>
                  <input
                    type="text"
                    value={modalSabaqListener}
                    onChange={(e) => setModalSabaqListener(e.target.value)}
                    placeholder={loc('e.g. Qari Saleem', 'مثلاً قاری سلیم')}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
              <span className="text-xs font-bold text-gray-800 block">
                {loc('2. Amookhta (Revision) Details', '۲. آموختہ کی تفصیل')}
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {loc('Amookhta Quantity', 'مقدارِ آموختہ')}
                  </label>
                  <input
                    type="text"
                    value={modalAmookhtaQuantity}
                    onChange={(e) => setModalAmookhtaQuantity(e.target.value)}
                    placeholder={loc('e.g. 2 Para', 'مثلاً ۲ پارہ')}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {loc('Amookhta Mistakes', 'اغلاط آموختہ')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={modalAmookhtaMistakes}
                    onChange={(e) => setModalAmookhtaMistakes(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {loc('Amookhta Listener', 'سامع آموختہ')}
                  </label>
                  <input
                    type="text"
                    value={modalAmookhtaListener}
                    onChange={(e) => setModalAmookhtaListener(e.target.value)}
                    placeholder={loc('e.g. Maulana Rashid', 'مثلاً مولانا راشد')}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Evaluation Grade', 'معیار / درجہ')}
                </label>
                <select
                  value={modalGrade}
                  onChange={(e) => setModalGrade(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Mumtaz">{loc('Mumtaz (Outstanding)', 'ممتاز (بہترین)')}</option>
                  <option value="Jayyid Jiddan">{loc('Jayyid Jiddan (Very Good)', 'جید جدا (بہت اچھا)')}</option>
                  <option value="Jayyid">{loc('Jayyid (Good)', 'جید (اچھا)')}</option>
                  <option value="Hasan">{loc('Hasan (Fair)', 'حسن')}</option>
                  <option value="Maqbool">{loc('Maqbool (Acceptable)', 'مقبول (مناسب)')}</option>
                  <option value="Daeef">{loc('Daeef (Needs Effort)', 'ضعیف (محنت طلب)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Kaifiyat / Remarks', 'کیفیت / استاد کے ریمارکس')}
                </label>
                <input
                  type="text"
                  value={modalKaifiyat}
                  onChange={(e) => setModalKaifiyat(e.target.value)}
                  placeholder={loc('e.g. Recited accurately with Tajweed', 'مثلاً روانی و تجوید درست ہے')}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-900 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowSabaqModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {loc('Cancel', 'منسوخ')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold rounded-xl bg-[#047857] hover:bg-[#065f46] text-white shadow-xs transition-colors"
            >
              {loc('Save Roznamchah', 'محفوظ کریں')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoznamchaModule;
