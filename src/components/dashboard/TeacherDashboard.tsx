import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import { 
  GraduationCap, 
  CalendarCheck, 
  BookOpen, 
  Bell, 
  Clock, 
  Save, 
  CheckCircle2, 
  Printer, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  PlusCircle,
  Award,
  Edit3,
  Calendar,
  Type,
  User,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { FontShowcaseModal } from '../Fonts/FontShowcaseModal';
import { Modal } from '../common/Modal';
import { QuranModule } from '../modules/QuranModule';

type AttendanceStatus = 'P' | 'A' | 'L' | 'O'; // Present (حاضر), Absent (غیر حاضر), Leave (رخصت), Off/Holiday (تعطیل)

interface TeacherRoznamchahData {
  department: 'hifz' | 'nazira_qaida';
  // Hifz Fields
  sabaqQuantity?: string;        // مقدار سبق
  sabaqPara?: string;            // پارہ سبق
  sabaqMistakes?: number;        // اغلاط (سبق)
  sabaqListener?: string;        // سامع پارہ سبق
  // Nazira & Common Fields
  sabaq?: string;                // سبق
  amookhtaQuantity?: string;     // مقدارِ آموختہ
  amookhtaMistakes?: number;     // اغلاط (آموختہ)
  amookhtaListener?: string;     // سامع آموختہ
  kaifiyat?: string;             // کیفیت
  grade: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbool' | 'Daeef';
  remarks?: string;
}

export const TeacherDashboard: React.FC = () => {
  const { user, activeMadrasa } = useAuth();
  const { language, t, showToast } = useTheme();

  const isUrdu = language === 'ur';
  const loc = (en: string, ur: string, _te?: string): string => {
    if (isUrdu) return ur;
    return en;
  };

  const assignedClass = user?.assignedClass || 'Hifz Section A';
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

  const [selectedClass, setSelectedClass] = useState<string>(assignedClass);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const classStudents = useMemo(() => {
    return allStudents.filter(s => s.class === selectedClass);
  }, [allStudents, selectedClass]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId || selectedStudentId === 'all') return null;
    return classStudents.find(s => s.id === selectedStudentId) || null;
  }, [classStudents, selectedStudentId]);

  const currentStudentIndex = useMemo(() => {
    return classStudents.findIndex(s => s.id === selectedStudentId);
  }, [classStudents, selectedStudentId]);

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

  const notices = db.getNotices(activeMadrasa?.id);
  const schedule = db.getSchedule();

  // Active View Tab - Defaults to Month Attendance Matrix
  const [activeTab, setActiveTab] = useState<'attendance_matrix' | 'roznamchah_matrix' | 'roznamchah_daily' | 'daily_quick' | 'quran'>('attendance_matrix');
  const [selectedDailyDay, setSelectedDailyDay] = useState<number>(4);
  const [showFontModal, setShowFontModal] = useState<boolean>(false);

  // Department Template Override
  const [departmentOverride, setDepartmentOverride] = useState<'auto' | 'hifz' | 'nazira_qaida'>('auto');
  const isAutoHifz = useMemo(() => selectedClass.toLowerCase().includes('hifz'), [selectedClass]);
  const activeDepartment: 'hifz' | 'nazira_qaida' = useMemo(() => {
    if (departmentOverride !== 'auto') return departmentOverride;
    return isAutoHifz ? 'hifz' : 'nazira_qaida';
  }, [departmentOverride, isAutoHifz]);

  // Month & Year state
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 = September (0-indexed)

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
  const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Generate Month Days
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

  // Working days in this month
  const monthlyAyyamDars = useMemo(() => {
    return monthDays.filter(d => !d.isFriday).length;
  }, [monthDays]);

  const cumulativeHijriTeachingDays = 144;

  // Attendance Matrix State
  const [matrixState, setMatrixState] = useState<Record<string, Record<number, AttendanceStatus>>>(() => {
    const initial: Record<string, Record<number, AttendanceStatus>> = {};
    classStudents.forEach((st, sIdx) => {
      initial[st.id] = {};
      for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateObj = new Date(selectedYear, selectedMonth, d);
        const isFriday = dateObj.getDay() === 5;
        if (isFriday) {
          initial[st.id][d] = 'O';
        } else if (d === 15 && sIdx % 2 === 1) {
          initial[st.id][d] = 'A';
        } else if (d === 22 && sIdx % 3 === 0) {
          initial[st.id][d] = 'L';
        } else {
          initial[st.id][d] = 'P';
        }
      }
    });
    return initial;
  });

  // Roznamchah Matrix State
  const [roznamchahState, setRoznamchahState] = useState<Record<string, Record<number, TeacherRoznamchahData>>>(() => {
    const init: Record<string, Record<number, TeacherRoznamchahData>> = {};
    const hifzParas = [14, 11, 8, 22, 18, 5, 29, 3, 16, 25];
    const listeners = ['قاری بلال احمد', 'مولانا فاروق', 'حافظ حذیفہ', 'محمد انس', 'قاری ساجد'];
    const qaidaLessons = ['تختی نمبر ۶: تنوین', 'تختی نمبر ۴: حرکات', 'تختی نمبر ۷: کھڑی حرکات', 'پارہ ۱ (سورۃ الفاتحہ)'];

    classStudents.forEach((st, sIdx) => {
      init[st.id] = {};
      const isHifz = st.class.toLowerCase().includes('hifz');
      for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateObj = new Date(selectedYear, selectedMonth, d);
        const isFriday = dateObj.getDay() === 5;
        if (!isFriday) {
          const grades: ('Mumtaz' | 'Jayyid Jiddan' | 'Jayyid')[] = ['Mumtaz', 'Jayyid Jiddan', 'Jayyid'];
          const grade = grades[(sIdx + d) % grades.length];
          const listener = listeners[(sIdx + d) % listeners.length];
          const amookhtaListener = listeners[(sIdx + d + 2) % listeners.length];

          if (isHifz) {
            const pNum = hifzParas[sIdx % hifzParas.length];
            init[st.id][d] = {
              department: 'hifz',
              sabaqQuantity: d % 3 === 0 ? 'نصف صفحہ (1/2 Page)' : '۱ صفحہ (1 Page)',
              sabaqPara: `پارہ ${pNum} (درس ${d})`,
              sabaqMistakes: (sIdx + d) % 3 === 0 ? 1 : 0,
              sabaqListener: listener,
              amookhtaQuantity: 'نصف پارہ (1/2 Para)',
              amookhtaMistakes: (sIdx + d) % 2 === 0 ? 1 : 2,
              amookhtaListener: amookhtaListener,
              kaifiyat: grade === 'Mumtaz' ? 'ممتاز (روانی و تجوید درست)' : 'جید جدا (اعادہ مطلوب)',
              grade,
              sabaq: `پارہ ${pNum}, درس ${d}`,
              remarks: 'تجوید کے قواعد کے ساتھ تلاوت کی'
            };
          } else {
            const qLesson = qaidaLessons[sIdx % qaidaLessons.length];
            init[st.id][d] = {
              department: 'nazira_qaida',
              sabaq: qLesson,
              amookhtaQuantity: 'گزشتہ ۲ تختیاں',
              amookhtaMistakes: (sIdx + d) % 4 === 0 ? 1 : 0,
              amookhtaListener: listener,
              kaifiyat: grade === 'Mumtaz' ? 'ممتاز (مخارج و تلفظ عمدہ)' : 'جید',
              grade,
              remarks: 'حروف کی پہچان درست ہے'
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
  const [modalSabaqQuantity, setModalSabaqQuantity] = useState<string>('۱ صفحہ (1 Page)');
  const [modalSabaqPara, setModalSabaqPara] = useState<string>('پارہ ۱۴ (سورۃ الحجر)');
  const [modalSabaqMistakes, setModalSabaqMistakes] = useState<number>(0);
  const [modalSabaqListener, setModalSabaqListener] = useState<string>('قاری بلال احمد');

  // Form Fields - Nazira & Common
  const [modalSabaq, setModalSabaq] = useState<string>('تختی نمبر ۶: تنوین');
  const [modalAmookhtaQuantity, setModalAmookhtaQuantity] = useState<string>('نصف پارہ (1/2 Para)');
  const [modalAmookhtaMistakes, setModalAmookhtaMistakes] = useState<number>(1);
  const [modalAmookhtaListener, setModalAmookhtaListener] = useState<string>('مولانا فاروق');
  const [modalKaifiyat, setModalKaifiyat] = useState<string>('ممتاز - روانی و تجوید درست ہے');
  const [modalGrade, setModalGrade] = useState<'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbool' | 'Daeef'>('Mumtaz');
  const [modalRemarks, setModalRemarks] = useState<string>('Recited accurately with Tajweed');
  const [showSabaqModal, setShowSabaqModal] = useState<boolean>(false);

  // Quick Daily Form State
  const [quickStudentId, setQuickStudentId] = useState<string>(classStudents[0]?.id || '');
  const [quickSabaqQuantity, setQuickSabaqQuantity] = useState<string>('۱ صفحہ (1 Page)');
  const [quickSabaqPara, setQuickSabaqPara] = useState<string>('پارہ ۱۴ (سورۃ الحجر)');
  const [quickSabaqMistakes, setQuickSabaqMistakes] = useState<number>(0);
  const [quickSabaqListener, setQuickSabaqListener] = useState<string>('قاری بلال احمد');
  const [quickAmookhtaQuantity, setQuickAmookhtaQuantity] = useState<string>('نصف پارہ (1/2 Para)');
  const [quickAmookhtaMistakes, setQuickAmookhtaMistakes] = useState<number>(1);
  const [quickAmookhtaListener, setQuickAmookhtaListener] = useState<string>('مولانا فاروق');
  const [quickKaifiyat, setQuickKaifiyat] = useState<string>('ممتاز - روانی و تجوید درست ہے');
  const [quickGrade, setQuickGrade] = useState<'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbool' | 'Daeef'>('Mumtaz');

  // Cycle Attendance status
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

  // Open Roznamchah Modal
  const handleOpenRoznamchahModal = (student: Student, dayNum: number) => {
    const existing = roznamchahState[student.id]?.[dayNum];
    setSelectedStudentForSabaq(student);
    setSelectedDayForSabaq(dayNum);

    if (activeDepartment === 'hifz') {
      setModalSabaqQuantity(existing?.sabaqQuantity || '۱ صفحہ (1 Page)');
      setModalSabaqPara(existing?.sabaqPara || student.presentSabaqAt || 'پارہ ۱۴');
      setModalSabaqMistakes(existing?.sabaqMistakes ?? 0);
      setModalSabaqListener(existing?.sabaqListener || 'قاری بلال احمد');
      setModalAmookhtaQuantity(existing?.amookhtaQuantity || 'نصف پارہ (1/2 Para)');
      setModalAmookhtaMistakes(existing?.amookhtaMistakes ?? 1);
      setModalAmookhtaListener(existing?.amookhtaListener || 'مولانا فاروق');
      setModalKaifiyat(existing?.kaifiyat || 'ممتاز - روانی و تجوید درست ہے');
      setModalGrade(existing?.grade || 'Mumtaz');
      setModalRemarks(existing?.remarks || 'ماشاء اللہ روانی عمدہ ہے');
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

    // Update central database
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

    showToast(`Roznamchah saved for ${selectedStudentForSabaq.studentName} on Day ${selectedDayForSabaq}!`, 'success');
    setShowSabaqModal(false);
  };

  // Fast entry submission
  const handleQuickSabaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = classStudents.find(s => s.id === quickStudentId);
    if (!st || !activeMadrasa || !user) return;

    const todayDay = 4;
    setRoznamchahState(prev => {
      const studentMap = { ...(prev[st.id] || {}) };
      if (activeDepartment === 'hifz') {
        studentMap[todayDay] = {
          department: 'hifz',
          sabaqQuantity: quickSabaqQuantity,
          sabaqPara: quickSabaqPara,
          sabaqMistakes: Number(quickSabaqMistakes),
          sabaqListener: quickSabaqListener,
          amookhtaQuantity: quickAmookhtaQuantity,
          amookhtaMistakes: Number(quickAmookhtaMistakes),
          amookhtaListener: quickAmookhtaListener,
          kaifiyat: quickKaifiyat,
          grade: quickGrade,
          remarks: 'Daily fast entry by Ustadh',
          sabaq: `${quickSabaqPara} (${quickSabaqQuantity})`
        };
      } else {
        studentMap[todayDay] = {
          department: 'nazira_qaida',
          sabaq: quickSabaqPara,
          amookhtaQuantity: quickAmookhtaQuantity,
          amookhtaMistakes: Number(quickAmookhtaMistakes),
          amookhtaListener: quickAmookhtaListener,
          kaifiyat: quickKaifiyat,
          grade: quickGrade,
          remarks: 'Daily fast entry by Ustadh'
        };
      }
      return {
        ...prev,
        [st.id]: studentMap
      };
    });

    const newMilestone = activeDepartment === 'hifz' ? `${quickSabaqPara} (${quickSabaqQuantity})` : quickSabaqPara;
    st.presentSabaqAt = newMilestone;
    db.updateStudent(st);

    showToast(`Daily Sabaq progress saved for ${st.studentName}!`, 'success');
  };

  // Mark all month present
  const handleMarkAllMonthPresent = () => {
    setMatrixState(prev => {
      const updated = { ...prev };
      classStudents.forEach(st => {
        updated[st.id] = {};
        monthDays.forEach(d => {
          updated[st.id][d.dayNum] = d.isFriday ? 'O' : 'P';
        });
      });
      return updated;
    });
    showToast('Updated entire month to Present (Fridays preserved as Holiday)!', 'success');
  };

  // Save register
  const handleSaveRegister = () => {
    showToast(`Register for ${assignedClass} (${currentMonthMeta.en} ${selectedYear}) saved successfully!`, 'success');
  };

  // Export Matrix to CSV
  const handleExportCSV = () => {
    let csv = `Madrasa Management System - ${activeTab === 'attendance_matrix' ? 'Attendance' : activeDepartment === 'hifz' ? 'Hifz Roznamchah' : 'Nazira & Qaida Roznamchah'}\n`;
    csv += `Madrasa: ${activeMadrasa?.name}, Class: ${assignedClass}, Month: ${currentMonthMeta.en} ${selectedYear}\n`;
    csv += `Hijri Session: Ramzan to Ramzan (رمضان تا رمضان)\n\n`;

    if (activeTab === 'roznamchah_daily') {
      csv += `Day: ${selectedDailyDay} ${currentMonthMeta.en} ${selectedYear}\n`;
      if (activeDepartment === 'hifz') {
        csv += `S.No,Admission No,Student Name with Homeland (نام طالب مع وطن),Sabaq Quantity (مقدار سبق),Sabaq Para (پارہ سبق),Sabaq Mistakes (اغلاط),Sabaq Listener (سامع پارہ سبق),Amookhta Quantity (مقدارِ آموختہ),Amookhta Mistakes (اغلاط),Amookhta Listener (سامع آموختہ),Kaifiyat & Grade (کیفیت)\n`;
        classStudents.forEach((st, idx) => {
          const entry = roznamchahState[st.id]?.[selectedDailyDay];
          const village = st.village || st.address.split(',')[0].trim();
          const nameWithHomeland = `"${st.studentName} (${st.studentNameUrdu}) - ${village}"`;
          csv += `${idx + 1},${st.admissionNo},${nameWithHomeland},"${entry?.sabaqQuantity || '1 Page'}","${entry?.sabaqPara || 'Para 14'}",${entry?.sabaqMistakes ?? 0},"${entry?.sabaqListener || 'Qari Bilal'}","${entry?.amookhtaQuantity || '1/2 Para'}",${entry?.amookhtaMistakes ?? 1},"${entry?.amookhtaListener || 'Ustadh Farooq'}","${entry?.kaifiyat || 'Mumtaz'}"\n`;
        });
      } else {
        csv += `S.No,Admission No,Student Name with Homeland (نام طالبِ علم مع وطن),Sabaq (سبق),Amookhta Quantity (مقدارِ آموختہ),Mistakes (اغلاط),Amookhta Listener (سامع آموختہ),Kaifiyat & Grade (کیفیت)\n`;
        classStudents.forEach((st, idx) => {
          const entry = roznamchahState[st.id]?.[selectedDailyDay];
          const village = st.village || st.address.split(',')[0].trim();
          const nameWithHomeland = `"${st.studentName} (${st.studentNameUrdu}) - ${village}"`;
          csv += `${idx + 1},${st.admissionNo},${nameWithHomeland},"${entry?.sabaq || 'Takhti 6'}","${entry?.amookhtaQuantity || '2 Takhtis'}",${entry?.amookhtaMistakes ?? 0},"${entry?.amookhtaListener || 'Qari Hifzur Rahman'}","${entry?.kaifiyat || 'Mumtaz'}"\n`;
        });
      }
    } else {
      const dayHeaders = monthDays.map(d => `"${d.dayNum} ${d.weekday}"`).join(',');
      const isRoz = activeTab === 'roznamchah_matrix';
      csv += `S.No,Admission No,Student Name,Village / City,${isRoz ? 'Present Sabaq,' : ''}${dayHeaders},Monthly Ayyam Dars,Monthly Ayyam Haziri,Yearly Ayyam Dars (Ramzan to Ramzan),Yearly Ayyam Haziri (Ramzan to Ramzan),Cumulative %\n`;

      classStudents.forEach((st, idx) => {
        const studentDays = matrixState[st.id] || {};
        const studentRoz = roznamchahState[st.id] || {};
        const monthlyPresentCount = monthDays.filter(d => !d.isFriday && studentDays[d.dayNum] === 'P').length;
        const cumulativeYearPresent = Math.max(0, st.totalPresentsYearly || (cumulativeHijriTeachingDays - 5));
        const percentage = ((cumulativeYearPresent / cumulativeHijriTeachingDays) * 100).toFixed(1);
        const village = st.village || st.address.split(',')[0].trim();

        if (isRoz) {
          const dayCells = monthDays.map(d => {
            if (d.isFriday) return 'Off';
            return studentRoz[d.dayNum]?.grade || 'Mumtaz';
          }).join(',');
          csv += `${idx + 1},${st.admissionNo},"${st.studentName} (${st.studentNameUrdu})","${village}","${st.presentSabaqAt}",${dayCells},${monthlyAyyamDars},${monthlyPresentCount},${cumulativeHijriTeachingDays},${cumulativeYearPresent},${percentage}%\n`;
        } else {
          const dayCells = monthDays.map(d => studentDays[d.dayNum] || (d.isFriday ? 'O' : 'P')).join(',');
          csv += `${idx + 1},${st.admissionNo},"${st.studentName} (${st.studentNameUrdu})","${village}",${dayCells},${monthlyAyyamDars},${monthlyPresentCount},${cumulativeHijriTeachingDays},${cumulativeYearPresent},${percentage}%\n`;
        }
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTab}_${assignedClass.replace(/\s+/g, '_')}_${currentMonthMeta.en}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Teacher Header Banner */}
      <div className="rounded-3xl bg-[#123B63] p-6 text-white shadow-m3-3 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wide">
                Teacher Dashboard &bull; استاد ڈیش بورڈ
              </span>
              <span className="text-xs text-emerald-200">
                Assigned Class: <strong>{assignedClass}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h2>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl font-urdu text-sm">
              {activeTab === 'attendance_matrix'
                ? 'ماہانہ رجسٹر حاضری طلبہ: سلسلہ وار حاضری برائے تعلیمی سال رمضان المبارک تا رمضان المبارک مع نام طالب علم، وطن، ایامِ درس و ایامِ حاضری'
                : activeDepartment === 'hifz'
                  ? 'روزنامچہ برائے طلبہ حفظِ قرآن: نام طالب مع وطن، مقدار سبق، پارہ سبق، اغلاط، سامع پارہ سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت'
                  : 'روزنامچہ برائے طلبہ ناظرہ و قاعدہ: نام طالبِ علم مع وطن، سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت'
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Class Roll</span>
              <span className="text-2xl font-black">{classStudents.length} Students</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">تعلیمی سال</span>
              <span className="text-sm font-black text-amber-200">رمضان تا رمضان</span>
            </div>
            <button
              type="button"
              onClick={() => setShowFontModal(true)}
              className="px-3 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-center transition-all flex flex-col items-center justify-center cursor-pointer"
              title="Typography & Fonts Settings (خطاطی اور رسم الخط ترتیبات)"
            >
              <Type className="w-4 h-4 text-amber-300 mb-0.5" />
              <span className="text-[10px] uppercase font-bold text-emerald-200">Fonts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-m3-outline-variant/30 pb-3 no-print">
        <div className="flex flex-wrap gap-2">
          
          {/* Tab 1: Attendance Matrix (Default View) */}
          <button
            type="button"
            onClick={() => setActiveTab('attendance_matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'attendance_matrix'
                ? 'bg-emerald-800 text-white shadow-m3-1'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>Attendance Matrix (حاضری میٹرکس - ماہانہ رجسٹر)</span>
          </button>

          {/* Tab 2: Roznamchah Matrix */}
          <button
            type="button"
            onClick={() => setActiveTab('roznamchah_matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'roznamchah_matrix'
                ? 'bg-emerald-800 text-white shadow-m3-1'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Roznamchah Matrix (روزنامچہ میٹرکس)</span>
          </button>

          {/* Tab 3: Daily Detailed Register */}
          <button
            type="button"
            onClick={() => setActiveTab('roznamchah_daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'roznamchah_daily'
                ? 'bg-emerald-800 text-white shadow-m3-1'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Daily Detailed Register (روزانہ تفصیلی روزنامچہ)</span>
          </button>

          {/* Tab 4: Daily Fast Entry */}
          <button
            type="button"
            onClick={() => setActiveTab('daily_quick')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'daily_quick'
                ? 'bg-emerald-800 text-white shadow-m3-1'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Daily Fast Entry (روزانہ تیز اندراج)</span>
          </button>

          {/* Tab 5: Holy Quran */}
          <button
            type="button"
            onClick={() => setActiveTab('quran')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'quran'
                ? 'bg-emerald-800 text-white shadow-m3-1'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="font-urdu text-sm">القرآن الكريم (Holy Quran & Sabaq)</span>
          </button>
        </div>

        {/* Right side buttons */}
        {activeTab !== 'daily_quick' && activeTab !== 'quran' && (
          <div className="flex items-center gap-2">
            {activeTab === 'attendance_matrix' && (
              <button
                type="button"
                onClick={handleMarkAllMonthPresent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 hover:bg-emerald-100"
                title="Mark all non-holiday days as Present"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Month Present</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-700 text-xs font-bold border border-gray-300 hover:bg-gray-50"
            >
              <Download className="w-3.5 h-3.5 text-m3-primary" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-700 text-xs font-bold border border-gray-300 hover:bg-gray-50"
            >
              <Printer className="w-3.5 h-3.5 text-m3-primary" />
              <span>Print Register</span>
            </button>

            <button
              type="button"
              onClick={handleSaveRegister}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-m3-primary text-white text-xs font-bold shadow-xs hover:bg-opacity-90"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Submit</span>
            </button>
          </div>
        )}
      </div>

      {/* Date / Month Selectors for Registers */}
      {activeTab !== 'daily_quick' && activeTab !== 'quran' && (
        <div className="bg-white p-4 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
                {loc('Class:', 'درجہ:', 'తరగతి:')}
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudentId('');
                }}
                className="px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white font-bold text-gray-900 focus:ring-2 focus:ring-emerald-700 min-w-[170px]"
              >
                {madrasaClasses.map(cls => (
                  <option key={cls.id} value={cls.name}>
                    {loc(cls.name, cls.nameUrdu || cls.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Selector - prominent in Roznamchah tab */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-2xl border transition-all ${
              activeTab === 'roznamchah_matrix'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <label className="text-xs font-bold text-gray-800 whitespace-nowrap flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span>{loc('Student:', 'طالب علم:', 'విద్యార్థి:')}</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-xl border border-gray-300 bg-white font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 min-w-[190px]"
              >
                <option value="">
                  {loc('-- Select Student --', '-- طالب علم منتخب کریں --', '-- విద్యార్థిని ఎంచుకోండి --')}
                </option>
                <option value="all">
                  {loc('All Students Summary Matrix', 'تمام طلبہ کا خلاصہ میٹرکس', 'అందరి విద్యార్థుల సారాంశం')}
                </option>
                {classStudents.map((st, i) => (
                  <option key={st.id} value={st.id}>
                    {i + 1}. {loc(st.studentName, st.studentNameUrdu, st.studentName)} ({st.admissionNo}) {st.village ? `• ${st.village}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'roznamchah_daily' && (
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-2xl border border-emerald-200">
                <Calendar className="w-4 h-4 text-emerald-800" />
                <label className="text-xs font-bold text-emerald-900">{loc('Day:', 'تاریخ:', 'తేదీ:')}</label>
                <select
                  value={selectedDailyDay}
                  onChange={(e) => setSelectedDailyDay(Number(e.target.value))}
                  className="px-2 py-1 text-xs rounded-lg border border-emerald-300 bg-white font-bold text-emerald-950"
                >
                  {monthDays.map(d => (
                    <option key={d.dayNum} value={d.dayNum}>
                      {loc(`Day ${d.dayNum} (${d.weekday})`, `تاریخ ${d.dayNum} (${d.weekday})`, `తేదీ ${d.dayNum} (${d.weekday})`)} {d.isFriday ? `• ${loc('Friday', 'جمعہ تعطیل', 'శుక్రవారం సెలవు')}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Department Template Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border text-xs">
              <span className="text-[11px] font-bold text-gray-500 px-2">
                {loc('Template:', 'شعبہ:', 'టెంప్లేట్:')}
              </span>
              <button
                type="button"
                onClick={() => setDepartmentOverride('auto')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  departmentOverride === 'auto' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                {loc('Auto', 'خودکار', 'ఆటో')}
              </button>
              <button
                type="button"
                onClick={() => setDepartmentOverride('hifz')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  activeDepartment === 'hifz' && departmentOverride !== 'auto' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                {loc('Hifz', 'حفظِ قرآن', 'హిఫ్జ్')}
              </button>
              <button
                type="button"
                onClick={() => setDepartmentOverride('nazira_qaida')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  activeDepartment === 'nazira_qaida' && departmentOverride !== 'auto' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                {loc('Nazira & Qaida', 'ناظرہ و قاعدہ', 'నాజిరా & ఖైదా')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedMonth(prev => prev > 0 ? prev - 1 : 11)}
              className="p-1.5 rounded-xl border hover:bg-gray-50 text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-4 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="font-bold text-xs text-emerald-950 block">
                {currentMonthMeta.en} {selectedYear} &bull; {currentMonthMeta.ur}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {monthlyAyyamDars} ایامِ درس &bull; {totalDaysInMonth - monthlyAyyamDars} ایامِ تعطیل
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 0)}
              className="p-1.5 rounded-xl border hover:bg-gray-50 text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: DAILY DETAILED ROZNAMCHAH REGISTER (Exact User Columns) */}
      {activeTab === 'roznamchah_daily' && (
        <div className="bg-white rounded-3xl border border-m3-outline-variant/40 shadow-m3-2 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-emerald-950 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs">
                {activeDepartment === 'hifz' ? 'روزنامچہ برائے طلبہ حفظِ قرآن مجید' : 'روزنامچہ برائے طلبہ ناظرہ و قاعدہ'}
              </span>
              <span className="text-xs text-emerald-200 font-semibold">
                Class: {assignedClass} &bull; Day {selectedDailyDay} ({currentMonthMeta.en} {selectedYear})
              </span>
            </div>
            <span className="text-xs text-amber-300 font-bold font-urdu">تعلیمی سال: رمضان المبارک تا رمضان المبارک</span>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                {activeDepartment === 'hifz' ? (
                  // HIFZ COLUMNS:
                  // نام طالب مع وطن، مقدار سبق، پارہ سبق، اغلاط، سامع پارہ سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت
                  <tr className="bg-emerald-900 text-white text-[11px]">
                    <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold uppercase sticky left-0 bg-emerald-900 z-20">
                      S.No<br /><span className="text-[10px] font-urdu font-normal">شمار</span>
                    </th>
                    <th className="p-3 w-24 border-r border-emerald-800 font-bold uppercase sticky left-12 bg-emerald-900 z-20">
                      Adm No<br /><span className="text-[10px] font-urdu font-normal">داخلہ نمبر</span>
                    </th>
                    <th className="p-3 min-w-[200px] border-r border-emerald-800 font-bold uppercase sticky left-36 bg-emerald-900 z-20 shadow-md">
                      نام طالب مع وطن<br />
                      <span className="text-[10px] font-normal opacity-80">Student Name & Homeland</span>
                    </th>
                    <th className="p-3 min-w-[130px] border-r border-emerald-800 font-bold uppercase bg-emerald-950 text-amber-200">
                      مقدار سبق<br />
                      <span className="text-[10px] font-normal opacity-80">Sabaq Quantity</span>
                    </th>
                    <th className="p-3 min-w-[140px] border-r border-emerald-800 font-bold uppercase bg-emerald-950 text-amber-200">
                      پارہ سبق<br />
                      <span className="text-[10px] font-normal opacity-80">Sabaq Parah</span>
                    </th>
                    <th className="p-3 text-center w-16 border-r border-emerald-800 font-bold uppercase bg-rose-950 text-rose-200">
                      اغلاط<br />
                      <span className="text-[10px] font-normal opacity-80">Errors</span>
                    </th>
                    <th className="p-3 min-w-[130px] border-r border-emerald-800 font-bold uppercase">
                      سامع پارہ سبق<br />
                      <span className="text-[10px] font-normal opacity-80">Sabaq Listener</span>
                    </th>
                    <th className="p-3 min-w-[130px] border-r border-emerald-800 font-bold uppercase bg-emerald-950 text-teal-200">
                      مقدارِ آموختہ<br />
                      <span className="text-[10px] font-normal opacity-80">Amookhta Quantity</span>
                    </th>
                    <th className="p-3 text-center w-16 border-r border-emerald-800 font-bold uppercase bg-rose-950 text-rose-200">
                      اغلاط<br />
                      <span className="text-[10px] font-normal opacity-80">Errors</span>
                    </th>
                    <th className="p-3 min-w-[130px] border-r border-emerald-800 font-bold uppercase">
                      سامع آموختہ<br />
                      <span className="text-[10px] font-normal opacity-80">Amookhta Listener</span>
                    </th>
                    <th className="p-3 min-w-[160px] border-r border-emerald-800 font-bold uppercase bg-emerald-950 text-amber-300">
                      کیفیت<br />
                      <span className="text-[10px] font-normal opacity-80">Kaifiyat & Grade</span>
                    </th>
                    <th className="p-3 text-center w-16 bg-emerald-900 font-bold uppercase no-print">
                      عمل<br />
                      <span className="text-[10px] font-normal opacity-80">Edit</span>
                    </th>
                  </tr>
                ) : (
                  // NAZIRA & QAIDA COLUMNS:
                  // نام طالبِ علم مع وطن، سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت
                  <tr className="bg-emerald-900 text-white text-[11px]">
                    <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold uppercase sticky left-0 bg-emerald-900 z-20">
                      S.No<br /><span className="text-[10px] font-urdu font-normal">شمار</span>
                    </th>
                    <th className="p-3 w-24 border-r border-emerald-800 font-bold uppercase sticky left-12 bg-emerald-900 z-20">
                      Adm No<br /><span className="text-[10px] font-urdu font-normal">داخلہ نمبر</span>
                    </th>
                    <th className="p-3 min-w-[220px] border-r border-emerald-800 font-bold uppercase sticky left-36 bg-emerald-900 z-20 shadow-md">
                      نام طالبِ علم مع وطن<br />
                      <span className="text-[10px] font-normal opacity-80">Student Name & Homeland</span>
                    </th>
                    <th className="p-3 min-w-[180px] border-r border-emerald-800 font-bold uppercase bg-emerald-950 text-amber-200">
                      سبق<br />
                      <span className="text-[10px] font-normal opacity-80">Sabaq (Lesson / Takhti)</span>
                    </th>
                    <th className="p-3 min-w-[160px] border-r border-emerald-800 font-bold uppercase bg-emerald-950 text-teal-200">
                      مقدارِ آموختہ<br />
                      <span className="text-[10px] font-normal opacity-80">Amookhta Quantity</span>
                    </th>
                    <th className="p-3 text-center w-16 border-r border-emerald-800 font-bold uppercase bg-rose-950 text-rose-200">
                      اغلاط<br />
                      <span className="text-[10px] font-normal opacity-80">Errors</span>
                    </th>
                    <th className="p-3 min-w-[140px] border-r border-emerald-800 font-bold uppercase">
                      سامع آموختہ<br />
                      <span className="text-[10px] font-normal opacity-80">Amookhta Listener</span>
                    </th>
                    <th className="p-3 min-w-[180px] border-r border-emerald-800 font-bold uppercase bg-emerald-950 text-amber-300">
                      کیفیت<br />
                      <span className="text-[10px] font-normal opacity-80">Kaifiyat & Grade</span>
                    </th>
                    <th className="p-3 text-center w-16 bg-emerald-900 font-bold uppercase no-print">
                      عمل<br />
                      <span className="text-[10px] font-normal opacity-80">Edit</span>
                    </th>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-gray-100">
                {classStudents.map((st, idx) => {
                  const entry = roznamchahState[st.id]?.[selectedDailyDay];
                  const village = st.village || st.address.split(',')[0].trim();
                  const isEven = idx % 2 === 0;

                  return (
                    <tr key={st.id} className={`hover:bg-amber-50/40 transition-colors ${isEven ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className={`p-3 text-center font-mono font-bold text-gray-700 border-r sticky left-0 z-10 ${isEven ? 'bg-white' : 'bg-gray-50'}`}>{idx + 1}</td>
                      <td className={`p-3 font-mono font-bold text-emerald-900 border-r sticky left-12 z-10 whitespace-nowrap ${isEven ? 'bg-white' : 'bg-gray-50'}`}>{st.admissionNo}</td>
                      <td className={`p-3 border-r sticky left-36 z-10 shadow-sm ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
                        <div className="font-bold text-gray-900">{st.studentName}</div>
                        <div className="text-xs font-urdu text-emerald-800 font-bold">{st.studentNameUrdu}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 font-urdu">
                          <span className="text-amber-800 font-bold">وطن:</span> {village}
                        </div>
                      </td>

                      {activeDepartment === 'hifz' ? (
                        <>
                          <td className="p-3 border-r font-medium text-gray-900 font-urdu">{entry?.sabaqQuantity || '۱ صفحہ (1 Page)'}</td>
                          <td className="p-3 border-r font-bold text-emerald-950 font-urdu">{entry?.sabaqPara || st.presentSabaqAt || 'پارہ ۱۴'}</td>
                          <td className="p-3 text-center border-r font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${(entry?.sabaqMistakes || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {entry?.sabaqMistakes ?? 0}
                            </span>
                          </td>
                          <td className="p-3 border-r text-gray-700 font-urdu">{entry?.sabaqListener || 'قاری بلال احمد'}</td>
                          <td className="p-3 border-r font-medium text-gray-900 font-urdu">{entry?.amookhtaQuantity || 'نصف پارہ (1/2 Para)'}</td>
                          <td className="p-3 text-center border-r font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${(entry?.amookhtaMistakes || 0) <= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {entry?.amookhtaMistakes ?? 1}
                            </span>
                          </td>
                          <td className="p-3 border-r text-gray-700 font-urdu">{entry?.amookhtaListener || 'مولانا فاروق'}</td>
                          <td className="p-3 border-r">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              entry?.grade === 'Mumtaz' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {entry?.grade || 'Mumtaz'}
                            </span>
                            <span className="text-[11px] text-gray-600 font-urdu block mt-0.5">{entry?.kaifiyat || 'روانی عمدہ'}</span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 border-r font-bold text-emerald-950 font-urdu">{entry?.sabaq || 'تختی نمبر ۶: تنوین'}</td>
                          <td className="p-3 border-r font-medium text-gray-900 font-urdu">{entry?.amookhtaQuantity || 'گزشتہ ۲ تختیاں'}</td>
                          <td className="p-3 text-center border-r font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${(entry?.amookhtaMistakes || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {entry?.amookhtaMistakes ?? 0}
                            </span>
                          </td>
                          <td className="p-3 border-r text-gray-700 font-urdu">{entry?.amookhtaListener || 'قاری حفظ الرحمن'}</td>
                          <td className="p-3 border-r">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {entry?.grade || 'Mumtaz'}
                            </span>
                            <span className="text-[11px] text-gray-600 font-urdu block mt-0.5">{entry?.kaifiyat || 'مخارج درست'}</span>
                          </td>
                        </>
                      )}

                      <td className="p-3 text-center no-print">
                        <button
                          type="button"
                          onClick={() => handleOpenRoznamchahModal(st, selectedDailyDay)}
                          className="p-1.5 rounded-lg border hover:bg-emerald-50 text-gray-700 hover:text-emerald-900"
                          title="Edit Roznamchah Record"
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
      )}

      {/* TAB 2: ROZNAMCHAH MATRIX (Visible when Selected Class and Selected Student) */}
      {activeTab === 'roznamchah_matrix' && (
        <div className="space-y-4">
          {/* Subheader / Status Bar */}
          <div className="bg-emerald-900/10 p-3.5 rounded-2xl border border-emerald-800/20 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-bold text-gray-800">
                {loc('Active Class:', 'منتخب درجہ:', 'ఎంచుకున్న తరగతి:')}
              </span>
              <span className="font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 font-mono">
                {selectedClass}
              </span>
              <span className="text-gray-400">|</span>
              <span className="font-bold text-gray-800">
                {loc('Selected Student:', 'منتخب طالب علم:', 'ఎంచుకున్న విద్యార్థి:')}
              </span>
              {selectedStudent ? (
                <span className="font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-950">
                  {loc(selectedStudent.studentName, selectedStudent.studentNameUrdu, selectedStudent.studentName)} ({selectedStudent.admissionNo})
                </span>
              ) : (
                <span className="italic text-gray-500">
                  {selectedStudentId === 'all' 
                    ? loc('All Students Matrix Mode', 'تمام طلبہ کا خلاصہ میٹرکس', 'అందరి విద్యార్థుల సారాంశం')
                    : loc('None Selected - Select from dropdown or click a student below', 'کوئی طالب علم منتخب نہیں - نیچے سے منتخب کریں', 'ఎవరూ ఎంపిక కాలేదు')}
                </span>
              )}
            </div>

            {selectedStudent && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevStudent}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-gray-100 border text-gray-700 font-bold shadow-xs transition-colors"
                  title="Previous Student"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{loc('Previous Student', 'سابقہ طالب علم', 'మునుపటి విద్యార్థి')}</span>
                </button>
                <span className="px-2 font-mono font-bold text-gray-600">
                  {currentStudentIndex + 1} / {classStudents.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextStudent}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-gray-100 border text-gray-700 font-bold shadow-xs transition-colors"
                  title="Next Student"
                >
                  <span>{loc('Next Student', 'اگلا طالب علم', 'తదుపరి విద్యార్థి')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* CASE 1: INDIVIDUAL STUDENT MONTHLY ROZNAMCHA (When a Student is Selected) */}
          {selectedStudent ? (
            <div className="bg-white rounded-3xl border border-m3-outline-variant/40 shadow-m3-2 overflow-hidden animate-in fade-in duration-200">
              
              {/* Student Roznamcha Header Banner */}
              <div className="bg-[#123B63] text-white p-5 border-b border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student Credentials */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-xl shadow-inner">
                      {selectedStudent.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/15 text-[11px] font-mono font-bold text-amber-200">
                          {selectedStudent.admissionNo}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-700/80 text-[11px] font-bold text-white">
                          {selectedClass}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-600/60 text-[11px] font-bold text-amber-100">
                          {activeDepartment === 'hifz' ? loc('Hifz Section', 'شعبہ حفظِ قرآن', 'హిఫ్జ్ విభాగం') : loc('Nazira & Qaida', 'شعبہ ناظرہ و قاعدہ', 'నాజిరా & ఖైదా')}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black mt-1">
                        {loc(selectedStudent.studentName, selectedStudent.studentNameUrdu, selectedStudent.studentName)}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200/90 mt-1">
                        <span>
                          <strong className="text-amber-300 font-urdu">{loc('Homeland / Village:', 'وطن / گاؤں:', 'స్వస్థలం/గ్రామం:')}</strong>{' '}
                          {selectedStudent.village || selectedStudent.address.split(',')[0]}
                        </span>
                        <span>&bull;</span>
                        <span>
                          <strong className="text-amber-300 font-urdu">{loc('Current Sabaq:', 'جاری سبق:', 'ప్రస్తుత సబక్:')}</strong>{' '}
                          {selectedStudent.presentSabaqAt || (activeDepartment === 'hifz' ? 'پارہ ۱۴' : 'تختی نمبر ۶')}
                        </span>
                        <span>&bull;</span>
                        <span>
                          <strong className="text-amber-300 font-urdu">{loc('Month:', 'ماہ:', 'నెల:')}</strong>{' '}
                          {loc(
                            `${currentMonthMeta.en} ${selectedYear}`,
                            `${currentMonthMeta.ur} ${selectedYear}`,
                            `${currentMonthMeta.en} ${selectedYear}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Scorecard Pills */}
                  {(() => {
                    const studentDays = matrixState[selectedStudent.id] || {};
                    const studentRoz = roznamchahState[selectedStudent.id] || {};
                    const monthlyPresentCount = monthDays.filter(d => !d.isFriday && studentDays[d.dayNum] === 'P').length;
                    let totalSabaqErr = 0;
                    let totalAmookhtaErr = 0;
                    let mumtazDays = 0;

                    monthDays.forEach(d => {
                      if (!d.isFriday && studentRoz[d.dayNum]) {
                        totalSabaqErr += (studentRoz[d.dayNum].sabaqMistakes || 0);
                        totalAmookhtaErr += (studentRoz[d.dayNum].amookhtaMistakes || 0);
                        if (studentRoz[d.dayNum].grade === 'Mumtaz') mumtazDays++;
                      }
                    });

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white/10 p-2.5 rounded-2xl border border-white/15">
                          <span className="text-[10px] text-emerald-300 block">{loc('Working Days', 'ایام درس', 'పని దినాలు')}</span>
                          <span className="text-lg font-black">{monthlyAyyamDars}</span>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-2xl border border-white/15">
                          <span className="text-[10px] text-emerald-300 block">{loc('Present Days', 'ایام حاضری', 'హాజరు దినాలు')}</span>
                          <span className="text-lg font-black text-emerald-200">{monthlyPresentCount}</span>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-2xl border border-white/15">
                          <span className="text-[10px] text-rose-300 block">
                            {activeDepartment === 'hifz' ? loc('Sabaq Errors', 'اغلاط سبق', 'సబక్ తప్పులు') : loc('Errors', 'اغلاط', 'తప్పులు')}
                          </span>
                          <span className="text-lg font-black text-rose-200">{totalSabaqErr}</span>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-2xl border border-white/15">
                          <span className="text-[10px] text-amber-300 block">{loc('Amookhta Errors', 'اغلاط آموختہ', 'ఆమూఖ్తా తప్పులు')}</span>
                          <span className="text-lg font-black text-amber-200">{totalAmookhtaErr}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 30-Day Roznamchah Table For Selected Student */}
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left border-collapse text-xs">
                  {/* Table Header: Pure Hifz vs Nazira & Qaida Columns */}
                  <thead>
                    {activeDepartment === 'hifz' ? (
                      /* HIFZ COLUMNS:
                         (شمار، تاریخ و دن، حاضری، مقدار سبق، پارہ سبق، اغلاط، سامع پارہ سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت، کارروائی)
                      */
                      <tr className="bg-emerald-950 text-white text-[11px]">
                        <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold uppercase sticky left-0 bg-emerald-950 z-20">
                          {loc('S.No', 'شمار', 'వ.సంఖ్య')}
                        </th>
                        <th className="p-3 min-w-[110px] border-r border-emerald-800 font-bold uppercase sticky left-12 bg-emerald-950 z-20">
                          {loc('Day & Date', 'تاریخ و دن', 'తేదీ & వారం')}
                        </th>
                        <th className="p-3 text-center w-20 border-r border-emerald-800 font-bold uppercase bg-emerald-900">
                          {loc('Attendance', 'حاضری', 'హాజరు')}
                        </th>
                        <th className="p-3 min-w-[130px] border-r border-emerald-800 font-bold uppercase bg-emerald-900/90 text-amber-200">
                          {loc('Sabaq Quantity', 'مقدار سبق', 'సబక్ పరిమాణం')}
                        </th>
                        <th className="p-3 min-w-[150px] border-r border-emerald-800 font-bold uppercase bg-emerald-900/90 text-amber-200">
                          {loc('Sabaq Parah', 'پارہ سبق', 'పారా సబక్')}
                        </th>
                        <th className="p-3 text-center w-16 border-r border-emerald-800 font-bold uppercase bg-rose-950 text-rose-200">
                          {loc('Mistakes', 'اغلاط', 'తప్పులు')}
                        </th>
                        <th className="p-3 min-w-[130px] border-r border-emerald-800 font-bold uppercase">
                          {loc('Sabaq Listener', 'سامع پارہ سبق', 'వినేవారు')}
                        </th>
                        <th className="p-3 min-w-[130px] border-r border-emerald-800 font-bold uppercase bg-teal-950 text-teal-200">
                          {loc('Amookhta Quantity', 'مقدارِ آموختہ', 'ఆమూఖ్తా పరిమాణం')}
                        </th>
                        <th className="p-3 text-center w-16 border-r border-emerald-800 font-bold uppercase bg-rose-950 text-rose-200">
                          {loc('Mistakes', 'اغلاط', 'తప్పులు')}
                        </th>
                        <th className="p-3 min-w-[130px] border-r border-emerald-800 font-bold uppercase">
                          {loc('Amookhta Listener', 'سامع آموختہ', 'వినేవారు')}
                        </th>
                        <th className="p-3 min-w-[160px] border-r border-emerald-800 font-bold uppercase bg-amber-950 text-amber-200">
                          {loc('Kaifiyat & Grade', 'کیفیت و درجہ', 'గ్రేడ్')}
                        </th>
                        <th className="p-3 text-center w-16 bg-emerald-950 font-bold uppercase no-print">
                          {loc('Action', 'کارروائی', 'సవరించు')}
                        </th>
                      </tr>
                    ) : (
                      /* NAZIRA & QAIDA COLUMNS:
                         (شمار، تاریخ و دن، حاضری، سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت، کارروائی)
                      */
                      <tr className="bg-emerald-950 text-white text-[11px]">
                        <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold uppercase sticky left-0 bg-emerald-950 z-20">
                          {loc('S.No', 'شمار', 'వ.సంఖ్య')}
                        </th>
                        <th className="p-3 min-w-[110px] border-r border-emerald-800 font-bold uppercase sticky left-12 bg-emerald-950 z-20">
                          {loc('Day & Date', 'تاریخ و دن', 'తేదీ & వారం')}
                        </th>
                        <th className="p-3 text-center w-20 border-r border-emerald-800 font-bold uppercase bg-emerald-900">
                          {loc('Attendance', 'حاضری', 'హాజరు')}
                        </th>
                        <th className="p-3 min-w-[180px] border-r border-emerald-800 font-bold uppercase bg-emerald-900/90 text-amber-200">
                          {loc('Sabaq (Lesson)', 'سبق', 'సబక్')}
                        </th>
                        <th className="p-3 min-w-[150px] border-r border-emerald-800 font-bold uppercase bg-teal-950 text-teal-200">
                          {loc('Amookhta Quantity', 'مقدارِ آموختہ', 'ఆమూఖ్తా పరిమాణం')}
                        </th>
                        <th className="p-3 text-center w-16 border-r border-emerald-800 font-bold uppercase bg-rose-950 text-rose-200">
                          {loc('Mistakes', 'اغلاط', 'తప్పులు')}
                        </th>
                        <th className="p-3 min-w-[140px] border-r border-emerald-800 font-bold uppercase">
                          {loc('Amookhta Listener', 'سامع آموختہ', 'వినేవారు')}
                        </th>
                        <th className="p-3 min-w-[180px] border-r border-emerald-800 font-bold uppercase bg-amber-950 text-amber-200">
                          {loc('Kaifiyat & Grade', 'کیفیت و درجہ', 'గ్రేడ్')}
                        </th>
                        <th className="p-3 text-center w-16 bg-emerald-950 font-bold uppercase no-print">
                          {loc('Action', 'کارروائی', 'సవరించు')}
                        </th>
                      </tr>
                    )}
                  </thead>

                  {/* 30 Day Rows */}
                  <tbody className="divide-y divide-gray-100">
                    {monthDays.map((d, dIdx) => {
                      const isFriday = d.isFriday;
                      const studentDays = matrixState[selectedStudent.id] || {};
                      const studentRoz = roznamchahState[selectedStudent.id] || {};
                      const attStatus = studentDays[d.dayNum] || (isFriday ? 'O' : 'P');
                      const dayRecord = studentRoz[d.dayNum];
                      const isEven = dIdx % 2 === 0;

                      if (isFriday) {
                        return (
                          <tr key={d.dayNum} className="bg-emerald-50/60 text-emerald-950 font-medium">
                            <td className="p-2.5 text-center font-mono font-bold border-r sticky left-0 bg-emerald-50/60 z-10">
                              {d.dayNum}
                            </td>
                            <td className="p-2.5 border-r font-mono font-bold sticky left-12 bg-emerald-50/60 z-10 whitespace-nowrap">
                              <span className="text-emerald-900">{d.dayNum} {d.weekday}</span>
                              <span className="block text-[10px] text-amber-800 font-urdu">{loc('Friday', 'جمعۃ المبارک', 'శుక్రవారం')}</span>
                            </td>
                            <td className="p-2.5 text-center border-r font-bold">
                              <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-200/70 text-emerald-900 border border-emerald-300">
                                {loc('Holiday', 'تعطیل جمعہ', 'సెలవు')}
                              </span>
                            </td>
                            <td colSpan={activeDepartment === 'hifz' ? 8 : 5} className="p-2.5 text-center font-bold text-emerald-800 italic">
                              {loc('Weekly Islamic Holiday (Friday)', 'ہفتہ وار تعطیل جمعۃ المبارک', 'శుక్రవారం వారపు సెలవుదినం')}
                            </td>
                            <td className="p-2.5 text-center border-r text-[11px] font-urdu font-bold text-emerald-800">
                              {loc('Holiday', 'تعطیل', 'సెలవు')}
                            </td>
                            <td className="p-2.5 text-center no-print text-gray-400">-</td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={d.dayNum} className={`hover:bg-amber-50/30 transition-colors ${isEven ? 'bg-white' : 'bg-gray-50/40'}`}>
                          {/* S.No */}
                          <td className={`p-2.5 text-center font-mono font-bold text-gray-700 border-r sticky left-0 z-10 ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
                            {d.dayNum}
                          </td>

                          {/* Day & Date */}
                          <td className={`p-2.5 border-r font-mono font-bold sticky left-12 z-10 whitespace-nowrap ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
                            <span className="text-gray-900">{d.dayNum} {d.weekday}</span>
                            <span className="block text-[10px] text-gray-500 font-normal">{d.dateStr}</span>
                          </td>

                          {/* Attendance Status */}
                          <td className="p-2.5 text-center border-r">
                            <button
                              type="button"
                              onClick={() => handleToggleCell(selectedStudent.id, d.dayNum)}
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer transition-transform hover:scale-110 ${
                                attStatus === 'P' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                                attStatus === 'A' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                                attStatus === 'L' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                'bg-gray-200 text-gray-600'
                              }`}
                              title="Click to toggle: Present / Absent / Leave"
                            >
                              {attStatus === 'P' ? loc('Present', 'حاضر', 'హాజరు') :
                               attStatus === 'A' ? loc('Absent', 'غیر حاضر', 'గైర్హాజరు') :
                               attStatus === 'L' ? loc('Leave', 'رخصت', 'సెలవు') : '-'}
                            </button>
                          </td>

                          {/* Curriculum Content */}
                          {activeDepartment === 'hifz' ? (
                            <>
                              {/* مقدار سبق */}
                              <td className="p-2.5 border-r font-medium text-gray-900 font-urdu">
                                {dayRecord?.sabaqQuantity || '۱ صفحہ (1 Page)'}
                              </td>

                              {/* پارہ سبق */}
                              <td className="p-2.5 border-r font-bold text-emerald-950 font-urdu">
                                {dayRecord?.sabaqPara || `پارہ ۱۴ (درس ${d.dayNum})`}
                              </td>

                              {/* اغلاط */}
                              <td className="p-2.5 text-center border-r font-mono font-bold">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  (dayRecord?.sabaqMistakes || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 font-black'
                                }`}>
                                  {dayRecord?.sabaqMistakes ?? 0}
                                </span>
                              </td>

                              {/* سامع پارہ سبق */}
                              <td className="p-2.5 border-r text-gray-700 font-urdu">
                                {dayRecord?.sabaqListener || 'قاری بلال احمد'}
                              </td>

                              {/* مقدارِ آموختہ */}
                              <td className="p-2.5 border-r font-medium text-gray-900 font-urdu">
                                {dayRecord?.amookhtaQuantity || 'نصف پارہ (1/2 Para)'}
                              </td>

                              {/* اغلاط */}
                              <td className="p-2.5 text-center border-r font-mono font-bold">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  (dayRecord?.amookhtaMistakes || 0) <= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 font-black'
                                }`}>
                                  {dayRecord?.amookhtaMistakes ?? 1}
                                </span>
                              </td>

                              {/* سامع آموختہ */}
                              <td className="p-2.5 border-r text-gray-700 font-urdu">
                                {dayRecord?.amookhtaListener || 'مولانا فاروق'}
                              </td>

                              {/* کیفیت و درجہ */}
                              <td className="p-2.5 border-r">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    dayRecord?.grade === 'Mumtaz' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                                    dayRecord?.grade === 'Jayyid Jiddan' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                                    'bg-amber-100 text-amber-900 border border-amber-300'
                                  }`}>
                                    {dayRecord?.grade === 'Mumtaz' ? loc('Mumtaz', 'ممتاز', 'ముమ్తాజ్') :
                                     dayRecord?.grade === 'Jayyid Jiddan' ? loc('Jayyid Jiddan', 'جید جدا', 'జయ్యిద్ జిద్దన్') :
                                     loc('Jayyid', 'جید', 'జయ్యిద్')}
                                  </span>
                                </div>
                                <span className="text-[11px] text-gray-600 font-urdu block">
                                  {dayRecord?.kaifiyat || 'روانی و تجوید درست ہے'}
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              {/* سبق (ناظرہ و قاعدہ) */}
                              <td className="p-2.5 border-r font-bold text-emerald-950 font-urdu">
                                {dayRecord?.sabaq || 'تختی نمبر ۶: تنوین'}
                              </td>

                              {/* مقدارِ آموختہ */}
                              <td className="p-2.5 border-r font-medium text-gray-900 font-urdu">
                                {dayRecord?.amookhtaQuantity || 'گزشتہ ۲ تختیاں'}
                              </td>

                              {/* اغلاط */}
                              <td className="p-2.5 text-center border-r font-mono font-bold">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  (dayRecord?.amookhtaMistakes || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 font-black'
                                }`}>
                                  {dayRecord?.amookhtaMistakes ?? 0}
                                </span>
                              </td>

                              {/* سامع آموختہ */}
                              <td className="p-2.5 border-r text-gray-700 font-urdu">
                                {dayRecord?.amookhtaListener || 'قاری حفظ الرحمن'}
                              </td>

                              {/* کیفیت و درجہ */}
                              <td className="p-2.5 border-r">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    dayRecord?.grade === 'Mumtaz' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                                    'bg-blue-100 text-blue-900 border border-blue-300'
                                  }`}>
                                    {dayRecord?.grade === 'Mumtaz' ? loc('Mumtaz', 'ممتاز', 'ముమ్తాజ్') : loc('Jayyid', 'جید', 'జయ్యిద్')}
                                  </span>
                                </div>
                                <span className="text-[11px] text-gray-600 font-urdu block">
                                  {dayRecord?.kaifiyat || 'مخارج و تلفظ درست'}
                                </span>
                              </td>
                            </>
                          )}

                          {/* Action Edit Button */}
                          <td className="p-2.5 text-center no-print">
                            <button
                              type="button"
                              onClick={() => handleOpenRoznamchahModal(selectedStudent, d.dayNum)}
                              className="p-1.5 rounded-lg border border-gray-300 hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 transition-colors"
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

              {/* Official Signatures Footer For Ledger Print */}
              <div className="p-6 bg-gray-50/80 border-t border-gray-200 mt-2 flex flex-wrap items-center justify-between gap-6 text-xs text-gray-700 font-urdu">
                <div className="text-center min-w-[140px] pt-4 border-t-2 border-gray-400">
                  <span className="font-bold block">{loc("Teacher's Signature", 'دستخط استاذ', 'ఉపాధ్యాయుని సంతకం')}</span>
                </div>
                <div className="text-center min-w-[160px] pt-4 border-t-2 border-gray-400">
                  <span className="font-bold block">{loc('Supervisor Signature', 'دستخط ناظم تعلیمات', 'పర్యవేక్షకుని సంతకం')}</span>
                </div>
                <div className="text-center min-w-[140px] pt-4 border-t-2 border-gray-400">
                  <span className="font-bold block">{loc("Parent / Guardian", 'دستخط سرپرست / والد', 'తల్లిదండ్రుల సంతకం')}</span>
                </div>
                <div className="text-center min-w-[140px] pt-4 border-t-2 border-gray-400">
                  <span className="font-bold block">{loc('Official Madrasa Stamp', 'مہر جامعہ / مدرسہ', 'మదరసా అధికారిక ముద్ర')}</span>
                </div>
              </div>
            </div>
          ) : selectedStudentId === 'all' ? (
            /* CASE 2: ALL STUDENTS SUMMARY MATRIX */
            <div className="bg-white rounded-3xl border border-m3-outline-variant/40 shadow-m3-2 overflow-hidden animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">
                    {loc('Class Summary Matrix (All Students)', 'پورے درجے کا خلاصہ میٹرکس', 'తరగతి సారాంశం (అందరి విద్యార్థులు)')}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {loc('Click any student row to view their detailed 30-day individual Roznamchah ledger', 'کسی بھی طالب علم کی مکمل ۳۰ روزہ روزنامچہ تفصیلات دیکھنے کے لیے اس کی قطار پر کلک کریں', 'వ్యక్తిగత రోజ్నాంచా చూడటానికి విద్యార్థి వరుసపై క్లిక్ చేయండి')}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-950 text-white text-[11px]">
                      <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold uppercase tracking-wider sticky left-0 bg-emerald-950 z-20">
                        {loc('S.No', 'شمار', 'వ.సంఖ్య')}
                      </th>
                      <th className="p-3 w-28 border-r border-emerald-800 font-bold uppercase sticky left-12 bg-emerald-950 z-20">
                        {loc('Adm No', 'داخلہ نمبر', 'ప్రవేశ సంఖ్య')}
                      </th>
                      <th className="p-3 min-w-[200px] border-r border-emerald-800 font-bold uppercase sticky left-40 bg-emerald-950 z-20 shadow-md">
                        {activeDepartment === 'hifz' 
                          ? loc('Student Name & Homeland', 'نام طالب مع وطن', 'విద్యార్థి పేరు & గ్రామం') 
                          : loc('Student Name & Homeland', 'نام طالبِ علم مع وطن', 'విద్యార్థి పేరు & గ్రామం')}
                      </th>
                      <th className="p-3 w-40 border-r border-emerald-800 font-bold uppercase bg-emerald-900">
                        {activeDepartment === 'hifz' 
                          ? loc('Sabaq & Parah', 'مقدار و پارہ سبق', 'సబక్ & పారా') 
                          : loc('Sabaq', 'سبق', 'సబక్')}
                      </th>

                      {monthDays.map(d => (
                        <th 
                          key={d.dayNum}
                          className={`p-1.5 text-center min-w-[42px] border-r border-emerald-800/60 font-mono ${
                            d.isFriday ? 'bg-emerald-800 text-amber-200 font-black' : 'bg-emerald-950 text-white'
                          }`}
                        >
                          <span className="block text-xs font-bold leading-none">{d.dayNum}</span>
                          <span className="block text-[9px] uppercase tracking-tighter opacity-80 mt-0.5 leading-none">
                            {d.isFriday ? loc('Fri', 'جمعہ', 'శుక్ర') : d.weekday}
                          </span>
                        </th>
                      ))}

                      <th className="p-2 text-center w-20 border-r border-emerald-800 bg-emerald-900">
                        {loc('Work Days', 'ایام درس', 'పని దినాలు')}
                      </th>
                      <th className="p-2 text-center w-20 border-r border-emerald-800 bg-emerald-900">
                        {loc('Present', 'ایام حاضری', 'హాజరు')}
                      </th>
                      <th className="p-2 text-center w-24 border-r border-emerald-800 bg-amber-950 text-amber-200">
                        {loc('Hijri Dars', 'رمضان تا رمضان', 'హిజ్రీ పని దినాలు')}
                      </th>
                      <th className="p-2 text-center w-20 border-r border-emerald-800 bg-amber-950 text-amber-200">
                        {loc('Hijri Present', 'کل حاضری', 'మొత్తం హాజరు')}
                      </th>
                      <th className="p-2 text-center w-16 bg-emerald-900">
                        {loc('Ratio %', 'فیصد', 'శాతం %')}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {classStudents.map((st, idx) => {
                      const studentDays = matrixState[st.id] || {};
                      const studentRoz = roznamchahState[st.id] || {};
                      const monthlyPresentCount = monthDays.filter(d => !d.isFriday && studentDays[d.dayNum] === 'P').length;
                      const cumulativeYearPresent = Math.max(0, st.totalPresentsYearly || (cumulativeHijriTeachingDays - 5));
                      const percentage = ((cumulativeYearPresent / cumulativeHijriTeachingDays) * 100).toFixed(1);
                      const village = st.village || st.address.split(',')[0].trim();

                      return (
                        <tr 
                          key={st.id} 
                          onClick={() => setSelectedStudentId(st.id)}
                          className="hover:bg-amber-100/50 cursor-pointer transition-colors"
                          title="Click to view detailed individual 30-day Roznamchah ledger"
                        >
                          <td className="p-2.5 text-center font-mono font-bold text-gray-700 border-r sticky left-0 bg-white z-10">{idx + 1}</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-900 border-r sticky left-12 bg-white z-10 whitespace-nowrap">{st.admissionNo}</td>
                          <td className="p-2.5 border-r sticky left-40 bg-white z-10 shadow-sm">
                            <span className="font-bold text-gray-900 text-xs block">
                              {loc(st.studentName, st.studentNameUrdu, st.studentName)}
                            </span>
                            <span className="text-[10px] text-gray-500 font-urdu">
                              {loc('Homeland:', 'وطن:', 'గ్రామం:')} <strong>{village}</strong>
                            </span>
                          </td>
                          <td className="p-2.5 border-r font-urdu text-xs font-bold text-emerald-950 bg-emerald-50/40">
                            {activeDepartment === 'hifz' ? (studentRoz[selectedDailyDay]?.sabaqPara || st.presentSabaqAt || 'پارہ ۱۴') : (studentRoz[selectedDailyDay]?.sabaq || 'تختی ۶')}
                          </td>

                          {monthDays.map(d => {
                            const isFriday = d.isFriday;
                            const dayRecord = studentRoz[d.dayNum];
                            const grade = dayRecord?.grade || 'Mumtaz';

                            if (isFriday) {
                              return (
                                <td key={d.dayNum} className="p-1 text-center border-r bg-emerald-50/70 text-emerald-800 font-urdu text-[10px] font-bold">
                                  {loc('Off', 'تعطیل', 'సెలవు')}
                                </td>
                              );
                            }

                            return (
                              <td 
                                key={d.dayNum} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRoznamchahModal(st, d.dayNum);
                                }}
                                className="p-1 text-center border-r cursor-pointer hover:bg-emerald-100 transition-colors"
                                title={`Day ${d.dayNum}: ${dayRecord?.sabaq || 'Sabaq'}`}
                              >
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-urdu ${
                                  grade === 'Mumtaz' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                                }`}>
                                  {grade === 'Mumtaz' ? loc('Mumtaz', 'ممتاز', 'ముమ్తాజ్') : loc('Jayyid Jiddan', 'جید جدا', 'జయ్యిద్ జిద్దన్')}
                                </span>
                              </td>
                            );
                          })}

                          <td className="p-2 text-center font-mono font-bold text-gray-800 border-r">{monthlyAyyamDars}</td>
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
            </div>
          ) : (
            /* CASE 3: NO STUDENT SELECTED PROMPT WITH CLICKABLE STUDENT CARDS GRID */
            <div className="bg-white rounded-3xl border border-m3-outline-variant/40 shadow-m3-2 p-8 text-center animate-in fade-in duration-200">
              <div className="max-w-md mx-auto mb-8">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  {loc('Select a Student to View Monthly Roznamchah', 'ماہانہ روزنامچہ دیکھنے کے لیے طالب علم منتخب کریں', 'నెలవారీ రోజ్నాంచా చూడటానికి విద్యార్థిని ఎంచుకోండి')}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {loc(
                    `Selected Class: ${selectedClass}. Click any student card below or choose from the dropdown above to view the full 30-day Roznamchah ledger.`,
                    `منتخب درجہ: ${selectedClass}۔ تفصیلی ۳۰ روزہ روزنامچہ دیکھنے کے لیے نیچے دیے گئے کسی بھی طالب علم کے کارڈ پر کلک کریں یا اوپر ڈراپ ڈاؤن سے منتخب کریں۔`,
                    `ఎంచుకున్న తరగతి: ${selectedClass}. పూర్తి 30 రోజుల రోజ్నాంచాను చూడటానికి క్రింది విద్యార్థి కార్డును క్లిక్ చేయండి లేదా డ్రాప్‌డౌన్ నుండి ఎంచుకోండి.`
                  )}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId('all')}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors shadow-xs"
                  >
                    {loc('View All Students Summary Matrix', 'یا تمام طلبہ کا خلاصہ میٹرکس دیکھیں', 'అందరి విద్యార్థుల సారాంశం చూడండి')}
                  </button>
                </div>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-left">
                {classStudents.map((st, i) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-amber-400 hover:shadow-md bg-white hover:bg-amber-50/20 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center group-hover:bg-amber-500 group-hover:text-amber-950 transition-colors">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-sm truncate">
                          {loc(st.studentName, st.studentNameUrdu, st.studentName)}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-emerald-700">
                          {st.admissionNo}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-600 flex items-center justify-between">
                      <span>{loc('Homeland:', 'وطن:', 'గ్రామం:')} {st.village || st.address.split(',')[0]}</span>
                      <span className="font-bold text-amber-800">{st.presentSabaqAt || 'سبق جاری'}</span>
                    </div>
                    <button
                      type="button"
                      className="w-full mt-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs group-hover:bg-emerald-800 group-hover:text-white transition-colors text-center"
                    >
                      {loc('Open Monthly Roznamchah', 'ماہانہ روزنامچہ کھولیں', 'నెలవారీ రోజ్నాంచా తెరవండి')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDANCE MATRIX */}
      {activeTab === 'attendance_matrix' && (
        <div className="bg-white rounded-3xl border border-m3-outline-variant/40 shadow-m3-2 overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-950 text-white text-[11px]">
                  <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold uppercase sticky left-0 bg-emerald-950 z-20">S.No</th>
                  <th className="p-3 w-28 border-r border-emerald-800 font-bold uppercase sticky left-12 bg-emerald-950 z-20">Adm No</th>
                  <th className="p-3 min-w-[200px] border-r border-emerald-800 font-bold uppercase sticky left-40 bg-emerald-950 z-20 shadow-md">
                    Student Name & Village<br /><span className="text-[10px] font-urdu font-normal">نام طالب علم مع وطن</span>
                  </th>
                  {monthDays.map(d => (
                    <th 
                      key={d.dayNum}
                      className={`p-1.5 text-center min-w-[36px] border-r border-emerald-800/60 font-mono ${
                        d.isFriday ? 'bg-emerald-800 text-amber-200 font-bold' : 'bg-emerald-950 text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold leading-none">{d.dayNum}</span>
                      <span className="block text-[9px] uppercase tracking-tighter opacity-80 mt-0.5 leading-none">
                        {d.isFriday ? 'جمعہ' : d.weekday}
                      </span>
                    </th>
                  ))}
                  <th className="p-2 text-center w-20 border-r border-emerald-800 bg-emerald-900">ایام درس</th>
                  <th className="p-2 text-center w-20 border-r border-emerald-800 bg-emerald-900">ایام حاضری</th>
                  <th className="p-2 text-center w-24 border-r border-emerald-800 bg-amber-950 text-amber-200">رمضان تا رمضان</th>
                  <th className="p-2 text-center w-20 border-r border-emerald-800 bg-amber-950 text-amber-200">کل حاضری</th>
                  <th className="p-2 text-center w-16 bg-emerald-900">فیصد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.map((st, idx) => {
                  const studentDays = matrixState[st.id] || {};
                  const monthlyPresentCount = monthDays.filter(d => !d.isFriday && studentDays[d.dayNum] === 'P').length;
                  const cumulativeYearPresent = Math.max(0, st.totalPresentsYearly || (cumulativeHijriTeachingDays - 5));
                  const percentage = ((cumulativeYearPresent / cumulativeHijriTeachingDays) * 100).toFixed(1);
                  const village = st.village || st.address.split(',')[0].trim();

                  return (
                    <tr key={st.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="p-2.5 text-center font-mono font-bold text-gray-700 border-r sticky left-0 bg-white z-10">{idx + 1}</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-900 border-r sticky left-12 bg-white z-10 whitespace-nowrap">{st.admissionNo}</td>
                      <td className="p-2.5 border-r sticky left-40 bg-white z-10 shadow-sm">
                        <span className="font-bold text-gray-900 text-xs block">{st.studentName}</span>
                        <span className="text-xs font-urdu text-emerald-800 font-bold block">{st.studentNameUrdu}</span>
                        <span className="text-[10px] text-gray-500 font-urdu">وطن: {village}</span>
                      </td>

                      {monthDays.map(d => {
                        const status = studentDays[d.dayNum] || (d.isFriday ? 'O' : 'P');
                        const isFriday = d.isFriday;

                        return (
                          <td 
                            key={d.dayNum} 
                            onClick={() => !isFriday && handleToggleCell(st.id, d.dayNum)}
                            className={`p-1 text-center font-mono text-xs font-bold border-r select-none ${
                              isFriday ? 'bg-emerald-50/70 cursor-not-allowed' : 'cursor-pointer hover:bg-emerald-100/70'
                            }`}
                          >
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold ${
                              status === 'P' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                              status === 'A' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                              status === 'L' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {status === 'P' ? 'ح' : status === 'A' ? 'غ' : status === 'L' ? 'ر' : '-'}
                            </span>
                          </td>
                        );
                      })}

                      <td className="p-2 text-center font-mono font-bold text-gray-800 border-r">{monthlyAyyamDars}</td>
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
        </div>
      )}

      {/* TAB 4: DAILY FAST ENTRY */}
      {activeTab === 'daily_quick' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-800" />
              <span>Fast Sabaq & Roznamchah Entry &bull; فوری روزانہ اندراج</span>
            </h3>
            <p className="text-xs text-gray-500 font-urdu mt-0.5">
              {activeDepartment === 'hifz'
                ? 'حفظ کے طلبہ کے لیے: مقدار سبق، پارہ سبق، اغلاط، سامع پارہ سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت'
                : 'ناظرہ و قاعدہ کے لیے: سبق، مقدارِ آموختہ، اغلاط، سامع آموختہ، کیفیت'
              }
            </p>
          </div>

          <form onSubmit={handleQuickSabaqSubmit} className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Select Student & Homeland &bull; طالب علم کا انتخاب مع وطن
              </label>
              <select
                value={quickStudentId}
                onChange={(e) => setQuickStudentId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-bold text-gray-900"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.studentName} ({s.studentNameUrdu}) &bull; Adm: {s.admissionNo} &bull; وطن: {s.village || s.address}
                  </option>
                ))}
              </select>
            </div>

            {activeDepartment === 'hifz' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">مقدار سبق (Sabaq Quantity)</label>
                    <input
                      type="text"
                      value={quickSabaqQuantity}
                      onChange={(e) => setQuickSabaqQuantity(e.target.value)}
                      placeholder="e.g. ۱ صفحہ / نصف صفحہ"
                      className="w-full p-2.5 text-xs rounded-xl border font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">پارہ سبق (Sabaq Parah)</label>
                    <input
                      type="text"
                      value={quickSabaqPara}
                      onChange={(e) => setQuickSabaqPara(e.target.value)}
                      placeholder="e.g. پارہ ۱۴ (سورۃ الحجر)"
                      className="w-full p-2.5 text-xs rounded-xl border font-bold text-emerald-950 font-urdu"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">اغلاط - سبق (Errors)</label>
                    <input
                      type="number"
                      min={0}
                      value={quickSabaqMistakes}
                      onChange={(e) => setQuickSabaqMistakes(Number(e.target.value))}
                      className="w-full p-2.5 text-xs rounded-xl border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع پارہ سبق (Listener)</label>
                    <input
                      type="text"
                      value={quickSabaqListener}
                      onChange={(e) => setQuickSabaqListener(e.target.value)}
                      placeholder="e.g. قاری بلال احمد"
                      className="w-full p-2.5 text-xs rounded-xl border font-urdu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">مقدارِ آموختہ (Amookhta Quantity)</label>
                    <input
                      type="text"
                      value={quickAmookhtaQuantity}
                      onChange={(e) => setQuickAmookhtaQuantity(e.target.value)}
                      placeholder="e.g. نصف پارہ"
                      className="w-full p-2.5 text-xs rounded-xl border font-urdu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">اغلاط - آموختہ (Errors)</label>
                    <input
                      type="number"
                      min={0}
                      value={quickAmookhtaMistakes}
                      onChange={(e) => setQuickAmookhtaMistakes(Number(e.target.value))}
                      className="w-full p-2.5 text-xs rounded-xl border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع آموختہ (Listener)</label>
                    <input
                      type="text"
                      value={quickAmookhtaListener}
                      onChange={(e) => setQuickAmookhtaListener(e.target.value)}
                      placeholder="e.g. مولانا فاروق"
                      className="w-full p-2.5 text-xs rounded-xl border font-urdu"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سبق (Sabaq Lesson / Takhti)</label>
                  <input
                    type="text"
                    value={quickSabaqPara}
                    onChange={(e) => setQuickSabaqPara(e.target.value)}
                    placeholder="e.g. نورانی قاعدہ تختی ۶: تنوین"
                    className="w-full p-2.5 text-xs rounded-xl border font-bold text-emerald-950 font-urdu"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">مقدارِ آموختہ</label>
                    <input
                      type="text"
                      value={quickAmookhtaQuantity}
                      onChange={(e) => setQuickAmookhtaQuantity(e.target.value)}
                      placeholder="e.g. گزشتہ ۲ تختیاں"
                      className="w-full p-2.5 text-xs rounded-xl border font-urdu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">اغلاط</label>
                    <input
                      type="number"
                      min={0}
                      value={quickAmookhtaMistakes}
                      onChange={(e) => setQuickAmookhtaMistakes(Number(e.target.value))}
                      className="w-full p-2.5 text-xs rounded-xl border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع آموختہ</label>
                    <input
                      type="text"
                      value={quickAmookhtaListener}
                      onChange={(e) => setQuickAmookhtaListener(e.target.value)}
                      placeholder="e.g. قاری حفظ الرحمن"
                      className="w-full p-2.5 text-xs rounded-xl border font-urdu"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">معیار / درجہ (Grade)</label>
                <select
                  value={quickGrade}
                  onChange={(e) => setQuickGrade(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white font-bold"
                >
                  <option value="Mumtaz">Mumtaz (ممتاز - Outstanding)</option>
                  <option value="Jayyid Jiddan">Jayyid Jiddan (جید جدا - Very Good)</option>
                  <option value="Jayyid">Jayyid (جید - Good)</option>
                  <option value="Maqbool">Maqbool (مقبول - Acceptable)</option>
                  <option value="Daeef">Daeef (ضعیف - Needs Effort)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">کیفیت / ریمارکس (Kaifiyat)</label>
                <input
                  type="text"
                  value={quickKaifiyat}
                  onChange={(e) => setQuickKaifiyat(e.target.value)}
                  placeholder="e.g. ممتاز - روانی و تجوید درست ہے"
                  className="w-full p-2.5 text-xs rounded-xl border font-urdu"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-m3-1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>محفوظ کریں (Record Daily Roznamchah Entry)</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: HOLY QURAN */}
      {activeTab === 'quran' && (
        <div className="animate-in fade-in duration-300">
          <QuranModule />
        </div>
      )}

      {/* Institutional Notifications & Daily Timetable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
          <div className="flex items-center gap-2 border-b border-m3-outline-variant/20 pb-3">
            <Bell className="w-5 h-5 text-m3-primary" />
            <h3 className="text-sm font-bold text-m3-on-surface">Notifications from Admin / Principal</h3>
          </div>
          <div className="space-y-2.5">
            {notices.map((n) => (
              <div key={n.id} className="p-3 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                  <span className="text-[10px] font-mono text-gray-500">{n.date}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">{n.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
          <div className="flex items-center gap-2 border-b border-m3-outline-variant/20 pb-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-m3-on-surface">Today's Class Schedule</h3>
          </div>
          <div className="space-y-2">
            {schedule.slice(2, 7).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-m3-surface-container-low text-xs">
                <span className="font-mono font-bold text-m3-primary">{item.time}</span>
                <span className="font-semibold text-gray-800">{item.title}</span>
                <span className="text-[10px] text-gray-500 uppercase">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CURRICULUM SPECIFIC ROZNAMCHAH MODAL */}
      <Modal
        isOpen={showSabaqModal}
        onClose={() => setShowSabaqModal(false)}
        title={activeDepartment === 'hifz' ? 'روزنامچہ برائے طلبہ حفظِ قرآن مجید' : 'روزنامچہ برائے طلبہ ناظرہ و قاعدہ'}
        subtitle={`Student: ${selectedStudentForSabaq?.studentName} (${selectedStudentForSabaq?.admissionNo}) &bull; Day ${selectedDayForSabaq}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRoznamchahEntry} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold block uppercase font-mono">نام طالب مع وطن</span>
              <strong className="text-sm font-bold text-emerald-950">
                {selectedStudentForSabaq?.studentName} ({selectedStudentForSabaq?.studentNameUrdu})
              </strong>
              <span className="text-gray-600 font-urdu block text-xs mt-0.5">
                وطن / گاؤں: <strong>{selectedStudentForSabaq?.village || selectedStudentForSabaq?.address}</strong>
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-amber-800 font-bold block">تاریخ و تعلیمی سیشن</span>
              <strong className="text-amber-950 block">Day {selectedDayForSabaq} &bull; {currentMonthMeta.en} {selectedYear}</strong>
              <span className="text-xs text-amber-900 font-urdu">رمضان المبارک تا رمضان المبارک</span>
            </div>
          </div>

          {activeDepartment === 'hifz' ? (
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <span className="text-xs font-black text-amber-900 block font-urdu">
                  ۱. جدید سبق کی تفصیل (Daily Sabaq Details)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">مقدار سبق (Sabaq Quantity)</label>
                    <input
                      type="text"
                      value={modalSabaqQuantity}
                      onChange={(e) => setModalSabaqQuantity(e.target.value)}
                      placeholder="e.g. ۱ صفحہ (1 Page) / نصف صفحہ"
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">پارہ سبق (Sabaq Parah)</label>
                    <input
                      type="text"
                      value={modalSabaqPara}
                      onChange={(e) => setModalSabaqPara(e.target.value)}
                      placeholder="e.g. پارہ ۱۴ (سورۃ الحجر)"
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">اغلاط - سبق (Mistakes)</label>
                    <input
                      type="number"
                      min={0}
                      value={modalSabaqMistakes}
                      onChange={(e) => setModalSabaqMistakes(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع پارہ سبق (Listener)</label>
                    <input
                      type="text"
                      value={modalSabaqListener}
                      onChange={(e) => setModalSabaqListener(e.target.value)}
                      placeholder="e.g. قاری بلال احمد"
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3">
                <span className="text-xs font-black text-teal-900 block font-urdu">
                  ۲. آموختہ و دور کی تفصیل (Amookhta Revision)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">مقدارِ آموختہ (Quantity)</label>
                    <input
                      type="text"
                      value={modalAmookhtaQuantity}
                      onChange={(e) => setModalAmookhtaQuantity(e.target.value)}
                      placeholder="e.g. نصف پارہ"
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">اغلاط - آموختہ (Mistakes)</label>
                    <input
                      type="number"
                      min={0}
                      value={modalAmookhtaMistakes}
                      onChange={(e) => setModalAmookhtaMistakes(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع آموختہ (Listener)</label>
                    <input
                      type="text"
                      value={modalAmookhtaListener}
                      onChange={(e) => setModalAmookhtaListener(e.target.value)}
                      placeholder="e.g. مولانا فاروق"
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">معیار / درجہ (Grade)</label>
                  <select
                    value={modalGrade}
                    onChange={(e) => setModalGrade(e.target.value as any)}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white font-bold text-gray-900"
                  >
                    <option value="Mumtaz">Mumtaz (ممتاز - Outstanding)</option>
                    <option value="Jayyid Jiddan">Jayyid Jiddan (جید جدا - Very Good)</option>
                    <option value="Jayyid">Jayyid (جید - Good)</option>
                    <option value="Maqbool">Maqbool (مقبول - Acceptable)</option>
                    <option value="Daeef">Daeef (ضعیف - Needs Effort)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">کیفیت / ریمارکس (Kaifiyat)</label>
                  <input
                    type="text"
                    value={modalKaifiyat}
                    onChange={(e) => setModalKaifiyat(e.target.value)}
                    placeholder="e.g. ممتاز - روانی و تجوید درست ہے"
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سبق (Sabaq Lesson / Takhti)</label>
                <input
                  type="text"
                  value={modalSabaq}
                  onChange={(e) => setModalSabaq(e.target.value)}
                  placeholder="e.g. نورانی قاعدہ تختی نمبر ۶: تنوین"
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 font-bold text-emerald-950 font-urdu"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">مقدارِ آموختہ</label>
                  <input
                    type="text"
                    value={modalAmookhtaQuantity}
                    onChange={(e) => setModalAmookhtaQuantity(e.target.value)}
                    placeholder="e.g. گزشتہ ۲ تختیاں"
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">اغلاط</label>
                  <input
                    type="number"
                    min={0}
                    value={modalAmookhtaMistakes}
                    onChange={(e) => setModalAmookhtaMistakes(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع آموختہ</label>
                  <input
                    type="text"
                    value={modalAmookhtaListener}
                    onChange={(e) => setModalAmookhtaListener(e.target.value)}
                    placeholder="e.g. قاری حفظ الرحمن"
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">معیار / درجہ (Grade)</label>
                  <select
                    value={modalGrade}
                    onChange={(e) => setModalGrade(e.target.value as any)}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white font-bold text-gray-900"
                  >
                    <option value="Mumtaz">Mumtaz (ممتاز - Outstanding)</option>
                    <option value="Jayyid Jiddan">Jayyid Jiddan (جید جدا - Very Good)</option>
                    <option value="Jayyid">Jayyid (جید - Good)</option>
                    <option value="Maqbool">Maqbool (مقبول - Acceptable)</option>
                    <option value="Daeef">Daeef (ضعیف - Needs Effort)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">کیفیت / ریمارکس (Kaifiyat)</label>
                  <input
                    type="text"
                    value={modalKaifiyat}
                    onChange={(e) => setModalKaifiyat(e.target.value)}
                    placeholder="e.g. ممتاز - مخارج و تلفظ درست ہے"
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowSabaqModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              منسوخ (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm"
            >
              محفوظ کریں (Save Roznamchah)
            </button>
          </div>
        </form>
      </Modal>

      {/* Font & Typography Settings Modal */}
      <FontShowcaseModal
        isOpen={showFontModal}
        onClose={() => setShowFontModal(false)}
      />

    </div>
  );
};
