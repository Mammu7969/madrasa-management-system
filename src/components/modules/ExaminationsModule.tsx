import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Examination, ExamStudentResult, ExamGrade } from '../../types';
import { 
  FileSpreadsheet, 
  Award, 
  Printer, 
  Calendar, 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Clock, 
  Save, 
  Sparkles, 
  X, 
  ChevronRight,
  TrendingUp,
  Percent,
  Check
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const ExaminationsModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { t, showToast } = useTheme();

  const [exams, setExams] = useState<Examination[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showMarksheetModal, setShowMarksheetModal] = useState<boolean>(false);
  const [showGazetteModal, setShowGazetteModal] = useState<boolean>(false);
  const [activeExam, setActiveExam] = useState<Examination | null>(null);

  // New Exam Form State
  const [examTitle, setExamTitle] = useState<string>('');
  const [examTitleUrdu, setExamTitleUrdu] = useState<string>('');
  const [examTerm, setExamTerm] = useState<'Quarterly' | 'Half-Yearly' | 'Annual' | 'Sanad' | 'Monthly'>('Quarterly');
  const [academicYear, setAcademicYear] = useState<string>('1447-1448 AH (2026-2027)');
  const [targetClass, setTargetClass] = useState<string>('Hifz Section A');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [subjectsList, setSubjectsList] = useState<{ id: string; name: string; nameUrdu?: string; maxMarks: number; passMarks: number }[]>([
    { id: 'sub-1', name: 'Quran Hifz / Sabaq', nameUrdu: 'قرآن حفظ / سبق', maxMarks: 100, passMarks: 40 },
    { id: 'sub-2', name: 'Tajweed & Makharij', nameUrdu: 'تجوید و مخارج', maxMarks: 50, passMarks: 20 },
    { id: 'sub-3', name: 'Deeniyat & Masail', nameUrdu: 'دینیات و مسائل', maxMarks: 50, passMarks: 20 }
  ]);

  // Marksheet edit state (array of results for activeExam)
  const [editingResults, setEditingResults] = useState<ExamStudentResult[]>([]);

  // Load examinations from db
  const reloadExaminations = () => {
    const list = db.getExaminations(activeMadrasa?.id);
    setExams(list);
  };

  useEffect(() => {
    reloadExaminations();
  }, [activeMadrasa?.id]);

  // Available classes for dropdown
  const classesList = useMemo(() => {
    const fromDb = db.getClasses(activeMadrasa?.id).map(c => c.name);
    const fromStudents = db.getStudents(activeMadrasa?.id).map(s => s.class);
    const combined = Array.from(new Set([...fromDb, ...fromStudents])).filter(Boolean);
    return combined.length > 0 ? combined : ['Hifz Section A', 'Nazira Class 1', 'Alimiyat Year 1'];
  }, [activeMadrasa?.id]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      const matchTerm = selectedTerm === 'all' || e.term === selectedTerm;
      const matchStatus = selectedStatus === 'all' || e.status === selectedStatus;
      const matchSearch = !searchQuery.trim() || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (e.titleUrdu && e.titleUrdu.includes(searchQuery)) ||
        e.className.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTerm && matchStatus && matchSearch;
    });
  }, [exams, selectedTerm, selectedStatus, searchQuery]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = exams.length;
    const completed = exams.filter(e => e.status === 'Completed').length;
    const ongoing = exams.filter(e => e.status === 'Ongoing').length;
    const upcoming = exams.filter(e => e.status === 'Upcoming').length;

    let totalStudentsEvaluated = 0;
    let mumtazCount = 0;
    let passCount = 0;

    exams.forEach(e => {
      if (e.results && e.results.length > 0) {
        e.results.forEach(r => {
          totalStudentsEvaluated++;
          if (r.grade === 'Mumtaz') mumtazCount++;
          if (r.grade !== 'Rasib') passCount++;
        });
      }
    });

    const mumtazRate = totalStudentsEvaluated > 0 ? ((mumtazCount / totalStudentsEvaluated) * 100).toFixed(1) : '0';
    const passRate = totalStudentsEvaluated > 0 ? ((passCount / totalStudentsEvaluated) * 100).toFixed(1) : '0';

    return { total, completed, ongoing, upcoming, totalStudentsEvaluated, mumtazRate, passRate };
  }, [exams]);

  // Grade calculator helper
  const calculateGrade = (percentage: number): ExamGrade => {
    if (percentage >= 85) return 'Mumtaz';
    if (percentage >= 70) return 'Jayyid Jiddan';
    if (percentage >= 60) return 'Jayyid';
    if (percentage >= 50) return 'Hasan';
    if (percentage >= 40) return 'Maqbool';
    return 'Rasib';
  };

  // Preset Subject Loaders
  const handleLoadPreset = (type: 'hifz' | 'dars' | 'maktab') => {
    if (type === 'hifz') {
      setSubjectsList([
        { id: `sub-${Date.now()}-1`, name: 'Hifz Sabaq (جدید سبق)', nameUrdu: 'حفظ سبق', maxMarks: 100, passMarks: 40 },
        { id: `sub-${Date.now()}-2`, name: 'Sabqi (سبقی)', nameUrdu: 'سبقی', maxMarks: 50, passMarks: 20 },
        { id: `sub-${Date.now()}-3`, name: 'Amookhta / Manzil (آموختہ / منزل)', nameUrdu: 'آموختہ و منزل', maxMarks: 100, passMarks: 40 },
        { id: `sub-${Date.now()}-4`, name: 'Tajweed & Makharij (تجوید و مخارج)', nameUrdu: 'تجوید و مخارج', maxMarks: 50, passMarks: 20 }
      ]);
    } else if (type === 'dars') {
      setSubjectsList([
        { id: `sub-${Date.now()}-1`, name: 'Sarf & Nahw (صرف و نحو)', nameUrdu: 'صرف و نحو', maxMarks: 100, passMarks: 40 },
        { id: `sub-${Date.now()}-2`, name: 'Fiqh & Usool (فقہ و اصول فقہ)', nameUrdu: 'فقہ و اصول', maxMarks: 100, passMarks: 40 },
        { id: `sub-${Date.now()}-3`, name: 'Arabic Adab & Tarjuma (عربی ادب و ترجمہ)', nameUrdu: 'عربی ادب', maxMarks: 100, passMarks: 40 },
        { id: `sub-${Date.now()}-4`, name: 'Hadith Studies (علوم الحدیث)', nameUrdu: 'علوم الحدیث', maxMarks: 100, passMarks: 40 }
      ]);
    } else {
      setSubjectsList([
        { id: `sub-${Date.now()}-1`, name: 'Noorani Qaidah / Nazira (نورانی قاعدہ و ناظرہ)', nameUrdu: 'نورانی قاعدہ و ناظرہ', maxMarks: 100, passMarks: 40 },
        { id: `sub-${Date.now()}-2`, name: 'Deeniyat & Duas (دینیات و ادعیہ)', nameUrdu: 'دینیات و ادعیہ', maxMarks: 50, passMarks: 20 },
        { id: `sub-${Date.now()}-3`, name: 'Urdu Language (اردو زبان)', nameUrdu: 'اردو زبان', maxMarks: 50, passMarks: 20 }
      ]);
    }
  };

  // Add Custom Subject
  const handleAddSubject = () => {
    setSubjectsList(prev => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        name: `Subject ${prev.length + 1}`,
        nameUrdu: '',
        maxMarks: 100,
        passMarks: 40
      }
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjectsList.length <= 1) {
      showToast('Examination must contain at least one subject', 'warning');
      return;
    }
    setSubjectsList(prev => prev.filter(s => s.id !== id));
  };

  // Save new Examination
  const handleCreateExamination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      showToast('Please specify the Examination Title', 'warning');
      return;
    }

    const studentsInClass = db.getStudents(activeMadrasa?.id).filter(s => s.class === targetClass);
    
    // Pre-populate candidate results
    const initialResults: ExamStudentResult[] = studentsInClass.map(st => {
      const subjectMarks = subjectsList.map(sub => ({
        subjectId: sub.id,
        subjectName: sub.name,
        subjectNameUrdu: sub.nameUrdu,
        maxMarks: sub.maxMarks,
        obtainedMarks: 0
      }));
      const totalMax = subjectsList.reduce((sum, s) => sum + s.maxMarks, 0);

      return {
        studentId: st.id,
        studentName: st.studentName,
        studentNameUrdu: st.studentNameUrdu,
        admissionNo: st.admissionNo,
        className: targetClass,
        marks: subjectMarks,
        totalMaxMarks: totalMax,
        totalObtainedMarks: 0,
        percentage: 0,
        grade: 'Rasib'
      };
    });

    const newExam: Examination = {
      id: `exam-${Date.now()}`,
      madrasaId: activeMadrasa?.id || 'madrasa-1',
      title: examTitle.trim(),
      titleUrdu: examTitleUrdu.trim() || undefined,
      term: examTerm,
      academicYear,
      classId: `class-${targetClass.replace(/\s+/g, '-').toLowerCase()}`,
      className: targetClass,
      startDate,
      endDate,
      status: 'Upcoming',
      subjects: subjectsList,
      results: initialResults,
      createdAt: new Date().toISOString()
    };

    db.saveExamination(newExam);
    reloadExaminations();
    showToast(`Examination "${newExam.title}" scheduled with ${studentsInClass.length} registered candidates!`, 'success');
    setShowCreateModal(false);
    setExamTitle('');
    setExamTitleUrdu('');
  };

  // Open Marksheet Entry
  const handleOpenMarksheet = (exam: Examination) => {
    setActiveExam(exam);
    // Ensure all current students in class are represented
    const studentsInClass = db.getStudents(activeMadrasa?.id).filter(s => s.class === exam.className);
    const existingResults = [...(exam.results || [])];

    studentsInClass.forEach(st => {
      if (!existingResults.some(r => r.studentId === st.id)) {
        const totalMax = exam.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
        existingResults.push({
          studentId: st.id,
          studentName: st.studentName,
          studentNameUrdu: st.studentNameUrdu,
          admissionNo: st.admissionNo,
          className: exam.className,
          marks: exam.subjects.map(sub => ({
            subjectId: sub.id,
            subjectName: sub.name,
            subjectNameUrdu: sub.nameUrdu,
            maxMarks: sub.maxMarks,
            obtainedMarks: 0
          })),
          totalMaxMarks: totalMax,
          totalObtainedMarks: 0,
          percentage: 0,
          grade: 'Rasib'
        });
      }
    });

    setEditingResults(existingResults);
    setShowMarksheetModal(true);
  };

  // Update Mark for a Student in Marksheet
  const handleUpdateStudentMark = (studentId: string, subjectId: string, value: number) => {
    setEditingResults(prev => {
      return prev.map(res => {
        if (res.studentId !== studentId) return res;

        const updatedMarks = res.marks.map(m => {
          if (m.subjectId !== subjectId) return m;
          const clamped = Math.max(0, Math.min(m.maxMarks, isNaN(value) ? 0 : value));
          return { ...m, obtainedMarks: clamped };
        });

        const totalObtained = updatedMarks.reduce((sum, m) => sum + m.obtainedMarks, 0);
        const totalMax = updatedMarks.reduce((sum, m) => sum + m.maxMarks, 0);
        const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
        const grade = calculateGrade(percentage);

        return {
          ...res,
          marks: updatedMarks,
          totalObtainedMarks: totalObtained,
          totalMaxMarks: totalMax,
          percentage,
          grade
        };
      });
    });
  };

  // Save Marksheet
  const handleSaveMarksheet = () => {
    if (!activeExam) return;

    // Calculate positions/ranks based on percentage
    const sorted = [...editingResults].sort((a, b) => b.percentage - a.percentage);
    const withPositions = sorted.map((res, index) => ({
      ...res,
      position: index + 1
    }));

    const isAllGraded = withPositions.some(r => r.totalObtainedMarks > 0);
    const updatedStatus = isAllGraded ? 'Completed' : activeExam.status;

    const updatedExam: Examination = {
      ...activeExam,
      results: withPositions,
      status: updatedStatus
    };

    db.saveExamination(updatedExam);
    reloadExaminations();
    showToast(`Marksheet for "${activeExam.title}" saved successfully!`, 'success');
    setShowMarksheetModal(false);
  };

  // Delete Exam
  const handleDeleteExam = (exam: Examination) => {
    if (window.confirm(`Are you sure you want to delete examination "${exam.title}"?`)) {
      db.deleteExamination(exam.id);
      reloadExaminations();
      showToast(`Examination removed from records.`, 'info');
    }
  };

  // Open Gazette
  const handleOpenGazette = (exam: Examination) => {
    setActiveExam(exam);
    setShowGazetteModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-m3-primary/10 dark:bg-m3-primary/20 text-m3-primary flex items-center justify-center shrink-0 border border-m3-primary/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-m3-on-surface flex items-center gap-2">
              <span>Examinations & Sanad Evaluations</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-m3-primary/10 text-m3-primary border border-m3-primary/20">
                امتحانات و اسناد
              </span>
            </h1>
            <p className="text-xs text-m3-on-surface-variant mt-0.5">
              Examination schedules, interactive marksheet registers, and institutional result gazettes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-m3-outline-variant/30 text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container dark:hover:bg-m3-surface-container-high transition-colors"
          >
            <Printer className="w-4 h-4 text-m3-primary" />
            <span>Print Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 text-white text-xs font-bold shadow-m3-2 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Examination</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-m3-surface-container p-4.5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant block">Total Exams</span>
            <span className="text-lg font-black text-m3-on-surface font-mono">{metrics.total} Cohorts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-m3-surface-container p-4.5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant block">Ongoing / Active</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{metrics.ongoing} Active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-m3-surface-container p-4.5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant block">Mumtaz (Distinction)</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{metrics.mumtazRate}% Rate</span>
          </div>
        </div>

        <div className="bg-white dark:bg-m3-surface-container p-4.5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant block">Overall Pass Rate</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">{metrics.passRate}% Passed</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-m3-surface-container p-4 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search examinations by title, class, or term..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface focus:ring-2 focus:ring-m3-primary/30"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="p-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
          >
            <option value="all">All Academic Terms</option>
            <option value="Quarterly">Quarterly (سہ ماہی)</option>
            <option value="Half-Yearly">Half-Yearly (ششماہی)</option>
            <option value="Annual">Annual (سالانہ)</option>
            <option value="Sanad">Sanad / Final (سند)</option>
            <option value="Monthly">Monthly (ماہانہ)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Examinations Grid */}
      {filteredExams.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
          <FileSpreadsheet className="w-12 h-12 text-m3-on-surface-variant/40 mx-auto" />
          <h3 className="text-sm font-bold text-m3-on-surface">No Examinations Found</h3>
          <p className="text-xs text-m3-on-surface-variant max-w-md mx-auto">
            Schedule a new examination term, set up subjects and grading parameters, and start recording student marksheets.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-m3-primary text-white text-xs font-bold shadow-xs hover:bg-m3-primary/90 mt-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create First Examination</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const totalCandidates = exam.results?.length || 0;
            const gradedCount = exam.results?.filter(r => r.totalObtainedMarks > 0).length || 0;
            const statusColor = 
              exam.status === 'Completed'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                : exam.status === 'Ongoing'
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40';

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 p-5 space-y-4 hover:shadow-m3-2 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-m3-surface-container-high text-m3-on-surface-variant">
                      {exam.term} &bull; {exam.academicYear}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                      {exam.status}
                    </span>
                  </div>

                  {/* Title and Class */}
                  <div>
                    <h3 className="text-sm font-bold text-m3-on-surface line-clamp-1">
                      {exam.title}
                    </h3>
                    {exam.titleUrdu && (
                      <p className="text-xs font-semibold text-m3-on-surface-variant urdu-font text-right mt-0.5">
                        {exam.titleUrdu}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-m3-primary">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{exam.className}</span>
                    </div>
                  </div>

                  {/* Date and Subjects Info */}
                  <div className="p-3 rounded-2xl bg-m3-surface-container-low dark:bg-m3-surface-container-high/40 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-m3-on-surface-variant text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-m3-primary" />
                        <span>Schedule:</span>
                      </span>
                      <span className="font-mono font-bold text-m3-on-surface">
                        {exam.startDate} &rarr; {exam.endDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-m3-on-surface-variant text-[11px]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-m3-primary" />
                        <span>Candidates:</span>
                      </span>
                      <span className="font-mono font-bold text-m3-on-surface">
                        {gradedCount} / {totalCandidates} Graded
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-m3-on-surface-variant text-[11px]">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-m3-primary" />
                        <span>Subjects:</span>
                      </span>
                      <span className="font-semibold text-m3-on-surface">
                        {exam.subjects.length} Subjects
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-2 border-t border-m3-outline-variant/20">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMarksheet(exam)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-m3-primary/10 hover:bg-m3-primary/20 text-m3-primary text-xs font-bold transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Marksheet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenGazette(exam)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Result Gazette</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-m3-on-surface-variant">
                      ID: {exam.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExam(exam)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete Examination"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CREATE NEW EXAMINATION
          ========================================================================= */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule New Examination (امتحانی جدول)"
        subtitle="Configure evaluation term, class assignment, dates, and subject marks"
        maxWidth="3xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-bold text-m3-on-surface-variant hover:bg-black/5 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateExamination}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-m3-primary text-white rounded-full hover:bg-m3-primary/90 transition-all shadow-m3-1"
            >
              <Save className="w-4 h-4" />
              <span>Save & Schedule Exam</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateExamination} className="space-y-5 p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-m3-on-surface mb-1">
                Exam Title (English) *
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Half-Yearly Hifz & Tajweed Assessment"
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-m3-on-surface mb-1">
                Exam Title (Urdu)
              </label>
              <input
                type="text"
                value={examTitleUrdu}
                onChange={(e) => setExamTitleUrdu(e.target.value)}
                placeholder="مثلاً: ششماہی امتحانِ حفظ و تجوید"
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface urdu-font text-right font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-m3-on-surface mb-1">
                Examination Term *
              </label>
              <select
                value={examTerm}
                onChange={(e) => setExamTerm(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
              >
                <option value="Quarterly">Quarterly (سہ ماہی)</option>
                <option value="Half-Yearly">Half-Yearly (ششماہی)</option>
                <option value="Annual">Annual (سالانہ)</option>
                <option value="Sanad">Sanad / Final (سند فراغت)</option>
                <option value="Monthly">Monthly (ماہانہ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-m3-on-surface mb-1">
                Target Class / Department *
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
              >
                {classesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-m3-on-surface mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-m3-on-surface mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono"
                required
              />
            </div>
          </div>

          {/* Subjects Configuration */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-m3-outline-variant/20 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Subjects & Evaluation Metrics</span>
              </span>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-m3-on-surface-variant font-medium">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('hifz')}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20"
                >
                  Hifz Presets
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('dars')}
                  className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold hover:bg-blue-500/20"
                >
                  Dars-e-Nizami
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('maktab')}
                  className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-bold hover:bg-purple-500/20"
                >
                  Maktab / Nazira
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {subjectsList.map((sub, index) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-m3-surface-container-low dark:bg-m3-surface-container-high/40 border border-m3-outline-variant/20"
                >
                  <span className="w-5 text-center text-xs font-bold text-m3-on-surface-variant">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubjectsList(prev => prev.map(s => s.id === sub.id ? { ...s, name: val } : s));
                    }}
                    placeholder="Subject Name (e.g. Hifz Sabaq)"
                    className="flex-1 p-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container text-m3-on-surface font-medium"
                  />
                  <input
                    type="number"
                    value={sub.maxMarks}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSubjectsList(prev => prev.map(s => s.id === sub.id ? { ...s, maxMarks: val } : s));
                    }}
                    placeholder="Max"
                    title="Max Marks"
                    className="w-18 p-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container text-m3-on-surface font-mono font-bold text-center"
                  />
                  <input
                    type="number"
                    value={sub.passMarks}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSubjectsList(prev => prev.map(s => s.id === sub.id ? { ...s, passMarks: val } : s));
                    }}
                    placeholder="Pass"
                    title="Pass Marks"
                    className="w-18 p-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container text-m3-on-surface font-mono text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSubject}
              className="flex items-center gap-1.5 text-xs font-bold text-m3-primary hover:underline pt-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Another Subject</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: MARKSHEET ENTRY REGISTER
          ========================================================================= */}
      <Modal
        isOpen={showMarksheetModal}
        onClose={() => setShowMarksheetModal(false)}
        title={`Marksheet Register: ${activeExam?.title || ''}`}
        subtitle={`Class: ${activeExam?.className} &bull; Term: ${activeExam?.term}`}
        maxWidth="5xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-m3-on-surface-variant">
              Grades and Positions update automatically upon entering marks.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMarksheetModal(false)}
                className="px-4 py-2 text-xs font-bold text-m3-on-surface-variant hover:bg-black/5 rounded-full transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveMarksheet}
                className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-m3-primary text-white rounded-full hover:bg-m3-primary/90 transition-all shadow-m3-1"
              >
                <Save className="w-4 h-4" />
                <span>Save All Marks</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {editingResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-m3-on-surface-variant">
              No students enrolled in this class ({activeExam?.className}).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-m3-surface-container-high text-m3-on-surface font-bold sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">Adm No</th>
                    <th className="p-2.5">Talib-e-Ilm</th>
                    {activeExam?.subjects.map(sub => (
                      <th key={sub.id} className="p-2.5 text-center min-w-[85px]">
                        <div>{sub.name}</div>
                        <span className="text-[10px] font-normal text-m3-on-surface-variant">Max: {sub.maxMarks}</span>
                      </th>
                    ))}
                    <th className="p-2.5 text-center">Total</th>
                    <th className="p-2.5 text-center">%</th>
                    <th className="p-2.5 text-center rounded-r-xl">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-m3-outline-variant/10">
                  {editingResults.map(res => (
                    <tr key={res.studentId} className="hover:bg-m3-surface-container-low dark:hover:bg-m3-surface-container-high/30 transition-colors">
                      <td className="p-2.5 font-mono font-bold text-m3-primary text-[11px]">
                        {res.admissionNo}
                      </td>
                      <td className="p-2.5">
                        <span className="font-bold text-m3-on-surface block">{res.studentName}</span>
                        {res.studentNameUrdu && (
                          <span className="text-[10px] text-m3-on-surface-variant urdu-font block">{res.studentNameUrdu}</span>
                        )}
                      </td>

                      {/* Subject Mark Inputs */}
                      {activeExam?.subjects.map(sub => {
                        const m = res.marks.find(item => item.subjectId === sub.id);
                        const val = m ? m.obtainedMarks : 0;
                        return (
                          <td key={sub.id} className="p-2.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={sub.maxMarks}
                              value={val}
                              onChange={(e) => handleUpdateStudentMark(res.studentId, sub.id, Number(e.target.value))}
                              className="w-16 p-1.5 text-center text-xs font-mono font-bold rounded-lg border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container text-m3-on-surface focus:ring-2 focus:ring-m3-primary/30"
                            />
                          </td>
                        );
                      })}

                      <td className="p-2.5 text-center font-mono font-bold text-m3-on-surface">
                        {res.totalObtainedMarks} / {res.totalMaxMarks}
                      </td>

                      <td className="p-2.5 text-center font-mono font-black text-m3-primary">
                        {res.percentage}%
                      </td>

                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          res.grade === 'Mumtaz'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : res.grade === 'Jayyid Jiddan' || res.grade === 'Jayyid'
                            ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                            : res.grade === 'Rasib'
                            ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                        }`}>
                          {res.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: OFFICIAL RESULT GAZETTE & PRINT PREVIEW
          ========================================================================= */}
      <Modal
        isOpen={showGazetteModal}
        onClose={() => setShowGazetteModal(false)}
        title="Result Gazette (امتحانی گزٹ)"
        subtitle={`Official Gazette for ${activeExam?.title || ''}`}
        maxWidth="5xl"
        allowPrint={true}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-m3-on-surface-variant">
              Approved by Mohtamim & Head Examiner &bull; Jamia Records
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGazetteModal(false)}
                className="px-4 py-2 text-xs font-bold text-m3-on-surface-variant hover:bg-black/5 rounded-full transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-m3-primary text-white rounded-full hover:bg-m3-primary/90 transition-all shadow-m3-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Gazette</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="p-6 bg-white dark:bg-m3-surface-container rounded-2xl border border-m3-outline-variant/30 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Institutional Gazette Header */}
          <div className="text-center space-y-1.5 border-b-2 border-m3-primary/30 pb-4">
            <div className="flex items-center justify-center gap-3">
              {activeMadrasa?.logoUrl && (
                <img src={activeMadrasa.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
              )}
              <div>
                <h2 className="text-lg font-black text-m3-on-surface">
                  {activeMadrasa?.name || 'JAMIA ISLAMIA ARABIA'}
                </h2>
                <p className="text-sm font-bold text-m3-primary urdu-font">
                  {activeMadrasa?.nameUrdu || 'جامعہ اسلامیہ عربیہ'}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-m3-on-surface-variant">
              {activeMadrasa?.address || 'Department of Examination & Sanad Issuance'}
            </p>
            <div className="inline-block mt-2 px-4 py-1 rounded-full bg-m3-primary/10 text-m3-primary text-xs font-black uppercase tracking-wider">
              OFFICIAL RESULT GAZETTE &bull; {activeExam?.term} {activeExam?.academicYear}
            </div>
          </div>

          {/* Exam Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-m3-surface-container-low dark:bg-m3-surface-container-high/30 p-3 rounded-xl">
            <div>
              <span className="text-[10px] text-m3-on-surface-variant block">Examination:</span>
              <span className="font-bold text-m3-on-surface">{activeExam?.title}</span>
            </div>
            <div>
              <span className="text-[10px] text-m3-on-surface-variant block">Class / Department:</span>
              <span className="font-bold text-m3-on-surface">{activeExam?.className}</span>
            </div>
            <div>
              <span className="text-[10px] text-m3-on-surface-variant block">Date of Assessment:</span>
              <span className="font-bold text-m3-on-surface font-mono">{activeExam?.startDate} to {activeExam?.endDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-m3-on-surface-variant block">Total Candidates:</span>
              <span className="font-bold text-m3-on-surface font-mono">{activeExam?.results?.length || 0} Registered</span>
            </div>
          </div>

          {/* Gazette Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-m3-outline-variant/30 text-m3-on-surface font-bold bg-m3-surface-container-high">
                  <th className="p-2">Rank</th>
                  <th className="p-2">Adm No</th>
                  <th className="p-2">Talib-e-Ilm (Name)</th>
                  {activeExam?.subjects.map(s => (
                    <th key={s.id} className="p-2 text-center text-[11px]">
                      {s.name}
                    </th>
                  ))}
                  <th className="p-2 text-center">Marks</th>
                  <th className="p-2 text-center">%</th>
                  <th className="p-2 text-center">Grade (درجہ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-m3-outline-variant/10">
                {activeExam?.results?.map((r, idx) => (
                  <tr key={r.studentId} className="hover:bg-m3-surface-container-low">
                    <td className="p-2 font-mono font-bold text-m3-primary">
                      #{r.position || idx + 1}
                    </td>
                    <td className="p-2 font-mono text-[11px]">{r.admissionNo}</td>
                    <td className="p-2">
                      <span className="font-bold text-m3-on-surface block">{r.studentName}</span>
                      {r.studentNameUrdu && (
                        <span className="text-[10px] text-m3-on-surface-variant urdu-font block">{r.studentNameUrdu}</span>
                      )}
                    </td>
                    {activeExam.subjects.map(s => {
                      const m = r.marks.find(item => item.subjectId === s.id);
                      return (
                        <td key={s.id} className="p-2 text-center font-mono">
                          {m ? m.obtainedMarks : '-'}
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-mono font-bold">
                      {r.totalObtainedMarks} / {r.totalMaxMarks}
                    </td>
                    <td className="p-2 text-center font-mono font-black text-m3-primary">
                      {r.percentage}%
                    </td>
                    <td className="p-2 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        r.grade === 'Mumtaz' ? 'text-emerald-700 dark:text-emerald-400 font-black' :
                        r.grade === 'Rasib' ? 'text-red-600 font-black' : 'text-m3-on-surface'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Footer */}
          <div className="pt-10 flex items-center justify-between text-center text-xs text-m3-on-surface font-semibold border-t border-dashed border-m3-outline-variant/30">
            <div>
              <div className="w-40 border-b border-m3-on-surface-variant/40 mb-1.5 mx-auto" />
              <span>Head Examiner (ممتحن اعلیٰ)</span>
            </div>
            <div>
              <div className="w-40 border-b border-m3-on-surface-variant/40 mb-1.5 mx-auto" />
              <span>Education In-charge (ناظم تعلیمات)</span>
            </div>
            <div>
              <div className="w-40 border-b border-m3-on-surface-variant/40 mb-1.5 mx-auto" />
              <span>Mohtamim (مہتمم دار العلوم)</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
