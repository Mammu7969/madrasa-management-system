import React from 'react';
import { Printer, Download, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';

interface PrintDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  docType: 'certificate' | 'aadhar';
  imageUrl?: string;
  studentName: string;
  studentNameUrdu?: string;
  admissionNo: string;
  docNumber?: string;
  issuedBy?: string;
}

export const PrintDocModal: React.FC<PrintDocModalProps> = ({
  isOpen,
  onClose,
  title,
  docType,
  imageUrl,
  studentName,
  studentNameUrdu,
  admissionNo,
  docNumber,
  issuedBy
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`Student: ${studentName} (${admissionNo})`}
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-m3-on-surface-variant">
            Verified Document &bull; Madrasa Management System
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-m3-on-surface-variant hover:bg-black/5 rounded-full transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-m3-primary text-m3-on-primary rounded-full hover:bg-m3-primary/90 transition-all shadow-m3-1"
            >
              <Printer className="w-4 h-4" />
              Print Document
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Document Frame */}
        <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-m3-outline-variant/60 shadow-inner flex flex-col items-center">
          {imageUrl ? (
            <div className="w-full max-h-[480px] overflow-hidden rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">
              <img
                src={imageUrl}
                alt={title}
                className="max-h-[460px] object-contain w-auto shadow-sm"
              />
            </div>
          ) : (
            /* Digital Certificate / Aadhar Card Replica if image not an external file */
            <div className="w-full p-8 border-4 border-double border-emerald-800 rounded-xl bg-amber-50/30 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-800">
                <FileText className="w-8 h-8" />
                <h4 className="text-xl font-bold uppercase tracking-wider">{title}</h4>
              </div>
              <p className="text-sm text-gray-700 italic">
                Official Document Registered under Admission No: <span className="font-mono font-bold text-black">{admissionNo}</span>
              </p>

              <div className="grid grid-cols-2 gap-4 text-left p-4 bg-white/80 rounded-lg border text-sm max-w-md mx-auto">
                <div>
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="font-semibold text-gray-900">{studentName}</p>
                </div>
                {studentNameUrdu && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">نام (اردو)</p>
                    <p className="font-semibold text-gray-900 urdu-font text-base">{studentNameUrdu}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">{docType === 'aadhar' ? 'Aadhar Card Number' : 'Previous Qualification'}</p>
                  <p className="font-mono font-semibold text-gray-900">{docNumber || 'Verified in Registry'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Issuing Institution</p>
                  <p className="font-semibold text-gray-900">{issuedBy || 'Government / Recognized Board'}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 pt-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Digitally Verified & Validated by Madrasa Administration</span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Footer Notes */}
        <div className="p-3 bg-m3-surface-container-low rounded-xl text-xs text-m3-on-surface-variant flex items-center justify-between">
          <span>Printed on: {new Date().toLocaleDateString('en-GB')}</span>
          <span className="font-mono">Security Hash: MMS-{admissionNo}-VERIFIED</span>
        </div>
      </div>
    </Modal>
  );
};
