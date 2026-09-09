import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { generateDefaultCredentials } from '../../utils/credentialGenerator';
import { compressImage } from '../../utils/imageCompressor';

interface AddAdmissionProps {
  onBackToList: () => void;
  onStudentAdded: (newStudent: Student) => void;
}

export const AddAdmission: React.FC<AddAdmissionProps> = ({
  onBackToList,
  onStudentAdded
}) => {
  const { activeMadrasa } = useAuth();
  const { t, showToast } = useTheme();

  const autoAdmNo = `ADM-2026-00${Math.floor(10 + Math.random() * 90)}`;

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
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="p-2 rounded-full hover:bg-m3-surface-container text-m3-on-surface-variant transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-m3-on-surface flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-m3-primary" />
              <span>{t('addNewAdmission')}</span>
            </h2>
            <p className="text-xs text-m3-on-surface-variant">
              Register a new Talib-e-Ilm with comprehensive biographical, academic, and identity records
            </p>
          </div>
        </div>

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
              <span>Saving Admission...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Admission</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Photo & Essential Identity */}
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5 border-b border-m3-outline-variant/20 pb-2">
            1. Student Photograph & Academic Profile
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Student Photo Upload & Preview */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={photoUrl}
                  alt="Student Preview"
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-m3-primary/30 shadow-m3-2"
                />
                <label className="absolute -bottom-2 -right-2 p-2 rounded-full bg-m3-primary text-white shadow-m3-2 cursor-pointer hover:bg-m3-primary/90 transition-all hover:scale-110">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[11px] font-semibold text-m3-on-surface-variant mt-3">
                Student Profile Photo
              </span>
            </div>

            {/* Core Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Admission No *
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
                  className={`w-full p-2.5 text-xs rounded-xl border bg-white font-mono font-bold transition-all ${
                    admissionNoStatus.isTaken
                      ? 'border-red-500 text-red-600 focus:ring-2 focus:ring-red-200'
                      : 'border-m3-outline-variant/30 text-m3-primary focus:ring-2 focus:ring-m3-primary/30'
                  }`}
                  required
                />
                {admissionNo.trim() && (
                  <div className="mt-1">
                    {admissionNoStatus.isTaken ? (
                      <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                        <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                        <span>Admission No is already taken{admissionNoStatus.takenBy ? ` (${admissionNoStatus.takenBy})` : ''}</span>
                      </p>
                    ) : (
                      !admissionNoStatus.isChecking && (
                        <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Admission No available</span>
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admission Date *
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Date of Birth (تاریخِ پیدائش) *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assigned Class / Department *
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white font-semibold"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Student Name (English) *
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Mohammad Salman Khan"
                  className="w-full p-2.5 text-xs rounded-xl border bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Student Name in Urdu (طالب علم کا نام) *
                </label>
                <input
                  type="text"
                  value={studentNameUrdu}
                  onChange={(e) => setStudentNameUrdu(e.target.value)}
                  placeholder="محمد سلمان خان"
                  className="w-full p-2.5 text-xs rounded-xl border bg-white urdu-font text-right font-semibold"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Family & Guardian Details */}
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5 border-b border-m3-outline-variant/20 pb-2">
            2. Parents, Guardian & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Father Name *
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father's full name"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mother Name
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Mother's name"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Guardian name if different"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Guardian Occupation
              </label>
              <input
                type="text"
                value={guardianOccupation}
                onChange={(e) => setGuardianOccupation(e.target.value)}
                placeholder="e.g. Business, Teacher, Agriculture"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Number (Cell / WhatsApp) *
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 98480 12345"
                className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Aadhar Number (12 Digits) *
              </label>
              <input
                type="text"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                placeholder="XXXX XXXX XXXX"
                className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Residential Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Street, Mohalla, City, State"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Accommodation, Sponsorship & Fees */}
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5 border-b border-m3-outline-variant/20 pb-2">
            3. Accommodation, Sponsorship & Financial Structure
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Hostel / Day Scholar *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border bg-white font-semibold"
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
                value={sponsorship}
                onChange={(e) => setSponsorship(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border bg-white font-semibold"
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
                value={kafeelName}
                onChange={(e) => setKafeelName(e.target.value)}
                placeholder="Kafeel / Donor Name"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Monthly Fees (₹) *
              </label>
              <input
                type="number"
                value={monthlyFees}
                onChange={(e) => setMonthlyFees(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono font-bold"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Previous Education & Document Uploads */}
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5 border-b border-m3-outline-variant/20 pb-2">
            4. Previous Academic Background & Verification Documents
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Previous School/Madrasa Name with Address
              </label>
              <input
                type="text"
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
                placeholder="e.g. Madrasa Islamia, Hyderabad"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Previous Study Status
              </label>
              <input
                type="text"
                value={previousStudy}
                onChange={(e) => setPreviousStudy(e.target.value)}
                placeholder="e.g. Completed 5 Paras Nazira, Passed 4th Class"
                className="w-full p-2.5 text-xs rounded-xl border bg-white"
              />
            </div>
          </div>

          {/* Document Upload Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Previous Study Certificate Upload */}
            <div className="p-4 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-center space-y-2">
              <FileText className="w-8 h-8 text-m3-primary mx-auto" />
              <span className="text-xs font-bold text-gray-800 block">
                {t('uploadCertificate')}
              </span>
              <p className="text-[11px] text-gray-500">
                Upload image of TC, Marksheet, or previous Hifz Sanad
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-xs">
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
                <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-bold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Certificate File Attached</span>
                </div>
              )}
            </div>

            {/* Aadhar Card Upload */}
            <div className="p-4 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto" />
              <span className="text-xs font-bold text-gray-800 block">
                {t('uploadAadhar')}
              </span>
              <p className="text-[11px] text-gray-500">
                Upload scanned photo or copy of government Aadhar card
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-xs">
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
                <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-bold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aadhar File Attached</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Student & Guardian Portal Login Credentials */}
        <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-m3-outline-variant/20 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
                <Key className="w-4 h-4 text-m3-primary" />
                <span>5. Student & Guardian Portal Login Credentials</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Admin / Principal can set or auto-generate login credentials for this student & guardian portal access.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoGenerateCredentials}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Auto-Generate Default Credentials</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
            <span className="font-bold text-amber-950 block text-[11px]">
              Standard Default Formula:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900">
              <div>
                <span className="font-semibold">Username:</span> Name's First 4 Letters + <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">(-)</code> + Year of Admission (e.g., <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-emerald-800">Abdu-2026</code>)
              </div>
              <div>
                <span className="font-semibold">Password:</span> Name's First 4 Letters + <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">(@)</code> + Year of Date of Birth (e.g., <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-emerald-800">Abdu@2015</code>)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Portal Username (لاگ ان نام)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Auto-generated if blank (e.g. Abdu-2026)"
                  className="w-full p-2.5 pr-8 text-xs rounded-xl border bg-white font-mono font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <User className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3" />
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">Used by student/guardian to log into the portal.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Portal Password (پاس ورڈ)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Auto-generated if blank (e.g. Abdu@2015)"
                  className="w-full p-2.5 pr-8 text-xs rounded-xl border bg-white font-mono font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3" />
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">Leave blank to automatically apply the formula password.</span>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 p-4 bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1">
          <button
            type="button"
            onClick={onBackToList}
            className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            {t('cancel')}
          </button>
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
                <span>Saving & Registering...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Register Student</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
