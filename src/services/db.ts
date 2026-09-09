import { 
  Madrasa, Student, Teacher, AttendanceRecord, RoznamchahRecord, 
  FeeTransaction, MadrasaNamazTimings, ScheduleItem, UserLog, 
  FeedbackItem, ProfileChangeRequest, NoticeItem, GalleryItem,
  MadrasaClass, Subject, Staff, StudentUpdateLog,
  FinanceTransaction, FinanceCategoryItem, PeriodScheduleItem,
  Department, ManualHoliday, Examination, ExamStudentResult, InventoryItem
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  MADRASAS: 'mms_madrasas_v1',
  STUDENTS: 'mms_students_v1',
  STUDENT_LOGS: 'mms_student_logs_v1',
  TEACHERS: 'mms_teachers_v1',
  STAFF: 'mms_staff_v1',
  DEPARTMENTS: 'mms_departments_v1',
  CLASSES: 'mms_classes_v1',
  SUBJECTS: 'mms_subjects_v1',
  ATTENDANCE: 'mms_attendance_v1',
  MANUAL_HOLIDAYS: 'mms_manual_holidays_v1',
  EXAMINATIONS: 'mms_examinations_v1',
  INVENTORY: 'mms_inventory_v1',
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
    id: 'std-1788982266268',
    admissionNo: 'ZIA-21-002',
    admissionDate: '2026-09-09',
    studentName: 'Pathan Mohamamd Khan',
    studentNameUrdu: 'پٹھان محمد خان',
    fatherName: 'Pathan Jahangeer Khan',
    motherName: '',
    guardianName: 'Pathan Jahangeer Khan',
    guardianOccupation: 'Business',
    contactNumber: '+91 99000 00000',
    address: 'Adilabad, Telangana',
    category: 'Hostel',
    sponsorship: 'Self-Sponsored',
    kafeelName: 'Self',
    monthlyFees: 1500,
    previousSchool: 'Primary School',
    previousStudy: 'Noorani Qaidah',
    aadharNumber: '',
    photoUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=400&q=80',
    class: 'General',
    madrasaId: 'madrasa-1',
    totalPresentsYearly: 0,
    totalPresentsMonthly: 0,
    totalAbsentsYearly: 0,
    totalAbsentsMonthly: 0,
    presentSabaqAt: 'Para 1',
    username: 'Path-2026',
    password: 'Path@2015',
    dob: '2015-01-01'
  }
];

const initialTeachers: Teacher[] = [];
const initialStaff: Staff[] = [];
const initialDepartments: Department[] = [
  { id: 'dept-1', name: 'Tahfeez-ul-Quran', nameUrdu: 'شعبہ حفظِ قرآن کریم', code: 'HQ', description: 'Quran Memorization & Revision Department' },
  { id: 'dept-2', name: 'Nazira & Tajweed', nameUrdu: 'شعبہ ناظرہ و تجوید', code: 'NT', description: 'Quran Recitation & Phonetics' },
  { id: 'dept-3', name: 'Noorani Qaida', nameUrdu: 'شعبہ نورانی قاعدہ', code: 'NQ', description: 'Foundational Arabic Phonetics & Alphabet' },
  { id: 'dept-4', name: 'Dars-e-Nizami (Alimiyat)', nameUrdu: 'درسِ نظامی (عالمیت)', code: 'DN', description: 'Classical Islamic Sciences & Theology' },
  { id: 'dept-5', name: 'Primary Maktab', nameUrdu: 'پرائمری مکتب', code: 'PM', description: 'Primary Religious & Basic Secular Education' }
];
const initialClasses: MadrasaClass[] = [];
const initialSubjects: Subject[] = [];
const initialManualHolidays: ManualHoliday[] = [];

