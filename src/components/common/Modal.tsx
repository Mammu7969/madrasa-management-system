import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  allowPrint?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '2xl',
  allowPrint = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${!allowPrint ? 'no-print' : ''}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity no-print"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className={`w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-3xl bg-white dark:bg-m3-surface-container text-left align-middle shadow-m3-3 transition-all border border-m3-outline-variant/30 animate-in zoom-in-95 duration-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-m3-outline-variant/20 px-6 py-4.5 bg-m3-surface-container-low dark:bg-m3-surface-container-high/50">
            <div>
              <h3 className="text-lg font-bold text-m3-on-surface tracking-tight">{title}</h3>
              {subtitle && (
                <p className="text-xs text-m3-on-surface-variant mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high transition-all active:scale-95 no-print"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[78vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-m3-outline-variant/20 px-6 py-4 bg-m3-surface-container-low dark:bg-m3-surface-container-high/30 no-print">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
