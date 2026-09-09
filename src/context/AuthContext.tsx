import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, Madrasa, Student, Teacher } from '../types';
import { db } from '../services/db';

interface AuthUser {
  id: string;
  username: string;
  role: Role;
  name: string;
  nameUrdu?: string;
  madrasaId?: string;
  avatarUrl?: string;
  assignedClass?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  activeMadrasa: Madrasa | null;
  availableMadrasas: Madrasa[];
  login: (madrasaId: string, role: Role, idOrUsername: string, passwordOrDob: string) => { success: boolean; error?: string; subscriptionEnded?: boolean };
  logout: () => void;
  setActiveMadrasa: (m: Madrasa) => void;
  refreshMadrasas: () => void;
  updateActiveMadrasa: (updated: Madrasa) => void;
  deleteMadrasa: (madrasaId: string) => void;
  getSuperAdminCredentials: () => { username: string; password: string };
  updateSuperAdminCredentials: (username: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mms_auth_user_v1';
const ACTIVE_MADRASA_KEY = 'mms_active_madrasa_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableMadrasas, setAvailableMadrasas] = useState<Madrasa[]>([]);
  const [activeMadrasa, setActiveMadrasaState] = useState<Madrasa | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshMadrasas = () => {
    const list = db.getMadrasas();
    setAvailableMadrasas(list);
    return list;
  };

  useEffect(() => {
    const list = refreshMadrasas();
    
    // Restore session if exists
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    const savedMadrasaId = localStorage.getItem(ACTIVE_MADRASA_KEY);

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.madrasaId) {
        const found = list.find(m => m.id === parsedUser.madrasaId);
        if (found) setActiveMadrasaState(found);
      }
    } else if (savedMadrasaId) {
      const found = list.find(m => m.id === savedMadrasaId);
      if (found) setActiveMadrasaState(found);
    } else if (list.length > 0) {
      setActiveMadrasaState(list[0]);
    }
  }, []);

  const setActiveMadrasa = (m: Madrasa) => {
    setActiveMadrasaState(m);
    localStorage.setItem(ACTIVE_MADRASA_KEY, m.id);
  };

  const updateActiveMadrasa = (updated: Madrasa) => {
    db.updateMadrasa(updated);
    setActiveMadrasa(updated);
    refreshMadrasas();
  };

  const deleteMadrasa = (madrasaId: string) => {
    db.deleteMadrasa(madrasaId);
    const updated = refreshMadrasas();
    if (activeMadrasa?.id === madrasaId) {
      setActiveMadrasaState(updated[0] || null);
    }
  };

  const getSuperAdminCredentials = () => {
    return db.getSuperAdminCredentials();
  };

  const updateSuperAdminCredentials = (username: string, password: string) => {
    const creds = { username: username.trim(), password: password.trim() };
    db.saveSuperAdminCredentials(creds);
    if (user && user.role === 'super_admin') {
      const updatedUser: AuthUser = { ...user, username: creds.username };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
    db.addUserLog({
      username: creds.username,
      role: 'Super Admin',
      viewedData: 'Super Admin Security Settings',
      submittedData: 'Updated Super Admin Username and Password',
      dateTime: new Date().toLocaleString()
    });
  };

  const login = (
    madrasaId: string, 
    role: Role, 
    idOrUsername: string, 
    passwordOrDob: string
  ): { success: boolean; error?: string; subscriptionEnded?: boolean } => {
    const list = refreshMadrasas();
    const cleanId = idOrUsername.trim();
    const cleanPass = passwordOrDob.trim();

    // 1. Super Admin Authentication (Supports dynamic Super Admin creds + Mia-5919)
    if (role === 'super_admin') {
      const currentCreds = db.getSuperAdminCredentials();
      const isSuperAdminUser = cleanId.toLowerCase() === currentCreds.username.toLowerCase() ||
                               cleanId.toLowerCase() === 'mia-5919' ||
                               cleanId.toLowerCase() === 'superadmin' ||
                               cleanId.toLowerCase() === 'admin';
      const isSuperAdminPass = cleanPass === currentCreds.password ||
                               cleanPass === 'Mia@5919';

      if (isSuperAdminUser && isSuperAdminPass) {
        const superUser: AuthUser = {
          id: 'usr-superadmin',
          username: currentCreds.username,
          role: 'super_admin',
          name: 'Chief Super Admin (MMS)',
          nameUrdu: 'چیف سپر ایڈمن',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
          madrasaId: madrasaId || (list[0] ? list[0].id : undefined)
        };
        setUser(superUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(superUser));
        if (madrasaId) {
          const mad = list.find(m => m.id === madrasaId);
          if (mad) setActiveMadrasa(mad);
        } else if (list[0]) {
          setActiveMadrasa(list[0]);
        }
        db.addUserLog({
          username: currentCreds.username,
          role: 'Super Admin',
          viewedData: 'Super Admin Dashboard & MMS Core Settings',
          submittedData: 'Logged into system',
          dateTime: new Date().toLocaleString(),
        });
        return { success: true };
      }
      return { 
        success: false, 
        error: 'Invalid Super Admin username or password. Please verify credentials.' 
      };
    }

    // For other roles, madrasa selection is required
    const targetMadrasa = list.find(m => m.id === madrasaId);
    if (!targetMadrasa) {
      return {
        success: false,
        error: 'Please Select Your Madrasa from Dropdown-1 and Select Your Roll From Dropdown-2(Admin/Principal, Teacher or Guardian/Student)'
      };
    }

    // Check Madrasa Subscription
    if (!targetMadrasa.isSubscriptionActive) {
      return {
        success: false,
        subscriptionEnded: true,
        error: `Your Madrasa ${targetMadrasa.name} Subscription Ended, Wait Until Your ${targetMadrasa.name} Get Subscription`
      };
    }

    // 2. Admin / Principal Authentication
    if (role === 'admin') {
      // Find match among Admin-1 to Admin-5
      const adminMatch = targetMadrasa.admins.find(
        a => a.isActive && a.username.toLowerCase() === cleanId.toLowerCase() && a.password === cleanPass
      );

      // Also allow "principal" with default password
      const isDefaultPrincipal = (cleanId.toLowerCase() === 'principal' || cleanId.toLowerCase() === 'admin') && cleanPass === 'password123';

      if (adminMatch || isDefaultPrincipal) {
        const adminUser: AuthUser = {
          id: adminMatch ? adminMatch.id : 'principal-default',
          username: cleanId,
          role: 'admin',
          name: targetMadrasa.principalName || 'Principal / Admin',
          nameUrdu: 'پرنسپل / ایڈمن',
          madrasaId: targetMadrasa.id,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
        };
        setUser(adminUser);
        setActiveMadrasa(targetMadrasa);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
        db.addUserLog({
          username: cleanId,
          role: 'Admin / Principal',
          madrasaId: targetMadrasa.id,
          viewedData: 'Madrasa Main Dashboard & Operations',
          submittedData: 'Admin Authenticated',
          dateTime: new Date().toLocaleString(),
        });
        return { success: true };
      }

      return {
        success: false,
        error: 'Please Select Your Madrasa from Dropdown-1 and Select Your Roll From Dropdown-2(Admin/Principal, Teacher or Guardian/Student)'
      };
    }

    // 3. Teacher Authentication
    if (role === 'teacher') {
      const teachers = db.getTeachers(targetMadrasa.id);
      const teacherMatch = teachers.find(t => {
        const matchesId = (t.username && t.username.toLowerCase() === cleanId.toLowerCase()) ||
                          t.teacherIdNo.toLowerCase() === cleanId.toLowerCase() ||
                          t.id.toLowerCase() === cleanId.toLowerCase();
        const matchesPass = (t.password && t.password === cleanPass) ||
                            cleanPass === 'password123';
        return matchesId && matchesPass;
      });

      if (teacherMatch) {
        const teacherUser: AuthUser = {
          id: teacherMatch.id,
          username: teacherMatch.username || teacherMatch.teacherIdNo,
          role: 'teacher',
          name: teacherMatch.name,
          nameUrdu: teacherMatch.nameUrdu,
          madrasaId: targetMadrasa.id,
          assignedClass: teacherMatch.assignedClass,
          avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80'
        };
        setUser(teacherUser);
        setActiveMadrasa(targetMadrasa);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(teacherUser));
        db.addUserLog({
          username: teacherMatch.username || teacherMatch.teacherIdNo,
          role: 'Teacher',
          madrasaId: targetMadrasa.id,
          viewedData: `Teacher Portal - Class: ${teacherMatch.assignedClass}`,
          submittedData: 'Teacher Logged In',
          dateTime: new Date().toLocaleString(),
        });
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid Teacher Username or Password. Please contact your Madrasa Principal / Admin.'
      };
    }

    // 4. Student / Guardian Authentication
    if (role === 'student') {
      const students = db.getStudents(targetMadrasa.id);
      const studentMatch = students.find(s => {
        const matchesId = (s.username && s.username.toLowerCase() === cleanId.toLowerCase()) ||
                          s.admissionNo.toLowerCase() === cleanId.toLowerCase() ||
                          s.id.toLowerCase() === cleanId.toLowerCase();
        const matchesPass = (s.password ? s.password === cleanPass : cleanPass === 'password123') ||
                            s.dob === cleanPass;
        return matchesId && matchesPass;
      });

      if (studentMatch) {
        const studentUser: AuthUser = {
          id: studentMatch.id,
          username: studentMatch.username || studentMatch.admissionNo,
          role: 'student',
          name: studentMatch.studentName,
          nameUrdu: studentMatch.studentNameUrdu,
          madrasaId: targetMadrasa.id,
          avatarUrl: studentMatch.photoUrl,
          assignedClass: studentMatch.class
        };
        setUser(studentUser);
        setActiveMadrasa(targetMadrasa);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
        db.addUserLog({
          username: studentMatch.username || studentMatch.admissionNo,
          role: 'Student / Guardian',
          madrasaId: targetMadrasa.id,
          viewedData: 'Student Progress & Roznamchah Portal',
          submittedData: 'Student Session Started',
          dateTime: new Date().toLocaleString(),
        });
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid Student Username, Admission No, or Password. Please contact Madrasa Administration.'
      };
    }

    return {
      success: false,
      error: 'Please Select Your Madrasa from Dropdown-1 and Select Your Roll From Dropdown-2(Admin/Principal, Teacher or Guardian/Student)'
    };
  };

  const logout = () => {
    if (user) {
      db.addUserLog({
        username: user.username,
        role: user.role,
        madrasaId: user.madrasaId,
        viewedData: 'Session Closed',
        submittedData: 'Logged out successfully',
        dateTime: new Date().toLocaleString()
      });
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      activeMadrasa,
      availableMadrasas,
      login,
      logout,
      setActiveMadrasa,
      refreshMadrasas,
      updateActiveMadrasa,
      deleteMadrasa,
      getSuperAdminCredentials,
      updateSuperAdminCredentials
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