const initialNamaz: MadrasaNamazTimings = {
  fajr: { azan: '05:00 AM', jamat: '05:30 AM' },
  zohr: { azan: '01:00 PM', jamat: '01:30 PM' },
  asar: { azan: '04:45 PM', jamat: '05:10 PM' },
  magrib: { azan: '06:35 PM', jamat: '06:40 PM' },
  isha: { azan: '08:00 PM', jamat: '08:30 PM' }
};

const initialSchedule: ScheduleItem[] = [];

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

const initialFinanceTransactions: FinanceTransaction[] = [];

const initialPeriodSchedule: PeriodScheduleItem[] = [];

const initialUserLogs: UserLog[] = [];

const initialFeedbacks: FeedbackItem[] = [];

const initialNotices: NoticeItem[] = [];

const initialFees: FeeTransaction[] = [];

const initialGallery: GalleryItem[] = [];

const initialRoznamchah: RoznamchahRecord[] = [];

const initialStudentLogs: StudentUpdateLog[] = [];

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

const purgeDemoData = () => {
  if (typeof window === 'undefined') return;
  try {
    const PURGE_FLAG = 'mms_demo_data_purged_v4';
    if (localStorage.getItem(PURGE_FLAG)) return;

    const isDemoId = (id: string, prefix: string) => {
      return typeof id === 'string' && id.startsWith(prefix) && id.length <= 8;
    };

    // Clean Students (keep real student)
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (rawStudents) {
      const parsed: Student[] = JSON.parse(rawStudents);
      const cleaned = parsed.filter(s => !isDemoId(s.id, 'std-'));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(cleaned.length > 0 ? cleaned : initialStudents));
    } else {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
    }

    // Clean Teachers
    const rawTeachers = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (rawTeachers) {
      const parsed = JSON.parse(rawTeachers);
      const cleaned = parsed.filter((t: any) => !isDemoId(t.id, 'tch-'));
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(cleaned));
    }

    // Clean Classes
    const rawClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (rawClasses) {
      const parsed = JSON.parse(rawClasses);
      const cleaned = parsed.filter((c: any) => !isDemoId(c.id, 'cls-'));
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(cleaned));
    }

    // Clean Subjects
    const rawSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (rawSubjects) {
      const parsed = JSON.parse(rawSubjects);
      const cleaned = parsed.filter((s: any) => !isDemoId(s.id, 'sbj-') && !isDemoId(s.id, 'sub-'));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(cleaned));
    }

    // Clean Staff
    const rawStaff = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (rawStaff) {
      const parsed = JSON.parse(rawStaff);
      const cleaned = parsed.filter((s: any) => !isDemoId(s.id, 'stf-'));
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(cleaned));
    }

    // Clean Schedule
    const rawSchedule = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (rawSchedule) {
      const parsed = JSON.parse(rawSchedule);
      const cleaned = parsed.filter((s: any) => !isDemoId(s.id, 'sch-'));
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(cleaned));
    }

    // Clean Period Schedule
    const rawPeriodSchedule = localStorage.getItem(STORAGE_KEYS.PERIOD_SCHEDULE);
    if (rawPeriodSchedule) {
      const parsed = JSON.parse(rawPeriodSchedule);
      const cleaned = parsed.filter((p: any) => !isDemoId(p.id, 'ps-'));
      localStorage.setItem(STORAGE_KEYS.PERIOD_SCHEDULE, JSON.stringify(cleaned));
    }

    // Clean Fees
    const rawFees = localStorage.getItem(STORAGE_KEYS.FEES);
    if (rawFees) {
      const parsed = JSON.parse(rawFees);
      const cleaned = parsed.filter((f: any) => !isDemoId(f.id, 'fee-'));
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(cleaned));
    }

    // Clean Roznamchah
    const rawRoz = localStorage.getItem(STORAGE_KEYS.ROZNAMCHAH);
    if (rawRoz) {
      const parsed = JSON.parse(rawRoz);
      const cleaned = parsed.filter((r: any) => !isDemoId(r.id, 'roz-'));
      localStorage.setItem(STORAGE_KEYS.ROZNAMCHAH, JSON.stringify(cleaned));
    }

    localStorage.setItem(PURGE_FLAG, 'true');
  } catch (err) {
    console.warn('purgeDemoData error:', err);
  }
};

