import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Staff } from '../../types';
import { 
  UserCheck, 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Building2, 
  Shield, 
  UtensilsCrossed, 
  BedDouble, 
  Wrench, 
  FileSpreadsheet, 
  Briefcase, 
  Printer,
  Sparkles,
  SlidersHorizontal,
  PhoneCall
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface DepartmentMeta {
  id: string;
  en: string;
  ur: string;
  color: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
}

const DEPARTMENTS: DepartmentMeta[] = [
  { id: 'Kitchen & Dining', en: 'Kitchen & Dining', ur: 'شعبہ مطبخ و طعام', color: 'amber', badgeBg: 'bg-amber-50', textColor: 'text-amber-800', borderColor: 'border-amber-200' },
  { id: 'Hostel Administration', en: 'Hostel Administration', ur: 'انتظامیہ دار الاقامہ', color: 'indigo', badgeBg: 'bg-indigo-50', textColor: 'text-indigo-800', borderColor: 'border-indigo-200' },
  { id: 'Security & Facilities', en: 'Security & Facilities', ur: 'شعبہ حفاظت و سیکیورٹی', color: 'rose', badgeBg: 'bg-rose-50', textColor: 'text-rose-800', borderColor: 'border-rose-200' },
  { id: 'Accounts Office', en: 'Accounts & General Office', ur: 'شعبہ حسابات و امورِ دفتر', color: 'emerald', badgeBg: 'bg-emerald-50', textColor: 'text-emerald-800', borderColor: 'border-emerald-200' },
  { id: 'Maintenance', en: 'Maintenance & Cleanliness', ur: 'دیکھ بھال و صفائی', color: 'sky', badgeBg: 'bg-sky-50', textColor: 'text-sky-800', borderColor: 'border-sky-200' },
  { id: 'Transportation', en: 'Transportation', ur: 'ٹرانسپورٹ و گاڑیاں', color: 'purple', badgeBg: 'bg-purple-50', textColor: 'text-purple-800', borderColor: 'border-purple-200' },
  { id: 'General Services', en: 'General Services & Khidmat', ur: 'عمومی خدمات و متفرق', color: 'teal', badgeBg: 'bg-teal-50', textColor: 'text-teal-800', borderColor: 'border-teal-200' },
];

const PRESET_ROLES = [
  { en: 'Head Chef (Bawarchi)', ur: 'باورچی و ناظم مطبخ', dept: 'Kitchen & Dining' },
  { en: 'Assistant Cook (Khadim Matbakh)', ur: 'معاون باورچی', dept: 'Kitchen & Dining' },
  { en: 'Hostel Warden (Nazim-e-Darul Iqamah)', ur: 'ناظم دار الاقامہ (وارڈن)', dept: 'Hostel Administration' },
  { en: 'Assistant Hostel Warden', ur: 'نائب ناظم دار الاقامہ', dept: 'Hostel Administration' },
  { en: 'Campus Security Incharge', ur: 'نگراں سیکیورٹی و حفاظت', dept: 'Security & Facilities' },
  { en: 'Security Guard (Chowkidar)', ur: 'چوکیدار / محافظ', dept: 'Security & Facilities' },
  { en: 'Accountant & Office Clerk', ur: 'محاسب و دفتر کلرک', dept: 'Accounts Office' },
  { en: 'Office Assistant / Peon', ur: 'دفتر خادم و معاون', dept: 'Accounts Office' },
  { en: 'Maintenance & Facilities Caretaker', ur: 'نگراں تعمیرات و دیکھ بھال', dept: 'Maintenance' },
  { en: 'Electrician & Plumber', ur: 'الیکٹریشن و پلمبر', dept: 'Maintenance' },
  { en: 'Sanitation Worker (Safai Incharge)', ur: 'خادمِ صفائی', dept: 'Maintenance' },
  { en: 'Madrasa Bus/Van Driver', ur: 'ڈرائیور گاڑی', dept: 'Transportation' },
];

export const StaffModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { language, showToast } = useTheme();

  const isUrdu = language === 'ur';
  const loc = (en: string, ur: string): string => (isUrdu ? ur : en);

  // Staff State from Database
  const [staffList, setStaffList] = useState<Staff[]>(() => db.getStaff(activeMadrasa?.id));

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal: Add New Staff
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addName, setAddName] = useState<string>('');
  const [addNameUrdu, setAddNameUrdu] = useState<string>('');
  const [addRole, setAddRole] = useState<string>('Head Chef (Bawarchi)');
  const [addRoleUrdu, setAddRoleUrdu] = useState<string>('باورچی و ناظم مطبخ');
  const [addDepartment, setAddDepartment] = useState<string>('Kitchen & Dining');
  const [addDepartmentUrdu, setAddDepartmentUrdu] = useState<string>('شعبہ مطبخ و طعام');
  const [addPhone, setAddPhone] = useState<string>('');
  const [addEmail, setAddEmail] = useState<string>('');
  const [addSalary, setAddSalary] = useState<number>(16000);
  const [addJoiningDate, setAddJoiningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [addStatus, setAddStatus] = useState<'Active' | 'On Leave' | 'Resigned'>('Active');
  const [addAddress, setAddAddress] = useState<string>('');
  const [addNotes, setAddNotes] = useState<string>('');

  // Modal: Edit Existing Staff
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editNameUrdu, setEditNameUrdu] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('');
  const [editRoleUrdu, setEditRoleUrdu] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editDepartmentUrdu, setEditDepartmentUrdu] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editSalary, setEditSalary] = useState<number>(0);
  const [editJoiningDate, setEditJoiningDate] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'Active' | 'On Leave' | 'Resigned'>('Active');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Synchronize role and department selection in Add Form
  const handleRoleSelectAdd = (roleEn: string) => {
    setAddRole(roleEn);
    const matched = PRESET_ROLES.find(r => r.en === roleEn);
    if (matched) {
      setAddRoleUrdu(matched.ur);
      setAddDepartment(matched.dept);
      const deptMeta = DEPARTMENTS.find(d => d.id === matched.dept);
      if (deptMeta) {
        setAddDepartmentUrdu(deptMeta.ur);
      }
    }
  };

  // Synchronize role and department selection in Edit Form
  const handleRoleSelectEdit = (roleEn: string) => {
    setEditRole(roleEn);
    const matched = PRESET_ROLES.find(r => r.en === roleEn);
    if (matched) {
      setEditRoleUrdu(matched.ur);
      setEditDepartment(matched.dept);
      const deptMeta = DEPARTMENTS.find(d => d.id === matched.dept);
      if (deptMeta) {
        setEditDepartmentUrdu(deptMeta.ur);
      }
    }
  };

  // Handle opening Edit Modal on staff card click
  const handleOpenEdit = (member: Staff) => {
    setEditingStaff(member);
    setEditName(member.name);
    setEditNameUrdu(member.nameUrdu || '');
    setEditRole(member.role);
    setEditRoleUrdu(member.roleUrdu || '');
    setEditDepartment(member.department);
    setEditDepartmentUrdu(member.departmentUrdu || '');
    setEditPhone(member.phone);
    setEditEmail(member.email || '');
    setEditAddress(member.address || '');
    setEditSalary(member.salary || 0);
    setEditJoiningDate(member.joiningDate || new Date().toISOString().split('T')[0]);
    setEditStatus(member.status || 'Active');
    setEditNotes(member.notes || '');
    setShowEditModal(true);
  };

  // Handle Add New Staff
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      showToast(loc('Please enter staff name', 'برائے مہربانی ملازم کا نام درج کریں'), 'error');
      return;
    }

    const nextId = `stf-${Date.now()}`;
    const staffIdNo = `STF-${String(staffList.length + 1).padStart(3, '0')}`;

    const newMember: Staff = {
      id: nextId,
      staffIdNo,
      name: addName.trim(),
      nameUrdu: addNameUrdu.trim() || addName.trim(),
      role: addRole.trim(),
      roleUrdu: addRoleUrdu.trim() || addRole.trim(),
      department: addDepartment.trim(),
      departmentUrdu: addDepartmentUrdu.trim() || addDepartment.trim(),
      phone: addPhone.trim(),
      email: addEmail.trim() || undefined,
      address: addAddress.trim() || undefined,
      salary: Number(addSalary) || 0,
      joiningDate: addJoiningDate,
      status: addStatus,
      madrasaId: activeMadrasa?.id || 'madrasa-1',
      notes: addNotes.trim() || undefined
    };

    db.addStaff(newMember);
    const updated = db.getStaff(activeMadrasa?.id);
    setStaffList(updated);

    showToast(
      loc(
        `Staff member "${newMember.name}" (${newMember.staffIdNo}) added successfully!`,
        `نیا ملازم "${newMember.nameUrdu || newMember.name}" کامیابی سے شامل کر دیا گیا!`
      ),
      'success'
    );

    // Reset Form
    setAddName('');
    setAddNameUrdu('');
    setAddPhone('');
    setAddEmail('');
    setAddAddress('');
    setAddSalary(16000);
    setAddNotes('');
    setShowAddModal(false);
  };

  // Handle Save Edited Staff
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !editName.trim()) {
      showToast(loc('Please enter staff name', 'برائے مہربانی ملازم کا نام درج کریں'), 'error');
      return;
    }

    const updatedMember: Staff = {
      ...editingStaff,
      name: editName.trim(),
      nameUrdu: editNameUrdu.trim() || editName.trim(),
      role: editRole.trim(),
      roleUrdu: editRoleUrdu.trim() || editRole.trim(),
      department: editDepartment.trim(),
      departmentUrdu: editDepartmentUrdu.trim() || editDepartment.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || undefined,
      address: editAddress.trim() || undefined,
      salary: Number(editSalary) || 0,
      joiningDate: editJoiningDate,
      status: editStatus,
      notes: editNotes.trim() || undefined
    };

    db.updateStaff(updatedMember);
    const refreshed = db.getStaff(activeMadrasa?.id);
    setStaffList(refreshed);

    showToast(
      loc(
        `Staff member "${updatedMember.name}" updated successfully!`,
        `ملازم "${updatedMember.nameUrdu || updatedMember.name}" کی تفصیلات میں کامیابی سے ترمیم کر دی گئی!`
      ),
      'success'
    );

    setShowEditModal(false);
    setEditingStaff(null);
  };

  // Handle Delete Staff
  const handleDelete = (member: Staff, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm(
      loc(
        `Are you sure you want to remove staff member "${member.name}" (${member.staffIdNo})?`,
        `کیا آپ واقعی ملازم "${member.nameUrdu || member.name}" کو فہرست سے حذف کرنا چاہتے ہیں؟`
      )
    );

    if (confirmed) {
      db.deleteStaff(member.id);
      const refreshed = db.getStaff(activeMadrasa?.id);
      setStaffList(refreshed);
      if (showEditModal && editingStaff?.id === member.id) {
        setShowEditModal(false);
        setEditingStaff(null);
      }
      showToast(
        loc(`Staff member "${member.name}" removed`, `ملازم "${member.nameUrdu || member.name}" کو حذف کر دیا گیا`),
        'info'
      );
    }
  };

  // Toggle Status (Active <-> On Leave)
  const handleToggleStatus = (member: Staff, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: 'Active' | 'On Leave' = member.status === 'Active' ? 'On Leave' : 'Active';
    const updated = { ...member, status: newStatus };
    db.updateStaff(updated);
    setStaffList(db.getStaff(activeMadrasa?.id));
    showToast(
      loc(
        `${member.name} marked as ${newStatus}`,
        `${member.nameUrdu || member.name} کو ${newStatus === 'Active' ? 'حاضر و فعال' : 'رخصت پر'} درج کر دیا گیا`
      ),
      'info'
    );
  };

  // Export Staff Directory to CSV
  const handleExportCSV = () => {
    const headers = ['Staff ID', 'Name', 'Urdu Name', 'Department', 'Role', 'Phone', 'Salary (INR)', 'Status', 'Joining Date', 'Address', 'Notes'];
    const rows = staffList.map(s => [
      s.staffIdNo,
      `"${s.name}"`,
      `"${s.nameUrdu || ''}"`,
      `"${s.department}"`,
      `"${s.role}"`,
      `"${s.phone}"`,
      s.salary || 0,
      s.status,
      s.joiningDate || '',
      `"${s.address || ''}"`,
      `"${s.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Madrasa_Staff_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(loc('Staff directory exported to CSV!', 'ملازمین کی فہرست CSV میں ڈاؤنلوڈ ہو گئی!'), 'success');
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.nameUrdu && s.nameUrdu.includes(q)) ||
        s.role.toLowerCase().includes(q) ||
        (s.roleUrdu && s.roleUrdu.includes(q)) ||
        s.department.toLowerCase().includes(q) ||
        (s.departmentUrdu && s.departmentUrdu.includes(q)) ||
        s.phone.includes(q) ||
        s.staffIdNo.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'all' || s.department === selectedDept;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [staffList, searchQuery, selectedDept, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter(s => s.status === 'Active').length;
    const onLeave = staffList.filter(s => s.status === 'On Leave').length;
    const totalPayroll = staffList.reduce((acc, s) => acc + (Number(s.salary) || 0), 0);
    return { total, active, onLeave, totalPayroll };
  }, [staffList]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ================= TOP INSTITUTIONAL HEADER & QUICK STATS ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50/50 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#079669] text-white flex items-center justify-center shadow-sm border border-white/20">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                  <span>{loc('Non-Teaching Staff & Personnel', 'ملازمینِ جامعہ و انتظامی عملہ')}</span>
                </h2>
                <p className="text-xs font-medium text-gray-500">
                  {loc(
                    'Hostel wardens, kitchen chefs, campus security, accountants, and maintenance personnel',
                    'دار الاقامہ ناظمین، باورچی خانے کا عملہ، سیکیورٹی محافظین، محاسب اور دیکھ بھال کا عملہ'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-2xs hover:shadow-xs active:scale-95"
              title={loc('Export CSV Directory', 'CSV ایکسپورٹ')}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{loc('Export CSV', 'ایکسپورٹ CSV')}</span>
            </button>

            {/* Print Directory */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-2xs hover:shadow-xs active:scale-95"
              title={loc('Print Staff List', 'پرنٹ کریں')}
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline">{loc('Print', 'پرنٹ')}</span>
            </button>

            {/* Primary Action: + Add New Staff */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 active:scale-95 hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{loc('+ Add New Staff', '+ نیا ملازم شامل کریں')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
          {/* Total Staff */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              {loc('Total Staff', 'کل ملازمین')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-gray-900">{stats.total}</span>
              <span className="text-[10px] font-semibold text-gray-500">{loc('Members', 'افراد')}</span>
            </div>
          </div>

          {/* Active Staff */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              {loc('Active on Duty', 'حاضر و فعال')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-900">{stats.active}</span>
              <span className="text-[10px] font-semibold text-emerald-700">{loc('On Duty', 'برسرِ خدمت')}</span>
            </div>
          </div>

          {/* On Leave */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              {loc('On Leave', 'رخصت پر')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-amber-900">{stats.onLeave}</span>
              <span className="text-[10px] font-semibold text-amber-700">{loc('Leave', 'چھٹی')}</span>
            </div>
          </div>

          {/* Monthly Payroll */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
              {loc('Monthly Payroll', 'ماہانہ تنخواہ بجٹ')}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <IndianRupee className="w-3.5 h-3.5 text-teal-700 inline" />
              <span className="text-xl font-black text-teal-900">{stats.totalPayroll.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTER CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={loc('Search staff by name, role, phone, or ID...', 'نام، عہدہ، موبائل نمبر یا شناختی نمبر سے تلاش کریں...')}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto">
          {/* Department Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold py-2 px-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="all">{loc('All Departments (تمام شعبہ جات)', 'تمام شعبہ جات')}</option>
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>
                  {isUrdu ? d.ur : d.en}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold py-2 px-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="all">{loc('All Status (تمام کیفیات)', 'تمام کیفیات')}</option>
              <option value="Active">{loc('Active Only (حاضر و فعال)', 'حاضر و فعال')}</option>
              <option value="On Leave">{loc('On Leave (رخصت پر)', 'رخصت پر')}</option>
              <option value="Resigned">{loc('Resigned (مستعفی)', 'مستعفی')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Helpful Hint banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-emerald-900 text-xs">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-semibold">
          {loc(
            'Tip: Click anywhere on any staff card to open the Edit Modal and update their role, salary, phone, or department.',
            'ہدایت: کسی بھی ملازم کے کارڈ پر کلک کرکے ان کا عہدہ، تنخواہ، فون نمبر یا شعبہ باآسانی تبدیل کریں۔'
          )}
        </span>
      </div>

      {/* ================= STAFF CARDS GRID ================= */}
      {filteredStaff.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-800">
            {loc('No staff members found matching criteria', 'کوئی ملازم نہیں ملا')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {loc(
              'Try changing your search query or department filter, or add a new staff member.',
              'تلاش کے الفاظ بدل کر دیکھیں یا اوپر دائیں بٹن سے نیا ملازم شامل کریں۔'
            )}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{loc('Add First Staff Member', 'پہلا ملازم شامل کریں')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredStaff.map((member) => {
            const deptMeta = DEPARTMENTS.find(d => d.id === member.department) || DEPARTMENTS[DEPARTMENTS.length - 1];

            return (
              <div
                key={member.id}
                onClick={() => handleOpenEdit(member)}
                className="group relative bg-white hover:bg-emerald-50/30 rounded-3xl p-5 border border-gray-200/90 hover:border-emerald-500/80 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4"
                title={loc(`Click to edit ${member.name}`, `ترمیم کے لیے کلک کریں (${member.nameUrdu || member.name})`)}
              >
                {/* Card Top: Department Badge & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${deptMeta.badgeBg} ${deptMeta.textColor} ${deptMeta.borderColor} truncate max-w-[170px]`}>
                    {isUrdu ? (member.departmentUrdu || deptMeta.ur) : member.department}
                  </span>

                  <button
                    onClick={(e) => handleToggleStatus(member, e)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all shrink-0 ${
                      member.status === 'Active'
                        ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                        : member.status === 'On Leave'
                        ? 'bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                    title={loc('Click to toggle status', 'کیفیت تبدیل کریں')}
                  >
                    {member.status === 'Active'
                      ? loc('Active', 'حاضر')
                      : member.status === 'On Leave'
                      ? loc('On Leave', 'رخصت')
                      : loc('Resigned', 'مستعفی')}
                  </button>
                </div>

                {/* Card Middle: Profile Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Initials Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-[#079669] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-white/20">
                      {member.name.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-black text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                          {member.name}
                        </h3>
                        <span className="text-[10px] font-mono text-gray-400 font-bold shrink-0">
                          {member.staffIdNo}
                        </span>
                      </div>

                      {member.nameUrdu && (
                        <p className="urdu-font text-sm text-emerald-950 font-bold truncate leading-tight mt-0.5">
                          {member.nameUrdu}
                        </p>
                      )}

                      <p className="text-xs font-bold text-emerald-800 mt-1 truncate">
                        {isUrdu ? (member.roleUrdu || member.role) : member.role}
                      </p>
                    </div>
                  </div>

                  {/* Notes / Description snippet */}
                  {member.notes && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 bg-gray-50/80 p-2 rounded-xl border border-gray-100 mt-2">
                      {member.notes}
                    </p>
                  )}
                </div>

                {/* Card Bottom: Metadata Badges & Action Controls */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    {/* Phone */}
                    <a
                      href={`tel:${member.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-700 hover:text-emerald-700 transition-colors"
                      title={loc('Call staff member', 'کال کریں')}
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{member.phone}</span>
                    </a>

                    {/* Salary */}
                    {member.salary > 0 && (
                      <div className="inline-flex items-center gap-0.5 text-xs font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                        <IndianRupee className="w-3 h-3 text-gray-500" />
                        <span>{member.salary.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{member.joiningDate || loc('Joined 2023', 'شمولیت ۲۰۲۳')}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Explicit Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(member);
                        }}
                        className="p-1.5 rounded-xl bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-800 transition-all text-xs flex items-center gap-1 font-bold px-2.5"
                        title={loc('Edit Staff Details', 'ملازم کی تفصیلات میں ترمیم')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{loc('Edit', 'ترمیم')}</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(member, e)}
                        className="p-1.5 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition-colors"
                        title={loc('Remove Staff', 'حذف کریں')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD NEW STAFF ================= */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={loc('Add New Staff Member', 'نیا ملازم شامل کریں')}
        subtitle={loc('Register hostel warden, chef, security, office clerk, or maintenance staff', 'ہاسٹل وارڈن، باورچی، سیکیورٹی، کلرک یا خادم کی تفصیلات درج کریں')}
        maxWidth="2xl"
        footer={
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              {loc('Cancel', 'منسوخ')}
            </button>
            <button
              type="button"
              onClick={handleAddSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-md shadow-emerald-700/20 active:scale-95"
            >
              {loc('Save & Register Staff', 'ملازم کو محفوظ کریں')}
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* Quick Preset Selector */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
            <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
              {loc('⚡ Quick Preset Roles (فوری عہدہ منتخب کریں)', '⚡ فوری عہدہ منتخب کریں')}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {PRESET_ROLES.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRoleSelectAdd(r.en)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    addRole === r.en
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                      : 'bg-white hover:bg-emerald-100/70 text-gray-700 border-gray-200'
                  }`}
                >
                  {isUrdu ? r.ur : r.en}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Staff Name (English) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Staff Name (English) *', 'ملازم کا نام (انگریزی) *')}
              </label>
              <input
                type="text"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Abdul Rasheed"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Staff Name (Urdu) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Staff Name (Urdu Calligraphy)', 'ملازم کا نام (اردو رسم الخط)')}
              </label>
              <input
                type="text"
                value={addNameUrdu}
                onChange={(e) => setAddNameUrdu(e.target.value)}
                placeholder="مثلاً: عبد الرشید صاحب"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white urdu-font text-sm"
              />
            </div>

            {/* Role / Designation */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Role / Designation *', 'عہدہ / ذمہ داری *')}
              </label>
              <input
                type="text"
                required
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                placeholder="e.g. Head Chef (Bawarchi)"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Role (Urdu) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Role in Urdu', 'عہدہ (اردو میں)')}
              </label>
              <input
                type="text"
                value={addRoleUrdu}
                onChange={(e) => setAddRoleUrdu(e.target.value)}
                placeholder="مثلاً: باورچی و ناظم مطبخ"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white urdu-font text-sm"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Department *', 'شعبہ *')}
              </label>
              <select
                value={addDepartment}
                onChange={(e) => {
                  setAddDepartment(e.target.value);
                  const d = DEPARTMENTS.find(dep => dep.id === e.target.value);
                  if (d) setAddDepartmentUrdu(d.ur);
                }}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>
                    {isUrdu ? d.ur : d.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Duty Status', 'حاضری و کیفیت')}
              </label>
              <select
                value={addStatus}
                onChange={(e) => setAddStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer"
              >
                <option value="Active">{loc('Active (حاضر و برسرِ خدمت)', 'حاضر و برسرِ خدمت')}</option>
                <option value="On Leave">{loc('On Leave (رخصت پر)', 'رخصت پر')}</option>
                <option value="Resigned">{loc('Resigned (مستعفی)', 'مستعفی')}</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Contact Phone *', 'رابطہ نمبر (موبائل) *')}
              </label>
              <input
                type="text"
                required
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
                placeholder="+91 98480 00000"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
              />
            </div>

            {/* Monthly Salary */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Monthly Salary (₹)', 'ماہانہ مشاہرہ / تنخواہ (روپیہ)')}
              </label>
              <input
                type="number"
                value={addSalary}
                onChange={(e) => setAddSalary(Number(e.target.value))}
                placeholder="16000"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
              />
            </div>

            {/* Joining Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Joining Date', 'تاریخ شمولیت')}
              </label>
              <input
                type="date"
                value={addJoiningDate}
                onChange={(e) => setAddJoiningDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Email Address (Optional)', 'ای میل پتہ (اختیاری)')}
              </label>
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="staff@jamia.org"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Address / Homeland */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              {loc('Residential Address / Homeland', 'رہائشی پتہ و وطن')}
            </label>
            <input
              type="text"
              value={addAddress}
              onChange={(e) => setAddAddress(e.target.value)}
              placeholder="e.g. Village, District, State..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Notes / Special Responsibilities */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              {loc('Notes & Responsibilities', 'ذمہ داریاں و ضروری نوٹس')}
            </label>
            <textarea
              rows={2}
              value={addNotes}
              onChange={(e) => setAddNotes(e.target.value)}
              placeholder={loc('Key operational responsibilities or emergency notes...', 'خاص ذمہ داریاں یا ضروری ہدایات...')}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: EDIT EXISTING STAFF ================= */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingStaff(null);
        }}
        title={loc(
          `Edit Staff Details: ${editingStaff?.name || ''} (${editingStaff?.staffIdNo || ''})`,
          `ملازم کی تفصیلات میں ترمیم: ${editingStaff?.nameUrdu || editingStaff?.name || ''}`
        )}
        subtitle={loc('Modify department, salary, role, phone or operational status', 'عہدہ، تنخواہ، شعبہ، موبائل نمبر یا کیفیت میں تبدیلی کریں')}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            {/* Delete button */}
            <button
              type="button"
              onClick={() => editingStaff && handleDelete(editingStaff)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{loc('Delete Staff', 'ملازم کو حذف کریں')}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStaff(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                {loc('Cancel', 'منسوخ')}
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-md shadow-emerald-700/20 active:scale-95"
              >
                {loc('Save Changes', 'تبدیلیاں محفوظ کریں')}
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* Quick Preset Selector in Edit */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
            <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
              {loc('⚡ Switch Role Preset (عہدہ تبدیل کریں)', '⚡ عہدہ تبدیل کریں')}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {PRESET_ROLES.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRoleSelectEdit(r.en)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    editRole === r.en
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                      : 'bg-white hover:bg-emerald-100/70 text-gray-700 border-gray-200'
                  }`}
                >
                  {isUrdu ? r.ur : r.en}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Staff Name (English) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Staff Name (English) *', 'ملازم کا نام (انگریزی) *')}
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Staff Name (Urdu) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Staff Name (Urdu Calligraphy)', 'ملازم کا نام (اردو رسم الخط)')}
              </label>
              <input
                type="text"
                value={editNameUrdu}
                onChange={(e) => setEditNameUrdu(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white urdu-font text-sm"
              />
            </div>

            {/* Role / Designation */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Role / Designation *', 'عہدہ / ذمہ داری *')}
              </label>
              <input
                type="text"
                required
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Role in Urdu */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Role in Urdu', 'عہدہ (اردو میں)')}
              </label>
              <input
                type="text"
                value={editRoleUrdu}
                onChange={(e) => setEditRoleUrdu(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white urdu-font text-sm"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Department *', 'شعبہ *')}
              </label>
              <select
                value={editDepartment}
                onChange={(e) => {
                  setEditDepartment(e.target.value);
                  const d = DEPARTMENTS.find(dep => dep.id === e.target.value);
                  if (d) setEditDepartmentUrdu(d.ur);
                }}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>
                    {isUrdu ? d.ur : d.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Duty Status', 'حاضری و کیفیت')}
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer"
              >
                <option value="Active">{loc('Active (حاضر و برسرِ خدمت)', 'حاضر و برسرِ خدمت')}</option>
                <option value="On Leave">{loc('On Leave (رخصت پر)', 'رخصت پر')}</option>
                <option value="Resigned">{loc('Resigned (مستعفی)', 'مستعفی')}</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Contact Phone *', 'رابطہ نمبر (موبائل) *')}
              </label>
              <input
                type="text"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
              />
            </div>

            {/* Monthly Salary */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Monthly Salary (₹)', 'ماہانہ مشاہرہ / تنخواہ (روپیہ)')}
              </label>
              <input
                type="number"
                value={editSalary}
                onChange={(e) => setEditSalary(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
              />
            </div>

            {/* Joining Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Joining Date', 'تاریخ شمولیت')}
              </label>
              <input
                type="date"
                value={editJoiningDate}
                onChange={(e) => setEditJoiningDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {loc('Email Address', 'ای میل پتہ')}
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Address / Homeland */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              {loc('Residential Address / Homeland', 'رہائشی پتہ و وطن')}
            </label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Notes / Responsibilities */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              {loc('Notes & Responsibilities', 'ذمہ داریاں و ضروری نوٹس')}
            </label>
            <textarea
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
