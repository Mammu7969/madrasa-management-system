import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { exportToExcelTable, ExcelColumn } from '../../utils/excelExport';
import { 
  BarChart3, Download, Printer, FileText, Table, Users, 
  TrendingUp, BookOpen, Calendar, Search, Filter, CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

type ReportType = 'finance' | 'students' | 'fees' | 'sabaq' | 'attendance' | 'staff' | 'examinations';

export const ReportsModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { showToast } = useTheme();

  // Selected Report
  const [selectedReport, setSelectedReport] = useState<ReportType>('finance');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');

  // Real Database Records
  const transactions = useMemo(() => db.getFinanceTransactions(activeMadrasa?.id), [activeMadrasa]);
  const students = useMemo(() => db.getStudents(activeMadrasa?.id), [activeMadrasa]);
  const fees = useMemo(() => db.getFees(activeMadrasa?.id), [activeMadrasa]);
  const roznamchah = useMemo(() => db.getRoznamchah(undefined, activeMadrasa?.id), [activeMadrasa]);
  const teachers = useMemo(() => db.getTeachers(activeMadrasa?.id), [activeMadrasa]);
  const classes = useMemo(() => db.getClasses(activeMadrasa?.id), [activeMadrasa]);
  const examinations = useMemo(() => db.getExaminations(activeMadrasa?.id), [activeMadrasa]);

  // Report Definitions
  const reportOptions: { id: ReportType; title: string; titleUrdu: string; desc: string; icon: any }[] = [
    {
      id: 'finance',
      title: 'Income & Expenditures Cashbook Ledger',
      titleUrdu: 'آمدنی و اخراجات کا سرکاری رجسٹر',
      desc: 'Double-entry ledger with S.No, Date, Particular, Category, Subcategory, Receipt No, Income, Expense, Balance',
      icon: TrendingUp
    },
    {
      id: 'students',
      title: 'Student Master Admission Roster',
      titleUrdu: 'جامع رجسٹر طلبہ و کوائف داخلہ',
      desc: 'Comprehensive student directory with Adm No, Urdu Name, Guardian, Class, Hostel/Day, and Monthly Fees',
      icon: Users
    },
    {
      id: 'fees',
      title: 'Fees Collection & Defaulters Statement',
      titleUrdu: 'فیس وصولی و بقایا جات رجسٹر',
      desc: 'Detailed monthly fee audit, collections, concessions, and pending student balances',
      icon: DollarSignIcon
    },
    {
      id: 'sabaq',
      title: 'Hifz Sabaq & Manzil Roznamchah Record',
      titleUrdu: 'روزنامچہ حفظ و دور منزل',
      desc: 'Daily progression audit of student Sabaq, Sabqi, and Manzil revisions',
      icon: BookOpen
    },
    {
      id: 'attendance',
      title: 'Student Attendance & Absenteeism Matrix',
      titleUrdu: 'حاضری و غیر حاضری گوشوارہ',
      desc: 'Annual and monthly presence percentages and leaves matrix',
      icon: Calendar
    },
    {
      id: 'staff',
      title: 'Asatizah & Staff Master Register',
      titleUrdu: 'رجسٹر اساتذہ و ملازمین',
      desc: 'Academic staff, Mudarriseen, designations, contact numbers, and qualifications',
      icon: FileText
    },
    {
      id: 'examinations',
      title: 'Examinations Gazette & Results',
      titleUrdu: 'امتحانی گزٹ و نتائج',
      desc: 'Term examination result statements, student scores, percentages, grades, and merit ranks',
      icon: FileSpreadsheet
    }
  ];

  // 1. FINANCE REPORT DATA & COLUMNS
  const financeColumns: ExcelColumn[] = [
    { header: 'S.No', key: 'sNo', align: 'center' },
    { header: 'Date', key: 'date', align: 'center' },
    { header: 'Particular (تفصیل)', key: 'particular', align: 'left' },
    { header: 'Category (مد)', key: 'category', align: 'left' },
    { header: 'Subcategory (ذیلی مد)', key: 'subcategory', align: 'left' },
    { header: 'Receipt No', key: 'receiptNo', align: 'center' },
    { header: 'Income ₹', key: 'incomeDisplay', align: 'right' },
    { header: 'Expense ₹', key: 'expenseDisplay', align: 'right' },
    { header: 'Balance ₹', key: 'balanceDisplay', align: 'right' }
  ];

  const financeData = useMemo(() => {
    return transactions
      .filter(t => 
        t.particular.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(t => ({
        sNo: t.sNo,
        date: t.date,
        particular: t.particular,
        category: t.category,
        subcategory: t.subcategory || '-',
        receiptNo: t.receiptNo,
        incomeDisplay: t.type === 'Income' ? `₹${t.incomeAmount.toLocaleString()}` : '-',
        expenseDisplay: t.type === 'Expense' ? `₹${t.expenseAmount.toLocaleString()}` : '-',
        balanceDisplay: `₹${t.balance.toLocaleString()}`
      }));
  }, [transactions, searchQuery]);

  const financeTotals = useMemo(() => {
    const totIncome = transactions.reduce((acc, t) => acc + (t.incomeAmount || 0), 0);
    const totExpense = transactions.reduce((acc, t) => acc + (t.expenseAmount || 0), 0);
    const finalBalance = transactions[transactions.length - 1]?.balance || 0;
    return {
      particular: 'NET TOTALS (میزانِ کل)',
      incomeDisplay: `₹${totIncome.toLocaleString()}`,
      expenseDisplay: `₹${totExpense.toLocaleString()}`,
      balanceDisplay: `₹${finalBalance.toLocaleString()}`
    };
  }, [transactions]);

  // 2. STUDENTS ROSTER COLUMNS
  const studentsColumns: ExcelColumn[] = [
    { header: 'S.No', key: 'sNo', align: 'center' },
    { header: 'Adm No', key: 'admissionNo', align: 'center' },
    { header: 'Student Name', key: 'studentName', align: 'left' },
    { header: 'نام طالب علم (اردو)', key: 'studentNameUrdu', align: 'right' },
    { header: 'Father Name', key: 'fatherName', align: 'left' },
    { header: 'Class / Dept', key: 'class', align: 'left' },
    { header: 'Category', key: 'category', align: 'center' },
    { header: 'Sponsorship', key: 'sponsorship', align: 'left' },
    { header: 'Contact', key: 'contactNumber', align: 'center' },
    { header: 'Monthly Fees', key: 'monthlyFeesDisplay', align: 'right' }
  ];

  const studentsData = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch = 
          s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.fatherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = classFilter === 'All' || s.class === classFilter;
        return matchesSearch && matchesClass;
      })
      .map((s, idx) => ({
        sNo: idx + 1,
        admissionNo: s.admissionNo,
        studentName: s.studentName,
        studentNameUrdu: s.studentNameUrdu,
        fatherName: s.fatherName,
        class: s.class,
        category: s.category,
        sponsorship: s.sponsorship,
        contactNumber: s.contactNumber,
        monthlyFeesDisplay: `₹${s.monthlyFees.toLocaleString()}`
      }));
  }, [students, searchQuery, classFilter]);

  const studentsTotals = useMemo(() => {
    const filtered = students.filter(s => classFilter === 'All' || s.class === classFilter);
    const totFees = filtered.reduce((acc, s) => acc + s.monthlyFees, 0);
    return {
      studentName: `Total Students: ${filtered.length}`,
      monthlyFeesDisplay: `₹${totFees.toLocaleString()}`
    };
  }, [students, classFilter]);

  // 3. FEES COLUMNS
  const feesColumns: ExcelColumn[] = [
    { header: 'S.No', key: 'sNo', align: 'center' },
    { header: 'Receipt No', key: 'receiptNo', align: 'center' },
    { header: 'Student Name', key: 'studentName', align: 'left' },
    { header: 'Fee Month', key: 'month', align: 'center' },
    { header: 'Amount ₹', key: 'amountDisplay', align: 'right' },
    { header: 'Payment Date', key: 'date', align: 'center' },
    { header: 'Mode', key: 'mode', align: 'center' },
    { header: 'Status', key: 'status', align: 'center' }
  ];

  const feesData = useMemo(() => {
    return fees
      .filter(f => 
        f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((f, idx) => ({
        sNo: idx + 1,
        receiptNo: f.receiptNo,
        studentName: f.studentName,
        month: f.month,
        amountDisplay: `₹${f.amount.toLocaleString()}`,
        date: f.date,
        mode: f.mode,
        status: f.status
      }));
  }, [fees, searchQuery]);

  const feesTotals = useMemo(() => {
    const tot = fees.reduce((acc, f) => acc + f.amount, 0);
    return {
      studentName: `Total Receipts: ${fees.length}`,
      amountDisplay: `₹${tot.toLocaleString()}`
    };
  }, [fees]);

  // 4. SABAQ ROZNAMCHAH COLUMNS
  const sabaqColumns: ExcelColumn[] = [
    { header: 'S.No', key: 'sNo', align: 'center' },
    { header: 'Date', key: 'date', align: 'center' },
    { header: 'Student Name', key: 'studentName', align: 'left' },
    { header: 'Sabaq (جدید سبق)', key: 'sabaq', align: 'left' },
    { header: 'Sabqi (سبقی)', key: 'sabqi', align: 'left' },
    { header: 'Manzil (منزل)', key: 'manzil', align: 'left' },
    { header: 'Kaifiyat (کیفیت)', key: 'grade', align: 'center' },
    { header: 'Remarks / تاثرات', key: 'remarks', align: 'left' }
  ];

  const sabaqData = useMemo(() => {
    return roznamchah
      .filter(r => {
        const st = students.find(s => s.id === r.studentId);
        const name = st?.studentName || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               r.sabaq.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .map((r, idx) => {
        const st = students.find(s => s.id === r.studentId);
        return {
          sNo: idx + 1,
          date: r.date,
          studentName: st?.studentName || 'Student',
          sabaq: r.sabaq,
          sabqi: r.sabqi || '-',
          manzil: r.manzil || '-',
          grade: r.grade,
          remarks: r.remarks || 'Completed'
        };
      });
  }, [roznamchah, students, searchQuery]);

  // 5. ATTENDANCE COLUMNS
  const attendanceColumns: ExcelColumn[] = [
    { header: 'S.No', key: 'sNo', align: 'center' },
    { header: 'Adm No', key: 'admissionNo', align: 'center' },
    { header: 'Student Name', key: 'studentName', align: 'left' },
    { header: 'Class', key: 'class', align: 'left' },
    { header: 'Total Presents (حاضر)', key: 'presents', align: 'center' },
    { header: 'Total Absents (غیر حاضر)', key: 'absents', align: 'center' },
    { header: 'Attendance %', key: 'percentage', align: 'right' },
    { header: 'Standing Status', key: 'status', align: 'center' }
  ];

  const attendanceData = useMemo(() => {
    return students
      .filter(s => s.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((s, idx) => {
        const total = (s.totalPresentsYearly || 185) + (s.totalAbsentsYearly || 6);
        const pct = Math.round(((s.totalPresentsYearly || 185) / (total || 1)) * 100);
        return {
          sNo: idx + 1,
          admissionNo: s.admissionNo,
          studentName: s.studentName,
          class: s.class,
          presents: s.totalPresentsYearly || 185,
          absents: s.totalAbsentsYearly || 6,
          percentage: `${pct}%`,
          status: pct >= 85 ? 'Satisfactory' : 'Needs Attention'
        };
      });
  }, [students, searchQuery]);

  // 6. STAFF COLUMNS
  const staffColumns: ExcelColumn[] = [
    { header: 'S.No', key: 'sNo', align: 'center' },
    { header: 'Employee ID', key: 'empId', align: 'center' },
    { header: 'Ustadh Name', key: 'name', align: 'left' },
    { header: 'نام استاذ (اردو)', key: 'nameUrdu', align: 'right' },
    { header: 'Designation (عہدہ)', key: 'designation', align: 'left' },
    { header: 'Contact Number', key: 'contact', align: 'center' },
    { header: 'Assigned Class', key: 'assignedClass', align: 'left' },
    { header: 'Monthly Salary ₹', key: 'salaryDisplay', align: 'right' }
  ];

  const staffData = useMemo(() => {
    return teachers
      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((t, idx) => ({
        sNo: idx + 1,
        empId: t.id,
        name: t.name,
        nameUrdu: t.nameUrdu,
        designation: t.designation || 'Ustadh',
        contact: t.phone,
        assignedClass: t.assignedClass,
        salaryDisplay: `₹${(t.salary || 18000).toLocaleString()}`
      }));
  }, [teachers, searchQuery]);

  const staffTotals = useMemo(() => {
    const totSalary = teachers.reduce((acc, t) => acc + (t.salary || 18000), 0);
    return {
      name: `Total Asatizah: ${teachers.length}`,
      salaryDisplay: `₹${totSalary.toLocaleString()}`
    };
  }, [teachers]);

  // 7. EXAMINATIONS COLUMNS
  const examinationsColumns: ExcelColumn[] = [
    { header: 'S.No', key: 'sNo', align: 'center' },
    { header: 'Exam Title', key: 'examTitle', align: 'left' },
    { header: 'Class / Dept', key: 'className', align: 'left' },
    { header: 'Adm No', key: 'admissionNo', align: 'center' },
    { header: 'Student Name', key: 'studentName', align: 'left' },
    { header: 'طالب علم کا نام', key: 'studentNameUrdu', align: 'right' },
    { header: 'Total Marks', key: 'totalMarksDisplay', align: 'center' },
    { header: 'Percentage', key: 'percentageDisplay', align: 'right' },
    { header: 'Grade (درجہ)', key: 'grade', align: 'center' },
    { header: 'Rank / Position', key: 'positionDisplay', align: 'center' }
  ];

  const examinationsData = useMemo(() => {
    const rows: Record<string, any>[] = [];
    examinations.forEach(e => {
      if (classFilter !== 'All' && e.className !== classFilter) return;
      (e.results || []).forEach(r => {
        const matchSearch = !searchQuery.trim() ||
          r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (matchSearch) {
          rows.push({
            sNo: rows.length + 1,
            examTitle: e.title,
            className: e.className,
            admissionNo: r.admissionNo,
            studentName: r.studentName,
            studentNameUrdu: r.studentNameUrdu || r.studentName,
            totalMarksDisplay: `${r.totalObtainedMarks} / ${r.totalMaxMarks}`,
            percentageDisplay: `${r.percentage}%`,
            grade: r.grade,
            positionDisplay: r.position ? `#${r.position}` : '-'
          });
        }
      });
    });
    return rows;
  }, [examinations, classFilter, searchQuery]);

  // Current Active Table Config
  const activeConfig = useMemo(() => {
    switch (selectedReport) {
      case 'finance':
        return {
          columns: financeColumns,
          data: financeData,
          totals: financeTotals,
          filename: `Finance_Report_${new Date().toISOString().split('T')[0]}`,
          title: 'Income & Expenditures Cashbook Ledger (آمدنی و اخراجات کا جامع رجسٹر)'
        };
      case 'students':
        return {
          columns: studentsColumns,
          data: studentsData,
          totals: studentsTotals,
          filename: `Student_Master_Roster_${new Date().toISOString().split('T')[0]}`,
          title: 'Student Master Admission Directory (جامع رجسٹر طلبہ و کوائف داخلہ)'
        };
      case 'fees':
        return {
          columns: feesColumns,
          data: feesData,
          totals: feesTotals,
          filename: `Fees_Collection_Report_${new Date().toISOString().split('T')[0]}`,
          title: 'Fees Collection & Defaulters Statement (فیس وصولی و بقایا جات رجسٹر)'
        };
      case 'sabaq':
        return {
          columns: sabaqColumns,
          data: sabaqData,
          filename: `Hifz_Sabaq_Roznamchah_${new Date().toISOString().split('T')[0]}`,
          title: 'Hifz-ul-Quran Daily Sabaq & Manzil Roznamchah (روزنامچہ حفظ القرآن)'
        };
      case 'attendance':
        return {
          columns: attendanceColumns,
          data: attendanceData,
          filename: `Student_Attendance_Report_${new Date().toISOString().split('T')[0]}`,
          title: 'Student Attendance & Absenteeism Matrix (حاضری و غیر حاضری گوشوارہ)'
        };
      case 'staff':
        return {
          columns: staffColumns,
          data: staffData,
          totals: staffTotals,
          filename: `Asatizah_Staff_Payroll_${new Date().toISOString().split('T')[0]}`,
          title: 'Asatizah & Staff Master Register (رجسٹر اساتذہ و ملازمین)'
        };
      case 'examinations':
        return {
          columns: examinationsColumns,
          data: examinationsData,
          filename: `Examinations_Gazette_${new Date().toISOString().split('T')[0]}`,
          title: 'Examinations Results Gazette Statement (امتحانی گزٹ و نتائج)'
        };
    }
  }, [selectedReport, financeData, studentsData, feesData, sabaqData, attendanceData, staffData, examinationsData]);

  // Trigger Excel Download
  const handleExportExcel = () => {
    exportToExcelTable({
      filename: activeConfig.filename,
      title: activeConfig.title,
      madrasaName: activeMadrasa ? `${activeMadrasa.name} (${activeMadrasa.nameUrdu})` : 'Madrasa Management System',
      metadata: {
        'Financial Year': '2026-2027',
        'Total Rows': activeConfig.data.length,
        'Report Generated': new Date().toLocaleDateString('en-GB')
      },
      columns: activeConfig.columns,
      data: activeConfig.data,
      totals: activeConfig.totals
    });
    showToast('Report exported as neat Excel spreadsheet (.csv) with UTF-8 BOM!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-m3-surface-container p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 no-print">
        <div>
          <h2 className="text-lg font-black text-m3-on-surface flex items-center gap-2">
            <span className="p-2 rounded-xl bg-m3-primary/10 text-m3-primary border border-m3-primary/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span>Institutional Reports & Excel Export Studio</span>
            <span className="text-m3-primary font-urdu urdu-font text-base font-bold">(جامع رپورٹس و گوشوارہ جات)</span>
          </h2>
          <p className="text-xs text-m3-on-surface-variant mt-0.5">
            Preview, export to formatted Excel (.csv), and print neatly arranged tabular statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 text-white text-xs font-bold shadow-m3-1 transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export to Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4 text-m3-primary" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 no-print">
        {reportOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedReport === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedReport(opt.id)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-m3-primary text-white border-m3-primary shadow-m3-2 ring-2 ring-m3-primary/30'
                  : 'bg-white dark:bg-m3-surface-container text-m3-on-surface border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
              }`}
            >
              <div>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-m3-primary/10 text-m3-primary'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold leading-snug">{opt.title}</h4>
              </div>
              <p className={`text-[11px] font-urdu urdu-font mt-2 font-bold ${
                isSelected ? 'text-white/90' : 'text-m3-primary'
              }`}>
                {opt.titleUrdu}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-m3-surface-container p-4 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-m3-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in table rows..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface focus:ring-2 focus:ring-m3-primary/30"
            />
          </div>

          {(selectedReport === 'students' || selectedReport === 'examinations') && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-m3-on-surface-variant font-bold">Class:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-m3-outline-variant/30 bg-white dark:bg-m3-surface-container-high text-m3-on-surface font-semibold"
              >
                <option value="All">All Classes (تمام درجات)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-m3-on-surface-variant font-mono">
          Showing <strong>{activeConfig.data.length}</strong> records in Excel view
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-xl font-black uppercase tracking-wider">{activeMadrasa?.name || 'JAMIA ISLAMIA ARABIA'}</h1>
        <p className="font-urdu text-lg urdu-font font-bold mt-1">{activeMadrasa?.nameUrdu || 'جامعہ اسلامیہ عربیہ'}</p>
        <p className="text-xs text-gray-700 mt-1">{activeMadrasa?.address || 'Department of Examinations & Records'}</p>
        <h2 className="text-sm font-bold uppercase tracking-widest mt-2 border-t border-black pt-1">
          {activeConfig.title}
        </h2>
        <div className="flex justify-between text-[11px] font-mono mt-1 text-gray-600">
          <span>Date Printed: {new Date().toLocaleDateString('en-GB')}</span>
          <span>Academic Year: 2026-2027</span>
          <span>Total Records: {activeConfig.data.length}</span>
        </div>
      </div>

      {/* NEAT EXCEL-STYLE TABLE PREVIEW */}
      <div className="bg-white dark:bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-m3-surface-container-high text-m3-on-surface border-b border-m3-outline-variant/30 font-bold uppercase tracking-wider text-[11px]">
                {activeConfig.columns.map((col, cIdx) => (
                  <th
                    key={cIdx}
                    className={`p-3 border-r border-m3-outline-variant/20 ${
                      col.align === 'center' ? 'text-center' :
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-m3-outline-variant/15 font-normal">
              {activeConfig.data.length === 0 ? (
                <tr>
                  <td colSpan={activeConfig.columns.length} className="p-8 text-center text-m3-on-surface-variant">
                    No matching records found for this query.
                  </td>
                </tr>
              ) : (
                activeConfig.data.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-m3-surface-container-low transition-colors border-b border-m3-outline-variant/15 text-m3-on-surface"
                  >
                    {activeConfig.columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-2.5 border-r border-m3-outline-variant/20 ${
                          col.align === 'center' ? 'text-center' :
                          col.align === 'right' ? 'text-right font-mono font-bold' : 'text-left'
                        }`}
                      >
                        {col.key === 'studentNameUrdu' || col.key === 'nameUrdu' ? (
                          <span className="font-urdu urdu-font font-bold text-m3-primary text-sm">
                            {(row as Record<string, any>)[col.key]}
                          </span>
                        ) : (
                          (row as Record<string, any>)[col.key] ?? '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>

            {/* Totals Summary Row */}
            {activeConfig.totals && (
              <tfoot>
                <tr className="bg-m3-surface-container-high border-t-2 border-m3-outline-variant/40 font-bold text-m3-on-surface">
                  {activeConfig.columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-3 border-r border-m3-outline-variant/30 ${
                        col.align === 'center' ? 'text-center' :
                        col.align === 'right' ? 'text-right font-mono text-xs' : 'text-left text-xs uppercase'
                      }`}
                    >
                      {(activeConfig.totals as Record<string, any>)[col.key] || ''}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Official Signatures for Print */}
      <div className="hidden print:flex justify-between items-end pt-12 text-xs">
        <div className="text-center w-48">
          <div className="w-full h-px bg-black mb-2" />
          <p className="font-bold">Prepared By / مرتب</p>
          <p className="text-[10px] text-gray-600">Office Assistant</p>
        </div>
        <div className="text-center w-48">
          <div className="w-full h-px bg-black mb-2" />
          <p className="font-bold">Verified By / تصدیق کنندہ</p>
          <p className="text-[10px] text-gray-600">Nazim-e-Taleemat</p>
        </div>
        <div className="text-center w-48">
          <div className="w-full h-px bg-black mb-2" />
          <p className="font-bold">Principal / مہتمم صاحب</p>
          <p className="text-[10px] text-gray-600">{activeMadrasa?.principalName}</p>
        </div>
      </div>
    </div>
  );
};

// Helper icon component
const DollarSignIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);
