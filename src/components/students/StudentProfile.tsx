import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Student, FeeTransaction, StudentUpdateLog, StudentUpdateChange } from '../../types';
import { parseSabaqProgress, QURAN_PARAHS } from '../../services/quran';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Printer, 
  Calendar, 
  Award, 
  BookOpen, 
  Wallet, 
  UserCheck, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Home,
  Clock,
  Sparkles,
  Building2,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  QrCode,
  Download,
  CalendarCheck,
  History,
  Camera,
  Upload,
  UserPlus,
  Save,
  User,
  Users,
  Eye,
  GraduationCap,
  HeartPulse,
  BadgeCheck,
  ArrowRight,
  Key,
  Lock,
  Check
} from 'lucide-react';
import { PrintDocModal } from '../common/PrintDocModal';
import { Modal } from '../common/Modal';
import { generateDefaultCredentials } from '../../utils/credentialGenerator';
import { compressImage } from '../../utils/imageCompressor';

interface StudentProfileProps {
  student: Student;
  onBackToList: () => void;
  onUpdateStudent: (updated: Student) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  onBackToList,
  onUpdateStudent
}) => {
  const { activeMadrasa } = useAuth();
  const { t, showToast } = useTheme();

  // Active Profile Sub-Tab
  const [activeTab, setActiveTab] = useState<'dossier' | 'roznamchah' | 'attendance' | 'fees' | 'documents' | 'id_card' | 'update_logs'>('dossier');

  // Document Viewer Modals
  const [showCertDocModal, setShowCertDocModal] = useState<boolean>(false);
  const [showAadharDocModal, setShowAadharDocModal] = useState<boolean>(false);

  // Edit Student Modal State (Complete Admission Form)
  const [showEditStudentModal, setShowEditStudentModal] = useState<boolean>(false);
  const [editAdmissionNo, setEditAdmissionNo] = useState<string>(student.admissionNo);
  const [editAdmissionDate, setEditAdmissionDate] = useState<string>(student.admissionDate);
  const [editStudentName, setEditStudentName] = useState<string>(student.studentName);
  const [editStudentNameUrdu, setEditStudentNameUrdu] = useState<string>(student.studentNameUrdu);
  const [editClassName, setEditClassName] = useState<string>(student.class);
  const [editDob, setEditDob] = useState<string>(student.dob || '2015-01-01');
  const [editFatherName, setEditFatherName] = useState<string>(student.fatherName);
  const [editMotherName, setEditMotherName] = useState<string>(student.motherName || '');
  const [editGuardianName, setEditGuardianName] = useState<string>(student.guardianName || '');
  const [editGuardianOccupation, setEditGuardianOccupation] = useState<string>(student.guardianOccupation || '');
  const [editPhone, setEditPhone] = useState<string>(student.contactNumber);
  const [editAadharNumber, setEditAadharNumber] = useState<string>(student.aadharNumber);
  const [editAddress, setEditAddress] = useState<string>(student.address);
  const [editVillage, setEditVillage] = useState<string>(student.village || '');
  const [editCategory, setEditCategory] = useState<'Hostel' | 'Day Scholar'>(student.category);
  const [editSponsorship, setEditSponsorship] = useState<'Self-Sponsored' | 'Discounted' | 'Non-Sponsored' | 'Sponsored by'>(student.sponsorship);
  const [editKafeel, setEditKafeel] = useState<string>(student.kafeelName || '');
  const [editMonthlyFees, setEditMonthlyFees] = useState<number>(student.monthlyFees);
  const [editPreviousSchool, setEditPreviousSchool] = useState<string>(student.previousSchool || '');
  const [editPreviousStudy, setEditPreviousStudy] = useState<string>(student.previousStudy || '');
  const [editPhotoUrl, setEditPhotoUrl] = useState<string>(student.photoUrl);
  const [editCertificateUrl, setEditCertificateUrl] = useState<string>(student.previousStudyCertificateUrl || '');
  const [editAadharCardUrl, setEditAadharCardUrl] = useState<string>(student.aadharCardUrl || '');

  // Student Portal Access Credentials State
  const initialStudentCreds = generateDefaultCredentials(student.studentName, student.admissionDate, student.dob);
  const [studentUsername, setStudentUsername] = useState<string>(student.username || initialStudentCreds.username);
  const [studentPassword, setStudentPassword] = useState<string>(student.password || initialStudentCreds.password);

  const [editUsername, setEditUsername] = useState<string>(student.username || initialStudentCreds.username);
  const [editPassword, setEditPassword] = useState<string>(student.password || initialStudentCreds.password);

  useEffect(() => {
    const creds = generateDefaultCredentials(student.studentName, student.admissionDate, student.dob);
    setStudentUsername(student.username || creds.username);
    setStudentPassword(student.password || creds.password);
  }, [student.id, student.username, student.password, student.studentName, student.admissionDate, student.dob]);

  const handleAutoGenerateStudentCreds = () => {
    const creds = generateDefaultCredentials(student.studentName, student.admissionDate, student.dob);
    setStudentUsername(creds.username);
    setStudentPassword(creds.password);
    showToast(`Default credentials generated: ${creds.username} / ${creds.password}`, 'info');
  };

  const handleSaveStudentCreds = () => {
    if (!studentUsername.trim() || !studentPassword.trim()) {
      showToast('Username and Password cannot be empty', 'error');
      return;
    }
    const updated: Student = {
      ...student,
      username: studentUsername.trim(),
      password: studentPassword.trim()
    };
    db.updateStudent(updated);
    setStudentUsername(updated.username!);
    setStudentPassword(updated.password!);
    onUpdateStudent(updated);
    showToast(`Login credentials for ${updated.studentName} updated & saved permanently!`, 'success');
  };

  // Student Update Logs
  const [studentLogs, setStudentLogs] = useState<StudentUpdateLog[]>(() => db.getStudentLogs(student.id));

  useEffect(() => {
    setStudentLogs(db.getStudentLogs(student.id));
  }, [student.id]);

  // Open Edit Modal with Fresh Values
  const openEditModal = () => {
    setEditAdmissionNo(student.admissionNo);
    setEditAdmissionDate(student.admissionDate);
    setEditStudentName(student.studentName);
    setEditStudentNameUrdu(student.studentNameUrdu);
    setEditClassName(student.class);
    setEditDob(student.dob || '2015-01-01');
    setEditFatherName(student.fatherName);
    setEditMotherName(student.motherName || '');
    setEditGuardianName(student.guardianName || '');
    setEditGuardianOccupation(student.guardianOccupation || '');
    setEditPhone(student.contactNumber);
    setEditAadharNumber(student.aadharNumber);
    setEditAddress(student.address);
    setEditVillage(student.village || '');
    setEditCategory(student.category);
    setEditSponsorship(student.sponsorship);
    setEditKafeel(student.kafeelName || '');
    setEditMonthlyFees(student.monthlyFees);
    setEditPreviousSchool(student.previousSchool || '');
    setEditPreviousStudy(student.previousStudy || '');
    setEditPhotoUrl(student.photoUrl);
    setEditCertificateUrl(student.previousStudyCertificateUrl || '');
    setEditAadharCardUrl(student.aadharCardUrl || '');
    const creds = generateDefaultCredentials(student.studentName, student.admissionDate, student.dob);
    setEditUsername(student.username || creds.username);
    setEditPassword(student.password || creds.password);
    setShowEditStudentModal(true);
  };

  // Upload Handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 500, 0.75);
        setEditPhotoUrl(compressed);
        showToast('Student photo optimized and updated for preview!', 'success');
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditPhotoUrl(reader.result as string);
          showToast('Student photo updated for preview!', 'info');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.75);
        setEditCertificateUrl(compressed);
        showToast('Previous Study Certificate attached!', 'info');
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditCertificateUrl(reader.result as string);
          showToast('Previous Study Certificate attached!', 'info');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAadharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.75);
        setEditAadharCardUrl(compressed);
        showToast('Aadhar card image attached!', 'info');
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditAadharCardUrl(reader.result as string);
          showToast('Aadhar card image attached!', 'info');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Quick Action Modals
  const [showSelectClassModal, setShowSelectClassModal] = useState<boolean>(false);
  const [selectedClassVal, setSelectedClassVal] = useState<string>(student.class);

  const [showCollectFeeModal, setShowCollectFeeModal] = useState<boolean>(false);
  const [feeAmount, setFeeAmount] = useState<number>(student.monthlyFees);
  const [feeMonth, setFeeMonth] = useState<string>('September 2026');
  const [feeMode, setFeeMode] = useState<'Cash' | 'Online' | 'Bank Transfer'>('Cash');
  const [lastReceipt, setLastReceipt] = useState<FeeTransaction | null>(null);

  const [showExamReportModal, setShowExamReportModal] = useState<boolean>(false);
  const [showTeacherReportsModal, setShowTeacherReportsModal] = useState<boolean>(false);

  // Roznamchah Full Month Matrix State
  const [roznamchahMonth, setRoznamchahMonth] = useState<number>(8); // September
  const isHifzStudent = student.class.toLowerCase().includes('hifz');
  const [roznamchahYear, setRoznamchahYear] = useState<number>(2026);
  const [showLogSabaqModal, setShowLogSabaqModal] = useState<boolean>(false);
  const [logDayNum, setLogDayNum] = useState<number>(4);

  // Hifz Specific State
  const [logSabaqQuantity, setLogSabaqQuantity] = useState<string>('۱ صفحہ (1 Page)');
  const [logSabaqPara, setLogSabaqPara] = useState<string>(student.presentSabaqAt || 'پارہ ۱۴');
  const [logSabaqMistakes, setLogSabaqMistakes] = useState<number>(0);
  const [logSabaqListener, setLogSabaqListener] = useState<string>('قاری بلال احمد');

  // Nazira & Common Fields
  const [logSabaq, setLogSabaq] = useState<string>(student.presentSabaqAt || 'تختی نمبر ۶: تنوین');
  const [logAmookhtaQuantity, setLogAmookhtaQuantity] = useState<string>('نصف پارہ (1/2 Para)');
  const [logAmookhtaMistakes, setLogAmookhtaMistakes] = useState<number>(1);
  const [logAmookhtaListener, setLogAmookhtaListener] = useState<string>('مولانا فاروق');
  const [logKaifiyat, setLogKaifiyat] = useState<string>('ممتاز - روانی و تجوید درست ہے');
  const [logGrade, setLogGrade] = useState<'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbool' | 'Daeef'>('Mumtaz');
  const [logRemarks, setLogRemarks] = useState<string>('Fluent recitation with accurate Tajweed rules');

  const [customRoznamchahEntries, setCustomRoznamchahEntries] = useState<Record<number, {
    sabaqQuantity?: string;
    sabaqPara?: string;
    sabaqMistakes?: number;
    sabaqListener?: string;
    sabaq?: string;
    amookhtaQuantity?: string;
    amookhtaMistakes?: number;
    amookhtaListener?: string;
    kaifiyat?: string;
    grade: string;
    remarks: string;
    status: 'Present' | 'Absent' | 'Leave' | 'Off';
  }>>({});

  // Quran Progress calculation
  const quranProgress = parseSabaqProgress(student.presentSabaqAt);

  // View Certificate Click Handler
  const handleViewCertificate = () => {
    if (!student.previousStudyCertificateUrl) {
      showToast('There is No Certificate Uploaded', 'warning');
      return;
    }
    setShowCertDocModal(true);
  };

  // View Aadhar Card Click Handler
  const handleViewAadharCard = () => {
    if (!student.aadharCardUrl) {
      showToast('There is No Certificate Uploaded', 'warning');
      return;
    }
    setShowAadharDocModal(true);
  };

  // Save Class Change
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...student, class: selectedClassVal };
    db.updateStudent(updated);
    onUpdateStudent(updated);
    showToast(`Student class updated to ${selectedClassVal}!`, 'success');
    setShowSelectClassModal(false);
  };

  // Save Edit Student with Complete Audit Logging
  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentName.trim()) return;

    const cleanAdmNo = editAdmissionNo.trim();
    if (!cleanAdmNo) {
      showToast('Admission Number cannot be empty.', 'error');
      return;
    }

    // Ensure admission number is unique if modified
    if (cleanAdmNo.toLowerCase() !== student.admissionNo.toLowerCase()) {
      const check = await db.checkAdmissionNoAvailable(cleanAdmNo, student.id, student.madrasaId);
      if (!check.available) {
        showToast(
          `Admission Number "${cleanAdmNo}" is already taken${check.existingStudentName ? ` by ${check.existingStudentName}` : ''}! Please specify a unique Admission Number.`,
          'error'
        );
        return;
      }
    }

    // Detect all modified fields for audit log
    const changes: StudentUpdateChange[] = [];

    if (editStudentName.trim() !== student.studentName) {
      changes.push({ field: 'studentName', label: 'Student Name (English)', labelUrdu: 'طالب علم کا نام (انگریزی)', oldValue: student.studentName, newValue: editStudentName.trim() });
    }
    if (editStudentNameUrdu.trim() !== student.studentNameUrdu) {
      changes.push({ field: 'studentNameUrdu', label: 'Student Name (Urdu)', labelUrdu: 'طالب علم کا نام (اردو)', oldValue: student.studentNameUrdu, newValue: editStudentNameUrdu.trim() });
    }
    if (cleanAdmNo !== student.admissionNo) {
      changes.push({ field: 'admissionNo', label: 'Admission Number', labelUrdu: 'داخلہ نمبر', oldValue: student.admissionNo, newValue: cleanAdmNo });
    }
    if (editAdmissionDate !== student.admissionDate) {
      changes.push({ field: 'admissionDate', label: 'Admission Date', labelUrdu: 'تاریخِ داخلہ', oldValue: student.admissionDate, newValue: editAdmissionDate });
    }
    if (editClassName !== student.class) {
      changes.push({ field: 'class', label: 'Class / Department', labelUrdu: 'شعبہ / درجہ', oldValue: student.class, newValue: editClassName });
    }
    if (editDob !== (student.dob || '2015-01-01')) {
      changes.push({ field: 'dob', label: 'Date of Birth', labelUrdu: 'تاریخِ پیدائش', oldValue: student.dob || '2015-01-01', newValue: editDob });
    }
    if (editFatherName.trim() !== student.fatherName) {
      changes.push({ field: 'fatherName', label: 'Father Name', labelUrdu: 'والد کا نام', oldValue: student.fatherName, newValue: editFatherName.trim() });
    }
    if (editMotherName.trim() !== (student.motherName || '')) {
      changes.push({ field: 'motherName', label: 'Mother Name', labelUrdu: 'والدہ کا نام', oldValue: student.motherName || 'N/A', newValue: editMotherName.trim() || 'N/A' });
    }
    if (editGuardianName.trim() !== (student.guardianName || '')) {
      changes.push({ field: 'guardianName', label: 'Guardian Name', labelUrdu: 'سرپرست کا نام', oldValue: student.guardianName || 'N/A', newValue: editGuardianName.trim() || 'N/A' });
    }
    if (editGuardianOccupation.trim() !== (student.guardianOccupation || '')) {
      changes.push({ field: 'guardianOccupation', label: 'Guardian Occupation', labelUrdu: 'پیشہ سرپرست', oldValue: student.guardianOccupation || 'N/A', newValue: editGuardianOccupation.trim() || 'N/A' });
    }
    if (editPhone.trim() !== student.contactNumber) {
      changes.push({ field: 'contactNumber', label: 'Contact Phone', labelUrdu: 'رابطہ فون نمبر', oldValue: student.contactNumber, newValue: editPhone.trim() });
    }
    if (editAadharNumber.trim() !== student.aadharNumber) {
      changes.push({ field: 'aadharNumber', label: 'Aadhar Number', labelUrdu: 'آدھار نمبر', oldValue: student.aadharNumber, newValue: editAadharNumber.trim() });
    }
    if (editAddress.trim() !== student.address) {
      changes.push({ field: 'address', label: 'Residential Address', labelUrdu: 'رہائشی پتہ', oldValue: student.address, newValue: editAddress.trim() });
    }
    if (editVillage.trim() !== (student.village || '')) {
      changes.push({ field: 'village', label: 'Homeland / Village', labelUrdu: 'وطن / گاؤں', oldValue: student.village || 'N/A', newValue: editVillage.trim() || 'N/A' });
    }
    if (editCategory !== student.category) {
      changes.push({ field: 'category', label: 'Accommodation Category', labelUrdu: 'شعبہ اقامتی / غیر اقامتی', oldValue: student.category, newValue: editCategory });
    }
    if (editSponsorship !== student.sponsorship) {
      changes.push({ field: 'sponsorship', label: 'Sponsorship Category', labelUrdu: 'کفالت کی قسم', oldValue: student.sponsorship, newValue: editSponsorship });
    }
    if (editKafeel.trim() !== (student.kafeelName || '')) {
      changes.push({ field: 'kafeelName', label: 'Kafeel Name', labelUrdu: 'نام کفیل', oldValue: student.kafeelName || 'None', newValue: editKafeel.trim() || 'None' });
    }
    if (Number(editMonthlyFees) !== student.monthlyFees) {
      changes.push({ field: 'monthlyFees', label: 'Monthly Fees', labelUrdu: 'ماہانہ فیس', oldValue: `₹${student.monthlyFees}`, newValue: `₹${editMonthlyFees}` });
    }
    if (editPreviousSchool.trim() !== (student.previousSchool || '')) {
      changes.push({ field: 'previousSchool', label: 'Previous School', labelUrdu: 'سابقہ مدرسہ / اسکول', oldValue: student.previousSchool || 'None', newValue: editPreviousSchool.trim() || 'None' });
    }
    if (editPreviousStudy.trim() !== (student.previousStudy || '')) {
      changes.push({ field: 'previousStudy', label: 'Previous Study Status', labelUrdu: 'سابقہ تعلیم', oldValue: student.previousStudy || 'None', newValue: editPreviousStudy.trim() || 'None' });
    }
    if (editPhotoUrl !== student.photoUrl) {
      changes.push({ field: 'photoUrl', label: 'Profile Photo', labelUrdu: 'تصویر طالب علم', oldValue: 'Previous Image', newValue: 'Updated Image' });
    }
    if (editCertificateUrl !== (student.previousStudyCertificateUrl || '')) {
      changes.push({ field: 'certificateUrl', label: 'Previous Certificate', labelUrdu: 'سابقہ تعلیمی سند', oldValue: student.previousStudyCertificateUrl ? 'Attached' : 'None', newValue: editCertificateUrl ? 'Attached' : 'None' });
    }
    if (editAadharCardUrl !== (student.aadharCardUrl || '')) {
      changes.push({ field: 'aadharCardUrl', label: 'Aadhar Card Scan', labelUrdu: 'آدھار کارڈ دستاویز', oldValue: student.aadharCardUrl ? 'Attached' : 'None', newValue: editAadharCardUrl ? 'Attached' : 'None' });
    }

    const updated: Student = {
      ...student,
      admissionNo: editAdmissionNo.trim(),
      admissionDate: editAdmissionDate,
      studentName: editStudentName.trim(),
      studentNameUrdu: editStudentNameUrdu.trim() || editStudentName.trim(),
      fatherName: editFatherName.trim(),
      motherName: editMotherName.trim() || 'N/A',
      guardianName: editGuardianName.trim() || editFatherName.trim(),
      guardianOccupation: editGuardianOccupation.trim() || 'Private',
      contactNumber: editPhone.trim(),
      address: editAddress.trim(),
      village: editVillage.trim() || undefined,
      category: editCategory,
      sponsorship: editSponsorship,
      kafeelName: editKafeel.trim() || undefined,
      monthlyFees: Number(editMonthlyFees),
      class: editClassName,
      dob: editDob,
      previousSchool: editPreviousSchool.trim() || 'None',
      previousStudy: editPreviousStudy.trim() || 'None',
      photoUrl: editPhotoUrl,
      previousStudyCertificateUrl: editCertificateUrl || undefined,
      aadharCardUrl: editAadharCardUrl || undefined,
      aadharNumber: editAadharNumber.trim(),
      username: editUsername.trim(),
      password: editPassword.trim()
    };

    db.updateStudent(updated);
    setStudentUsername(editUsername.trim());
    setStudentPassword(editPassword.trim());
    onUpdateStudent(updated);

    if (changes.length > 0) {
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const updatedBy = activeMadrasa?.principalName 
        ? `${activeMadrasa.principalName} (Principal / Admin)` 
        : 'Admin Office (Super Admin / Principal)';

      const newLog = db.addStudentLog({
        studentId: student.id,
        studentName: updated.studentName,
        madrasaId: activeMadrasa?.id || student.madrasaId,
        updatedAt: formattedDate,
        updatedBy,
        changes
      });

      setStudentLogs(prev => [newLog, ...prev]);
      showToast(`Student profile updated! ${changes.length} field change(s) recorded in audit logs.`, 'success');
    } else {
      showToast('No modifications detected in profile.', 'info');
    }

    onUpdateStudent(updated);
    setShowEditStudentModal(false);
  };

  // Save Roznamchah Sabaq Entry for a Day
  const handleSaveLogSabaq = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomRoznamchahEntries(prev => ({
      ...prev,
      [logDayNum]: {
        sabaqQuantity: logSabaqQuantity,
        sabaqPara: logSabaqPara,
        sabaqMistakes: Number(logSabaqMistakes),
        sabaqListener: logSabaqListener,
        sabaq: isHifzStudent ? `${logSabaqPara} (${logSabaqQuantity})` : logSabaq,
        amookhtaQuantity: logAmookhtaQuantity,
        amookhtaMistakes: Number(logAmookhtaMistakes),
        amookhtaListener: logAmookhtaListener,
        kaifiyat: logKaifiyat,
        grade: logGrade,
        remarks: logRemarks,
        status: 'Present'
      }
    }));
    const newMilestone = isHifzStudent ? `${logSabaqPara} (${logSabaqQuantity})` : logSabaq;
    const updated = { ...student, presentSabaqAt: newMilestone };
    db.updateStudent(updated);
    onUpdateStudent(updated);
    showToast(`Roznamchah record for Day ${logDayNum} saved successfully!`, 'success');
    setShowLogSabaqModal(false);
  };

  // Handle Collect Fee
  const handleCollectFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMadrasa) return;

    const receipt = db.collectFee({
      studentId: student.id,
      studentName: student.studentName,
      madrasaId: activeMadrasa.id,
      month: feeMonth,
      amount: Number(feeAmount),
      date: new Date().toISOString().split('T')[0],
      mode: feeMode,
      status: 'Paid'
    });

    setLastReceipt(receipt);
    showToast(`Fee receipt #${receipt.receiptNo} generated for ${student.studentName}!`, 'success');
  };

  const studentFeeHistory = db.getFees(activeMadrasa?.id).filter(f => f.studentId === student.id);

  return (
    <div className="space-y-5 animate-in fade-in duration-300 select-none">
      {/* Top Breadcrumbs & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(18,59,99,0.05)]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white border border-white/90 text-slate-700 shadow-2xs transition-colors"
            title="Back to All Students"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
            <button onClick={onBackToList} className="flex items-center gap-1 hover:text-[#079669] transition-colors">
              <Home className="w-3.5 h-3.5" />
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <button onClick={onBackToList} className="hover:text-[#079669] transition-colors">
              Students
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <button onClick={onBackToList} className="hover:text-[#079669] transition-colors">
              All Students
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-800">
              Student Profile
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openEditModal}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 hover:bg-white border border-white/90 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#079669]" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 hover:bg-white border border-white/90 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-[#079669]" />
            <span>Print Dossier</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCollectFeeModal(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#079669] hover:bg-[#057A57] text-white text-xs font-bold shadow-[0_4px_14px_rgba(7,150,105,0.3)] transition-all active:scale-95"
          >
            <span>Collect Fee &gt;</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Overview Card with Islamic Minaret Watermark */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-2xl p-6 border border-white/80 shadow-[0_8px_32px_0_rgba(18,59,99,0.06)] relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Subtle Islamic Mosque Silhouette Watermark */}
        <div className="absolute right-40 bottom-0 h-48 w-80 pointer-events-none opacity-25 select-none overflow-hidden hidden xl:block">
          <svg viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-800">
            <path d="M150 20 C145 35, 130 50, 110 55 L110 150 L190 150 L190 55 C170 50, 155 35, 150 20 Z" fill="currentColor"/>
            <path d="M150 5 L150 20 M146 12 L154 12" stroke="currentColor" strokeWidth="2"/>
            <path d="M60 60 C55 70, 45 80, 35 85 L35 150 L85 150 L85 85 C75 80, 65 70, 60 60 Z" fill="currentColor"/>
            <path d="M240 60 C235 70, 225 80, 215 85 L215 150 L265 150 L265 85 C255 80, 245 70, 240 60 Z" fill="currentColor"/>
            <rect x="15" y="40" width="8" height="110" fill="currentColor"/>
            <polygon points="19,25 15,40 23,40" fill="currentColor"/>
            <rect x="277" y="40" width="8" height="110" fill="currentColor"/>
            <polygon points="281,25 277,40 285,40" fill="currentColor"/>
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          {/* Avatar with Camera Icon Overlay */}
          <div className="relative group shrink-0">
            <img
              src={student.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"}
              alt={student.studentName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-500/80 shadow-md"
            />
            <button 
              type="button"
              onClick={openEditModal}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-[#079669] hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-all active:scale-90"
              title="Update Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {/* Top Admission Badge & Date */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#079669] bg-emerald-50 border border-emerald-300/70 px-3 py-0.5 rounded-full shadow-2xs">
                {student.admissionNo}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Admission Date: {student.admissionDate}
              </span>
            </div>

            {/* Names */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {student.studentName}
              </h1>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-3 py-0.5 rounded-full bg-[#079669] text-white font-bold shadow-2xs">
                {student.class}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200/80 shadow-2xs">
                {student.category}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200/80 shadow-2xs">
                {student.sponsorship}
              </span>
            </div>

            {/* 6 Mini Attribute Chips in a single row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/70 border border-white/80 text-slate-700 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-[#079669]" />
                <span>Age <strong className="text-slate-900">14 Years</strong></span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/70 border border-white/80 text-slate-700 shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
                <span>Class <strong className="text-slate-900">{student.class}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/70 border border-white/80 text-slate-700 shadow-2xs font-mono">
                <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Roll No <strong className="text-slate-900">{student.admissionNo ? student.admissionNo.replace('ADM-2026-', 'HZ-') : 'HZ-001'}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/70 border border-white/80 text-slate-700 shadow-2xs">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <span>Blood Group <strong className="text-slate-900">B+</strong></span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/70 border border-white/80 text-slate-700 shadow-2xs font-mono">
                <Phone className="w-3.5 h-3.5 text-[#079669]" />
                <span>Contact <strong className="text-slate-900">{student.contactNumber}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/70 border border-white/80 text-slate-700 shadow-2xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status <strong className="text-emerald-700">Active</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quran Hifz Progress Card */}
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-2xs space-y-2 min-w-[280px] w-full lg:w-auto relative z-10">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Quran Hifz Progress</span>
            <span className="font-black text-slate-800 font-mono text-xs">{quranProgress.percentage}%</span>
          </div>

          <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
            <div 
              style={{ width: `${quranProgress.percentage}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            />
          </div>

          <p className="text-[11px] text-slate-600 leading-snug">
            At: <strong className="text-slate-900">{student.presentSabaqAt || 'Para 14 (Surah Al-Hijr, Ruku 2)'}</strong>
          </p>
          <p className="text-[10px] text-slate-400">
            ({quranProgress.completedParas || 14} of 30 Paras)
          </p>
        </div>
      </div>

      {/* Profile Tab Navigation Bar */}
      <div className="flex flex-wrap gap-2 pb-1 no-print">
        <button
          type="button"
          onClick={() => setActiveTab('dossier')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'dossier'
              ? 'bg-[#079669] text-white shadow-md'
              : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dossier &amp; Bio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roznamchah')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'roznamchah'
              ? 'bg-[#079669] text-white shadow-md'
              : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Roznamcha &amp; Sabaq</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'attendance'
              ? 'bg-[#079669] text-white shadow-md'
              : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Attendance Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'fees'
              ? 'bg-[#079669] text-white shadow-md'
              : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Fees Ledger ({studentFeeHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setShowExamReportModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white/70 text-slate-700 hover:bg-white border border-white/80 shadow-2xs"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Examinations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'documents'
              ? 'bg-[#079669] text-white shadow-md'
              : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('id_card')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'id_card'
              ? 'bg-[#079669] text-white shadow-md'
              : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Student ID Card</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('update_logs')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'update_logs'
              ? 'bg-[#079669] text-white shadow-md'
              : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Update Logs (تاریخچہ ترامیم) ({studentLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Dossier & Bio */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          {/* Details 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Family & Guardian Record */}
            <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(18,59,99,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#079669]" />
                  <span>Family &amp; Guardian Record</span>
                </h3>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/80 hover:bg-white border border-white/90 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-[#079669]" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Father Name
                  </span>
                  <strong className="text-slate-900">{student.fatherName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Mother Name
                  </span>
                  <strong className="text-slate-900">{student.motherName || 'Amina Begum'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Guardian Name
                  </span>
                  <strong className="text-slate-900">{student.guardianName || student.fatherName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Guardian Occupation
                  </span>
                  <strong className="text-slate-900">{student.guardianOccupation || 'Business Owner'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60 items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Contact Number
                  </span>
                  <div className="flex items-center gap-1.5 text-[#079669] font-mono font-bold">
                    <Phone className="w-3 h-3 text-[#079669]" />
                    <span>{student.contactNumber}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Aadhar Number
                  </span>
                  <strong className="text-slate-900 font-mono">{student.aadharNumber || '7845 9012 3456'}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-slate-400" />
                    Residential Address
                  </span>
                  <span className="text-slate-900 font-medium text-right max-w-xs">{student.address || 'H.No 12-2-417, Asif Nagar, Hyderabad'}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Academic & Sponsorship Record */}
            <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(18,59,99,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#079669]" />
                  <span>Academic &amp; Sponsorship Record</span>
                </h3>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/80 hover:bg-white border border-white/90 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-[#079669]" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-slate-400" />
                    Accommodation
                  </span>
                  <strong className="text-slate-900">{student.category}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    Sponsorship
                  </span>
                  <strong className="text-slate-900">{student.sponsorship}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    Kafeel Name
                  </span>
                  <strong className="text-slate-900">{student.kafeelName || 'Self (Tariq Khan)'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-slate-400" />
                    Monthly Fees
                  </span>
                  <strong className="text-[#079669] font-mono font-bold">₹ {student.monthlyFees.toLocaleString()} / Month</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Previous Madrasa / School
                  </span>
                  <span className="text-slate-900 font-medium text-right max-w-xs">{student.previousSchool || 'Modern Islamic High School, Hyderabad'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    Previous Study
                  </span>
                  <strong className="text-slate-900">{student.previousStudy || 'Passed 4th Standard & Completed Noorani Qaidah'}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    Special Notes
                  </span>
                  <span className="text-slate-700 font-medium italic">Disciplined and regular in classes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Portal Login Credentials (Admin Controlled) */}
          <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(18,59,99,0.05)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Student &amp; Guardian Portal Access Credentials (لاگ ان معلومات برائے طالب علم)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Admin / Principal can review, generate, and update student &amp; guardian login details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoGenerateStudentCreds}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/90 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                title="Generate using First 4 Letters + Admission Year & DOB Year"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                <span>Auto-Generate Default</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portal Username (لاگ ان نام) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentUsername}
                    onChange={(e) => setStudentUsername(e.target.value)}
                    placeholder="e.g. Moha-2026"
                    className="w-full p-2.5 pr-8 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Formula: First 4 Letters - Admission Year (e.g. Abdu-2026)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portal Password (پاس ورڈ) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="e.g. Moha@2014"
                    className="w-full p-2.5 pr-8 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Formula: First 4 Letters @ DOB Year (e.g. Abdu@2014)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Student or guardian logs in with this Username and Password (or Admission No &amp; DOB).
              </span>
              <button
                type="button"
                onClick={handleSaveStudentCreds}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>

          {/* Bottom 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Important Documents */}
            <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(18,59,99,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#079669]" />
                  <span>Important Documents</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Aadhar Card */}
                <div 
                  onClick={handleViewAadharCard}
                  className="p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs mb-1.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 truncate w-full">Aadhar Card</h5>
                  <span className="text-[10px] text-slate-400 font-mono">PDF • 450 KB</span>
                </div>

                {/* Birth Certificate */}
                <div 
                  onClick={handleViewCertificate}
                  className="p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs mb-1.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 truncate w-full">Birth Certificate</h5>
                  <span className="text-[10px] text-slate-400 font-mono">PDF • 320 KB</span>
                </div>

                {/* Previous School */}
                <div 
                  onClick={handleViewCertificate}
                  className="p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs mb-1.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 truncate w-full">Previous School</h5>
                  <span className="text-[10px] text-slate-400 font-mono">PDF • 680 KB</span>
                </div>

                {/* Photograph */}
                <div 
                  onClick={openEditModal}
                  className="p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs mb-1.5">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 truncate w-full">Photograph</h5>
                  <span className="text-[10px] text-slate-400 font-mono">JPG • 120 KB</span>
                </div>
              </div>
            </div>

            {/* Card 2: Quick Actions */}
            <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(18,59,99,0.05)] space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#079669]" />
                  <span>Quick Actions</span>
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Mark Attendance */}
                <button
                  type="button"
                  onClick={() => setActiveTab('attendance')}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950">Mark Attendance</span>
                </button>

                {/* 2. View Exam Reports */}
                <button
                  type="button"
                  onClick={() => setShowExamReportModal(true)}
                  className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
                >
                  <Award className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-blue-950">View Exam Reports</span>
                </button>

                {/* 3. Open Roznamcha */}
                <button
                  type="button"
                  onClick={() => setActiveTab('roznamchah')}
                  className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold text-purple-950">Open Roznamcha</span>
                </button>

                {/* 4. Collect Fee */}
                <button
                  type="button"
                  onClick={() => setShowCollectFeeModal(true)}
                  className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
                >
                  <Wallet className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-950">Collect Fee</span>
                </button>
              </div>
            </div>

            {/* Card 3: Recent Activities */}
            <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(18,59,99,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#079669]" />
                  <span>Recent Activities</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('roznamchah')}
                  className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between text-xs py-0.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-100" />
                    <div>
                      <h5 className="font-bold text-slate-900">Fee collected</h5>
                      <span className="text-[11px] text-slate-500">₹ 2,500 (Receipt No: F-2026-0156)</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 text-right leading-tight font-mono">5 Sept 2026<br/>10:24 AM</span>
                </div>

                <div className="flex items-start justify-between text-xs py-0.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0 ring-4 ring-blue-100" />
                    <div>
                      <h5 className="font-bold text-slate-900">Attendance marked</h5>
                      <span className="text-[11px] text-slate-500">Present - Hifz Section A</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 text-right leading-tight font-mono">4 Sept 2026<br/>09:10 AM</span>
                </div>

                <div className="flex items-start justify-between text-xs py-0.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-1 shrink-0 ring-4 ring-purple-100" />
                    <div>
                      <h5 className="font-bold text-slate-900">Sabaq updated</h5>
                      <span className="text-[11px] text-slate-500">Para 14 - Surah Al-Hijr (Ruku 2)</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 text-right leading-tight font-mono">3 Sept 2026<br/>02:30 PM</span>
                </div>

                <div className="flex items-start justify-between text-xs py-0.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0 ring-4 ring-amber-100" />
                    <div>
                      <h5 className="font-bold text-slate-900">Document uploaded</h5>
                      <span className="text-[11px] text-slate-500">Aadhar Card</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 text-right leading-tight font-mono">1 Sept 2026<br/>11:45 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Full Month Matrix Roznamchah */}
      {activeTab === 'roznamchah' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-5">
          {/* Header & Month Navigator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-m3-outline-variant/20 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Full Month Roznamchah Matrix &bull; ماہانہ روزنامچہ کارگزاری
                </span>
                <span className="text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  تعلیمی سال: رمضان تا رمضان (Ramzan to Ramzan)
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-m3-primary" />
                <span>Daily Sabaq, Sabqi & Manzil Full-Month Register</span>
              </h3>
              <p className="text-xs text-gray-500">
                Continuous daily lesson evaluation recorded by assigned Ustadh for {student.studentName}
              </p>
            </div>

            <div className="flex items-center gap-2 no-print">
              <div className="flex items-center gap-1 bg-gray-50 border rounded-2xl px-3 py-1">
                <button
                  type="button"
                  onClick={() => setRoznamchahMonth(prev => prev > 0 ? prev - 1 : 11)}
                  className="p-1 hover:bg-gray-200 rounded-lg text-gray-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-gray-800 px-2 font-mono">
                  September {roznamchahYear}
                </span>
                <button
                  type="button"
                  onClick={() => setRoznamchahMonth(prev => prev < 11 ? prev + 1 : 0)}
                  className="p-1 hover:bg-gray-200 rounded-lg text-gray-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLogDayNum(4);
                  setShowLogSabaqModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-m3-primary text-white text-xs font-bold shadow-xs hover:bg-opacity-90"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Sabaq</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800"
              >
                <Printer className="w-3.5 h-3.5 text-m3-primary" />
                <span>Print Roznamchah</span>
              </button>
            </div>
          </div>

          {/* Monthly & Ramzan-to-Ramzan Cumulative Counters Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">ایامِ درس (ماہانہ)</span>
              <span className="text-xl font-black text-emerald-950 font-mono">26 Days</span>
              <span className="text-[10px] text-emerald-700 block">Work Days</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">ایامِ حاضری (ماہانہ)</span>
              <span className="text-xl font-black text-emerald-900 font-mono">{student.totalPresentsMonthly} Days</span>
              <span className="text-[10px] text-emerald-700 block">Monthly Present</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
              <span className="text-[10px] text-amber-900 font-bold uppercase block">ایامِ درس (رمضان تا رمضان)</span>
              <span className="text-xl font-black text-amber-950 font-mono">144 Days</span>
              <span className="text-[10px] text-amber-800 block">Hijri Academic Total</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
              <span className="text-[10px] text-amber-900 font-bold uppercase block">ایامِ حاضری (رمضان تا رمضان)</span>
              <span className="text-xl font-black text-emerald-900 font-mono">{student.totalPresentsYearly} Days</span>
              <span className="text-[10px] text-amber-800 block">Hijri Present Count</span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-center">
              <span className="text-[10px] text-teal-800 font-bold uppercase block">سالانہ فیصد حاضری</span>
              <span className="text-xl font-black text-teal-950 font-mono">
                {Math.round(((student.totalPresentsYearly || 138) / 144) * 100)}%
              </span>
              <span className="text-[10px] text-teal-700 block">Yearly Ratio</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-center">
              <span className="text-[10px] text-purple-800 font-bold uppercase block">حفظ پیش رفت</span>
              <span className="text-xl font-black text-purple-950 font-mono">{quranProgress.percentage}%</span>
              <span className="text-[10px] text-purple-700 block">14 of 30 Paras</span>
            </div>
          </div>

          {/* Roznamchah Full Month 30-Day Matrix Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-emerald-950 text-white font-bold text-[11px]">
                  {isHifzStudent ? (
                    <tr>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800">تاریخ و دن</th>
                      <th className="p-2.5 w-16 text-center border-r border-emerald-800">حاضری</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">مقدار سبق</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">پارہ سبق</th>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800 font-urdu">اغلاط</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">سامع پارہ سبق</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">مقدارِ آموختہ</th>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800 font-urdu">اغلاط</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">سامع آموختہ</th>
                      <th className="p-2.5 w-20 text-center border-r border-emerald-800">معیار / درجہ</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">کیفیت و ریمارکس</th>
                      <th className="p-2.5 w-14 text-center no-print">عمل</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800">تاریخ و دن</th>
                      <th className="p-2.5 w-16 text-center border-r border-emerald-800">حاضری</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">سبق</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">مقدارِ آموختہ</th>
                      <th className="p-2.5 w-14 text-center border-r border-emerald-800 font-urdu">اغلاط</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">سامع آموختہ</th>
                      <th className="p-2.5 w-20 text-center border-r border-emerald-800">معیار / درجہ</th>
                      <th className="p-2.5 border-r border-emerald-800 font-urdu">کیفیت و ریمارکس</th>
                      <th className="p-2.5 w-14 text-center no-print">عمل</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1;
                    const dateObj = new Date(roznamchahYear, roznamchahMonth, day);
                    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const isFriday = dateObj.getDay() === 5;
                    const custom = customRoznamchahEntries[day];

                    const isToday = day === 4;
                    const isAbsent = day === 15 || day === 22;
                    const isLeave = day === 8;

                    // Hifz Fields
                    const sabaqQuantity = custom?.sabaqQuantity || (isFriday ? '-' : '۱ صفحہ (1 Page)');
                    const sabaqPara = custom?.sabaqPara || (isFriday ? 'تعطیل جمعہ المبارک' : day === 4 ? student.presentSabaqAt : `پارہ ${Math.min(30, 13 + Math.floor(day / 7))}`);
                    const sabaqMistakes = custom?.sabaqMistakes ?? (isFriday ? '-' : (day % 3 === 0 ? 1 : 0));
                    const sabaqListener = custom?.sabaqListener || (isFriday ? '-' : 'قاری بلال احمد');
                    const amookhtaQuantity = custom?.amookhtaQuantity || (isFriday ? '-' : 'نصف پارہ (1/2 Para)');
                    const amookhtaMistakes = custom?.amookhtaMistakes ?? (isFriday ? '-' : (day % 2 === 0 ? 1 : 2));
                    const amookhtaListener = custom?.amookhtaListener || (isFriday ? '-' : 'مولانا فاروق');

                    // Nazira Fields
                    const sabaq = custom?.sabaq || (isFriday ? 'تعطیل جمعہ' : `تختی نمبر ${(day % 8) + 1}`);

                    const grade = custom?.grade || (isFriday ? '-' : day % 3 === 0 ? 'Jayyid Jiddan' : 'Mumtaz');
                    const kaifiyat = custom?.kaifiyat || (isFriday ? 'جمعہ تعطیل' : 'روانی و تجوید درست ہے');
                    const remarks = custom?.remarks || (isFriday ? 'تکرار و دور' : 'ماشاء اللہ');

                    return (
                      <tr 
                        key={day}
                        className={`transition-colors ${
                          isToday 
                            ? 'bg-emerald-100/60 font-semibold ring-1 ring-emerald-400' 
                            : isFriday 
                            ? 'bg-slate-100/80 text-gray-600' 
                            : day % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        {/* Day & Date */}
                        <td className="p-2 text-center font-mono border-r">
                          <span className="block font-bold text-xs">{day}</span>
                          <span className={`text-[10px] uppercase font-bold ${isFriday ? 'text-amber-700' : 'text-gray-500'}`}>
                            {isFriday ? 'جمعہ' : weekday}
                          </span>
                        </td>

                        {/* Attendance */}
                        <td className="p-2 text-center border-r">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isFriday 
                              ? 'bg-slate-200 text-slate-700' 
                              : isAbsent 
                              ? 'bg-rose-100 text-rose-800' 
                              : isLeave 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isFriday ? 'تعطیل' : isAbsent ? 'غیر حاضر' : isLeave ? 'رخصت' : 'حاضر'}
                          </span>
                        </td>

                        {isHifzStudent ? (
                          <>
                            <td className="p-2 border-r font-urdu">{sabaqQuantity}</td>
                            <td className="p-2 border-r font-bold text-emerald-950 font-urdu">{sabaqPara}</td>
                            <td className="p-2 text-center border-r font-mono font-bold">
                              {typeof sabaqMistakes === 'number' ? (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${sabaqMistakes === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                  {sabaqMistakes}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="p-2 border-r text-gray-700 font-urdu">{sabaqListener}</td>
                            <td className="p-2 border-r font-urdu">{amookhtaQuantity}</td>
                            <td className="p-2 text-center border-r font-mono font-bold">
                              {typeof amookhtaMistakes === 'number' ? (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${amookhtaMistakes <= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                  {amookhtaMistakes}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="p-2 border-r text-gray-700 font-urdu">{amookhtaListener}</td>
                            <td className="p-2 text-center border-r">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                grade === 'Mumtaz' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                              }`}>
                                {grade}
                              </span>
                            </td>
                            <td className="p-2 border-r text-xs font-urdu text-gray-800">{kaifiyat}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 border-r font-bold text-emerald-950 font-urdu">{sabaq}</td>
                            <td className="p-2 border-r font-urdu">{amookhtaQuantity}</td>
                            <td className="p-2 text-center border-r font-mono font-bold">
                              {typeof amookhtaMistakes === 'number' ? (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${amookhtaMistakes === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                  {amookhtaMistakes}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="p-2 border-r text-gray-700 font-urdu">{amookhtaListener}</td>
                            <td className="p-2 text-center border-r">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                {grade}
                              </span>
                            </td>
                            <td className="p-2 border-r text-xs font-urdu text-gray-800">{kaifiyat}</td>
                          </>
                        )}

                        {/* Action */}
                        <td className="p-2 text-center no-print">
                          <button
                            type="button"
                            onClick={() => {
                              setLogDayNum(day);
                              if (isHifzStudent) {
                                setLogSabaqQuantity(typeof sabaqQuantity === 'string' && sabaqQuantity !== '-' ? sabaqQuantity : '۱ صفحہ (1 Page)');
                                setLogSabaqPara(typeof sabaqPara === 'string' ? sabaqPara : 'پارہ ۱۴');
                                setLogSabaqMistakes(typeof sabaqMistakes === 'number' ? sabaqMistakes : 0);
                                setLogSabaqListener(typeof sabaqListener === 'string' && sabaqListener !== '-' ? sabaqListener : 'قاری بلال احمد');
                                setLogAmookhtaQuantity(typeof amookhtaQuantity === 'string' && amookhtaQuantity !== '-' ? amookhtaQuantity : 'نصف پارہ');
                                setLogAmookhtaMistakes(typeof amookhtaMistakes === 'number' ? amookhtaMistakes : 1);
                                setLogAmookhtaListener(typeof amookhtaListener === 'string' && amookhtaListener !== '-' ? amookhtaListener : 'مولانا فاروق');
                              } else {
                                setLogSabaq(typeof sabaq === 'string' ? sabaq : 'تختی ۶');
                                setLogAmookhtaQuantity(typeof amookhtaQuantity === 'string' && amookhtaQuantity !== '-' ? amookhtaQuantity : 'گزشتہ ۲ تختیاں');
                                setLogAmookhtaMistakes(typeof amookhtaMistakes === 'number' ? amookhtaMistakes : 0);
                                setLogAmookhtaListener(typeof amookhtaListener === 'string' && amookhtaListener !== '-' ? amookhtaListener : 'قاری حفظ الرحمن');
                              }
                              setLogKaifiyat(typeof kaifiyat === 'string' ? kaifiyat : 'روانی و تجوید درست ہے');
                              setLogGrade((grade as any) || 'Mumtaz');
                              setLogRemarks(typeof remarks === 'string' ? remarks : '');
                              setShowLogSabaqModal(true);
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-gray-300 hover:bg-emerald-50 text-emerald-800 transition-colors"
                          >
                            Edit
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

      {/* TAB 3: Full Month Attendance Matrix */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-m3-outline-variant/20 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Full Month Matrix &bull; حاضری رجسٹر
                </span>
                <span className="text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  تعلیمی سال: رمضان تا رمضان (Ramzan to Ramzan)
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-m3-primary" />
                <span>30-Day Monthly & Cumulative Hijri Attendance Matrix</span>
              </h3>
              <p className="text-xs text-gray-500">
                Daily record with S.No, Admission No, Student Name with Village, and full month calendar
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-900 font-bold text-xs border border-emerald-200 font-mono">
                September 2026 (صفر ۱۴۴۸ھ)
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800"
              >
                <Printer className="w-3.5 h-3.5 text-m3-primary" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Full Matrix Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-emerald-950 text-white text-[11px]">
                  <tr>
                    <th className="p-3 text-center w-12 border-r border-emerald-800 font-bold sticky left-0 bg-emerald-950 z-20">S.No</th>
                    <th className="p-3 w-28 border-r border-emerald-800 font-bold sticky left-12 bg-emerald-950 z-20">Adm No</th>
                    <th className="p-3 w-56 border-r border-emerald-800 font-bold sticky left-40 bg-emerald-950 z-20 shadow-md">
                      Student Name & Village
                    </th>
                    {Array.from({ length: 30 }, (_, i) => {
                      const day = i + 1;
                      const dateObj = new Date(2026, 8, day);
                      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const isFriday = dateObj.getDay() === 5;
                      return (
                        <th 
                          key={day} 
                          className={`p-1 text-center min-w-[32px] border-r border-emerald-800/60 font-mono ${
                            isFriday ? 'bg-emerald-800 text-amber-200 font-black' : 'bg-emerald-950 text-white'
                          }`}
                        >
                          <span className="block text-xs font-bold">{day}</span>
                          <span className="block text-[9px] uppercase tracking-tighter opacity-80">{isFriday ? 'جمعہ' : weekday}</span>
                        </th>
                      );
                    })}
                    <th className="p-2 text-center w-20 border-r border-emerald-800 bg-emerald-900 text-white font-bold">ایام درس (ماہ)</th>
                    <th className="p-2 text-center w-20 border-r border-emerald-800 bg-emerald-900 text-white font-bold">حاضری (ماہ)</th>
                    <th className="p-2 text-center w-24 border-r border-emerald-800 bg-amber-950 text-amber-100 font-bold">ایام درس (رمضان)</th>
                    <th className="p-2 text-center w-24 border-r border-emerald-800 bg-amber-950 text-amber-100 font-bold">حاضری (رمضان)</th>
                    <th className="p-2 text-center w-16 bg-emerald-900 text-white font-bold">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="p-2.5 text-center font-bold font-mono text-gray-700 border-r sticky left-0 bg-white z-10">1</td>
                    <td className="p-2.5 font-bebas text-sm tracking-wider font-bold text-emerald-900 border-r sticky left-12 bg-white z-10 whitespace-nowrap">
                      {student.admissionNo}
                    </td>
                    <td className="p-2.5 border-r sticky left-40 bg-white z-10 shadow-md">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-xs">{student.studentName}</span>
                        <span className="text-xs font-urdu text-emerald-800 font-bold leading-relaxed">{student.studentNameUrdu}</span>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium mt-0.5">
                          <span className="text-emerald-700 font-bold">گاؤں / پتہ:</span>
                          <span className="text-gray-800 font-semibold">{student.village || student.address.split(',')[0].trim()}</span>
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 30 }, (_, i) => {
                      const day = i + 1;
                      const dateObj = new Date(2026, 8, day);
                      const isFriday = dateObj.getDay() === 5;
                      const isAbsent = day === 15 || day === 22;
                      const isLeave = day === 8;
                      const status = isFriday ? 'O' : isAbsent ? 'A' : isLeave ? 'L' : 'P';
                      return (
                        <td key={day} className={`p-1 text-center border-r border-gray-200 ${isFriday ? 'bg-slate-100' : ''}`}>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-mono font-black ${
                            status === 'P' ? 'bg-emerald-600 text-white' : status === 'A' ? 'bg-rose-600 text-white' : status === 'L' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {status === 'P' ? 'ح' : status === 'A' ? 'غ' : status === 'L' ? 'ر' : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-center font-mono font-bold text-gray-800 border-r bg-emerald-50/30">26</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-800 border-r bg-emerald-50/50">{student.totalPresentsMonthly}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-950 border-r bg-amber-50/30">144</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-900 border-r bg-amber-50/40">{student.totalPresentsYearly}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {Math.round((student.totalPresentsYearly / 144) * 100)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Fees Ledger */}
      {activeTab === 'fees' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-600" />
              <span>Official Fee Transactions Ledger & Receipts</span>
            </h3>
            <button
              onClick={() => setShowCollectFeeModal(true)}
              className="px-4 py-1.5 rounded-xl bg-amber-500 text-amber-950 font-bold text-xs shadow-xs"
            >
              Collect New Fee
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 font-bold border-b text-gray-700">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Month</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Print Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {studentFeeHistory.map(fee => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-m3-primary">{fee.receiptNo}</td>
                    <td className="p-3">{fee.month}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">₹{fee.amount}</td>
                    <td className="p-3">{fee.mode}</td>
                    <td className="p-3 font-mono text-gray-500">{fee.date}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {fee.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-m3-primary"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Verification Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
            Verification Documents & Scanned Archives
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Certificate */}
            <div className="p-5 rounded-2xl bg-m3-surface-container-low border flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900">{t('viewCertificate')}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {student.previousStudyCertificateUrl ? 'Attached &bull; Ready for verification' : 'No document uploaded'}
                </p>
              </div>
              <button
                onClick={handleViewCertificate}
                className="px-4 py-2 rounded-xl bg-m3-primary text-white text-xs font-bold"
              >
                View & Print
              </button>
            </div>

            {/* Aadhar */}
            <div className="p-5 rounded-2xl bg-m3-surface-container-low border flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900">{t('viewAadhar')}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {student.aadharCardUrl ? 'Attached &bull; UIDAI Verified' : 'No document uploaded'}
                </p>
              </div>
              <button
                onClick={handleViewAadharCard}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                View & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Student ID Card */}
      {activeTab === 'id_card' && (
        <div className="flex flex-col items-center p-6 bg-gray-100 rounded-3xl space-y-4">
          <div className="w-80 bg-white rounded-3xl shadow-2xl border-2 border-emerald-700 overflow-hidden text-center relative">
            <div className="bg-[#079669] text-white p-4 border-b border-white/20">
              <h3 className="text-xs font-black uppercase tracking-wider font-montserrat">{activeMadrasa?.name}</h3>
              <p className="text-base text-emerald-200 font-jameel">{activeMadrasa?.nameUrdu}</p>
              <span className="inline-block mt-1 text-[11px] bg-white text-emerald-950 px-3 py-0.5 rounded-full font-bold uppercase font-bebas tracking-wider">
                Student Identity Card
              </span>
            </div>

            <div className="p-5 flex flex-col items-center">
              <img
                src={student.photoUrl}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-600 shadow-md mb-2"
              />
              <h4 className="text-base font-black text-gray-900 font-montserrat">{student.studentName}</h4>
              <p className="text-base text-emerald-800 font-jameel font-bold">{student.studentNameUrdu}</p>

              <div className="w-full mt-3 pt-3 border-t space-y-1.5 text-left text-xs font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Adm No:</span>
                  <strong className="font-bebas text-base tracking-wider text-emerald-800">{student.admissionNo}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Class:</span>
                  <strong className="font-semibold text-gray-900">{student.class}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Father:</span>
                  <strong className="font-semibold text-gray-900">{student.fatherName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Contact:</span>
                  <strong className="font-mono text-gray-800">{student.contactNumber}</strong>
                </div>
              </div>

              {/* Scannable SVG QR Code */}
              <div className="mt-4 p-2 bg-gray-50 border rounded-xl flex items-center justify-center">
                <svg className="w-16 h-16" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="30" height="30" fill="black" />
                  <rect x="15" y="15" width="20" height="20" fill="white" />
                  <rect x="20" y="20" width="10" height="10" fill="black" />
                  <rect x="60" y="10" width="30" height="30" fill="black" />
                  <rect x="65" y="15" width="20" height="20" fill="white" />
                  <rect x="70" y="20" width="10" height="10" fill="black" />
                  <rect x="10" y="60" width="30" height="30" fill="black" />
                  <rect x="15" y="65" width="20" height="20" fill="white" />
                  <rect x="20" y="70" width="10" height="10" fill="black" />
                  <rect x="50" y="50" width="10" height="10" fill="black" />
                  <rect x="60" y="60" width="15" height="15" fill="black" />
                  <rect x="80" y="75" width="10" height="15" fill="black" />
                </svg>
              </div>
              <span className="text-[9px] text-gray-400 font-mono mt-1">SCAN FOR MMS VERIFICATION</span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-m3-primary text-white text-xs font-bold shadow-m3-1"
          >
            <Printer className="w-4 h-4" />
            <span>Print Student ID Card</span>
          </button>
        </div>
      )}

      {/* TAB 7: Update Logs (تاریخچہ ترامیم) */}
      {activeTab === 'update_logs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-m3-primary" />
                <h3 className="text-base font-bold text-gray-900">Student Profile Modification Audit History</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-urdu">
                تاریخچہ ترامیم طالب علم (تاریخ، کس نے ترمیم کی، کیا تبدیلیاں عمل میں آئیں)
              </p>
            </div>

            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 text-white text-xs font-bold shadow-m3-1 transition-all active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile Now</span>
            </button>
          </div>

          {studentLogs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <History className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-gray-800">No Profile Modifications Recorded</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No changes have been made to this student's profile yet. Any updates to biographical details, fees, class, or documents will automatically record an immutable audit log here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentLogs.map((log, lIdx) => (
                <div key={log.id || lIdx} className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4 hover:border-m3-primary/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-900 flex items-center justify-center font-black text-sm">
                        #{studentLogs.length - lIdx}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-m3-primary" />
                            <span>Updated By: <strong className="text-emerald-950">{log.updatedBy}</strong></span>
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{log.updatedAt}</span>
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 self-start sm:self-auto">
                      {log.changes.length} Field{log.changes.length > 1 ? 's' : ''} Modified
                    </span>
                  </div>

                  {/* Changes Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                          <th className="p-2.5 rounded-l-xl">Field Name (تبدیل شدہ فیلڈ)</th>
                          <th className="p-2.5 text-rose-800">Previous Value (سابقہ قیمت)</th>
                          <th className="p-2.5 text-emerald-800 rounded-r-xl">New Value (نئی قیمت)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {log.changes.map((ch, cIdx) => (
                          <tr key={cIdx} className="hover:bg-gray-50/50">
                            <td className="p-2.5 font-semibold text-gray-900 whitespace-nowrap">
                              <span>{ch.label}</span>
                              {ch.labelUrdu && (
                                <span className="block text-[10px] text-gray-500 font-urdu">{ch.labelUrdu}</span>
                              )}
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 line-through font-medium">
                                {ch.oldValue || 'Empty'}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                                {ch.newValue || 'Empty'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Student Modal (Complete Admission Form Layout with All Information) */}
      <Modal
        isOpen={showEditStudentModal}
        onClose={() => setShowEditStudentModal(false)}
        title="Edit Student Profile (طالب علم کے پروفائل میں ترمیم)"
        subtitle="Update student personal, family, academic and fee details. All edits will be logged."
        maxWidth="4xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowEditStudentModal(false)}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-2xl border border-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveStudentEdit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes &amp; Update Audit Log</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveStudentEdit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2">
          {/* Section 1: Photo & Core Identity */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5 border-b border-gray-200 pb-2">
              1. Student Photograph & Academic Profile
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={editPhotoUrl}
                    alt="Student Preview"
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-m3-primary/30 shadow-md"
                  />
                  <label className="absolute -bottom-2 -right-2 p-2 rounded-full bg-m3-primary text-white shadow-md cursor-pointer hover:bg-m3-primary/90 transition-all hover:scale-110">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[10px] font-semibold text-gray-500 mt-2">
                  Update Photo
                </span>
              </div>

              {/* Core Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Admission No *
                  </label>
                  <input
                    type="text"
                    value={editAdmissionNo}
                    onChange={(e) => setEditAdmissionNo(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-white font-mono font-bold text-m3-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Admission Date *
                  </label>
                  <input
                    type="date"
                    value={editAdmissionDate}
                    onChange={(e) => setEditAdmissionDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Assigned Class / Department *
                  </label>
                  <select
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-white font-semibold"
                  >
                    <option value="Hifz Section A">Hifz Section A</option>
                    <option value="Hifz Section B">Hifz Section B</option>
                    <option value="Nazira Class 1">Nazira Class 1</option>
                    <option value="Nazira Class 2">Nazira Class 2</option>
                    <option value="Alimiyat Year 1">Alimiyat Year 1</option>
                    <option value="Alimiyat Year 2">Alimiyat Year 2</option>
                    <option value="Qirat & Tajweed">Qirat & Tajweed</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Name (English) *
                  </label>
                  <input
                    type="text"
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Name in Urdu (طالب علم کا نام) *
                  </label>
                  <input
                    type="text"
                    value={editStudentNameUrdu}
                    onChange={(e) => setEditStudentNameUrdu(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-white urdu-font text-right font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Date of Birth (تاریخ پیدائش)
                  </label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Family & Guardian Details */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5 border-b border-gray-200 pb-2">
              2. Parents, Guardian & Contact Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Father Name *
                </label>
                <input
                  type="text"
                  value={editFatherName}
                  onChange={(e) => setEditFatherName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mother Name
                </label>
                <input
                  type="text"
                  value={editMotherName}
                  onChange={(e) => setEditMotherName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Guardian Name
                </label>
                <input
                  type="text"
                  value={editGuardianName}
                  onChange={(e) => setEditGuardianName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Guardian Occupation
                </label>
                <input
                  type="text"
                  value={editGuardianOccupation}
                  onChange={(e) => setEditGuardianOccupation(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Phone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Aadhar Number (12 Digits) *
                </label>
                <input
                  type="text"
                  value={editAadharNumber}
                  onChange={(e) => setEditAadharNumber(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border bg-white font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Residential Address *
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Homeland / Village (وطن / گاؤں)
                </label>
                <input
                  type="text"
                  value={editVillage}
                  onChange={(e) => setEditVillage(e.target.value)}
                  placeholder="e.g. Bihar, Nizamabad"
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Accommodation, Sponsorship & Fees */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5 border-b border-gray-200 pb-2">
              3. Accommodation, Sponsorship & Financial Structure
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hostel / Day Scholar *
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-xl border bg-white font-semibold"
                >
                  <option value="Hostel">Hostel (اقامتی)</option>
                  <option value="Day Scholar">Day Scholar (غیر اقامتی)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Sponsorship Category *
                </label>
                <select
                  value={editSponsorship}
                  onChange={(e) => setEditSponsorship(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-xl border bg-white font-semibold"
                >
                  <option value="Self-Sponsored">Self-Sponsored</option>
                  <option value="Discounted">Discounted</option>
                  <option value="Non-Sponsored">Non-Sponsored</option>
                  <option value="Sponsored by">Sponsored by (Kafeel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Kafeel Name (if Sponsored)
                </label>
                <input
                  type="text"
                  value={editKafeel}
                  onChange={(e) => setEditKafeel(e.target.value)}
                  placeholder="Kafeel / Donor Name"
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Monthly Fees (₹) *
                </label>
                <input
                  type="number"
                  value={editMonthlyFees}
                  onChange={(e) => setEditMonthlyFees(Number(e.target.value))}
                  className="w-full p-2 text-xs rounded-xl border bg-white font-mono font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Previous Education & Document Uploads */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5 border-b border-gray-200 pb-2">
              4. Previous Academic Background & Verification Documents
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Previous School/Madrasa Name with Address
                </label>
                <input
                  type="text"
                  value={editPreviousSchool}
                  onChange={(e) => setEditPreviousSchool(e.target.value)}
                  placeholder="e.g. Madrasa Islamia, Hyderabad"
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Previous Study Status
                </label>
                <input
                  type="text"
                  value={editPreviousStudy}
                  onChange={(e) => setEditPreviousStudy(e.target.value)}
                  placeholder="e.g. Completed 5 Paras Nazira"
                  className="w-full p-2 text-xs rounded-xl border bg-white"
                />
              </div>
            </div>

            {/* Document Upload Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Previous Study Certificate Upload */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-center space-y-1.5">
                <FileText className="w-6 h-6 text-m3-primary mx-auto" />
                <span className="text-xs font-bold text-gray-800 block">
                  Previous Study Certificate / Sanad
                </span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-m3-primary" />
                  <span>{editCertificateUrl ? 'Replace Attached File' : 'Browse File'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleCertificateUpload}
                    className="hidden"
                  />
                </label>
                {editCertificateUrl && (
                  <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-bold mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Document Attached</span>
                  </div>
                )}
              </div>

              {/* Aadhar Card Upload */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-center space-y-1.5">
                <ShieldCheck className="w-6 h-6 text-amber-600 mx-auto" />
                <span className="text-xs font-bold text-gray-800 block">
                  Aadhar Card Scan
                </span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>{editAadharCardUrl ? 'Replace Attached File' : 'Browse File'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleAadharUpload}
                    className="hidden"
                  />
                </label>
                {editAadharCardUrl && (
                  <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-bold mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Document Attached</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Portal Access Credentials */}
          <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-700" />
                5. Student &amp; Guardian Portal Access Credentials
              </h4>
              <button
                type="button"
                onClick={() => {
                  const c = generateDefaultCredentials(editStudentName, editAdmissionDate, editDob);
                  setEditUsername(c.username);
                  setEditPassword(c.password);
                }}
                className="text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-800" />
                <span>Auto-Generate Default</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Portal Username *
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="e.g. Moha-2026"
                  className="w-full p-2 text-xs rounded-xl border border-amber-300 bg-white font-mono font-bold"
                  required
                />
                <span className="text-[9px] text-gray-500 mt-0.5 block">Format: First 4 Letters - Year (e.g. Abdu-2026)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Portal Password *
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="e.g. Moha@2014"
                  className="w-full p-2 text-xs rounded-xl border border-amber-300 bg-white font-mono font-bold"
                  required
                />
                <span className="text-[9px] text-gray-500 mt-0.5 block">Format: First 4 Letters @ DOB Year (e.g. Abdu@2014)</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Select Class Modal */}
      <Modal
        isOpen={showSelectClassModal}
        onClose={() => setShowSelectClassModal(false)}
        title={t('selectClassForStudent')}
        maxWidth="sm"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setShowSelectClassModal(false)} className="px-4 py-2 text-xs text-gray-600">Cancel</button>
            <button onClick={handleSaveClass} className="px-5 py-2 text-xs font-bold bg-m3-primary text-white rounded-full">Save Class</button>
          </div>
        }
      >
        <form onSubmit={handleSaveClass} className="space-y-3">
          <label className="text-xs font-bold block">Assign Section</label>
          <select
            value={selectedClassVal}
            onChange={(e) => setSelectedClassVal(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border bg-white font-semibold"
          >
            <option value="Hifz Section A">Hifz Section A</option>
            <option value="Hifz Section B">Hifz Section B</option>
            <option value="Nazira Class 1">Nazira Class 1</option>
            <option value="Nazira Class 2">Nazira Class 2</option>
            <option value="Alimiyat Year 1">Alimiyat Year 1</option>
            <option value="Alimiyat Year 2">Alimiyat Year 2</option>
            <option value="Qirat & Tajweed">Qirat & Tajweed</option>
          </select>
        </form>
      </Modal>

      {/* Collect Fee Modal */}
      <Modal
        isOpen={showCollectFeeModal}
        onClose={() => {
          setShowCollectFeeModal(false);
          setLastReceipt(null);
        }}
        title={`Collect Fee for ${student.studentName}`}
        maxWidth="md"
        footer={
          lastReceipt ? (
            <div className="flex justify-between w-full">
              <button onClick={() => window.print()} className="px-4 py-2 text-xs font-medium bg-m3-primary text-white rounded-full">
                Print Official Receipt
              </button>
              <button onClick={() => { setShowCollectFeeModal(false); setLastReceipt(null); }} className="px-4 py-2 text-xs font-medium text-gray-600 rounded-full">
                Done
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setShowCollectFeeModal(false)} className="px-4 py-2 text-xs text-gray-600">Cancel</button>
              <button onClick={handleCollectFeeSubmit} className="px-5 py-2 text-xs font-medium bg-amber-600 text-white rounded-full">Confirm Receipt</button>
            </div>
          )
        }
      >
        {lastReceipt ? (
          <div className="p-6 bg-amber-50 rounded-2xl border text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-950">Payment Recorded Successfully!</h4>
            <p className="text-xs font-mono">Receipt #{lastReceipt.receiptNo} &bull; ₹{lastReceipt.amount}</p>
          </div>
        ) : (
          <form onSubmit={handleCollectFeeSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold block mb-1">Fee Amount (₹)</label>
              <input
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border bg-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Fee Month</label>
              <input
                type="text"
                value={feeMonth}
                onChange={(e) => setFeeMonth(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border bg-white"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Payment Mode</label>
              <select
                value={feeMode}
                onChange={(e) => setFeeMode(e.target.value as any)}
                className="w-full p-2 text-xs rounded-xl border bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online / UPI</option>
                <option value="Bank Transfer">Bank Transfer / Cheque</option>
              </select>
            </div>
          </form>
        )}
      </Modal>

      {/* Exam Reports Modal */}
      <Modal
        isOpen={showExamReportModal}
        onClose={() => setShowExamReportModal(false)}
        title={t('viewExamReports')}
        maxWidth="md"
        footer={<button onClick={() => window.print()} className="px-4 py-2 text-xs bg-m3-primary text-white rounded-full">Print Marksheet</button>}
      >
        <div className="p-3 bg-amber-50 rounded-xl text-xs flex justify-between font-semibold">
          <span>Overall: Mumtaz (A+)</span>
          <span>Score: 94%</span>
        </div>
      </Modal>

      {/* Teacher Reports Modal */}
      <Modal
        isOpen={showTeacherReportsModal}
        onClose={() => setShowTeacherReportsModal(false)}
        title={t('viewTeacherReports')}
        maxWidth="md"
      >
        <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-1">
          <p className="font-bold">Ustadh Notes:</p>
          <p className="text-gray-700">Student is punctual in daily Sabaq and congregational prayers. Respectful and disciplined.</p>
        </div>
      </Modal>

      {/* Daily Sabaq / Roznamchah Entry Modal */}
      <Modal
        isOpen={showLogSabaqModal}
        onClose={() => setShowLogSabaqModal(false)}
        title={`Log Daily Sabaq & Roznamchah — Day ${logDayNum}`}
        subtitle={`Student: ${student.studentName} (${student.admissionNo})`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveLogSabaq} className="space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">تاریخ و دن</span>
              <strong className="text-emerald-950 font-mono">Day {logDayNum} (September {roznamchahYear})</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">تعلیمی دورانیہ</span>
              <strong className="text-amber-950">رمضان تا رمضان</strong>
            </div>
          </div>

          {isHifzStudent ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <span className="text-xs font-black text-amber-900 block font-urdu">
                  ۱. جدید سبق کی تفصیل (Daily Sabaq Details)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">مقدار سبق (Sabaq Quantity)</label>
                    <input
                      type="text"
                      value={logSabaqQuantity}
                      onChange={(e) => setLogSabaqQuantity(e.target.value)}
                      placeholder="e.g. ۱ صفحہ (1 Page) / نصف صفحہ"
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">پارہ سبق (Sabaq Parah)</label>
                    <input
                      type="text"
                      value={logSabaqPara}
                      onChange={(e) => setLogSabaqPara(e.target.value)}
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
                      value={logSabaqMistakes}
                      onChange={(e) => setLogSabaqMistakes(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع پارہ سبق (Listener)</label>
                    <input
                      type="text"
                      value={logSabaqListener}
                      onChange={(e) => setLogSabaqListener(e.target.value)}
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
                      value={logAmookhtaQuantity}
                      onChange={(e) => setLogAmookhtaQuantity(e.target.value)}
                      placeholder="e.g. نصف پارہ"
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">اغلاط - آموختہ (Mistakes)</label>
                    <input
                      type="number"
                      min={0}
                      value={logAmookhtaMistakes}
                      onChange={(e) => setLogAmookhtaMistakes(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع آموختہ (Listener)</label>
                    <input
                      type="text"
                      value={logAmookhtaListener}
                      onChange={(e) => setLogAmookhtaListener(e.target.value)}
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
                    value={logGrade}
                    onChange={(e) => setLogGrade(e.target.value as any)}
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
                    value={logKaifiyat}
                    onChange={(e) => setLogKaifiyat(e.target.value)}
                    placeholder="e.g. ممتاز - روانی و تجوید درست ہے"
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
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
                  value={logSabaq}
                  onChange={(e) => setLogSabaq(e.target.value)}
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
                    value={logAmookhtaQuantity}
                    onChange={(e) => setLogAmookhtaQuantity(e.target.value)}
                    placeholder="e.g. گزشتہ ۲ تختیاں"
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">اغلاط</label>
                  <input
                    type="number"
                    min={0}
                    value={logAmookhtaMistakes}
                    onChange={(e) => setLogAmookhtaMistakes(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">سامع آموختہ</label>
                  <input
                    type="text"
                    value={logAmookhtaListener}
                    onChange={(e) => setLogAmookhtaListener(e.target.value)}
                    placeholder="e.g. قاری حفظ الرحمن"
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-urdu">معیار / درجہ (Grade)</label>
                  <select
                    value={logGrade}
                    onChange={(e) => setLogGrade(e.target.value as any)}
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
                    value={logKaifiyat}
                    onChange={(e) => setLogKaifiyat(e.target.value)}
                    placeholder="e.g. ممتاز - مخارج و تلفظ درست ہے"
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowLogSabaqModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-m3-primary text-white hover:bg-opacity-90 shadow-xs"
            >
              Save Roznamchah Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Document View Modals */}
      <PrintDocModal
        isOpen={showCertDocModal}
        onClose={() => setShowCertDocModal(false)}
        title="Previous Study Certificate / Sanad"
        docType="certificate"
        imageUrl={student.previousStudyCertificateUrl}
        studentName={student.studentName}
        studentNameUrdu={student.studentNameUrdu}
        admissionNo={student.admissionNo}
        docNumber={student.previousStudy}
        issuedBy={student.previousSchool}
      />

      <PrintDocModal
        isOpen={showAadharDocModal}
        onClose={() => setShowAadharDocModal(false)}
        title="Government Aadhar Identification Card"
        docType="aadhar"
        imageUrl={student.aadharCardUrl}
        studentName={student.studentName}
        studentNameUrdu={student.studentNameUrdu}
        admissionNo={student.admissionNo}
        docNumber={student.aadharNumber}
        issuedBy="Unique Identification Authority of India (UIDAI)"
      />
    </div>
  );
};
