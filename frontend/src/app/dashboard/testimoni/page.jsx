'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiMessageSquare, FiStar, FiSend, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function TestimoniPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testimonial, setTestimonial] = useState({
    rating: 5,
    content: '',
    occupation: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchTestimonial();
  }, []);

  const fetchTestimonial = async () => {
    try {
      const res = await api.get('/testimonials/me');
      if (res.data.success && res.data.data) {
        setTestimonial({
          rating: res.data.data.rating,
          content: res.data.data.content,
          occupation: res.data.data.occupation
        });
      }
    } catch (error) {
      console.error('Fetch testimonial error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await api.post('/testimonials', testimonial);
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Testimoni kamu berhasil disimpan dan akan ditinjau oleh Admin.' });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        msg: error.response?.data?.message || 'Gagal menyimpan testimoni. Pastikan kamu sudah memiliki kursus.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Syarat: Wajib konek Discord
  if (!user?.discord_id) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center">
          <FiAlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Belum Bisa Mengisi Testimoni</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Demi validitas ulasan, kamu wajib menyambungkan akun Discord terlebih dahulu agar foto profil kamu otomatis tersinkronisasi.
          </p>
          <a href="/dashboard/setting" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Ke Pengaturan Akun
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Tulis Testimoni</h1>
        <p className="text-slate-400">Bagikan pengalaman belajarmu di Akademi Coding.</p>
      </div>

      {status.msg && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
          status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {status.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span className="text-sm">{status.msg}</span>
        </div>
      )}

      <div className="glass-card p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <FiMessageSquare size={120} className="text-white" />
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-slate-400 text-sm mb-3">Seberapa puas kamu dengan kursusnya?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTestimonial({ ...testimonial, rating: num })}
                  className={`p-2 rounded-lg transition-all ${
                    testimonial.rating >= num ? 'text-yellow-400 scale-110' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <FiStar size={28} fill={testimonial.rating >= num ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Komentar / Ulasan</label>
            <textarea
              required
              rows={4}
              value={testimonial.content}
              onChange={(e) => setTestimonial({ ...testimonial, content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-colors"
              placeholder="Ceritakan pengalaman belajarmu secara singkat..."
            />
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Pekerjaan Saat Ini</label>
            <input
              required
              type="text"
              value={testimonial.occupation}
              onChange={(e) => setTestimonial({ ...testimonial, occupation: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-colors"
              placeholder="Contoh: Freelancer, Mahasiswa, Web Developer"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              Nama dan Foto Profil akan otomatis diambil dari akunmu.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-brand-500 to-accent-500 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? 'Menyimpan...' : (
              <>
                <FiSend size={18} />
                Simpan Testimoni
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2 italic">
          <FiAlertCircle className="text-brand-400" />
          Informasi Penting
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Testimoni yang kamu simpan tidak akan langsung muncul di halaman depan. Admin akan meninjau ulasanmu terlebih dahulu. Kamu bisa mengubah testimoni ini kapan saja melalui halaman ini.
        </p>
      </div>
    </div>
  );
}
