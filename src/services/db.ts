import { 
  Madrasa, Student, Teacher, AttendanceRecord, RoznamchahRecord, 
  FeeTransaction, MadrasaNamazTimings, ScheduleItem, UserLog, 
  FeedbackItem, ProfileChangeRequest, NoticeItem, GalleryItem,
  MadrasaClass, Subject, Staff, StudentUpdateLog,
  FinanceTransaction, FinanceCategoryItem, PeriodScheduleItem
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  MADRASAS: 'mms_madrasas_v1',
  STUDENTS: 'mms_students_v1',
  STUDENT_LOGS: 'mms_student_logs_v1',
  TEACHERS: 'mms_teachers_v1',
  STAFF: 'mms_staff_v1',
  CLASSES: 'mms_classes_v1',
  SUBJECTS: 'mms_subjects_v1',
  ATTENDANCE: 'mms_attendance_v1',
  ROZNAMCHAH: 'mms_roznamchah_v1',
  FEES: 'mms_fees_v1',
  FINANCE_TRANSACTIONS: 'mms_finance_transactions_v1',
  FINANCE_CATEGORIES: 'mms_finance_categories_v1',
  PERIOD_SCHEDULE: 'mms_period_schedule_v1',
  NAMAZ: 'mms_namaz_v1',
  SCHEDULE: 'mms_schedule_v1',
  USER_LOGS: 'mms_user_logs_v1',
  FEEDBACKS: 'mms_feedbacks_v1',
  PROFILE_REQUESTS: 'mms_profile_requests_v1',
  NOTICES: 'mms_notices_v1',
  GALLERY: 'mms_gallery_v1',
  SUPER_ADMIN_CREDS: 'mms_super_admin_creds_v1',
};

// Default Seed Data
const initialMadrasas: Madrasa[] = [
  {
    id: 'madrasa-1',
    name: 'Jamia Darul Huda Islamic Academy',
    nameUrdu: 'جامعہ دار الہدیٰ اسلامک اکیڈمی',
    code: 'JDH-01',
    address: 'Mehdipatnam, Hyderabad, Telangana, India',
    principalName: 'Maulana Abdul Qadeer Qasmi',
    contactNumber: '+91 98480 22334',
    subscriptionStart: '2026-01-01',
    subscriptionEnd: '2027-01-01',
    isSubscriptionActive: true,
    cloudSyncEnabled: true,
    admins: [
      { id: 'adm-1-1', slot: 'Admin-1', username: 'principal.jdh', password: 'password123', isActive: true },
      { id: 'adm-1-2', slot: 'Admin-2', username: 'accountant.jdh', password: 'password123', isActive: true },
      { id: 'adm-1-3', slot: 'Admin-3', username: 'nazim.jdh', password: 'password123', isActive: false },
      { id: 'adm-1-4', slot: 'Admin-4', username: 'admin4.jdh', password: 'password123', isActive: false },
      { id: 'adm-1-5', slot: 'Admin-5', username: 'admin5.jdh', password: 'password123', isActive: false },
    ]
  },
  {
    id: 'madrasa-2',
    name: 'Madrasa Anwar-ul-Uloom',
    nameUrdu: 'مدرسہ انوار العلوم',
    code: 'MAU-02',
    address: 'Charminar Heritage Zone, Hyderabad, Telangana',
    principalName: 'Maulana Mohammad Siddiq Nadwi',
    contactNumber: '+91 97001 55442',
    subscriptionStart: '2026-02-15',
    subscriptionEnd: '2027-02-15',
    isSubscriptionActive: true,
    cloudSyncEnabled: true,
    admins: [
      { id: 'adm-2-1', slot: 'Admin-1', username: 'principal.mau', password: 'password123', isActive: true },
      { id: 'adm-2-2', slot: 'Admin-2', username: 'clerk.mau', password: 'password123', isActive: true },
      { id: 'adm-2-3', slot: 'Admin-3', username: 'admin3.mau', password: 'password123', isActive: false },
      { id: 'adm-2-4', slot: 'Admin-4', username: 'admin4.mau', password: 'password123', isActive: false },
      { id: 'adm-2-5', slot: 'Admin-5', username: 'admin5.mau', password: 'password123', isActive: false },
    ]
  },
  {
    id: 'madrasa-3',
    name: 'Madrasa Faiz-e-Aam',
    nameUrdu: 'مدرسہ فیضِ عام',
    code: 'MFA-03',
    address: 'Nizamabad Old Town, Telangana',
    principalName: 'Maulana Mufti Tariq Jameel Qureshi',
    contactNumber: '+91 94401 88990',
    subscriptionStart: '2025-01-01',
    subscriptionEnd: '2026-01-01', // Expired for testing subscription alerts!
    isSubscriptionActive: false,
    cloudSyncEnabled: false,
    admins: [
      { id: 'adm-3-1', slot: 'Admin-1', username: 'principal.mfa', password: 'password123', isActive: true },
      { id: 'adm-3-2', slot: 'Admin-2', username: 'admin2.mfa', password: 'password123', isActive: false },
      { id: 'adm-3-3', slot: 'Admin-3', username: 'admin3.mfa', password: 'password123', isActive: false },
      { id: 'adm-3-4', slot: 'Admin-4', username: 'admin4.mfa', password: 'password123', isActive: false },
      { id: 'adm-3-5', slot: 'Admin-5', username: 'admin5.mfa', password: 'password123', isActive: false },
    ]
  },
  {
    id: 'madrasa-4',
    name: 'Madrasa Kashiful Uloom',
    nameUrdu: 'مدرسہ کاشف العلوم',
    code: 'MKU-04',
    address: 'Santoshnagar, Hyderabad, Telangana',
    principalName: 'Maulana Hafiz Zubair Ahmad',
    contactNumber: '+91 98855 11223',
    subscriptionStart: '2026-04-01',
    subscriptionEnd: '2027-04-01',
    isSubscriptionActive: true,
    cloudSyncEnabled: true,
    admins: [
      { id: 'adm-4-1', slot: 'Admin-1', username: 'principal.mku', password: 'password123', isActive: true },
      { id: 'adm-4-2', slot: 'Admin-2', username: 'admin2.mku', password: 'password123', isActive: true },
      { id: 'adm-4-3', slot: 'Admin-3', username: 'admin3.mku', password: 'password123', isActive: false },
      { id: 'adm-4-4', slot: 'Admin-4', username: 'admin4.mku', password: 'password123', isActive: false },
      { id: 'adm-4-5', slot: 'Admin-5', username: 'admin5.mku', password: 'password123', isActive: false },
    ]
  }
];

const initialStudents: Student[] = [
  {
    id: 'std-1',
    admissionNo: 'ADM-2026-001',
    admissionDate: '2026-01-10',
    studentName: 'Mohammad Zayd Khan',
    studentNameUrdu: 'محمد زید خان',
    fatherName: 'Tariq Khan',
    motherName: 'Amina Begum',
    guardianName: 'Tariq Khan',
    guardianOccupation: 'Business Owner',
    contactNumber: '+91 98490 11223',
    address: 'H.No 12-2-417, Asif Nagar, Hyderabad',
    category: 'Hostel',
    sponsorship: 'Self-Sponsored',
    kafeelName: 'Self (Tariq Khan)',
    monthlyFees: 2500,
    previousSchool: 'Modern Islamic High School, Hyderabad',
    previousStudy: 'Passed 4th Standard & Completed Noorani Qaidah',
    previousStudyCertificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    aadharCardUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    aadharNumber: '7845 9012 3456',
    photoUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=400&q=80',
    class: 'Hifz Section A',
    madrasaId: 'madrasa-1',
    totalPresentsYearly: 215,
    totalPresentsMonthly: 24,
    totalAbsentsYearly: 3,
    totalAbsentsMonthly: 0,
    presentSabaqAt: 'Para 14 (Surah Al-Hijr, Ruku 2)',
    username: 'Moha-2026',
    password: 'Moha@2014',
    dob: '2014-05-12'
  },
  {
    id: 'std-2',
    admissionNo: 'ADM-2026-002',
    admissionDate: '2026-01-15',
    studentName: 'Abdullah Mansoor',
    studentNameUrdu: 'عبد اللہ منصور',
    fatherName: 'Mansoor Ali',
    motherName: 'Fatima Zohra',
    guardianName: 'Mansoor Ali',
    guardianOccupation: 'Government Teacher',
    contactNumber: '+91 99887 76655',
    address: 'Tolichowki, Hyderabad',
    category: 'Day Scholar',
    sponsorship: 'Discounted',
    kafeelName: 'Al-Khair Welfare Trust',
    monthlyFees: 1500,
    previousSchool: 'Al-Huda Model School, Nizamabad',
    previousStudy: 'Completed 5 Paras Nazira',
    previousStudyCertificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    aadharCardUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    aadharNumber: '9081 2345 6789',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    class: 'Hifz Section A',
    madrasaId: 'madrasa-1',
    totalPresentsYearly: 210,
    totalPresentsMonthly: 23,
    totalAbsentsYearly: 7,
    totalAbsentsMonthly: 1,
    presentSabaqAt: 'Para 11 (Surah Yunus, Ruku 4)',
    username: 'Abdu-2026',
    password: 'Abdu@2013',
    dob: '2013-08-20'
  },
  {
    id: 'std-3',
    admissionNo: 'ADM-2026-003',
    admissionDate: '2026-02-01',
    studentName: 'Ibrahim Farooqi',
    studentNameUrdu: 'ابراہیم فاروقی',
    fatherName: 'Umar Farooqi',
    motherName: 'Siddiqa Begum',
    guardianName: 'Umar Farooqi',
    guardianOccupation: 'Tailor',
    contactNumber: '+91 97112 33445',
    address: 'Shaheen Nagar, Hyderabad',
    category: 'Hostel',
    sponsorship: 'Sponsored by',
    kafeelName: 'Haji Abdul Sattar Sahab (Dubai)',
    monthlyFees: 0,
    previousSchool: 'Madrasa Taleem-ul-Quran',
    previousStudy: 'Amma Para Nazira with Tajweed',
    aadharNumber: '6123 4567 8901',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    class: 'Nazira Class 1',
    madrasaId: 'madrasa-1',
    totalPresentsYearly: 218,
    totalPresentsMonthly: 24,
    totalAbsentsYearly: 0,
    totalAbsentsMonthly: 0,
    presentSabaqAt: 'Para 4 (Al Imran, Ayat 92)',
    username: 'Ibra-2026',
    password: 'Ibra@2015',
    dob: '2015-11-04'
  },
  {
    id: 'std-4',
    admissionNo: 'ADM-2026-004',
    admissionDate: '2026-02-10',
    studentName: 'Salman Shareef',
    studentNameUrdu: 'سلمان شریف',
    fatherName: 'Abdul Shareef',
    motherName: 'Rashida Begum',
    guardianName: 'Abdul Shareef',
    guardianOccupation: 'Electrician',
    contactNumber: '+91 94411 22334',
    address: 'Malakpet, Hyderabad',
    category: 'Day Scholar',
    sponsorship: 'Self-Sponsored',
    monthlyFees: 2000,
    previousSchool: 'Government Primary School',
    previousStudy: '3rd Standard',
    aadharNumber: '4455 6677 8899',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    class: 'Hifz Section B',
    madrasaId: 'madrasa-1',
    totalPresentsYearly: 160,
    totalPresentsMonthly: 12,
    totalAbsentsYearly: 35, // High absent for "Most Absent" list
    totalAbsentsMonthly: 10,
    presentSabaqAt: 'Para 2 (Al-Baqarah, Ayat 183)',
    username: 'Salm-2026',
    password: 'Salm@2014',
    dob: '2014-02-18'
  },
  {
    id: 'std-5',
    admissionNo: 'ADM-2026-005',
    admissionDate: '2026-02-20',
    studentName: 'Zubair Qureshi',
    studentNameUrdu: 'زبیر قریشی',
    fatherName: 'Khalid Qureshi',
    motherName: 'Shabana Khatoon',
    guardianName: 'Khalid Qureshi',
    guardianOccupation: 'Trader',
    contactNumber: '+91 98877 66554',
    address: 'Mallepally, Hyderabad',
    category: 'Hostel',
    sponsorship: 'Self-Sponsored',
    monthlyFees: 2500,
    previousSchool: 'Faizan High School',
    previousStudy: 'Passed 5th Class',
    aadharNumber: '3322 1144 5566',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    class: 'Alimiyat Year 1',
    madrasaId: 'madrasa-1',
    totalPresentsYearly: 218,
    totalPresentsMonthly: 24, // 100% attendance
    totalAbsentsYearly: 0,
    totalAbsentsMonthly: 0,
    presentSabaqAt: 'Hidayat-un-Nahw & Qasas-un-Nabiyyeen',
    username: 'Zuba-2026',
    password: 'Zuba@2012',
    dob: '2012-04-25'
  }
];

