'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FiPlay, FiLock, FiClock, FiChevronLeft,
  FiShoppingCart, FiCheckCircle, FiBook
} from 'react-icons/fi';
import Cookies from 'js-cookie';

function LoadingState() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-6 bg-white/10 rounded w-32" />
      <div className="h-64 bg-white/5 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 h-10 bg-white/5 rounded-xl" />
        <div className="h-10 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/courses/${id}`)
      .then(({ data }) => {
        setCourse(data.data);
        // Auto-select first accessible lesson
        const first = data.data.lessons?.find(l => !l.is_locked || l.is_preview || user?.is_active);
        if (first) setSelectedLesson(first);
      })
      .catch(() => {
        toast.error('Kursus tidak ditemukan.');
        router.push('/dashboard/katalog-kursus');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setValidating(true);
    try {
      const { data } = await api.post('/vouchers/validate', { code: promoCode, course_id: course.id });
      setAppliedVoucher(data.data);
      toast.success('Kode promo berhasil diterapkan! 🎉');
    } catch (err) {
      setAppliedVoucher(null);
      toast.error(err.response?.data?.message || 'Kode promo tidak valid.');
    } finally {
      setValidating(false);
    }
  };

  const handleBuy = async () => {
    setPaying(true);
    try {
      const { data } = await api.post('/transactions/create', { 
        course_id: course.id,
        promo_code: appliedVoucher ? appliedVoucher.code : null
      });
      
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
      script.onload = () => {
        window.snap.pay(data.data.snap_token, {
          onSuccess: async () => {
            toast.success('Pembayaran berhasil! 🎉');
            await refreshUser();
            window.location.reload();
          },
          onPending: () => toast('Pembayaran pending. Cek email kamu.', { icon: '⏳' }),
          onError: () => toast.error('Pembayaran gagal. Coba lagi.'),
          onClose: () => toast('Pembayaran dibatalkan.', { icon: 'ℹ️' }),
        });
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat transaksi.');
    } finally {
      setPaying(false);
    }
  };


  if (loading) return <LoadingState />;
  if (!course) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="flex flex-col lg:flex-row h-full">

      {/* ── LEFT: Video + Info ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Back button */}
        <div className="px-6 pt-5">
          <button
            onClick={() => router.push('/dashboard/katalog-kursus')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mb-4"
          >
            <FiChevronLeft size={16} /> Kembali ke Katalog
          </button>
        </div>

        {/* Video player */}
        <div className="px-6">
          <div className="glass-card overflow-hidden mb-6">
            {selectedLesson ? (
              <>
                {selectedLesson.video_url && (user?.is_active || selectedLesson.is_preview) ? (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={selectedLesson.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-[#13131f] flex flex-col items-center justify-center text-slate-500">
                    <FiLock size={48} className="mb-3 text-slate-600" />
                    <p className="font-semibold text-white text-lg">Materi Terkunci</p>
                    <p className="text-sm mt-2 text-slate-400 max-w-xs text-center">
                      Beli kursus ini untuk membuka akses ke seluruh materi
                    </p>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-white font-bold text-xl">{selectedLesson.title}</h2>
                  {selectedLesson.description && (
                    <p className="text-slate-400 text-sm mt-2">{selectedLesson.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedLesson.is_preview && (
                      <span className="badge">Preview Gratis</span>
                    )}
                    {selectedLesson.duration > 0 && (
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <FiClock size={11} /> {selectedLesson.duration} menit
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="aspect-video bg-[#13131f] flex flex-col items-center justify-center text-slate-500">
                <FiPlay size={48} className="text-brand-400 mb-3" />
                <p className="text-white font-semibold">Pilih materi untuk mulai belajar</p>
              </div>
            )}
          </div>

          {/* Course info */}
          <div className="glass-card p-5 mb-6">
            <h1 className="text-white font-bold text-2xl mb-2">{course.title}</h1>
            <p className="text-slate-400 text-sm leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><FiBook size={14} /> {course.lessons?.length ?? 0} Materi</span>
              <span className="flex items-center gap-1.5"><FiClock size={14} /> Akses Seumur Hidup</span>
            </div>
          </div>

          {/* Paywall banner */}
          {!course?.has_access && (
            <div className="glass-card p-6 border border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-accent-500/10 mb-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">🔒 Buka Semua Materi</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Sekarang kamu hanya bisa akses materi preview. Beli untuk unlock seluruh modul.
                    </p>
                  </div>
                  <div className="text-right">
                    {appliedVoucher ? (
                      <div className="flex flex-col items-end">
                        <span className="text-slate-500 line-through text-sm">Rp {parseInt(course.price).toLocaleString('id-ID')}</span>
                        <span className="text-brand-400 font-black text-2xl">Rp {parseInt(appliedVoucher.final_price).toLocaleString('id-ID')}</span>
                        <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest mt-1">Hemat Rp {parseInt(appliedVoucher.discount_amount).toLocaleString('id-ID')}!</span>
                      </div>
                    ) : (
                      <span className="text-brand-400 font-bold text-2xl">
                        Rp {parseInt(course.price).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Masukkan Kode Promo..."
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      className="input-field py-2 text-sm uppercase tracking-widest"
                      disabled={appliedVoucher || validating}
                    />
                    {appliedVoucher && (
                      <button 
                        onClick={() => {setAppliedVoucher(null); setPromoCode('');}}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {!appliedVoucher ? (
                    <button 
                      onClick={handleValidatePromo}
                      disabled={!promoCode || validating}
                      className="btn-outline py-2 px-6 text-sm"
                    >
                      {validating ? 'Mengecek...' : 'Terapkan'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 text-green-400 text-sm font-semibold">
                      <FiCheckCircle /> Promo Aktif
                    </div>
                  )}
                  <button
                    onClick={handleBuy}
                    disabled={paying}
                    className="btn-primary py-2 px-8 text-sm shrink-0 disabled:opacity-60"
                  >
                    {paying ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><FiShoppingCart size={16} /> Bayar Sekarang</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── RIGHT: Lesson list sidebar ── */}
      <div className="w-full lg:w-80 shrink-0 border-t border-white/10 lg:border-t-0 lg:border-l lg:border-white/10 overflow-y-auto bg-[#0d0d1a]">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm">Daftar Materi</h3>
          <p className="text-slate-500 text-xs mt-0.5">{course.lessons?.length ?? 0} materi tersedia</p>
        </div>
        <div className="p-2">
          {course.lessons?.map((lesson, idx) => {
            const isAccessible = !lesson.is_locked || lesson.is_preview || course?.has_access;
            const isSelected = selectedLesson?.id === lesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => {
                  if (!isAccessible) {
                    toast.error('Beli kursus untuk membuka materi ini!');
                    return;
                  }
                  setSelectedLesson(lesson);
                }}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl mb-1 text-sm transition-all
                  ${isSelected ? 'bg-brand-500/20 border border-brand-500/30 text-brand-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5
                  ${isSelected ? 'bg-brand-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                  {isSelected ? <FiPlay size={10} /> : isAccessible ? idx + 1 : <FiLock size={10} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate leading-snug">{lesson.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {lesson.is_preview && (
                      <span className="text-xs text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">Preview</span>
                    )}
                    {lesson.duration > 0 && (
                      <span className="text-xs text-slate-600 flex items-center gap-0.5">
                        <FiClock size={10} /> {lesson.duration} mnt
                      </span>
                    )}
                  </div>
                </div>
                {isAccessible && !isSelected && <FiCheckCircle size={14} className="text-green-500/50 shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
