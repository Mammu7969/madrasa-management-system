import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import { 
  UserPlus, 
  Camera, 
  Upload, 
  FileText, 
  Save, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  Calendar,
  Building2,
  Phone,
  Home,
  Wallet,
  ShieldCheck,
  Key,
  Lock,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  LayoutList,
  Layers,
  Check
} from 'lucide-react';
import { generateDefaultCredentials } from '../../utils/credentialGenerator';
import { compressImage } from '../../utils/imageCompressor';

interface AddAdmissionProps {
  onBackToList: () => void;
  onStudentAdded: (newStudent: Student) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { id: 1, title: 'Personal Details', titleUrdu: 'ذاتی معلومات', icon: User },
  { id: 2, title: 'Guardian & Contact', titleUrdu: 'سرپرست اور رابطہ', icon: Home },
  { id: 3, title: 'Academic & Madrasa', titleUrdu: 'تعلیمی تفصیلات', icon: Building2 },
  { id: 4, title: 'Fees & Sponsorship', titleUrdu: 'فیس و کفالت', icon: Wallet },
  { id: 5, title: 'Docs & Credentials', titleUrdu: 'دستاویزات و لاگ ان', icon: ShieldCheck },
];

export const AddAdmission: React.FC<AddAdmissionProps> = ({
  onBackToList,
  onStudentAdded
}) => {
  const { activeMadrasa } = useAuth();
  const { language, t, showToast } = useTheme();

  const autoAdmNo = `ADM-2026-00${Math.floor(10 + Math.random() * 90)}`;

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [singlePageMode, setSinglePageMode] = useState<boolean>(false);

  // Form State
  const [admissionNo, setAdmissionNo] = useState<string>(autoAdmNo);
  const [admissionDate, setAdmissionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentName, setStudentName] = useState<string>('');
  const [studentNameUrdu, setStudentNameUrdu] = useState<string>('');
  const [fatherName, setFatherName] = useState<string>('');
  const [motherName, setMotherName] = useState<string>('');
  const [guardianName, setGuardianName] = useState<string>('');
  const [guardianOccupation, setGuardianOccupation] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [category, setCategory] = useState<'Hostel' | 'Day Scholar'>('Hostel');
  const [sponsorship, setSponsorship] = useState<'Self-Sponsored' | 'Discounted' | 'Non-Sponsored' | 'Sponsored by'>('Self-Sponsored');
  const [kafeelName, setKafeelName] = useState<string>('');
  const [monthlyFees, setMonthlyFees] = useState<number>(2500);
  const availableClasses = useMemo(() => {
    return db.getClasses(activeMadrasa?.id);
  }, [activeMadrasa?.id]);

  const [className, setClassName] = useState<string>(() => {
    const list = db.getClasses(activeMadrasa?.id);
    return list[0]?.name || 'Hifz Section A';
  });
  const [previousSchool, setPreviousSchool] = useState<string>('');
  const [previousStudy, setPreviousStudy] = useState<string>('');
  const [aadharNumber, setAadharNumber] = useState<string>('');
  const [dob, setDob] = useState<string>('2015-05-15');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Image and Document States
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=400&q=80');
  const [certificateUrl, setCertificateUrl] = useState<string>('');
  const [aadharCardUrl, setAadharCardUrl] = useState<string>('');

  // Save and Admission No Status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [admissionNoStatus, setAdmissionNoStatus] = useState<{
    isChecking: boolean;
    isTaken: boolean;
    takenBy?: string;
  }>({ isChecking: false, isTaken: false });

  // Live real-time check for admission number uniqueness
  React.useEffect(() => {
    const trimmed = admissionNo.trim();
    if (!trimmed) {
      setAdmissionNoStatus({ isChecking: false, isTaken: false });
      return;
    }

    // 1. Immediate local check
    const localTaken = db.isAdmissionNoTaken(trimmed, undefined, activeMadrasa?.id);
    if (localTaken) {
      const localSt = db.getStudents().find(s => s.admissionNo.toLowerCase() === trimmed.toLowerCase());
      setAdmissionNoStatus({ isChecking: false, isTaken: true, takenBy: localSt?.studentName });
      return;
    }

    // 2. Query Supabase
    let isCancelled = false;
    setAdmissionNoStatus(prev => ({ ...prev, isChecking: true }));
    const timer = setTimeout(async () => {
      const res = await db.checkAdmissionNoAvailable(trimmed, undefined, activeMadrasa?.id);
      if (!isCancelled) {
        setAdmissionNoStatus({
          isChecking: false,
          isTaken: !res.available,
          takenBy: res.existingStudentName
        });
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [admissionNo, activeMadrasa?.id]);

  const handleAutoGenerateCredentials = () => {
    if (!studentName.trim()) {
      showToast('Please enter Student Name first to generate credentials', 'warning');
      return;
    }
    const creds = generateDefaultCredentials(studentName, admissionDate, dob);
    setUsername(creds.username);
    setPassword(creds.password);
    showToast(`Generated credentials: ${creds.username} / ${creds.password}`, 'success');
  };

  // Handle Photo File Upload with client-side compression (~25KB)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 500, 0.75);
        setPhotoUrl(compressed);
        showToast('Student photo optimized and uploaded successfully!', 'success');
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => setPhotoUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle Certificate File Upload with client-side compression
  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.75);
        setCertificateUrl(compressed);
        showToast('Previous Study Certificate uploaded!', 'info');
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => setCertificateUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle Aadhar File Upload with client-side compression
  const handleAadharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.75);
        setAadharCardUrl(compressed);
        showToast('Aadhar Card scanned image uploaded!', 'info');
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => setAadharCardUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  // Step Validation
  const validateStep = (step: WizardStep): boolean => {
    if (step === 1) {
      if (!studentName.trim()) {
        showToast('Please enter the Student Full Name in English', 'warning');
        return false;
      }
      if (!dob) {
        showToast('Please enter the Date of Birth', 'warning');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!fatherName.trim()) {
        showToast('Please enter the Father / Guardian Name', 'warning');
        return false;
      }
      if (!contactNumber.trim()) {
        showToast('Please enter a valid Contact Number', 'warning');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!admissionNo.trim()) {
        showToast('Please provide an Admission Number', 'warning');
        return false;
      }
      if (admissionNoStatus.isTaken) {
        showToast(`Admission Number "${admissionNo}" is already taken!`, 'error');
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (isNaN(monthlyFees) || monthlyFees < 0) {
        showToast('Please provide a valid Monthly Fees amount', 'warning');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as WizardStep);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!studentName.trim() || !activeMadrasa) {
      showToast('Student Name and Madrasa are required.', 'warning');
      return;
    }

    const cleanAdmNo = admissionNo.trim();
    if (!cleanAdmNo) {
      showToast('Admission Number is required.', 'warning');
      return;
    }

    // Verify Admission Number uniqueness
    const check = await db.checkAdmissionNoAvailable(cleanAdmNo, undefined, activeMadrasa.id);
    if (!check.available) {
      showToast(
        `Admission Number "${cleanAdmNo}" is already taken${check.existingStudentName ? ` by ${check.existingStudentName}` : ''}! Please specify a unique Admission Number.`,
        'error'
      );
      return;
    }

    const defaultCreds = generateDefaultCredentials(studentName, admissionDate, dob);
    const finalUsername = username.trim() || defaultCreds.username;
    const finalPassword = password.trim() || defaultCreds.password;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      admissionNo: cleanAdmNo,
      admissionDate,
      studentName: studentName.trim(),
      studentNameUrdu: studentNameUrdu.trim() || studentName.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim() || 'N/A',
      guardianName: guardianName.trim() || fatherName.trim(),
      guardianOccupation: guardianOccupation.trim() || 'Private',
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      category,
      sponsorship,
      kafeelName: kafeelName.trim() || undefined,
      monthlyFees: Number(monthlyFees),
      previousSchool: previousSchool.trim() || 'None',
      previousStudy: previousStudy.trim() || 'Noorani Qaidah',
      previousStudyCertificateUrl: certificateUrl || undefined,
      aadharCardUrl: aadharCardUrl || undefined,
      aadharNumber: aadharNumber.trim() || 'N/A',
      photoUrl,
      class: className,
      madrasaId: activeMadrasa.id,
      totalPresentsYearly: 1,
      totalPresentsMonthly: 1,
      totalAbsentsYearly: 0,
      totalAbsentsMonthly: 0,
      presentSabaqAt: 'Para 1 (Initial Sabaq)',
      dob,
      username: finalUsername,
      password: finalPassword
    };

    try {
      setIsSaving(true);
      const res = await db.addStudent(newStudent);
      if (res.error) {
        showToast(`Saved locally! Cloud sync note: ${res.error}`, 'info');
      } else {
        showToast(`New Admission for ${newStudent.studentName} (${newStudent.admissionNo}) saved and synchronized successfully!`, 'success');
      }
      onStudentAdded(newStudent);
    } catch (err: any) {
      console.error('Error saving admission:', err);
      showToast(`Failed to save admission: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isUrdu = language === 'ur';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="heritage-card-elevated p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[#065F46] dark:border-l-[#34D399]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToList}
            className="p-2.5 rounded-2xl bg-[#FAF6EF] dark:bg-[#0E1A14] hover:bg-[#F5EFE0] dark:hover:bg-[#14261D] border border-[#D97706]/25 text-stone-700 dark:text-stone-300 transition-colors shadow-xs"
            title={isUrdu ? 'واپس فہرست پر جائیں' : 'Back to Students Directory'}
          >
            <ArrowLeft className="w-5 h-5 text-stone-800 dark:text-stone-200" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2 font-montserrat">
                <div className="w-8 h-8 rounded-xl bg-[#064E3B] text-[#FEF3C7] flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>{isUrdu ? 'نیا داخلہ فارم' : 'New Student Admission'}</span>
              </h2>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-1">
              {isUrdu ? 'طلباء کے فوری اندراج، تصدیق اور پورٹل کوائف کی خودکار تیاری' : 'Enterprise registry onboarding workflow with instant verification and credential generation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Toggle View Mode */}
          <button
            type="button"
            onClick={() => setSinglePageMode(!singlePageMode)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-[#D97706]/30 bg-[#FAF6EF] dark:bg-[#0E1A14] text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-[#F5EFE0] transition-colors shadow-xs"
          >
            {singlePageMode ? (
              <>
                <Layers className="w-3.5 h-3.5 text-[#D97706]" />
                <span>{isUrdu ? 'مرحلہ وار طریقہ' : 'Wizard Mode'}</span>
              </>
            ) : (
              <>
                <LayoutList className="w-3.5 h-3.5 text-[#065F46]" />
                <span>{isUrdu ? 'تمام شعبے' : 'All Sections'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSaving || admissionNoStatus.isTaken}
            onClick={handleSubmit}
            className={`heritage-btn-primary flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer ${
              isSaving || admissionNoStatus.isTaken
                ? 'opacity-60 cursor-not-allowed'
                : ''
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FEF3C7]" />
                <span>{isUrdu ? 'محفوظ ہو رہا ہے...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#FEF3C7]" />
                <span>{isUrdu ? 'داخلہ مکمل کریں' : 'Complete Admission'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progressive Step Stepper (Only in Wizard Mode) */}
      {!singlePageMode && (
        <div className="heritage-card p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {STEPS.map((step) => {
              const isCurrent = currentStep === step.id;
              const isPassed = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (isPassed || step.id === currentStep) {
                      setCurrentStep(step.id as WizardStep);
                    } else if (step.id === currentStep + 1 && validateStep(currentStep)) {
                      setCurrentStep(step.id as WizardStep);
                    }
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all border ${
                    isCurrent
                      ? 'bg-[#064E3B]/10 dark:bg-[#065F46]/20 border-[#065F46] text-[#065F46] dark:text-[#34D399] shadow-xs'
                      : isPassed
                      ? 'bg-[#FEF3C7]/40 dark:bg-[#78350F]/20 border-[#D97706]/40 text-[#92400E] dark:text-[#FDE68A]'
                      : 'bg-[#FAF6EF]/60 dark:bg-[#0E1A14]/40 border-transparent text-stone-500 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCurrent
                        ? 'bg-[#065F46] text-[#FAF5EB]'
                        : isPassed
                        ? 'bg-[#D97706] text-white'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-bold leading-tight truncate ${isUrdu ? 'urdu-font' : ''}`}>
                      {isUrdu ? step.titleUrdu : step.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#065F46] to-[#D97706] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Steps Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Student Primary Identity */}
        {(singlePageMode || currentStep === 1) && (
          <div className="heritage-card p-6 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#D97706]/15 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#065F46] dark:text-[#34D399] flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{isUrdu ? '۱. طالب علم کے ذاتی کوائف' : '1. Student Personal Identification'}</span>
              </h3>
              <span className="text-[11px] font-semibold text-stone-500">
                {isUrdu ? 'مرحلہ ۱ از ۵' : 'Step 1 of 5'}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Photo Upload Box */}
              <div className="flex flex-col items-center shrink-0 mx-auto md:mx-0">
                <div className="relative group">
                  <img
                    src={photoUrl}
                    alt="Student Preview"
                    className="w-28 h-36 rounded-2xl object-cover border-2 border-dashed border-[#D97706]/40 shadow-inner bg-[#FAF6EF] dark:bg-[#0E1A14]"
                  />
                  <label className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-[#064E3B] text-[#FEF3C7] shadow-md cursor-pointer hover:bg-[#065F46] active:scale-95 transition-all">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 block">
                    {isUrdu ? 'پاسپورٹ سائز تصویر' : 'Passport Size Photo (3x4)'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {isUrdu ? 'خودکار کمپریس' : 'JPG/PNG auto-compressed'}
                  </span>
                </div>
              </div>

              {/* Core Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    {isUrdu ? 'طالب علم کا نام (انگریزی) *' : 'Student Full Name (English) *'}
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Mohammad Salman Khan"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-medium focus:border-[#065F46] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    {isUrdu ? 'طالب علم کا نام (اردو)' : 'Student Name in Urdu'}
                  </label>
                  <input
                    type="text"
                    value={studentNameUrdu}
                    onChange={(e) => setStudentNameUrdu(e.target.value)}
                    placeholder="محمد سلمان خان"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 urdu-font text-right font-semibold focus:border-[#065F46] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    {isUrdu ? 'تاریخِ پیدائش *' : 'Date of Birth *'}
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-mono focus:border-[#065F46] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    {isUrdu ? 'آدھار نمبر (۱۲ ہندسے)' : 'Student Aadhar Number (12 Digits)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-mono focus:border-[#065F46] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Guardian & Contact Information */}
        {(singlePageMode || currentStep === 2) && (
          <div className="heritage-card p-6 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#D97706]/15 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#065F46] dark:text-[#34D399] flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>{isUrdu ? '۲. سرپرست، والدین اور رابطے کی تفصیلات' : '2. Parents, Guardian & Contact Information'}</span>
              </h3>
              <span className="text-[11px] font-semibold text-stone-500">
                {isUrdu ? 'مرحلہ ۲ از ۵' : 'Step 2 of 5'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'والد کا نام *' : 'Father Name *'}
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder={isUrdu ? 'والد کا مکمل نام' : "Father's full name"}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'والدہ کا نام' : 'Mother Name'}
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder={isUrdu ? 'والدہ کا نام' : "Mother's name"}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'سرپرست کا نام' : 'Guardian Name'}
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder={isUrdu ? 'اگر والد کے علاوہ ہو' : 'Leave empty if father'}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'سرپرست کا پیشہ' : 'Guardian Occupation'}
                </label>
                <input
                  type="text"
                  value={guardianOccupation}
                  onChange={(e) => setGuardianOccupation(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً تجارت، زراعت، ملازمت' : 'e.g. Business, Agriculture, Trade'}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'موبائل / واٹس ایپ نمبر *' : 'Primary Mobile / WhatsApp *'}
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98480 12345"
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-mono focus:border-[#065F46] focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'مستقل رہائشی پتہ *' : 'Permanent Residential Address *'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isUrdu ? 'مکان نمبر، محلہ، بستی، ضلع، پن کوڈ' : 'House No, Street, Mohalla, City / District, State, PIN'}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Academic & Madrasa Class */}
        {(singlePageMode || currentStep === 3) && (
          <div className="heritage-card p-6 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#D97706]/15 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#065F46] dark:text-[#34D399] flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{isUrdu ? '۳. تعلیمی تفصیلات و درجہ کی تعیین' : '3. Academic Placement & Madrasa Class'}</span>
              </h3>
              <span className="text-[11px] font-semibold text-stone-500">
                {isUrdu ? 'مرحلہ ۳ از ۵' : 'Step 3 of 5'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                    {isUrdu ? 'داخلہ نمبر *' : 'Admission Number *'}
                  </label>
                  {admissionNoStatus.isChecking && (
                    <span className="text-[10px] text-[#D97706] flex items-center gap-1 font-medium">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> {isUrdu ? 'جانچ ہو رہی ہے...' : 'Checking...'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border font-mono font-bold transition-all bg-white/80 dark:bg-[#0E1A14]/80 ${
                    admissionNoStatus.isTaken
                      ? 'border-rose-500 text-rose-600 focus:ring-2 focus:ring-rose-200'
                      : 'border-[#D97706]/20 text-[#065F46] dark:text-[#34D399] focus:border-[#065F46] focus:outline-none'
                  }`}
                  required
                />
                {admissionNo.trim() && (
                  <div className="mt-1">
                    {admissionNoStatus.isTaken ? (
                      <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-800/40">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{isUrdu ? 'یہ داخلہ نمبر پہلے سے موجود ہے' : 'Admission No is already taken'}{admissionNoStatus.takenBy ? ` (${admissionNoStatus.takenBy})` : ''}</span>
                      </p>
                    ) : (
                      !admissionNoStatus.isChecking && (
                        <p className="text-[11px] text-[#065F46] dark:text-[#34D399] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#065F46] shrink-0" />
                          <span>{isUrdu ? 'داخلہ نمبر دستیاب ہے' : 'Admission No is available'}</span>
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'تاریخ داخلہ *' : 'Admission Date *'}
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-mono focus:border-[#065F46] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'منتخب درجہ / جماعت *' : 'Enrolled Class / Department *'}
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-semibold focus:border-[#065F46] focus:outline-none"
                  required
                >
                  {availableClasses.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.category ? `(${c.category})` : ''} {c.incharge && c.incharge !== 'Not Assigned' ? `- ${isUrdu ? 'استاد:' : 'Ustadh:'} ${c.incharge}` : ''}
                    </option>
                  ))}
                  {availableClasses.length === 0 && (
                    <>
                      <option value="Hifz Section A">Hifz Section A</option>
                      <option value="Hifz Section B">Hifz Section B</option>
                      <option value="Nazira Class 1">Nazira Class 1</option>
                      <option value="Alimiyat Year 1">Alimiyat Year 1</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'سابقہ مدرسہ یا اسکول' : 'Previous School / Madrasa Name'}
                </label>
                <input
                  type="text"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً جامعہ اسلامیہ، حیدرآباد' : 'e.g. Madrasa Islamia, Hyderabad'}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'سابقہ تعلیمی کیفیت' : 'Previous Study Status'}
                </label>
                <input
                  type="text"
                  value={previousStudy}
                  onChange={(e) => setPreviousStudy(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً ۵ پارے ناظرہ مکمل، چوتھی جماعت پاس' : 'e.g. Completed 5 Paras Nazira, Passed 4th Class'}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Fees & Sponsorship */}
        {/* Step 4: Fees & Sponsorship */}
        {(singlePageMode || currentStep === 4) && (
          <div className="heritage-card p-6 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#D97706]/15 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#065F46] dark:text-[#34D399] flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>{isUrdu ? '۴. اقامت، کفالت اور ماہانہ فیس' : '4. Accommodation, Sponsorship & Fees'}</span>
              </h3>
              <span className="text-[11px] font-semibold text-stone-500">
                {isUrdu ? 'مرحلہ ۴ از ۵' : 'Step 4 of 5'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'اقامتی / غیر اقامتی *' : 'Hostel / Day Scholar *'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-semibold focus:border-[#065F46] focus:outline-none"
                >
                  <option value="Hostel">{isUrdu ? 'اقامتی' : 'Hostel'}</option>
                  <option value="Day Scholar">{isUrdu ? 'غیر اقامتی' : 'Day Scholar'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'کفالت کی قسم *' : 'Sponsorship Category *'}
                </label>
                <select
                  value={sponsorship}
                  onChange={(e) => setSponsorship(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-semibold focus:border-[#065F46] focus:outline-none"
                >
                  <option value="Self-Sponsored">{isUrdu ? 'خود کفیل' : 'Self-Sponsored'}</option>
                  <option value="Discounted">{isUrdu ? 'رعایتی' : 'Discounted'}</option>
                  <option value="Non-Sponsored">{isUrdu ? 'غیر کفالت شدہ' : 'Non-Sponsored'}</option>
                  <option value="Sponsored by">{isUrdu ? 'کفیل کے تحت' : 'Sponsored by Kafeel'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'کفیل کا نام' : 'Kafeel / Sponsor Name'}
                </label>
                <input
                  type="text"
                  value={kafeelName}
                  onChange={(e) => setKafeelName(e.target.value)}
                  placeholder={isUrdu ? 'کفیل کا نام درج کریں' : 'Kafeel / Donor Name'}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 focus:border-[#065F46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {isUrdu ? 'ماہانہ فیس (روپے) *' : 'Monthly Fees (₹) *'}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={monthlyFees}
                  onChange={(e) => setMonthlyFees(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-mono font-bold focus:border-[#065F46] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Verification Documents & Portal Credentials */}
        {(singlePageMode || currentStep === 5) && (
          <div className="space-y-6 animate-in fade-in">
            {/* Documents Box */}
            <div className="heritage-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#D97706]/15 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#065F46] dark:text-[#34D399] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isUrdu ? '۵. تصدیقی دستاویزات' : '5. Verification Documents'}</span>
                </h3>
                <span className="text-[11px] font-semibold text-stone-500">
                  {isUrdu ? 'مرحلہ ۵ از ۵' : 'Step 5 of 5'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Certificate */}
                <div className="p-4 rounded-2xl bg-[#FAF6EF]/80 dark:bg-[#0E1A14]/80 border border-[#D97706]/20 text-center space-y-2">
                  <FileText className="w-8 h-8 text-[#065F46] dark:text-[#34D399] mx-auto" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                    {t('uploadCertificate')}
                  </span>
                  <p className="text-[11px] text-stone-500">
                    {isUrdu ? 'سابقہ تعلیمی سند یا حفظ سند کی تصویر' : 'Previous TC, Marksheet, or Hifz Sanad scan'}
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#080E0B] border border-[#D97706]/25 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-[#FAF6EF] cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-[#065F46]" />
                    <span>{certificateUrl ? (isUrdu ? 'سند تبدیل کریں' : 'Replace Certificate') : (isUrdu ? 'سند منتخب کریں' : 'Browse Certificate')}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleCertificateUpload}
                      className="hidden"
                    />
                  </label>
                  {certificateUrl && (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-[#065F46] dark:text-[#34D399] font-bold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'سند منسلک کر دی گئی' : 'Certificate Attached'}</span>
                    </div>
                  )}
                </div>

                {/* Aadhar */}
                <div className="p-4 rounded-2xl bg-[#FAF6EF]/80 dark:bg-[#0E1A14]/80 border border-[#D97706]/20 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-[#D97706] mx-auto" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                    {t('uploadAadhar')}
                  </span>
                  <p className="text-[11px] text-stone-500">
                    {isUrdu ? 'سرکاری آدھار کارڈ کی اسکین کاپی' : 'Scanned photo or copy of government Aadhar card'}
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#080E0B] border border-[#D97706]/25 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-[#FAF6EF] cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{aadharCardUrl ? (isUrdu ? 'آدھار تبدیل کریں' : 'Replace Aadhar') : (isUrdu ? 'آدھار منتخب کریں' : 'Browse Aadhar')}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleAadharUpload}
                      className="hidden"
                    />
                  </label>
                  {aadharCardUrl && (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-[#065F46] dark:text-[#34D399] font-bold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'آدھار کارڈ منسلک کر دیا گیا' : 'Aadhar Card Attached'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Portal Credentials */}
            <div className="heritage-card p-6 space-y-4 shadow-sm border-l-4 border-l-[#D97706]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D97706]/15 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#065F46] dark:text-[#34D399] flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#D97706]" />
                    <span>{isUrdu ? 'پورٹل لاگ ان کوائف' : 'Portal Credentials'}</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {isUrdu ? 'طالب علم اور سرپرست کے لیے فوری لاگ ان رسائی کے کوائف' : 'Generate instant portal access login credentials for student & guardian'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateCredentials}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FEF3C7] dark:bg-[#78350F]/30 hover:bg-[#FDE68A] text-[#92400E] dark:text-[#FDE68A] text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto border border-[#D97706]/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{isUrdu ? 'خودکار لاگ ان تیار کریں' : 'Auto-Generate Default Credentials'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6EF] dark:bg-[#0E1A14] border border-[#D97706]/20 text-xs space-y-1">
                <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px]">
                  {isUrdu ? 'ادارہ جاتی فارمولا:' : 'Standard Institutional Formula:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-400">
                  <div>
                    <span className="font-semibold">{isUrdu ? 'یوزر نیم:' : 'Username:'}</span> Name + <code className="bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono font-bold text-stone-900 dark:text-stone-100">(-)</code> + Year (e.g. <code className="bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono font-bold text-[#065F46] dark:text-[#34D399]">Abdu-2026</code>)
                  </div>
                  <div>
                    <span className="font-semibold">{isUrdu ? 'پاس ورڈ:' : 'Password:'}</span> Name + <code className="bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono font-bold text-stone-900 dark:text-stone-100">(@)</code> + Year (e.g. <code className="bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono font-bold text-[#065F46] dark:text-[#34D399]">Abdu@2015</code>)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    {isUrdu ? 'پورٹل یوزر نیم' : 'Portal Username'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isUrdu ? 'خودکار تیار ہوگا اگر خالی چھوڑیں' : 'Auto-generated if blank (e.g. Abdu-2026)'}
                      className="w-full p-2.5 pr-8 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-mono font-bold focus:border-[#065F46] focus:outline-none"
                    />
                    <User className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    {isUrdu ? 'پورٹل پاس ورڈ' : 'Portal Password'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isUrdu ? 'خودکار تیار ہوگا اگر خالی چھوڑیں' : 'Auto-generated if blank (e.g. Abdu@2015)'}
                      className="w-full p-2.5 pr-8 text-xs rounded-xl border border-[#D97706]/20 bg-white/80 dark:bg-[#0E1A14]/80 text-stone-800 dark:text-stone-200 font-mono font-bold focus:border-[#065F46] focus:outline-none"
                    />
                    <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Bottom Navigation Bar */}
        <div className="flex items-center justify-between gap-3 p-4 heritage-card shadow-sm">
          <div>
            {!singlePageMode && currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-200 bg-[#FAF6EF] dark:bg-[#0E1A14] hover:bg-[#F5EFE0] rounded-2xl transition-colors border border-[#D97706]/25 shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isUrdu ? 'پچھلا مرحلہ' : 'Previous Step'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onBackToList}
                className="px-5 py-2.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-2xl transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!singlePageMode && currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="heritage-btn-primary flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer"
              >
                <span>{isUrdu ? `اگلا مرحلہ (${currentStep + 1})` : `Continue to Step ${currentStep + 1}`}</span>
                <ArrowRight className="w-4 h-4 text-[#FEF3C7]" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving || admissionNoStatus.isTaken}
                className={`heritage-btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black shadow-md cursor-pointer ${
                  isSaving || admissionNoStatus.isTaken
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FEF3C7]" />
                    <span>{isUrdu ? 'اندراج جاری ہے...' : 'Registering Student...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#FEF3C7]" />
                    <span>{isUrdu ? 'مکمل کریں اور طالب علم کا اندراج کریں' : 'Complete & Register Student'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
