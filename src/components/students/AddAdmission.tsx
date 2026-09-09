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
  ShieldCheck
} from 'lucide-react';

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
  
  // Image and Document States
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=400&q=80');
  const [certificateUrl, setCertificateUrl] = useState<string>('');
  const [aadharCardUrl, setAadharCardUrl] = useState<string>('');

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Certificate File Upload
  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificateUrl(reader.result as string);
        showToast('Previous Study Certificate uploaded!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Aadhar File Upload
  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadharCardUrl(reader.result as string);
        showToast('Aadhar Card scanned image uploaded!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !activeMadrasa) return;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      admissionNo: admissionNo.trim(),
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
      dob: '2015-01-01',
      password: 'password123'
    };

    db.addStudent(newStudent);
    showToast(`New Admission for ${newStudent.studentName} (${newStudent.admissionNo}) saved successfully!`, 'success');
    onStudentAdded(newStudent);
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
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 text-white text-xs font-bold shadow-m3-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Admission</span>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admission No *
                </label>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white font-mono font-bold text-m3-primary"
                  required
                />
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

              <div className="sm:col-span-2">
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
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 text-white text-xs font-black shadow-m3-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save & Register Student</span>
          </button>
        </div>
      </form>
    </div>
  );
};
