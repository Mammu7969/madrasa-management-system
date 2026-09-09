import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import { 
  Award, Printer, Upload, Image as ImageIcon, Sliders, 
  Palette, Type, CheckSquare, Square, RefreshCw, Eye, 
  User, Check, ChevronDown, Sparkles, FileText, Move, ZoomIn
} from 'lucide-react';

export const CertificatesModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { showToast } = useTheme();
  const students = db.getStudents(activeMadrasa?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const student = students.find(s => s.id === selectedStudentId) || students[0];

  // Certificate Presets
  const [certType, setCertType] = useState<'sanad_hifz' | 'sanad_alim' | 'nazira' | 'merit' | 'character' | 'id_card' | 'custom'>('sanad_hifz');
  const [customTitle, setCustomTitle] = useState('Certificate of Achievement');
  const [customTitleUrdu, setCustomTitleUrdu] = useState('سند فضیلت و توصیف');

  // Background Studio
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgPreset, setBgPreset] = useState<'gold_ornate' | 'emerald_geometric' | 'classic_parchment' | 'navy_formal' | 'none'>('gold_ornate');
  const [bgOpacity, setBgOpacity] = useState<number>(100);
  const [bgFit, setBgFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // Universal Colors
  const [primaryColor, setPrimaryColor] = useState<string>('#065f46'); // Emerald 800
  const [accentColor, setAccentColor] = useState<string>('#d97706'); // Amber 600
  const [textColor, setTextColor] = useState<string>('#1f2937'); // Gray 800
  const [bgColor, setBgColor] = useState<string>('#fffdf7'); // Warm Ivory
  const [calligraphyFont, setCalligraphyFont] = useState<string>('font-kasheeda');

  // Text Resizing
  const [globalScale, setGlobalScale] = useState<number>(100);
  const [titleSize, setTitleSize] = useState<number>(32);
  const [studentNameSize, setStudentNameSize] = useState<number>(34);
  const [bodyTextSize, setBodyTextSize] = useState<number>(14);

  // Pick & Place / Visible Fields
  const [visibleFields, setVisibleFields] = useState({
    bismillah: true,
    madrasaHeader: true,
    certTitle: true,
    studentPhoto: true,
    studentName: true,
    studentUrduName: true,
    fatherName: true,
    admissionNo: true,
    className: true,
    bodyCitation: true,
    issueDate: true,
    marksGrade: true,
    sealStamp: true,
    signaturePrincipal: true,
    signatureNazim: true,
    signatureTeacher: true,
    customField: false
  });

  // Custom Field
  const [customFieldLabel, setCustomFieldLabel] = useState('Conduct / کردار:');
  const [customFieldValue, setCustomFieldValue] = useState('Mumtaz & Exemplary (با اخلاق و با کردار)');

  // Editable Body Text
  const [bodyText, setBodyText] = useState(
    'This is to officially certify that {student_name}, son of {father_name}, bearing Admission No {admission_no}, has successfully completed the prescribed curriculum with distinction, accurate Tajweed and exemplary Islamic discipline.'
  );

  const [bodyTextUrdu, setBodyTextUrdu] = useState(
    'تصدیق کی جاتی ہے کہ مسمی {student_name_urdu} ولد {father_name_urdu}، داخلہ نمبر {admission_no}، نے جامعہ کے نصاب کے مطابق کلام اللہ کی تعلیم و حسن قرأت بحسن و خوبی مکمل فرمائی ہے۔'
  );

  // Dates
  const [hijriDate, setHijriDate] = useState('18 Safar-ul-Muzaffar 1448 H');
  const [gregorianDate, setGregorianDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [gradeText, setGradeText] = useState('First Division (Mumtaz - 96%)');

  // Toggle field visibility
  const toggleField = (field: keyof typeof visibleFields) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Upload Custom Background Image
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBgImage(reader.result);
        setBgPreset('none');
        showToast('Custom background image imported successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Preset Colors
  const applyPalette = (primary: string, accent: string, text: string, bg: string) => {
    setPrimaryColor(primary);
    setAccentColor(accent);
    setTextColor(text);
    setBgColor(bg);
  };

  // Replace placeholders in citation
  const formattedBodyEn = bodyText
    .replace('{student_name}', student?.studentName || 'Student Name')
    .replace('{father_name}', student?.fatherName || 'Father Name')
    .replace('{admission_no}', student?.admissionNo || 'ADM-001')
    .replace('{class}', student?.class || 'Hifz Class')
    .replace('{madrasa_name}', activeMadrasa?.name || 'Jamia Darul Huda');

  const formattedBodyUrdu = bodyTextUrdu
    .replace('{student_name_urdu}', student?.studentNameUrdu || student?.studentName || 'طالب علم')
    .replace('{father_name_urdu}', student?.fatherName || 'والد کا نام')
    .replace('{admission_no}', student?.admissionNo || 'ADM-001');

  // Certificate Title based on type
  const getCertTitle = () => {
    switch (certType) {
      case 'sanad_hifz':
        return { en: 'SANAD HIFZ-UL-QURAN AL-KAREEM', urdu: 'سند حفظ القرآن الکریم' };
      case 'sanad_alim':
        return { en: 'SANAD FAZILAT & ALIMIYAT', urdu: 'سند عالمیت و فضیلت' };
      case 'nazira':
        return { en: 'NAZIRA QURAN COMPLETION CERTIFICATE', urdu: 'سند تکمیل ناظرہ قرآن و دینیات' };
      case 'merit':
        return { en: 'CERTIFICATE OF MERIT & DISTINCTION', urdu: 'توصیفی سند برائے حسن کارکردگی' };
      case 'character':
        return { en: 'CHARACTER & CONDUCT CERTIFICATE', urdu: 'سند حسن اخلاق و کردار' };
      case 'id_card':
        return { en: 'OFFICIAL STUDENT IDENTITY CARD', urdu: 'شناختی کارڈ طالب علم' };
      default:
        return { en: customTitle, urdu: customTitleUrdu };
    }
  };

  const titleObj = getCertTitle();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs no-print">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Award className="w-5 h-5" />
            </span>
            <span>Professional Certificate & Sanad Designer Studio</span>
            <span className="text-emerald-800 font-urdu urdu-font text-base font-bold">(اسناد و سرٹیفکیٹ اسٹوڈیو)</span>
          </h2>
          <p className="text-xs text-gray-500">
            Import custom backgrounds, pick and place required fields, universal color customization, text resizing, and high-fidelity A4 printing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate (A4)</span>
          </button>
        </div>
      </div>

      {/* DESIGNER TOOLBAR & CONTROLS ACCORDION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* COLUMN 1: Student & Document Selector + Orientation */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>1. Student & Template Format</span>
          </h3>

          {/* Student Selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Select Student (طالب علم):</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-semibold"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.studentName} ({s.admissionNo}) - {s.class}
                </option>
              ))}
            </select>
          </div>

          {/* Certificate Type */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Sanad / Certificate Title:</label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-semibold"
            >
              <option value="sanad_hifz">سند حفظ القرآن الکریم (Hifz-ul-Quran Sanad)</option>
              <option value="sanad_alim">سند فضیلت و عالمیت (Alimiyat Degree)</option>
              <option value="nazira">سند تکمیل ناظرہ و دینیات (Nazira Completion)</option>
              <option value="merit">توصیفی سند برائے حسن کارکردگی (Certificate of Merit)</option>
              <option value="character">سند حسن اخلاق (Character Certificate)</option>
              <option value="id_card">شناختی کارڈ طالب علم (Student ID Card)</option>
              <option value="custom">Custom Certificate (حسب ضرورت عنوان)</option>
            </select>
          </div>

          {/* Custom Titles if custom selected */}
          {certType === 'custom' && (
            <div className="space-y-2 pt-1 border-t">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="English Title (e.g. Tajweed Certificate)"
                className="w-full p-2 text-xs rounded-xl border border-gray-300"
              />
              <input
                type="text"
                value={customTitleUrdu}
                onChange={(e) => setCustomTitleUrdu(e.target.value)}
                placeholder="اردو عنوان"
                className="w-full p-2 text-xs rounded-xl border border-gray-300 font-urdu urdu-font text-right"
              />
            </div>
          )}

          {/* Page Orientation */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Print Orientation (رخ صفحہ):</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  orientation === 'landscape'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Landscape (افقی / A4)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  orientation === 'portrait'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Portrait (عمودی / A4)
              </button>
            </div>
          </div>

          {/* Calligraphy Font */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Urdu Calligraphy Style (خطاطی فونٹ):</label>
            <select
              value={calligraphyFont}
              onChange={(e) => setCalligraphyFont(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-white font-semibold text-emerald-900"
            >
              <option value="font-kasheeda">Jameel Noori Kasheeda (کشیدہ خطاطی - خوبصورت و جلی)</option>
              <option value="font-jameel">Jameel Noori Nastaleeq (جمیل نوری نستعلیق - معیاری)</option>
              <option value="font-quran">Al Qalam Quran Publisher (القلم خطاطی مصحف)</option>
              <option value="font-sameer">AA Sameer Sagar (سمیر ساگر - جلی)</option>
            </select>
          </div>
        </div>

        {/* COLUMN 2: Background Import & Universal Color Customizer */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-700" />
            <span>2. Background Import & Colors</span>
          </h3>

          {/* Background File Upload */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Import Custom Background Image:</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleBgUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image from PC</span>
              </button>
              {bgImage && (
                <button
                  type="button"
                  onClick={() => setBgImage(null)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold"
                  title="Remove uploaded background"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Preset Borders */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Or Choose Ornate Border Preset:</label>
            <select
              value={bgPreset}
              onChange={(e) => {
                setBgPreset(e.target.value as any);
                if (e.target.value !== 'none') setBgImage(null);
              }}
              className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white font-medium"
            >
              <option value="gold_ornate">Royal Golden Arabesque (شاہی سنہری حاشیہ)</option>
              <option value="emerald_geometric">Emerald Mosque Geometric (سبز اسلامی ڈیزائن)</option>
              <option value="classic_parchment">Warm Parchment Double Line (کلاسیک بارڈر)</option>
              <option value="navy_formal">Navy Executive Border (نیوی بلو باوقار بارڈر)</option>
              <option value="none">Custom / No Border Preset</option>
            </select>
          </div>

          {/* Background Adjustments: Opacity & Fit */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-gray-700 mb-1">
                <span>BG Opacity:</span>
                <span>{bgOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Background Fit:</label>
              <select
                value={bgFit}
                onChange={(e) => setBgFit(e.target.value as any)}
                className="w-full p-1.5 text-xs rounded-xl border border-gray-300 bg-white"
              >
                <option value="cover">Cover (پورا پھیلاؤ)</option>
                <option value="contain">Contain (مکمل اندر)</option>
                <option value="fill">Stretch (کھینچ کر برابر)</option>
              </select>
            </div>
          </div>

          {/* Universal Color Pickers */}
          <div className="pt-2 border-t space-y-2">
            <span className="text-[11px] font-bold text-gray-700 block">Universal Theme Colors:</span>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 bg-gray-50">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                />
                <div className="text-[10px]">
                  <span className="font-bold block">Primary Color</span>
                  <span className="font-mono text-gray-500">{primaryColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 bg-gray-50">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                />
                <div className="text-[10px]">
                  <span className="font-bold block">Accent / Gold</span>
                  <span className="font-mono text-gray-500">{accentColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 bg-gray-50">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                />
                <div className="text-[10px]">
                  <span className="font-bold block">Text Color</span>
                  <span className="font-mono text-gray-500">{textColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 bg-gray-50">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                />
                <div className="text-[10px]">
                  <span className="font-bold block">Canvas Tint</span>
                  <span className="font-mono text-gray-500">{bgColor}</span>
                </div>
              </div>
            </div>

            {/* Quick Palettes */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-gray-500">Palettes:</span>
              <button
                type="button"
                onClick={() => applyPalette('#065f46', '#d97706', '#1f2937', '#fffdf7')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300"
              >
                Emerald & Gold
              </button>
              <button
                type="button"
                onClick={() => applyPalette('#1e3a8a', '#b45309', '#1e293b', '#f8fafc')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300"
              >
                Royal Navy
              </button>
              <button
                type="button"
                onClick={() => applyPalette('#881337', '#d97706', '#262626', '#fff1f2')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300"
              >
                Crimson
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Pick & Place Fields + Text Resizing */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-700" />
            <span>3. Pick Fields & Text Resizing</span>
          </h3>

          {/* Text Resizing Sliders */}
          <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs">
            <div className="flex justify-between items-center font-bold">
              <span>Overall Scale:</span>
              <span className="font-mono">{globalScale}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="130"
              value={globalScale}
              onChange={(e) => setGlobalScale(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <label className="block text-gray-600">Title Size:</label>
                <input
                  type="number"
                  min="20"
                  max="48"
                  value={titleSize}
                  onChange={(e) => setTitleSize(Number(e.target.value))}
                  className="w-full p-1 rounded border border-gray-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-600">Name Size:</label>
                <input
                  type="number"
                  min="20"
                  max="54"
                  value={studentNameSize}
                  onChange={(e) => setStudentNameSize(Number(e.target.value))}
                  className="w-full p-1 rounded border border-gray-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-600">Body Size:</label>
                <input
                  type="number"
                  min="11"
                  max="22"
                  value={bodyTextSize}
                  onChange={(e) => setBodyTextSize(Number(e.target.value))}
                  className="w-full p-1 rounded border border-gray-300 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Desired Fields Checkbox List */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
              Include / Exclude Fields (جو جو فیلڈز چاہییں وہی رکھیں):
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {[
                { key: 'bismillah' as const, label: 'بِسْمِ اللَّهِ (Bismillah)' },
                { key: 'madrasaHeader' as const, label: 'Madrasa Header' },
                { key: 'certTitle' as const, label: 'Certificate Title' },
                { key: 'studentPhoto' as const, label: 'Student Photo' },
                { key: 'studentName' as const, label: 'Student Name' },
                { key: 'studentUrduName' as const, label: 'Urdu Name' },
                { key: 'fatherName' as const, label: 'Father Name' },
                { key: 'admissionNo' as const, label: 'Admission / Roll #' },
                { key: 'className' as const, label: 'Class / Grade' },
                { key: 'bodyCitation' as const, label: 'Sanad Citation Text' },
                { key: 'issueDate' as const, label: 'Hijri & Solar Date' },
                { key: 'marksGrade' as const, label: 'Grade / Division' },
                { key: 'sealStamp' as const, label: 'Official Seal Stamp' },
                { key: 'signaturePrincipal' as const, label: 'Principal Signature' },
                { key: 'signatureNazim' as const, label: 'Nazim Signature' },
                { key: 'signatureTeacher' as const, label: 'Teacher Signature' },
                { key: 'customField' as const, label: 'Custom Field' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleField(f.key)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left transition-colors ${
                    visibleFields[f.key]
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {visibleFields[f.key] ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                  <span className="truncate">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE CERTIFICATE CANVAS */}
      <div className="flex justify-center p-4 sm:p-8 bg-gray-200/80 rounded-3xl overflow-x-auto shadow-inner">
        <div
          id="printable-certificate"
          style={{
            backgroundColor: bgColor,
            color: textColor,
            transform: `scale(${globalScale / 100})`,
            transformOrigin: 'top center',
            width: orientation === 'landscape' ? '1050px' : '750px',
            minHeight: orientation === 'landscape' ? '740px' : '1050px',
          }}
          className="relative p-10 sm:p-14 shadow-2xl transition-all print:m-0 print:shadow-none print:w-full print:min-h-screen"
        >
          {/* BACKGROUND LAYER */}
          {bgImage && (
            <div
              className="absolute inset-0 pointer-events-none rounded-none overflow-hidden z-0"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: bgFit,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: bgOpacity / 100
              }}
            />
          )}

          {/* ORNATE PRESET SVG BORDERS */}
          {!bgImage && bgPreset === 'gold_ornate' && (
            <div 
              className="absolute inset-4 pointer-events-none border-4 rounded-xl z-0"
              style={{ borderColor: accentColor, outline: `3px double ${primaryColor}`, outlineOffset: '4px' }}
            >
              {/* Corner Arabesques */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center text-xs font-bold" style={{ borderColor: accentColor, color: accentColor }}>✦</div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center text-xs font-bold" style={{ borderColor: accentColor, color: accentColor }}>✦</div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center text-xs font-bold" style={{ borderColor: accentColor, color: accentColor }}>✦</div>
              <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center text-xs font-bold" style={{ borderColor: accentColor, color: accentColor }}>✦</div>
            </div>
          )}

          {!bgImage && bgPreset === 'emerald_geometric' && (
            <div 
              className="absolute inset-4 pointer-events-none border-8 border-double z-0"
              style={{ borderColor: primaryColor }}
            />
          )}

          {!bgImage && bgPreset === 'classic_parchment' && (
            <div 
              className="absolute inset-5 pointer-events-none border-2 border-dashed z-0"
              style={{ borderColor: accentColor }}
            />
          )}

          {!bgImage && bgPreset === 'navy_formal' && (
            <div 
              className="absolute inset-3 pointer-events-none border-4 border-solid z-0"
              style={{ borderColor: primaryColor }}
            />
          )}

          {/* CERTIFICATE CONTENT CONTAINER */}
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6 text-center">
            {/* 1. TOP HEADER: BISMILLAH & MADRASA */}
            <div className="space-y-3">
              {visibleFields.bismillah && (
                <p 
                  className="font-quran text-2xl sm:text-3xl font-bold tracking-wide"
                  style={{ color: primaryColor }}
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              )}

              {visibleFields.madrasaHeader && (
                <div className="space-y-1">
                  <h1 
                    className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-montserrat"
                    style={{ color: primaryColor }}
                  >
                    {activeMadrasa?.name || 'JAMIA DARUL HUDA ISLAMIC ACADEMY'}
                  </h1>
                  <p 
                    className={`text-2xl sm:text-3xl font-bold ${calligraphyFont}`}
                    style={{ color: accentColor }}
                  >
                    {activeMadrasa?.nameUrdu || 'جامعہ دار الہدیٰ اسلامک اکیڈمی'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeMadrasa?.address || 'Hyderabad, Telangana, India'}
                  </p>
                </div>
              )}

              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="h-px w-24 sm:w-36" style={{ backgroundColor: accentColor }} />
                <span style={{ color: accentColor }}>✦ ✦ ✦</span>
                <div className="h-px w-24 sm:w-36" style={{ backgroundColor: accentColor }} />
              </div>
            </div>

            {/* 2. CERTIFICATE TITLE */}
            {visibleFields.certTitle && (
              <div className="space-y-2">
                <div>
                  <span
                    className={`inline-block px-8 py-2 rounded-full text-white font-bold tracking-wide shadow-xs ${calligraphyFont}`}
                    style={{
                      backgroundColor: primaryColor,
                      fontSize: `${Math.max(18, titleSize - 4)}px`,
                      border: `2px solid ${accentColor}`
                    }}
                  >
                    {titleObj.urdu}
                  </span>
                </div>
                <h2
                  className="font-black uppercase tracking-widest font-montserrat"
                  style={{
                    color: primaryColor,
                    fontSize: `${Math.max(16, titleSize - 8)}px`
                  }}
                >
                  {titleObj.en}
                </h2>
              </div>
            )}

            {/* 3. STUDENT PHOTO & DETAILS */}
            <div className="flex flex-col items-center space-y-4">
              {visibleFields.studentPhoto && student?.photoUrl && (
                <div className="relative">
                  <img
                    src={student.photoUrl}
                    alt={student.studentName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-md border-2"
                    style={{ borderColor: accentColor }}
                  />
                </div>
              )}

              {/* Student Name */}
              {(visibleFields.studentName || visibleFields.studentUrduName) && (
                <div className="space-y-1">
                  {visibleFields.studentName && (
                    <h3
                      className="font-black font-montserrat tracking-wide underline underline-offset-8"
                      style={{
                        color: primaryColor,
                        fontSize: `${studentNameSize}px`,
                        textDecorationColor: accentColor
                      }}
                    >
                      {student?.studentName || 'Student Full Name'}
                    </h3>
                  )}
                  {visibleFields.studentUrduName && (
                    <p
                      className={`font-bold ${calligraphyFont}`}
                      style={{
                        color: accentColor,
                        fontSize: `${Math.max(20, studentNameSize - 4)}px`
                      }}
                    >
                      {student?.studentNameUrdu || student?.studentName}
                    </p>
                  )}
                </div>
              )}

              {/* Meta tags: Father Name, Admission No, Class */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold">
                {visibleFields.fatherName && (
                  <span className="px-3 py-1 bg-black/5 rounded-xl border border-black/10">
                    Father: <strong style={{ color: primaryColor }}>{student?.fatherName}</strong>
                  </span>
                )}
                {visibleFields.admissionNo && (
                  <span className="px-3 py-1 bg-black/5 rounded-xl border border-black/10 font-mono">
                    Roll / Adm No: <strong style={{ color: primaryColor }}>{student?.admissionNo}</strong>
                  </span>
                )}
                {visibleFields.className && (
                  <span className="px-3 py-1 bg-black/5 rounded-xl border border-black/10">
                    Darjah / Class: <strong style={{ color: primaryColor }}>{student?.class}</strong>
                  </span>
                )}
                {visibleFields.marksGrade && (
                  <span className="px-3 py-1 rounded-xl font-bold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                    Grade: {gradeText}
                  </span>
                )}
              </div>

              {/* Custom Field */}
              {visibleFields.customField && (
                <div className="text-xs font-bold px-4 py-1.5 rounded-xl border" style={{ borderColor: accentColor }}>
                  <span className="text-gray-600">{customFieldLabel} </span>
                  <span style={{ color: primaryColor }}>{customFieldValue}</span>
                </div>
              )}
            </div>

            {/* 4. BODY CITATION (Editable) */}
            {visibleFields.bodyCitation && (
              <div className="max-w-2xl mx-auto space-y-2">
                <p 
                  className="leading-relaxed font-serif"
                  style={{ fontSize: `${bodyTextSize}px`, color: textColor }}
                >
                  {formattedBodyEn}
                </p>
                <p 
                  className={`leading-relaxed ${calligraphyFont}`}
                  style={{ fontSize: `${Math.max(16, bodyTextSize + 4)}px`, color: primaryColor }}
                >
                  {formattedBodyUrdu}
                </p>
              </div>
            )}

            {/* 5. FOOTER: DATES, OFFICIAL SEAL, SIGNATURES */}
            <div className="pt-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
              {/* Left: Issue Dates */}
              {visibleFields.issueDate && (
                <div className="text-left space-y-1">
                  <p className="font-mono text-gray-500">Date (Gregorian): <strong>{gregorianDate}</strong></p>
                  <p className={`text-sm font-bold ${calligraphyFont}`} style={{ color: primaryColor }}>
                    تاریخ صدور: {hijriDate}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">Verified by Registry Book #04/26</p>
                </div>
              )}

              {/* Middle: Golden Seal / Stamp */}
              {visibleFields.sealStamp && (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center text-center p-1 shadow-md"
                    style={{ borderColor: accentColor, color: accentColor, backgroundColor: '#ffffff' }}
                  >
                    <Award className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Official Seal</span>
                    <span className="text-[8px] font-bold">JAMIA HUDA</span>
                  </div>
                </div>
              )}

              {/* Right: Signatures */}
              <div className="flex items-center gap-6">
                {visibleFields.signatureTeacher && (
                  <div className="text-center w-28">
                    <div className="w-full h-px bg-black mb-1.5" />
                    <p className="font-bold text-[11px]">Sadr Mudarris</p>
                    <p className={`text-xs ${calligraphyFont}`} style={{ color: primaryColor }}>صدر مدرس</p>
                  </div>
                )}

                {visibleFields.signatureNazim && (
                  <div className="text-center w-28">
                    <div className="w-full h-px bg-black mb-1.5" />
                    <p className="font-bold text-[11px]">Nazim-e-Taleemat</p>
                    <p className={`text-xs ${calligraphyFont}`} style={{ color: primaryColor }}>ناظم تعلیمات</p>
                  </div>
                )}

                {visibleFields.signaturePrincipal && (
                  <div className="text-center w-32">
                    <div className="w-full h-px bg-black mb-1.5" />
                    <p className="font-bold text-[11px]">Principal / Mohtamim</p>
                    <p className={`text-xs ${calligraphyFont}`} style={{ color: primaryColor }}>مہتمم و شیخ الجامعہ</p>
                    <p className="text-[9px] text-gray-500 truncate">{activeMadrasa?.principalName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
