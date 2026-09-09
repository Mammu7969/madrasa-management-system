import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import { 
  Search, 
  User, 
  Users, 
  GraduationCap, 
  Wallet, 
  CalendarCheck, 
  Settings, 
  Globe, 
  Maximize, 
  Download, 
  ArrowRight,
  Sparkles,
  BookOpen,
  BookMarked,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  onSelectStudent: (student: Student) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectStudent
}) => {
  const { activeMadrasa } = useAuth();
  const { setLanguage, toggleFullscreen, showToast } = useTheme();

  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const students = db.getStudents(activeMadrasa?.id);
  const teachers = db.getTeachers(activeMadrasa?.id);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filtered items
  const cleanQ = query.toLowerCase().trim();

  const matchingStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(cleanQ) ||
    s.studentNameUrdu.includes(cleanQ) ||
    s.admissionNo.toLowerCase().includes(cleanQ) ||
    s.class.toLowerCase().includes(cleanQ)
  ).slice(0, 5);

  const systemActions = [
    { id: 'act-quran', label: 'Open Holy Quran (القرآن الكريم - ۳۰ پارے)', icon: BookOpen, run: () => onNavigateTab('quran') },
    { id: 'act-add-student', label: 'Add New Student Admission', icon: Users, run: () => onNavigateTab('students_add') },
    { id: 'act-attendance', label: 'Take Daily Class Attendance', icon: CalendarCheck, run: () => onNavigateTab('attendance') },
    { id: 'act-roznamcha', label: 'Open Daily Roznamcha (روزنامچہ کارگزاری)', icon: BookMarked, run: () => onNavigateTab('roznamcha') },
    { id: 'act-fee', label: 'Collect Student Monthly Fee', icon: Wallet, run: () => onNavigateTab('fees') },
    { id: 'act-schedule', label: 'View Madrasa Prayer Schedule', icon: CalendarCheck, run: () => onNavigateTab('schedule') },
    { id: 'act-backup', label: 'Backup Database to JSON', icon: Download, run: () => {
      const blob = new Blob([db.exportDatabaseJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `madrasa_backup_${Date.now()}.json`;
      a.click();
      showToast('Database exported!', 'success');
    }},
    { id: 'act-fullscreen', label: 'Toggle Fullscreen Mode', icon: Maximize, run: () => toggleFullscreen() },
    { id: 'act-ur', label: 'Switch Language to Urdu (اردو)', icon: Globe, run: () => setLanguage('ur') },
    { id: 'act-en', label: 'Switch Language to English', icon: Globe, run: () => setLanguage('en') },
  ].filter(a => a.label.toLowerCase().includes(cleanQ));

  const totalResults = matchingStudents.length + systemActions.length;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalResults || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalResults) % (totalResults || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < matchingStudents.length) {
        onSelectStudent(matchingStudents[selectedIndex]);
        onClose();
      } else {
        const actionIdx = selectedIndex - matchingStudents.length;
        if (systemActions[actionIdx]) {
          systemActions[actionIdx].run();
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 text-center">
        <div 
          className="w-full max-w-xl transform overflow-hidden rounded-3xl bg-white/90 backdrop-blur-2xl text-left align-middle shadow-[0_25px_70px_rgba(18,59,99,0.18)] border border-white/90 animate-in zoom-in-95 duration-200"
          onKeyDown={handleKeyDown}
        >
          {/* Search Header Bar */}
          <div className="flex items-center px-4 border-b border-white/70 bg-white/50 backdrop-blur-md">
            <Search className="w-5 h-5 text-m3-primary shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search students, admission no, actions, or type a command..."
              className="w-full py-4 text-sm font-medium bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-gray-500 rounded border shadow-xs">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {/* Students Category */}
            {matchingStudents.length > 0 && (
              <div className="mb-2">
                <span className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Students ({matchingStudents.length})
                </span>
                {matchingStudents.map((st, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        onSelectStudent(st);
                        onClose();
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={st.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{st.studentName}</span>
                            <span className="text-xs text-emerald-700 font-urdu urdu-font">{st.studentNameUrdu}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">{st.admissionNo} &bull; {st.class}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        Open Profile <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions Category */}
            {systemActions.length > 0 && (
              <div>
                <span className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Commands & Actions
                </span>
                {systemActions.map((act, idx) => {
                  const itemIndex = matchingStudents.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      onClick={() => {
                        act.run();
                        onClose();
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100/60 text-emerald-800 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs">{act.label}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">Run &crarr;</span>
                    </div>
                  );
                })}
              </div>
            )}

            {totalResults === 0 && (
              <div className="p-8 text-center text-xs text-gray-500">
                No matching students or commands found for "{query}".
              </div>
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2.5 border-t border-m3-outline-variant/30 bg-m3-surface-container-low flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px] font-mono">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px] font-mono">ENTER</kbd>
              to select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
