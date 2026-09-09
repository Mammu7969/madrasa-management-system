import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Boxes, Image as ImageIcon, Plus, Upload, Trash2, Camera } from 'lucide-react';
import { Modal } from '../common/Modal';

export const InventoryModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { t, showToast } = useTheme();

  const [activeTab, setActiveTab] = useState<'inventory' | 'gallery'>('inventory');
  const [gallery, setGallery] = useState(() => db.getGallery(activeMadrasa?.id));
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [photoTitle, setPhotoTitle] = useState<string>('');
  const [photoCategory, setPhotoCategory] = useState<'Campus' | 'Classes' | 'Events' | 'Hostel'>('Campus');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const [inventoryItems, setInventoryItems] = useState([
    { id: '1', item: 'Quran Majeed (Tajweed 16 Lines)', quantity: 250, category: 'Kitabs', status: 'Available' },
    { id: '2', item: 'Rihal (Wooden Bookstands)', quantity: 180, category: 'Furniture', status: 'In Use' },
    { id: '3', item: 'Hostel Bedding & Blankets', quantity: 95, category: 'Hostel', status: 'Good' },
    { id: '4', item: 'Whiteboards & Markers', quantity: 12, category: 'Classroom', status: 'Available' },
    { id: '5', item: 'Public Address & Azan Speaker System', quantity: 4, category: 'Audio', status: 'Active' },
    { id: '6', item: 'Dars-e-Nizami Reference Books (Maktabah)', quantity: 620, category: 'Library', status: 'Cataloged' },
  ]);

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim() || !activeMadrasa) return;

    db.addGalleryItem({
      madrasaId: activeMadrasa.id,
      title: photoTitle.trim(),
      category: photoCategory,
      imageUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
      date: new Date().toISOString().split('T')[0]
    });

    setGallery(db.getGallery(activeMadrasa.id));
    showToast('Photo uploaded to Madrasa Gallery!', 'success');
    setPhotoTitle('');
    setPhotoUrl('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-m3-outline-variant/30 shadow-m3-1">
        <div>
          <h2 className="text-lg font-bold text-m3-on-surface flex items-center gap-2">
            <Boxes className="w-5 h-5 text-m3-primary" />
            <span>Madrasa Inventory & Gallery</span>
          </h2>
          <p className="text-xs text-m3-on-surface-variant">
            Manage institutional assets, library books, and photographic gallery
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'gallery' ? (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-m3-primary text-white text-xs font-bold shadow-m3-1"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          ) : (
            <button
              onClick={() => showToast('Asset registration form opened', 'info')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-m3-primary text-white text-xs font-bold shadow-m3-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'inventory' ? 'bg-m3-primary text-white shadow-xs' : 'bg-white text-gray-700 border'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Supplies & Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'gallery' ? 'bg-m3-primary text-white shadow-xs' : 'bg-white text-gray-700 border'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Madrasa Gallery ({gallery.length})</span>
        </button>
      </div>

      {/* Inventory List */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-m3-surface-container-low border-b font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Item Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {inventoryItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{item.item}</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded bg-gray-100 font-bold">{item.category}</span></td>
                  <td className="p-4 font-mono font-bold text-m3-primary">{item.quantity}</td>
                  <td className="p-4"><span className="text-emerald-700 font-semibold">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Gallery Grid */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map(img => (
            <div key={img.id} className="bg-white rounded-3xl border border-m3-outline-variant/30 shadow-m3-1 overflow-hidden group">
              <div className="aspect-video w-full overflow-hidden relative">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  {img.category}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{img.title}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">{img.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Photo to Madrasa Gallery"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-xs text-gray-600">
              Cancel
            </button>
            <button onClick={handleUploadPhoto} className="px-5 py-2 text-xs font-bold bg-m3-primary text-white rounded-full">
              Upload
            </button>
          </div>
        }
      >
        <form onSubmit={handleUploadPhoto} className="space-y-3">
          <div>
            <label className="text-xs font-bold block mb-1">Title</label>
            <input
              type="text"
              value={photoTitle}
              onChange={(e) => setPhotoTitle(e.target.value)}
              placeholder="e.g. Annual Jalsa-e-Dastarbandi"
              className="w-full p-2 text-xs rounded-xl border bg-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Category</label>
            <select
              value={photoCategory}
              onChange={(e) => setPhotoCategory(e.target.value as any)}
              className="w-full p-2 text-xs rounded-xl border bg-white"
            >
              <option value="Campus">Campus</option>
              <option value="Classes">Classes</option>
              <option value="Events">Events</option>
              <option value="Hostel">Hostel</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Image URL</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-2 text-xs rounded-xl border bg-white"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
