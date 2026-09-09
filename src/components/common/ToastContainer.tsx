import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none no-print">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-m3-primary shrink-0" />,
        };

        const bgColors = {
          success: 'bg-emerald-50/90 backdrop-blur-xl border-white/90 text-emerald-950 shadow-[0_10px_30px_rgba(7,150,105,0.15)]',
          warning: 'bg-amber-50/90 backdrop-blur-xl border-white/90 text-amber-950 shadow-[0_10px_30px_rgba(217,144,0,0.15)]',
          error: 'bg-rose-50/90 backdrop-blur-xl border-white/90 text-rose-950 shadow-[0_10px_30px_rgba(217,45,32,0.15)]',
          info: 'bg-white/90 backdrop-blur-xl border-white/90 text-slate-800 shadow-[0_10px_30px_rgba(18,59,99,0.1)]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border transition-all transform duration-300 animate-in fade-in slide-in-from-bottom-2 ${bgColors[toast.type]}`}
          >
            {icons[toast.type]}
            <p className="text-sm font-medium leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-black/5 transition-colors text-m3-on-surface-variant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
