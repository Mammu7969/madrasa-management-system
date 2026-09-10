export type Role = 'super_admin' | 'admin' | 'teacher' | 'student';

export interface MadrasaAdmin {
  id: string;
  slot: 'Admin-1' | 'Admin-2' | 'Admin-3' | 'Admin-4' | 'Admin-5';
  name?: string;
  nameUrdu?: string;
  subTitle?: 'Admin' | 'Principal' | 'Supervisor' | string;
  profilePicUrl?: string;
  mobileNumber?: string;
  username: string;
  password: string;
  isActive: boolean;
}

export interface Madrasa {
  id: string;
  name: string;
  nameUrdu: string;
  code: string;
  address: string;
  principalName: string;
  contactNumber: string;
  logoUrl?: string;
  subscriptionStart: string; // YYYY-MM-DD
  subscriptionEnd: string;   // YYYY-MM-DD
  isSubscriptionActive: boolean;
  cloudSyncEnabled: boolean;
  admins: MadrasaAdmin[];
}

export interface Student {
  id: string;
  admissionNo: string;
  admissionDate: string;
  studentName: string;
  studentNameUrdu: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianOccupation: string;
  contactNumber: string;
  address: string;
  village?: string;
  category: 'Hostel' | 'Day Scholar';
  sponsorship: 'Self-Sponsored' | 'Discounted' | 'Non-Sponsored' | 'Sponsored by';
  kafeelName?: string;
  monthlyFees: number;
  previousSchool: string;
  previousStudy: string;
  previousStudyCertificateUrl?: string;
  aadharCardUrl?: string;
  aadharNumber: string;
  photoUrl: string;
  class: string;
  madrasaId: string;
  totalPresentsYearly: number;
  totalPresentsMonthly: number;
  totalAbsentsYearly: number;
  totalAbsentsMonthly: number;
  presentSabaqAt: string;
  username?: string;
  password?: string;
  dob: string;
  isActive?: boolean;
  classHistory?: StudentClassTransferLog[];
}

export interface StudentClassTransferLog {
  id: string;
  fromClass: string;
  toClass: string;
  date: string;
  reason?: string;
  by: string;
  promotedBy?: string;
}

export interface Department {
  id: string;
  name: string;
  nameUrdu?: string;
  code?: string;
  description?: string;
  madrasaId?: string;
  createdAt?: string;
}

export interface AssignedClassBook {
  id?: string;
  departmentId: string;
  departmentName: string;
  bookId: string;
  bookName: string;
  totalPages?: number;
  teacherName?: string;
}

export interface MadrasaClass {
  id: string;
  name: string;
  nameUrdu?: string;
  departmentId?: string;
  category: string;
  incharge: string;
  priority?: number; // Attendance priority: 1, 2, 3...
  assignedBooks?: AssignedClassBook[];
  startTime?: string;
  endTime?: string;
  schedule?: string;
  weekDays?: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  room?: string;
  capacity?: number;
  madrasaId: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  nameUrdu?: string;
  bookName?: string;
  bookNameUrdu?: string;
  className: string;
  totalPages: number;
  teacherName?: string;
  category?: string;
  departmentId?: string;
  departmentName?: string;
  author?: string;
  madrasaId: string;
  description?: string;
}

export type Book = Subject;

export interface ManualHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  madrasaId?: string;
  announcedBy?: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  teacherIdNo: string;
  name: string;
  nameUrdu: string;
  assignedClass: string;
  phone: string;
  qualification: string;
  madrasaId: string;
  username?: string;
  password?: string;
  dob?: string;
  joiningDate?: string;
  isPresentToday: boolean;
  isActive?: boolean;
  designation?: string;
  salary?: number;
  email?: string;
  photoUrl?: string;
}

export interface Staff {
  id: string;
  staffIdNo: string;
  name: string;
  nameUrdu?: string;
  role: string;
  roleUrdu?: string;
  department: string;
  departmentUrdu?: string;
  phone: string;
  email?: string;
  address?: string;
  salary: number;
  joiningDate?: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  madrasaId: string;
  avatarUrl?: string;
  notes?: string;
}

export type SessionTimeSlot = 'morning' | 'evening';

export interface DailyAttendanceSlot {
  morning: 'P' | 'A' | 'L' | 'O';
  evening: 'P' | 'A' | 'L' | 'O';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  madrasaId: string;
  class: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Late';
  session?: SessionTimeSlot;
  markedBy: string;
}

export type RoznamchahDepartment = 'hifz' | 'nazira_qaida';

export interface HifzRoznamchahData {
  sabaqQuantity: string;        // مقدار سبق (e.g. 1 Page, 1/2 Page, 10 Lines)
  sabaqPara: string;            // پارہ سبق (e.g. Para 15, Surah Al-Isra)
  sabaqMistakes: number;        // اغلاط (سبق)
  sabaqListener: string;        // سامع پارہ سبق
  amookhtaQuantity: string;     // مقدارِ آموختہ (e.g. 1/2 Para, 1 Para)
  amookhtaMistakes: number;     // اغلاط (آموختہ)
  amookhtaListener: string;     // سامع آموختہ
  kaifiyat: string;             // کیفیت (Evaluation remarks)
  grade?: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Hasan' | 'Maqbool' | 'Daeef';
}

export interface NaziraQaidaRoznamchahData {
  sabaq: string;                // سبق (e.g. Takhti 4: Harkat, Para 1 Ruku 2)
  amookhtaQuantity: string;     // مقدارِ آموختہ
  amookhtaMistakes: number;     // اغلاط
  amookhtaListener: string;     // سامع آموختہ
  kaifiyat: string;             // کیفیت
  grade?: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Hasan' | 'Maqbool' | 'Daeef';
}

