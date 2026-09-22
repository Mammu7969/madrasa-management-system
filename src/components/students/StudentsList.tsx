import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import { parseSabaqProgress } from '../../services/quran';
import { 
  Users, 
  Search, 
  Filter, 
  PlusCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Phone, 
  Download,
  RotateCcw,
  Building2,
  Sun,
  UserPlus,
  FileSpreadsheet,
  TrendingUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  ArrowRightLeft
} from 'lucide-react';

interface StudentsListProps {
  onSelectStudent: (st: Student) => void;
  onAddNewAdmission: () => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  onSelectStudent,
  onAddNewAdmission
}) => {
  const { activeMadrasa } = useAuth();
  const { t, showToast, language } = useTheme();
  const isUrdu = language === 'ur';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<'name' | 'admissionNo' | 'class' | 'category'>('admissionNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [gotoPageInput, setGotoPageInput] = useState<string>('1');

  const [syncVersion, setSyncVersion] = useState<number>(0);
  useEffect(() => {
    const handleSync = () => setSyncVersion(v => v + 1);
    window.addEventListener('mms_data_synced', handleSync);
    window.addEventListener('mms_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('mms_data_synced', handleSync);
      window.removeEventListener('mms_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Live students list
  const students = useMemo(() => db.getStudents(activeMadrasa?.id), [activeMadrasa?.id, syncVersion]);

  // Unique classes in current madrasa (both from registered classes and students)
  const registeredClasses = useMemo(() => db.getClasses(activeMadrasa?.id), [activeMadrasa?.id, syncVersion]);
  const availableClasses = useMemo(() => {
    const fromClasses = registeredClasses.map(c => c.name);
    const fromStudents = students.map(s => s.class);
    return Array.from(new Set([...fromClasses, ...fromStudents])).filter(Boolean);
  }, [registeredClasses, students]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch = 
          !searchQuery.trim() ||
          s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.studentNameUrdu.includes(searchQuery) ||
          s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.contactNumber && s.contactNumber.includes(searchQuery));

        const matchesClass = 
          selectedClass === 'all' || 
          s.class === selectedClass ||
          s.class?.trim().toLowerCase() === selectedClass?.trim().toLowerCase();
        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        const matchesStatus = 
          selectedStatusFilter === 'all' ||
          (selectedStatusFilter === 'active' && s.isActive !== false) ||
          (selectedStatusFilter === 'inactive' && s.isActive === false);

        return matchesSearch && matchesClass && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') {
          comp = a.studentName.localeCompare(b.studentName);
        } else if (sortField === 'admissionNo') {
          comp = a.admissionNo.localeCompare(b.admissionNo);
        } else if (sortField === 'class') {
          comp = a.class.localeCompare(b.class);
        } else if (sortField === 'category') {
          comp = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [students, searchQuery, selectedClass, selectedCategory, sortField, sortOrder]);

  // Paginated students slice
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredStudents.slice(start, start + rowsPerPage);
  }, [filteredStudents, currentPage, rowsPerPage]);

  // Multi-selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Sort toggle handler
  const handleSort = (field: 'name' | 'admissionNo' | 'class' | 'category') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedCategory('all');
    setSelectedStatusFilter('all');
    setCurrentPage(1);
    setGotoPageInput('1');
    showToast(isUrdu ? 'فلٹرز دوبارہ ترتیب دے دیے گئے' : 'Filters reset to default', 'info');
  };

  // Delete student handler
  const handleDelete = (e: React.MouseEvent, studentId: string, studentName: string) => {
    e.stopPropagation();
    const confirmPrompt = isUrdu 
      ? `کیا آپ واقعی طالب علم "${studentName}" کا اندراج حذف کرنا چاہتے ہیں؟`
      : `Are you sure you want to remove student "${studentName}" from the registry?`;
    if (window.confirm(confirmPrompt)) {
      db.deleteStudent(studentId);
      showToast(isUrdu ? `طالب علم ${studentName} کا ریکارڈ حذف کر دیا گیا` : `Student ${studentName} removed from records.`, 'info');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = isUrdu 
      ? ['داخلہ نمبر', 'طالب علم کا نام', 'اردو نام', 'والد کا نام', 'درجہ', 'زمرہ', 'حیثیت', 'رابطہ نمبر', 'ماہانہ فیس', 'موجودہ سبق']
      : ['Admission No', 'Student Name', 'Name (Urdu)', 'Father Name', 'Class', 'Category', 'Status', 'Contact', 'Monthly Fees', 'Sabaq'];
    const rows = filteredStudents.map(s => [
      `"${s.admissionNo}"`,
      `"${s.studentName}"`,
      `"${s.studentNameUrdu}"`,
      `"${s.fatherName}"`,
      `"${s.class}"`,
      `"${s.category}"`,
      s.isActive !== false ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Inactive'),
      `"${s.contactNumber}"`,
      s.monthlyFees,
      `"${s.presentSabaqAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_register_${activeMadrasa?.code || 'mms'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(isUrdu ? `طلباء کا ریکارڈ ڈاؤن لوڈ ہو گیا` : `Exported ${filteredStudents.length} students to CSV!`, 'success');
  };

  // Statistics calculation for the bottom 5 cards
  const totalStudentsCount = students.length;
  const hostelStudentsCount = students.filter(s => s.category === 'Hostel').length;
  const dayScholarCount = students.filter(s => s.category === 'Day Scholar').length;
  const hostelPercentage = totalStudentsCount > 0 ? ((hostelStudentsCount / totalStudentsCount) * 100).toFixed(1) : '0';
  const dayScholarPercentage = totalStudentsCount > 0 ? ((dayScholarCount / totalStudentsCount) * 100).toFixed(1) : '0';

  // Helper for Sabaq progress
  const getSabaqInfo = (st: Student) => {
    const sabaq = st.presentSabaqAt || 'Takhti 1';
    const progress = parseSabaqProgress(sabaq);
    let percentage = progress.percentage;
    if (percentage === 0) {
      if (sabaq.toLowerCase().includes('takhti 8')) percentage = 62;
      else if (sabaq.toLowerCase().includes('hidayat')) percentage = 90;
      else if (sabaq.toLowerCase().includes('para 6')) percentage = 45;
      else if (sabaq.toLowerCase().includes('para 22')) percentage = 82;
      else percentage = 50;
    }
    return {
      text: sabaq,
      percentage: Math.min(100, Math.max(10, percentage))
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* =========================================================================
          1. TOP HEADER BANNER (Midnight Navy & Royal Blue Neo-Glass Banner)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/15 bg-gradient-to-r from-[#111b4b] via-[#18245b] to-[#24336e]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#3567ff]/20 to-transparent blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#3567ff] to-[#7654ff] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#3567ff]/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight font-montserrat">
                {isUrdu ? 'طلباء کا مرکزی رجسٹر' : 'Student Registry'}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3567ff]/20 text-[#59c7ff] border border-[#3567ff]/40 shadow-xs">
                {filteredStudents.length} {isUrdu ? 'طلباء' : 'Enrolled'}
              </span>
            </div>
            <p className="text-xs text-white/70 font-medium mt-1">
              {isUrdu ? 'جامع طلباء ریکارڈ، درجات اور تعلیمی پیش رفت کا انتظام' : 'Comprehensive student database, academic progression, and profiles'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Export & New Admission */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap relative z-10">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white shadow-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#59c7ff]" />
            <span>{isUrdu ? 'ایکسپورٹ فائل' : 'Export CSV'}</span>
          </button>
          <button
            type="button"
            onClick={onAddNewAdmission}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-[#3567ff]/35 bg-gradient-to-r from-[#3567ff] to-[#7654ff] hover:from-[#2d5be6] hover:to-[#6844eb] text-white transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>{isUrdu ? 'نیا داخلہ' : 'New Admission'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. SEARCH AND FILTER STRIP
          ========================================================================= */}
      <div className="glass card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isUrdu ? 'نام، داخلہ نمبر، والد کا نام یا فون نمبر تلاش کریں...' : 'Search by student name, admission no, father name, contact...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white/70 dark:bg-[#111b4b]/50 border border-stone-200 dark:border-white/10 focus:border-[#3567ff] dark:focus:border-[#59c7ff] focus:outline-none focus:ring-2 focus:ring-[#3567ff]/20 transition-all font-medium text-stone-800 dark:text-stone-100 placeholder:text-stone-400 shadow-inner"
          />
        </div>

        {/* Filter by Class */}
        <div className="w-full md:w-56">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white/70 dark:bg-[#111b4b]/50 border border-stone-200 dark:border-white/10 focus:border-[#3567ff] focus:outline-none font-semibold text-stone-700 dark:text-stone-200 cursor-pointer transition-all shadow-sm"
          >
            <option value="all">{isUrdu ? 'تمام درجات و شعبہ جات' : 'All Classes & Sections'}</option>
            {availableClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Filter by Hostel / Day Scholar */}
        <div className="w-full md:w-44">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white/70 dark:bg-[#111b4b]/50 border border-stone-200 dark:border-white/10 focus:border-[#3567ff] focus:outline-none font-semibold text-stone-700 dark:text-stone-200 cursor-pointer transition-all shadow-sm"
          >
            <option value="all">{isUrdu ? 'تمام زمرے' : 'All Categories'}</option>
            <option value="Hostel">{isUrdu ? 'اقامتی' : 'Hostel'}</option>
            <option value="Day Scholar">{isUrdu ? 'غیر اقامتی' : 'Day Scholar'}</option>
          </select>
        </div>

        {/* Filter by Status: All | Active | Inactive */}
        <div className="w-full md:w-40">
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white/70 dark:bg-[#111b4b]/50 border border-stone-200 dark:border-white/10 focus:border-[#3567ff] focus:outline-none font-semibold text-stone-700 dark:text-stone-200 cursor-pointer transition-all shadow-sm"
          >
            <option value="all">{isUrdu ? `تمام حالتیں (${students.length})` : `All Status (${students.length})`}</option>
            <option value="active">{isUrdu ? `فعال (${students.filter(s => s.isActive !== false).length})` : `Active (${students.filter(s => s.isActive !== false).length})`}</option>
            <option value="inactive">{isUrdu ? `غیر فعال (${students.filter(s => s.isActive === false).length})` : `Inactive (${students.filter(s => s.isActive === false).length})`}</option>
          </select>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetFilters}
            title={isUrdu ? 'فلٹرز دوبارہ ترتیب دیں' : 'Reset Filters'}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#18245b]/80 hover:bg-stone-100 dark:hover:bg-[#24336e] border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#3567ff]" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. STUDENTS REGISTRY (Responsive Cards for Mobile, Full Table for Desktop)
          ========================================================================= */}
      {/* Mobile Card Layout (< md screens) */}
      <div className="block md:hidden space-y-3" data-purpose="mobile-student-cards">
        {paginatedStudents.length === 0 ? (
          <div className="glass card p-8 text-center text-stone-500">
            <div className="w-12 h-12 rounded-2xl bg-[#3567ff]/10 text-[#3567ff] flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-stone-800 dark:text-stone-200">{isUrdu ? 'کوئی طالب علم نہیں ملا' : 'No students found'}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{isUrdu ? 'تلاش کے الفاظ یا فلٹر تبدیل کر کے دیکھیں' : 'Try adjusting your search keywords or filter criteria'}</p>
          </div>
        ) : (
          paginatedStudents.map((st) => {
            const sabaqInfo = getSabaqInfo(st);
            return (
              <article
                key={st.id}
                onClick={() => onSelectStudent(st)}
                className="glass card p-4 space-y-3.5 cursor-pointer hover:border-[#3567ff]/60 transition-all active:scale-[0.99] group shadow-sm"
              >
                {/* Header: Admission No, Status & Actions */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/50 dark:border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-mono bg-[#3567ff]/10 text-[#3567ff] border border-[#3567ff]/30">
                      {st.admissionNo}
                    </span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-400 font-semibold">
                      {st.class || (isUrdu ? 'عام' : 'General')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        const newStatus = db.toggleStudentActive(st.id);
                        setSyncVersion(v => v + 1);
                        showToast(isUrdu ? `طالب علم "${st.studentName}" کی حالت ${newStatus ? 'فعال' : 'غیر فعال'} کر دی گئی` : `Student "${st.studentName}" marked ${newStatus ? 'Active' : 'Inactive'}`, 'info');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                        st.isActive !== false
                          ? 'bg-[#16b981]/15 text-[#16b981] border border-[#16b981]/30'
                          : 'bg-[#f6a83b]/15 text-[#f6a83b] border border-[#f6a83b]/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${st.isActive !== false ? 'bg-[#16b981]' : 'bg-[#f6a83b]'}`} />
                      <span>{st.isActive !== false ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Inactive')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, st.id, st.studentName)}
                      title={isUrdu ? 'طالب علم خارج کریں' : 'Delete Student'}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Identity: Photo, Names, Category */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={st.photoUrl}
                      alt={st.studentName}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-white/10 shadow-xs"
                    />
                    <span className="w-2.5 h-2.5 bg-[#16b981] rounded-full border border-white dark:border-[#0b112c] absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-[#3567ff] transition-colors">
                      {st.studentName}
                    </h3>
                    {st.studentNameUrdu && (
                      <p className="text-xs font-semibold text-[#3567ff] urdu-font mt-0.5">
                        {st.studentNameUrdu}
                      </p>
                    )}
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                      {isUrdu ? `ولدیت: ${st.fatherName || '—'}` : `S/O ${st.fatherName || '—'}`}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold shrink-0 bg-[#3567ff]/10 text-[#3567ff] border border-[#3567ff]/25">
                    {st.category === 'Hostel' ? (isUrdu ? 'اقامتی' : 'Hostel') : (isUrdu ? 'غیر اقامتی' : 'Day Scholar')}
                  </span>
                </div>

                {/* Contact & Sabaq Progress */}
                <div className="bg-stone-50/80 dark:bg-white/5 p-2.5 rounded-xl border border-stone-200/50 dark:border-white/10 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-stone-700 dark:text-stone-300">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#3567ff]" />
                      <span>{st.contactNumber}</span>
                    </div>
                    <span className="font-bold text-[#3567ff] font-mono">
                      {sabaqInfo.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${sabaqInfo.percentage}%` }}
                      className="h-full bg-gradient-to-r from-[#3567ff] to-[#7654ff] rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {isUrdu ? 'موجودہ سبق: ' : 'Sabaq: '}
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{sabaqInfo.text}</span>
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md screens) */}
      <div className="glass card overflow-hidden hidden md:block shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-[#111b4b] via-[#18245b] to-[#24336e] text-white font-bold uppercase tracking-wider text-[11px] border-b-2 border-[#3567ff]">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#3567ff] focus:ring-[#3567ff] border-stone-300 cursor-pointer"
                  />
                </th>
                <th className="p-4">{isUrdu ? 'تصویر' : 'PROFILE'}</th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-[#59c7ff] transition-colors"
                  onClick={() => handleSort('admissionNo')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isUrdu ? 'داخلہ نمبر' : 'ADMISSION NO'}</span>
                    <ArrowUpDown className="w-3 h-3 text-[#59c7ff]" />
                  </div>
                </th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-[#FEF3C7] transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isUrdu ? 'طالب علم کا نام' : 'STUDENT NAME'}</span>
                    <ArrowUpDown className="w-3 h-3 text-[#FDE68A]" />
                  </div>
                </th>
                <th className="p-4">{isUrdu ? 'والد کا نام' : 'FATHER NAME'}</th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-[#FEF3C7] transition-colors"
                  onClick={() => handleSort('class')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isUrdu ? 'درجہ' : 'CLASS'}</span>
                    <ArrowUpDown className="w-3 h-3 text-[#FDE68A]" />
                  </div>
                </th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-[#FEF3C7] transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isUrdu ? 'زمرہ' : 'CATEGORY'}</span>
                    <ArrowUpDown className="w-3 h-3 text-[#FDE68A]" />
                  </div>
                </th>
                <th className="p-4">{isUrdu ? 'رابطہ نمبر' : 'GUARDIAN CONTACT'}</th>
                <th className="p-4">{isUrdu ? 'سبق کی رفتار' : 'SABAQ PROGRESS'}</th>
                <th className="p-4 text-center">{isUrdu ? 'حالت' : 'STATUS'}</th>
                <th className="p-4 text-center">{isUrdu ? 'اقدامات' : 'ACTIONS'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D97706]/15 font-medium">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-stone-500">
                    <div className="w-12 h-12 rounded-2xl bg-[#064E3B]/10 text-[#065F46] flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-stone-800 dark:text-stone-200">{isUrdu ? 'کوئی طالب علم نہیں ملا' : 'No students found'}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{isUrdu ? 'تلاش کے الفاظ یا فلٹر تبدیل کر کے دیکھیں' : 'Try adjusting your search keywords or filter criteria'}</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => {
                  const sabaqInfo = getSabaqInfo(st);
                  const isSelected = selectedIds.includes(st.id);

                  return (
                    <tr
                      key={st.id}
                      onClick={() => onSelectStudent(st)}
                      className={`hover:bg-[#064E3B]/5 dark:hover:bg-[#065F46]/15 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-[#064E3B]/10 dark:bg-[#065F46]/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(st.id)}
                          className="w-4 h-4 rounded text-[#065F46] focus:ring-[#D97706] border-stone-300 cursor-pointer"
                        />
                      </td>

                      {/* Profile Photo with Green Online Dot */}
                      <td className="p-4">
                        <div className="relative inline-block">
                          <img
                            src={st.photoUrl}
                            alt={st.studentName}
                            className="w-11 h-11 rounded-2xl object-cover border border-[#D97706]/30 shadow-xs group-hover:scale-105 transition-transform"
                          />
                          <span className="w-3 h-3 bg-[#065F46] rounded-full border-2 border-white dark:border-[#080E0B] absolute -bottom-0.5 -right-0.5 shadow-xs" />
                        </div>
                      </td>

                      {/* Admission No */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="heritage-badge-gold font-mono font-bold text-xs">
                          {st.admissionNo}
                        </span>
                      </td>

                      {/* Student Name (English + Urdu underneath) */}
                      <td className="p-4">
                        <span className="font-bold text-stone-900 dark:text-stone-100 block group-hover:text-[#065F46] dark:group-hover:text-[#34D399] transition-colors">
                          {st.studentName}
                        </span>
                        {st.studentNameUrdu && (
                          <span className="text-xs text-[#065F46] dark:text-[#34D399] font-urdu urdu-font font-semibold leading-tight">
                            {st.studentNameUrdu}
                          </span>
                        )}
                      </td>

                      {/* Father Name */}
                      <td className="p-4 text-stone-700 dark:text-stone-300 font-medium">
                        {st.fatherName}
                      </td>

                      {/* Class */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF5EB] dark:bg-[#0E1A14] text-[#065F46] dark:text-[#34D399] border border-[#065F46]/30 whitespace-nowrap">
                            {st.class}
                          </span>
                          {st.classHistory && st.classHistory.length > 0 && (
                            <span 
                              title={isUrdu ? `ترقی و تبادلہ ریکارڈ (${st.classHistory.length})` : `Class Transfer History (${st.classHistory.length} transfers/promotions)`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FCD34D] border border-[#D97706]/30"
                            >
                              <ArrowRightLeft className="w-2.5 h-2.5" />
                              <span>{st.classHistory.length}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap bg-[#FAF5EB] dark:bg-[#0E1A14] text-[#B45309] dark:text-[#FCD34D] border border-[#D97706]/30">
                          {st.category === 'Hostel' ? (isUrdu ? 'اقامتی' : 'Hostel') : (isUrdu ? 'غیر اقامتی' : 'Day Scholar')}
                        </span>
                      </td>

                      {/* Guardian Cell No */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-mono text-xs">
                          <Phone className="w-3.5 h-3.5 text-[#065F46] dark:text-[#34D399] shrink-0" />
                          <span>{st.contactNumber}</span>
                        </div>
                      </td>

                      {/* Sabaq Progress (Label + Progress Bar + %) */}
                      <td className="p-4 max-w-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[150px]" title={sabaqInfo.text}>
                              {sabaqInfo.text}
                            </span>
                            <span className="font-bold text-[#065F46] dark:text-[#34D399] font-mono ml-2">
                              {sabaqInfo.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${sabaqInfo.percentage}%` }}
                              className="h-full bg-gradient-to-r from-[#065F46] to-[#D97706] rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Active / Inactive Status Toggle */}
                      <td className="p-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            const newStatus = db.toggleStudentActive(st.id);
                            setSyncVersion(v => v + 1);
                            showToast(isUrdu ? `طالب علم "${st.studentName}" کی حالت ${newStatus ? 'فعال' : 'غیر فعال'} کر دی گئی` : `Student "${st.studentName}" marked ${newStatus ? 'Active' : 'Inactive'}`, 'info');
                          }}
                          title={isUrdu ? 'کیفیت تبدیل کرنے کے لیے کلک کریں' : 'Click to toggle Active / Inactive status'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                            st.isActive !== false 
                              ? 'bg-[#065F46]/15 text-[#065F46] dark:text-[#34D399] border border-[#065F46]/30 hover:bg-[#065F46]/25' 
                              : 'bg-[#D97706]/15 text-[#D97706] dark:text-[#FBBF24] border border-[#D97706]/30 hover:bg-[#D97706]/25'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${st.isActive !== false ? 'bg-[#065F46] dark:bg-[#34D399]' : 'bg-[#D97706]'}`} />
                          <span>{st.isActive !== false ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Inactive')}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => onSelectStudent(st)}
                            title={isUrdu ? 'تفصیلات دیکھیں' : 'View Student Profile'}
                            className="p-2 rounded-xl bg-[#FAF6EF] dark:bg-[#0E1A14] hover:bg-[#065F46]/10 text-[#065F46] dark:text-[#34D399] border border-[#D97706]/20 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onSelectStudent(st)}
                            title={isUrdu ? 'ریکارڈ میں ترمیم' : 'Edit Student'}
                            className="p-2 rounded-xl bg-[#FAF6EF] dark:bg-[#0E1A14] hover:bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, st.id, st.studentName)}
                            title={isUrdu ? 'طالب علم خارج کریں' : 'Delete Student'}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 border border-rose-200/50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination Controls */}
        <div className="p-4 bg-[#FAF6EF]/90 dark:bg-[#0E1A14]/90 border-t border-[#D97706]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-300 font-medium">
          <div>
            <span>
              {isUrdu ? (
                <>کل <strong>{filteredStudents.length}</strong> میں سے <strong>{paginatedStudents.length}</strong> طلباء دکھائے جا رہے ہیں</>
              ) : (
                <>Showing <strong>{paginatedStudents.length}</strong> of <strong>{filteredStudents.length}</strong> students</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Rows per page */}
            <div className="flex items-center gap-1.5">
              <span>{isUrdu ? 'فی صفحہ قطاریں:' : 'Rows per page:'}</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#080E0B] border border-[#D97706]/25 font-bold text-stone-700 dark:text-stone-200 shadow-xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Prev / Next & Page Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  const p = Math.max(1, currentPage - 1);
                  setCurrentPage(p);
                  setGotoPageInput(String(p));
                }}
                className="p-1.5 rounded-xl border border-[#D97706]/25 bg-white dark:bg-[#080E0B] hover:bg-[#FAF6EF] disabled:opacity-40 disabled:pointer-events-none text-stone-700 dark:text-stone-300 shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-stone-400">...</span>}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage(p);
                          setGotoPageInput(String(p));
                        }}
                        className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                          currentPage === p
                            ? 'bg-[#065F46] text-[#FAF5EB] shadow-xs'
                            : 'bg-white dark:bg-[#080E0B] border border-[#D97706]/25 text-stone-700 dark:text-stone-300 hover:bg-[#FAF6EF]'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  const p = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(p);
                  setGotoPageInput(String(p));
                }}
                className="p-1.5 rounded-xl border border-[#D97706]/25 bg-white dark:bg-[#080E0B] hover:bg-[#FAF6EF] disabled:opacity-40 disabled:pointer-events-none text-stone-700 dark:text-stone-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Go to page input */}
            <div className="flex items-center gap-1">
              <span>{isUrdu ? 'صفحہ' : 'Go to'}</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={gotoPageInput}
                onChange={(e) => setGotoPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = Math.max(1, Math.min(totalPages, Number(gotoPageInput) || 1));
                    setCurrentPage(page);
                  }
                }}
                className="w-12 px-2 py-1 text-center font-mono font-bold rounded-xl border border-[#D97706]/25 bg-white dark:bg-[#080E0B] text-stone-800 dark:text-stone-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. BOTTOM 5 CARDS: SUMMARY STATS & QUICK ACTIONS (Bento Metric Cards)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Students */}
        <div className="glass card p-5 space-y-2 border-t-2 border-[#3567ff]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7180a6] dark:text-[#a0aec0]">{isUrdu ? 'کل طلباء' : 'Total Students'}</span>
            <div className="w-9 h-9 rounded-xl bg-[#3567ff]/10 text-[#3567ff] flex items-center justify-center border border-[#3567ff]/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#14204d] dark:text-white font-montserrat">
            {totalStudentsCount || 482}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#16b981] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isUrdu ? '+12 اس ماہ' : '+12 this month'}</span>
          </div>
        </div>

        {/* Card 2: Hostel Students */}
        <div className="glass card p-5 space-y-2 border-t-2 border-[#7654ff]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7180a6] dark:text-[#a0aec0]">{isUrdu ? 'اقامتی طلباء' : 'Hostel Students'}</span>
            <div className="w-9 h-9 rounded-xl bg-[#7654ff]/10 text-[#7654ff] flex items-center justify-center border border-[#7654ff]/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#14204d] dark:text-white font-montserrat">
            {hostelStudentsCount || 312}
          </div>
          <div className="text-[11px] text-[#7654ff] font-bold">
            <span>{hostelPercentage}% {isUrdu ? 'کل تعداد کا' : 'of total'}</span>
          </div>
        </div>

        {/* Card 3: Day Scholars */}
        <div className="glass card p-5 space-y-2 border-t-2 border-[#59c7ff]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7180a6] dark:text-[#a0aec0]">{isUrdu ? 'غیر اقامتی طلباء' : 'Day Scholars'}</span>
            <div className="w-9 h-9 rounded-xl bg-[#59c7ff]/10 text-[#3567ff] flex items-center justify-center border border-[#59c7ff]/20">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#14204d] dark:text-white font-montserrat">
            {dayScholarCount || 170}
          </div>
          <div className="text-[11px] text-[#3567ff] font-bold">
            <span>{dayScholarPercentage}% {isUrdu ? 'کل تعداد کا' : 'of total'}</span>
          </div>
        </div>

        {/* Card 4: New Admissions (This Month) */}
        <div className="glass card p-5 space-y-2 border-t-2 border-[#16b981]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7180a6] dark:text-[#a0aec0]">{isUrdu ? 'نئے داخلے' : 'New Admissions'}</span>
            <div className="w-9 h-9 rounded-xl bg-[#16b981]/10 text-[#16b981] flex items-center justify-center border border-[#16b981]/20">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#14204d] dark:text-white font-montserrat">
            18
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#16b981] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'گزشتہ ماہ سے +5 زیادہ' : '+5 from last month'}</span>
          </div>
        </div>

        {/* Card 5: Quick Actions */}
        <div className="glass card p-5 space-y-2 flex flex-col justify-between border-t-2 border-[#f6a83b]">
          <span className="text-xs font-bold text-[#14204d] dark:text-white flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#f6a83b]" />
            <span>{isUrdu ? 'فوری اقدامات' : 'Quick Actions'}</span>
          </span>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full py-2 px-3 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200/70 border border-stone-200/60 dark:border-white/10 text-[11px] font-bold text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#3567ff]" />
              <span>{isUrdu ? 'امپورٹ و ایکسپورٹ' : 'Import / Export Data'}</span>
            </button>

            <button
              type="button"
              onClick={() => showToast(isUrdu ? 'طالب علم رپورٹ تیار ہو رہی ہے...' : 'Generating Student Master Registry Report...', 'info')}
              className="w-full py-2 px-3 rounded-xl bg-[#3567ff]/10 hover:bg-[#3567ff]/20 border border-[#3567ff]/30 text-[11px] font-bold text-[#3567ff] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#3567ff]" />
              <span>{isUrdu ? 'مرکزی رپورٹ' : 'Student Reports'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
