import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileSpreadsheet, Award, Printer, Calendar } from 'lucide-react';

export const ExaminationsModule: React.FC = () => {
  const { activeMadrasa } = useAuth();

  const exams = [
    { id: '1', title: 'Quarterly Tajweed & Hifz Assessment', date: '15 Sep 2026', totalStudents: 45, status: 'Scheduled' },
    { id: '2', title: 'Half-Yearly Dars-e-Nizami Examination', date: '10 Nov 2026', totalStudents: 60, status: 'Upcoming' },
    { id: '3', title: 'Annual Hifz Completion Sanad Examination', date: '20 Jan 2027', totalStudents: 18, status: 'Scheduled' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1">
        <div>
          <h2 className="text-lg font-bold text-m3-on-surface flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-m3-primary" />
            <span>Examinations & Results (امتحانات و نتائج)</span>
          </h2>
          <p className="text-xs text-m3-on-surface-variant">
            Examination timetables, marksheet registers, and Sanad evaluation
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-m3-surface-container text-xs font-bold"
        >
          <Printer className="w-4 h-4 text-m3-primary" />
          <span>Print Schedule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map(exam => (
          <div key={exam.id} className="p-5 bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-m3-primary bg-emerald-50 px-2 py-0.5 rounded-full">
                {exam.date}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {exam.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">{exam.title}</h3>
            <p className="text-xs text-gray-500">Registered Candidates: <strong>{exam.totalStudents}</strong> Talaba</p>
          </div>
        ))}
      </div>
    </div>
  );
};
