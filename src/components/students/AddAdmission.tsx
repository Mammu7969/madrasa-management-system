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
  const { t, showToast } = useTheme();

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
  const [className, setClassName] = useState<string>('Hifz Section A');
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToList}
            className="p-2.5 rounded-full hover:bg-m3-surface-container dark:hover:bg-m3-surface-container-high text-m3-on-surface-variant transition-colors"
            title="Back to Students Directory"
          >
            <ArrowLeft className="w-5 h-5 text-m3-on-surface" />
          </button>
          <div>
            <h2 className="text-xl font-black text-m3-on-surface flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-m3-primary" />
              <span>{t('addNewAdmission')}</span>
            </h2>
            <p className="text-xs text-m3-on-surface-variant mt-0.5">
              Enterprise registry onboarding workflow with instant verification and credential generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Toggle View Mode */}
          <button
            type="button"
            onClick={() => setSinglePageMode(!singlePageMode)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container dark:hover:bg-m3-surface-container-high transition-colors"
          >
            {singlePageMode ? (
              <>
                <Layers className="w-3.5 h-3.5 text-m3-primary" />
                <span>Wizard Mode</span>
              </>
            ) : (
              <>
                <LayoutList className="w-3.5 h-3.5 text-m3-primary" />
                <span>All Sections</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSaving || admissionNoStatus.isTaken}
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-xs font-bold shadow-m3-2 transition-all ${
              isSaving || admissionNoStatus.isTaken
                ? 'bg-slate-400 cursor-not-allowed opacity-75'
                : 'bg-m3-primary hover:bg-m3-primary/90 active:scale-95'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Complete Admission</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progressive Step Stepper (Only in Wizard Mode) */}
      {!singlePageMode && (
        <div className="bg-white dark:bg-m3-surface-container p-4 sm:p-5 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
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
                      ? 'bg-m3-primary/10 border-m3-primary/40 text-m3-primary shadow-xs'
                      : isPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50'
                      : 'bg-m3-surface-container-low dark:bg-m3-surface-container-high/30 border-transparent text-m3-on-surface-variant/70 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCurrent
                        ? 'bg-m3-primary text-white'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-m3-surface-container-highest text-m3-on-surface-variant'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold leading-tight truncate">
                      {step.title}
                    </p>
                    <p className="text-[10px] opacity-70 urdu-font leading-tight truncate">
                      {step.titleUrdu}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-m3-surface-container-highest dark:bg-m3-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-m3-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Student Photograph & Personal Identity */}
        {(singlePageMode || currentStep === 1) && (
          <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-m3-outline-variant/20 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>1. Student Photograph & Personal Details (طالب علم کی ذاتی تفصیلات)</span>
              </h3>
              <span className="text-[11px] font-semibold text-m3-on-surface-variant">Step 1 of 5</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Passport Photo Box with 3x4 Guideline Frame */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative group w-32 h-40 rounded-2xl overflow-hidden border-2 border-dashed border-m3-primary/50 dark:border-m3-primary/60 bg-m3-surface-container-low dark:bg-m3-surface-container-high flex flex-col items-center justify-center p-1 shadow-m3-1">
                  <img
                    src={photoUrl}
                    alt="Student Passport Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5 p-2 text-center rounded-xl cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <span className="text-[10px] font-bold">Change 3x4 Photo</span>
                  </div>
                  <label className="absolute inset-0 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-bold text-m3-on-surface block">
                    Passport Size Photo (3x4)
                  </span>
                  <span className="text-[10px] text-m3-on-surface-variant">
                    JPG/PNG auto-compressed
                  </span>
                </div>
              </div>

              {/* Core Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-bold text-m3-on-surface mb-1">
                    Student Full Name (English) *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Mohammad Salman Khan"
                    className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-medium focus:ring-2 focus:ring-m3-primary/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-m3-on-surface mb-1">
                    Student Name in Urdu (طالب علم کا نام)
                  </label>
                  <input
                    type="text"
                    value={studentNameUrdu}
                    onChange={(e) => setStudentNameUrdu(e.target.value)}
                    placeholder="محمد سلمان خان"
                    className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface urdu-font text-right font-semibold focus:ring-2 focus:ring-m3-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-m3-on-surface mb-1">
                    Date of Birth (تاریخِ پیدائش) *
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono focus:ring-2 focus:ring-m3-primary/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-m3-on-surface mb-1">
                    Student Aadhar Number (12 Digits)
                  </label>
                  <input
                    type="text"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono focus:ring-2 focus:ring-m3-primary/30"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Guardian & Contact Information */}
        {(singlePageMode || currentStep === 2) && (
          <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-m3-outline-variant/20 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>2. Parents, Guardian & Contact Information (سرپرست و پتہ)</span>
              </h3>
              <span className="text-[11px] font-semibold text-m3-on-surface-variant">Step 2 of 5</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Father Name *
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father's full name"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface focus:ring-2 focus:ring-m3-primary/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Mother Name
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Mother's name"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface focus:ring-2 focus:ring-m3-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Guardian Name
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Leave empty if father"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface focus:ring-2 focus:ring-m3-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Guardian Occupation
                </label>
                <input
                  type="text"
                  value={guardianOccupation}
                  onChange={(e) => setGuardianOccupation(e.target.value)}
                  placeholder="e.g. Business, Agriculture, Trade"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface focus:ring-2 focus:ring-m3-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Primary Mobile / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98480 12345"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono focus:ring-2 focus:ring-m3-primary/30"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Permanent Residential Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Street, Mohalla, City / District, State, PIN"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface focus:ring-2 focus:ring-m3-primary/30"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Academic & Madrasa Class */}
        {(singlePageMode || currentStep === 3) && (
          <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-m3-outline-variant/20 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>3. Academic & Madrasa Assignment (تعلیمی و جماعت درجہ)</span>
              </h3>
              <span className="text-[11px] font-semibold text-m3-on-surface-variant">Step 3 of 5</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-m3-on-surface">
                    Admission Number *
                  </label>
                  {admissionNoStatus.isChecking && (
                    <span className="text-[10px] text-blue-600 flex items-center gap-1 font-medium">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Checking...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border font-mono font-bold transition-all bg-white dark:bg-m3-surface-container-high ${
                    admissionNoStatus.isTaken
                      ? 'border-red-500 text-red-600 focus:ring-2 focus:ring-red-200'
                      : 'border-m3-outline-variant/30 text-m3-primary focus:ring-2 focus:ring-m3-primary/30'
                  }`}
                  required
                />
                {admissionNo.trim() && (
                  <div className="mt-1">
                    {admissionNoStatus.isTaken ? (
                      <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800/40">
                        <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                        <span>Admission No is already taken{admissionNoStatus.takenBy ? ` (${admissionNoStatus.takenBy})` : ''}</span>
                      </p>
                    ) : (
                      !admissionNoStatus.isChecking && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Admission No is available</span>
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Admission Date *
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Enrolled Class / Department *
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
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

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Previous School / Madrasa Name
                </label>
                <input
                  type="text"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  placeholder="e.g. Madrasa Islamia, Hyderabad"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Previous Study Status (سابقہ تعلیم)
                </label>
                <input
                  type="text"
                  value={previousStudy}
                  onChange={(e) => setPreviousStudy(e.target.value)}
                  placeholder="e.g. Completed 5 Paras Nazira, Passed 4th Class"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Fees & Sponsorship */}
        {(singlePageMode || currentStep === 4) && (
          <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-m3-outline-variant/20 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>4. Accommodation, Sponsorship & Fees (اقامت، کفالت و فیس)</span>
              </h3>
              <span className="text-[11px] font-semibold text-m3-on-surface-variant">Step 4 of 5</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Hostel / Day Scholar *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
                >
                  <option value="Hostel">Hostel (اقامتی)</option>
                  <option value="Day Scholar">Day Scholar (غیر اقامتی)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Sponsorship Category *
                </label>
                <select
                  value={sponsorship}
                  onChange={(e) => setSponsorship(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
                >
                  <option value="Self-Sponsored">Self-Sponsored</option>
                  <option value="Discounted">Discounted</option>
                  <option value="Non-Sponsored">Non-Sponsored</option>
                  <option value="Sponsored by">Sponsored by (Kafeel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Kafeel / Sponsor Name (if applicable)
                </label>
                <input
                  type="text"
                  value={kafeelName}
                  onChange={(e) => setKafeelName(e.target.value)}
                  placeholder="Kafeel / Donor Name"
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-m3-on-surface mb-1">
                  Monthly Fees (₹) *
                </label>
                <input
                  type="number"
                  value={monthlyFees}
                  onChange={(e) => setMonthlyFees(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono font-bold"
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
            <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
              <div className="flex items-center justify-between border-b border-m3-outline-variant/20 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>5. Verification Documents (دستاویزات کی تصدیق)</span>
                </h3>
                <span className="text-[11px] font-semibold text-m3-on-surface-variant">Step 5 of 5</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Certificate */}
                <div className="p-4 rounded-2xl bg-m3-surface-container-low dark:bg-m3-surface-container-high/40 border border-m3-outline-variant/30 text-center space-y-2">
                  <FileText className="w-8 h-8 text-m3-primary mx-auto" />
                  <span className="text-xs font-bold text-m3-on-surface block">
                    {t('uploadCertificate')}
                  </span>
                  <p className="text-[11px] text-m3-on-surface-variant">
                    Previous TC, Marksheet, or Hifz Sanad scan
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-high cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-m3-primary" />
                    <span>{certificateUrl ? 'Replace Certificate' : 'Browse Certificate'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleCertificateUpload}
                      className="hidden"
                    />
                  </label>
                  {certificateUrl && (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Certificate Attached</span>
                    </div>
                  )}
                </div>

                {/* Aadhar */}
                <div className="p-4 rounded-2xl bg-m3-surface-container-low dark:bg-m3-surface-container-high/40 border border-m3-outline-variant/30 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto" />
                  <span className="text-xs font-bold text-m3-on-surface block">
                    {t('uploadAadhar')}
                  </span>
                  <p className="text-[11px] text-m3-on-surface-variant">
                    Scanned photo or copy of government Aadhar card
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-high cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>{aadharCardUrl ? 'Replace Aadhar' : 'Browse Aadhar'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleAadharUpload}
                      className="hidden"
                    />
                  </label>
                  {aadharCardUrl && (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aadhar Card Attached</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Portal Credentials */}
            <div className="bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-m3-outline-variant/20 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
                    <Key className="w-4 h-4 text-m3-primary" />
                    <span>Portal Credentials (طلبہ و سرپرست لاگ ان)</span>
                  </h3>
                  <p className="text-[11px] text-m3-on-surface-variant mt-0.5">
                    Generate instant portal access login credentials for student & guardian
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateCredentials}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto border border-amber-300/40 dark:border-amber-700/40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Auto-Generate Default Credentials</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-800/40 text-xs space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-300 block text-[11px]">
                  Standard Institutional Formula:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-800 dark:text-amber-400">
                  <div>
                    <span className="font-semibold">Username:</span> Name's First 4 Letters + <code className="bg-white/80 dark:bg-black/30 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950 dark:text-amber-200">(-)</code> + Admission Year (e.g. <code className="bg-white/80 dark:bg-black/30 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-700 dark:text-emerald-400">Abdu-2026</code>)
                  </div>
                  <div>
                    <span className="font-semibold">Password:</span> Name's First 4 Letters + <code className="bg-white/80 dark:bg-black/30 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950 dark:text-amber-200">(@)</code> + Birth Year (e.g. <code className="bg-white/80 dark:bg-black/30 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-700 dark:text-emerald-400">Abdu@2015</code>)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-m3-on-surface mb-1">
                    Portal Username (لاگ ان نام)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Auto-generated if blank (e.g. Abdu-2026)"
                      className="w-full p-2.5 pr-8 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono font-bold focus:ring-2 focus:ring-amber-500/30"
                    />
                    <User className="w-3.5 h-3.5 text-m3-on-surface-variant absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-m3-on-surface mb-1">
                    Portal Password (پاس ورڈ)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Auto-generated if blank (e.g. Abdu@2015)"
                      className="w-full p-2.5 pr-8 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-mono font-bold focus:ring-2 focus:ring-amber-500/30"
                    />
                    <Lock className="w-3.5 h-3.5 text-m3-on-surface-variant absolute right-3 top-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Bottom Navigation Bar */}
        <div className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-1">
          <div>
            {!singlePageMode && currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-high rounded-2xl transition-colors border border-m3-outline-variant/30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onBackToList}
                className="px-5 py-2.5 text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container-high rounded-2xl transition-colors"
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 text-white text-xs font-bold shadow-m3-2 transition-all active:scale-95"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving || admissionNoStatus.isTaken}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-white text-xs font-black shadow-m3-2 transition-all ${
                  isSaving || admissionNoStatus.isTaken
                    ? 'bg-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-m3-primary hover:bg-m3-primary/90 active:scale-95'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Student...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Complete & Register Student</span>
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