const initialTeachers: Teacher[] = [
  {
    id: 'tch-1',
    teacherIdNo: 'TCH-001',
    name: 'Qari Mohammad Huzaifa',
    nameUrdu: 'قاری محمد حذیفہ',
    assignedClass: 'Hifz Section A',
    phone: '+91 98765 00111',
    qualification: 'Fazil Deoband, Qirat Hafs & Sab’ah',
    madrasaId: 'madrasa-1',
    username: 'Qari-2022',
    password: 'Qari@1988',
    joiningDate: '2022-01-10',
    dob: '1988-06-15',
    isPresentToday: true
  },
  {
    id: 'tch-2',
    teacherIdNo: 'TCH-002',
    name: 'Maulana Bilal Ahmad Nadwi',
    nameUrdu: 'مولانا بلال احمد ندوی',
    assignedClass: 'Alimiyat Year 1',
    phone: '+91 98765 00222',
    qualification: 'Alimiyat Nadwatul Ulama, M.A Arabic',
    madrasaId: 'madrasa-1',
    username: 'Maul-2023',
    password: 'Maul@1991',
    joiningDate: '2023-03-01',
    dob: '1991-09-20',
    isPresentToday: true
  },
  {
    id: 'tch-3',
    teacherIdNo: 'TCH-003',
    name: 'Hafiz Saeed-ur-Rahman',
    nameUrdu: 'حافظ سعید الرحمن',
    assignedClass: 'Nazira Class 1',
    phone: '+91 98765 00333',
    qualification: 'Hafiz-e-Quran & Tajweed Specialist',
    madrasaId: 'madrasa-1',
    username: 'Hafi-2024',
    password: 'Hafi@1993',
    joiningDate: '2024-05-15',
    dob: '1993-11-10',
    isPresentToday: true
  },
  {
    id: 'tch-4',
    teacherIdNo: 'TCH-004',
    name: 'Qari Rizwanullah',
    nameUrdu: 'قاری رضوان اللہ',
    assignedClass: 'Hifz Section B',
    phone: '+91 98765 00444',
    qualification: 'Fazil-e-Dars-e-Nizami',
    madrasaId: 'madrasa-1',
    username: 'Qari-2025',
    password: 'Qari@1994',
    joiningDate: '2025-02-01',
    dob: '1994-08-14',
    isPresentToday: false // 1 absent teacher for statistics!
  }
];

const initialStaff: Staff[] = [
  {
    id: 'stf-1',
    staffIdNo: 'STF-001',
    name: 'Abdul Rasheed',
    nameUrdu: 'عبد الرشید',
    role: 'Head Chef (Bawarchi)',
    roleUrdu: 'باورچی و ناظم مطبخ',
    department: 'Kitchen & Dining',
    departmentUrdu: 'شعبہ مطبخ و طعام',
    phone: '+91 98480 55111',
    salary: 16000,
    status: 'Active',
    joiningDate: '2023-04-15',
    madrasaId: 'madrasa-1',
    notes: 'Responsible for daily meals for 150+ resident students and faculty.'
  },
  {
    id: 'stf-2',
    staffIdNo: 'STF-002',
    name: 'Mohammad Farooq',
    nameUrdu: 'محمد فاروق',
    role: 'Hostel Warden (Nazim-e-Darul Iqamah)',
    roleUrdu: 'ناظم دار الاقامہ',
    department: 'Hostel Administration',
    departmentUrdu: 'انتظامیہ دار الاقامہ',
    phone: '+91 98480 55222',
    salary: 18500,
    status: 'Active',
    joiningDate: '2022-06-10',
    madrasaId: 'madrasa-1',
    notes: 'In charge of hostel discipline, room allocations, and student safety.'
  },
  {
    id: 'stf-3',
    staffIdNo: 'STF-003',
    name: 'Syed Khaja',
    nameUrdu: 'سید خواجہ',
    role: 'Campus Security Incharge',
    roleUrdu: 'نگراں سیکیورٹی و حفاظت',
    department: 'Security & Facilities',
    departmentUrdu: 'شعبہ حفاظت و سیکیورٹی',
    phone: '+91 98480 55333',
    salary: 14000,
    status: 'Active',
    joiningDate: '2024-01-05',
    madrasaId: 'madrasa-1',
    notes: 'Main gate entry log, night patrol, visitor registration.'
  },
  {
    id: 'stf-4',
    staffIdNo: 'STF-004',
    name: 'Sheikh Munir',
    nameUrdu: 'شیخ منیر',
    role: 'Accountant & Office Clerk',
    roleUrdu: 'محاسب و دفتر کلرک',
    department: 'Accounts Office',
    departmentUrdu: 'شعبہ حسابات و امورِ دفتر',
    phone: '+91 98480 55444',
    salary: 20000,
    status: 'Active',
    joiningDate: '2021-08-01',
    madrasaId: 'madrasa-1',
    notes: 'Manages ledger receipts, utility bills, and staff records.'
  },
  {
    id: 'stf-5',
    staffIdNo: 'STF-005',
    name: 'Hafiz Noorullah',
    nameUrdu: 'حافظ نور اللہ',
    role: 'Maintenance & Facilities Caretaker',
    roleUrdu: 'نگراں تعمیرات و صفائی',
    department: 'Maintenance',
    departmentUrdu: 'دیکھ بھال و صفائی',
    phone: '+91 98480 55555',
    salary: 15000,
    status: 'Active',
    joiningDate: '2023-11-20',
    madrasaId: 'madrasa-1',
    notes: 'Campus water filtration, electricity maintenance, and cleanliness.'
  }
];

const initialClasses: MadrasaClass[] = [
  { 
    id: 'cls-1', 
    name: 'Hifz Section A', 
    nameUrdu: 'شعبہ حفظ (الف)', 
    category: 'Tahfeez (حفظ)', 
    incharge: 'Qari Mohammad Huzaifa', 
    startTime: '08:00 AM',
    endTime: '01:30 PM',
    room: 'Hall A-1', 
    capacity: 35, 
    madrasaId: 'madrasa-1',
    description: 'Primary Quran memorization with Tajweed and daily Sabqi revision'
  },
  { 
    id: 'cls-2', 
    name: 'Hifz Section B', 
    nameUrdu: 'شعبہ حفظ (ب)', 
    category: 'Tahfeez (حفظ)', 
    incharge: 'Qari Rizwanullah', 
    startTime: '08:00 AM',
    endTime: '01:30 PM',
    room: 'Hall A-2', 
    capacity: 30, 
    madrasaId: 'madrasa-1',
    description: 'Advanced Hifz section for students memorizing Juz 15 to 30'
  },
  { 
    id: 'cls-3', 
    name: 'Nazira Class 1', 
    nameUrdu: 'شعبہ ناظرہ اول', 
    category: 'Quran Recitation (ناظرہ)', 
    incharge: 'Hafiz Saeed-ur-Rahman', 
    startTime: '08:30 AM',
    endTime: '12:30 PM',
    room: 'Room B-1', 
    capacity: 40, 
    madrasaId: 'madrasa-1',
    description: 'Fluent Quranic recitation with Makharij, Tajweed rules and Tarteel'
  },
  { 
    id: 'cls-4', 
    name: 'Alimiyat Year 1', 
    nameUrdu: 'عالمیت سال اول', 
    category: 'Dars-e-Nizami (درس نظامی)', 
    incharge: 'Maulana Bilal Ahmad Nadwi', 
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    room: 'Room C-1', 
    capacity: 25, 
    madrasaId: 'madrasa-1',
    description: 'Classical Arabic grammar (Nahw/Sarf), Fiqh basics, and Hadith studies'
  },
  { 
    id: 'cls-5', 
    name: 'Noorani Qaida Group', 
    nameUrdu: 'نورانی قاعدہ جماعت', 
    category: 'Noorani Qaida (قاعدہ)', 
    incharge: 'Qari Hifzur Rahman', 
    startTime: '04:00 PM',
    endTime: '06:30 PM',
    room: 'Room B-2', 
    capacity: 30, 
    madrasaId: 'madrasa-1',
    description: 'Foundational Arabic alphabet articulation and phonetics for beginners'
  }
];