purgeDemoData();

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
      
      if (students) {
        const nonDemoRemote = students.filter(s => !(s.id.startsWith('std-') && s.id.length <= 8));
        const localData = localStorage.getItem(STORAGE_KEYS.STUDENTS);
        const localStudents: Student[] = localData 
          ? JSON.parse(localData).filter((s: any) => !(s.id.startsWith('std-') && s.id.length <= 8))
          : initialStudents;
        const remoteIds = new Set(nonDemoRemote.map(s => s.id));
        const mergedStudents = nonDemoRemote.map(remoteS => {
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
        const localOnlyStudents = localStudents.filter(ls => !remoteIds.has(ls.id) && !(ls.id.startsWith('std-') && ls.id.length <= 8));
        const finalStudents = [...mergedStudents, ...localOnlyStudents];
        safeSetItem(STORAGE_KEYS.STUDENTS, finalStudents.length > 0 ? finalStudents : initialStudents);

        if (localOnlyStudents.length > 0) {
          Promise.all(localOnlyStudents.map(ls => supabase.from('mms_students').upsert(ls)))
            .catch(err => console.warn('Syncing local-only students to Supabase notice:', err));
        }
      }

      if (teachers) {
        const nonDemoTeachers = teachers.filter(t => !(t.id.startsWith('tch-') && t.id.length <= 8));
        safeSetItem(STORAGE_KEYS.TEACHERS, nonDemoTeachers);
      }
      if (staff) {
        const nonDemoStaff = staff.filter(s => !(s.id.startsWith('stf-') && s.id.length <= 8));
        safeSetItem(STORAGE_KEYS.STAFF, nonDemoStaff);
      }
      if (classes) {
        const nonDemoClasses = classes.filter(c => !(c.id.startsWith('cls-') && c.id.length <= 8));
        safeSetItem(STORAGE_KEYS.CLASSES, nonDemoClasses);
      }
      if (subjects) {
        const nonDemoSubjects = subjects.filter(s => (!s.id.startsWith('sbj-') && !s.id.startsWith('sub-')) || s.id.length > 8);
        safeSetItem(STORAGE_KEYS.SUBJECTS, nonDemoSubjects);
      }
      if (attendance) safeSetItem(STORAGE_KEYS.ATTENDANCE, attendance);
      if (roznamcha) {
        const nonDemoRoz = roznamcha.filter(r => !(r.id.startsWith('roz-') && r.id.length <= 8));
        safeSetItem(STORAGE_KEYS.ROZNAMCHAH, nonDemoRoz);
      }
      if (fees) {
        const nonDemoFees = fees.filter(f => !(f.id.startsWith('fee-') && f.id.length <= 8));
        safeSetItem(STORAGE_KEYS.FEES, nonDemoFees);
      }
      if (categories && categories.length > 0) safeSetItem(STORAGE_KEYS.FINANCE_CATEGORIES, categories);
      if (transactions) safeSetItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, transactions);
      if (periodSchedule) {
        const nonDemoPs = periodSchedule.filter(p => !(p.id.startsWith('ps-') && p.id.length <= 8));
        safeSetItem(STORAGE_KEYS.PERIOD_SCHEDULE, nonDemoPs);
      }
      if (schedule) {
        const nonDemoSch = schedule.filter(s => !(s.id.startsWith('sch-') && s.id.length <= 8));
        safeSetItem(STORAGE_KEYS.SCHEDULE, nonDemoSch);
      }
      if (notices) safeSetItem(STORAGE_KEYS.NOTICES, notices);

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
      const old = students[index];
      // Check if class changed (promoted or transferred)
      if (old.class && student.class && old.class !== student.class) {
        const history = student.classHistory || old.classHistory || [];
        const entry = {
          id: `tf-${Date.now()}`,
          fromClass: old.class,
          toClass: student.class,
          date: new Date().toISOString().split('T')[0],
          reason: 'Class Promotion / Transfer',
          by: 'Administrator'
        };
        student.classHistory = [entry, ...history];
      }
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

  toggleStudentActive(studentId: string): boolean {
    const students = this.getStudents();
    const s = students.find(item => item.id === studentId);
    if (s) {
      s.isActive = s.isActive === false ? true : false;
      this.saveStudents(students);
      backgroundSync(() => supabase.from('mms_students').update({ isActive: s.isActive }).eq('id', studentId));
      return s.isActive;
    }
    return true;
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

  toggleTeacherActive(teacherId: string): boolean {
    const teachers = this.getTeachers();
    const t = teachers.find(item => item.id === teacherId);
    if (t) {
      t.isActive = t.isActive === false ? true : false;
      this.saveTeachers(teachers);
      backgroundSync(() => supabase.from('mms_teachers').update({ isActive: t.isActive }).eq('id', teacherId));
      return t.isActive;
    }
    return true;
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

  // ================= DEPARTMENTS =================
  getDepartments(madrasaId?: string): Department[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    const list: Department[] = data ? JSON.parse(data) : initialDepartments;
    if (!data) localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(initialDepartments));
    if (madrasaId) {
      return list.filter(d => !d.madrasaId || d.madrasaId === madrasaId);
    }
    return list;
  },

  saveDepartments(departments: Department[]) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  },

  addDepartment(dept: Department) {
    const current = this.getDepartments();
    const updated = [dept, ...current.filter(d => d.id !== dept.id)];
    this.saveDepartments(updated);
    backgroundSync(() => supabase.from('mms_departments').upsert(dept));
    return dept;
  },

  updateDepartment(dept: Department) {
    const current = this.getDepartments();
    const index = current.findIndex(d => d.id === dept.id);
    if (index >= 0) {
      current[index] = dept;
      this.saveDepartments(current);
    } else {
      this.addDepartment(dept);
    }
    backgroundSync(() => supabase.from('mms_departments').upsert(dept));
    return dept;
  },

  deleteDepartment(deptId: string) {
    const current = this.getDepartments();
    const updated = current.filter(d => d.id !== deptId);
    this.saveDepartments(updated);
    backgroundSync(() => supabase.from('mms_departments').delete().eq('id', deptId));
  },

  // ================= MANUAL HOLIDAYS =================
  getManualHolidays(madrasaId?: string): ManualHoliday[] {
    const data = localStorage.getItem(STORAGE_KEYS.MANUAL_HOLIDAYS);
    const list: ManualHoliday[] = data ? JSON.parse(data) : initialManualHolidays;
    if (!data) localStorage.setItem(STORAGE_KEYS.MANUAL_HOLIDAYS, JSON.stringify(initialManualHolidays));
    if (madrasaId) {
      return list.filter(h => !h.madrasaId || h.madrasaId === madrasaId);
    }
    return list;
  },

  saveManualHolidays(holidays: ManualHoliday[]) {
    localStorage.setItem(STORAGE_KEYS.MANUAL_HOLIDAYS, JSON.stringify(holidays));
  },

  addManualHoliday(holiday: ManualHoliday) {
    const current = this.getManualHolidays();
    const updated = [holiday, ...current.filter(h => h.id !== holiday.id && h.date !== holiday.date)];
    this.saveManualHolidays(updated);
    backgroundSync(() => supabase.from('mms_manual_holidays').upsert(holiday));
    return holiday;
  },

  deleteManualHoliday(holidayIdOrDate: string) {
    const current = this.getManualHolidays();
    const updated = current.filter(h => h.id !== holidayIdOrDate && h.date !== holidayIdOrDate);
    this.saveManualHolidays(updated);
    backgroundSync(() => supabase.from('mms_manual_holidays').delete().eq('id', holidayIdOrDate));
  },

  // Book Aliases (Subject = Book)
  getBooks(madrasaId?: string): Subject[] {
    return this.getSubjects(madrasaId);
  },
  saveBooks(books: Subject[]) {
    this.saveSubjects(books);
  },
  addBook(book: Subject) {
    return this.addSubject(book);
  },
  updateBook(book: Subject) {
    return this.updateSubject(book);
  },
  deleteBook(bookId: string) {
    this.deleteSubject(bookId);
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

  getSchedule(madrasaId?: string): ScheduleItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    const schedule: ScheduleItem[] = data ? JSON.parse(data) : initialSchedule;
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(initialSchedule));
      return initialSchedule;
    }
    if (madrasaId) {
      return schedule.filter(s => !(s as any).madrasaId || (s as any).madrasaId === madrasaId);
    }
    return schedule;
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

  // ==========================================
  // EXAMINATIONS & RESULTS CRUD
  // ==========================================
  getExaminations(madrasaId?: string): Examination[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMINATIONS);
    let list: Examination[] = raw ? JSON.parse(raw) : [];
    if (!raw || list.length === 0) {
      list = [
        {
          id: 'exam-1',
          madrasaId: madrasaId || 'madrasa-1',
          title: 'Quarterly Tajweed & Hifz Assessment',
          titleUrdu: 'سہ ماہی امتحانِ تجوید و حفظ قرآن',
          term: 'Quarterly',
          academicYear: '1447-1448 H / 2026',
          classId: 'cls-1',
          className: 'Hifz Section A',
          startDate: '2026-09-15',
          endDate: '2026-09-20',
          status: 'Ongoing',
          subjects: [
            { id: 'sbj-1', name: 'Hifz Revision (Manzil)', nameUrdu: 'حفظ منزل', maxMarks: 100, passMarks: 40 },
            { id: 'sbj-2', name: 'Makharij & Tajweed Rules', nameUrdu: 'مخارج و قواعد تجوید', maxMarks: 50, passMarks: 20 },
            { id: 'sbj-3', name: 'Islamic Adab & Sunan', nameUrdu: 'اسلامی آداب و مسنون دعائیں', maxMarks: 50, passMarks: 20 },
          ],
          results: []
        },
        {
          id: 'exam-2',
          madrasaId: madrasaId || 'madrasa-1',
          title: 'Half-Yearly Dars-e-Nizami Examination',
          titleUrdu: 'شش ماہی امتحانِ درسِ نظامی',
          term: 'Half-Yearly',
          academicYear: '1447-1448 H / 2026',
          classId: 'cls-4',
          className: 'Alimiyat Year 1',
          startDate: '2026-11-10',
          endDate: '2026-11-20',
          status: 'Upcoming',
          subjects: [
            { id: 'sbj-4', name: 'Arabic Grammar (Nahw & Sarf)', nameUrdu: 'نحو و صرف', maxMarks: 100, passMarks: 40 },
            { id: 'sbj-5', name: 'Fiqh (Nur al-Idah)', nameUrdu: 'فقہ (نور الایضاح)', maxMarks: 100, passMarks: 40 },
            { id: 'sbj-6', name: 'Hadith (Zad al-Talibin)', nameUrdu: 'حدیث (زاد الطالبین)', maxMarks: 100, passMarks: 40 },
          ],
          results: []
        }
      ];
      localStorage.setItem(STORAGE_KEYS.EXAMINATIONS, JSON.stringify(list));
    }
    if (madrasaId) {
      return list.filter(e => !e.madrasaId || e.madrasaId === madrasaId);
    }
    return list;
  },

  saveExamination(exam: Examination): Examination {
    const list = this.getExaminations();
    const index = list.findIndex(e => e.id === exam.id);
    if (index >= 0) {
      list[index] = exam;
    } else {
      list.unshift(exam);
    }
    localStorage.setItem(STORAGE_KEYS.EXAMINATIONS, JSON.stringify(list));
    backgroundSync(() => supabase.from('mms_examinations').upsert(exam));
    return exam;
  },

  deleteExamination(id: string): boolean {
    const list = this.getExaminations().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMINATIONS, JSON.stringify(list));
    backgroundSync(() => supabase.from('mms_examinations').delete().eq('id', id));
    return true;
  },

  recordExamResult(examId: string, result: ExamStudentResult): Examination | null {
    const list = this.getExaminations();
    const exam = list.find(e => e.id === examId);
    if (!exam) return null;

    exam.results = exam.results || [];
    const rIndex = exam.results.findIndex(r => r.studentId === result.studentId);
    if (rIndex >= 0) {
      exam.results[rIndex] = result;
    } else {
      exam.results.push(result);
    }
    this.saveExamination(exam);
    return exam;
  },

  // ==========================================
  // INVENTORY ASSETS CRUD
  // ==========================================
  getInventory(madrasaId?: string): InventoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    let list: InventoryItem[] = raw ? JSON.parse(raw) : [];
    if (!raw || list.length === 0) {
      list = [
        { id: 'inv-1', madrasaId: madrasaId || 'madrasa-1', item: 'Quran Majeed (Tajweed 16 Lines)', itemUrdu: 'قرآن مجید ۱۶ سطری', quantity: 250, category: 'Kitabs', status: 'Available', minThreshold: 50, location: 'Central Maktabah' },
        { id: 'inv-2', madrasaId: madrasaId || 'madrasa-1', item: 'Rihal (Wooden Bookstands)', itemUrdu: 'لکڑی کی رحل', quantity: 180, category: 'Furniture', status: 'In Use', minThreshold: 20, location: 'Hifz Classrooms' },
        { id: 'inv-3', madrasaId: madrasaId || 'madrasa-1', item: 'Hostel Bedding & Blankets', itemUrdu: 'ہاسٹل بستر و کمبل', quantity: 95, category: 'Hostel', status: 'Available', minThreshold: 30, location: 'Hostel Block A' },
        { id: 'inv-4', madrasaId: madrasaId || 'madrasa-1', item: 'Whiteboards & Markers', itemUrdu: 'وائٹ بورڈ و مارکرز', quantity: 12, category: 'Classroom', status: 'Available', minThreshold: 5, location: 'Staff Room' },
        { id: 'inv-5', madrasaId: madrasaId || 'madrasa-1', item: 'Public Address & Azan Speaker System', itemUrdu: 'لاؤڈ اسپیکر و مائک', quantity: 4, category: 'Audio', status: 'Available', minThreshold: 2, location: 'Masjid Hall' },
        { id: 'inv-6', madrasaId: madrasaId || 'madrasa-1', item: 'Cooking Rice & Grains', itemUrdu: 'چاول و اناج راشن', quantity: 40, category: 'Kitchen / Mess', status: 'Low', minThreshold: 50, unit: 'Kg', location: 'Matbakh (Mess)' },
        { id: 'inv-7', madrasaId: madrasaId || 'madrasa-1', item: 'Cooking Oil', itemUrdu: 'تیل و گھی', quantity: 8, category: 'Kitchen / Mess', status: 'Low', minThreshold: 25, unit: 'Liters', location: 'Matbakh (Mess)' }
      ];
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
    }
    if (madrasaId) {
      return list.filter(i => !i.madrasaId || i.madrasaId === madrasaId);
    }
    return list;
  },

  saveInventoryItem(item: InventoryItem): InventoryItem {
    const list = this.getInventory();
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
    backgroundSync(() => supabase.from('mms_inventory').upsert(item));
    return item;
  },

  deleteInventoryItem(id: string): boolean {
    const list = this.getInventory().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
    backgroundSync(() => supabase.from('mms_inventory').delete().eq('id', id));
    return true;
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
