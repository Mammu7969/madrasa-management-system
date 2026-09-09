import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, PhoneCall, Mail, MessageSquare, ShieldCheck, ExternalLink } from 'lucide-react';

export const SupportModule: React.FC = () => {
  const { activeMadrasa } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-m3-on-surface flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-m3-primary" />
            <span>Support & Help Center (مدد و معاونت)</span>
          </h2>
          <p className="text-xs text-m3-on-surface-variant">
            Technical assistance, user guide documentation, and direct helpline
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-m3-primary flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Institutional Helpline</h3>
          <p className="text-xs text-gray-500">Call technical support for software installation, printer setup, or database migration.</p>
          <p className="text-sm font-black font-mono text-emerald-800 pt-2">+91 98480 22334</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Email Inquiries</h3>
          <p className="text-xs text-gray-500">Submit requests for custom reports, new student fields, or multi-campus synchronization.</p>
          <p className="text-xs font-bold text-blue-800 font-mono pt-2">support@madrasamanagement.org</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">MMS Pro Architecture</h3>
          <p className="text-xs text-gray-500">Version 2.4 Desktop &bull; Built with Material-3 Design System with Bilingual English & Urdu support.</p>
          <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
            Licensed to: {activeMadrasa?.name}
          </span>
        </div>
      </div>
    </div>
  );
};