const initialSubjects: Subject[] = [
  {
    id: 'sbj-1',
    name: 'Holy Quran',
    nameUrdu: 'القرآن الکریم',
    bookName: 'Mushaf Al-Madinah (30 Paras)',
    bookNameUrdu: 'مصحف مدینہ منورہ (۳۰ پارے)',
    className: 'Hifz Section A',
    totalPages: 604, // 30 Paras / 604 pages
    teacherName: 'Qari Mohammad Huzaifa',
    category: 'Quran Memorization',
    author: 'King Fahd Complex Madinah',
    madrasaId: 'madrasa-1',
    description: 'Complete 30 Paras of the Holy Quran for memorization, Sabqi and Amookhta'
  },
  {
    id: 'sbj-2',
    name: 'Noorani Qaidah',
    nameUrdu: 'نورانی قاعدہ',
    bookName: 'Noorani Qaidah with Tajweed Rules',
    bookNameUrdu: 'نورانی قاعدہ مع تجوید',
    className: 'Noorani Qaida Group',
    totalPages: 32,
    teacherName: 'Qari Hifzur Rahman',
    category: 'Tajweed & Phonetics',
    author: 'Maulana Noor Muhammad Haqqani',
    madrasaId: 'madrasa-1',
    description: 'Foundational Arabic phonetics, Makharij, Harkat, and Tanween rules'
  },
  {
    id: 'sbj-3',
    name: 'Nazira Quran',
    nameUrdu: 'ناظرہ قرآن کریم',
    bookName: 'Mushaf Tajweed Al-Quran',
    bookNameUrdu: 'مصحف تجوید و ترتیل',
    className: 'Nazira Class 1',
    totalPages: 604,
    teacherName: 'Hafiz Saeed-ur-Rahman',
    category: 'Quran Recitation',
    author: 'King Fahd Complex Madinah',
    madrasaId: 'madrasa-1',
    description: 'Fluent reading of the Quran with Tajweed rules and correct Makharij'
  },
  {
    id: 'sbj-4',
    name: 'Hidayat-un-Nahw',
    nameUrdu: 'ہدایۃ النحو',
    bookName: 'Hidayat-un-Nahw (Arabic Grammar)',
    bookNameUrdu: 'ہدایۃ النحو فی علم النحو',
    className: 'Alimiyat Year 1',
    totalPages: 160,
    teacherName: 'Maulana Bilal Ahmad Nadwi',
    category: 'Arabic Syntax & Grammar',
    author: 'Allama Siraj-ud-Din Chishti',
    madrasaId: 'madrasa-1',
    description: 'Classical Arabic syntax, declensions, and sentence structures'
  },
  {
    id: 'sbj-5',
    name: 'Al-Fiqh Al-Muyassar',
    nameUrdu: 'الفقہ المیسر',
    bookName: 'Al-Fiqh Al-Muyassar (Hanafi Jurisprudence)',
    bookNameUrdu: 'الفقہ المیسر فی الفقہ الحنفی',
    className: 'Alimiyat Year 1',
    totalPages: 240,
    teacherName: 'Maulana Bilal Ahmad Nadwi',
    category: 'Islamic Jurisprudence',
    author: 'Maulana Shafiq-ur-Rahman Nadwi',
    madrasaId: 'madrasa-1',
    description: 'Foundational Islamic jurisprudence regarding Taharah, Salah, Sawm, and Zakah'
  },
  {
    id: 'sbj-6',
    name: 'Qasas-un-Nabiyyeen',
    nameUrdu: 'قصص النبیین',
    bookName: 'Qasas-un-Nabiyyeen Lil-Atfal (Parts 1-4)',
    bookNameUrdu: 'قصص النبیین للأطفال',
    className: 'Alimiyat Year 1',
    totalPages: 195,
    teacherName: 'Maulana Bilal Ahmad Nadwi',
    category: 'Arabic Literature',
    author: 'Sayyid Abul Hasan Ali Nadwi',
    madrasaId: 'madrasa-1',
    description: 'Stories of the Prophets in simple and eloquent classical Arabic prose'
  }
];

const initialNamaz: MadrasaNamazTimings = {
  fajr: { azan: '05:00 AM', jamat: '05:30 AM' },
  zohr: { azan: '01:00 PM', jamat: '01:30 PM' },
  asar: { azan: '04:45 PM', jamat: '05:10 PM' },
  magrib: { azan: '06:35 PM', jamat: '06:40 PM' },
  isha: { azan: '08:00 PM', jamat: '08:30 PM' }
};

const initialSchedule: ScheduleItem[] = [
  { id: 'sch-1', time: '04:30 AM', title: 'Tahajjud & Wake Up', titleUrdu: 'بیداری و نمازِ تہجد', description: 'Students wake up, perform Wudhu & Tahajjud prayers', category: 'Prayer' },
  { id: 'sch-2', time: '05:00 AM - 05:45 AM', title: 'Fajr Prayer & Azkar', titleUrdu: 'نمازِ فجر و مسنون اذکار', description: 'Congregational prayer followed by morning Masnoon Adhkar', category: 'Prayer' },
  { id: 'sch-3', time: '05:45 AM - 07:45 AM', title: 'Morning Sabaq Session (Dars)', titleUrdu: 'صبح کا سبق (حفظ و ناظرہ)', description: 'Primary Sabaq memorization and listening with Ustadh', category: 'Academic' },
  { id: 'sch-4', time: '07:45 AM - 08:30 AM', title: 'Breakfast & Rest', titleUrdu: 'ناشتہ و آرام', description: 'Nutritious breakfast served in dining hall', category: 'Meals' },
  { id: 'sch-5', time: '08:30 AM - 12:30 PM', title: 'Academic Session 1', titleUrdu: 'تعلیمی اوقات (دورِ اول)', description: 'Quran Nazira, Tajweed, Arabic Grammar, Urdu & English classes', category: 'Academic' },
  { id: 'sch-6', time: '12:30 PM - 02:00 PM', title: 'Zohr Prayer, Lunch & Qailulah', titleUrdu: 'نمازِ ظہر، طعام و قیلولہ', description: 'Zohr Jamat, afternoon meal, and Islamic sunnah midday nap', category: 'Rest' },
  { id: 'sch-7', time: '02:00 PM - 04:30 PM', title: 'Academic Session 2 (Sabqi Revision)', titleUrdu: 'تعلیمی اوقات (سبقی دور)', description: 'Recitation of recent memory lessons (Sabqi) in class', category: 'Academic' },
  { id: 'sch-8', time: '04:45 PM - 05:30 PM', title: 'Asar Prayer & Physical Exercise', titleUrdu: 'نمازِ عصر و کھیل کود', description: 'Congregational Asar and outdoor sports on campus ground', category: 'Sports' },
  { id: 'sch-9', time: '06:35 PM - 07:15 PM', title: 'Magrib Prayer & Dars-e-Hadith', titleUrdu: 'نمازِ مغرب و درسِ حدیث', description: 'Magrib in congregation followed by brief Riyad-us-Saliheen lesson', category: 'Prayer' },
  { id: 'sch-10', time: '07:15 PM - 08:00 PM', title: 'Dinner Time', titleUrdu: 'کھانا (رات کا طعام)', description: 'Evening dinner in dining hall', category: 'Meals' },
  { id: 'sch-11', time: '08:00 PM - 09:30 PM', title: 'Isha Prayer & Night Dour (Manzil)', titleUrdu: 'نمازِ عشاء و دورِ منزل', description: 'Isha Jamat and recitation of complete Manzil revision', category: 'Academic' },
  { id: 'sch-12', time: '10:00 PM', title: 'Lights Out / Sleep', titleUrdu: 'خواب گاہ و استراحت', description: 'Sunnah sleeping etiquette, silence across hostels', category: 'Rest' },
];

const initialFinanceCategories: FinanceCategoryItem[] = [
  {
    id: 'fcat-1',
    name: 'Chanda & Atiyaat (Donations)',
    nameUrdu: 'چندہ و عمومی عطیات',
    type: 'Income',
    subcategories: ['Aam Chanda (عمومی چندہ)', 'Sadqaat-e-Jariyah (صدقات جاریہ)', 'Building Construction Fund (تعمیراتی فنڈ)', 'Qurbani Hides (کھالیں قربانی)', 'Overseas / NRI Aid (بیرونی امداد)']
  },
  {
    id: 'fcat-2',
    name: 'Zakat & Fitrah',
    nameUrdu: 'زکوٰۃ و فطرہ فنڈ',
    type: 'Income',
    subcategories: ['Zakat for Orphan & Poor Talaba (زکوٰۃ برائے مستحق طلبہ)', 'Fitrah Collection (صدقۃ الفطر)', 'Kaffarah & Nazoor (کفارات و نذور)']
  },
  {
    id: 'fcat-3',
    name: 'Mahana Taleemi & Hostel Fees',
    nameUrdu: 'ماہانہ تعلیمی و ہاسٹل فیس',
    type: 'Income',
    subcategories: ['Monthly Education Fee (ماہانہ فیس)', 'Hostel & Food Charges (خوراک و رہائش فیس)', 'Admission & Reg Fee (داخلہ فیس)', 'Exam & Books Fee (امتحان و درسی کتب فیس)']
  },
  {
    id: 'fcat-4',
    name: 'Rent & Waqf Revenue',
    nameUrdu: 'کرایہ و آمدنی اوقاف',
    type: 'Income',
    subcategories: ['Madrasa Commercial Shops Rent (دکانات کا کرایہ)', 'Auditorium / Hall Booking (ہال کرایہ)', 'Agricultural Farm Yield (زرعی آمدنی)']
  },
  {
    id: 'fcat-5',
    name: 'Salaries & Honorariums',
    nameUrdu: 'مشاہرہ اساتذہ و ملازمین',
    type: 'Expense',
    subcategories: ['Asatizah-e-Kiram Salary (تنخواہ اساتذہ)', 'Nazim-e-Taleemat Allowance (مشاہرہ ناظم)', 'Hafiz & Qari Sahab Honorarium (مشاہرہ حفاظ و قراء)', 'Imam & Muazzin (مشاہرہ امام و مؤذن)', 'Kitchen Staff & Bawarchi (تنخواہ باورچی)', 'Khadim & Sanitation Staff (تنخواہ خادم و صفائی عملہ)']
  },
  {
    id: 'fcat-6',
    name: 'Kitchen & Ration Provisions',
    nameUrdu: 'راشن، اناج و مطبخ خرچ',
    type: 'Expense',
    subcategories: ['Atta & Wheat Flour (آٹا و گندم)', 'Rice & Pulses (چاول و دالیں)', 'Cooking Oil & Pure Ghee (کوکنگ آئل و گھی)', 'Fresh Meat, Chicken & Fish (گوشت و مرغی)', 'Vegetables & Spices (سبزی و مصالحہ جات)', 'Milk, Tea & Breakfast (دودھ، چائے و ناشتہ)', 'LPG Commercial Cylinders (گیس سلنڈر)']
  },
  {
    id: 'fcat-7',
    name: 'Utilities & Running Bills',
    nameUrdu: 'یوٹیلیٹی و بجلی پانی بلز',
    type: 'Expense',
    subcategories: ['Electricity / Power Bill (بجلی کا بل)', 'Water Supply & Motor Service (پانی و موٹر مرمت)', 'Internet, Landline & CCTV (انٹرنیٹ و کیمرہ جات)', 'Sanitation & Disinfectant Supplies (صفائی مٹیریل)']
  },
  {
    id: 'fcat-8',
    name: 'Building Maintenance & Repairs',
    nameUrdu: 'مرمت عمارت و رنگ و روغن',
    type: 'Expense',
    subcategories: ['Hostel Rooms Repair (مرمت دار الاقامہ)', 'Whitewash & Paint Works (رنگ و روغن)', 'Electrical & Plumbing Works (بجلی و پلمبنگ)', 'Carpets, Mats & Sound System (صفیں و ساؤنڈ سسٹم)']
  },
  {
    id: 'fcat-9',
    name: 'Printing, Books & Stationery',
    nameUrdu: 'طباعت، کتب و امتحانی کاغذات',
    type: 'Expense',
    subcategories: ['Examination Question Papers (پرچہ جات امتحان)', 'Registers, Vouchers & Sanad Cards (رجسٹرز و اسناد)', 'Darsi & Taleemi Kitaben (درسی و معاون کتب)', 'Office Stationery & Printing (دفتری اسٹیشنری)']
  },
  {
    id: 'fcat-10',
    name: 'Medical & Student Welfare',
    nameUrdu: 'علاج و معالجہ و امداد طلبہ',
    type: 'Expense',
    subcategories: ['Emergency First Aid Medicine (ادویات فرسٹ ایڈ)', 'Doctor Consultation Fees (ڈاکٹر معائنہ و فیس)', 'Student Spectacles / Eye Care (نظر چشمے و نگہداشت)', 'Hospitalization Expenses (ہسپتال علاج)']
  },
  {
    id: 'fcat-11',
    name: 'Jalsaat, Events & Hospitality',
    nameUrdu: 'تقریبات، جلسہ جات و ضیافت',
    type: 'Expense',
    subcategories: ['Annual Dastarbeedi Jalsah (سالانہ جلسہ دستاربندی)', 'Seerat-un-Nabi Programs (پروگرام سیرت النبیﷺ)', 'Tafheem & Hifz Competitions (مسابقات قرآنی)', 'Hospitality for Guest Scholars (ضیافت مہمان علماء)']
  },
  {
    id: 'fcat-12',
    name: 'Miscellaneous / Mutafarriq',
    nameUrdu: 'متفرق اخراجات و ہنگامی',
    type: 'Both',
    subcategories: ['Administrative Travel & Petrol (دفتری سفر و پیٹرول)', 'Bank Charges & Audit Fee (بینک چارجز و آڈٹ)', 'Emergency Contingency (ہنگامی اخراجات)']
  }
];

