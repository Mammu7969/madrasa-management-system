import React from 'react';
import { Student, Madrasa } from '../../types';

interface StudentDossierPrintSheetProps {
  student: Student;
  madrasa?: Madrasa | null;
}

export const StudentDossierPrintSheet: React.FC<StudentDossierPrintSheetProps> = ({
  student,
  madrasa
}) => {
  return (
    <div className="hidden print:block font-serif text-black bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] text-xs leading-normal">
      {/* 1. INSTITUTIONAL LETTERHEAD */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center relative">
        <div className="flex items-center justify-between">
          {/* Left: Registration & Code */}
          <div className="text-left font-sans text-[10px] text-slate-700 space-y-0.5">
            <p><span className="font-bold">Reg. Code:</span> {madrasa?.code || 'JDH-01'}</p>
            <p><span className="font-bold">Academic Year:</span> 1447-1448 AH / 2026-2027</p>
            <p><span className="font-bold">Dossier Print Date:</span> {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          {/* Center: Institutional Title */}
          <div className="space-y-1">
            <p className="font-urdu text-base font-bold text-slate-800 leading-none">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <h1 className="text-xl font-black tracking-wider uppercase font-serif text-slate-900 leading-tight">
              {madrasa?.name || 'JAMIA ZIA UL QURAN TRUST'}
            </h1>
            {madrasa?.nameUrdu && (
              <h2 className="font-urdu text-sm font-bold text-slate-800 leading-none">
                {madrasa.nameUrdu}
              </h2>
            )}
            <p className="text-[11px] text-slate-600 font-sans">
              {madrasa?.address || 'Jonnalagadda X Road, Guntur District, Andhra Pradesh'} &bull; Tel: {madrasa?.contactNumber || '+91 98480 12345'}
            </p>
          </div>

          {/* Right: Admission Badge */}
          <div className="text-right font-sans text-[10px] space-y-1">
            <div className="border-2 border-slate-900 px-3 py-1 font-mono font-black text-xs inline-block bg-slate-100">
              {student.admissionNo}
            </div>
            <p className="text-slate-600">Enrolled: {student.admissionDate || '2026-09-01'}</p>
          </div>
        </div>

        <div className="mt-3 py-1 bg-slate-900 text-white font-sans font-bold text-xs uppercase tracking-widest text-center">
          Official Student Academic &amp; Personal Dossier
        </div>
      </div>

      {/* 2. IDENTITY OVERVIEW ROW (Photo + Primary Credentials) */}
      <div className="flex items-start gap-5 mb-6 border border-slate-300 p-4 bg-slate-50/50">
        {/* Photo Box */}
        <div className="w-28 h-36 border-2 border-slate-800 bg-white flex flex-col items-center justify-center shrink-0 p-1 text-center shadow-xs">
          {student.photoUrl ? (
            <img 
              src={student.photoUrl} 
              alt={student.studentName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-[10px] text-slate-400 font-sans">Affix Passport Size Photograph (3x4)</div>
          )}
        </div>

        {/* Primary Identification Table */}
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 font-sans text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Full Name (English)</span>
            <strong className="text-sm text-slate-900 font-serif">{student.studentName}</strong>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">طالب علم کا نام (اردو)</span>
            <strong className="text-sm font-urdu text-slate-900">{student.studentNameUrdu || '—'}</strong>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Father's Name</span>
            <span className="font-semibold text-slate-800">{student.fatherName || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Mother's Name</span>
            <span className="font-semibold text-slate-800">{student.motherName || '—'}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Date of Birth / Age</span>
            <span className="font-mono text-slate-800">{student.dob || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Aadhar / National ID</span>
            <span className="font-mono font-semibold text-slate-800">{student.aadharNumber || 'Verified on Registry'}</span>
          </div>
        </div>
      </div>

      {/* 3. ACADEMIC & INSTITUTIONAL ALLOTMENT */}
      <div className="mb-5">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider bg-slate-200 px-3 py-1 mb-2 border-l-4 border-slate-900">
          Academic Department &amp; Status
        </h3>
        <table className="w-full text-left font-sans text-xs border border-slate-300">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70 w-1/4">Class / Department:</td>
              <td className="p-2 font-bold text-slate-900 w-1/4">{student.class}</td>
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70 w-1/4">Enrolled Section:</td>
              <td className="p-2 font-bold text-slate-900 w-1/4">{student.category === 'Hostel' ? 'Hostel Boarding' : 'Day Scholar'}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Current Sabaq Progress:</td>
              <td className="p-2 font-bold text-slate-900">{student.presentSabaqAt || 'Takhti / Para 1'}</td>
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Institutional Status:</td>
              <td className="p-2 font-bold text-slate-900">{student.isActive !== false ? 'Active & Enrolled' : 'Inactive / On Leave'}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Previous Institution:</td>
              <td className="p-2 text-slate-800">{student.previousSchool || '—'}</td>
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Previous Study Level:</td>
              <td className="p-2 text-slate-800">{student.previousStudy || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. GUARDIAN, RESIDENTIAL & FINANCIAL STRUCTURE */}
      <div className="mb-6">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider bg-slate-200 px-3 py-1 mb-2 border-l-4 border-slate-900">
          Guardian, Contact &amp; Financial Structure
        </h3>
        <table className="w-full text-left font-sans text-xs border border-slate-300">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70 w-1/4">Guardian Name:</td>
              <td className="p-2 font-bold text-slate-900 w-1/4">{student.guardianName || student.fatherName || '—'}</td>
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70 w-1/4">Occupation:</td>
              <td className="p-2 text-slate-800 w-1/4">{student.guardianOccupation || '—'}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Primary Contact Phone:</td>
              <td className="p-2 font-mono font-bold text-slate-900">{student.contactNumber}</td>
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Homeland / Village:</td>
              <td className="p-2 text-slate-800">{student.village || student.address.split(',')[0] || '—'}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Residential Address:</td>
              <td colSpan={3} className="p-2 text-slate-800">{student.address}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Monthly Fee Obligation:</td>
              <td className="p-2 font-mono font-bold text-slate-900">₹ {student.monthlyFees.toLocaleString()}</td>
              <td className="p-2 font-semibold text-slate-600 bg-slate-100/70">Sponsorship Status:</td>
              <td className="p-2 text-slate-800">{student.sponsorship} {student.kafeelName ? `(${student.kafeelName})` : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. VERIFICATION DECLARATION & SIGNATURE BLOCKS */}
      <div className="mt-12 pt-6 border-t border-slate-300">
        <p className="text-[10px] text-slate-600 italic mb-10 text-justify">
          Certified that the above mentioned student particulars have been verified from the original admission records, legal documents, and official madrasa register. Any discrepancy should be reported immediately to the registrar's desk.
        </p>

        <div className="grid grid-cols-3 gap-6 text-center font-sans text-xs">
          <div>
            <div className="border-b border-slate-400 h-10 mb-1"></div>
            <p className="font-bold text-slate-800">Guardian's Signature</p>
            <p className="text-[10px] text-slate-500">دستخط سرپرست</p>
          </div>
          <div>
            <div className="border-b border-slate-400 h-10 mb-1"></div>
            <p className="font-bold text-slate-800">Class Incharge / Ustadh</p>
            <p className="text-[10px] text-slate-500">دستخط استاد محترم</p>
          </div>
          <div>
            <div className="border-b border-slate-400 h-10 mb-1"></div>
            <p className="font-bold text-slate-800">Principal / Muhtamim</p>
            <p className="text-[10px] text-slate-500">دستخط مہتمم صاحب مع مہر</p>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="mt-8 pt-2 border-t border-slate-200 flex justify-between text-[9px] text-slate-400 font-mono">
          <span>Official Madrasa Management ERP System (MMS)</span>
          <span>Authentication Hash: MMS-{student.admissionNo}-{student.id.slice(-6).toUpperCase()}</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};