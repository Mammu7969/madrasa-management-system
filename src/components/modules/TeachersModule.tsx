import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Teacher, MadrasaClass } from '../../types';
import { 
  GraduationCap, 
  Plus, 
  Phone, 
  CheckCircle2, 
  UserX, 
  Trash2, 
  Search, 
  Award, 
  BookOpen, 
  IndianRupee,
  Users,
  ShieldCheck,
  LayoutGrid,
  List,
  Filter,
  Eye,
  MessageSquare,
  MoreVertical,
  Mail,
  Calendar,
  Clock,
  Briefcase,
  Check,
  X,
  Key,
  Lock,
  User,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { generateDefaultCredentials } from '../../utils/credentialGenerator';

// High-fidelity portrait avatars matching the scholarly reference images
const TEACHER_PORTRAITS: Record<string, string> = {
  'TCH-001': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'TCH-002': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'TCH-003': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'TCH-004': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
};

export const TeachersModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { showToast } = useTheme();

  const [teachers, setTeachers] = useState<Teacher[]>(() => db.getTeachers(activeMadrasa?.id));
  const [classes] = useState<MadrasaClass[]>(() => db.getClasses(activeMadrasa?.id));
  
  // Filters & View State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals State
  const [showNewTeacherModal, setShowNewTeacherModal] = useState<boolean>(false);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<Teacher | null>(null);
  const [selectedTeacherForContact, setSelectedTeacherForContact] = useState<Teacher | null>(null);

  // Credentials Management State for Teacher Profile Modal
  const [profileUsername, setProfileUsername] = useState<string>('');
  const [profilePassword, setProfilePassword] = useState<string>('');

  // New Teacher Form State
  const [name, setName] = useState<string>('');
  const [nameUrdu, setNameUrdu] = useState<string>('');
  const [designation, setDesignation] = useState<string>('Quran Teacher');
  const [assignedClass, setAssignedClass] = useState<string>(classes[0]?.name || 'Hifz Section A');
  const [phone, setPhone] = useState<string>('');
  const [qualification, setQualification] = useState<string>('Fazil Dars-e-Nizami');
  const [salary, setSalary] = useState<number>(0);
  const [isPresentToday, setIsPresentToday] = useState<boolean>(true);
  const [newJoiningDate, setNewJoiningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newDob, setNewDob] = useState<string>('1990-01-01');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const handleOpenTeacherProfile = (teacher: Teacher) => {
    const creds = generateDefaultCredentials(teacher.name, teacher.joiningDate, teacher.dob);
    setProfileUsername(teacher.username || creds.username);
    setProfilePassword(teacher.password || creds.password);
    setSelectedTeacherForProfile(teacher);
  };

  const handleAutoGenerateProfileCreds = () => {
    if (!selectedTeacherForProfile) return;
    const creds = generateDefaultCredentials(
      selectedTeacherForProfile.name, 
      selectedTeacherForProfile.joiningDate, 
      selectedTeacherForProfile.dob
    );
    setProfileUsername(creds.username);
    setProfilePassword(creds.password);
    showToast(`Default credentials generated: ${creds.username} / ${creds.password}`, 'info');
  };

  const handleSaveTeacherCredentials = () => {
    if (!selectedTeacherForProfile) return;
    if (!profileUsername.trim() || !profilePassword.trim()) {
      showToast('Username and Password cannot be empty', 'error');
      return;
    }
    const updatedTeacher: Teacher = {
      ...selectedTeacherForProfile,
      username: profileUsername.trim(),
      password: profilePassword.trim()
    };
    db.updateTeacher(updatedTeacher);
    const updatedList = db.getTeachers(activeMadrasa?.id);
    setTeachers(updatedList);
    setSelectedTeacherForProfile(updatedTeacher);
    showToast(`Login credentials for Ustadh ${updatedTeacher.name} saved successfully!`, 'success');
  };

  const handleAutoGenerateNewCreds = (teacherName: string, joinDate: string, birthDate: string) => {
    const creds = generateDefaultCredentials(teacherName || 'Teacher', joinDate, birthDate);
    setNewUsername(creds.username);
    setNewPassword(creds.password);
  };

  // Handle Add Teacher
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeMadrasa) {
      showToast('Please provide the teacher name', 'error');
      return;
    }

    const creds = (newUsername.trim() && newPassword.trim())
      ? { username: newUsername.trim(), password: newPassword.trim() }
      : generateDefaultCredentials(name.trim(), newJoiningDate, newDob);

    const nextIdNum = teachers.length + 1;
    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      teacherIdNo: `TCH-${String(nextIdNum).padStart(3, '0')}`,
      name: name.trim(),
      nameUrdu: nameUrdu.trim() || name.trim(),
      designation: designation.trim(),
      assignedClass: assignedClass.trim() || 'General',
      phone: phone.trim() || '+91 98765 00000',
      qualification: qualification.trim() || 'Fazil Dars-e-Nizami',
      salary: Number(salary) || 0,
      madrasaId: activeMadrasa.id,
      username: creds.username,
      password: creds.password,
      joiningDate: newJoiningDate,
      dob: newDob,
      isPresentToday: isPresentToday
    };

    db.addTeacher(newTeacher);
    const updated = db.getTeachers(activeMadrasa.id);
    setTeachers(updated);
    showToast(`Ustadh ${newTeacher.name} registered with username ${creds.username}!`, 'success');

    // Reset
    setName('');
    setNameUrdu('');
    setPhone('');
    setSalary(0);
    setNewUsername('');
    setNewPassword('');
    setShowNewTeacherModal(false);
  };

  // Toggle Attendance
  const handleToggleAttendance = (teacher: Teacher) => {
    const updatedList = teachers.map(t => 
      t.id === teacher.id ? { ...t, isPresentToday: !t.isPresentToday } : t
    );
    db.saveTeachers(updatedList);
    setTeachers(updatedList);
    showToast(`${teacher.name} marked ${!teacher.isPresentToday ? 'Present (حاضر)' : 'On Leave (غیر حاضر)'}`, 'info');
  };

  // Delete Teacher
  const handleDeleteTeacher = (teacherId: string, teacherName: string) => {
    if (window.confirm(`Are you sure you want to remove Ustadh ${teacherName}?`)) {
      db.deleteTeacher(teacherId);
      const updated = db.getTeachers(activeMadrasa?.id);
      setTeachers(updated);
      showToast(`Ustadh ${teacherName} removed`, 'info');
      setSelectedTeacherForProfile(null);
    }
  };

  // Filter Logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      // Keyword search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.name.toLowerCase().includes(q) ||
        t.nameUrdu.includes(q) ||
        t.teacherIdNo.toLowerCase().includes(q) ||
        t.assignedClass.toLowerCase().includes(q) ||
        (t.qualification && t.qualification.toLowerCase().includes(q)) ||
        (t.designation && t.designation.toLowerCase().includes(q));

      // Class dropdown filter
      const matchesClass = selectedClassFilter === 'all' || t.assignedClass === selectedClassFilter;

      // Status dropdown filter
      const matchesStatusDropdown = 
        selectedStatusFilter === 'all' ? true :
        selectedStatusFilter === 'present' ? t.isPresentToday :
        !t.isPresentToday;

      // Pill tab filter
      const matchesPillTab = 
        activeTabFilter === 'all' ? true :
        activeTabFilter === 'present' ? t.isPresentToday :
        !t.isPresentToday;

      // Department filter
      const matchesDept = 
        selectedDeptFilter === 'all' ? true :
        selectedDeptFilter === 'hifz' ? t.assignedClass.toLowerCase().includes('hifz') :
        selectedDeptFilter === 'nazira' ? t.assignedClass.toLowerCase().includes('nazira') :
        selectedDeptFilter === 'alimiyat' ? t.assignedClass.toLowerCase().includes('alimiyat') :
        true;

      return matchesSearch && matchesClass && matchesStatusDropdown && matchesPillTab && matchesDept;
    });
  }, [teachers, searchQuery, selectedClassFilter, selectedStatusFilter, selectedDeptFilter, activeTabFilter]);

  // Statistics
  const presentCount = teachers.filter(t => t.isPresentToday).length;
  const onLeaveCount = teachers.length - presentCount;
  const presentPercentage = teachers.length > 0 ? Math.round((presentCount / teachers.length) * 100) : 0;
  const onLeavePercentage = teachers.length > 0 ? Math.round((onLeaveCount / teachers.length) * 100) : 0;
  const totalMonthlySalary = teachers.reduce((acc, curr) => acc + (curr.salary || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* =========================================================================
          1. TOP BANNER: Asatizah-e-Kiram (Teachers)
          Matching Image 1 with Mosque Silhouette & Solid Emerald Button
          ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Subtle Decorative Mosque Silhouette on the right */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-no-repeat bg-right bg-contain hidden md:block"
          style={{ backgroundImage: "url('/quran-banner-mosque.png')" }}
        />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              Asatizah-e-Kiram <span className="font-normal text-gray-700">(Teachers)</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Teachers directory, qualifications, class assignments, allowances, and daily status
            </p>
          </div>
        </div>

        {/* Solid Emerald "+ New Teacher" Button */}
        <button
          type="button"
          onClick={() => setShowNewTeacherModal(true)}
          className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Teacher</span>
          <div className="w-6 h-6 rounded-xl bg-emerald-800/80 flex items-center justify-center ml-1">
            <Users className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* =========================================================================
          2. TOP 4 METRIC KPI STAT CARDS
          Total Teachers | Present Today | On Leave | Total Monthly Salary
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Teachers */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Total Teachers</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 font-mono">{teachers.length}</span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">All Registered Teachers</span>
          </div>
        </div>

        {/* Card 2: Present Today */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Present Today</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 font-mono">{presentCount}</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">{presentPercentage}% Attendance</span>
          </div>
        </div>

        {/* Card 3: On Leave */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">On Leave</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 font-mono">{onLeaveCount}</span>
            </div>
            <span className="text-[11px] text-orange-600 font-bold">{onLeavePercentage}% of Total</span>
          </div>
        </div>

        {/* Card 4: Total Monthly Salary */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Total Monthly Salary</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 font-mono">₹{totalMonthlySalary.toLocaleString()}</span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">This Month</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. FILTER AND SEARCH ACTION STRIP
          Search Input | All Classes | All Status | All Depts | Grid/List | Filter | Tabs
          ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teacher, ID, class, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-medium"
          />
        </div>

        {/* Dropdown 1: All Classes */}
        <div className="relative">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: All Status */}
        <div className="relative">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">On Leave</option>
          </select>
        </div>

        {/* Dropdown 3: All Departments */}
        <div className="relative">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="hifz">Hifz</option>
            <option value="nazira">Nazira</option>
            <option value="alimiyat">Dars-e-Nizami</option>
          </select>
        </div>

        {/* View Mode Toggle: Grid & List */}
        <div className="flex items-center bg-gray-50 p-0.5 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => {
            setSelectedClassFilter('all');
            setSelectedStatusFilter('all');
            setSelectedDeptFilter('all');
            setSearchQuery('');
          }}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all"
          title="Reset Filters"
        >
          <Filter className="w-4 h-4 text-emerald-700" />
        </button>

        {/* Status Pill Tabs: All (4) | Present (3) | On Leave (1) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTabFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({teachers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter('present')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabFilter === 'present'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Present ({presentCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter('absent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabFilter === 'absent'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            On Leave ({onLeaveCount})
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. TEACHERS DIRECTORY (GRID & LIST VIEWS)
          Replicating media_1788725191240.png with Zero CSS Gradients
          ========================================================================= */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTeachers.map(t => {
            const avatar = TEACHER_PORTRAITS[t.teacherIdNo] || TEACHER_PORTRAITS['TCH-001'];

            return (
              <div
                key={t.id}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top Badges: TCH-001 & Present / On Leave */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {t.teacherIdNo}
                    </span>

                    {t.isPresentToday ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                        <span>Present</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        <span>On Leave</span>
                      </span>
                    )}
                  </div>

                  {/* Avatar & Names */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={avatar}
                        alt={t.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        t.isPresentToday ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-snug truncate">
                        {t.name}
                      </h4>
                      <span className="text-xs text-gray-500 block truncate mt-0.5">
                        {t.designation || 'Teacher'}
                      </span>
                    </div>
                  </div>

                  {/* Attribute Details List */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                        <span>Class:</span>
                      </span>
                      <span className="font-bold text-gray-900">{t.assignedClass}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <span className="text-gray-400 flex items-center gap-1.5 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                        <span>Qualification:</span>
                      </span>
                      <span className="font-medium text-gray-700 text-right truncate" title={t.qualification}>
                        {t.qualification || 'Fazil Dars-e-Nizami'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Contact:</span>
                      </span>
                      <a
                        href={`tel:${t.phone}`}
                        className="font-mono text-emerald-700 hover:underline font-bold"
                      >
                        {t.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom 3 Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenTeacherProfile(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 text-xs font-bold transition-all shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTeacherForContact(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 text-xs font-bold transition-all shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleAttendance(t)}
                    className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 transition-all"
                    title="Toggle Attendance / More"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Teacher ID</th>
                  <th className="py-3.5 px-4">Ustadh Name</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Assigned Class</th>
                  <th className="py-3.5 px-4">Qualification</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map(t => (
                  <tr key={t.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {t.teacherIdNo}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{t.name}</span>
                        <span className="text-gray-400 font-urdu">({t.nameUrdu})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{t.designation || 'Teacher'}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">{t.assignedClass}</td>
                    <td className="py-3 px-4 text-gray-600">{t.qualification}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{t.phone}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(t)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          t.isPresentToday ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.isPresentToday ? '✔ Present' : '🔴 On Leave'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenTeacherProfile(t)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTeacherForContact(t)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800"
                          title="Contact"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty Search State */}
      {filteredTeachers.length === 0 && (
        <div className="text-center py-16 bg-white/80 rounded-3xl border border-dashed border-gray-300 space-y-2">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">No teachers found matching your filters</p>
          <p className="text-xs text-gray-400">Try changing your search query or reset the filters.</p>
        </div>
      )}

      {/* =========================================================================
          5. TEACHER PROFILE DOSSIER MODAL
          ========================================================================= */}
      {selectedTeacherForProfile && (
        <Modal
          isOpen={Boolean(selectedTeacherForProfile)}
          onClose={() => setSelectedTeacherForProfile(null)}
          title="Teacher Profile Dossier (معلومات استاد محترم)"
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Header Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={TEACHER_PORTRAITS[selectedTeacherForProfile.teacherIdNo] || TEACHER_PORTRAITS['TCH-001']}
                  alt={selectedTeacherForProfile.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900">{selectedTeacherForProfile.name}</h3>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                      {selectedTeacherForProfile.teacherIdNo}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 font-urdu text-sm block mt-0.5">
                    {selectedTeacherForProfile.nameUrdu} &bull; {selectedTeacherForProfile.designation || 'Teacher'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                  selectedTeacherForProfile.isPresentToday ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedTeacherForProfile.isPresentToday ? '✔ Present Today' : '🔴 On Leave Today'}
                </span>
              </div>
            </div>

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-gray-200 space-y-2">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Academic Assignment</span>
                <div className="flex justify-between">
                  <span className="text-gray-400">Class Incharge:</span>
                  <span className="font-bold text-gray-900">{selectedTeacherForProfile.assignedClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Qualification:</span>
                  <span className="font-bold text-gray-900">{selectedTeacherForProfile.qualification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Faculty Role:</span>
                  <span className="font-bold text-gray-900">{selectedTeacherForProfile.designation || 'Faculty Member'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-gray-200 space-y-2">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Contact & Allowances</span>
                <div className="flex justify-between">
                  <span className="text-gray-400">Direct Phone:</span>
                  <a href={`tel:${selectedTeacherForProfile.phone}`} className="font-bold text-emerald-700 font-mono">
                    {selectedTeacherForProfile.phone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Allowance:</span>
                  <span className="font-bold text-gray-900 font-mono">₹{Number(selectedTeacherForProfile.salary || 0).toLocaleString()} / month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-bold text-emerald-700">Active Faculty</span>
                </div>
              </div>
            </div>

            {/* Teacher Login Credentials (Admin Controlled) */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-amber-950 block">
                      Teacher Portal Login Access (لاگ ان معلومات برائے استاد)
                    </span>
                    <span className="text-[10px] text-amber-800">
                      Admin / Principal can review, generate, and update this teacher's credentials
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateProfileCreds}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/90 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                  title="Generate using First 4 Letters + Joining Year & DOB Year"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                  <span>Auto-Generate Default</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Username (لاگ ان نام) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      placeholder="e.g. Moha-2022"
                      className="w-full p-2.5 pr-8 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <User className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3" />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Formula: First 4 Letters - Year (e.g. Abdu-2026)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Password (پاس ورڈ) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="e.g. Moha@1988"
                      className="w-full p-2.5 pr-8 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3" />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Formula: First 4 Letters @ DOB Year (e.g. Abdu@1990)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
                <span className="text-[11px] text-amber-900 font-medium">
                  Teacher logs in with this Username and Password on the login portal.
                </span>
                <button
                  type="button"
                  onClick={handleSaveTeacherCredentials}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update & Save Credentials</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => handleToggleAttendance(selectedTeacherForProfile)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold"
              >
                Toggle Status ({selectedTeacherForProfile.isPresentToday ? 'Mark Leave' : 'Mark Present'})
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteTeacher(selectedTeacherForProfile.id, selectedTeacherForProfile.name)}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Ustadh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForProfile(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          6. CONTACT TEACHER QUICK MODAL
          ========================================================================= */}
      {selectedTeacherForContact && (
        <Modal
          isOpen={Boolean(selectedTeacherForContact)}
          onClose={() => setSelectedTeacherForContact(null)}
          title="Direct Contact (رابطہ مع استاد محترم)"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900">{selectedTeacherForContact.name}</h4>
              <span className="text-xs text-gray-500">{selectedTeacherForContact.designation || 'Teacher'}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-400 block font-mono">Mobile / WhatsApp</span>
              <strong className="text-lg text-emerald-800 font-mono">{selectedTeacherForContact.phone}</strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2">
              <a
                href={`tel:${selectedTeacherForContact.phone}`}
                className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href={`https://wa.me/${selectedTeacherForContact.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 flex items-center justify-center gap-1.5 border border-emerald-300"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          7. NEW TEACHER REGISTRATION MODAL
          ========================================================================= */}
      {showNewTeacherModal && (
        <Modal
          isOpen={showNewTeacherModal}
          onClose={() => setShowNewTeacherModal(false)}
          title="Register New Teacher (نیا استاد شامل کریں)"
          maxWidth="lg"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewTeacherModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Save Teacher</span>
              </button>
            </div>
          }
        >
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Full Name in English *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Qari Mohammad Huzaifa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Name in Urdu (اردو نام مع القاب)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثلاً: قاری محمد حذیفہ صاحب"
                  value={nameUrdu}
                  onChange={(e) => setNameUrdu(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none font-urdu"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Faculty Role / Designation *
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none font-bold"
                >
                  <option value="Quran Teacher">Quran Teacher (استاد قرآن)</option>
                  <option value="Senior Teacher">Senior Teacher (سینئر استاد)</option>
                  <option value="Quran & Tajweed Teacher">Quran & Tajweed Teacher (استاد تجوید)</option>
                  <option value="Nazim-e-Taleemat">Nazim-e-Taleemat (ناظم تعلیمات)</option>
                  <option value="Dars-e-Nizami Faculty">Dars-e-Nizami Faculty (استاد درس نظامی)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Assigned Class *
                </label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none font-bold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 00111"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Academic Qualification / Sanad *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fazil Dars-e-Nizami, Hafiz-e-Quran"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Monthly Allowance / Salary (₹)
                </label>
                <input
                  type="number"
                  placeholder="18000"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Joining / Appointment Date *
                </label>
                <input
                  type="date"
                  value={newJoiningDate}
                  onChange={(e) => {
                    setNewJoiningDate(e.target.value);
                    if (!newUsername || newUsername.includes('-')) {
                      handleAutoGenerateNewCreds(name, e.target.value, newDob);
                    }
                  }}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Date of Birth (DOB) *
                </label>
                <input
                  type="date"
                  value={newDob}
                  onChange={(e) => {
                    setNewDob(e.target.value);
                    if (!newPassword || newPassword.includes('@')) {
                      handleAutoGenerateNewCreds(name, newJoiningDate, e.target.value);
                    }
                  }}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none font-mono"
                  required
                />
              </div>

              {/* Login Credentials Allocation */}
              <div className="sm:col-span-2 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    Teacher Portal Login Credentials (پورٹل لاگ ان معلومات)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAutoGenerateNewCreds(name, newJoiningDate, newDob)}
                    className="text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-800" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-0.5">Username *</label>
                    <input
                      type="text"
                      value={newUsername || generateDefaultCredentials(name || 'Teacher', newJoiningDate, newDob).username}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. Moha-2026"
                      className="w-full p-2 text-xs rounded-xl border border-amber-300 bg-white font-mono"
                      required
                    />
                    <span className="text-[9px] text-gray-500 block mt-0.5">First 4 letters + (-) + Joining Year</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-0.5">Password *</label>
                    <input
                      type="text"
                      value={newPassword || generateDefaultCredentials(name || 'Teacher', newJoiningDate, newDob).password}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="e.g. Moha@1990"
                      className="w-full p-2 text-xs rounded-xl border border-amber-300 bg-white font-mono"
                      required
                    />
                    <span className="text-[9px] text-gray-500 block mt-0.5">First 4 letters + (@) + DOB Year</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Today's Attendance Status
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="radio"
                      name="initAttendance"
                      checked={isPresentToday}
                      onChange={() => setIsPresentToday(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-emerald-800">Present (حاضر)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="radio"
                      name="initAttendance"
                      checked={!isPresentToday}
                      onChange={() => setIsPresentToday(false)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-800">On Leave (رخصت)</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
