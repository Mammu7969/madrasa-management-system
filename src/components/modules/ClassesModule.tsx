import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { MadrasaClass, Subject, Student, Department, AssignedClassBook, Teacher } from '../../types';
import { generateDefaultCredentials } from '../../utils/credentialGenerator';
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
  Bookmark, 
  Edit3,
  UserPlus,
  Check,
  Calendar,
  Building2,
  X
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

  // Main Tabs: 'departments' | 'books' | 'classes'
  const [activeTab, setActiveTab] = useState<'departments' | 'books' | 'classes'>('classes');

  // Primary Data State
  const [departments, setDepartments] = useState<Department[]>(() => db.getDepartments(activeMadrasa?.id));
  const [books, setBooks] = useState<Subject[]>(() => db.getBooks(activeMadrasa?.id));
  const [classes, setClasses] = useState<MadrasaClass[]>(() => db.getClasses(activeMadrasa?.id));
  const [students, setStudents] = useState<Student[]>(() => db.getStudents(activeMadrasa?.id));
  const [teachers, setTeachers] = useState<Teacher[]>(() => db.getTeachers(activeMadrasa?.id));

  // Live synchronizer across modules
  useEffect(() => {
    const handleSync = () => {
      setDepartments(db.getDepartments(activeMadrasa?.id));
      setBooks(db.getBooks(activeMadrasa?.id));
      setClasses(db.getClasses(activeMadrasa?.id));
      setStudents(db.getStudents(activeMadrasa?.id));
      setTeachers(db.getTeachers(activeMadrasa?.id));
    };
    window.addEventListener('mms_data_updated', handleSync);
    window.addEventListener('mms_data_synced', handleSync);
    return () => {
      window.removeEventListener('mms_data_updated', handleSync);
      window.removeEventListener('mms_data_synced', handleSync);
    };
  }, [activeMadrasa?.id]);

  // Robust bidirectional Student-in-Class matching helper
  const isStudentInClass = (s: Student, cls: MadrasaClass | null | undefined): boolean => {
    if (!s || !cls) return false;
    const studentClass = (s.class || '').trim().toLowerCase();
    const className = (cls.name || '').trim().toLowerCase();
    const classId = (cls.id || '').trim().toLowerCase();
    if (!studentClass) return false;
    return studentClass === className || studentClass === classId;
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // =========================================================
  // 1. DEPARTMENT STATE & MODAL
  // =========================================================
  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState<string>('');
  const [deptNameUrdu, setDeptNameUrdu] = useState<string>('');
  const [deptCode, setDeptCode] = useState<string>('');
  const [deptDesc, setDeptDesc] = useState<string>('');

  const openAddDeptModal = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptNameUrdu('');
    setDeptCode('');
    setDeptDesc('');
    setShowDeptModal(true);
  };

  const openEditDeptModal = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptNameUrdu(dept.nameUrdu || dept.name);
    setDeptCode(dept.code || '');
    setDeptDesc(dept.description || '');
    setShowDeptModal(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      showToast(loc('Please enter Department Name', 'براہِ کرم شعبہ کا نام درج کریں'), 'error');
      return;
    }

    if (editingDept) {
      const updated: Department = {
        ...editingDept,
        name: deptName.trim(),
        nameUrdu: deptNameUrdu.trim() || deptName.trim(),
        code: deptCode.trim().toUpperCase() || undefined,
        description: deptDesc.trim() || undefined
      };
      db.updateDepartment(updated);
      showToast(loc(`Department "${updated.name}" updated successfully!`, `شعبہ "${updated.name}" میں تبدیلیاں محفوظ ہو گئیں`), 'success');
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: deptName.trim(),
        nameUrdu: deptNameUrdu.trim() || deptName.trim(),
        code: deptCode.trim().toUpperCase() || undefined,
        description: deptDesc.trim() || undefined,
        madrasaId: activeMadrasa?.id,
        createdAt: new Date().toISOString()
      };
      db.addDepartment(newDept);
      showToast(loc(`Department "${newDept.name}" created successfully!`, `نیا شعبہ "${newDept.name}" کامیابی سے شامل کر دیا گیا`), 'success');
    }

    setDepartments(db.getDepartments(activeMadrasa?.id));
    setShowDeptModal(false);
  };

  const handleDeleteDept = (deptId: string, name: string) => {
    const confirmMsg = loc(
      `Are you sure you want to delete department "${name}"?`,
      `کیا آپ واقعی شعبہ "${name}" حذف کرنا چاہتے ہیں؟`
    );
    if (window.confirm(confirmMsg)) {
      db.deleteDepartment(deptId);
      setDepartments(db.getDepartments(activeMadrasa?.id));
      showToast(loc(`Department "${name}" removed.`, `شعبہ "${name}" خارج کر دیا گیا`), 'info');
    }
  };

  // =========================================================
  // 2. BOOK STATE & MODAL
  // =========================================================
  const [showBookModal, setShowBookModal] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Subject | null>(null);
  const [bookName, setBookName] = useState<string>('');
  const [bookNameUrdu, setBookNameUrdu] = useState<string>('');
  const [bookDeptId, setBookDeptId] = useState<string>('');
  const [bookPages, setBookPages] = useState<number>(100);
  const [bookAuthor, setBookAuthor] = useState<string>('');
  const [bookDesc, setBookDesc] = useState<string>('');

  const openAddBookModal = () => {
    setEditingBook(null);
    setBookName('');
    setBookNameUrdu('');
    setBookDeptId(departments[0]?.id || '');
    setBookPages(100);
    setBookAuthor('');
    setBookDesc('');
    setShowBookModal(true);
  };

  const openEditBookModal = (b: Subject) => {
    setEditingBook(b);
    setBookName(b.bookName || b.name);
    setBookNameUrdu(b.bookNameUrdu || b.nameUrdu || b.name);
    setBookDeptId(b.departmentId || departments[0]?.id || '');
    setBookPages(b.totalPages || 100);
    setBookAuthor(b.author || '');
    setBookDesc(b.description || '');
    setShowBookModal(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName.trim() || !activeMadrasa) {
      showToast(loc('Please enter Book Name', 'براہِ کرم کتاب کا نام درج کریں'), 'error');
      return;
    }

    const selectedDept = departments.find(d => d.id === bookDeptId);
    const deptNameVal = selectedDept?.name || 'General';

    if (editingBook) {
      const updated: Subject = {
        ...editingBook,
        name: bookName.trim(),
        nameUrdu: bookNameUrdu.trim() || bookName.trim(),
        bookName: bookName.trim(),
        bookNameUrdu: bookNameUrdu.trim() || bookName.trim(),
        departmentId: bookDeptId,
        departmentName: deptNameVal,
        totalPages: Number(bookPages) || 100,
        author: bookAuthor.trim() || undefined,
        description: bookDesc.trim() || undefined
      };
      db.updateBook(updated);
      showToast(loc(`Book "${updated.bookName}" updated successfully!`, `کتاب "${updated.bookName}" میں تبدیلیاں محفوظ ہو گئیں`), 'success');
    } else {
      const newBook: Subject = {
        id: `bk-${Date.now()}`,
        name: bookName.trim(),
        nameUrdu: bookNameUrdu.trim() || bookName.trim(),
        bookName: bookName.trim(),
        bookNameUrdu: bookNameUrdu.trim() || bookName.trim(),
        departmentId: bookDeptId,
        departmentName: deptNameVal,
        className: 'All Classes',
        totalPages: Number(bookPages) || 100,
        author: bookAuthor.trim() || undefined,
        description: bookDesc.trim() || undefined,
        madrasaId: activeMadrasa.id,
        category: deptNameVal
      };
      db.addBook(newBook);
      showToast(loc(`Book "${newBook.bookName}" added to Department "${deptNameVal}"!`, `کتاب "${newBook.bookName}" کامیابی سے شامل کر دی گئی`), 'success');
    }

    setBooks(db.getBooks(activeMadrasa.id));
    setShowBookModal(false);
  };

  const handleDeleteBook = (bookId: string, name: string) => {
    const confirmMsg = loc(
      `Are you sure you want to delete book "${name}"?`,
      `کیا آپ واقعی کتاب "${name}" حذف کرنا چاہتے ہیں؟`
    );
    if (window.confirm(confirmMsg)) {
      db.deleteBook(bookId);
      setBooks(db.getBooks(activeMadrasa?.id));
      showToast(loc(`Book "${name}" removed.`, `کتاب "${name}" خارج کر دی گئی`), 'info');
    }
  };

  // =========================================================
  // 3. CLASS STATE & DYNAMIC ASSIGNED BOOKS & MULTI STUDENTS
  // =========================================================
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<MadrasaClass | null>(null);

  const [classNameInput, setClassNameInput] = useState<string>('');
  const [classPriority, setClassPriority] = useState<number>(1);
  const [classDeptId, setClassDeptId] = useState<string>('');
  const [incharge, setIncharge] = useState<string>(teachers[0]?.name || '');
  const [startTime, setStartTime] = useState<string>('08:00 AM');
  const [endTime, setEndTime] = useState<string>('01:30 PM');
  const [room, setRoom] = useState<string>('Hall A-1');
  const [capacity, setCapacity] = useState<number>(35);
  const [description, setDescription] = useState<string>('');
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  // Dynamic Assigned Books in Class Modal
  const [classAssignedBooks, setClassAssignedBooks] = useState<Array<{
    departmentId: string;
    departmentName: string;
    bookId: string;
    bookName: string;
  }>>([]);

  // Multi Students to Enroll in Class Modal (+, +, +)
  const [classStudentsToEnroll, setClassStudentsToEnroll] = useState<string[]>([]);

  const weekDayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const quickShifts = [
    { label: loc('Morning (08:00 AM - 01:30 PM)', 'صبح (08:00 AM - 01:30 PM)'), start: '08:00 AM', end: '01:30 PM' },
    { label: loc('Afternoon (02:00 PM - 05:00 PM)', 'بعد ظہر (02:00 PM - 05:00 PM)'), start: '02:00 PM', end: '05:00 PM' },
    { label: loc('Evening (04:30 PM - 07:00 PM)', 'بعد عصر (04:30 PM - 07:00 PM)'), start: '04:30 PM', end: '07:00 PM' },
    { label: loc('Night (08:30 PM - 10:30 PM)', 'بعد عشاء (08:30 PM - 10:30 PM)'), start: '08:30 PM', end: '10:30 PM' }
  ];

  const openAddClassModal = () => {
    setEditingClass(null);
    setClassNameInput('');
    setClassPriority(classes.length + 1);
    setClassDeptId(departments[0]?.id || '');
    setIncharge(teachers[0]?.name || 'Not Assigned');
    setStartTime('08:00 AM');
    setEndTime('01:30 PM');
    setRoom('Hall A-1');
    setCapacity(35);
    setDescription('');
    setSelectedWeekDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    setClassAssignedBooks([]);
    setClassStudentsToEnroll([]);
    setShowClassModal(true);
  };

  const openEditClassModal = (cls: MadrasaClass) => {
    setEditingClass(cls);
    setClassNameInput(cls.name);
    setClassPriority(cls.priority || 1);
    setClassDeptId(cls.departmentId || departments[0]?.id || '');
    setIncharge(cls.incharge || 'Not Assigned');
    setStartTime(cls.startTime || '08:00 AM');
    setEndTime(cls.endTime || '01:30 PM');
    setRoom(cls.room || 'Hall A-1');
    setCapacity(cls.capacity || 35);
    setDescription(cls.description || '');
    setSelectedWeekDays(cls.weekDays && cls.weekDays.length > 0 ? cls.weekDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    
    // Populate assigned books
    if (cls.assignedBooks && cls.assignedBooks.length > 0) {
      setClassAssignedBooks(cls.assignedBooks.map(ab => ({
        departmentId: ab.departmentId || '',
        departmentName: ab.departmentName || '',
        bookId: ab.bookId || '',
        bookName: ab.bookName || ''
      })));
    } else {
      setClassAssignedBooks([]);
    }

    setClassStudentsToEnroll([]);
    setShowClassModal(true);
  };

  // Helper to add dynamic book row in class
  const handleAddBookRowToClass = () => {
    const defaultDept = departments[0];
    const defaultBook = books.find(b => b.departmentId === defaultDept?.id) || books[0];
    setClassAssignedBooks(prev => [
      ...prev,
      {
        departmentId: defaultDept?.id || '',
        departmentName: defaultDept?.name || 'General',
        bookId: defaultBook?.id || '',
        bookName: defaultBook?.bookName || defaultBook?.name || ''
      }
    ]);
  };

  const handleUpdateBookRow = (index: number, field: 'departmentId' | 'bookId', value: string) => {
    setClassAssignedBooks(prev => {
      const next = [...prev];
      if (field === 'departmentId') {
        const foundDept = departments.find(d => d.id === value);
        const matchingBooks = books.filter(b => b.departmentId === value);
        const firstMatching = matchingBooks[0];
        next[index] = {
          ...next[index],
          departmentId: value,
          departmentName: foundDept?.name || '',
          bookId: firstMatching?.id || '',
          bookName: firstMatching?.bookName || firstMatching?.name || ''
        };
      } else if (field === 'bookId') {
        const foundBook = books.find(b => b.id === value);
        next[index] = {
          ...next[index],
          bookId: value,
          bookName: foundBook?.bookName || foundBook?.name || ''
        };
      }
      return next;
    });
  };

  const handleRemoveBookRow = (index: number) => {
    setClassAssignedBooks(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to add student selector row (+, +, +)
  const handleAddStudentRowToClass = () => {
    const unassigned = students.find(s => !classStudentsToEnroll.includes(s.id) && (!s.class || s.class !== classNameInput));
    if (unassigned) {
      setClassStudentsToEnroll(prev => [...prev, unassigned.id]);
    } else {
      const anyAvailable = students.find(s => !classStudentsToEnroll.includes(s.id));
      if (anyAvailable) {
        setClassStudentsToEnroll(prev => [...prev, anyAvailable.id]);
      } else {
        showToast(loc('All available students are already listed', 'تمام طلبہ پہلے سے منتخب ہیں'), 'info');
      }
    }
  };

  const handleRemoveStudentRow = (index: number) => {
    setClassStudentsToEnroll(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleWeekDay = (day: string) => {
    setSelectedWeekDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim() || !activeMadrasa) {
      showToast(loc('Please enter Class Name', 'براہِ کرم درجہ کا نام درج کریں'), 'error');
      return;
    }

    const trimmedName = classNameInput.trim();
    const cleanAssignedBooks: AssignedClassBook[] = classAssignedBooks
      .filter(b => b.bookName.trim() !== '')
      .map(b => ({
        departmentId: b.departmentId,
        departmentName: b.departmentName,
        bookId: b.bookId,
        bookName: b.bookName
      }));

    if (editingClass) {
      const updated: MadrasaClass = {
        ...editingClass,
        name: trimmedName,
        nameUrdu: trimmedName,
        priority: Number(classPriority) || 1,
        category: departments.find(d => d.id === classDeptId)?.name || editingClass.category || 'Tahfeez',
        departmentId: classDeptId,
        incharge: incharge.trim(),
        startTime: startTime.trim() || '08:00 AM',
        endTime: endTime.trim() || '01:30 PM',
        schedule: `${startTime.trim() || '08:00 AM'} - ${endTime.trim() || '01:30 PM'}`,
        room: room.trim() || loc('General Hall', 'مرکزی ہال'),
        capacity: Number(capacity) || 35,
        description: description.trim() || undefined,
        assignedBooks: cleanAssignedBooks,
        weekDays: selectedWeekDays
      };
      db.updateClass(updated);

      // Enroll any added students
      if (classStudentsToEnroll.length > 0) {
        for (const stId of classStudentsToEnroll) {
          const s = students.find(item => item.id === stId);
          if (s) {
            await db.updateStudent({ ...s, class: updated.name });
          }
        }
      }

      showToast(loc(`Class "${updated.name}" updated successfully!`, `درجہ "${updated.name}" میں تبدیلیاں محفوظ ہو گئیں`), 'success');
    } else {
      const newClass: MadrasaClass = {
        id: `cls-${Date.now()}`,
        name: trimmedName,
        nameUrdu: trimmedName,
        priority: Number(classPriority) || 1,
        category: departments.find(d => d.id === classDeptId)?.name || 'Tahfeez',
        departmentId: classDeptId,
        incharge: incharge.trim(),
        startTime: startTime.trim() || '08:00 AM',
        endTime: endTime.trim() || '01:30 PM',
        schedule: `${startTime.trim() || '08:00 AM'} - ${endTime.trim() || '01:30 PM'}`,
        room: room.trim() || loc('General Hall', 'مرکزی ہال'),
        capacity: Number(capacity) || 35,
        madrasaId: activeMadrasa.id,
        description: description.trim() || undefined,
        assignedBooks: cleanAssignedBooks,
        weekDays: selectedWeekDays
      };
      db.addClass(newClass);

      // Enroll any added students
      if (classStudentsToEnroll.length > 0) {
        for (const stId of classStudentsToEnroll) {
          const s = students.find(item => item.id === stId);
          if (s) {
            await db.updateStudent({ ...s, class: newClass.name });
          }
        }
      }

      showToast(loc(`Class "${newClass.name}" registered successfully!`, `نیا درجہ "${newClass.name}" کامیابی سے درج کر لیا گیا`), 'success');
    }

    setClasses(db.getClasses(activeMadrasa.id));
    setStudents(db.getStudents(activeMadrasa.id));
    setShowClassModal(false);
  };

  const handleDeleteClass = (classId: string, name: string) => {
    const confirmMsg = loc(
      `Are you sure you want to delete class "${name}"?`,
      `کیا آپ واقعی درجہ "${name}" حذف کرنا چاہتے ہیں؟`
    );
    if (window.confirm(confirmMsg)) {
      db.deleteClass(classId);
      setClasses(db.getClasses(activeMadrasa?.id));
      showToast(loc(`Class "${name}" removed.`, `درجہ "${name}" خارج کر دیا گیا`), 'info');
    }
  };

  // =========================================================
  // 4. ADD STUDENT TO CLASS (DEDICATED MODAL)
  // =========================================================
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [targetClassForStudent, setTargetClassForStudent] = useState<MadrasaClass | null>(null);
  const [addStudentSubTab, setAddStudentSubTab] = useState<'assign' | 'new' | 'enrolled'>('assign');
  const [assignSearch, setAssignSearch] = useState<string>('');
  const [assignFilter, setAssignFilter] = useState<'all' | 'unassigned' | 'other'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Quick Direct Student Input
  const [quickStudentName, setQuickStudentName] = useState<string>('');
  const [quickStudentNameUrdu, setQuickStudentNameUrdu] = useState<string>('');
  const [quickFatherName, setQuickFatherName] = useState<string>('');
  const [quickAdmissionNo, setQuickAdmissionNo] = useState<string>(() => `ADM-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [quickDob, setQuickDob] = useState<string>('2015-05-15');
  const [quickContact, setQuickContact] = useState<string>('');
  const [quickCategory, setQuickCategory] = useState<'Hostel' | 'Day Scholar'>('Day Scholar');
  const [quickSponsorship, setQuickSponsorship] = useState<'Self-Sponsored' | 'Discounted' | 'Non-Sponsored' | 'Sponsored by'>('Self-Sponsored');
  const [quickMonthlyFees, setQuickMonthlyFees] = useState<number>(2000);
  const [isDirectSubmitting, setIsDirectSubmitting] = useState<boolean>(false);

  const openAddStudentModal = (cls: MadrasaClass | null, initialTab: 'assign' | 'new' | 'enrolled' = 'assign') => {
    const freshCls = cls ? (classes.find(c => c.id === cls.id || c.name === cls.name) || cls) : (classes[0] || null);
    setTargetClassForStudent(freshCls);
    setAddStudentSubTab(initialTab);
    setAssignSearch('');
    setAssignFilter('all');
    setSelectedStudentIds([]);
    setQuickStudentName('');
    setQuickStudentNameUrdu('');
    setQuickFatherName('');
    setQuickAdmissionNo(`ADM-2026-${Math.floor(100 + Math.random() * 900)}`);
    setQuickDob('2015-05-15');
    setQuickContact('');
    setQuickCategory('Day Scholar');
    setQuickSponsorship('Self-Sponsored');
    setQuickMonthlyFees(2000);
    setShowAddStudentModal(true);
  };

  const handleAssignSingleStudent = async (student: Student, targetClassName: string) => {
    setIsAssigning(true);
    try {
      await db.updateStudent({ ...student, class: targetClassName });
      const updated = db.getStudents(activeMadrasa?.id);
      setStudents(updated);
      showToast(loc(`Student "${student.studentName}" enrolled in "${targetClassName}"!`, `طالب علم "${student.studentName}" درجہ میں شامل ہو گیا`), 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to enroll student', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBatchAssignStudents = async () => {
    if (!targetClassForStudent || selectedStudentIds.length === 0) return;
    setIsAssigning(true);
    try {
      for (const id of selectedStudentIds) {
        const s = students.find(item => item.id === id);
        if (s) {
          await db.updateStudent({ ...s, class: targetClassForStudent.name });
        }
      }
      const updated = db.getStudents(activeMadrasa?.id);
      setStudents(updated);
      showToast(loc(`${selectedStudentIds.length} students enrolled in "${targetClassForStudent.name}"!`, `${selectedStudentIds.length} طلبہ درجہ میں داخل کر لیے گئے`), 'success');
      setSelectedStudentIds([]);
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign students', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleQuickDirectStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMadrasa || !targetClassForStudent) return;

    const trimmedName = quickStudentName.trim();
    const trimmedFather = quickFatherName.trim();
    const trimmedAdmNo = quickAdmissionNo.trim();

    if (!trimmedName || !trimmedFather || !trimmedAdmNo) {
      showToast(loc('Please fill required fields (Name, Father, Adm No)', 'براہِ کرم نام، والد کا نام اور داخلہ نمبر درج کریں'), 'error');
      return;
    }

    if (db.isAdmissionNoTaken(trimmedAdmNo, undefined, activeMadrasa.id)) {
      showToast(loc(`Admission No "${trimmedAdmNo}" is already taken!`, `داخلہ نمبر "${trimmedAdmNo}" پہلے سے موجود ہے`), 'error');
      return;
    }

    setIsDirectSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const creds = generateDefaultCredentials(trimmedName, today, quickDob);
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        admissionNo: trimmedAdmNo,
        admissionDate: today,
        studentName: trimmedName,
        studentNameUrdu: quickStudentNameUrdu.trim() || trimmedName,
        fatherName: trimmedFather,
        motherName: '',
        guardianName: trimmedFather,
        guardianOccupation: '',
        contactNumber: quickContact.trim() || 'N/A',
        address: 'N/A',
        category: quickCategory,
        sponsorship: quickSponsorship,
        monthlyFees: Number(quickMonthlyFees) || 0,
        previousSchool: '',
        previousStudy: '',
        aadharNumber: '',
        photoUrl: '',
        class: targetClassForStudent.name,
        madrasaId: activeMadrasa.id,
        totalPresentsYearly: 0,
        totalPresentsMonthly: 0,
        totalAbsentsYearly: 0,
        totalAbsentsMonthly: 0,
        presentSabaqAt: 'Al-Fatiha',
        username: creds.username,
        password: creds.password,
        dob: quickDob,
        isActive: true
      };

      const res = await db.addStudent(newStudent);
      if (!res.success) throw new Error(res.error || 'Failed to save student');

      setStudents(db.getStudents(activeMadrasa.id));
      showToast(loc(`Student "${newStudent.studentName}" enrolled in "${targetClassForStudent.name}"!`, `طالب علم درجہ میں داخل ہو گیا`), 'success');
      setQuickStudentName('');
      setQuickStudentNameUrdu('');
      setQuickFatherName('');
      setQuickAdmissionNo(`ADM-2026-${Math.floor(100 + Math.random() * 900)}`);
      setAddStudentSubTab('enrolled');
    } catch (err: any) {
      showToast(err?.message || 'Failed to admit student', 'error');
    } finally {
      setIsDirectSubmitting(false);
    }
  };

  // =========================================================
  // FILTERED DATA SETS
  // =========================================================
  const filteredDepartments = departments.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || (d.nameUrdu && d.nameUrdu.includes(searchQuery)) || (d.code && d.code.toLowerCase().includes(q));
  });

  const filteredBooks = books.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      b.name.toLowerCase().includes(q) ||
      (b.bookName && b.bookName.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q));
    const matchesDept = selectedDeptFilter === 'all' || b.departmentId === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredClasses = classes.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      c.name.toLowerCase().includes(q) ||
      (c.incharge && c.incharge.toLowerCase().includes(q)) ||
      (c.room && c.room.toLowerCase().includes(q));
    return matchesSearch;
  });

  const currentClassStudents = targetClassForStudent 
    ? students.filter(s => isStudentInClass(s, targetClassForStudent))
    : [];

  const unassignedStudentsCount = students.filter(s => !s.class || s.class.trim() === '' || s.class.toLowerCase() === 'unassigned').length;

  const candidateStudents = students.filter(s => {
    const q = assignSearch.trim().toLowerCase();
    const matchesSearch = 
      !q ||
      s.studentName.toLowerCase().includes(q) ||
      (s.studentNameUrdu && s.studentNameUrdu.includes(assignSearch.trim())) ||
      s.admissionNo.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (assignFilter === 'unassigned') return !s.class || s.class.trim() === '' || s.class.toLowerCase() === 'unassigned';
    if (assignFilter === 'other') return s.class && s.class.trim() !== '' && !isStudentInClass(s, targetClassForStudent);
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Visual Academic Setup Hierarchy Banner: Department > Book > Class > Teacher > Student */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-bold text-gray-600">
          <span className="text-[11px] uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-black">
            {loc('Academic Setup Strategy', 'تعلیمی طریقہ کار و ترتیب')}
          </span>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <button 
              onClick={() => setActiveTab('departments')} 
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeTab === 'departments' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              1. {loc('Department', 'شعبہ')} ({departments.length})
            </button>
            <span className="text-gray-400 font-bold">&gt;</span>
            <button 
              onClick={() => setActiveTab('books')} 
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeTab === 'books' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              2. {loc('Book', 'کتاب')} ({books.length})
            </button>
            <span className="text-gray-400 font-bold">&gt;</span>
            <button 
              onClick={() => setActiveTab('classes')} 
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeTab === 'classes' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              3. {loc('Class', 'درجہ')} ({classes.length})
            </button>
            <span className="text-gray-400 font-bold">&gt;</span>
            <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600">
              4. {loc('Teacher', 'استاد')} ({teachers.length})
            </span>
            <span className="text-gray-400 font-bold">&gt;</span>
            <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600">
              5. {loc('Student', 'طالب علم')} ({students.length})
            </span>
          </div>
        </div>
      </div>

      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            {activeTab === 'departments' ? <Building2 className="w-6 h-6" /> : activeTab === 'books' ? <BookOpen className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'departments' && loc('Step 1: Academic Departments', 'پہلا مرحلہ: تعلیمی شعبہ جات')}
              {activeTab === 'books' && loc('Step 2: Department Books & Syllabus', 'دوسرا مرحلہ: نصابی کتب و صفحات')}
              {activeTab === 'classes' && loc('Step 3: Classes, Teachers & Students', 'تیسرا مرحلہ: درجات، اساتذہ و طلبہ')}
            </h2>
            <p className="text-xs text-gray-500">
              {activeTab === 'departments' && loc('Add academic departments (Tahfeez, Alimiyat, Primary, etc.)', 'مدرسہ کے بنیادی شعبہ جات شامل کریں اور محفوظ فرمائیں')}
              {activeTab === 'books' && loc('Add books to departments with book name, author, and number of pages', 'شعبہ کے تحت نصابی کتب، صفحات کی تعداد اور مصنف کا اندراج کریں')}
              {activeTab === 'classes' && loc('Classes with priority, dynamic books, teacher, timings, days & enrolled students', 'درجات مع ترجیح، نصابی کتب، استاد محترم، اوقات، ایام اور طلبہ')}
            </p>
          </div>
        </div>

        {/* Action Button based on active tab */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'departments' && (
            <button
              type="button"
              onClick={openAddDeptModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{loc('Add Department', 'نیا شعبہ شامل کریں')}</span>
            </button>
          )}

          {activeTab === 'books' && (
            <button
              type="button"
              onClick={openAddBookModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{loc('Add Book', 'نئی کتاب شامل کریں')}</span>
            </button>
          )}

          {activeTab === 'classes' && (
            <>
              <button
                type="button"
                onClick={() => openAddStudentModal(classes[0] || null, 'assign')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loc('Add Student to Class', 'طالب علم درجہ میں شامل کریں')}</span>
              </button>
              <button
                type="button"
                onClick={openAddClassModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{loc('New Class', 'نیا درجہ')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation: Departments | Books | Classes */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'departments'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{loc('1. Departments', '۱. شعبہ جات')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'departments' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'books'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{loc('2. Books & Syllabus', '۲. کتب و نصاب')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'books' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {books.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'classes'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{loc('3. Classes & Batches', '۳. درجات و کلاسیں')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'classes' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {classes.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DEPARTMENTS */}
      {/* ========================================================= */}
      {activeTab === 'departments' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-gray-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={loc('Search departments by name or code...', 'شعبہ تلاش کریں...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="button"
              onClick={openAddDeptModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loc('Add Department', 'نیا شعبہ')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDepartments.map(dept => {
              const deptBooks = books.filter(b => b.departmentId === dept.id);
              const deptClasses = classes.filter(c => c.departmentId === dept.id || c.category === dept.name);

              return (
                <div key={dept.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {dept.code || 'DEPT'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditDeptModal(dept)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-700 transition-colors cursor-pointer"
                          title="Edit Department"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDept(dept.id, dept.name)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-gray-900 leading-tight">
                      {dept.name}
                    </h3>
                    {dept.nameUrdu && dept.nameUrdu !== dept.name && (
                      <p className="text-xs text-gray-500 font-urdu mt-0.5">{dept.nameUrdu}</p>
                    )}

                    {dept.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{dept.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{loc('Books in Department:', 'شعبہ کی کتب:')}</span>
                      </span>
                      <strong className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {deptBooks.length} {loc('Books', 'کتب')}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span>{loc('Active Classes:', 'درجات:')}</span>
                      </span>
                      <strong className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                        {deptClasses.length} {loc('Classes', 'درجات')}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BOOKS & SYLLABUS */}
      {/* ========================================================= */}
      {activeTab === 'books' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-gray-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={loc('Search book by name or author...', 'کتاب یا مصنف تلاش کریں...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-semibold shrink-0">
                {loc('Department:', 'شعبہ:')}
              </span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="p-2 text-xs rounded-xl border border-gray-200 bg-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">{loc('All Departments', 'تمام شعبہ جات')}</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={openAddBookModal}
                className="ml-auto sm:ml-2 flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{loc('Add Book', 'نئی کتاب')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map(b => (
              <div key={b.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {b.departmentName || b.category || 'General'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditBookModal(b)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-700 transition-colors cursor-pointer"
                        title="Edit Book"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBook(b.id, b.bookName || b.name)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    {b.bookName || b.name}
                  </h3>
                  {b.bookNameUrdu && b.bookNameUrdu !== b.bookName && (
                    <p className="text-xs text-gray-500 font-urdu">{b.bookNameUrdu}</p>
                  )}

                  {/* Pages Badge */}
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{loc('Pages:', 'کل صفحات:')}</span>
                    </span>
                    <span className="text-xs font-bold font-mono text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {b.totalPages || 100} {loc('Pages', 'صفحات')}
                    </span>
                  </div>

                  {b.author && (
                    <p className="text-xs text-gray-600">
                      <span className="text-gray-400">{loc('Author:', 'مصنف:')}</span> <strong>{b.author}</strong>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CLASSES */}
      {/* ========================================================= */}
      {activeTab === 'classes' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-gray-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={loc('Search class, teacher, room...', 'درجہ، استاد، یا کمرہ تلاش کریں...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openAddClassModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{loc('New Class', 'نیا درجہ')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClasses.map(c => {
              const classStudents = students.filter(s => isStudentInClass(s, c));
              const enrolledCount = classStudents.length;
              const assignedBooksList = c.assignedBooks || [];
              const assignedTeacher = teachers.find(t => 
                (c.incharge && c.incharge !== 'Not Assigned' && (t.name.trim().toLowerCase() === c.incharge.trim().toLowerCase() || t.id === c.incharge)) ||
                (t.assignedClass && (t.assignedClass.trim().toLowerCase() === c.name.trim().toLowerCase() || t.assignedClass === c.id))
              );

              return (
                <div key={c.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {c.category || 'Academic'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300" title="Class Priority (Used for Attendance Calculation)">
                          P#{c.priority || 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditClassModal(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-700 transition-colors cursor-pointer"
                          title="Edit Class"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClass(c.id, c.name)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-gray-900 leading-tight">
                      {c.name}
                    </h3>

                    {/* Class Timing & Schedule */}
                    <div className="mt-2.5 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-950">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{c.startTime || '08:00 AM'} - {c.endTime || '01:30 PM'}</span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-semibold">{loc('Timings', 'اوقات')}</span>
                    </div>

                    {/* Running Week Days */}
                    {c.weekDays && c.weekDays.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-medium mr-1">{loc('Days:', 'ایام:')}</span>
                        {c.weekDays.map(day => (
                          <span key={day} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                            {day}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Assigned Books Pills */}
                    {assignedBooksList.length > 0 && (
                      <div className="mt-2.5 space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          {loc('Assigned Books & Department:', 'مقرر نصابی کتب و شعبہ:')}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {assignedBooksList.map((ab, idx) => (
                            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
                              {ab.bookName} ({ab.departmentName})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                    {/* Ustadh Incharge Badge */}
                    <div className="flex items-center justify-between text-gray-700 bg-gray-50/80 p-2.5 rounded-2xl border border-gray-100">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{loc('Ustadh:', 'استاد محترم:')}</span>
                      </span>
                      {assignedTeacher ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold overflow-hidden border border-emerald-300 shrink-0">
                            {assignedTeacher.photoUrl ? (
                              <img src={assignedTeacher.photoUrl} alt={assignedTeacher.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{assignedTeacher.name.substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900 block leading-tight text-xs">{assignedTeacher.name}</span>
                            <span className="text-[10px] text-emerald-700 font-medium block">{assignedTeacher.designation || 'استاد'}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-xl border border-gray-200">
                          {c.incharge && c.incharge !== 'Not Assigned' ? c.incharge : loc('Not Assigned', 'تعینات نہیں')}
                        </span>
                      )}
                    </div>

                    {/* Students Count */}
                    <div className="flex items-center justify-between text-gray-700 px-1">
                      <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{loc('Enrolled Students:', 'داخل طلبہ:')}</span>
                      </span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {enrolledCount} / {c.capacity || 35}
                      </span>
                    </div>

                    {/* Dual Actions: View Students & Add Student */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAddStudentModal(c, 'enrolled')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all cursor-pointer border border-gray-200"
                        title={loc('View enrolled students list', 'داخل طلبہ کی فہرست دیکھیں')}
                      >
                        <Users className="w-3.5 h-3.5 text-gray-600" />
                        <span>{loc(`View (${enrolledCount})`, `طلبہ (${enrolledCount})`)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openAddStudentModal(c, 'assign')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        title={loc('Add student to class', 'طالب علم درجہ میں شامل کریں')}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{loc('+ Add Student', '+ طالب علم')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT DEPARTMENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title={editingDept ? loc('Edit Department', 'شعبہ میں ترمیم') : loc('Step 1: Add Department', 'پہلا مرحلہ: نیا شعبہ شامل کریں')}
        subtitle={loc('Department Name and details (e.g. Tahfeez-ul-Quran, Dars-e-Nizami)', 'شعبہ کا نام درج کریں اور محفوظ کریں')}
        maxWidth="md"
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Department Name (English) *', 'شعبہ کا نام (انگریزی) *')}
            </label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="e.g. Tahfeez-ul-Quran / Dars-e-Nizami"
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Department Name (Urdu)', 'شعبہ کا نام (اردو)')}
            </label>
            <input
              type="text"
              value={deptNameUrdu}
              onChange={(e) => setDeptNameUrdu(e.target.value)}
              placeholder="مثال: شعبہ حفظِ قرآن کریم"
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 font-urdu focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Department Code (Optional)', 'مختصر کوڈ')}
            </label>
            <input
              type="text"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value)}
              placeholder="e.g. HQ, DN, PRI"
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Description', 'تفصیل')}
            </label>
            <textarea
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              rows={2}
              placeholder={loc('Department syllabus targets and objectives...', 'شعبہ کے اہداف...')}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowDeptModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              {loc('Cancel', 'منسوخ')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingDept ? loc('Update Department', 'تبدیلی محفوظ کریں') : loc('Save Department', 'شعبہ محفوظ کریں')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT BOOK */}
      {/* ========================================================= */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title={editingBook ? loc('Edit Book', 'کتاب میں ترمیم') : loc('Step 2: Add Book to Department', 'دوسرا مرحلہ: شعبہ کے تحت کتاب شامل کریں')}
        subtitle={loc('Book Name, Department dropdown, No. of Pages, Author, Save/Update', 'کتاب کا نام، شعبہ ڈراپ ڈاؤن، صفحات کی تعداد، مصنف')}
        maxWidth="md"
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Book Name *', 'کتاب کا نام *')}
            </label>
            <input
              type="text"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="e.g. Mushaf Madinah / Noorani Qaida / Hidayat-un-Nahw"
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Select Department Dropdown *', 'شعبہ منتخب کریں *')}
            </label>
            <select
              value={bookDeptId}
              onChange={(e) => setBookDeptId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              required
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.nameUrdu ? `(${d.nameUrdu})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('No. of Pages *', 'صفحات کی تعداد *')}</span>
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={bookPages}
                onChange={(e) => setBookPages(Number(e.target.value))}
                placeholder="604"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Author / Compiler', 'مصنف / مؤلف')}
              </label>
              <input
                type="text"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                placeholder="e.g. Maulana Noor Muhammad"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Description / Syllabus Target', 'نصابی تفصیل')}
            </label>
            <textarea
              value={bookDesc}
              onChange={(e) => setBookDesc(e.target.value)}
              rows={2}
              placeholder="e.g. Daily Sabaq and Sabqi revision target..."
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowBookModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              {loc('Cancel', 'منسوخ')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingBook ? loc('Update Book', 'کتاب اپڈیٹ کریں') : loc('Save Book', 'کتاب محفوظ کریں')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT CLASS (STEP 3) */}
      {/* ========================================================= */}
      <Modal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        title={editingClass ? loc('Edit Class', 'درجہ میں ترمیم') : loc('Step 3: Create Class', 'تیسرا مرحلہ: نیا درجہ شامل کریں')}
        subtitle={loc(
          'Class Name, Class Priority (Attendance is calculated by this), Dynamic Books, Teacher, Timings, Week Days, and Add Students',
          'درجہ کا نام، ترجیح، نصابی کتب، استاد محترم، اوقات، ایام، اور طلبہ'
        )}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Class Name *', 'درجہ کا نام *')}
              </label>
              <input
                type="text"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                placeholder="e.g. Hifz Section A / Tajweed Prep"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {loc('Class Priority *', 'درجہ کی ترجیح *')}
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={classPriority}
                onChange={(e) => setClassPriority(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 font-mono font-bold"
                required
              />
              <p className="text-[10px] text-amber-800 font-medium mt-0.5">
                {loc('(Attendance is calculated by this class)', '(حاضری اسی درجہ کے حساب سے شمار ہوگی)')}
              </p>
            </div>
          </div>

          {/* DYNAMIC BOOKS SECTION */}
          <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                  <span>{loc('Assigned Books & Department', 'مقرر کتب و متعلقہ شعبہ')}</span>
                </label>
                <p className="text-[10px] text-blue-800">
                  {loc('Press "+ Add Book" to select Department and Book dropdowns', 'کتاب شامل کرنے کے لیے بٹن دبائیں')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddBookRowToClass}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{loc('+ Add Book', '+ کتاب شامل کریں')}</span>
              </button>
            </div>

            {classAssignedBooks.map((row, idx) => {
              const deptBooks = books.filter(b => b.departmentId === row.departmentId);

              return (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-blue-200">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                      {loc('Select Department', 'شعبہ منتخب کریں')}
                    </label>
                    <select
                      value={row.departmentId}
                      onChange={(e) => handleUpdateBookRow(idx, 'departmentId', e.target.value)}
                      className="w-full p-1.5 text-xs rounded-lg border border-gray-300 bg-white font-medium"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                      {loc('Select Book', 'کتاب منتخب کریں')}
                    </label>
                    <select
                      value={row.bookId}
                      onChange={(e) => handleUpdateBookRow(idx, 'bookId', e.target.value)}
                      className="w-full p-1.5 text-xs rounded-lg border border-gray-300 bg-white font-medium"
                    >
                      {deptBooks.length > 0 ? (
                        deptBooks.map(b => (
                          <option key={b.id} value={b.id}>{b.bookName || b.name}</option>
                        ))
                      ) : (
                        <option value="">{loc('No books in this department', 'اس شعبہ میں کوئی کتاب نہیں')}</option>
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBookRow(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 mt-3"
                    title="Remove Book"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {classAssignedBooks.length === 0 && (
              <p className="text-xs text-blue-700 italic text-center py-2">
                {loc('No books assigned yet. Click "+ Add Book" above to attach syllabus books to this class.', 'کوئی کتاب شامل نہیں ہے۔ اوپر "+ کتاب شامل کریں" پر کلک کریں۔')}
              </p>
            )}
          </div>

          {/* TEACHER SELECTION */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Select Teacher From Teachers Dropdown List *', 'اساتذہ کی فہرست میں سے استاد محترم منتخب کریں *')}
            </label>
            <select
              value={incharge}
              onChange={(e) => setIncharge(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="Not Assigned">{loc('-- Not Assigned / بغیر نگراں --', '-- تعینات نہیں / بغیر نگراں --')}</option>
              {teachers.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.designation || 'Teacher'}) {t.phone ? `- ${t.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* TIME TO TIME (SCHEDULE) */}
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('Time to Time (Class Timing) *', 'اوقاتِ تدریس (وقت تا وقت) *')}</span>
              </label>
              <span className="text-[10px] text-emerald-800 font-medium">
                {startTime} - {endTime}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                  {loc('Start Time', 'وقتِ آغاز')}
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                  {loc('End Time', 'وقتِ اختتام')}
                </label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="01:30 PM"
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickShifts.map((shift, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStartTime(shift.start);
                    setEndTime(shift.end);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                >
                  {shift.label}
                </button>
              ))}
            </div>
          </div>

          {/* TOGGLE WEEK DAYS */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>{loc('Toggle Week Days This Class Will Run *', 'ہفتہ کے وہ دن منتخب کریں جن میں یہ کلاس چلے گی *')}</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {weekDayOptions.map(day => {
                const isSelected = selectedWeekDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleWeekDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-700 text-white shadow-xs' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {loc('Description', 'وضاحت')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Focus on Tajweed articulation and daily revision..."
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
            />
          </div>

          {/* ADD MULTIPLE STUDENTS SECTION (+, +, +) */}
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{loc('Then Add Student (+, +, + Multiple Students)', 'طلبہ شامل کریں (+، +، + ایک سے زائد طلبہ)')}</span>
                </label>
                <p className="text-[10px] text-emerald-800">
                  {loc('Click "+ Add Student" multiple times to enroll students into this class', 'ایک یا زائد طلبہ کا انتخاب فرمائیں')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStudentRowToClass}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{loc('+ Add Student', '+ طالب علم شامل کریں')}</span>
              </button>
            </div>

            {classStudentsToEnroll.map((stId, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-200">
                <span className="text-xs font-mono font-bold text-emerald-800 w-6 text-center">{idx + 1}.</span>
                <div className="flex-1">
                  <select
                    value={stId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setClassStudentsToEnroll(prev => {
                        const copy = [...prev];
                        copy[idx] = newId;
                        return copy;
                      });
                    }}
                    className="w-full p-1.5 text-xs rounded-lg border border-gray-300 bg-white font-medium"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.studentName} ({s.admissionNo}) {s.class ? `- [${s.class}]` : '- [Unassigned]'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveStudentRow(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                  title="Remove Student"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {classStudentsToEnroll.length > 0 && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddStudentRowToClass}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{loc('Add another student (+)', 'مزید طالب علم شامل کریں (+)')}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowClassModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              {loc('Cancel', 'منسوخ')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingClass ? loc('Update Class', 'تبدیلی محفوظ کریں') : loc('Save Class', 'درجہ محفوظ کریں')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: ADD STUDENT TO CLASS (DEDICATED) */}
      {/* ========================================================= */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => {
          setShowAddStudentModal(false);
          setTargetClassForStudent(null);
        }}
        title={loc('Add Student to Class', 'درجہ میں طالب علم شامل کریں')}
        subtitle={targetClassForStudent ? loc(`Manage enrollments for "${targetClassForStudent.name}"`, `درجہ "${targetClassForStudent.name}" میں داخلہ`) : undefined}
        maxWidth="4xl"
      >
        {targetClassForStudent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div>
                <h4 className="text-base font-black text-emerald-950">{targetClassForStudent.name}</h4>
                <p className="text-xs text-emerald-800">
                  {loc('Ustadh:', 'استاد:')} <strong>{targetClassForStudent.incharge}</strong> &bull; {currentClassStudents.length} / {targetClassForStudent.capacity || 35} {loc('Enrolled', 'داخل شدہ')}
                </p>
              </div>

              {classes.length > 1 && (
                <select
                  value={targetClassForStudent.id}
                  onChange={(e) => {
                    const found = classes.find(c => c.id === e.target.value);
                    if (found) setTargetClassForStudent(found);
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl border border-emerald-300 bg-white font-bold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2 border-b border-gray-200 pt-1">
              <button
                type="button"
                onClick={() => setAddStudentSubTab('assign')}
                className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 cursor-pointer ${
                  addStudentSubTab === 'assign' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {loc('Assign Existing Students', 'موجودہ طلبہ')} ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setAddStudentSubTab('new')}
                className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 cursor-pointer ${
                  addStudentSubTab === 'new' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {loc('Direct New Admission', 'نیا داخلہ')}
              </button>
              <button
                type="button"
                onClick={() => setAddStudentSubTab('enrolled')}
                className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 cursor-pointer ${
                  addStudentSubTab === 'enrolled' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {loc('Currently Enrolled', 'داخل شدہ طلبہ')} ({currentClassStudents.length})
              </button>
            </div>

            {addStudentSubTab === 'assign' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={loc('Search student by name...', 'طالب علم تلاش کریں...')}
                      value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAssignFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${assignFilter === 'all' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                      {loc('All', 'سب')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignFilter('unassigned')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${assignFilter === 'unassigned' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                      {loc('Unassigned', 'بلا درجہ')} ({unassignedStudentsCount})
                    </button>
                  </div>
                </div>

                {selectedStudentIds.length > 0 && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-700 text-white rounded-2xl">
                    <span className="text-xs font-bold">{selectedStudentIds.length} {loc('selected', 'منتخب')}</span>
                    <button
                      type="button"
                      onClick={handleBatchAssignStudents}
                      disabled={isAssigning}
                      className="px-4 py-1.5 bg-white text-emerald-900 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      {isAssigning ? loc('Enrolling...', 'شامل کیا جا رہا ہے...') : loc('Enroll in Class', 'درجہ میں شامل کریں')}
                    </button>
                  </div>
                )}

                <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 sticky top-0 font-bold text-gray-600">
                      <tr>
                        <th className="p-2.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={candidateStudents.length > 0 && candidateStudents.every(s => selectedStudentIds.includes(s.id))}
                            onChange={() => {
                              if (selectedStudentIds.length === candidateStudents.length) {
                                setSelectedStudentIds([]);
                              } else {
                                setSelectedStudentIds(candidateStudents.map(s => s.id));
                              }
                            }}
                          />
                        </th>
                        <th className="p-2.5">{loc('Student Details', 'طالب علم کی تفصیل')}</th>
                        <th className="p-2.5">{loc('Admission No', 'داخلہ نمبر')}</th>
                        <th className="p-2.5">{loc('Current Class', 'موجودہ درجہ')}</th>
                        <th className="p-2.5 text-right">{loc('Action', 'کارروائی')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {candidateStudents.map(s => {
                        const isEnrolled = targetClassForStudent ? isStudentInClass(s, targetClassForStudent) : false;
                        const isSelected = selectedStudentIds.includes(s.id);
                        return (
                          <tr key={s.id} className={`hover:bg-gray-50 ${isEnrolled ? 'bg-emerald-50/30' : isSelected ? 'bg-emerald-50/50' : ''}`}>
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                disabled={isEnrolled}
                                checked={isSelected}
                                onChange={() => setSelectedStudentIds(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                              />
                            </td>
                            <td className="p-2.5 font-bold text-gray-900">
                              <div>{s.studentName}</div>
                              {s.studentNameUrdu && <div className="text-[10px] text-emerald-800 font-urdu">{s.studentNameUrdu}</div>}
                            </td>
                            <td className="p-2.5 font-mono text-gray-600">{s.admissionNo}</td>
                            <td className="p-2.5">{s.class || loc('Unassigned', 'بلا درجہ')}</td>
                            <td className="p-2.5 text-right">
                              {isEnrolled ? (
                                <span className="text-emerald-700 font-bold">{loc('Enrolled ✓', 'داخل شدہ')}</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAssignSingleStudent(s, targetClassForStudent?.name || '')}
                                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  {loc('Add to Class', 'شامل کریں')}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {addStudentSubTab === 'new' && (
              <form onSubmit={handleQuickDirectStudentSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{loc('Student Full Name *', 'طالب علم کا نام *')}</label>
                    <input
                      type="text"
                      value={quickStudentName}
                      onChange={(e) => setQuickStudentName(e.target.value)}
                      placeholder="e.g. Mohammad Bilal"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{loc('Father Name *', 'والد کا نام *')}</label>
                    <input
                      type="text"
                      value={quickFatherName}
                      onChange={(e) => setQuickFatherName(e.target.value)}
                      placeholder="e.g. Abdul Rahman"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{loc('Admission No *', 'داخلہ نمبر *')}</label>
                    <input
                      type="text"
                      value={quickAdmissionNo}
                      onChange={(e) => setQuickAdmissionNo(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{loc('Contact Phone', 'رابطہ فون')}</label>
                    <input
                      type="text"
                      value={quickContact}
                      onChange={(e) => setQuickContact(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{loc('Category', 'شعبہ رہائش')}</label>
                    <select
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value as any)}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white"
                    >
                      <option value="Day Scholar">Day Scholar (غیر اقامتی)</option>
                      <option value="Hostel">Hostel (اقامتی)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={isDirectSubmitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loc('Save & Enroll in Class', 'محفوظ کریں اور داخل فرمائیں')}</span>
                  </button>
                </div>
              </form>
            )}

            {addStudentSubTab === 'enrolled' && (
              <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 sticky top-0 font-bold text-gray-600">
                    <tr>
                      <th className="p-2.5">{loc('Student Name', 'طالب علم کا نام')}</th>
                      <th className="p-2.5">{loc('Father Name', 'والد کا نام')}</th>
                      <th className="p-2.5">{loc('Admission No', 'داخلہ نمبر')}</th>
                      <th className="p-2.5">{loc('Contact', 'رابطہ')}</th>
                      <th className="p-2.5">{loc('Category', 'زمرہ')}</th>
                      <th className="p-2.5 text-right">{loc('Action', 'کارروائی')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentClassStudents.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold text-gray-900">
                          <div>{s.studentName}</div>
                          {s.studentNameUrdu && <div className="text-[10px] text-emerald-800 font-urdu">{s.studentNameUrdu}</div>}
                        </td>
                        <td className="p-2.5 text-gray-600">{s.fatherName || '-'}</td>
                        <td className="p-2.5 font-mono text-gray-600 font-bold">{s.admissionNo}</td>
                        <td className="p-2.5 text-gray-600">{s.contactNumber || '-'}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.category === 'Hostel' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                            {s.category}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              await db.updateStudent({ ...s, class: '' });
                              setStudents(db.getStudents(activeMadrasa?.id));
                              showToast(loc(`"${s.studentName}" removed from class.`, 'طالب علم کو درجہ سے خارج کر دیا گیا'), 'info');
                            }}
                            className="text-rose-600 hover:underline font-bold text-xs cursor-pointer"
                          >
                            {loc('Remove', 'خارج کریں')}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentClassStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-400">
                          {loc('No students currently enrolled in this class.', 'اس درجہ میں ابھی کوئی طالب علم داخل نہیں ہے۔')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};
