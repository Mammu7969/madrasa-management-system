import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Bell, Plus, Send } from 'lucide-react';
import { Modal } from '../common/Modal';

export const NoticeBoardModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { showToast } = useTheme();

  const [notices, setNotices] = useState(() => db.getNotices(activeMadrasa?.id));
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [priority, setPriority] = useState<'High' | 'Normal'>('Normal');
  const [target, setTarget] = useState<'All' | 'Teachers' | 'Students'>('All');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeMadrasa) return;

    db.addNotice({
      madrasaId: activeMadrasa.id,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      priority,
      target
    });

    setNotices(db.getNotices(activeMadrasa.id));
    showToast('Notice published successfully!', 'success');
    setTitle('');
    setContent('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1">
        <div>
          <h2 className="text-lg font-bold text-m3-on-surface flex items-center gap-2">
            <Bell className="w-5 h-5 text-m3-primary" />
            <span>Notice Board & Circulars (نوٹس بورڈ)</span>
          </h2>
          <p className="text-xs text-m3-on-surface-variant">
            Publish announcements and academic notifications to student and teacher portals
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-m3-primary text-white text-xs font-bold shadow-m3-1"
        >
          <Plus className="w-4 h-4" />
          <span>New Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.map(n => (
          <div key={n.id} className="p-5 bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                n.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {n.priority} Priority
              </span>
              <span className="text-xs font-mono text-gray-500">{n.date}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">{n.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{n.content}</p>
            <div className="pt-2 border-t text-[10px] text-gray-400 font-semibold">
              Audience: {n.target}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Publish New Circular"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-gray-600">Cancel</button>
            <button onClick={handleCreate} className="px-5 py-2 text-xs font-bold bg-m3-primary text-white rounded-full">Publish</button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="text-xs font-bold block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border bg-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2 text-xs rounded-xl border bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Audience</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full p-2 text-xs rounded-xl border bg-white"
              >
                <option value="All">All Portals</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Students">Students Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Content</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border bg-white"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
