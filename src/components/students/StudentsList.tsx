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
  const { t, showToast } = useTheme();

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
    showToast('Filters reset to default', 'info');
  };

  // Delete student handler
  const handleDelete = (e: React.MouseEvent, studentId: string, studentName: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove student "${studentName}" from registry?`)) {
      db.deleteStudent(studentId);
      showToast(`Student ${studentName} removed from records.`, 'info');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Admission No', 'Student Name', 'Name (Urdu)', 'Father Name', 'Class', 'Category', 'Status', 'Contact', 'Monthly Fees', 'Sabaq'];
    const rows = filteredStudents.map(s => [
      `"${s.admissionNo}"`,
      `"${s.studentName}"`,
      `"${s.studentNameUrdu}"`,
      `"${s.fatherName}"`,
      `"${s.class}"`,
      `"${s.category}"`,
      s.isActive !== false ? 'Active' : 'Inactive',
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
    showToast(`Exported ${filteredStudents.length} students to CSV!`, 'success');
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
          1. TOP HEADER ROW (Matching media_1788721593765.png)
          ========================================================================= */}
      <div className="glossy-card-elevated p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl glossy-squircle bg-[#079669] text-white flex items-center justify-center shrink-0 border border-white/40 shadow-xs">
            <Users className="w-6 h-6 relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-montserrat">
              {t('allStudents')}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive student database, academic progression, and profiles
            </p>
          </div>
        </div>

        {/* Action Buttons: Export & New Admission */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 hover:bg-white border border-white/90 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#079669]" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onAddNewAdmission}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#079669] hover:bg-[#057A57] text-white text-xs font-bold shadow-[0_4px_14px_rgba(7,150,105,0.3)] transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Admission (نیا داخلہ)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. SEARCH AND FILTER STRIP
          ========================================================================= */}
      <div className="glossy-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, admission no, father name, contact..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all shadow-2xs font-medium text-slate-800 placeholder:text-slate-400"
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
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-700 cursor-pointer transition-all shadow-2xs"
          >
            <option value="all">All Classes & Sections</option>
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
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-700 cursor-pointer transition-all shadow-2xs"
          >
            <option value="all">All Categories</option>
            <option value="Hostel">Hostel (اقامتی)</option>
            <option value="Day Scholar">Day Scholar (غیر اقامتی)</option>
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
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white/60 backdrop-blur-md border border-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-700 cursor-pointer transition-all shadow-2xs"
          >
            <option value="all">All Status ({students.length})</option>
            <option value="active">Active ({students.filter(s => s.isActive !== false).length})</option>
            <option value="inactive">Inactive ({students.filter(s => s.isActive === false).length})</option>
          </select>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset Filters"
            className="p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 border border-white/90 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. STUDENTS REGISTRY TABLE (Matching media_1788721593765.png)
          ========================================================================= */}
      <div className="glossy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-emerald-50/50 backdrop-blur-md border-b border-white/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="p-4">PROFILE</th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-emerald-700 transition-colors"
                  onClick={() => handleSort('admissionNo')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>ADMISSION NO</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-emerald-700 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>STUDENT NAME</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="p-4">FATHER NAME</th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-emerald-700 transition-colors"
                  onClick={() => handleSort('class')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>CLASS</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-emerald-700 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>CATEGORY</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="p-4">GUARDIAN CELL NO</th>
                <th className="p-4">SABAQ PROGRESS</th>
                <th className="p-4 text-center">STATUS</th>
                <th className="p-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-gray-500">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-gray-700">No students found</p>
                    <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search keywords or filter criteria</p>
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
                      className={`hover:bg-emerald-50/40 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-emerald-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(st.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                        />
                      </td>

                      {/* Profile Photo with Green Online Dot */}
                      <td className="p-4">
                        <div className="relative inline-block">
                          <img
                            src={st.photoUrl}
                            alt={st.studentName}
                            className="w-11 h-11 rounded-2xl object-cover border border-gray-200 shadow-xs group-hover:scale-105 transition-transform"
                          />
                          <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 shadow-xs" />
                        </div>
                      </td>

                      {/* Admission No */}
                      <td className="p-4 font-mono font-bold text-emerald-800 whitespace-nowrap text-xs">
                        {st.admissionNo}
                      </td>

                      {/* Student Name (English + Urdu underneath) */}
                      <td className="p-4">
                        <span className="font-bold text-gray-900 block group-hover:text-emerald-700 transition-colors">
                          {st.studentName}
                        </span>
                        <span className="text-xs text-emerald-800 font-urdu urdu-font font-semibold leading-tight">
                          {st.studentNameUrdu}
                        </span>
                      </td>

                      {/* Father Name */}
                      <td className="p-4 text-gray-700 font-medium">
                        {st.fatherName}
                      </td>

                      {/* Class */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 whitespace-nowrap">
                            {st.class}
                          </span>
                          {st.classHistory && st.classHistory.length > 0 && (
                            <span 
                              title={`Class Transfer History (${st.classHistory.length} transfers/promotions)`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              <ArrowRightLeft className="w-2.5 h-2.5" />
                              <span>{st.classHistory.length}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          st.category === 'Hostel' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/70' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200/70'
                        }`}>
                          {st.category}
                        </span>
                      </td>

                      {/* Guardian Cell No */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-700 font-mono text-xs">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{st.contactNumber}</span>
                        </div>
                      </td>

                      {/* Sabaq Progress (Label + Progress Bar + %) */}
                      <td className="p-4 max-w-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-gray-800 truncate max-w-[150px]" title={sabaqInfo.text}>
                              {sabaqInfo.text}
                            </span>
                            <span className="font-bold text-emerald-800 font-mono ml-2">
                              {sabaqInfo.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${sabaqInfo.percentage}%` }}
                              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
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
                            showToast(`Student "${st.studentName}" marked ${newStatus ? 'Active' : 'Inactive'}`, 'info');
                          }}
                          title="Click to toggle Active / Inactive status"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs cursor-pointer ${
                            st.isActive !== false 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                              : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${st.isActive !== false ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          <span>{st.isActive !== false ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => onSelectStudent(st)}
                            title="View Student Profile"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onSelectStudent(st)}
                            title="Edit Student"
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, st.id, st.studentName)}
                            title="Delete Student"
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
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
        <div className="p-4 bg-white/50 backdrop-blur-md border-t border-white/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-medium">
          <div>
            <span>
              Showing <strong>{paginatedStudents.length}</strong> of <strong>{filteredStudents.length}</strong> students
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Rows per page */}
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/80 backdrop-blur-sm border border-white/90 font-bold text-slate-700 shadow-2xs"
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
                className="p-1.5 rounded-xl border border-white/90 bg-white/70 hover:bg-white/90 disabled:opacity-40 disabled:pointer-events-none text-slate-700 shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage(p);
                          setGotoPageInput(String(p));
                        }}
                        className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                          currentPage === p
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
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
                className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none text-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Go to page input */}
            <div className="flex items-center gap-1">
              <span>Go to</span>
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
                className="w-12 px-2 py-1 text-center font-mono font-bold rounded-xl border border-gray-200 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. BOTTOM 5 CARDS: SUMMARY STATS & QUICK ACTIONS (Matching media_1788721593765.png)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 font-montserrat">
            {totalStudentsCount || 482}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12 this month</span>
          </div>
        </div>

        {/* Card 2: Hostel Students */}
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Hostel Students</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 font-montserrat">
            {hostelStudentsCount || 312}
          </div>
          <div className="text-[11px] text-purple-700 font-bold">
            <span>{hostelPercentage}% of total</span>
          </div>
        </div>

        {/* Card 3: Day Scholars */}
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Day Scholars</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 font-montserrat">
            {dayScholarCount || 170}
          </div>
          <div className="text-[11px] text-blue-700 font-bold">
            <span>{dayScholarPercentage}% of total</span>
          </div>
        </div>

        {/* Card 4: New Admissions (This Month) */}
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">New Admissions</span>
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 font-montserrat">
            18
          </div>
          <div className="flex items-center gap-1 text-[11px] text-violet-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+5 from last month</span>
          </div>
        </div>

        {/* Card 5: Quick Actions */}
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-2 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            <span>Quick Actions</span>
          </span>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[11px] font-bold text-gray-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Import / Export Data</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Generating Student Master Registry Report...', 'info')}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Student Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
