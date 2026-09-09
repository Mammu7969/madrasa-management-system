import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { MadrasaClass, Subject } from '../../types';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Plus, 
  DoorOpen, 
  Trash2, 
  Clock, 
  Search, 
  FileText, 
  Layers, 
  Library, 
  Bookmark, 
  BookMarked,
  Edit3
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const ClassesModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { language, showToast } = useTheme();

  // Active language flags
  const isUrdu = language === 'ur';

  // Strict localized string helper
  const loc = (en: string, ur: string, _te?: string): string => {
    if (isUrdu) return ur;
    return en;
  };

  // Active Tab: 'classes' | 'subjects'
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

  // Classes & Subjects State
  const [classes, setClasses] = useState<MadrasaClass[]>(() => db.getClasses(activeMadrasa?.id));
  const [subjects, setSubjects] = useState<Subject[]>(() => db.getSubjects(activeMadrasa?.id));
  const students = db.getStudents(activeMadrasa?.id);
  const teachers = db.getTeachers(activeMadrasa?.id);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Modal: Add Class
  const [showAddClassModal, setShowAddClassModal] = useState<boolean>(false);
  const [classNameInput, setClassNameInput] = useState<string>('');
  const [category, setCategory] = useState<string>('Tahfeez');
  const [incharge, setIncharge] = useState<string>(teachers[0]?.name || 'Qari Mohammad Huzaifa');
  const [startTime, setStartTime] = useState<string>('08:00 AM');
  const [endTime, setEndTime] = useState<string>('01:30 PM');
  const [room, setRoom] = useState<string>('Hall A-1');
  const [capacity, setCapacity] = useState<number>(35);
  const [description, setDescription] = useState<string>('');

  // Modal: Edit Class
  const [editingClass, setEditingClass] = useState<MadrasaClass | null>(null);
  const [showEditClassModal, setShowEditClassModal] = useState<boolean>(false);
  const [editClassNameInput, setEditClassNameInput] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('Tahfeez');
  const [editIncharge, setEditIncharge] = useState<string>('');
  const [editStartTime, setEditStartTime] = useState<string>('08:00 AM');
  const [editEndTime, setEditEndTime] = useState<string>('01:30 PM');
  const [editRoom, setEditRoom] = useState<string>('Hall A-1');
  const [editCapacity, setEditCapacity] = useState<number>(35);
  const [editDescription, setEditDescription] = useState<string>('');

  // Modal: Add Subject
  const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
  const [subjectNameInput, setSubjectNameInput] = useState<string>('');
  const [subjectBookNameInput, setSubjectBookNameInput] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(604);
  const [subjectClass, setSubjectClass] = useState<string>(classes[0]?.name || 'Hifz Section A');
  const [subjectTeacher, setSubjectTeacher] = useState<string>(teachers[0]?.name || 'Qari Mohammad Huzaifa');
  const [subjectCategory, setSubjectCategory] = useState<string>('Quran Memorization');
  const [subjectAuthor, setSubjectAuthor] = useState<string>('');
  const [subjectDescription, setSubjectDescription] = useState<string>('');

  // Modal: Edit Subject
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState<boolean>(false);
  const [editSubjectNameInput, setEditSubjectNameInput] = useState<string>('');
  const [editSubjectBookNameInput, setEditSubjectBookNameInput] = useState<string>('');
  const [editSubjectTotalPages, setEditSubjectTotalPages] = useState<number>(100);
  const [editSubjectClass, setEditSubjectClass] = useState<string>('');
  const [editSubjectTeacher, setEditSubjectTeacher] = useState<string>('');
  const [editSubjectCategory, setEditSubjectCategory] = useState<string>('');
  const [editSubjectAuthor, setEditSubjectAuthor] = useState<string>('');
  const [editSubjectDescription, setEditSubjectDescription] = useState<string>('');

  const quickShifts = [
    { label: loc('Morning (08:00 AM - 01:30 PM)', 'صبح (08:00 AM - 01:30 PM)', 'ఉదయం (08:00 AM - 01:30 PM)'), start: '08:00 AM', end: '01:30 PM' },
    { label: loc('Afternoon (02:00 PM - 05:00 PM)', 'بعد ظہر (02:00 PM - 05:00 PM)', 'మధ్యాహ్నం (02:00 PM - 05:00 PM)'), start: '02:00 PM', end: '05:00 PM' },
    { label: loc('Evening (04:30 PM - 07:00 PM)', 'بعد عصر (04:30 PM - 07:00 PM)', 'సాయంత్రం (04:30 PM - 07:00 PM)'), start: '04:30 PM', end: '07:00 PM' },
    { label: loc('Night (08:30 PM - 10:30 PM)', 'بعد عشاء (08:30 PM - 10:30 PM)', 'రాత్రి (08:30 PM - 10:30 PM)'), start: '08:30 PM', end: '10:30 PM' }
  ];

  const classCategories = [
    { value: 'Tahfeez', label: loc('Tahfeez (Hifz Quran)', 'شعبہ حفظِ قرآن', 'హిఫ్జ్ విభాగం') },
    { value: 'Quran Recitation', label: loc('Quran Recitation (Nazira)', 'شعبہ ناظرہ قرآن', 'నాజిరా విభాగం') },
    { value: 'Noorani Qaida', label: loc('Noorani Qaida', 'نورانی قاعدہ', 'నూరానీ ఖైదా') },
    { value: 'Tajweed & Qiraat', label: loc('Tajweed & Qiraat', 'تجوید و قراءت', 'తజ్వీద్ & ఖిరాఅత్') },
    { value: 'Dars-e-Nizami', label: loc('Dars-e-Nizami (Alimiyat)', 'درسِ نظامی عالمیت', 'ఆలిమియత్ విభాగం') },
    { value: 'Hifz Prep', label: loc('Hifz Preparatory', 'حفظ ابتدائی تیاری', 'హిఫ్జ్ సన్నాహక') },
    { value: 'Primary Maktab', label: loc('Primary Maktab', 'پرائمری مکتب', 'ప్రాథమిక మక్తబ్') }
  ];

  const subjectCategories = [
    { value: 'Quran Memorization', label: loc('Quran Memorization (Hifz)', 'حفظِ قرآن کریم', 'ఖురాన్ హిఫ్జ్') },
    { value: 'Nazira & Tajweed', label: loc('Nazira & Tajweed', 'ناظرہ و تجوید', 'నాజిరా & తజ్వీద్') },
    { value: 'Noorani Qaida', label: loc('Noorani Qaida', 'نورانی قاعدہ', 'నూరానీ ఖైదా') },
    { value: 'Arabic Grammar', label: loc('Arabic Grammar (Nahw & Sarf)', 'عربی گرامر و نحو و صرف', 'అరబిక్ వ్యాకరణం') },
    { value: 'Islamic Jurisprudence', label: loc('Islamic Jurisprudence (Fiqh)', 'فقہ اسلامی و احکام', 'ఇస్లామిక్ ఫిఖ్') },
    { value: 'Hadith Studies', label: loc('Hadith Studies', 'حدیث شریف و سنت', 'హదీస్ అధ్యయనం') },
    { value: 'Arabic Literature', label: loc('Arabic Literature & Adab', 'عربی ادب و انشاء', 'అరబిక్ సాహిత్యం') },
    { value: 'Islamic History', label: loc('Islamic History & Seerah', 'سیرت النبیؐ و تاریخ', 'ఇస్లామిక్ చరిత్ర') },
    { value: 'General Studies', label: loc('General Studies', 'عصری علوم و کتب', 'సాధారణ విద్య') }
  ];

  // Helper for localized class name
  const getDisplayClassName = (c: MadrasaClass): string => {
    if (isUrdu) return c.nameUrdu || c.name;
    return c.name;
  };

  // Helper for localized subject name
  const getDisplaySubjectName = (s: Subject): string => {
    if (isUrdu) return s.nameUrdu || s.name;
    return s.name;
  };

  // Helper for localized book name
  const getDisplayBookName = (s: Subject): string => {
    if (isUrdu) return s.bookNameUrdu || s.bookName || s.nameUrdu || s.name;
    return s.bookName || s.name;
  };

  // Handler: Create Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim() || !activeMadrasa) {
      showToast(loc('Please enter class name', 'براہِ کرم درجہ کا نام درج کریں', 'దయచేసి తరగతి పేరు నమోదు చేయండి'), 'error');
      return;
    }

    const trimmedName = classNameInput.trim();
    const newClass: MadrasaClass = {
      id: `cls-${Date.now()}`,
      name: trimmedName,
      nameUrdu: trimmedName,
      category,
      incharge: incharge.trim(),
      startTime: startTime.trim() || '08:00 AM',
      endTime: endTime.trim() || '01:30 PM',
      schedule: `${startTime.trim() || '08:00 AM'} - ${endTime.trim() || '01:30 PM'}`,
      room: room.trim() || loc('General Hall', 'مرکزی ہال', 'సాధారణ హాల్'),
      capacity: Number(capacity) || 30,
      madrasaId: activeMadrasa.id,
      description: description.trim() || undefined
    };

    db.addClass(newClass);
    const updated = db.getClasses(activeMadrasa.id);
    setClasses(updated);
    showToast(
      loc(
        `Class "${newClass.name}" registered successfully!`,
        `درجہ "${newClass.nameUrdu || newClass.name}" کامیابی سے درج کر لیا گیا!`,
        `తరగతి "${newClass.name}" విజయవంతంగా నమోదైంది!`
      ),
      'success'
    );

    // Reset Form
    setClassNameInput('');
    setDescription('');
    setStartTime('08:00 AM');
    setEndTime('01:30 PM');
    setShowAddClassModal(false);
  };

  const handleDeleteClass = (classId: string, name: string) => {
    const confirmMsg = loc(
      `Are you sure you want to delete class "${name}"?`,
      `کیا آپ واقعی درجہ "${name}" حذف کرنا چاہتے ہیں؟`,
      `మీరు ఖచ్చితంగా "${name}" తరగతిని తొలగించాలనుకుంటున్నారా?`
    );
    if (window.confirm(confirmMsg)) {
      db.deleteClass(classId);
      const updated = db.getClasses(activeMadrasa?.id);
      setClasses(updated);
      showToast(loc(`Class "${name}" removed.`, `درجہ "${name}" خارج کر دیا گیا۔`, `తరగతి "${name}" తొలగించబడింది.`), 'info');
    }
  };

  // Open Edit Class Modal
  const openEditClassModal = (cls: MadrasaClass) => {
    setEditingClass(cls);
    setEditClassNameInput(isUrdu ? (cls.nameUrdu || cls.name) : cls.name);
    setEditCategory(cls.category || 'Tahfeez');
    setEditIncharge(cls.incharge || teachers[0]?.name || '');
    setEditStartTime(cls.startTime || '08:00 AM');
    setEditEndTime(cls.endTime || '01:30 PM');
    setEditRoom(cls.room || loc('General Hall', 'مرکزی ہال', 'సాధారణ హాల్'));
    setEditCapacity(cls.capacity || 30);
    setEditDescription(cls.description || '');
    setShowEditClassModal(true);
  };

  // Save Edit Class Changes
  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassNameInput.trim() || !activeMadrasa) return;

    const trimmedName = editClassNameInput.trim();
    const updated: MadrasaClass = {
      ...editingClass,
      name: trimmedName,
      nameUrdu: trimmedName,
      category: editCategory,
      incharge: editIncharge.trim(),
      startTime: editStartTime.trim() || '08:00 AM',
      endTime: editEndTime.trim() || '01:30 PM',
      schedule: `${editStartTime.trim() || '08:00 AM'} - ${editEndTime.trim() || '01:30 PM'}`,
      room: editRoom.trim() || loc('General Hall', 'مرکزی ہال', 'సాధారణ హాల్'),
      capacity: Number(editCapacity) || 30,
      description: editDescription.trim() || undefined
    };

    db.updateClass(updated);
    const refreshed = db.getClasses(activeMadrasa.id);
    setClasses(refreshed);
    showToast(
      loc(
        `Class "${updated.name}" updated successfully!`,
        `درجہ "${updated.nameUrdu || updated.name}" میں تبدیلیاں محفوظ ہو گئیں!`,
        `తరగతి "${updated.name}" విజయవంతంగా నవీకరించబడింది!`
      ),
      'success'
    );
    setShowEditClassModal(false);
    setEditingClass(null);
  };

  // Handler: Create Subject
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectNameInput.trim() || !activeMadrasa) {
      showToast(loc('Please enter subject name', 'براہِ کرم مضمون کا نام درج کریں', 'దయచేసి సబ్జెక్ట్ పేరు నమోదు చేయండి'), 'error');
      return;
    }

    const trimmedSubjName = subjectNameInput.trim();
    const trimmedBookName = subjectBookNameInput.trim() || trimmedSubjName;

    const newSubject: Subject = {
      id: `sbj-${Date.now()}`,
      name: trimmedSubjName,
      nameUrdu: trimmedSubjName,
      bookName: trimmedBookName,
      bookNameUrdu: trimmedBookName,
      className: subjectClass.trim() || classes[0]?.name || 'General',
      totalPages: Number(totalPages) || 100,
      teacherName: subjectTeacher.trim() || undefined,
      category: subjectCategory.trim() || 'Islamic Studies',
      author: subjectAuthor.trim() || undefined,
      madrasaId: activeMadrasa.id,
      description: subjectDescription.trim() || undefined
    };

    db.addSubject(newSubject);
    const updated = db.getSubjects(activeMadrasa.id);
    setSubjects(updated);
    showToast(
      loc(
        `Subject "${newSubject.name}" with ${newSubject.totalPages} pages added successfully!`,
        `نیا مضمون "${newSubject.nameUrdu || newSubject.name}" مع کل ${newSubject.totalPages} صفحات کامیابی سے شامل کر دیا گیا!`
      ),
      'success'
    );

    // Reset Form
    setSubjectNameInput('');
    setSubjectBookNameInput('');
    setTotalPages(100);
    setSubjectAuthor('');
    setSubjectDescription('');
    setShowAddSubjectModal(false);
  };

  // Open Edit Subject Modal
  const openEditSubjectModal = (s: Subject) => {
    setEditingSubject(s);
    setEditSubjectNameInput(isUrdu ? (s.nameUrdu || s.name) : s.name);
    setEditSubjectBookNameInput(isUrdu ? (s.bookNameUrdu || s.bookName || s.nameUrdu || s.name) : (s.bookName || s.name));
    setEditSubjectTotalPages(s.totalPages || 100);
    setEditSubjectClass(s.className || classes[0]?.name || 'General');
    setEditSubjectTeacher(s.teacherName || teachers[0]?.name || '');
    setEditSubjectCategory(s.category || 'Quran Memorization');
    setEditSubjectAuthor(s.author || '');
    setEditSubjectDescription(s.description || '');
    setShowEditSubjectModal(true);
  };

  // Handler: Update Subject
  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editSubjectNameInput.trim() || !activeMadrasa) return;

    const trimmedSubjName = editSubjectNameInput.trim();
    const trimmedBookName = editSubjectBookNameInput.trim() || trimmedSubjName;

    const updated: Subject = {
      ...editingSubject,
      name: trimmedSubjName,
      nameUrdu: trimmedSubjName,
      bookName: trimmedBookName,
      bookNameUrdu: trimmedBookName,
      className: editSubjectClass.trim() || 'General',
      totalPages: Number(editSubjectTotalPages) || 100,
      teacherName: editSubjectTeacher.trim() || undefined,
      category: editSubjectCategory.trim() || undefined,
      author: editSubjectAuthor.trim() || undefined,
      description: editSubjectDescription.trim() || undefined
    };

    db.updateSubject(updated);
    const refreshed = db.getSubjects(activeMadrasa.id);
    setSubjects(refreshed);
    showToast(
      loc(
        `Subject "${updated.name}" updated successfully!`,
        `مضمون "${updated.nameUrdu || updated.name}" میں تبدیلیاں محفوظ ہو گئیں!`,
        `సబ్జెక్ట్ "${updated.name}" విజయవంతంగా నవీకరించబడింది!`
      ),
      'success'
    );
    setShowEditSubjectModal(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId: string, name: string) => {
    const confirmMsg = loc(
      `Are you sure you want to delete subject "${name}"?`,
      `کیا آپ واقعی مضمون "${name}" حذف کرنا چاہتے ہیں؟`,
      `మీరు ఖచ్చితంగా "${name}" సబ్జెక్ట్‌ను తొలగించాలనుకుంటున్నారా?`
    );
    if (window.confirm(confirmMsg)) {
      db.deleteSubject(subjectId);
      const updated = db.getSubjects(activeMadrasa?.id);
      setSubjects(updated);
      showToast(loc(`Subject "${name}" deleted.`, `مضمون "${name}" حذف کر دیا گیا۔`, `సబ్జెక్ట్ "${name}" తొలగించబడింది.`), 'info');
    }
  };

  // Filtering Classes
  const filteredClasses = classes.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      c.name.toLowerCase().includes(q) ||
      (c.nameUrdu && c.nameUrdu.includes(searchQuery)) ||
      c.incharge.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || c.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Filtering Subjects
  const filteredSubjects = subjects.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      s.name.toLowerCase().includes(q) ||
      (s.nameUrdu && s.nameUrdu.includes(searchQuery)) ||
      (s.bookName && s.bookName.toLowerCase().includes(q)) ||
      (s.bookNameUrdu && s.bookNameUrdu.includes(searchQuery)) ||
      (s.author && s.author.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q));

    const matchesClass = selectedClassFilter === 'all' || s.className === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  const totalCurriculumPages = subjects.reduce((acc, s) => acc + (s.totalPages || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner with Module Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-m3-primary/10 text-m3-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                {loc('Academic Curricula', 'تعلیمی نصاب و درجات', 'విద్యా ప్రణాళిక')}
              </span>
              <span className="text-xs text-gray-500 font-bold">
                {loc(
                  `${classes.length} Classes • ${subjects.length} Subjects • ${totalCurriculumPages.toLocaleString()} Total Pages`,
                  `${classes.length} درجات • ${subjects.length} مضامین • کل صفحات: ${totalCurriculumPages.toLocaleString()}`,
                  `${classes.length} తరగతులు • ${subjects.length} సబ్జెక్టులు • మొత్తం పేజీలు: ${totalCurriculumPages.toLocaleString()}`
                )}
              </span>
            </div>
            <h2 className="text-xl font-bold text-m3-on-surface">
              {loc('Classes & Subjects', 'درجات و مضامین', 'తరగతులు & సబ్జెక్టులు')}
            </h2>
            <p className="text-xs text-m3-on-surface-variant">
              {loc(
                'Academic departments, class schedules, textbook syllabi, book pages, and teachers',
                'تعلیمی شعبہ جات، اوقاتِ تدریس، نصابی کتب، صفحات اور اساتذہ کرام کی مکمل تفصیلات',
                'విద్యా విభాగాలు, తరగతి వేళలు, పాఠ్యపుస్తకాలు, పేజీలు మరియు ఉపాధ్యాయులు'
              )}
            </p>
          </div>
        </div>

        {/* Action Button based on active tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'classes' ? (
            <button
              type="button"
              onClick={() => setShowAddClassModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 text-white text-xs font-bold shadow-m3-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{loc('New Class', 'نیا درجہ', 'కొత్త తరగతి')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddSubjectModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-m3-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{loc('Add Subject', 'نیا مضمون', 'కొత్త సబ్జెక్ట్')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation: List of Classes vs List of Subjects */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'classes'
              ? 'border-m3-primary text-m3-primary'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{loc('List of Classes', 'درجات کی فہرست', 'తరగతుల జాబితా')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'classes' ? 'bg-m3-primary/10 text-m3-primary' : 'bg-gray-100 text-gray-600'}`}>
            {classes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'subjects'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>{loc('List of Subjects', 'مضامین و کتب کی فہرست', 'సబ్జెక్టుల జాబితా')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'subjects' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {subjects.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LIST OF CLASSES */}
      {/* ========================================================= */}
      {activeTab === 'classes' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-m3-outline-variant/20">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={loc('Search class, incharge, room...', 'درجہ، استاد، یا کمرہ تلاش کریں...', 'తరగతి, ఉపాధ్యాయుడు, గదిని శోధించండి...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'all' 
                    ? 'bg-m3-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {loc('All Classes', 'تمام درجات', 'అన్ని తరగతులు')} ({classes.length})
              </button>
              <button
                onClick={() => setSelectedCategory('tahfeez')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'tahfeez' 
                    ? 'bg-m3-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {loc('Hifz', 'حفظ', 'హిఫ్జ్')}
              </button>
              <button
                onClick={() => setSelectedCategory('recitation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'recitation' 
                    ? 'bg-m3-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {loc('Nazira', 'ناظرہ', 'నాజిరా')}
              </button>
              <button
                onClick={() => setSelectedCategory('dars')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'dars' 
                    ? 'bg-m3-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {loc('Alimiyat', 'درس نظامی', 'ఆలిమియత్')}
              </button>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClasses.map(c => {
              const classStudents = students.filter(s => s.class === c.name);
              const classSubjects = subjects.filter(s => s.className === c.name);
              const enrolledCount = classStudents.length;
              const capacityPercent = c.capacity ? Math.min(100, Math.round((enrolledCount / c.capacity) * 100)) : 80;

              return (
                <div 
                  key={c.id || c.name} 
                  onClick={() => openEditClassModal(c)}
                  className="bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 hover:shadow-m3-2 p-5 flex flex-col justify-between space-y-4 transition-all cursor-pointer hover:border-emerald-500/50 group"
                  title={loc('Click to edit class, change Ustadh, or update timings', 'درجہ میں ترمیم، استاد کی تبدیلی یا اوقات بدلنے کے لیے کلک کریں', 'తరగతిని సవరించడానికి క్లిక్ చేయండి')}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-m3-primary bg-m3-primary-container px-2.5 py-1 rounded-full border border-m3-primary/20">
                        {c.category}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(c.id, c.name);
                        }}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title={loc('Delete Class', 'درجہ حذف کریں', 'తరగతిని తొలగించు')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-base font-black text-gray-900 leading-tight group-hover:text-emerald-900 transition-colors">
                      {getDisplayClassName(c)}
                    </h3>

                    {/* Class Schedule: Start Time to End Time */}
                    <div className="mt-3 flex items-center justify-between bg-emerald-50/70 border border-emerald-200/60 px-3 py-1.5 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 font-mono">
                          <span>{c.startTime || '08:00 AM'}</span>
                          <span className="text-emerald-500 font-normal">-</span>
                          <span>{c.endTime || '01:30 PM'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-medium">
                        {loc('Schedule', 'اوقاتِ تدریس', 'సమయాలు')}
                      </span>
                    </div>

                    {c.description && (
                      <p className="text-[11px] text-gray-500 mt-2 line-clamp-2">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                    {/* Ustadh Incharge */}
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <GraduationCap className="w-3.5 h-3.5 text-m3-primary" />
                        <span>{loc('Ustadh Incharge:', 'استاد محترم:', 'ఇన్‌ఛార్జ్ ఉపాధ్యాయుడు:')}</span>
                      </span>
                      <strong className="font-bold text-gray-900">{c.incharge}</strong>
                    </div>

                    {/* Location & Subjects Count */}
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <DoorOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>{loc('Room / Location:', 'کمرہ / مقام:', 'గది / స్థలం:')}</span>
                      </span>
                      <span className="font-semibold text-gray-800">{c.room || loc('General Hall', 'مرکزی ہال', 'సాధారణ హాల్')}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{loc('Subjects:', 'مضامین:', 'సబ్జెక్టులు:')}</span>
                      </span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {classSubjects.length} {loc('Subjects', 'مضامین', 'సబ్జెక్టులు')}
                      </span>
                    </div>

                    {/* Enrollment Capacity Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                        <span className="flex items-center gap-1 text-emerald-900">
                          <Users className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{enrolledCount} {loc('Students Enrolled', 'زیرِ تعلیم طلبہ', 'నమోదైన విద్యార్థులు')}</span>
                        </span>
                        <span className="text-gray-400 font-mono">
                          {loc('Capacity:', 'گنجائش:', 'సామర్థ్యం:')} {c.capacity || 35}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            capacityPercent >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Edit Class Action Button */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditClassModal(c);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200/60 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{loc('Edit Class & Timings', 'ترمیم درجہ و استاد', 'తరగతిని సవరించు')}</span>
                      </button>
                      <span className="text-[10px] text-gray-400 group-hover:text-emerald-700 font-medium transition-colors">
                        {loc('Click card to edit →', 'ترمیم کے لیے کلک کریں ←', 'సవరించడానికి క్లిక్ చేయండి →')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">{loc('No classes found', 'کوئی درجہ نہیں ملا', 'తరగతులు కనుగొనబడలేదు')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {loc('Try changing your search filter or add a new class section.', 'تلاش کا فلٹر تبدیل کریں یا نیا درجہ شامل کریں۔', 'శోధనను మార్చండి లేదా కొత్త తరగతిని జోడించండి.')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LIST OF SUBJECTS */}
      {/* ========================================================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-m3-outline-variant/20 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">{loc('Total Subjects', 'کل مضامین', 'మొత్తం సబ్జెక్టులు')}</p>
                <p className="text-lg font-bold text-gray-800">{subjects.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-m3-outline-variant/20 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">{loc('Total Pages in Books', 'کتابوں کے کل صفحات', 'మొత్తం పేజీలు')}</p>
                <p className="text-lg font-bold text-blue-700">{totalCurriculumPages.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-m3-outline-variant/20 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">{loc('Classes Covered', 'شامل درجات', 'కవర్ చేసిన తరగతులు')}</p>
                <p className="text-lg font-bold text-purple-700">{new Set(subjects.map(s => s.className)).size}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-m3-outline-variant/20 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">{loc('Assigned Teachers', 'مقرر اساتذہ', 'కేటాయించిన ఉపాధ్యాయులు')}</p>
                <p className="text-lg font-bold text-amber-700">{teachers.length}</p>
              </div>
            </div>
          </div>

          {/* Search & Class Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-m3-outline-variant/20">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={loc('Search subject, book name, author...', 'مضمون، کتاب کا نام، مصنف تلاش کریں...', 'సబ్జెక్ట్, పుస్తకం పేరు, రచయితను శోధించండి...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-semibold shrink-0">
                {loc('Filter by Class:', 'درجہ کے لحاظ سے:', 'తరగతి ద్వారా ఫిల్టర్:')}
              </span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="p-2 text-xs rounded-xl border border-gray-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
              >
                <option value="all">{loc('All Classes', 'تمام درجات', 'అన్ని తరగతులు')}</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{getDisplayClassName(c)}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddSubjectModal(true)}
                className="ml-auto sm:ml-2 flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{loc('Add Subject', 'نیا مضمون', 'కొత్త సబ్జెక్ట్')}</span>
              </button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubjects.map(s => (
              <div 
                key={s.id} 
                onClick={() => openEditSubjectModal(s)}
                className="bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 hover:shadow-m3-2 p-5 flex flex-col justify-between space-y-4 transition-all cursor-pointer hover:border-emerald-400 group"
                title={loc('Click to edit subject details, book name, or pages', 'مضمون، کتاب کے نام اور صفحات میں ترمیم کے لیے کلک کریں', 'సబ్జెక్ట్‌ను సవరించడానికి క్లిక్ చేయండి')}
              >
                <div className="space-y-3">
                  {/* Category Badge & Delete */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {s.category || loc('General', 'عام', 'సాధారణ')}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(s.id, getDisplaySubjectName(s));
                      }}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title={loc('Delete Subject', 'مضمون حذف کریں', 'సబ్జెక్ట్‌ను తొలగించు')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subject Name & Book Name */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-emerald-900 transition-colors">
                      {getDisplaySubjectName(s)}
                    </h3>
                    
                    {/* Book Name (کتاب کا نام) */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50/70 border border-emerald-200/60 px-2.5 py-1 rounded-xl">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="text-gray-500 font-normal">{loc('Book:', 'کتاب:', 'పుస్తకం:')}</span>
                      <span className="font-bold truncate">{getDisplayBookName(s)}</span>
                    </div>
                  </div>

                  {/* Number of Pages in Book Badge */}
                  <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/60 px-3 py-2 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{loc('Pages in Book:', 'کتاب کے کل صفحات:', 'పుస్తకంలో పేజీలు:')}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-900 font-mono bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                      {s.totalPages} {loc('Pages', 'صفحات', 'పేజీలు')}
                    </span>
                  </div>

                  {s.description && (
                    <p className="text-[11px] text-gray-500 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                </div>

                {/* Subject Metadata */}
                <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs">
                  {/* Assigned Class */}
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>{loc('Class:', 'درجہ:', 'తరగతి:')}</span>
                    </span>
                    <strong className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                      {s.className}
                    </strong>
                  </div>

                  {/* Teacher Incharge */}
                  {s.teacherName && (
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{loc('Teacher:', 'استاد:', 'ఉపాధ్యాయుడు:')}</span>
                      </span>
                      <span className="font-semibold text-gray-800">{s.teacherName}</span>
                    </div>
                  )}

                  {/* Author / Publisher */}
                  {s.author && (
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                        <span>{loc('Author / Publisher:', 'مصنف / ناشر:', 'రచయిత:')}</span>
                      </span>
                      <span className="text-[11px] text-gray-700 font-medium truncate max-w-[150px]">{s.author}</span>
                    </div>
                  )}

                  {/* Edit Subject Action Button */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditSubjectModal(s);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{loc('Edit Subject', 'ترمیم مضمون', 'సబ్జెక్ట్‌ను సవరించు')}</span>
                    </button>
                    <span className="text-[10px] text-gray-400 group-hover:text-emerald-700 font-medium transition-colors">
                      {loc('Click card to edit →', 'ترمیم کے لیے کلک کریں ←', 'సవరించడానికి క్లిక్ చేయండి →')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
              <Library className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">{loc('No subjects found', 'کوئی مضمون نہیں ملا', 'సబ్జెక్టులు కనుగొనబడలేదు')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {loc('Try changing your search query or click "Add Subject" to add a new book.', 'تلاش تبدیل کریں یا نیا مضمون شامل کرنے کے لیے بٹن دبائیں۔', 'శోధనను మార్చండి లేదా కొత్త సబ్జెక్ట్‌ను జోడించండి.')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: NEW CLASS */}
      {/* ========================================================= */}
      <Modal
        isOpen={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        title={loc('Create New Academic Class', 'نیا درجہ شامل کریں', 'కొత్త తరగతిని సృష్టించండి')}
        subtitle={loc('Add a new Section, Halaqah, or Department to your Madrasa', 'مدرسہ میں نیا شعبہ، حلقہ یا کلاس شامل کریں', 'మీ మదరసాకు కొత్త తరగతిని జోడించండి')}
        maxWidth="md"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Class Name *', 'درجہ کا نام *', 'తరగతి పేరు *')}
            </label>
            <input
              type="text"
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
              placeholder={loc('e.g. Hifz Section C / Tajweed Class', 'مثال: شعبہ حفظ ج / نورانی قاعدہ', 'ఉదా: హిఫ్జ్ సెక్షన్ సి')}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Department / Category *', 'شعبہ / زمرہ *', 'విభాగం / వర్గం *')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {classCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Ustadh Incharge *', 'استاد محترم / نگراں *', 'ఇన్‌ఛార్జ్ ఉపాధ్యాయుడు *')}
              </label>
              <select
                value={incharge}
                onChange={(e) => setIncharge(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.qualification})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule: Start Time to End Time */}
          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('Class Schedule / Timing *', 'اوقاتِ تدریس *', 'తరగతి సమయాలు *')}</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-medium">
                {loc('Start time to end time', 'وقتِ آغاز تا وقتِ اختتام', 'ప్రారంభం నుండి ముగింపు వరకు')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  {loc('Start Time *', 'وقتِ آغاز *', 'ప్రారంభ సమయం *')}
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  {loc('End Time *', 'وقتِ اختتام *', 'ముగింపు సమయం *')}
                </label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="01:30 PM"
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Quick Timing Shift Presets */}
            <div className="pt-1">
              <p className="text-[10px] text-gray-500 mb-1.5 font-medium">
                {loc('Quick Timing Presets:', 'معمول کے اوقات:', 'శీఘ్ర సమయాలు:')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickShifts.map((shift, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStartTime(shift.start);
                      setEndTime(shift.end);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    {shift.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Room / Hall Location', 'کمرہ / ہال کا مقام', 'గది / హాల్')}
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder={loc('e.g. Hall A-3, Room 201', 'مثال: ہال اے، کمرہ ۲۰۳', 'ఉదా: హాల్ 1')}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Max Student Capacity', 'طلبہ کی گنجائش', 'గరిష్ట విద్యార్థుల సంఖ్య')}
              </label>
              <input
                type="number"
                min="5"
                max="150"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Class Description / Syllabus Target', 'وضاحت / تعلیمی اہداف', 'తరగతి వివరణ')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={loc(
                'e.g. Focused memorization for Juz 1 to 10 with daily revision and Tajweed drills',
                'مثال: پارہ ۱ تا ۱۰ کا حفظ اور یومیہ آموختہ کی مشق',
                'సిలబస్ వివరణ...'
              )}
              rows={2}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddClassModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              {loc('Cancel', 'منسوخ', 'రద్దు')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-m3-primary text-white rounded-xl shadow-m3-1 hover:bg-m3-primary/90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loc('Save Class', 'محفوظ کریں', 'సేవ్ చేయండి')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: ADD SUBJECT */}
      {/* ========================================================= */}
      <Modal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        title={loc('Add New Subject & Book', 'نیا مضمون و کتاب شامل کریں', 'కొత్త సబ్జెక్ట్ & పుస్తకాన్ని చేర్చండి')}
        subtitle={loc(
          'Register a new curriculum subject, book title, and total page count',
          'مضمون، کتاب کا نام اور کل صفحات کا اندراج فرمائیں',
          'సబ్జెక్ట్ వివరాలు, పుస్తకం పేరు మరియు పేజీల సంఖ్యను నమోదు చేయండి'
        )}
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Subject Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Subject Name *', 'مضمون کا نام *', 'సబ్జెక్ట్ పేరు *')}
              </label>
              <input
                type="text"
                value={subjectNameInput}
                onChange={(e) => setSubjectNameInput(e.target.value)}
                placeholder={loc('e.g. Holy Quran / Arabic Grammar', 'مثال: حفظِ قرآن مجید / عربی گرامر', 'ఉదా: పవిత్ర ఖురాన్ / అరబిక్ వ్యాకరణం')}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* 2. Book Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Book Name *', 'کتاب کا نام *', 'పుస్తకం పేరు *')}
              </label>
              <input
                type="text"
                value={subjectBookNameInput}
                onChange={(e) => setSubjectBookNameInput(e.target.value)}
                placeholder={loc('e.g. Mushaf Madinah / Hidayat-un-Nahw', 'مثال: مصحف مدینہ منورہ / ہدایۃ النحو', 'ఉదా: ముస్హఫ్ మదీనా / హిదాయతున్ నహ్వ్')}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 3. Number of Pages in Book */}
            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('Number of Pages in Book *', 'کتاب کے کل صفحات *', 'పుస్తకంలో పేజీల సంఖ్య *')}</span>
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                placeholder="604"
                className="w-full p-2.5 text-xs rounded-xl border border-emerald-300 bg-emerald-50/40 font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <p className="text-[10px] text-gray-500 mt-0.5">
                {loc('Total pages in this textbook or syllabus book', 'اس نصابی کتاب کے کل صفحات کی تعداد', 'పుస్తకంలోని మొత్తం పేజీలు')}
              </p>
            </div>

            {/* Assigned Class */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Assigned Class *', 'متعلقہ درجہ *', 'కేటాయించిన తరగతి *')}
              </label>
              <select
                value={subjectClass}
                onChange={(e) => setSubjectClass(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {getDisplayClassName(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Teacher Incharge */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Teacher / Ustadh', 'استاد محترم', 'ఉపాధ్యాయుడు')}
              </label>
              <select
                value={subjectTeacher}
                onChange={(e) => setSubjectTeacher(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.qualification})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Subject Category', 'شعبہ / زمرہ', 'సబ్జెక్ట్ వర్గం')}
              </label>
              <select
                value={subjectCategory}
                onChange={(e) => setSubjectCategory(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium cursor-pointer"
              >
                {subjectCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Author / Publisher */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Author / Publisher', 'مصنف / ناشر کتاب', 'రచయిత / ప్రచురణకర్త')}
            </label>
            <input
              type="text"
              value={subjectAuthor}
              onChange={(e) => setSubjectAuthor(e.target.value)}
              placeholder={loc('e.g. King Fahd Complex / Allama Chishti', 'مثال: مصحف مدینہ منورہ / مولانا نور محمد حقانیؒ', 'రచయిత పేరు')}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Syllabus Objectives / Remarks', 'نصابی اہداف و تفصیل', 'సిలబస్ వివరణ')}
            </label>
            <textarea
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
              placeholder={loc(
                'e.g. Complete memorization with daily Sabqi and Tajweed testing...',
                'مثال: یومیہ سبق، سبقی اور ترتیل و تجوید کے ساتھ حفظ...',
                'వివరణ...'
              )}
              rows={2}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddSubjectModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              {loc('Cancel', 'منسوخ', 'రద్దు')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-m3-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loc('Save Subject', 'محفوظ کریں', 'సేవ్ చేయండి')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: EDIT CLASS */}
      {/* ========================================================= */}
      <Modal
        isOpen={showEditClassModal}
        onClose={() => {
          setShowEditClassModal(false);
          setEditingClass(null);
        }}
        title={loc(
          `Edit Class: ${editingClass?.name || ''}`,
          `درجہ میں ترمیم: ${editingClass?.nameUrdu || editingClass?.name || ''}`,
          `తరగతి సవరణ: ${editingClass?.name || ''}`
        )}
        subtitle={loc(
          'Assign a different Ustadh, update teaching timings, or modify room/capacity',
          'استاد محترم کی تبدیلی، اوقاتِ تدریس میں ترمیم، اور گنجائش کی تبدیلی فرمائیں',
          'ఉపాధ్యాయుడిని మార్చండి లేదా సమయాలను నవీకరించండి'
        )}
        maxWidth="md"
      >
        {editingClass && (
          <form onSubmit={handleUpdateClass} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Class Name *', 'درجہ کا نام *', 'తరగతి పేరు *')}
              </label>
              <input
                type="text"
                value={editClassNameInput}
                onChange={(e) => setEditClassNameInput(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Department / Category *', 'شعبہ / زمرہ *', 'విభాగం / వర్గం *')}
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium cursor-pointer"
                >
                  {classCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Assign Different Teacher */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{loc('Assign Ustadh Incharge *', 'استاد محترم کی تبدیلی *', 'ఇన్‌ఛార్జ్ ఉపాధ్యాయుడు *')}</span>
                </label>
                <select
                  value={editIncharge}
                  onChange={(e) => setEditIncharge(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-emerald-400 bg-emerald-50/40 font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.qualification})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Change Timings / Schedule */}
            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{loc('Change Timings *', 'اوقاتِ تدریس میں تبدیلی *', 'సమయాలను మార్చండి *')}</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-medium">
                  {loc('Start time to end time', 'وقتِ آغاز تا وقتِ اختتام', 'ప్రారంభం నుండి ముగింపు వరకు')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    {loc('Start Time *', 'وقتِ آغاز *', 'ప్రారంభ సమయం *')}
                  </label>
                  <input
                    type="text"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    {loc('End Time *', 'وقتِ اختتام *', 'ముగింపు సమయం *')}
                  </label>
                  <input
                    type="text"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    placeholder="01:30 PM"
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Quick Timing Shift Presets */}
              <div className="pt-1">
                <p className="text-[10px] text-gray-500 mb-1.5 font-medium">
                  {loc('Quick Shift Presets:', 'معمول کے اوقات:', 'శీఘ్ర సమయాలు:')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickShifts.map((shift, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditStartTime(shift.start);
                        setEditEndTime(shift.end);
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      {shift.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Room / Hall Location', 'کمرہ / ہال کا مقام', 'గది / హాల్')}
                </label>
                <input
                  type="text"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Max Student Capacity', 'طلبہ کی گنجائش', 'గరిష్ట విద్యార్థుల సంఖ్య')}
                </label>
                <input
                  type="number"
                  min="5"
                  max="150"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Class Description / Syllabus Target', 'وضاحت / تعلیمی اہداف', 'తరగతి వివరణ')}
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowEditClassModal(false);
                  setEditingClass(null);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                {loc('Cancel', 'منسوخ', 'రద్దు')}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-m3-1 cursor-pointer"
              >
                <span>{loc('Save Changes', 'تبدیلیاں محفوظ کریں', 'మార్పులను సేవ్ చేయండి')}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: EDIT SUBJECT (CLICKABLE TO EDIT) */}
      {/* ========================================================= */}
      <Modal
        isOpen={showEditSubjectModal}
        onClose={() => {
          setShowEditSubjectModal(false);
          setEditingSubject(null);
        }}
        title={loc(
          `Edit Subject: ${editingSubject ? getDisplaySubjectName(editingSubject) : ''}`,
          `مضمون میں ترمیم: ${editingSubject ? getDisplaySubjectName(editingSubject) : ''}`,
          `సబ్జెక్ట్ సవరణ: ${editingSubject ? getDisplaySubjectName(editingSubject) : ''}`
        )}
        subtitle={loc(
          'Update subject name, book title, total pages, assigned class, and teacher',
          'مضمون، کتاب کا نام، کل صفحات، درجہ اور استاد میں تبدیلی کریں',
          'సబ్జెక్ట్ పేరు, పుస్తకం పేరు, పేజీలు మరియు ఉపాధ్యాయుడిని నవీకరించండి'
        )}
        maxWidth="md"
      >
        {editingSubject && (
          <form onSubmit={handleUpdateSubject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Subject Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Subject Name *', 'مضمون کا نام *', 'సబ్జెక్ట్ పేరు *')}
                </label>
                <input
                  type="text"
                  value={editSubjectNameInput}
                  onChange={(e) => setEditSubjectNameInput(e.target.value)}
                  placeholder={loc('e.g. Holy Quran / Arabic Grammar', 'مثال: حفظِ قرآن مجید / عربی گرامر', 'ఉదా: పవిత్ర ఖురాన్')}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              {/* 2. Book Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Book Name *', 'کتاب کا نام *', 'పుస్తకం పేరు *')}
                </label>
                <input
                  type="text"
                  value={editSubjectBookNameInput}
                  onChange={(e) => setEditSubjectBookNameInput(e.target.value)}
                  placeholder={loc('e.g. Mushaf Madinah / Hidayat-un-Nahw', 'مثال: مصحف مدینہ منورہ / ہدایۃ النحو', 'ఉదా: ముస్హఫ్ మదీనా')}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 3. Number of Pages in Book */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{loc('Number of Pages in Book *', 'کتاب کے کل صفحات *', 'పుస్తకంలో పేజీల సంఖ్య *')}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={editSubjectTotalPages}
                  onChange={(e) => setEditSubjectTotalPages(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-emerald-300 bg-emerald-50/40 font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {loc('Total pages in this textbook or syllabus book', 'اس نصابی کتاب کے کل صفحات کی تعداد', 'పుస్తకంలోని మొత్తం పేజీలు')}
                </p>
              </div>

              {/* Assigned Class */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Assigned Class *', 'متعلقہ درجہ *', 'కేటాయించిన తరగతి *')}
                </label>
                <select
                  value={editSubjectClass}
                  onChange={(e) => setEditSubjectClass(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>
                      {getDisplayClassName(c)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Teacher Incharge */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Teacher / Ustadh', 'استاد محترم', 'ఉపాధ్యాయుడు')}
                </label>
                <select
                  value={editSubjectTeacher}
                  onChange={(e) => setEditSubjectTeacher(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.qualification})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {loc('Subject Category', 'شعبہ / زمرہ', 'సబ్జెక్ట్ వర్గం')}
                </label>
                <select
                  value={editSubjectCategory}
                  onChange={(e) => setEditSubjectCategory(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium cursor-pointer"
                >
                  {subjectCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Author / Publisher */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Author / Publisher', 'مصنف / ناشر کتاب', 'రచయిత / ప్రచురణకర్త')}
              </label>
              <input
                type="text"
                value={editSubjectAuthor}
                onChange={(e) => setEditSubjectAuthor(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Syllabus Objectives / Remarks', 'نصابی اہداف و تفصیل', 'సిలబస్ వివరణ')}
              </label>
              <textarea
                value={editSubjectDescription}
                onChange={(e) => setEditSubjectDescription(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowEditSubjectModal(false);
                  setEditingSubject(null);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                {loc('Cancel', 'منسوخ', 'రద్దు')}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-m3-1 cursor-pointer"
              >
                <span>{loc('Save Changes', 'تبدیلیاں محفوظ کریں', 'మార్పులను సేవ్ చేయండి')}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