export interface RoznamchahRecord {
  id: string;
  studentId: string;
  madrasaId: string;
  date: string;
  department?: RoznamchahDepartment;
  
  // Hifz Specific Fields
  sabaqQuantity?: string;        // مقدار سبق
  sabaqPara?: string;            // پارہ سبق
  sabaqMistakes?: number;        // اغلاط (سبق)
  sabaqListener?: string;        // سامع پارہ سبق
  
  // Common / Nazira Fields
  sabaq: string;                 // سبق / جدید سبق
  sabqi?: string;                // سبقی (for legacy compatibility)
  manzil?: string;               // منزل
  amookhtaQuantity?: string;     // مقدارِ آموختہ
  amookhtaMistakes?: number;     // اغلاط (آموختہ)
  amookhtaListener?: string;     // سامع آموختہ
  
  kaifiyat?: string;             // کیفیت
  remarks: string;
  grade: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Hasan' | 'Maqbool' | 'Daeef';
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  madrasaId: string;
  month: string;
  amount: number;
  date: string;
  mode: 'Cash' | 'Online' | 'Bank Transfer';
  status: 'Paid' | 'Pending';
}

export interface NamazTiming {
  azan: string;
  jamat: string;
}

export interface MadrasaNamazTimings {
  fajr: NamazTiming;
  zohr: NamazTiming;
  asar: NamazTiming;
  magrib: NamazTiming;
  isha: NamazTiming;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  titleUrdu?: string;
  description: string;
  category: 'Prayer' | 'Academic' | 'Meals' | 'Rest' | 'Sports' | 'Personal';
  madrasaId?: string;
}

export interface PeriodScheduleItem {
  id: string;
  classId: string;
  className: string;
  day: string;
  periodNumber: number;
  time: string;
  subject: string;
  teacher: string;
  room?: string;
  madrasaId?: string;
}

export interface FinanceCategoryItem {
  id: string;
  name: string;
  nameUrdu: string;
  type: 'Income' | 'Expense' | 'Both';
  subcategories: string[];
  madrasaId?: string;
}

export interface FinanceTransaction {
  id: string;
  sNo: number;
  date: string;
  particular: string;
  category: string;
  subcategory: string;
  receiptNo: string;
  type: 'Income' | 'Expense';
  incomeAmount: number;
  expenseAmount: number;
  balance: number;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI / Online';
  madrasaId?: string;
  recordedBy?: string;
  notes?: string;
}

export interface UserLog {
  id: string;
  username: string;
  role: string;
  madrasaId?: string;
  viewedData: string;
  submittedData: string;
  dateTime: string;
  reportsAndFeedback?: string;
}

export interface FeedbackItem {
  id: string;
  madrasaId: string;
  madrasaName: string;
  senderName: string;
  role: string;
  message: string;
  date: string;
  status: 'Unread' | 'Resolved';
}

export interface ProfileChangeRequest {
  id: string;
  userId: string;
  username: string;
  role: string;
  madrasaId: string;
  changeDetails: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface NoticeItem {
  id: string;
  madrasaId: string;
  title: string;
  content: string;
  date: string;
  priority: 'High' | 'Normal';
  target: 'All' | 'Teachers' | 'Students';
}

export interface GalleryItem {
  id: string;
  madrasaId: string;
  title: string;
  category: 'Campus' | 'Classes' | 'Events' | 'Hostel';
  imageUrl: string;
  date: string;
}

export interface StudentUpdateChange {
  field: string;
  label: string;
  labelUrdu?: string;
  oldValue: string;
  newValue: string;
}

export interface StudentUpdateLog {
  id: string;
  studentId: string;
  studentName?: string;
  madrasaId: string;
  updatedAt: string; // Formatted date string e.g. "2026-09-06 11:30 AM"
  updatedBy: string; // e.g. "Maulana Abdul Qadeer Qasmi (Principal / Admin)"
  changes: StudentUpdateChange[];
}

// ==========================================
// EXAMINATION & RESULT MODELS
// ==========================================
export type ExamGrade = 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Hasan' | 'Maqbool' | 'Rasib';

export interface ExamSubjectMark {
  subjectId: string;
  subjectName: string;
  subjectNameUrdu?: string;
  maxMarks: number;
  obtainedMarks: number;
}

export interface ExamStudentResult {
  studentId: string;
  studentName: string;
  studentNameUrdu?: string;
  admissionNo: string;
  className: string;
  marks: ExamSubjectMark[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  grade: ExamGrade;
  position?: number;
  remarks?: string;
}

export interface Examination {
  id: string;
  madrasaId: string;
  title: string;
  titleUrdu?: string;
  term: 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Sanad' | 'Monthly';
  academicYear: string;
  classId: string;
  className: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  subjects: {
    id: string;
    name: string;
    nameUrdu?: string;
    maxMarks: number;
    passMarks: number;
  }[];
  results: ExamStudentResult[];
  createdAt?: string;
}

// ==========================================
// INVENTORY ASSETS MODEL
// ==========================================
export interface InventoryItem {
  id: string;
  madrasaId: string;
  item: string;
  itemUrdu?: string;
  quantity: number;
  category: 'Kitabs' | 'Furniture' | 'Hostel' | 'Classroom' | 'Audio' | 'Kitchen / Mess' | 'Library';
  status: 'Available' | 'In Use' | 'Low' | 'Needs Repair';
  minThreshold?: number;
  unit?: string;
  location?: string;
  lastUpdated?: string;
}

