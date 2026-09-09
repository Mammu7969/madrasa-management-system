export type Role = 'super_admin' | 'admin' | 'teacher' | 'student';

export interface MadrasaAdmin {
  id: string;
  slot: 'Admin-1' | 'Admin-2' | 'Admin-3' | 'Admin-4' | 'Admin-5';
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
}

export interface MadrasaClass {
  id: string;
  name: string;
  nameUrdu?: string;
  category: string;
  incharge: string;
  startTime?: string;
  endTime?: string;
  schedule?: string;
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
  author?: string;
  madrasaId: string;
  description?: string;
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
  designation?: string;
  salary?: number;
  email?: string;
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

export interface AttendanceRecord {
  id: string;
  studentId: string;
  madrasaId: string;
  class: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Late';
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
