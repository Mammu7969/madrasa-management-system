import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';
import { TopAppBar } from './components/layout/TopAppBar';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { MMSSettings } from './components/mms/MMSSettings';
import { StudentsList } from './components/students/StudentsList';
import { AddAdmission } from './components/students/AddAdmission';
import { StudentProfile } from './components/students/StudentProfile';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { RoznamchaModule } from './components/modules/RoznamchaModule';
import { FeesModule } from './components/modules/FeesModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { ScheduleModule } from './components/modules/ScheduleModule';
import { FinanceModule } from './components/modules/FinanceModule';
import { CertificatesModule } from './components/modules/CertificatesModule';
import { QuranModule } from './components/modules/QuranModule';
import { ExaminationsModule } from './components/modules/ExaminationsModule';
import { NoticeBoardModule } from './components/modules/NoticeBoardModule';
import { TeachersModule } from './components/modules/TeachersModule';
import { ClassesModule } from './components/modules/ClassesModule';
import { StaffModule } from './components/modules/StaffModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { SupportModule } from './components/modules/SupportModule';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { Student } from './types';
import { db } from './services/db';

type AppTab = NavigationTab | 'students_add' | 'students_profile';

const AppContent: React.FC = () => {
  const { user, activeMadrasa } = useAuth();
  const { language } = useTheme();

  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);

  // Global Keyboard Shortcuts (Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Hydrate data from Supabase backend on startup
  useEffect(() => {
    db.syncFromSupabase().then((success) => {
      if (success) {
        console.log('✅ Supabase cloud data synchronized successfully.');
      }
    });
  }, []);

  // If user is not authenticated, display the unified login page
  if (!user) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Handle student selection from anywhere
  const handleSelectStudent = (st: Student) => {
    setSelectedStudent(st);
    setCurrentTab('students_profile');
  };

  // If role is Student / Guardian
  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-transparent text-slate-800 flex flex-col">
        <TopAppBar 
          onNavigateHome={() => setCurrentTab('dashboard')} 
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <StudentDashboard />
        </main>
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onSelectStudent={handleSelectStudent}
        />
        <ToastContainer />
      </div>
    );
  }

  // If role is Teacher
  if (user.role === 'teacher') {
    return (
      <div className="min-h-screen bg-transparent text-slate-800 flex flex-col">
        <TopAppBar 
          onNavigateHome={() => setCurrentTab('dashboard')} 
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          currentTab={currentTab}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <TeacherDashboard />
        </main>
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onSelectStudent={handleSelectStudent}
        />
        <ToastContainer />
      </div>
    );
  }

  // Admin / Principal and Super Admin have full dashboard & navigation layout
  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col">
      {/* Upper Main Menu (Header) */}
      <TopAppBar 
        onNavigateHome={() => setCurrentTab('dashboard')} 
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        currentTab={currentTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Menu */}
        <Sidebar
          currentTab={currentTab as NavigationTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'students') setSelectedStudent(null);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Super Admin Dashboard (when on dashboard tab & user is super_admin) */}
            {user.role === 'super_admin' && currentTab === 'dashboard' && (
              <SuperAdminDashboard
                onOpenMadrasaDashboard={() => setCurrentTab('dashboard')}
                onOpenMMSSettings={() => setCurrentTab('mms_settings')}
              />
            )}

            {/* Principal / Admin Dashboard */}
            {user.role === 'admin' && currentTab === 'dashboard' && (
              <MainDashboard
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onSelectStudent={handleSelectStudent}
              />
            )}

            {/* Super Admin viewing Main Dashboard of selected Madrasa */}
            {user.role === 'super_admin' && currentTab === 'dashboard' && (
              <div className="mt-8 pt-8 border-t-2 border-dashed border-m3-outline-variant/40">
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                    Active Inspection: {activeMadrasa?.name}
                  </span>
                </div>
                <MainDashboard
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onSelectStudent={handleSelectStudent}
                />
              </div>
            )}

            {/* Students List */}
            {currentTab === 'students' && (
              <StudentsList
                onSelectStudent={handleSelectStudent}
                onAddNewAdmission={() => setCurrentTab('students_add')}
              />
            )}

            {/* Add New Admission */}
            {currentTab === 'students_add' && (
              <AddAdmission
                onBackToList={() => setCurrentTab('students')}
                onStudentAdded={(newSt) => {
                  setSelectedStudent(newSt);
                  setCurrentTab('students_profile');
                }}
              />
            )}

            {/* Student Profile */}
            {currentTab === 'students_profile' && selectedStudent && (
              <StudentProfile
                student={selectedStudent}
                onBackToList={() => setCurrentTab('students')}
                onUpdateStudent={(updated) => setSelectedStudent(updated)}
              />
            )}

            {/* Holy Quran Module */}
            {currentTab === 'quran' && <QuranModule />}

            {/* Attendance Module */}
            {currentTab === 'attendance' && <AttendanceModule />}

            {/* Daily Roznamcha Module */}
            {currentTab === 'roznamcha' && <RoznamchaModule />}

            {/* Fees Module */}
            {currentTab === 'fees' && <FeesModule />}

            {/* Examinations Module */}
            {currentTab === 'examinations' && <ExaminationsModule />}

            {/* Inventory & Gallery */}
            {currentTab === 'inventory' && <InventoryModule />}

            {/* Schedule & Namaz */}
            {currentTab === 'schedule' && <ScheduleModule />}

            {/* Income & Expenses */}
            {currentTab === 'income_expenses' && <FinanceModule />}

            {/* Certificates & ID Cards */}
            {currentTab === 'certificates' && <CertificatesModule />}

            {/* Reports */}
            {currentTab === 'reports' && <ReportsModule />}

            {/* Notices */}
            {currentTab === 'notices' && <NoticeBoardModule />}

            {/* Teachers */}
            {currentTab === 'teachers' && <TeachersModule />}

            {/* Classes */}
            {currentTab === 'classes' && <ClassesModule />}

            {/* Staff */}
            {currentTab === 'staff' && <StaffModule />}

            {/* Settings */}
            {currentTab === 'settings' && <SettingsModule />}

            {/* MMS Settings (Super Admin Only) */}
            {currentTab === 'mms_settings' && user.role === 'super_admin' && (
              <MMSSettings />
            )}

            {/* Support */}
            {currentTab === 'support' && <SupportModule />}
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onSelectStudent={handleSelectStudent}
      />

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