const initialFinanceTransactions: FinanceTransaction[] = [
  {
    id: 'ftx-1',
    sNo: 1,
    date: '2026-08-01',
    particular: 'Opening Cash Balance B/F',
    category: 'Miscellaneous / Mutafarriq',
    subcategory: 'Opening Balance',
    receiptNo: 'OB-2026-01',
    type: 'Income',
    incomeAmount: 125000,
    expenseAmount: 0,
    balance: 125000,
    paymentMode: 'Cash',
    madrasaId: 'madrasa-1',
    notes: 'Financial year opening cash balance in treasury'
  },
  {
    id: 'ftx-2',
    sNo: 2,
    date: '2026-08-05',
    particular: 'Monthly Fees Collection - August Batch 1',
    category: 'Mahana Taleemi & Hostel Fees',
    subcategory: 'Monthly Education Fee (ماہانہ فیس)',
    receiptNo: 'RCP-2026-081',
    type: 'Income',
    incomeAmount: 34500,
    expenseAmount: 0,
    balance: 159500,
    paymentMode: 'Cash',
    madrasaId: 'madrasa-1',
    notes: 'Collected from Nazira and Hifz students'
  },
  {
    id: 'ftx-3',
    sNo: 3,
    date: '2026-08-07',
    particular: 'Atiyaat & Sadqaat Donation from Haji Abdul Sattar (Dubai)',
    category: 'Chanda & Atiyaat (Donations)',
    subcategory: 'Sadqaat-e-Jariyah (صدقات جاریہ)',
    receiptNo: 'RCP-2026-082',
    type: 'Income',
    incomeAmount: 50000,
    expenseAmount: 0,
    balance: 209500,
    paymentMode: 'Bank Transfer',
    madrasaId: 'madrasa-1',
    notes: 'Direct wire transfer to Madrasa HDFC Account'
  },
  {
    id: 'ftx-4',
    sNo: 4,
    date: '2026-08-10',
    particular: 'Asatizah-e-Kiram & Khadimeen Monthly Salaries',
    category: 'Salaries & Honorariums',
    subcategory: 'Asatizah-e-Kiram Salary (تنخواہ اساتذہ)',
    receiptNo: 'EXP-2026-041',
    type: 'Expense',
    incomeAmount: 0,
    expenseAmount: 52000,
    balance: 157500,
    paymentMode: 'Bank Transfer',
    madrasaId: 'madrasa-1',
    notes: 'Disbursed to 4 senior Asatizah and 2 Huffaz'
  },
  {
    id: 'ftx-5',
    sNo: 5,
    date: '2026-08-12',
    particular: 'Monthly Hostel Ration, Rice (500kg), Atta (400kg) & Pulses',
    category: 'Kitchen & Ration Provisions',
    subcategory: 'Rice & Pulses (چاول و دالیں)',
    receiptNo: 'EXP-2026-042',
    type: 'Expense',
    incomeAmount: 0,
    expenseAmount: 26800,
    balance: 130700,
    paymentMode: 'Cash',
    madrasaId: 'madrasa-1',
    notes: 'Purchased wholesale from Begum Bazaar grains depot'
  },
  {
    id: 'ftx-6',
    sNo: 6,
    date: '2026-08-15',
    particular: 'Zakat Fund from Haji Farooq Builders for Mustahiq Huffaz',
    category: 'Zakat & Fitrah',
    subcategory: 'Zakat for Orphan & Poor Talaba (زکوٰۃ برائے مستحق طلبہ)',
    receiptNo: 'RCP-2026-083',
    type: 'Income',
    incomeAmount: 40000,
    expenseAmount: 0,
    balance: 170700,
    paymentMode: 'Cheque',
    madrasaId: 'madrasa-1',
    notes: 'Cheque No. 448201 cleared in State Bank of India'
  },
  {
    id: 'ftx-7',
    sNo: 7,
    date: '2026-08-18',
    particular: 'TSSPDCL Electricity Power Bill for Academic & Hostel Blocks',
    category: 'Utilities & Running Bills',
    subcategory: 'Electricity / Power Bill (بجلی کا بل)',
    receiptNo: 'EXP-2026-043',
    type: 'Expense',
    incomeAmount: 0,
    expenseAmount: 6420,
    balance: 164280,
    paymentMode: 'UPI / Online',
    madrasaId: 'madrasa-1',
    notes: 'Paid online via PhonePe business portal'
  },
  {
    id: 'ftx-8',
    sNo: 8,
    date: '2026-08-22',
    particular: 'Madrasa Waqf Commercial Shops Monthly Rental Income',
    category: 'Rent & Waqf Revenue',
    subcategory: 'Madrasa Commercial Shops Rent (دکانات کا کرایہ)',
    receiptNo: 'RCP-2026-084',
    type: 'Income',
    incomeAmount: 18000,
    expenseAmount: 0,
    balance: 182280,
    paymentMode: 'Cash',
    madrasaId: 'madrasa-1',
    notes: 'Rent collected from 3 complex roadside shops'
  },
  {
    id: 'ftx-9',
    sNo: 9,
    date: '2026-08-25',
    particular: 'Printing Quarterly Exam Papers, Marksheets & Darsi Books',
    category: 'Printing, Books & Stationery',
    subcategory: 'Examination Question Papers (پرچہ جات امتحان)',
    receiptNo: 'EXP-2026-044',
    type: 'Expense',
    incomeAmount: 0,
    expenseAmount: 4850,
    balance: 177430,
    paymentMode: 'Cash',
    madrasaId: 'madrasa-1',
    notes: 'Al-Huda Offset Printing Press, Charminar'
  },
  {
    id: 'ftx-10',
    sNo: 10,
    date: '2026-08-28',
    particular: 'Water Motor Pump Repair & Plumbing in Darul Iqamah Wudhu Khana',
    category: 'Building Maintenance & Repairs',
    subcategory: 'Electrical & Plumbing Works (بجلی و پلمبنگ)',
    receiptNo: 'EXP-2026-045',
    type: 'Expense',
    incomeAmount: 0,
    expenseAmount: 3200,
    balance: 174230,
    paymentMode: 'Cash',
    madrasaId: 'madrasa-1',
    notes: 'Replaced submersible starter and pipeline brass valves'
  },
  {
    id: 'ftx-11',
    sNo: 11,
    date: '2026-09-02',
    particular: 'Monthly Fees Collection - September Batch 1',
    category: 'Mahana Taleemi & Hostel Fees',
    subcategory: 'Monthly Education Fee (ماہانہ فیس)',
    receiptNo: 'RCP-2026-091',
    type: 'Income',
    incomeAmount: 22000,
    expenseAmount: 0,
    balance: 196230,
    paymentMode: 'Cash',
    madrasaId: 'madrasa-1',
    notes: 'Collected by Accountant Office'
  },
  {
    id: 'ftx-12',
    sNo: 12,
    date: '2026-09-04',
    particular: 'LPG Commercial 19kg Cooking Gas Refill (3 Cylinders)',
    category: 'Kitchen & Ration Provisions',
    subcategory: 'LPG Commercial Cylinders (گیس سلنڈر)',
    receiptNo: 'EXP-2026-046',
    type: 'Expense',
    incomeAmount: 0,
    expenseAmount: 5850,
    balance: 190380,
    paymentMode: 'UPI / Online',
    madrasaId: 'madrasa-1',
    notes: 'HP Gas Agency delivery to Madrasa kitchen'
  }
];

