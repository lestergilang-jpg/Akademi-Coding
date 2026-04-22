'use client';
import { useState, useEffect } from 'react';
import { FiMessageSquare, FiStar, FiCheck, FiX, FiTrash2, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '@/lib/api';
import { getAvatarUrl } from '@/lib/utils';

export default function AdminTestimoniPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/admin/testimonials');
      if (res.data.success) {
        setTestimonials(res.data.data);
      }
    } catch (error) {
      console.error('Fetch testimonials error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.patch(`/admin/testimonials/${id}/status`, 
        { is_public: !currentStatus }
      );
      if (res.data.success) {
        setTestimonials(testimonials.map(t => t.id === id ? { ...t, is_public: !currentStatus } : t));
      }
    } catch (error) {
      alert('Gagal memperbarui status testimoni.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const publicCount = testimonials.filter(t => t.is_public).length;

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manajemen Testimoni</h1>
          <p className="text-slate-400 text-sm">Kelola ulasan dari para siswa Akademi Coding.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <FiCheck className="text-green-400" />
          <span className="text-sm text-slate-300">
            <strong className="text-white">{publicCount}</strong> Tampil di Landing Page
          </span>
        </div>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <FiMessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Belum ada testimoni yang masuk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div 
              key={t.id} 
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                t.is_public 
                  ? 'bg-brand-500/5 border-brand-500/20 ring-1 ring-brand-500/10' 
                  : 'bg-white/5 border-white/10 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden shrink-0">
                    {t.avatar_url ? (
                      <img src={getAvatarUrl(t.avatar_url)} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white font-bold">
                        {t.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold leading-none mb-1">{t.name}</h3>
                    <p className="text-[11px] text-slate-500">{t.occupation}</p>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={14} fill={i < t.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                "{t.content}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] text-slate-500">
                  Dikirim: {new Date(t.created_at).toLocaleDateString('id-ID')}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(t.id, t.is_public)}
                    disabled={updatingId === t.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      t.is_public
                        ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    }`}
                  >
                    {updatingId === t.id ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t.is_public ? <><FiEyeOff /> Sembunyikan</> : <><FiEye /> Tampilkan</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
