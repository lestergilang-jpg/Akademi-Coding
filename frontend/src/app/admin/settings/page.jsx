'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiSave, FiInfo, FiVideo, FiImage, FiType } from 'react-icons/fi';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [landingData, setLandingData] = useState({
    hero: {
      title: '',
      subtitle: '',
      video_url: '',
      image_url: ''
    },
    registration_status: ''
  });

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings/landing_page');
      if (data.data) {
        setLandingData(prev => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings/landing_page', { value: landingData });
      toast.success('Landing page berhasil diperbarui! 🎉');
    } catch (err) {
      toast.error('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Kustomisasi Landing Page</h1>
        <p className="text-slate-500 mt-2">Atur tampilan beranda utama website Anda secara dinamis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <div className="glass-card p-6 border border-white/5 space-y-6">
          <div className="flex items-center gap-3 text-brand-400 font-bold border-b border-white/10 pb-4 mb-2 uppercase text-xs tracking-widest">
            <FiType /> Hero Section Configuration
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="label">Headline Utama (Title)</label>
              <input 
                required
                className="input-field w-full text-lg font-bold py-3" 
                value={landingData.hero.title}
                onChange={e => setLandingData({...landingData, hero: {...landingData.hero, title: e.target.value}})}
                placeholder="Contoh: Dari Nol Jadi Web Developer"
              />
            </div>
            
            <div>
              <label className="label">Sub-headline (Description)</label>
              <textarea 
                required
                rows={3}
                className="input-field w-full" 
                value={landingData.hero.subtitle}
                onChange={e => setLandingData({...landingData, hero: {...landingData.hero, subtitle: e.target.value}})}
                placeholder="Berikan deskripsi singkat yang menarik..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="label flex items-center gap-2"><FiVideo size={14}/> Embed Video URL (Youtube)</label>
                  <input 
                    className="input-field w-full" 
                    value={landingData.hero.video_url}
                    onChange={e => setLandingData({...landingData, hero: {...landingData.hero, video_url: e.target.value}})}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Kosongkan jika ingin menggunakan Gambar saja.</p>
               </div>
               <div>
                  <label className="label flex items-center gap-2"><FiImage size={14}/> Hero Image URL</label>
                  <input 
                    className="input-field w-full" 
                    value={landingData.hero.image_url}
                    onChange={e => setLandingData({...landingData, hero: {...landingData.hero, image_url: e.target.value}})}
                    placeholder="https://..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Gunakan link gambar jika tidak memakai Video.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Global Bar */}
        <div className="glass-card p-6 border border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-yellow-400 font-bold border-b border-white/10 pb-4 mb-2 uppercase text-xs tracking-widest">
            <FiInfo /> Announcement Bar
          </div>
          <div>
            <label className="label">Status Pendaftaran / Running Text</label>
            <input 
              className="input-field w-full" 
              value={landingData.registration_status}
              onChange={e => setLandingData({...landingData, registration_status: e.target.value})}
              placeholder="Contoh: Batch 7 — Slot terbatas 50 orang!"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary px-8 py-4 text-lg font-bold shadow-xl shadow-brand-500/20 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...
              </span>
            ) : (
              <span className="flex items-center gap-2"><FiSave /> Simpan Perubahan</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