const initialPeriodSchedule: PeriodScheduleItem[] = [
  { id: 'ps-1', classId: 'cls-1', className: 'Hifz-ul-Quran (Section A)', day: 'Monday', periodNumber: 1, time: '05:45 AM - 07:30 AM', subject: 'Sabaq (Daily Memorization)', teacher: 'Qari Mohammad Rizwan', room: 'Hall A' },
  { id: 'ps-2', classId: 'cls-1', className: 'Hifz-ul-Quran (Section A)', day: 'Monday', periodNumber: 2, time: '08:30 AM - 10:30 AM', subject: 'Sabqi (Recent Memorization)', teacher: 'Qari Mohammad Rizwan', room: 'Hall A' },
  { id: 'ps-3', classId: 'cls-1', className: 'Hifz-ul-Quran (Section A)', day: 'Monday', periodNumber: 3, time: '10:45 AM - 12:30 PM', subject: 'Tajweed & Makharij Rules', teacher: 'Maulana Hafiz Zubair', room: 'Room 101' },
  { id: 'ps-4', classId: 'cls-1', className: 'Hifz-ul-Quran (Section A)', day: 'Monday', periodNumber: 4, time: '02:00 PM - 04:15 PM', subject: 'Dour / Manzil Revision', teacher: 'Qari Mohammad Rizwan', room: 'Hall A' },
  { id: 'ps-5', classId: 'cls-1', className: 'Hifz-ul-Quran (Section A)', day: 'Monday', periodNumber: 5, time: '08:00 PM - 09:30 PM', subject: 'Night Recitation & Listening', teacher: 'Maulana Hafiz Zubair', room: 'Hall A' },
  { id: 'ps-6', classId: 'cls-2', className: 'Nazira Quran & Tajweed', day: 'Monday', periodNumber: 1, time: '08:30 AM - 09:45 AM', subject: 'Noorani Qaida & Tajweed', teacher: 'Maulana Mohammad Siddiq', room: 'Room 102' },
  { id: 'ps-7', classId: 'cls-2', className: 'Nazira Quran & Tajweed', day: 'Monday', periodNumber: 2, time: '10:00 AM - 11:15 AM', subject: 'Para 30 Recitation', teacher: 'Maulana Mohammad Siddiq', room: 'Room 102' },
  { id: 'ps-8', classId: 'cls-2', className: 'Nazira Quran & Tajweed', day: 'Monday', periodNumber: 3, time: '11:30 AM - 12:30 PM', subject: 'Deeniyat & Masnoon Duas', teacher: 'Maulana Mohammad Siddiq', room: 'Room 102' },
  { id: 'ps-9', classId: 'cls-3', className: 'Alimiyat (Year 1)', day: 'Monday', periodNumber: 1, time: '08:30 AM - 09:30 AM', subject: 'Sarfe-Mir (Arabic Morphology)', teacher: 'Maulana Abdul Qadeer', room: 'Room 201' },
  { id: 'ps-10', classId: 'cls-3', className: 'Alimiyat (Year 1)', day: 'Monday', periodNumber: 2, time: '09:30 AM - 10:30 AM', subject: 'Nahw-e-Meer (Arabic Syntax)', teacher: 'Maulana Abdul Qadeer', room: 'Room 201' },
  { id: 'ps-11', classId: 'cls-3', className: 'Alimiyat (Year 1)', day: 'Monday', periodNumber: 3, time: '10:45 AM - 11:45 AM', subject: 'Tareeqat-ul-Asriyyah', teacher: 'Maulana Mohammad Siddiq', room: 'Room 201' },
  { id: 'ps-12', classId: 'cls-3', className: 'Alimiyat (Year 1)', day: 'Monday', periodNumber: 4, time: '11:45 AM - 12:45 PM', subject: 'Qasas-un-Nabiyeen', teacher: 'Maulana Abdul Qadeer', room: 'Room 201' },
];

const initialUserLogs: UserLog[] = [
  { id: 'log-1', username: 'superadmin', role: 'Super Admin', viewedData: 'Madrasa Subscriptions & Audit Logs', submittedData: 'Renewed Jamia Darul Huda License for 1 Year', dateTime: '2026-09-04 10:15 AM', reportsAndFeedback: 'None' },
  { id: 'log-2', username: 'principal.jdh', role: 'Admin / Principal', madrasaId: 'madrasa-1', viewedData: 'Fees Ledger & Attendance Matrix', submittedData: 'Approved Admission ADM-2026-005', dateTime: '2026-09-04 11:30 AM', reportsAndFeedback: 'Requested new sports equipment' },
  { id: 'log-3', username: 'TCH-001', role: 'Teacher', madrasaId: 'madrasa-1', viewedData: 'Hifz Section A Student Register', submittedData: 'Submitted Morning Attendance (24 Present, 1 Absent)', dateTime: '2026-09-04 06:10 AM', reportsAndFeedback: 'Salman Shareef absent continuously' },
  { id: 'log-4', username: 'ADM-2026-001', role: 'Student / Guardian', madrasaId: 'madrasa-1', viewedData: 'Monthly Attendance & Sabaq Roznamchah', submittedData: 'Viewed Terminal Examination Marks', dateTime: '2026-09-03 04:45 PM', reportsAndFeedback: 'Parent appreciated teacher guidance' },
];

const initialFeedbacks: FeedbackItem[] = [
  { id: 'fb-1', madrasaId: 'madrasa-1', madrasaName: 'Jamia Darul Huda', senderName: 'Maulana Abdul Qadeer', role: 'Admin / Principal', message: 'The software works seamlessly! We request adding an automated SMS/WhatsApp gateway for attendance alerts to parents.', date: '2026-09-02', status: 'Unread' },
  { id: 'fb-2', madrasaId: 'madrasa-2', madrasaName: 'Madrasa Anwar-ul-Uloom', senderName: 'Qari Rizwan', role: 'Teacher', message: 'Very user-friendly Roznamchah feature. Makes tracking Sabaq and Manzil effortless for our Asatizah.', date: '2026-08-28', status: 'Resolved' },
  { id: 'fb-3', madrasaId: 'madrasa-3', madrasaName: 'Madrasa Faiz-e-Aam', senderName: 'Mufti Tariq', role: 'Admin / Principal', message: 'Please renew our cloud subscription invoice. We are eager to continue using the software for our upcoming session.', date: '2026-09-01', status: 'Unread' }
];

const initialNotices: NoticeItem[] = [
  { id: 'ntc-1', madrasaId: 'madrasa-1', title: 'Annual Hifz & Tajweed Competition Next Week', content: 'InshaAllah, the annual inter-madrasa Quran recitation competition will take place on Saturday after Asar prayer.', date: '2026-09-03', priority: 'High', target: 'All' },
  { id: 'ntc-2', madrasaId: 'madrasa-1', title: 'Quarterly Examination Schedule Released', content: 'Quarterly exams for Hifz, Nazira, and Alimiyat start from 15th September. Marksheets will be accessible in student portals.', date: '2026-09-01', priority: 'High', target: 'All' },
  { id: 'ntc-3', madrasaId: 'madrasa-1', title: 'Staff Asatizah Monthly Meeting', content: 'All Asatizah-e-Kiram are requested to attend the monthly evaluation session in the Principal Office at 02:30 PM.', date: '2026-09-04', priority: 'Normal', target: 'Teachers' }
];

const initialFees: FeeTransaction[] = [
  { id: 'fee-1', receiptNo: 'RCP-2026-101', studentId: 'std-1', studentName: 'Mohammad Zayd Khan', madrasaId: 'madrasa-1', month: 'August 2026', amount: 2500, date: '2026-08-05', mode: 'Cash', status: 'Paid' },
  { id: 'fee-2', receiptNo: 'RCP-2026-102', studentId: 'std-2', studentName: 'Abdullah Mansoor', madrasaId: 'madrasa-1', month: 'August 2026', amount: 1500, date: '2026-08-07', mode: 'Online', status: 'Paid' },
  { id: 'fee-3', receiptNo: 'RCP-2026-103', studentId: 'std-4', studentName: 'Salman Shareef', madrasaId: 'madrasa-1', month: 'August 2026', amount: 2000, date: '2026-08-12', mode: 'Cash', status: 'Paid' },
  { id: 'fee-4', receiptNo: 'RCP-2026-104', studentId: 'std-5', studentName: 'Zubair Qureshi', madrasaId: 'madrasa-1', month: 'August 2026', amount: 2500, date: '2026-08-03', mode: 'Online', status: 'Paid' },
  { id: 'fee-5', receiptNo: 'RCP-2026-105', studentId: 'std-1', studentName: 'Mohammad Zayd Khan', madrasaId: 'madrasa-1', month: 'September 2026', amount: 2500, date: '2026-09-02', mode: 'Cash', status: 'Paid' },
];

const initialGallery: GalleryItem[] = [
  { id: 'gal-1', madrasaId: 'madrasa-1', title: 'Main Campus Courtyard & Mosque', category: 'Campus', imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80', date: '2026-08-10' },
  { id: 'gal-2', madrasaId: 'madrasa-1', title: 'Hifz-ul-Quran Memorization Hall', category: 'Classes', imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80', date: '2026-08-12' },
  { id: 'gal-3', madrasaId: 'madrasa-1', title: 'Islamic Library & Maktabah', category: 'Campus', imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80', date: '2026-08-15' },
];

const initialRoznamchah: RoznamchahRecord[] = [
  {
    id: 'roz-1',
    studentId: 'std-1',
    madrasaId: 'madrasa-1',
    date: '2026-09-04',
    department: 'hifz',
    sabaqQuantity: '1 Page (صفحہ ۱)',
    sabaqPara: 'Para 14 (Surah Al-Hijr)',
    sabaqMistakes: 0,
    sabaqListener: 'Qari Bilal Ahmad',
    amookhtaQuantity: '1/2 Para (نصف پارہ)',
    amookhtaMistakes: 1,
    amookhtaListener: 'Ustadh Maulana Farooq',
    kaifiyat: 'Mumtaz (ممتاز) - روانی و تجوید عمدہ',
    sabaq: 'Para 14 (Surah Al-Hijr)',
    sabqi: 'Para 13 (Last 5 Pages)',
    manzil: 'Para 12 Complete',
    remarks: 'Recited accurately with Tajweed',
    grade: 'Mumtaz'
  },
  {
    id: 'roz-2',
    studentId: 'std-2',
    madrasaId: 'madrasa-1',
    date: '2026-09-04',
    department: 'hifz',
    sabaqQuantity: '1/2 Page (نصف صفحہ)',
    sabaqPara: 'Para 11 (Surah Yunus)',
    sabaqMistakes: 1,
    sabaqListener: 'Muhammad Anas',
    amookhtaQuantity: '1/4 Para (پاؤ پارہ)',
    amookhtaMistakes: 2,
    amookhtaListener: 'Qari Bilal Ahmad',
    kaifiyat: 'Jayyid Jiddan (جید جدا) - مشق کی ضرورت ہے',
    sabaq: 'Para 11 (Surah Yunus)',
    sabqi: 'Para 10 (Last 3 Pages)',
    manzil: 'Para 9 Complete',
    remarks: 'Good effort, revise Waqf rules',
    grade: 'Jayyid Jiddan'
  },
  {
    id: 'roz-3',
    studentId: 'std-3',
    madrasaId: 'madrasa-1',
    date: '2026-09-04',
    department: 'nazira_qaida',
    sabaq: 'Noorani Qaida Takhti 6 (Harkat & Tanween)',
    amookhtaQuantity: 'Takhti 4 & 5 (Previous 2 Lessons)',
    amookhtaMistakes: 0,
    amookhtaListener: 'Qari Hifzur Rahman',
    kaifiyat: 'Mumtaz (ممتاز) - مخارج و تلفظ درست',
    remarks: 'Recited with clear articulation',
    grade: 'Mumtaz'
  }
];

const initialStudentLogs: StudentUpdateLog[] = [
  {
    id: 'slog-1',
    studentId: 'std-1',
    studentName: 'Mohammad Zayd Khan',
    madrasaId: 'madrasa-1',
    updatedAt: '2026-09-02 10:30 AM',
    updatedBy: 'Maulana Abdul Qadeer Qasmi (Principal / Admin)',
    changes: [
      { field: 'category', label: 'Accommodation Category', labelUrdu: 'شعبہ اقامتی / غیر اقامتی', oldValue: 'Day Scholar', newValue: 'Hostel' },
      { field: 'monthlyFees', label: 'Monthly Fees', labelUrdu: 'ماہانہ فیس', oldValue: '₹2,000', newValue: '₹2,500' }
    ]
  },
  {
    id: 'slog-2',
    studentId: 'std-2',
    studentName: 'Abdullah Mansoor',
    madrasaId: 'madrasa-1',
    updatedAt: '2026-09-03 04:15 PM',
    updatedBy: 'Admin Office (Office Clerk)',
    changes: [
      { field: 'contactNumber', label: 'Contact Number', labelUrdu: 'رابطہ فون نمبر', oldValue: '+91 97001 00000', newValue: '+91 98480 99887' },
      { field: 'address', label: 'Residential Address', labelUrdu: 'رہائشی پتہ', oldValue: 'Old City, Hyderabad', newValue: 'Quarter 12, Islamic Campus Colony' }
    ]
  }
];

const safeSetItem = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err: any) {
    console.warn(`[db] localStorage quota exceeded for ${key}:`, err);
    if (Array.isArray(data)) {
      // If large base64 image strings are present, sanitize them to prevent quota crashes
      const sanitized = data.map(item => {
        if (item && typeof item === 'object') {
          const copy = { ...item };
          for (const k of Object.keys(copy)) {
            if (typeof copy[k] === 'string' && copy[k].startsWith('data:image') && copy[k].length > 40000) {
              copy[k] = 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=400&q=80';
            }
          }
          return copy;
        }
        return item;
      });
      try {
        localStorage.setItem(key, JSON.stringify(sanitized));
      } catch (innerErr) {
        console.error(`[db] Critical quota failure for ${key}:`, innerErr);
      }
    }
  }
};

const backgroundSync = (fn: () => any) => {
  if (!isSupabaseConfigured()) return;
  Promise.resolve()
    .then(() => fn())
    .catch(err => console.warn('Background Supabase sync error:', err));
};

// Database API
export const db = {
  isCloudSynced: false,
  lastSyncTime: null as string | null,

  async syncFromSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const [
        { data: madrasas },
        { data: students },
        { data: teachers },
        { data: staff },
        { data: classes },
        { data: subjects },
        { data: attendance },
        { data: roznamcha },
        { data: fees },
        { data: categories },
        { data: transactions },
        { data: periodSchedule },
        { data: schedule },
        { data: notices }
      ] = await Promise.all([
        supabase.from('mms_madrasas').select('*'),
        supabase.from('mms_students').select('*'),
        supabase.from('mms_teachers').select('*'),
        supabase.from('mms_staff').select('*'),
        supabase.from('mms_classes').select('*'),
        supabase.from('mms_subjects').select('*'),
        supabase.from('mms_attendance').select('*'),
        supabase.from('mms_roznamcha').select('*'),
        supabase.from('mms_fees').select('*'),
        supabase.from('mms_finance_categories').select('*'),
        supabase.from('mms_finance_transactions').select('*'),
        supabase.from('mms_period_schedule').select('*'),
        supabase.from('mms_schedule_items').select('*'),
        supabase.from('mms_notices').select('*')
      ]);

      if (madrasas && madrasas.length > 0) safeSetItem(STORAGE_KEYS.MADRASAS, madrasas);
      if (students && students.length > 0) {
        const localData = localStorage.getItem(STORAGE_KEYS.STUDENTS);
        const localStudents: Student[] = localData ? JSON.parse(localData) : initialStudents;
        const remoteIds = new Set(students.map(s => s.id));
        const mergedStudents = students.map(remoteS => {
          const localS = localStudents.find(ls => ls.id === remoteS.id);
          if (localS) {
            return {
              ...remoteS,
              username: remoteS.username || localS.username,
              password: (remoteS.password && remoteS.password !== 'password123') ? remoteS.password : (localS.password || remoteS.password)
            };
          }
          return remoteS;
        });
        // Retain local students that have not yet been synced to Supabase
        const localOnlyStudents = localStudents.filter(ls => !remoteIds.has(ls.id));
        const finalStudents = [...mergedStudents, ...localOnlyStudents];
        safeSetItem(STORAGE_KEYS.STUDENTS, finalStudents);

        // Upload any local-only students to Supabase so they are permanently backed up
        if (localOnlyStudents.length > 0) {
          Promise.all(localOnlyStudents.map(ls => supabase.from('mms_students').upsert(ls)))
            .catch(err => console.warn('Syncing local-only students to Supabase notice:', err));
        }
      }
      if (teachers && teachers.length > 0) {
        const localData = localStorage.getItem(STORAGE_KEYS.TEACHERS);
        const localTeachers: Teacher[] = localData ? JSON.parse(localData) : initialTeachers;
        const remoteIds = new Set(teachers.map(t => t.id));
        const mergedTeachers = teachers.map(remoteT => {
          const localT = localTeachers.find(lt => lt.id === remoteT.id);
          if (localT) {
            return {
              ...remoteT,
              username: remoteT.username || localT.username,
              password: (remoteT.password && remoteT.password !== 'password123') ? remoteT.password : (localT.password || remoteT.password),
              joiningDate: remoteT.joiningDate || localT.joiningDate,
              dob: remoteT.dob || localT.dob
            };
          }
          return remoteT;
        });
        const localOnlyTeachers = localTeachers.filter(lt => !remoteIds.has(lt.id));
        const finalTeachers = [...mergedTeachers, ...localOnlyTeachers];
        safeSetItem(STORAGE_KEYS.TEACHERS, finalTeachers);

        if (localOnlyTeachers.length > 0) {
          Promise.all(localOnlyTeachers.map(lt => supabase.from('mms_teachers').upsert(lt)))
            .catch(err => console.warn('Syncing local-only teachers to Supabase notice:', err));
        }
      }
      if (staff && staff.length > 0) safeSetItem(STORAGE_KEYS.STAFF, staff);
      if (classes && classes.length > 0) safeSetItem(STORAGE_KEYS.CLASSES, classes);
      if (subjects && subjects.length > 0) safeSetItem(STORAGE_KEYS.SUBJECTS, subjects);
      if (attendance && attendance.length > 0) safeSetItem(STORAGE_KEYS.ATTENDANCE, attendance);
      if (roznamcha && roznamcha.length > 0) safeSetItem(STORAGE_KEYS.ROZNAMCHAH, roznamcha);
      if (fees && fees.length > 0) safeSetItem(STORAGE_KEYS.FEES, fees);
      if (categories && categories.length > 0) safeSetItem(STORAGE_KEYS.FINANCE_CATEGORIES, categories);
      if (transactions && transactions.length > 0) safeSetItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, transactions);
      if (periodSchedule && periodSchedule.length > 0) safeSetItem(STORAGE_KEYS.PERIOD_SCHEDULE, periodSchedule);
      if (schedule && schedule.length > 0) safeSetItem(STORAGE_KEYS.SCHEDULE, schedule);
      if (notices && notices.length > 0) safeSetItem(STORAGE_KEYS.NOTICES, notices);

      this.isCloudSynced = true;
      this.lastSyncTime = new Date().toLocaleTimeString();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mms_data_synced'));
      }
      return true;
    } catch (err) {
      console.warn('Sync from Supabase failed, fallback to local cache:', err);
      return false;
    }
  },

  getSuperAdminCredentials(): { username: string; password: string } {
    const data = localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_CREDS);
    if (!data) {
      const defaults = { username: 'Mia-5919', password: 'Mia@5919' };
      localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_CREDS, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(data);
    } catch {
      return { username: 'Mia-5919', password: 'Mia@5919' };
    }
  },

  saveSuperAdminCredentials(creds: { username: string; password: string }) {
    localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_CREDS, JSON.stringify(creds));
  },

  getMadrasas(): Madrasa[] {
    const data = localStorage.getItem(STORAGE_KEYS.MADRASAS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MADRASAS, JSON.stringify(initialMadrasas));
      return initialMadrasas;
    }
    return JSON.parse(data);
  },

  saveMadrasas(madrasas: Madrasa[]) {
    localStorage.setItem(STORAGE_KEYS.MADRASAS, JSON.stringify(madrasas));
  },

  updateMadrasa(updated: Madrasa) {
    const list = this.getMadrasas();
    const index = list.findIndex(m => m.id === updated.id);
    if (index >= 0) {
      list[index] = updated;
      this.saveMadrasas(list);
      backgroundSync(() => supabase.from('mms_madrasas').upsert(updated));
    }
  },

  addMadrasa(madrasa: Madrasa) {
    const list = this.getMadrasas();
    list.push(madrasa);
    this.saveMadrasas(list);
    backgroundSync(() => supabase.from('mms_madrasas').upsert(madrasa));
  },

  deleteMadrasa(madrasaId: string) {
    const list = this.getMadrasas().filter(m => m.id !== madrasaId);
    this.saveMadrasas(list);
    backgroundSync(() => supabase.from('mms_madrasas').delete().eq('id', madrasaId));
  },

  getStudents(madrasaId?: string): Student[] {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const students: Student[] = data ? JSON.parse(data) : initialStudents;
    if (!data) safeSetItem(STORAGE_KEYS.STUDENTS, initialStudents);
    if (madrasaId) {
      return students.filter(s => s.madrasaId === madrasaId);
    }
    return students;
  },

  saveStudents(students: Student[]) {
    safeSetItem(STORAGE_KEYS.STUDENTS, students);
  },

  isAdmissionNoTaken(admissionNo: string, excludeStudentId?: string, madrasaId?: string): boolean {
    if (!admissionNo || !admissionNo.trim()) return false;
    const cleanNo = admissionNo.trim().toLowerCase();
    const students = this.getStudents();
    return students.some(s => {
      if (excludeStudentId && s.id === excludeStudentId) return false;
      if (madrasaId && s.madrasaId && s.madrasaId !== madrasaId) return false;
      return s.admissionNo.trim().toLowerCase() === cleanNo;
    });
  },

  async checkAdmissionNoAvailable(
    admissionNo: string,
    excludeStudentId?: string,
    madrasaId?: string
  ): Promise<{ available: boolean; existingStudentName?: string }> {
    const cleanNo = admissionNo.trim();
    if (!cleanNo) return { available: true };

    // 1. Synchronously check local storage
    const localStudents = this.getStudents();
    const localMatch = localStudents.find(s =>
      s.admissionNo.trim().toLowerCase() === cleanNo.toLowerCase() &&
      (!excludeStudentId || s.id !== excludeStudentId) &&
      (!madrasaId || !s.madrasaId || s.madrasaId === madrasaId)
    );
    if (localMatch) {
      return { available: false, existingStudentName: localMatch.studentName };
    }

    // 2. Query Supabase for remote check
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('mms_students')
          .select('id, studentName, admissionNo, madrasaId')
          .ilike('admissionNo', cleanNo);
        if (excludeStudentId) {
          query = query.neq('id', excludeStudentId);
        }
        if (madrasaId) {
          query = query.eq('madrasaId', madrasaId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { available: false, existingStudentName: data[0].studentName };
        }
      } catch (err) {
        console.warn('Admission No check error from Supabase:', err);
      }
    }
    return { available: true };
  },

  async addStudent(student: Student): Promise<{ success: boolean; error?: string }> {
    const students = this.getStudents();
    const existingIndex = students.findIndex(s => s.id === student.id);
    if (existingIndex >= 0) {
      students[existingIndex] = student;
    } else {
      students.unshift(student);
    }
    this.saveStudents(students);

    if (isSupabaseConfigured()) {
      try {
        const payload = {
          ...student,
          village: student.village || null,
          kafeelName: student.kafeelName || null,
          previousStudyCertificateUrl: student.previousStudyCertificateUrl || null,
          aadharCardUrl: student.aadharCardUrl || null,
          aadharNumber: student.aadharNumber || null,
          motherName: student.motherName || null,
          guardianName: student.guardianName || null,
          guardianOccupation: student.guardianOccupation || null,
          previousSchool: student.previousSchool || null,
          previousStudy: student.previousStudy || null,
          photoUrl: student.photoUrl || null,
          username: student.username || null,
          password: student.password || null
        };
        const { error } = await supabase.from('mms_students').upsert(payload);
        if (error) {
          console.error('[db] Supabase addStudent error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error('[db] Supabase addStudent exception:', err);
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: true };
  },

  async updateStudent(student: Student): Promise<{ success: boolean; error?: string }> {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
      this.saveStudents(students);
    }

    if (isSupabaseConfigured()) {
      try {
        const payload = {
          ...student,
          village: student.village || null,
          kafeelName: student.kafeelName || null,
          previousStudyCertificateUrl: student.previousStudyCertificateUrl || null,
          aadharCardUrl: student.aadharCardUrl || null,
          aadharNumber: student.aadharNumber || null,
          motherName: student.motherName || null,
          guardianName: student.guardianName || null,
          guardianOccupation: student.guardianOccupation || null,
          previousSchool: student.previousSchool || null,
          previousStudy: student.previousStudy || null,
          photoUrl: student.photoUrl || null,
          username: student.username || null,
          password: student.password || null
        };
        const { error } = await supabase.from('mms_students').upsert(payload);
        if (error) {
          console.error('[db] Supabase updateStudent error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error('[db] Supabase updateStudent exception:', err);
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: true };
  },

  deleteStudent(studentId: string) {
    const students = this.getStudents().filter(s => s.id !== studentId);
    this.saveStudents(students);
    backgroundSync(() => supabase.from('mms_students').delete().eq('id', studentId));
  },

  getStudentLogs(studentId?: string, madrasaId?: string): StudentUpdateLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENT_LOGS);
    const logs: StudentUpdateLog[] = data ? JSON.parse(data) : initialStudentLogs;
    if (!data) localStorage.setItem(STORAGE_KEYS.STUDENT_LOGS, JSON.stringify(initialStudentLogs));
    return logs.filter(l => {
      if (studentId && l.studentId !== studentId) return false;
      if (madrasaId && l.madrasaId !== madrasaId) return false;
      return true;
    });
  },

  addStudentLog(log: Omit<StudentUpdateLog, 'id'>): StudentUpdateLog {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENT_LOGS);
    const logs: StudentUpdateLog[] = data ? JSON.parse(data) : initialStudentLogs;
    const newLog: StudentUpdateLog = {
      ...log,
      id: `slog-${Date.now()}`
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.STUDENT_LOGS, JSON.stringify(logs));
    return newLog;
  },

  getTeachers(madrasaId?: string): Teacher[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    const teachers: Teacher[] = data ? JSON.parse(data) : initialTeachers;
    if (!data) localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(initialTeachers));
    if (madrasaId) {
      return teachers.filter(t => t.madrasaId === madrasaId);
    }
    return teachers;
  },

  saveTeachers(teachers: Teacher[]) {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  },

  addTeacher(teacher: Teacher) {
    const teachers = this.getTeachers();
    const updated = [teacher, ...teachers.filter(t => t.id !== teacher.id)];
    this.saveTeachers(updated);
    backgroundSync(() => supabase.from('mms_teachers').upsert(teacher));
    return teacher;
  },

  updateTeacher(teacher: Teacher) {
    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === teacher.id);
    if (index >= 0) {
      teachers[index] = teacher;
    } else {
      teachers.unshift(teacher);
    }
    this.saveTeachers(teachers);
    backgroundSync(() => supabase.from('mms_teachers').upsert(teacher));
    return teacher;
  },

  deleteTeacher(teacherId: string) {
    const teachers = this.getTeachers().filter(t => t.id !== teacherId);
    this.saveTeachers(teachers);
    backgroundSync(() => supabase.from('mms_teachers').delete().eq('id', teacherId));
  },

  getStaff(madrasaId?: string): Staff[] {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    const staff: Staff[] = data ? JSON.parse(data) : initialStaff;
    if (!data) localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(initialStaff));
    if (madrasaId) {
      return staff.filter(s => !s.madrasaId || s.madrasaId === madrasaId);
    }
    return staff;
  },

  saveStaff(staffList: Staff[]) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  },

  addStaff(staffMember: Staff) {
    const current = this.getStaff();
    const updated = [staffMember, ...current.filter(s => s.id !== staffMember.id)];
    this.saveStaff(updated);
    backgroundSync(() => supabase.from('mms_staff').upsert(staffMember));
    return staffMember;
  },

  updateStaff(updated: Staff) {
    const current = this.getStaff();
    const index = current.findIndex(s => s.id === updated.id);
    if (index >= 0) {
      current[index] = updated;
      this.saveStaff(current);
    } else {
      this.addStaff(updated);
    }
    backgroundSync(() => supabase.from('mms_staff').upsert(updated));
    return updated;
  },

  deleteStaff(staffId: string) {
    const current = this.getStaff();
    const updated = current.filter(s => s.id !== staffId);
    this.saveStaff(updated);
    backgroundSync(() => supabase.from('mms_staff').delete().eq('id', staffId));
  },

  getClasses(madrasaId?: string): MadrasaClass[] {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const classes: MadrasaClass[] = data ? JSON.parse(data) : initialClasses;
    if (!data) localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(initialClasses));
    if (madrasaId) {
      return classes.filter(c => !c.madrasaId || c.madrasaId === madrasaId);
    }
    return classes;
  },

  saveClasses(classes: MadrasaClass[]) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  },

  addClass(cls: MadrasaClass) {
    const current = this.getClasses();
    const updated = [cls, ...current.filter(c => c.id !== cls.id)];
    this.saveClasses(updated);
    backgroundSync(() => supabase.from('mms_classes').upsert(cls));
    return cls;
  },

  updateClass(updated: MadrasaClass) {
    const current = this.getClasses();
    const index = current.findIndex(c => c.id === updated.id);
    if (index >= 0) {
      current[index] = updated;
      this.saveClasses(current);
    } else {
      this.addClass(updated);
    }
    backgroundSync(() => supabase.from('mms_classes').upsert(updated));
    return updated;
  },

  deleteClass(classId: string) {
    const current = this.getClasses();
    const updated = current.filter(c => c.id !== classId);
    this.saveClasses(updated);
    backgroundSync(() => supabase.from('mms_classes').delete().eq('id', classId));
  },

  getSubjects(madrasaId?: string): Subject[] {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    const subjects: Subject[] = data ? JSON.parse(data) : initialSubjects;
    if (!data) localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(initialSubjects));
    if (madrasaId) {
      return subjects.filter(s => !s.madrasaId || s.madrasaId === madrasaId);
    }
    return subjects;
  },

  saveSubjects(subjects: Subject[]) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  addSubject(subject: Subject) {
    const subjects = this.getSubjects();
    const updated = [subject, ...subjects.filter(s => s.id !== subject.id)];
    this.saveSubjects(updated);
    backgroundSync(() => supabase.from('mms_subjects').upsert(subject));
    return subject;
  },

  updateSubject(updated: Subject) {
    const current = this.getSubjects();
    const index = current.findIndex(s => s.id === updated.id);
    if (index >= 0) {
      current[index] = updated;
      this.saveSubjects(current);
    } else {
      this.addSubject(updated);
    }
    backgroundSync(() => supabase.from('mms_subjects').upsert(updated));
    return updated;
  },

  deleteSubject(subjectId: string) {
    const subjects = this.getSubjects().filter(s => s.id !== subjectId);
    this.saveSubjects(subjects);
    backgroundSync(() => supabase.from('mms_subjects').delete().eq('id', subjectId));
  },

  getNamazTimings(madrasaId?: string): MadrasaNamazTimings {
    const data = localStorage.getItem(`${STORAGE_KEYS.NAMAZ}_${madrasaId || 'default'}`);
    if (!data) {
      localStorage.setItem(`${STORAGE_KEYS.NAMAZ}_${madrasaId || 'default'}`, JSON.stringify(initialNamaz));
      return initialNamaz;
    }
    return JSON.parse(data);
  },

  saveNamazTimings(timings: MadrasaNamazTimings, madrasaId?: string) {
    localStorage.setItem(`${STORAGE_KEYS.NAMAZ}_${madrasaId || 'default'}`, JSON.stringify(timings));
    backgroundSync(() => supabase.from('mms_namaz_timings').upsert({
      id: madrasaId || 'default',
      madrasaId: madrasaId || 'madrasa-1',
      timings
    }));
  },

  getSchedule(): ScheduleItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(initialSchedule));
      return initialSchedule;
    }
    return JSON.parse(data);
  },

  saveSchedule(items: ScheduleItem[]) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(items));
  },

  addScheduleItem(item: Omit<ScheduleItem, 'id'>): ScheduleItem {
    const list = this.getSchedule();
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`
    };
    list.push(newItem);
    this.saveSchedule(list);
    backgroundSync(() => supabase.from('mms_schedule_items').upsert(newItem));
    return newItem;
  },

  updateScheduleItem(id: string, updated: Partial<ScheduleItem>): boolean {
    const list = this.getSchedule();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updated };
    this.saveSchedule(list);
    backgroundSync(() => supabase.from('mms_schedule_items').upsert(list[idx]));
    return true;
  },

  deleteScheduleItem(id: string): boolean {
    const list = this.getSchedule().filter(s => s.id !== id);
    this.saveSchedule(list);
    backgroundSync(() => supabase.from('mms_schedule_items').delete().eq('id', id));
    return true;
  },

  // Period Schedule Timetable CRUD
  getPeriodSchedule(madrasaId?: string): PeriodScheduleItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.PERIOD_SCHEDULE);
    let list: PeriodScheduleItem[] = data ? JSON.parse(data) : initialPeriodSchedule;
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PERIOD_SCHEDULE, JSON.stringify(initialPeriodSchedule));
    }
    if (madrasaId) {
      list = list.filter(p => !p.madrasaId || p.madrasaId === madrasaId);
    }
    return list;
  },

  savePeriodSchedule(items: PeriodScheduleItem[]) {
    localStorage.setItem(STORAGE_KEYS.PERIOD_SCHEDULE, JSON.stringify(items));
  },

  addPeriodScheduleItem(item: Omit<PeriodScheduleItem, 'id'>): PeriodScheduleItem {
    const list = this.getPeriodSchedule();
    const newItem: PeriodScheduleItem = {
      ...item,
      id: `ps-${Date.now()}`
    };
    list.push(newItem);
    this.savePeriodSchedule(list);
    backgroundSync(() => supabase.from('mms_period_schedule').upsert(newItem));
    return newItem;
  },

  updatePeriodScheduleItem(id: string, updated: Partial<PeriodScheduleItem>): boolean {
    const list = this.getPeriodSchedule();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updated };
    this.savePeriodSchedule(list);
    backgroundSync(() => supabase.from('mms_period_schedule').upsert(list[idx]));
    return true;
  },

  deletePeriodScheduleItem(id: string): boolean {
    const list = this.getPeriodSchedule().filter(p => p.id !== id);
    this.savePeriodSchedule(list);
    backgroundSync(() => supabase.from('mms_period_schedule').delete().eq('id', id));
    return true;
  },

  // Finance Transactions CRUD
  getFinanceTransactions(madrasaId?: string): FinanceTransaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCE_TRANSACTIONS);
    let list: FinanceTransaction[] = data ? JSON.parse(data) : initialFinanceTransactions;
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(initialFinanceTransactions));
    }
    if (madrasaId) {
      list = list.filter(t => !t.madrasaId || t.madrasaId === madrasaId);
    }
    // Recompute chronological running balances to guarantee accurate figures
    let runningBalance = 0;
    list = list.map((tx, idx) => {
      const inc = Number(tx.incomeAmount) || 0;
      const exp = Number(tx.expenseAmount) || 0;
      runningBalance = runningBalance + inc - exp;
      return {
        ...tx,
        sNo: idx + 1,
        balance: runningBalance
      };
    });
    return list;
  },

  addFinanceTransaction(tx: Omit<FinanceTransaction, 'id' | 'sNo' | 'balance'>): FinanceTransaction {
    const list = this.getFinanceTransactions();
    const income = Number(tx.incomeAmount) || 0;
    const expense = Number(tx.expenseAmount) || 0;
    const prevBalance = list.length > 0 ? list[list.length - 1].balance : 0;
    const newBalance = prevBalance + income - expense;

    const newTx: FinanceTransaction = {
      ...tx,
      id: `ftx-${Date.now()}`,
      sNo: list.length + 1,
      incomeAmount: income,
      expenseAmount: expense,
      balance: newBalance
    };
    list.push(newTx);
    localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(list));
    backgroundSync(() => supabase.from('mms_finance_transactions').upsert(newTx));
    return newTx;
  },

  updateFinanceTransaction(id: string, updated: Partial<FinanceTransaction>): boolean {
    const list = this.getFinanceTransactions();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return false;
    list[index] = { ...list[index], ...updated };
    let running = 0;
    for (let i = 0; i < list.length; i++) {
      running += (Number(list[i].incomeAmount) || 0) - (Number(list[i].expenseAmount) || 0);
      list[i].sNo = i + 1;
      list[i].balance = running;
    }
    localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(list));
    backgroundSync(() => supabase.from('mms_finance_transactions').upsert(list[index]));
    return true;
  },

  deleteFinanceTransaction(id: string): boolean {
    let list = this.getFinanceTransactions();
    const beforeLen = list.length;
    list = list.filter(t => t.id !== id);
    if (list.length === beforeLen) return false;
    let running = 0;
    for (let i = 0; i < list.length; i++) {
      running += (Number(list[i].incomeAmount) || 0) - (Number(list[i].expenseAmount) || 0);
      list[i].sNo = i + 1;
      list[i].balance = running;
    }
    localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(list));
    backgroundSync(() => supabase.from('mms_finance_transactions').delete().eq('id', id));
    return true;
  },

  // Finance Categories & Subcategories
  getFinanceCategories(madrasaId?: string): FinanceCategoryItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCE_CATEGORIES);
    let list: FinanceCategoryItem[] = data ? JSON.parse(data) : initialFinanceCategories;
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FINANCE_CATEGORIES, JSON.stringify(initialFinanceCategories));
    }
    if (madrasaId) {
      list = list.filter(c => !c.madrasaId || c.madrasaId === madrasaId);
    }
    return list;
  },

  addFinanceCategory(cat: Omit<FinanceCategoryItem, 'id'>): FinanceCategoryItem {
    const list = this.getFinanceCategories();
    const newCat: FinanceCategoryItem = {
      ...cat,
      id: `fcat-${Date.now()}`
    };
    list.push(newCat);
    localStorage.setItem(STORAGE_KEYS.FINANCE_CATEGORIES, JSON.stringify(list));
    backgroundSync(() => supabase.from('mms_finance_categories').upsert(newCat));
    return newCat;
  },

  addFinanceSubcategory(categoryNameOrId: string, subcategoryName: string): boolean {
    const list = this.getFinanceCategories();
    const cat = list.find(c => c.id === categoryNameOrId || c.name === categoryNameOrId);
    if (!cat) return false;
    if (!cat.subcategories.includes(subcategoryName)) {
      cat.subcategories.push(subcategoryName);
      localStorage.setItem(STORAGE_KEYS.FINANCE_CATEGORIES, JSON.stringify(list));
      backgroundSync(() => supabase.from('mms_finance_categories').upsert(cat));
    }
    return true;
  },

  getUserLogs(): UserLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.USER_LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USER_LOGS, JSON.stringify(initialUserLogs));
      return initialUserLogs;
    }
    return JSON.parse(data);
  },

  addUserLog(log: Omit<UserLog, 'id'>) {
    const logs = this.getUserLogs();
    const newLog: UserLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.USER_LOGS, JSON.stringify(logs.slice(0, 500))); // Keep last 500 logs
  },

  getFeedbacks(): FeedbackItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(initialFeedbacks));
      return initialFeedbacks;
    }
    return JSON.parse(data);
  },

  addFeedback(feedback: Omit<FeedbackItem, 'id'>) {
    const feedbacks = this.getFeedbacks();
    const newFeedback: FeedbackItem = {
      ...feedback,
      id: `fb-${Date.now()}`
    };
    feedbacks.unshift(newFeedback);
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
    backgroundSync(() => supabase.from('mms_feedback').upsert(newFeedback));
  },

  getProfileRequests(): ProfileChangeRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  addProfileRequest(request: Omit<ProfileChangeRequest, 'id'>) {
    const requests = this.getProfileRequests();
    const newReq: ProfileChangeRequest = {
      ...request,
      id: `req-${Date.now()}`
    };
    requests.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.PROFILE_REQUESTS, JSON.stringify(requests));
  },

  getNotices(madrasaId?: string): NoticeItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
    const notices: NoticeItem[] = data ? JSON.parse(data) : initialNotices;
    if (!data) localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(initialNotices));
    if (madrasaId) {
      return notices.filter(n => n.madrasaId === madrasaId || n.madrasaId === 'all');
    }
    return notices;
  },

  addNotice(notice: Omit<NoticeItem, 'id'>) {
    const notices = this.getNotices();
    const newNotice: NoticeItem = {
      ...notice,
      id: `ntc-${Date.now()}`
    };
    notices.unshift(newNotice);
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    backgroundSync(() => supabase.from('mms_notices').upsert(newNotice));
  },

  getFees(madrasaId?: string): FeeTransaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.FEES);
    const fees: FeeTransaction[] = data ? JSON.parse(data) : initialFees;
    if (!data) localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(initialFees));
    if (madrasaId) {
      return fees.filter(f => f.madrasaId === madrasaId);
    }
    return fees;
  },

  collectFee(fee: Omit<FeeTransaction, 'id' | 'receiptNo'>): FeeTransaction {
    const fees = this.getFees();
    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newFee: FeeTransaction = {
      ...fee,
      id: `fee-${Date.now()}`,
      receiptNo,
    };
    fees.unshift(newFee);
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
    backgroundSync(() => supabase.from('mms_fees').upsert(newFee));
    return newFee;
  },

  getGallery(madrasaId?: string): GalleryItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
    const items: GalleryItem[] = data ? JSON.parse(data) : initialGallery;
    if (!data) localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(initialGallery));
    if (madrasaId) {
      return items.filter(g => g.madrasaId === madrasaId);
    }
    return items;
  },

  addGalleryItem(item: Omit<GalleryItem, 'id'>) {
    const items = this.getGallery();
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`
    };
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
  },

  getRoznamchah(studentId?: string, madrasaId?: string): RoznamchahRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.ROZNAMCHAH);
    const records: RoznamchahRecord[] = data ? JSON.parse(data) : initialRoznamchah;
    if (!data) localStorage.setItem(STORAGE_KEYS.ROZNAMCHAH, JSON.stringify(initialRoznamchah));
    return records.filter(r => {
      if (studentId && r.studentId !== studentId) return false;
      if (madrasaId && r.madrasaId !== madrasaId) return false;
      return true;
    });
  },

  saveRoznamchahRecord(record: Omit<RoznamchahRecord, 'id'>): RoznamchahRecord {
    const records = this.getRoznamchah();
    const newRecord: RoznamchahRecord = {
      ...record,
      id: `roz-${Date.now()}`
    };
    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.ROZNAMCHAH, JSON.stringify(records));
    backgroundSync(() => supabase.from('mms_roznamcha').upsert(newRecord));
    return newRecord;
  },

  exportDatabaseJSON(): string {
    const dump = {
      madrasas: this.getMadrasas(),
      students: this.getStudents(),
      teachers: this.getTeachers(),
      classes: this.getClasses(),
      subjects: this.getSubjects(),
      fees: this.getFees(),
      financeTransactions: this.getFinanceTransactions(),
      financeCategories: this.getFinanceCategories(),
      schedule: this.getSchedule(),
      periodSchedule: this.getPeriodSchedule(),
      logs: this.getUserLogs(),
      feedbacks: this.getFeedbacks(),
      notices: this.getNotices(),
      gallery: this.getGallery(),
      studentLogs: this.getStudentLogs(),
      exportTimestamp: new Date().toISOString()
    };
    return JSON.stringify(dump, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.madrasas) localStorage.setItem(STORAGE_KEYS.MADRASAS, JSON.stringify(parsed.madrasas));
      if (parsed.students) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(parsed.students));
      if (parsed.studentLogs) localStorage.setItem(STORAGE_KEYS.STUDENT_LOGS, JSON.stringify(parsed.studentLogs));
      if (parsed.teachers) localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(parsed.teachers));
      if (parsed.classes) localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(parsed.classes));
      if (parsed.subjects) localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(parsed.subjects));
      if (parsed.fees) localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(parsed.fees));
      if (parsed.financeTransactions) localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(parsed.financeTransactions));
      if (parsed.financeCategories) localStorage.setItem(STORAGE_KEYS.FINANCE_CATEGORIES, JSON.stringify(parsed.financeCategories));
      if (parsed.schedule) localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(parsed.schedule));
      if (parsed.periodSchedule) localStorage.setItem(STORAGE_KEYS.PERIOD_SCHEDULE, JSON.stringify(parsed.periodSchedule));
      if (parsed.logs) localStorage.setItem(STORAGE_KEYS.USER_LOGS, JSON.stringify(parsed.logs));
      if (parsed.feedbacks) localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(parsed.feedbacks));
      if (parsed.notices) localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(parsed.notices));
      if (parsed.gallery) localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(parsed.gallery));
      return true;
    } catch {
      return false;
    }
  }
};
